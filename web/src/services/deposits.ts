import type { DepositDataPoint } from "@/types/deposit";

const MOCK_DEPOSITS: DepositDataPoint[] = [
  { date: "2025-02-05", deposits: 2_400, realizedPnl: 0, unrealizedPnl: 120, portfolioValue: 2_520 },
  { date: "2025-02-06", deposits: 5_100, realizedPnl: 80, unrealizedPnl: -50, portfolioValue: 5_130 },
  { date: "2025-02-07", deposits: 7_850, realizedPnl: 220, unrealizedPnl: 180, portfolioValue: 8_250 },
  { date: "2025-02-08", deposits: 9_200, realizedPnl: 380, unrealizedPnl: -120, portfolioValue: 9_460 },
  { date: "2025-02-09", deposits: 12_100, realizedPnl: 590, unrealizedPnl: 310, portfolioValue: 13_000 },
  { date: "2025-02-10", deposits: 15_600, realizedPnl: 850, unrealizedPnl: -80, portfolioValue: 16_370 },
  { date: "2025-02-11", deposits: 18_300, realizedPnl: 1_100, unrealizedPnl: 420, portfolioValue: 19_820 },
  { date: "2025-02-12", deposits: 22_400, realizedPnl: 1_450, unrealizedPnl: 150, portfolioValue: 24_000 },
  { date: "2025-02-13", deposits: 26_800, realizedPnl: 1_880, unrealizedPnl: -200, portfolioValue: 28_480 },
  { date: "2025-02-14", deposits: 31_200, realizedPnl: 2_350, unrealizedPnl: 550, portfolioValue: 34_100 },
  { date: "2025-02-15", deposits: 35_900, realizedPnl: 2_900, unrealizedPnl: 100, portfolioValue: 38_900 },
  { date: "2025-02-16", deposits: 41_500, realizedPnl: 3_500, unrealizedPnl: -350, portfolioValue: 44_650 },
  { date: "2025-02-17", deposits: 47_200, realizedPnl: 4_200, unrealizedPnl: 480, portfolioValue: 51_880 },
  { date: "2025-02-18", deposits: 52_800, realizedPnl: 4_950, unrealizedPnl: -180, portfolioValue: 57_570 },
  { date: "2025-02-19", deposits: 58_400, realizedPnl: 5_800, unrealizedPnl: 620, portfolioValue: 64_820 },
];

/** Simulates fetching deposit time series from an API. */
export async function getDeposits(): Promise<DepositDataPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [...MOCK_DEPOSITS];
}
