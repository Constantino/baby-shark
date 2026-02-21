// Base mainnet
export const CHAIN_ID = 8453;

// Permit2 on Base (Uniswap)
export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3" as const;

// USDC on Base
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

// ERC20 approve(spender, amount): 0x095ea7b3 + address(32) + uint256(32)
// Approve Permit2 to spend max uint256
export const USDC_APPROVE_PERMIT2_DATA =
  "0x095ea7b3000000000000000000000000000000000022d473030f116ddee9f6b43ac78ba3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" as const;

export const PERMIT_EXPIRATION = 1774253377;
export const SIG_DEADLINE = 1771663177;
export const PERMIT_NONCE = 0;

export const PERMIT2_DOMAIN = {
  name: "Permit2",
  chainId: CHAIN_ID,
  verifyingContract: PERMIT2_ADDRESS,
} as const;

export const PERMIT2_TYPES = {
  PermitTransferFrom: [
    { name: "permitted", type: "TokenPermissions" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
  TokenPermissions: [
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
  ],
} as const;

/** USDC has 6 decimals on Base */
export function parseUsdcAmount(amount: string): bigint {
  const parsed = parseFloat(amount);
  if (Number.isNaN(parsed) || parsed < 0) return 0n;
  return BigInt(Math.round(parsed * 1_000_000));
}
