<!-- content-hash:d7d330955c06f9b5 -->
# Hedera Agent Kit Plugin Creation

## Plugin Interface

```typescript
import { Plugin } from 'hedera-agent-kit';

export interface Plugin {
  name: string;           // kebab-case
  version?: string;       // e.g., "1.0.0"
  description?: string;
  tools: (context: Context) => Tool[];
}
```

## Tool Interface

```typescript
import { Tool } from 'hedera-agent-kit';

export interface Tool {
  method: string;           // snake_case (e.g., "create_token_tool")
  name: string;             // display name
  description: string;      // LLM-facing description
  parameters: z.ZodObject;  // Zod schema
  execute: (client: Client, context: Context, params: any) => Promise<any>;
  outputParser?: (rawOutput: string) => { raw: any; humanMessage: string };
}
```

**Mutation tools**: use `handleTransaction()` + `transactionToolOutputParser`  
**Query tools**: direct service calls + `untypedQueryOutputParser`

## File Structure

```
my-hedera-plugin/
├── index.ts
└── tools/
    └── category/
        ├── create-something.ts
        └── get-something.ts
```

## Tool File Pattern

```typescript
import { z } from 'zod';
import { Context, Tool, handleTransaction, RawTransactionResponse, transactionToolOutputParser } from 'hedera-agent-kit';
import { Client } from '@hashgraph/sdk';

export const MY_TOOL_NAME = 'my_tool_name_tool';

const myToolPrompt = (context: Context = {}) =>
  `This tool does X on Hedera.
Parameters:
- param1 (str, required): Description
- param2 (int, optional): Description, defaults to 0`;

const myToolParameters = (context: Context = {}) =>
  z.object({
    param1: z.string().describe('Description of param1'),
    param2: z.number().optional().describe('Description of param2'),
  });

const postProcess = (response: RawTransactionResponse) => {
  if (response.scheduleId) {
    return `Scheduled transaction created.\nTransaction ID: ${response.transactionId}\nSchedule ID: ${response.scheduleId.toString()}`;
  }
  return `Operation completed.\nTransaction ID: ${response.transactionId}`;
};

const myToolExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof myToolParameters>>,
) => {
  try {
    const result = await handleTransaction(tx, client, context, postProcess);
    return result;
  } catch (error) {
    const message = 'Failed to execute' + (error instanceof Error ? `: ${error.message}` : '');
    return { raw: { error: message }, humanMessage: message };
  }
};

const tool = (context: Context): Tool => ({
  method: MY_TOOL_NAME,
  name: 'My Tool Display Name',
  description: myToolPrompt(context),
  parameters: myToolParameters(context),
  execute: myToolExecute,
  outputParser: transactionToolOutputParser,
});

export default tool;
```

## Plugin Index Pattern

```typescript
import { Context, Plugin } from 'hedera-agent-kit';
import myTool, { MY_TOOL_NAME } from './tools/category/my-tool';

export const myPlugin: Plugin = {
  name: 'my-hedera-plugin',
  version: '1.0.0',
  description: 'A plugin for custom Hedera operations',
  tools: (context: Context) => [myTool(context)],
};

export const myPluginToolNames = { MY_TOOL_NAME } as const;

export default { myPlugin, myPluginToolNames };
```

## Registering with Agent

```typescript
import { PluginRegistry } from 'hedera-agent-kit';
import { myPlugin } from './my-hedera-plugin';

const registry = new PluginRegistry();
registry.register(myPlugin);
const tools = registry.getTools(context);
```

## Common Imports

```typescript
import { Context, Plugin, Tool, handleTransaction, RawTransactionResponse, transactionToolOutputParser, untypedQueryOutputParser } from 'hedera-agent-kit';
import { Client, Status } from '@hashgraph/sdk';
import { z } from 'zod';
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Plugin name | kebab-case | `my-token-plugin` |
| Plugin variable | camelCase | `myTokenPlugin` |
| Tool constant | UPPER_SNAKE_CASE + `_TOOL` | `CREATE_TOKEN_TOOL` |
| Tool method value | snake_case + `_tool` | `create_token_tool` |
| Tool file | kebab-case | `create-token.ts` |
| Tool names export | camelCase + `ToolNames` | `myTokenPluginToolNames` |