import type { Tool } from '@anthropic-ai/sdk/resources/messages';

export const HTTP_REQUEST_TOOL_NAME = 'http_request';

export const httpRequestToolDefinition: Tool = {
  name: HTTP_REQUEST_TOOL_NAME,
  description:
    'Execute an HTTP request to any external API. Supports any auth scheme, content type, query params, and body format.',
  input_schema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Base URL, without query params',
      },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      },
      headers: {
        type: 'object',
        description: 'HTTP headers. Use for auth (Authorization: Bearer ..., x-api-key: ...), content negotiation, or any custom headers.',
        additionalProperties: { type: 'string' },
      },
      query_params: {
        type: 'object',
        description: 'Query string parameters. Will be appended to the URL as ?key=value&...',
        additionalProperties: { type: 'string' },
      },
      body: {
        type: 'string',
        description: 'Raw request body as a string. For JSON payloads stringify the object yourself. For form data use key=value&... format.',
      },
      content_type: {
        type: 'string',
        description: 'Value for Content-Type header. Defaults to application/json. Use application/x-www-form-urlencoded for form data, text/plain for raw text, etc.',
      },
    },
    required: ['url', 'method'],
  },
};
