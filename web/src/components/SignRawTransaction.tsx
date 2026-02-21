"use client";

import { BrowserProvider, Transaction } from "ethers";
import { useCallback, useState } from "react";

// Defaults for when input is treated as calldata (e.g. Universal Router on Base)
const DEFAULT_TO = "0x6fF5693b99212Da76ad316178A184AB56D299b43";
const DEFAULT_CHAIN_ID = 8453;
const DEFAULT_GAS_LIMIT = "300000";
const DEFAULT_GAS_PRICE_WEI = "6000000";

const BASESCAN_URL =
  process.env.NEXT_PUBLIC_BASESCAN_URL ?? "https://basescan.org";

async function getSigner() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet found. Install MetaMask or another Web3 wallet.");
  }
  const provider = new BrowserProvider(
    window.ethereum as import("ethers").Eip1193Provider
  );
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

function normalizeHex(input: string): string {
  const trimmed = input.trim().replace(/\s/g, "");
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

/** Heuristic: RLP-encoded full tx often starts with type byte 0x02 (EIP-1559) or RLP list 0xf8/0xe8 (legacy) */
function looksLikeFullTx(hex: string): boolean {
  if (hex.length < 4) return false;
  const after0x = hex.slice(2, 6);
  return (
    after0x.startsWith("02") || // EIP-1559
    after0x.startsWith("f8") ||
    after0x.startsWith("f7") ||
    after0x.startsWith("e8") ||
    after0x.startsWith("e7")
  );
}

export function SignRawTransaction() {
  const [rawTx, setRawTx] = useState("");
  const [to, setTo] = useState(DEFAULT_TO);
  const [gasLimit, setGasLimit] = useState(DEFAULT_GAS_LIMIT);
  const [gasPriceWei, setGasPriceWei] = useState(DEFAULT_GAS_PRICE_WEI);
  const [chainId, setChainId] = useState(String(DEFAULT_CHAIN_ID));
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = useCallback(async () => {
    const hex = normalizeHex(rawTx);
    if (hex === "0x" || hex.length < 4) {
      setError("Paste valid hex (full RLP tx or raw calldata).");
      return;
    }
    setError(null);
    setTxHash(null);
    setIsSending(true);
    try {
      const signer = await getSigner();
      let txRequest: Parameters<typeof signer.sendTransaction>[0];

      if (looksLikeFullTx(hex)) {
        try {
          const tx = Transaction.from(hex);
          txRequest = tx;
        } catch {
          txRequest = {
            to: to as `0x${string}`,
            data: hex as `0x${string}`,
            value: BigInt(0),
            gasLimit: BigInt(gasLimit),
            gasPrice: BigInt(gasPriceWei),
            chainId: parseInt(chainId, 10),
          };
        }
      } else {
        txRequest = {
          to: to as `0x${string}`,
          data: hex as `0x${string}`,
          value: BigInt(0),
          gasLimit: BigInt(gasLimit),
          gasPrice: BigInt(gasPriceWei),
          chainId: parseInt(chainId, 10),
        };
      }

      const tx = await signer.sendTransaction(txRequest);
      setTxHash(tx.hash);
      await tx.wait();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send transaction"
      );
    } finally {
      setIsSending(false);
    }
  }, [rawTx, to, gasLimit, gasPriceWei, chainId]);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="mb-2 text-lg font-semibold text-zinc-100">
        Sign & send raw transaction
      </h2>
      <p className="mb-4 text-sm text-zinc-400">
        Paste either (1) a full RLP-encoded unsigned tx hex, or (2) raw
        calldata hex (e.g. 0x3593564c...). For calldata, set To, gas, and chain
        below. Your wallet will be prompted to sign and the transaction will
        be broadcast (MetaMask and most wallets do not support sign-only).
      </p>
      <textarea
        value={rawTx}
        onChange={(e) => setRawTx(e.target.value)}
        placeholder="0x3593564c... or full RLP tx hex"
        rows={4}
        className="mb-4 w-full rounded border border-white/20 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
        spellCheck={false}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            To (contract)
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Gas limit
          </label>
          <input
            type="text"
            value={gasLimit}
            onChange={(e) => setGasLimit(e.target.value)}
            placeholder="300000"
            className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Gas price (wei)
          </label>
          <input
            type="text"
            value={gasPriceWei}
            onChange={(e) => setGasPriceWei(e.target.value)}
            placeholder="6000000"
            className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Chain ID
          </label>
          <input
            type="text"
            value={chainId}
            onChange={(e) => setChainId(e.target.value)}
            placeholder="8453"
            className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
      </div>
      {error && (
        <p className="mb-4 rounded bg-red-500/20 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleSend}
        disabled={isSending}
        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/20 disabled:opacity-50"
      >
        {isSending ? "Confirm in wallet & sending…" : "Sign & send transaction"}
      </button>
      {txHash && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-zinc-400">
            Transaction sent:
          </p>
          <a
            href={`${BASESCAN_URL.replace(/\/$/, "")}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 break-all font-mono text-xs text-emerald-400 underline hover:text-emerald-300"
          >
            {txHash}
          </a>
        </div>
      )}
    </div>
  );
}
