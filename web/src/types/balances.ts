import type { TokenBalance } from "@/types/token-balance";

export type BalancesProps = {
  balances: TokenBalance[];
  totalInUsdc: number;
  vaultAddress?: string;
};
