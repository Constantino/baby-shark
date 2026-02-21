import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages';
import { SkillRegistryService } from './skills/skill-registry.service';
import { HttpRequestExecutor, HttpRequestInput } from './tools/http-request.executor';
import { httpRequestToolDefinition } from './tools/http-request.tool';
import {
  LLM_DEFAULTS,
  MAX_RETRIES_REPLY,
  MODEL_PRICING,
  NO_SKILLS_MANIFEST,
  SKILL_SELECTOR_SYSTEM,
  ENV_KEYS,
} from './llm.constants';

interface TokenUsage { input: number; output: number; total: number; cacheWrite: number; cacheRead: number }

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(
    private readonly config: ConfigService,
    private readonly registry: SkillRegistryService,
    private readonly httpExecutor: HttpRequestExecutor,
  ) {
    this.client = new Anthropic({ apiKey: this.config.getOrThrow<string>(ENV_KEYS.ANTHROPIC_API_KEY) });
    this.model  = this.config.get<string>(ENV_KEYS.ANTHROPIC_MODEL, LLM_DEFAULTS.MODEL);
  }

  async chat(userMessage: string): Promise<string> {
    const messageId = randomUUID();
    const usage: TokenUsage = { input: 0, output: 0, total: 0, cacheWrite: 0, cacheRead: 0 };

    const selectedSkills = await this.selectSkills(userMessage, usage);
    const skillsLabel = selectedSkills.join(', ') || 'none';
    this.logger.debug(`[${messageId}] selected skills: [${skillsLabel}]`);

    const system  = this.registry.buildSystemPrompt(selectedSkills);
    const messages: MessageParam[] = [{ role: 'user', content: userMessage }];
    let reply  = '';
    let retry  = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      retry++;

      if (retry > LLM_DEFAULTS.MAX_RETRIES) {
        this.logger.warn(`[${messageId}] reached max retries (${LLM_DEFAULTS.MAX_RETRIES}) — stopping loop`);
        reply = MAX_RETRIES_REPLY;
        break;
      }

      const response = await this.client.messages.create({
        model:      this.model,
        max_tokens: LLM_DEFAULTS.MAX_TOKENS,
        system:     system.length > 0 ? system : undefined,
        tools:      [httpRequestToolDefinition],
        messages,
      });

      const { input_tokens, output_tokens } = response.usage;
      this.accumulateUsage(usage, response.usage);
      this.logger.debug(
        `[${messageId}] retry ${retry} — input: ${input_tokens}, output: ${output_tokens}` +
        (retry > 1 ? ` (includes ${input_tokens - output_tokens}t re-sent context)` : ''),
      );

      if (response.stop_reason === 'end_turn') {
        reply = response.content.find((b) => b.type === 'text')?.text ?? '';
        break;
      }

      if (response.stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content: response.content });
        const toolResults: ToolResultBlockParam[] = [];

        for (const block of response.content) {
          if (block.type !== 'tool_use') continue;
          let result: string;
          try {
            result = await this.httpExecutor.execute(block.input as HttpRequestInput);
          } catch (err: unknown) {
            result = JSON.stringify({ error: err instanceof Error ? err.message : String(err) });
          }
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }

        messages.push({ role: 'user', content: toolResults });
        continue;
      }

      throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);
    }

    this.logger.log(
      `[${messageId}] skills: [${skillsLabel}] | ` +
      `tokens — input: ${usage.input}, output: ${usage.output}, total: ${usage.total} | ` +
      `cache — write: ${usage.cacheWrite}, read: ${usage.cacheRead} | ` +
      `cost: $${this.estimateCost(usage)}`,
    );

    return reply;
  }

  private async selectSkills(userMessage: string, usage: TokenUsage): Promise<string[]> {
    const manifest = this.registry.buildManifest();
    if (manifest === NO_SKILLS_MANIFEST) return [];

    const response = await this.client.messages.create({
      model:      this.model,
      max_tokens: 256,
      system:     SKILL_SELECTOR_SYSTEM,
      messages:   [{ role: 'user', content: `Available skills:\n${manifest}\n\nUser message: ${userMessage}` }],
    });

    this.accumulateUsage(usage, response.usage);

    const text = response.content.find((b) => b.type === 'text')?.text ?? '[]';
    const clean = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    try {
      const parsed = JSON.parse(clean);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      this.logger.warn(`skill selector returned unparseable response: ${text}`);
      return [];
    }
  }

  private estimateCost(usage: TokenUsage): string {
    const pricing = MODEL_PRICING[this.model];
    if (!pricing) return 'unknown (model not in pricing map)';
    const cost = (usage.input / 1_000_000) * pricing.input
               + (usage.output / 1_000_000) * pricing.output;
    return cost.toFixed(6);
  }

  private accumulateUsage(acc: TokenUsage, usage: { input_tokens: number; output_tokens: number; cache_creation_input_tokens?: number | null; cache_read_input_tokens?: number | null }): void {
    acc.input      += usage.input_tokens;
    acc.output     += usage.output_tokens;
    acc.total      += usage.input_tokens + usage.output_tokens;
    acc.cacheWrite += usage.cache_creation_input_tokens ?? 0;
    acc.cacheRead  += usage.cache_read_input_tokens ?? 0;
  }
}
