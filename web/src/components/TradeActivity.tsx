"use client";

import { useState } from "react";
import type { Trade } from "@/types/trade";

const PAGE_SIZE = 10;

type TradeActivityProps = {
  trades: Trade[];
};

export function TradeActivity({ trades }: TradeActivityProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(trades.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageTrades = trades.slice(start, start + PAGE_SIZE);

  return (
    <div className="p-4">
      <h1 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Trade Activity
      </h1>
      <div className="rounded-md border border-zinc-200 dark:border-zinc-700">
        <table className="w-full min-w-[560px] border-collapse text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  Type
                </th>
                <th className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  In
                </th>
                <th className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  Out
                </th>
                <th className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  Route
                </th>
                <th className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  Chain
                </th>
                <th className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  Tx
                </th>
                <th className="px-2 py-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {pageTrades.map((trade, i) => (
            <tr key={start + i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="px-2 py-1.5">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      trade.type === "BUY"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : trade.type === "SELL"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-zinc-900 dark:text-zinc-100">
                    {trade.in}
                  </td>
                  <td className="px-2 py-1.5 text-zinc-900 dark:text-zinc-100">
                    {trade.out}
                  </td>
                  <td className="px-2 py-1.5 text-zinc-700 dark:text-zinc-300">
                    {trade.route}
                  </td>
                  <td className="px-2 py-1.5 text-zinc-700 dark:text-zinc-300">
                    {trade.chain}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-zinc-600 dark:text-zinc-400">
                    <a
                      href={`https://basescan.org/tx/${trade.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 hover:underline"
                    >
                      {trade.tx}
                    </a>
                  </td>
                  <td className="px-2 py-1.5 text-zinc-600 dark:text-zinc-400">
                    {trade.timestamp}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between gap-2 border-t border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, trades.length)} of{" "}
            {trades.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Previous
            </button>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
