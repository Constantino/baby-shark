import { Controller, Post, Body } from '@nestjs/common';
import { VaultService } from './vault.service';
import { CreateDepositDto } from './dto/create-deposit.dto';

@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post('deposit')
  async createDeposit(@Body() dto: CreateDepositDto) {
    return this.vaultService.createDeposit(dto);
  }
}
