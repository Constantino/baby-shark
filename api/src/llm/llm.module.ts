import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { SkillRegistryService } from './skills/skill-registry.service';
import { SecretsManagerService } from './skills/secrets-manager.service';
import { HttpRequestExecutor } from './tools/http-request.executor';
import { ENV_KEYS, SKILLS_PATH_DEFAULT, SYSTEM_SKILL_NAMES } from './llm.constants';

@Module({
  controllers: [LlmController],
  providers: [LlmService, SkillRegistryService, SecretsManagerService, HttpRequestExecutor],
  exports: [LlmService, SkillRegistryService],
})
export class LlmModule implements OnModuleInit {
  constructor(
    private readonly registry: SkillRegistryService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const raw   = this.config.get<string>(ENV_KEYS.SKILLS_PATH, SKILLS_PATH_DEFAULT);
    const paths = raw.split(',').map((p) => p.trim()).filter(Boolean);

    for (const p of paths) {
      this.registry.loadFromDirectory(p);
    }

    for (const name of SYSTEM_SKILL_NAMES) {
      if (this.registry.has(name)) {
        this.registry.promoteToSystemSkill(name);
      }
    }

    this.registry.scanSecrets();
  }
}
