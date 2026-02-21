import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/check')
  check() {
    this.logger.log('GET /api/check called');
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
