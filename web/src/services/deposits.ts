import type { DepositDataPoint } from "@/types/deposit";

// One day of mock data at 15-minute intervals (00, 15, 30, 45 minutes past each hour)
const BASE = "2025-02-19T";
const MOCK_DEPOSITS: DepositDataPoint[] = [
  { date: `${BASE}00:00:00`, deposits: 52_800, withdrawals: 0, realizedPnl: 4_950, unrealizedPnl: -180, portfolioValue: 57_570 },
  { date: `${BASE}00:15:00`, deposits: 53_100, withdrawals: 200, realizedPnl: 4_980, unrealizedPnl: -120, portfolioValue: 57_960 },
  { date: `${BASE}00:30:00`, deposits: 53_400, withdrawals: 400, realizedPnl: 5_010, unrealizedPnl: -60, portfolioValue: 58_350 },
  { date: `${BASE}00:45:00`, deposits: 53_700, withdrawals: 350, realizedPnl: 5_050, unrealizedPnl: 20, portfolioValue: 58_770 },
  { date: `${BASE}01:00:00`, deposits: 54_000, withdrawals: 500, realizedPnl: 5_100, unrealizedPnl: 80, portfolioValue: 59_180 },
  { date: `${BASE}01:15:00`, deposits: 54_300, withdrawals: 600, realizedPnl: 5_150, unrealizedPnl: 140, portfolioValue: 59_590 },
  { date: `${BASE}01:30:00`, deposits: 54_600, withdrawals: 800, realizedPnl: 5_220, unrealizedPnl: 180, portfolioValue: 60_000 },
  { date: `${BASE}01:45:00`, deposits: 55_000, withdrawals: 750, realizedPnl: 5_300, unrealizedPnl: 200, portfolioValue: 60_500 },
  { date: `${BASE}02:00:00`, deposits: 55_400, withdrawals: 900, realizedPnl: 5_380, unrealizedPnl: 320, portfolioValue: 61_100 },
  { date: `${BASE}02:15:00`, deposits: 55_800, withdrawals: 1_000, realizedPnl: 5_460, unrealizedPnl: 440, portfolioValue: 61_700 },
  { date: `${BASE}02:30:00`, deposits: 56_200, withdrawals: 1_100, realizedPnl: 5_550, unrealizedPnl: 450, portfolioValue: 62_200 },
  { date: `${BASE}02:45:00`, deposits: 56_600, withdrawals: 1_050, realizedPnl: 5_640, unrealizedPnl: 460, portfolioValue: 62_700 },
  { date: `${BASE}03:00:00`, deposits: 57_000, withdrawals: 1_200, realizedPnl: 5_720, unrealizedPnl: 480, portfolioValue: 63_200 },
  { date: `${BASE}03:15:00`, deposits: 57_200, withdrawals: 1_300, realizedPnl: 5_780, unrealizedPnl: 520, portfolioValue: 63_500 },
  { date: `${BASE}03:30:00`, deposits: 57_400, withdrawals: 1_400, realizedPnl: 5_840, unrealizedPnl: 560, portfolioValue: 63_800 },
  { date: `${BASE}03:45:00`, deposits: 57_600, withdrawals: 1_350, realizedPnl: 5_900, unrealizedPnl: 600, portfolioValue: 64_100 },
  { date: `${BASE}04:00:00`, deposits: 58_400, withdrawals: 1_500, realizedPnl: 5_800, unrealizedPnl: 620, portfolioValue: 64_820 },
];

/** Simulates fetching deposit time series from an API. */
export async function getDeposits(): Promise<DepositDataPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [...MOCK_DEPOSITS];
}
