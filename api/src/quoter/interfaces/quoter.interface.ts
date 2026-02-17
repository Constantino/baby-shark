export interface TokenPair {
  token0: string;
  token1: string;
}

export interface PriceQuote {
  pair: string;
  version: 'v2' | 'v3';
  fee?: number;
  amountIn: string;
  amountOut: string;
  price: number;
  inversedPrice: number;
  gasEstimate?: string;
  timestamp: number;
}

export interface ArbitrageOpportunity {
  buyOn: PriceQuote;
  sellOn: PriceQuote;
  profitPercent: number;
  profitAmount: string;
  route: string;
  timestamp: number;
}

export interface QuoterConfig {
  rpcUrl: string;
  chainId: number;
  multicallAddress: string;
  defaultAmountIn: string; // in wei
  pollingInterval?: number; // ms
}

export interface BatchQuoteResult {
  quotes: PriceQuote[];
  opportunities: ArbitrageOpportunity[];
  timestamp: number;
  executionTime: number; // ms
}
