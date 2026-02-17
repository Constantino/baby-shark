// Monad Mainnet Contract Addresses
// Official Uniswap V3 deployments on Monad

export const MONAD_MAINNET_ID = 143;

// Uniswap V3 Contracts (V2 NOT deployed on Monad)
export const UNISWAP_V3_FACTORY = '0x204faca1764b154221e35c0d20abb3c525710498';
export const UNISWAP_V3_QUOTER_V2 =
  '0x661e93cca42afacb172121ef892830ca3b70f08d';
export const UNISWAP_V3_SWAP_ROUTER =
  '0xfe31f71c1b106eac32f1a19239c9a9a72ddfb900';
export const MULTICALL3 = '0xd1b797d92d87b688193a2b976efc8d577d204343';

// V3 Fee Tiers to check (WMON/USDC uses 100, 500, 3000, 10000)
export const V3_FEE_TIERS = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.3%, 1%
