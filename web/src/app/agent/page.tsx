import { Balances } from "@/components/Balances";
import { PerformanceChart } from "@/components/PerformanceChart";
import { TradeActivity } from "@/components/TradeActivity";
import { getBalances } from "@/services/balances";
import { getDeposits } from "@/services/deposits";
import { getTokenPrices } from "@/services/prices";
import { getTrades } from "@/services/trades";
import { parseBalance } from "@/utils/balance";

export default async function AgentPage() {
  const [balances, prices, trades, deposits] = await Promise.all([
    getBalances(),
    getTokenPrices(),
    getTrades(),
    getDeposits(),
  ]);
  const totalInUsdc = balances.reduce(
    (sum, b) => sum + parseBalance(b.balance) * (prices[b.token] ?? 0),
    0
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Balances
          balances={balances}
          totalInUsdc={totalInUsdc}
          vaultAddress={process.env.NEXT_PUBLIC_VAULT_ADDRESS}
        />
        <div className="min-w-0 flex-1">
          <PerformanceChart data={deposits} />
        </div>
      </div>
      <TradeActivity trades={trades} />
    </div>
  );
}
