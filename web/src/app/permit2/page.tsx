"use client";

import { ConnectWallet } from "@/components/ConnectWallet";
import {
  CHAIN_ID,
  parseUsdcAmount,
  PERMIT_EXPIRATION,
  PERMIT_NONCE,
  PERMIT2_DOMAIN,
  PERMIT2_TYPES,
  SIG_DEADLINE,
  USDC_ADDRESS,
  USDC_APPROVE_PERMIT2_DATA,
} from "@/utils/permit2";
import { BrowserProvider } from "ethers";
import { useCallback, useState } from "react";

const SWAP_API_URL =
  process.env.NEXT_PUBLIC_SWAP_API_URL ?? "http://localhost:3001/swap";

async function getSigner() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet found. Install MetaMask or another Web3 wallet.");
  }
  const provider = new BrowserProvider(
    window.ethereum as import("ethers").Eip1193Provider
  );
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return signer;
}

export default function Permit2Page() {
  const [amount, setAmount] = useState("100");
  const [signature, setSignature] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "approve" | "sign" | "swap">("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleApprove = useCallback(async () => {
    setError(null);
    setStep("approve");
    try {
      const signer = await getSigner();
      const tx = await signer.sendTransaction({
        to: USDC_ADDRESS,
        data: USDC_APPROVE_PERMIT2_DATA,
        chainId: CHAIN_ID,
      });
      setTxHash(tx.hash);
      await tx.wait();
      setStep("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
      setStep("idle");
    }
  }, []);

  const handleSignPermit2 = useCallback(async () => {
    setError(null);
    setSignature(null);
    setStep("sign");
    try {
      const signer = await getSigner();
      const amountWei = parseUsdcAmount(amount);
      if (amountWei === 0n) {
        setError("Enter a valid USDC amount");
        setStep("idle");
        return;
      }
      const value = {
        permitted: {
          token: USDC_ADDRESS,
          amount: amountWei,
        },
        nonce: BigInt(PERMIT_NONCE),
        deadline: BigInt(PERMIT_EXPIRATION),
      };
      const sig = await signer.signTypedData(PERMIT2_DOMAIN, PERMIT2_TYPES, value);
      setSignature(sig);
      setStep("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signing failed");
      setStep("idle");
    }
  }, [amount]);

  const handleExecuteSwap = useCallback(async () => {
    if (!signature) {
      setError("Sign the Permit2 message first");
      return;
    }
    setError(null);
    setStep("swap");
    try {
      const amountWei = parseUsdcAmount(amount);
      const res = await fetch(SWAP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature,
          permit: {
            token: USDC_ADDRESS,
            amount: amountWei.toString(),
            expiration: PERMIT_EXPIRATION,
            nonce: PERMIT_NONCE,
            sigDeadline: SIG_DEADLINE,
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Swap failed: ${res.status}`);
      }
      setStep("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Swap request failed");
      setStep("idle");
    }
  }, [signature, amount]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-100">Permit2</h1>
        <ConnectWallet />
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="mb-6 text-sm text-zinc-300">
          Sign a Permit2 message, approve USDC to Permit2, then execute the
          swap. Ensure you are on Base (chainId 8453).
        </p>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            USDC amount
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full max-w-xs rounded border border-white/20 bg-white/5 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
            placeholder="e.g. 100"
          />
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-500/20 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {txHash && (
          <p className="mb-4 text-sm text-emerald-400">
            Approval tx: {txHash.slice(0, 10)}…{txHash.slice(-8)}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleApprove}
            disabled={step !== "idle"}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            {step === "approve" ? "Confirm in wallet…" : "1. Approve USDC to Permit2"}
          </button>
          <button
            type="button"
            onClick={handleSignPermit2}
            disabled={step !== "idle"}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            {step === "sign" ? "Check wallet for signature…" : "2. Sign Permit2 message"}
          </button>
          <button
            type="button"
            onClick={handleExecuteSwap}
            disabled={step !== "idle" || !signature}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            {step === "swap" ? "Calling swap…" : "3. Execute swap"}
          </button>
        </div>

        {signature && (
          <p className="mt-4 break-all text-xs text-zinc-400">
            Signature: {signature.slice(0, 42)}…
          </p>
        )}
      </div>
    </div>
  );
}
