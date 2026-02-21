import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import type { Skill } from './skill.interface';
import {
  ENV_KEYS,
  LLM_DEFAULTS,
  SKILLS_SUMMARIES_DEFAULT_PATH,
  SKILLS_SUMMARIES_PATH_ENV,
  SKILLS_SUMMARIZATION_ENABLED_ENV,
  SUMMARIZER_SKILL_NAME,
} from '../llm.constants';

const HASH_PREFIX = '<!-- content-hash:';
const HASH_SUFFIX = ' -->';

@Injectable()
export class SkillSummarizerService {
  private readonly logger = new Logger(SkillSummarizerService.name);
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly summariesDir: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({ apiKey: this.config.getOrThrow<string>(ENV_KEYS.ANTHROPIC_API_KEY) });
    this.model  = this.config.get<string>(ENV_KEYS.ANTHROPIC_MODEL, LLM_DEFAULTS.MODEL);
    this.summariesDir = this.config.get<string>(SKILLS_SUMMARIES_PATH_ENV, SKILLS_SUMMARIES_DEFAULT_PATH);

    // Read raw env value and check explicitly — avoids NestJS boolean coercion
    const raw = this.config.get<string>(SKILLS_SUMMARIZATION_ENABLED_ENV) ?? process.env[SKILLS_SUMMARIZATION_ENABLED_ENV] ?? 'true';
    this.enabled = String(raw).trim().toLowerCase() !== 'false';

    if (this.enabled) {
      mkdirSync(this.summariesDir, { recursive: true });
    }

    this.logger.log(`summarization: ${this.enabled ? 'enabled' : 'disabled — using original skill content'}`);
  }

  async summarizeAll(skills: Skill[], summarizerSkill: Skill | undefined): Promise<void> {
    if (!this.enabled) {
      this.logger.log('summarization disabled — all skills using original content');
      return;
    }

    if (!summarizerSkill) {
      this.logger.warn('Summarizer skill not found — skipping summarization');
      return;
    }

    for (const skill of skills) {
      if (skill.name === SUMMARIZER_SKILL_NAME) continue;
      await this.summarizeSkill(skill, summarizerSkill.content);
    }
  }

  private async summarizeSkill(skill: Skill, summarizerPrompt: string): Promise<void> {
    const cachePath = join(this.summariesDir, `${skill.name}.md`);
    const contentHash = this.hash(skill.content);

    if (this.isCacheValid(cachePath, contentHash)) {
      skill.content    = this.stripHashComment(readFileSync(cachePath, 'utf-8'));
      skill.summarized = true;
      this.logger.log(`[${skill.name}] loaded from cache (summarized)`);
      return;
    }

    this.logger.log(`[${skill.name}] summarizing…`);
    const summary = await this.callClaude(summarizerPrompt, skill.content);
    writeFileSync(cachePath, `${HASH_PREFIX}${contentHash}${HASH_SUFFIX}\n${summary}`, 'utf-8');
    skill.content    = summary;
    skill.summarized = true;
    this.logger.log(`[${skill.name}] summarized → ${cachePath}`);
  }

  private async callClaude(system: string, skillContent: string): Promise<string> {
    const response = await this.client.messages.create({
      model:      this.model,
      max_tokens: LLM_DEFAULTS.MAX_TOKENS,
      system,
      messages:   [{ role: 'user', content: skillContent }],
    });
    return response.content.find((b) => b.type === 'text')?.text ?? skillContent;
  }

  private isCacheValid(cachePath: string, contentHash: string): boolean {
    if (!existsSync(cachePath)) return false;
    const first = readFileSync(cachePath, 'utf-8').split('\n')[0] ?? '';
    return first === `${HASH_PREFIX}${contentHash}${HASH_SUFFIX}`;
  }

  private stripHashComment(content: string): string {
    return content.replace(/^<!--.*?-->\n/, '');
  }

  private hash(content: string): string {
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
  }
}
