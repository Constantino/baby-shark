export type Trade = {
  type: "BUY" | "SELL" | "SWAP";
  in: string;
  out: string;
  route: string;
  chain: string;
  tx: string;
  timestamp: string;
};
