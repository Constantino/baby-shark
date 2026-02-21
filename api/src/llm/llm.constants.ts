export const LLM_DEFAULTS = {
  MODEL:        'claude-sonnet-4-6',
  MAX_TOKENS:   4096,
  MAX_RETRIES:  4,
} as const;

export const ENV_KEYS = {
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
  ANTHROPIC_MODEL:   'ANTHROPIC_MODEL',
  SKILLS_PATH:       'SKILLS_PATH',
} as const;

export const SKILLS_PATH_DEFAULT = '/Users/cristianchaparroa/hackathon/baby-shark/api/skills';

export const SKILL_SELECTOR_SYSTEM = [
  'You are a skill selector. Given a user message and a list of available skills,',
  'respond ONLY with a JSON array of skill names that are needed to answer the request.',
  'If no skills are needed respond with an empty array [].',
  'Example: ["swap-integration"]',
].join(' ');

export const AGENT_SYSTEM_PREAMBLE = [
  'You are an autonomous AI agent.',
  'Use the http_request tool to execute any API calls required by the skills below.',
  'Follow the skill instructions exactly for authentication, endpoints, and payloads.',
].join('\n');

export const MAX_RETRIES_REPLY =
  'Could not complete the request within the allowed number of steps. Please try a more specific query.';

export const NO_SKILLS_MANIFEST = 'No skills available.';

export const SECRETS_BLOCK_HEADER = '### Resolved credentials';
export const SECRETS_BLOCK_FOOTER = (placeholders: string[]) =>
  `Use these values wherever the skill references ${placeholders.join(', ')}. Never ask the user for them.`;

export const SKILL_FILE_NAME       = 'SKILL.md';
export const SYSTEM_SKILL_NAMES    = ['response-format'] as const;
export const SUMMARIZER_SKILL_NAME = 'skill-summarizer';
export const SKILLS_SUMMARIES_PATH_ENV     = 'SKILLS_SUMMARIES_PATH';
export const SKILLS_SUMMARIES_DEFAULT_PATH = '/Users/cristianchaparroa/hackathon/baby-shark/api/skills-summaries';
export const SKILLS_SUMMARIZATION_ENABLED_ENV = 'SKILLS_SUMMARIZATION_ENABLED';

export const HTTP_LOG_BODY_LIMIT     = 300;
export const HTTP_LOG_RESPONSE_LIMIT = 200;
export const DEFAULT_CONTENT_TYPE    = 'application/json';

export const ERROR_MESSAGES = {
  UNKNOWN:                'Unknown error',
  BAD_REQUEST:            (d: string) => `Bad request: ${d}`,
  AUTHENTICATION_FAILED:  (d: string) => `Authentication failed: ${d}`,
  FORBIDDEN:              (d: string) => `Forbidden: ${d}`,
  RATE_LIMITED:           (d: string) => `Rate limited: ${d}`,
} as const;

// Fallback regex patterns for third-party skills without frontmatter secrets
export const THIRD_PARTY_SECRET_PATTERNS: RegExp[] = [
  /YOUR[_-]([A-Z0-9_-]+)/gi,
  /<your[_-]([a-z0-9_-]+)>/gi,
  /<([A-Z][A-Z0-9_-]*(?:key|token|secret|api|pass|credential|bearer))>/gi,
  /\{([A-Z][A-Z0-9_-]*(?:key|token|secret|api|pass|credential|bearer))\}/gi,
];
export const CUSTOM_SECRET_PATTERN = /\{\{([A-Z0-9_]+)\}\}/g;

// USD per million tokens — update when Anthropic changes pricing
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-4-6':           { input: 15.00, output: 75.00 },
  'claude-sonnet-4-6':         { input:  3.00, output: 15.00 },
  'claude-sonnet-4-5':         { input:  3.00, output: 15.00 },
  'claude-haiku-4-5-20251001': { input:  0.80, output:  4.00 },
};
