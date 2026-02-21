import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import {
  BASE_MAINNET_ID,
  V3_FEE_TIERS,
  UNISWAP_V3_QUOTER_V2,
} from './constants/addresses';
import { UNISWAP_V3_QUOTER_V2_ABI } from './constants/abis';
import { PriceQuote } from './interfaces/quoter.interface';

@Injectable()
export class QuoterService implements OnModuleInit {
  private readonly logger = new Logger(QuoterService.name);
  private provider: ethers.JsonRpcProvider;
  private v3Quoter: ethers.Contract;
  private readonly DEFAULT_AMOUNT_IN = ethers.parseUnits('1', 18);

  private TOKENS: Record<string, string> = {};
  private PAIRS: Array<{ token0: string; token1: string }> = [];

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Load tokens from config
    this.loadTokensFromEnv();

    // Validate RPC URL
    const rpcUrl = this.configService.get<string>('BASE_RPC_URL');
    if (!rpcUrl || rpcUrl.includes('example.com')) {
      throw new Error(
        'BASE_RPC_URL not configured in .env file. Please set a valid Base RPC endpoint.',
      );
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl, {
      chainId: BASE_MAINNET_ID,
      name: 'base',
    });

    this.v3Quoter = new ethers.Contract(
      UNISWAP_V3_QUOTER_V2,
      UNISWAP_V3_QUOTER_V2_ABI,
      this.provider,
    );

    const tokenCount = Object.keys(this.TOKENS).length;
    const pairCount = this.PAIRS.length;
    const tokenList = Object.keys(this.TOKENS).join(', ');

    this.logger.log(`Quoter service initialized on Base mainnet (V3 only)`);
    this.logger.log(`Loaded ${tokenCount} tokens: ${tokenList}`);
    this.logger.log(`Generated ${pairCount} pairs`);
  }

  private loadTokensFromEnv() {
    const tokens: Record<string, string> = {};

    // Scan for TOKEN_ prefix
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('TOKEN_') && value) {
        const tokenName = key.replace('TOKEN_', '');
        tokens[tokenName] = value;
      }
    }

    if (Object.keys(tokens).length === 0) {
      throw new Error(
        'No tokens found in .env file. Please add TOKEN_* variables (e.g., TOKEN_USDC=0x...)',
      );
    }

    this.TOKENS = tokens;
    this.PAIRS = this.generatePairs();

    this.logger.log(
      `[Tokens] Loaded from env: ${Object.keys(tokens).join(', ')}`,
    );
  }

  private generatePairs(): Array<{ token0: string; token1: string }> {
    const tokenNames = Object.keys(this.TOKENS);
    const pairs: Array<{ token0: string; token1: string }> = [];

    for (let i = 0; i < tokenNames.length; i++) {
      for (let j = i + 1; j < tokenNames.length; j++) {
        pairs.push({
          token0: tokenNames[i],
          token1: tokenNames[j],
        });
      }
    }

    this.logger.log(
      `[Pairs] Generated ${pairs.length} pairs from ${tokenNames.length} tokens`,
    );
    return pairs;
  }

  async getQuoteForPair(
    token0Symbol: string,
    token1Symbol: string,
  ): Promise<PriceQuote[]> {
    const token0 = this.TOKENS[token0Symbol];
    const token1 = this.TOKENS[token1Symbol];

    if (!token0) {
      throw new BadRequestException({
        error: 'Token Not Found',
        message: `Token '${token0Symbol}' not configured in .env`,
        availableTokens: Object.keys(this.TOKENS),
        hint: `Add TOKEN_${token0Symbol}=0x... to your .env file`,
      });
    }

    if (!token1) {
      throw new BadRequestException({
        error: 'Token Not Found',
        message: `Token '${token1Symbol}' not configured in .env`,
        availableTokens: Object.keys(this.TOKENS),
        hint: `Add TOKEN_${token1Symbol}=0x... to your .env file`,
      });
    }

    const quotes: PriceQuote[] = [];
    const errors: Array<{ fee: number; error: string }> = [];

    for (const fee of V3_FEE_TIERS) {
      try {
        const params = {
          tokenIn: token0,
          tokenOut: token1,
          amountIn: this.DEFAULT_AMOUNT_IN,
          fee,
          sqrtPriceLimitX96: 0,
        };

        this.logger.debug(
          `Attempting quote for ${token0Symbol}/${token1Symbol} with fee ${fee}`,
        );
        const result = (await this.v3Quoter.quoteExactInputSingle.staticCall(
          params,
        )) as ethers.Result;

        quotes.push({
          pair: `${token0Symbol}/${token1Symbol}`,
          version: 'v3',
          fee,
          amountIn: this.DEFAULT_AMOUNT_IN.toString(),
          amountOut: (result[0] as bigint).toString(),
          price: Number(result[0] as bigint) / Number(this.DEFAULT_AMOUNT_IN),
          inversedPrice:
            Number(this.DEFAULT_AMOUNT_IN) / Number(result[0] as bigint),
          gasEstimate: (result[3] as bigint).toString(),
          timestamp: Date.now(),
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ fee, error: errorMsg });
        this.logger.error(
          `V3 quote FAILED for ${token0Symbol}/${token1Symbol} fee ${fee}: ${errorMsg}`,
        );
      }
    }

    if (quotes.length === 0) {
      throw new BadRequestException({
        error: 'No Liquidity',
        message: `No V3 pools found for ${token0Symbol}/${token1Symbol}`,
        hint: 'This pair may not have liquidity on Uniswap V3',
        checkedFeeTiers: V3_FEE_TIERS,
        rpcUrl: this.configService.get<string>('BASE_RPC_URL'),
        token0Address: token0,
        token1Address: token1,
        errors: errors,
      });
    }

    return quotes;
  }

  async checkRpcConnection() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();

      return {
        status: 'connected',
        chainId: Number(network.chainId),
        expectedChainId: BASE_MAINNET_ID,
        chainMatch: Number(network.chainId) === BASE_MAINNET_ID,
        blockNumber: blockNumber,
        rpcUrl: this.configService.get<string>('BASE_RPC_URL'),
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        status: 'failed',
        error: errorMsg,
        rpcUrl: this.configService.get<string>('BASE_RPC_URL'),
      };
    }
  }
}
