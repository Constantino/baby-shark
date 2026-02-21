import { Balances } from "@/components/Balances";
import { TradeActivity } from "@/components/TradeActivity";
import { getBalances } from "@/services/balances";
import { getTokenPrices } from "@/services/prices";
import { getTrades } from "@/services/trades";

function parseBalance(value: string): number {
  return Number.parseFloat(value.replace(/,/g, "")) || 0;
}

export default async function Home() {
  const [balances, prices, trades] = await Promise.all([
    getBalances(),
    getTokenPrices(),
    getTrades(),
  ]);
  const totalInUsdc = balances.reduce(
    (sum, b) => sum + parseBalance(b.balance) * (prices[b.token] ?? 0),
    0
  );
  return (
    <div className="flex flex-col gap-6">
      <Balances balances={balances} totalInUsdc={totalInUsdc} />
      <TradeActivity trades={trades} />
    </div>
  );
}
