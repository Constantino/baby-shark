import type { Trade } from "@/types/trade";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY ?? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const BOT_ADDRESS = (process.env.NEXT_PUBLIC_BOT_ADDRESS ?? "").toLowerCase();
const BASE_ALCHEMY_URL = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

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
  console.log(`[trades] fetchTransfers called: ${addressField}`);
  console.log(`[trades] ALCHEMY_API_KEY: ${ALCHEMY_API_KEY ? ALCHEMY_API_KEY.slice(0, 6) + "..." : "MISSING"}`);
  console.log(`[trades] BOT_ADDRESS: ${BOT_ADDRESS || "MISSING"}`);

  if (!ALCHEMY_API_KEY) {
    console.error("[trades] ALCHEMY_API_KEY is missing — aborting fetch");
    return [];
  }
  if (!BOT_ADDRESS) {
    console.error("[trades] BOT_ADDRESS is missing — aborting fetch");
    return [];
  }

  const payload = {
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
  };

  console.log(`[trades] Calling Alchemy: ${BASE_ALCHEMY_URL}`);
  console.log(`[trades] Payload:`, JSON.stringify(payload));

  try {
    const res = await fetch(BASE_ALCHEMY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const data = await res.json();
    console.log(`[trades] Alchemy response status: ${res.status}`);
    console.log(`[trades] Alchemy response:`, JSON.stringify(data).slice(0, 500));
    if (data.error) {
      console.error(`[trades] Alchemy error:`, data.error);
      return [];
    }
    const transfers = data.result?.transfers ?? [];
    console.log(`[trades] ${addressField} transfers count: ${transfers.length}`);
    return transfers;
  } catch (err) {
    console.error(`[trades] fetch error:`, err);
    return [];
  }
}

const STABLECOINS = new Set(["USDC", "USDT", "DAI", "BUSD", "USDbC"]);

function classifyTrade(
  inAsset: string | null,
  outAsset: string | null
): "BUY" | "SELL" | "SWAP" {
  const inStable = STABLECOINS.has(inAsset ?? "");
  const outStable = STABLECOINS.has(outAsset ?? "");
  if (outStable && !inStable) return "BUY";   // sent stablecoin, got token
  if (inStable && !outStable) return "SELL";  // sent token, got stablecoin
  return "SWAP";
}

function formatAmount(value: number | null, asset: string | null): string {
  if (value === null || !asset) return "?";
  const stablecoins = ["USDC", "USDT", "DAI", "BUSD"];
  if (stablecoins.includes(asset ?? "")) {
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

  console.log(`[trades] outgoing: ${outgoing.length}, incoming: ${incoming.length}`);
  console.log(`[trades] outgoing assets:`, [...new Set(outgoing.map(t => t.asset))]);
  console.log(`[trades] incoming assets:`, [...new Set(incoming.map(t => t.asset))]);
  console.log(`[trades] unique outgoing txHashes: ${new Set(outgoing.map(t => t.hash)).size}`);
  console.log(`[trades] unique incoming txHashes: ${new Set(incoming.map(t => t.hash)).size}`);

  if (outgoing.length === 0 && incoming.length === 0) {
    console.warn("[trades] No transfers found — returning empty");
    return [];
  }

  // Group by txHash
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
      // Full swap: both sides visible
      const outT = outs[0];
      const inT = ins[0];
      trades.push({
        type: classifyTrade(inT.asset, outT.asset),
        in: formatAmount(inT.value, inT.asset),
        out: formatAmount(outT.value, outT.asset),
        route: detectRoute(hash, outgoing),
        chain: "Base",
        tx: shortTx,
        profitLoss: "N/A",
        timestamp: formatTimestamp(ts),
      });
    } else if (outs.length > 0 && ins.length === 0) {
      // Only outgoing visible — bot sent a token, received ETH (not captured)
      const outT = outs[0];
      const isSell = !STABLECOINS.has(outT.asset ?? "");
      trades.push({
        type: isSell ? "SELL" : "SWAP",
        in: "ETH (native)",
        out: formatAmount(outT.value, outT.asset),
        route: detectRoute(hash, outgoing),
        chain: "Base",
        tx: shortTx,
        profitLoss: "N/A",
        timestamp: formatTimestamp(ts),
      });
    }
    // outs:0 ins:1 → airdrop / inbound-only transfer, skip
  }

  // Sort by timestamp desc (most recent first)
  trades.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return trades;
}

