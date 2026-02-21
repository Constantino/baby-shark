import type { DepositDataPoint } from "@/types/deposit";

const MOCK_DEPOSITS: DepositDataPoint[] = [
  { date: "2025-02-05", deposits: 2_400 },
  { date: "2025-02-06", deposits: 5_100 },
  { date: "2025-02-07", deposits: 7_850 },
  { date: "2025-02-08", deposits: 9_200 },
  { date: "2025-02-09", deposits: 12_100 },
  { date: "2025-02-10", deposits: 15_600 },
  { date: "2025-02-11", deposits: 18_300 },
  { date: "2025-02-12", deposits: 22_400 },
  { date: "2025-02-13", deposits: 26_800 },
  { date: "2025-02-14", deposits: 31_200 },
  { date: "2025-02-15", deposits: 35_900 },
  { date: "2025-02-16", deposits: 41_500 },
  { date: "2025-02-17", deposits: 47_200 },
  { date: "2025-02-18", deposits: 52_800 },
  { date: "2025-02-19", deposits: 58_400 },
];

/** Simulates fetching deposit time series from an API. */
export async function getDeposits(): Promise<DepositDataPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [...MOCK_DEPOSITS];
}
