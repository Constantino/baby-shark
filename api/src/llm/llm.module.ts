import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { SkillRegistryService } from './skills/skill-registry.service';
import { SecretsManagerService } from './skills/secrets-manager.service';
import { SkillSummarizerService } from './skills/skill-summarizer.service';
import { HttpRequestExecutor } from './tools/http-request.executor';
import { ENV_KEYS, SUMMARIZER_SKILL_NAME, SYSTEM_SKILL_NAMES } from './llm.constants';

@Module({
  controllers: [LlmController],
  providers: [LlmService, SkillRegistryService, SecretsManagerService, SkillSummarizerService, HttpRequestExecutor],
  exports: [LlmService, SkillRegistryService],
})
export class LlmModule implements OnModuleInit {
  constructor(
    private readonly registry: SkillRegistryService,
    private readonly summarizer: SkillSummarizerService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const raw   = this.config.get<string>(ENV_KEYS.SKILLS_PATH, '');
    const paths = raw.split(',').map((p) => p.trim()).filter(Boolean);

    for (const p of paths) {
      this.registry.loadFromDirectory(p);
    }

    // Promote system skills before summarization so they're excluded from user selection
    for (const name of SYSTEM_SKILL_NAMES) {
      if (this.registry.has(name)) {
        this.registry.promoteToSystemSkill(name);
      }
    }

    // Summarize all selectable skills (service guards the enabled flag internally)
    const summarizerSkill = this.registry.get(SUMMARIZER_SKILL_NAME);
    await this.summarizer.summarizeAll(this.registry.getAll(), summarizerSkill);

    this.registry.scanSecrets();
  }
}
