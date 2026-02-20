import type { Trade } from "@/types/trade";

const MOCK_TRADES: Trade[] = [
  {
    in: "1.5 ETH",
    out: "3,240 USDC",
    route: "ETH → USDC",
    chain: "Base",
    tx: "0x7a3f...9d2c",
    profitLoss: "+$124.50",
    timestamp: "2025-02-19 14:32:18",
  },
  {
    in: "10,000 USDC",
    out: "0.82 ETH",
    route: "USDC → ETH",
    chain: "Ethereum",
    tx: "0x1b4e...7f91",
    profitLoss: "-$32.00",
    timestamp: "2025-02-19 13:15:42",
  },
  {
    in: "500 DAI",
    out: "512 USDC",
    route: "DAI → USDC",
    chain: "Arbitrum",
    tx: "0x9c2d...4a1b",
    profitLoss: "+$12.00",
    timestamp: "2025-02-19 12:08:05",
  },
  {
    in: "2.1 ETH",
    out: "4,100 USDT",
    route: "ETH → USDT",
    chain: "Optimism",
    tx: "0xe5f8...b3c7",
    profitLoss: "+$89.20",
    timestamp: "2025-02-19 11:44:33",
  },
  {
    in: "8,000 USDT",
    out: "1.92 ETH",
    route: "USDT → ETH",
    chain: "Base",
    tx: "0x2a6c...8e4d",
    profitLoss: "-$18.75",
    timestamp: "2025-02-19 10:22:11",
  },
];

/** Simulates fetching trade activity from an API. */
export async function getTrades(): Promise<Trade[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [...MOCK_TRADES];
}
