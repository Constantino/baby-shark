import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve as resolvePath, join } from 'path';
import { ConfigService } from '@nestjs/config';
import type { Skill } from './skill.interface';
import { SecretsManagerService } from './secrets-manager.service';
import {
  AGENT_SYSTEM_PREAMBLE,
  NO_SKILLS_MANIFEST,
  SECRETS_BLOCK_FOOTER,
  SECRETS_BLOCK_HEADER,
  SKILL_FILE_NAME,
} from '../llm.constants';

@Injectable()
export class SkillRegistryService {
  private readonly logger = new Logger(SkillRegistryService.name);
  private readonly skills = new Map<string, Skill>();
  private readonly systemSkills: Skill[] = []; // always injected, not subject to selection

  constructor(
    private readonly config: ConfigService,
    private readonly secretsManager: SecretsManagerService,
  ) {}

  loadFromDirectory(dirPath: string): void {
    const absoluteDir = resolvePath(dirPath);
    if (!existsSync(absoluteDir)) {
      this.logger.warn(`Skills directory not found: ${absoluteDir}`);
      return;
    }

    const entries = readdirSync(absoluteDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillFile = join(absoluteDir, entry.name, SKILL_FILE_NAME);
      if (!existsSync(skillFile)) continue;
      const raw = readFileSync(skillFile, 'utf-8');
      const skill = this.parseSkill(entry.name, '', raw);
      this.skills.set(entry.name, skill);
    }
  }

  /** Promote an already-loaded skill (by name) to system skill */
  promoteToSystemSkill(name: string): void {
    const skill = this.skills.get(name);
    if (!skill) return;
    this.systemSkills.push(skill);
    this.skills.delete(name); // remove from selectable pool
  }

  /** Call once after loading all skills */
  scanSecrets(): void {
    this.secretsManager.scanAll(this.getAll());
    this.printStartupSummary();
  }

  buildManifest(): string {
    if (this.skills.size === 0) return NO_SKILLS_MANIFEST;
    return Array.from(this.skills.values())
      .map((s) => `- ${s.name}: ${s.description}`)
      .join('\n');
  }

  buildSystemPrompt(skillNames: string[]): { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }[] {
    const selected = skillNames
      .map((name) => this.skills.get(name))
      .filter((s): s is Skill => !!s);

    const all = [...this.systemSkills, ...selected];
    if (all.length === 0) return [];

    const skillDocs = all.map((s) => {
      const secrets = this.secretsManager.getSecrets(s.name);
      const secretsBlock =
        Object.keys(secrets).length > 0
          ? `${SECRETS_BLOCK_HEADER}\n` +
            Object.entries(secrets)
              .map(([placeholder, value]) => `- ${placeholder}: \`${value}\``)
              .join('\n') +
            `\n${SECRETS_BLOCK_FOOTER(Object.keys(secrets))}\n`
          : '';
      return `## Skill: ${s.name}\n${secretsBlock}\n${s.content}`;
    }).join('\n\n---\n\n');

    return [
      { type: 'text', text: AGENT_SYSTEM_PREAMBLE },
      { type: 'text', text: skillDocs, cache_control: { type: 'ephemeral' } },
    ];
  }

  getAll(): Skill[] {
    return [...Array.from(this.skills.values()), ...this.systemSkills];
  }

  has(name: string): boolean {
    return this.skills.has(name);
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name) ?? this.systemSkills.find((s) => s.name === name);
  }

  private parseSkill(name: string, fallbackDescription: string, raw: string): Skill {
    const description = this.extractFrontmatter(raw, 'description') ?? fallbackDescription ?? name;
    const requiredSecrets = this.extractFrontmatterList(raw, 'secrets');
    const stripped = this.stripFrontmatter(raw);
    const content = this.interpolateCustom(stripped);
    return { name, description, content, requiredSecrets, summarized: false };
  }

  private interpolateCustom(content: string): string {
    return content.replace(/\{\{([A-Z0-9_]+)\}\}/g, (original, key: string) => {
      const value = this.config.get<string>(key);
      if (!value) return original;
      return value;
    });
  }

  private extractFrontmatter(content: string, key: string): string | undefined {
    const match = content.match(new RegExp(`^---[\\s\\S]*?${key}:\\s*(.+)`, 'm'));
    return match?.[1]?.trim();
  }

  /** Parses YAML list under a frontmatter key:
   *   secrets:
   *     - API_KEY
   *     - WALLET_ADDRESS
   */
  private extractFrontmatterList(content: string, key: string): string[] {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return [];

    const frontmatter = frontmatterMatch[1];
    const sectionMatch = frontmatter.match(new RegExp(`${key}:\\s*\\n((?:\\s+-\\s+.+\\n?)+)`));
    if (!sectionMatch) return [];

    return sectionMatch[1]
      .split('\n')
      .map((l) => l.replace(/^\s*-\s*/, '').trim())
      .filter(Boolean);
  }

  /** Remove YAML frontmatter block (---...---) */
  private stripFrontmatter(content: string): string {
    return content.replace(/^---[\s\S]*?---\n?/, '').trimStart();
  }

  private printStartupSummary(): void {
    const lines: string[] = ['', '=== Skills Loaded ==='];
    for (const skill of this.getAll()) {
      const secrets = this.secretsManager.getSecrets(skill.name);
      const secretCount = Object.keys(secrets).length;
      const required = skill.requiredSecrets.length;
      lines.push(`  ${skill.name}`);
      lines.push(`    description : ${skill.description || '(none)'}`);
      lines.push(`    secrets     : ${required} required, ${secretCount} resolved`);
      if (required > 0) {
        for (const token of skill.requiredSecrets) {
          const envKey = this.secretsManager.toEnvKey(skill.name, token);
          const resolved = !!secrets[token];
          lines.push(`      ${resolved ? '✓' : '✗'} ${envKey}`);
        }
      }
    }
    lines.push('===================');
    this.logger.log(lines.join('\n'));
  }
}
