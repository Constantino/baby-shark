import { Controller, Get, Param } from '@nestjs/common';
import { QuoterService } from './quoter.service';
import { PriceQuote } from './interfaces/quoter.interface';

@Controller('quoter')
export class QuoterController {
  constructor(private readonly quoterService: QuoterService) {}

  @Get('health')
  async checkHealth() {
    return this.quoterService.checkRpcConnection();
  }

  @Get('pair/:token0/:token1')
  async getQuoteForPair(
    @Param('token0') token0: string,
    @Param('token1') token1: string,
  ): Promise<PriceQuote[]> {
    return this.quoterService.getQuoteForPair(
      token0.toUpperCase(),
      token1.toUpperCase(),
    );
  }
}
