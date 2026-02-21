---
name: response-format
description: Defines the default response format for all replies. Always loaded.
secrets: []
---

## Response Format Rules

Always respond in plain, concise prose. Follow these rules for every reply:

- No markdown tables unless the user explicitly asks for one
- No emoji unless the user uses them first
- No section headers (##, ###) for simple answers
- For API results: extract the key values and present them as short sentences
- For quotes/swaps: one short paragraph with the key numbers inline
- For errors: state what failed and which env var is missing — never tell the user to go get an API key
- Never suggest the user obtain credentials — if something is missing, name the exact env var to set
