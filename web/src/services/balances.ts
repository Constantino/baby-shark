import type { TokenBalance } from "@/types/token-balance";

const MOCK_BALANCES: TokenBalance[] = [
  { token: "WETH", balance: "2.4512" },
  { token: "WBTC", balance: "0.0847" },
  { token: "USDC", balance: "12,540.00" },
  { token: "USDT", balance: "8,920.50" },
  { token: "BANKR", balance: "15,420" },
  { token: "ZORA", balance: "3,280" },
  { token: "BABYCLAW", balance: "45,100" },
  { token: "MOLT", balance: "8,750" },
];

/** Simulates fetching token balances from an API. */
export async function getBalances(): Promise<TokenBalance[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return [...MOCK_BALANCES];
}
