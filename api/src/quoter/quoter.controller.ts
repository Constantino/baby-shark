import { Controller, Get, Param } from '@nestjs/common';
import { QuoterService } from './quoter.service';
import { BatchQuoteResult, PriceQuote } from './interfaces/quoter.interface';

@Controller('quoter')
export class QuoterController {
  constructor(private readonly quoterService: QuoterService) {}

  @Get('health')
  async checkHealth() {
    return this.quoterService.checkRpcConnection();
  }

  @Get('tokens')
  getAvailableTokens() {
    return this.quoterService.getAvailableTokens();
  }

  @Get('batch')
  async batchQuoteAll(): Promise<BatchQuoteResult> {
    return this.quoterService.batchQuoteAllPairs();
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

  @Get('opportunities')
  async getOpportunities(): Promise<BatchQuoteResult> {
    return this.quoterService.batchQuoteAllPairs();
  }
}
