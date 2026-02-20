export default function Home() {
  const trades = [
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
