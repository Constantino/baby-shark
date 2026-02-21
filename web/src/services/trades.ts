import type { Trade } from "@/types/trade";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY ?? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const BOT_ADDRESS = (process.env.NEXT_PUBLIC_BOT_ADDRESS ?? "").toLowerCase();
const BASE_ALCHEMY_URL = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

const STABLECOINS = new Set(["USDC", "USDT", "DAI", "BUSD", "USDbC"]);

// Known DEX router addresses on Base mainnet (lowercase)
const ROUTER_LABELS: Record<string, string> = {
  "0x2626664c2603336e57b271c5c0b26f421741e481": "Uniswap v3",
  "0x198ef79f1f515f02dfe9e3115ed9fc07183f02fc": "Uniswap v3",
  "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad": "Uniswap v3",
  "0x6ff5693b99212da76ad316178a184ab56d299b43": "Uniswap v4",
  "0x6cb442acf35158d68425b350ec18c400d25f8365": "Uniswap v4",
};

interface AlchemyTransfer {
  hash: string;
  from: string;
  to: string;
  value: number | null;
  asset: string | null;
  category: string;
  metadata: { blockTimestamp: string };
  rawContract: { value: string; address: string; decimal: string };
}

async function fetchTransfers(
  addressField: "fromAddress" | "toAddress"
): Promise<AlchemyTransfer[]> {
  if (!ALCHEMY_API_KEY) return [];
  if (!BOT_ADDRESS) return [];

  try {
    const res = await fetch(BASE_ALCHEMY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "alchemy_getAssetTransfers",
        params: [
          {
            [addressField]: BOT_ADDRESS,
            category: ["erc20", "external"],
            withMetadata: true,
            excludeZeroValue: true,
            maxCount: "0x64",
            order: "desc",
          },
        ],
      }),
      cache: "no-store",
    });
    const data = await res.json();
    if (data.error) return [];
    return data.result?.transfers ?? [];
  } catch {
    return [];
  }
}

function classifyTrade(
  inAsset: string | null,
  outAsset: string | null
): "BUY" | "SELL" | "SWAP" {
  const inStable = STABLECOINS.has(inAsset ?? "");
  const outStable = STABLECOINS.has(outAsset ?? "");
  if (outStable && !inStable) return "BUY";
  if (inStable && !outStable) return "SELL";
  return "SWAP";
}

function formatAmount(value: number | null, asset: string | null): string {
  if (value === null || !asset) return "?";
  if (STABLECOINS.has(asset)) {
    return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${asset}`;
  }
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${asset}`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function detectRoute(txHash: string, outTransfers: AlchemyTransfer[]): string {
  const tx = outTransfers.find((t) => t.hash === txHash);
  if (tx) {
    const toAddr = tx.to?.toLowerCase() ?? "";
    return ROUTER_LABELS[toAddr] ?? "DEX";
  }
  return "DEX";
}

export async function getTrades(): Promise<Trade[]> {
  const [outgoing, incoming] = await Promise.all([
    fetchTransfers("fromAddress"),
    fetchTransfers("toAddress"),
  ]);

  const byHash = new Map<
    string,
    { out: AlchemyTransfer[]; in: AlchemyTransfer[]; ts: string }
  >();

  for (const t of outgoing) {
    if (!byHash.has(t.hash)) byHash.set(t.hash, { out: [], in: [], ts: t.metadata?.blockTimestamp ?? "" });
    byHash.get(t.hash)!.out.push(t);
  }
  for (const t of incoming) {
    if (!byHash.has(t.hash)) byHash.set(t.hash, { out: [], in: [], ts: t.metadata?.blockTimestamp ?? "" });
    byHash.get(t.hash)!.in.push(t);
  }

  const trades: Trade[] = [];

  for (const [hash, { out: outs, in: ins, ts }] of byHash) {
    const shortTx = `${hash.slice(0, 6)}...${hash.slice(-4)}`;

    if (outs.length > 0 && ins.length > 0) {
      const outT = outs[0];
      const inT = ins[0];
      trades.push({
        type: classifyTrade(inT.asset, outT.asset),
        in: formatAmount(inT.value, inT.asset),
        out: formatAmount(outT.value, outT.asset),
        route: detectRoute(hash, outgoing),
        chain: "Base",
        tx: shortTx,
        timestamp: formatTimestamp(ts),
      });
    } else if (outs.length > 0 && ins.length === 0) {
      const outT = outs[0];
      const isSell = !STABLECOINS.has(outT.asset ?? "");
      trades.push({
        type: isSell ? "SELL" : "SWAP",
        in: "ETH (native)",
        out: formatAmount(outT.value, outT.asset),
        route: detectRoute(hash, outgoing),
        chain: "Base",
        tx: shortTx,
        timestamp: formatTimestamp(ts),
      });
    }
    // outs=0, ins≥1 → inbound only (airdrop/transfer), skip
  }

  trades.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return trades;
}
