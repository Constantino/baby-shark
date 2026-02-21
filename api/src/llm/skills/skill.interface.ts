export interface Skill {
  name: string;
  description: string;
  content: string;
  requiredSecrets: string[]; // token names declared in frontmatter secrets: field
}
