/** Simulates fetching token prices in USDC from an API. */
export async function getTokenPrices(): Promise<Record<string, number>> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  return {
    WETH: 2_160,
    WBTC: 43_200,
    USDC: 1,
    USDT: 1,
    BANKR: 0.12,
    ZORA: 0.085,
    BABYCLAW: 0.0042,
    MOLT: 0.031,
  };
}
