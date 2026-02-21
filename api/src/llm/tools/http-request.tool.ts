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
        description: 'Raw request body as a string. For JSON payloads, stringify the object yourself. ALWAYS use JSON format for REST APIs unless the API explicitly requires a different format.',
      },
      content_type: {
        type: 'string',
        description: 'Value for Content-Type header. Defaults to application/json. Only override when the target API explicitly requires a different content type.',
      },
    },
    required: ['url', 'method'],
  },
};
