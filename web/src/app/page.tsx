import { Balances } from "@/components/Balances";
import { TradeActivity } from "@/components/TradeActivity";
import { getBalances } from "@/services/balances";
import { getTrades } from "@/services/trades";

export default async function Home() {
  const [balances, trades] = await Promise.all([getBalances(), getTrades()]);
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <Balances balances={balances} />
      <div className="min-w-0 flex-1">
        <TradeActivity trades={trades} />
      </div>
    </div>
  );
}