// --- Legacy mock kept below for reference only (unused) ---
const _MOCK_TRADES: Trade[] = [
  {
    in: "1.5 ETH",
    out: "3,240 USDC",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x7a3f...9d2c",
    profitLoss: "+$124.50",
    timestamp: "2025-02-19 14:32:18",
  },
  {
    in: "10,000 USDC",
    out: "0.82 ETH",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0x1b4e...7f91",
    profitLoss: "-$32.00",
    timestamp: "2025-02-19 13:15:42",
  },
  {
    in: "500 DAI",
    out: "512 USDC",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x9c2d...4a1b",
    profitLoss: "+$12.00",
    timestamp: "2025-02-19 12:08:05",
  },
  {
    in: "2.1 ETH",
    out: "4,100 USDT",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0xe5f8...b3c7",
    profitLoss: "+$89.20",
    timestamp: "2025-02-19 11:44:33",
  },
  {
    in: "8,000 USDT",
    out: "1.92 ETH",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x2a6c...8e4d",
    profitLoss: "-$18.75",
    timestamp: "2025-02-19 10:22:11",
  },
  {
    in: "0.5 ETH",
    out: "1,080 USDC",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0x3b1c...a5e2",
    profitLoss: "+$45.00",
    timestamp: "2025-02-19 09:58:00",
  },
  {
    in: "2,000 USDC",
    out: "0.19 ETH",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x4d2e...f6a3",
    profitLoss: "-$12.30",
    timestamp: "2025-02-19 09:31:22",
  },
  {
    in: "1.2 ETH",
    out: "2,590 USDT",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0x5e3f...b7c4",
    profitLoss: "+$67.80",
    timestamp: "2025-02-19 09:05:44",
  },
  {
    in: "15,000 USDT",
    out: "3.6 ETH",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x6f4a...c8d5",
    profitLoss: "-$55.20",
    timestamp: "2025-02-19 08:42:11",
  },
  {
    in: "800 DAI",
    out: "818 USDC",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0x7a5b...d9e6",
    profitLoss: "+$18.00",
    timestamp: "2025-02-19 08:18:33",
  },
  {
    in: "3.0 ETH",
    out: "6,480 USDC",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x8b6c...e0f7",
    profitLoss: "+$210.00",
    timestamp: "2025-02-19 07:55:05",
  },
  {
    in: "5,000 USDC",
    out: "0.41 ETH",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0x9c7d...f1a8",
    profitLoss: "-$22.50",
    timestamp: "2025-02-19 07:28:17",
  },
  {
    in: "1.8 ETH",
    out: "3,888 USDT",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0xad8e...a2b9",
    profitLoss: "+$95.40",
    timestamp: "2025-02-19 07:02:39",
  },
  {
    in: "4,200 USDC",
    out: "0.97 ETH",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0xbe9f...b3ca",
    profitLoss: "+$8.20",
    timestamp: "2025-02-19 06:35:51",
  },
  {
    in: "1,200 DAI",
    out: "1,228 USDC",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0xcf0a...c4db",
    profitLoss: "+$28.00",
    timestamp: "2025-02-19 06:11:03",
  },
  {
    in: "0.75 ETH",
    out: "1,620 USDC",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0xd01b...d5ec",
    profitLoss: "+$38.50",
    timestamp: "2025-02-19 05:44:25",
  },
  {
    in: "12,000 USDT",
    out: "2.88 ETH",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0xe12c...e6fd",
    profitLoss: "-$42.00",
    timestamp: "2025-02-19 05:18:47",
  },
  {
    in: "2.4 ETH",
    out: "5,184 USDC",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0xf23d...f7ae",
    profitLoss: "+$156.00",
    timestamp: "2025-02-19 04:52:09",
  },
  {
    in: "6,500 USDC",
    out: "1.56 ETH",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x034e...a8bf",
    profitLoss: "-$15.80",
    timestamp: "2025-02-19 04:25:21",
  },
  {
    in: "350 DAI",
    out: "358 USDC",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0x145f...b9c0",
    profitLoss: "+$8.00",
    timestamp: "2025-02-19 03:58:43",
  },
  {
    in: "1.1 ETH",
    out: "2,376 USDT",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x256a...cad1",
    profitLoss: "+$52.30",
    timestamp: "2025-02-19 03:32:05",
  },
  {
    in: "9,000 USDC",
    out: "2.16 ETH",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0x367b...dbe2",
    profitLoss: "+$24.00",
    timestamp: "2025-02-19 03:05:27",
  },
  {
    in: "4.0 ETH",
    out: "8,640 USDC",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x478c...ecf3",
    profitLoss: "+$312.00",
    timestamp: "2025-02-19 02:38:49",
  },
  {
    in: "3,300 USDT",
    out: "0.79 ETH",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0x589d...fd04",
    profitLoss: "-$28.50",
    timestamp: "2025-02-19 02:12:11",
  },
  {
    in: "1.65 ETH",
    out: "3,564 USDC",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x69ae...0e15",
    profitLoss: "+$98.20",
    timestamp: "2025-02-19 01:45:33",
  },
  {
    in: "7,200 USDC",
    out: "1.73 ETH",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0x7abf...1f26",
    profitLoss: "-$9.40",
    timestamp: "2025-02-19 01:18:55",
  },
  {
    in: "650 DAI",
    out: "666 USDC",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0x8bc0...2a37",
    profitLoss: "+$16.00",
    timestamp: "2025-02-19 00:52:17",
  },
  {
    in: "2.25 ETH",
    out: "4,860 USDT",
    route: "Uniswap v3",
    chain: "Base",
    tx: "0x9cd1...3b48",
    profitLoss: "+$134.60",
    timestamp: "2025-02-19 00:25:39",
  },
  {
    in: "11,000 USDC",
    out: "2.64 ETH",
    route: "Uniswap v4",
    chain: "Base",
    tx: "0xade2...4c59",
    profitLoss: "-$38.20",
    timestamp: "2025-02-18 23:59:01",
  },
];
