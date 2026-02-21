import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.providers';
import { CreateDepositDto } from './dto/create-deposit.dto';

@Injectable()
export class VaultService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async createDeposit(dto: CreateDepositDto) {
    const { vault_address, wallet_address, amount_deposited, tx_hash } = dto;

    try {
      const result = await this.pool.query(
        `INSERT INTO vault_deposits (vault_address, wallet_address, amount_deposited, tx_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [vault_address, wallet_address, amount_deposited, tx_hash],
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(`tx_hash already registered: ${tx_hash}`);
      }
      throw error;
    }
  }
}
