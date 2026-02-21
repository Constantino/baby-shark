import { Body, Controller, Post, HttpCode, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import { ERROR_MESSAGES } from './llm.constants';

export class ChatRequestDto {
  message: string;
}

@Controller('ai')
export class LlmController {
  private readonly logger = new Logger(LlmController.name);

  constructor(private readonly llm: LlmService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: ChatRequestDto): Promise<{ reply: string }> {
    try {
      const reply = await this.llm.chat(body.message);
      return { reply };
    } catch (err: unknown) {
      const { status, message } = this.classifyError(err);
      this.logger.error(`chat failed [${status}]: ${message}`);
      throw new HttpException({ error: message }, status);
    }
  }

  private classifyError(err: unknown): { status: number; message: string } {
    if (typeof err !== 'object' || err === null) {
      return { status: 500, message: String(err) };
    }

    const e = err as Record<string, unknown>;
    const apiMessage =
      (e.error as Record<string, unknown>)?.error as Record<string, unknown>;

    const detail = (apiMessage?.message as string) ?? (e.message as string) ?? ERROR_MESSAGES.UNKNOWN;
    const status = (e.status as number) ?? 500;

    switch (status) {
      case 400: return { status: 400, message: ERROR_MESSAGES.BAD_REQUEST(detail) };
      case 401: return { status: 401, message: ERROR_MESSAGES.AUTHENTICATION_FAILED(detail) };
      case 403: return { status: 403, message: ERROR_MESSAGES.FORBIDDEN(detail) };
      case 429: return { status: 429, message: ERROR_MESSAGES.RATE_LIMITED(detail) };
      default:  return { status: 500, message: detail };
    }
  }
}
