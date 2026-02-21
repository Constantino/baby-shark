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

export interface QuoterConfig {
  rpcUrl: string;
  chainId: number;
  multicallAddress: string;
  defaultAmountIn: string; // in wei
  pollingInterval?: number; // ms
}
