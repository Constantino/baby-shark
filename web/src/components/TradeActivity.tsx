import type { Trade } from "@/types/trade";

type TradeActivityProps = {
  trades: Trade[];
};

export function TradeActivity({ trades }: TradeActivityProps) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Trade Activity
      </h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                In
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Out
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Route
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Chain
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Tx
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Profit/Loss
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <tr
                key={i}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                  {trade.in}
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                  {trade.out}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {trade.route}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {trade.chain}
                </td>
                <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">
                  {trade.tx}
                </td>
                <td
                  className={`px-4 py-3 font-medium ${
                    trade.profitLoss.startsWith("+")
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {trade.profitLoss}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {trade.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
