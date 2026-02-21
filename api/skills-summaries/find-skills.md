<!-- content-hash:d78d29f623717731 -->
# Find Skills

## CLI Commands

- `npx skills find [query]` - Search for skills
- `npx skills add <package>` - Install a skill
- `npx skills add <owner/repo@skill> -g -y` - Install globally, skip confirmation
- `npx skills check` - Check for updates
- `npx skills update` - Update all skills
- `npx skills init <name>` - Create a new skill

**Browse:** https://skills.sh/

## Usage

Search: `npx skills find [query]`

Example output:
```
Install with npx skills add <owner/repo@skill>

vercel-labs/agent-skills@vercel-react-best-practices
└ https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

## Common Search Categories

| Category | Keywords |
|----------|----------|
| Web Development | react, nextjs, typescript, css, tailwind |
| Testing | testing, jest, playwright, e2e |
| DevOps | deploy, docker, kubernetes, ci-cd |
| Documentation | docs, readme, changelog, api-docs |
| Code Quality | review, lint, refactor, best-practices |
| Design | ui, ux, design-system, accessibility |
| Productivity | workflow, automation, git |

## When No Skills Found

Inform user, offer direct help, suggest: `npx skills init my-skill-name`