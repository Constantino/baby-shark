import { TradeActivity } from "@/components/TradeActivity";
import { getTrades } from "@/services/trades";

export default async function Home() {
  const trades = await getTrades();
  return <TradeActivity trades={trades} />;
}
