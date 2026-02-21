/**
 * Augment Window for the EIP-1193 provider injected by wallets (e.g. MetaMask).
 */
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
  };
}
