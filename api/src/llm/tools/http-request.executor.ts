import { Injectable, Logger } from '@nestjs/common';
import { HTTP_REQUEST_TOOL_NAME } from './http-request.tool';
import { DEFAULT_CONTENT_TYPE, HTTP_LOG_RESPONSE_LIMIT } from '../llm.constants';

export interface HttpRequestInput {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  query_params?: Record<string, string>;
  body?: string;
  content_type?: string;
}

@Injectable()
export class HttpRequestExecutor {
  private readonly logger = new Logger(HttpRequestExecutor.name);

  readonly toolName = HTTP_REQUEST_TOOL_NAME;

  async execute(input: HttpRequestInput): Promise<string> {
    const { url, method, headers = {}, query_params, body, content_type } = input;

    const finalUrl = query_params
      ? `${url}?${new URLSearchParams(query_params).toString()}`
      : url;

    const finalHeaders: Record<string, string> = {
      ...(body !== undefined && { 'Content-Type': content_type ?? DEFAULT_CONTENT_TYPE }),
      ...headers,
    };

    this.logger.debug(`${method} ${finalUrl}`);

    const response = await fetch(finalUrl, {
      method,
      headers: finalHeaders,
      body: body ?? undefined,
    });

    const text = await response.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    const result = JSON.stringify({ status: response.status, body: parsed });
    this.logger.debug(`  response: ${response.status} — ${result.length > HTTP_LOG_RESPONSE_LIMIT ? result.slice(0, HTTP_LOG_RESPONSE_LIMIT) + '…' : result}`);
    return result;
  }
}
