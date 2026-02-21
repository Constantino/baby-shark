"use client";

import { useState } from "react";
import { depositToVault } from "@/services/vault";

type Status = "idle" | "approving" | "depositing" | "success" | "error";

export function VaultDeposit() {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setError(null);
    setTxHash(null);

    try {
      setStatus("approving");
      const hash = await depositToVault(amount);
      setTxHash(hash);
      setStatus("success");
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setStatus("error");
    }
  };

  const isPending = status === "approving" || status === "depositing";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Deposit to Vault
      </h2>

      <div className="flex gap-3">
        <input
          type="number"
          min="0"
          step="any"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isPending}
          className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-100"
        />
        <button
          type="button"
          onClick={handleDeposit}
          disabled={isPending || !amount}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {status === "approving" ? "Approving…" : isPending ? "Depositing…" : "Deposit"}
        </button>
      </div>

      {status === "success" && txHash && (
        <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
          ✓ Deposited!{" "}
          <span className="font-mono">{txHash.slice(0, 20)}…</span>
        </p>
      )}

      {status === "error" && error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
