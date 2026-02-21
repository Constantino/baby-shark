import type { BalancesProps } from "@/types/balances";
import { truncateAddress } from "@/utils/address";

const BASESCAN_URL =
  process.env.NEXT_PUBLIC_BASESCAN_URL ?? "https://basescan.org";

export function Balances({ balances, totalInUsdc, vaultAddress }: BalancesProps) {
  return (
    <div className="p-4">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Balances
      </h2>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        TVL:{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(totalInUsdc)}{" "}
          USDC
        </span>
      </p>
      {vaultAddress && (
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Vault:{" "}
          <a
            href={`${BASESCAN_URL.replace(/\/$/, "")}/address/${vaultAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:text-zinc-100 dark:decoration-zinc-500 dark:hover:decoration-zinc-400"
          >
            {truncateAddress(vaultAddress)}
          </a>
        </p>
      )}
      <div className="rounded-md border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[200px] border-collapse text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                Token
              </th>
              <th className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {balances.map(({ token, balance }) => (
              <tr
                key={token}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                  {token}
                </td>
                <td className="px-2 py-1.5 text-zinc-700 dark:text-zinc-300">
                  {balance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
