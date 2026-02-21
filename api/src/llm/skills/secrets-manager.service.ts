import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Skill } from './skill.interface';
import { CUSTOM_SECRET_PATTERN, THIRD_PARTY_SECRET_PATTERNS } from '../llm.constants';

@Injectable()
export class SecretsManagerService {
  private readonly logger = new Logger(SecretsManagerService.name);
  private readonly store = new Map<string, Record<string, string>>();

  constructor(private readonly config: ConfigService) {}

  scanAll(skills: Skill[]): void {
    for (const skill of skills) {
      const resolved: Record<string, string> = {};
      const tokens = this.tokensFor(skill);

      for (const token of tokens) {
        const envKey = this.toEnvKey(skill.name, token);
        const value = this.config.get<string>(envKey);
        if (value) {
          resolved[token] = value;
          this.logger.log(`[${skill.name}] "${token}" → ${envKey} ✓`);
        } else {
          this.logger.warn(`[${skill.name}] "${token}" → ${envKey} NOT SET`);
        }
      }

      this.store.set(skill.name, resolved);
    }
  }

  getSecrets(skillName: string): Record<string, string> {
    return this.store.get(skillName) ?? {};
  }

  /** Env var key pattern: SKILL_NAME_TOKEN  e.g. SWAP_INTEGRATION_API_KEY */
  toEnvKey(skillName: string, token: string): string {
    const prefix = skillName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const normalized = token.replace(/^your[_-]/i, '').toUpperCase().replace(/[^A-Z0-9]/g, '_');
    return `${prefix}_${normalized}`;
  }

  /**
   * If skill declares `requiredSecrets` in frontmatter → use those (explicit).
   * Otherwise → regex scan (fallback for third-party skills).
   */
  private tokensFor(skill: Skill): Set<string> {
    if (skill.requiredSecrets.length > 0) {
      return new Set(skill.requiredSecrets);
    }
    return this.regexScan(skill.content);
  }

  private regexScan(content: string): Set<string> {
    const found = new Set<string>();

    for (const pattern of THIRD_PARTY_SECRET_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        found.add(match[1] ?? match[0]);
      }
    }

    const custom = new RegExp(CUSTOM_SECRET_PATTERN.source, CUSTOM_SECRET_PATTERN.flags);
    let match: RegExpExecArray | null;
    while ((match = custom.exec(content)) !== null) {
      found.add(match[1]);
    }

    return found;
  }
}
