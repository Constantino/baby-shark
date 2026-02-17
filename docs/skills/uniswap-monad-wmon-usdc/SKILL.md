---
name: monad-usdc-trading
description: Trade WMON/USDC on Monad mainnet using Uniswap V3. Swap tokens, get quotes, wrap MON, and check balances with pure viem.
license: MIT
compatibility: Requires node 18+, viem library, and internet access for Monad mainnet RPC
metadata:
  author: monad-traders
  version: "1.0.0"
---

# Monad USDC Trading

Trade WMON/USDC on Monad mainnet using Uniswap V3 with pure viem.

## Network Constants

```typescript
const CONFIG = {
  chainId: 143,
  rpcUrl: "https://monad-mainnet.drpc.org",
  WMON: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
  USDC: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
  SWAP_ROUTER: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Uniswap V3 SwapRouter02
  QUOTER_V2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
  
  // Available pools (WMON/USDC)
  POOLS: {
    FEE_100: "0x95DBd5836ebF6167Fc7851D7390c7ff747D3B639",   // 0.01%
    FEE_500: "0x6fe101b4ccddF99f40CFB8Cb12089F6927A16D4c",   // 0.05% (recommended)
    FEE_3000: "0x878750488F613e043D016F99913e639E58BC1e52",  // 0.30%
    FEE_10000: "0x11b8C9251e702b264520B6Bcf7c506C0d3b55d7F", // 1.00%
  }
};
```

## Setup

```typescript
import { createPublicClient, createWalletClient, http, parseEther, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const chain = {
  id: 143,
  name: 'Monad',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [CONFIG.rpcUrl] } },
};

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const publicClient = createPublicClient({ chain, transport: http(CONFIG.rpcUrl) });
const walletClient = createWalletClient({ account, chain, transport: http(CONFIG.rpcUrl) });
```

## 1. Wrap MON → WMON

```typescript
const wmonAbi = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
];

// Wrap MON to WMON
async function wrapMON(amountMON: bigint) {
  const hash = await walletClient.writeContract({
    address: CONFIG.WMON,
    abi: wmonAbi,
    functionName: 'deposit',
    value: amountMON,
    account,
    chain,
  });
  
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

// Unwrap WMON to MON
async function unwrapWMON(amountWMON: bigint) {
  const hash = await walletClient.writeContract({
    address: CONFIG.WMON,
    abi: wmonAbi,
    functionName: 'withdraw',
    args: [amountWMON],
    account,
    chain,
  });
  
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
```

## 2. Get Quote (Price Check)

```typescript
const quoterAbi = [
  {
    name: 'quoteExactInputSingle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'fee', type: 'uint24' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
      },
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' },
    ],
  },
];

async function getQuote(tokenIn: string, tokenOut: string, amountIn: bigint, fee: number = 500) {
  try {
    const result = await publicClient.simulateContract({
      address: CONFIG.QUOTER_V2,
      abi: quoterAbi,
      functionName: 'quoteExactInputSingle',
      args: [{
        tokenIn,
        tokenOut,
        amountIn,
        fee,
        sqrtPriceLimitX96: 0n,
      }],
    });
    
    return {
      amountOut: result.result[0],
      gasEstimate: result.result[3],
    };
  } catch (error) {
    throw new Error(`Quote failed: ${error.message}`);
  }
}

// Get WMON → USDC quote
async function getWMONtoUSDCQuote(wmonAmount: bigint) {
  return getQuote(CONFIG.WMON, CONFIG.USDC, wmonAmount, 500);
}

// Get USDC → WMON quote
async function getUSDCtoWMONQuote(usdcAmount: bigint) {
  return getQuote(CONFIG.USDC, CONFIG.WMON, usdcAmount, 500);
}
```

## 3. Swap WMON → USDC

```typescript
const erc20Abi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
];

const swapRouterAbi = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
      },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
];

async function swapWMONtoUSDC(wmonAmount: bigint, slippageBps: number = 100) {
  // 1. Get quote
  const { amountOut } = await getWMONtoUSDCQuote(wmonAmount);
  const amountOutMin = (amountOut * BigInt(10000 - slippageBps)) / 10000n;
  
  console.log('Expected USDC:', formatUnits(amountOut, 6));
  console.log('Minimum USDC (with slippage):', formatUnits(amountOutMin, 6));
  
  // 2. Check and approve if needed
  const allowance = await publicClient.readContract({
    address: CONFIG.WMON,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account.address, CONFIG.SWAP_ROUTER],
  });
  
  if (allowance < wmonAmount) {
    console.log('Approving WMON...');
    const approveTx = await walletClient.writeContract({
      address: CONFIG.WMON,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONFIG.SWAP_ROUTER, wmonAmount],
      account,
      chain,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveTx });
    console.log('Approved!');
  }
  
  // 3. Execute swap
  console.log('Swapping...');
  const swapTx = await walletClient.writeContract({
    address: CONFIG.SWAP_ROUTER,
    abi: swapRouterAbi,
    functionName: 'exactInputSingle',
    args: [{
      tokenIn: CONFIG.WMON,
      tokenOut: CONFIG.USDC,
      fee: 500, // 0.05%
      recipient: account.address,
      amountIn: wmonAmount,
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0n,
    }],
    account,
    chain,
  });
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash: swapTx });
  console.log('Swap complete!');
  
  return { hash: swapTx, receipt, expectedUSDC: amountOut, minUSDC: amountOutMin };
}
```

## 4. Swap USDC → WMON

```typescript
async function swapUSDCtoWMON(usdcAmount: bigint, slippageBps: number = 100) {
  // 1. Get quote
  const { amountOut } = await getUSDCtoWMONQuote(usdcAmount);
  const amountOutMin = (amountOut * BigInt(10000 - slippageBps)) / 10000n;
  
  console.log('Expected WMON:', formatUnits(amountOut, 18));
  console.log('Minimum WMON (with slippage):', formatUnits(amountOutMin, 18));
  
  // 2. Check and approve if needed
  const allowance = await publicClient.readContract({
    address: CONFIG.USDC,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account.address, CONFIG.SWAP_ROUTER],
  });
  
  if (allowance < usdcAmount) {
    console.log('Approving USDC...');
    const approveTx = await walletClient.writeContract({
      address: CONFIG.USDC,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONFIG.SWAP_ROUTER, usdcAmount],
      account,
      chain,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveTx });
    console.log('Approved!');
  }
  
  // 3. Execute swap
  console.log('Swapping...');
  const swapTx = await walletClient.writeContract({
    address: CONFIG.SWAP_ROUTER,
    abi: swapRouterAbi,
    functionName: 'exactInputSingle',
    args: [{
      tokenIn: CONFIG.USDC,
      tokenOut: CONFIG.WMON,
      fee: 500, // 0.05%
      recipient: account.address,
      amountIn: usdcAmount,
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0n,
    }],
    account,
    chain,
  });
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash: swapTx });
  console.log('Swap complete!');
  
  return { hash: swapTx, receipt, expectedWMON: amountOut, minWMON: amountOutMin };
}
```

## 5. Check Balances

```typescript
async function getBalances(walletAddress: string) {
  const [monBalance, wmonBalance, usdcBalance] = await Promise.all([
    publicClient.getBalance({ address: walletAddress as `0x${string}` }),
    publicClient.readContract({
      address: CONFIG.WMON,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [walletAddress],
    }),
    publicClient.readContract({
      address: CONFIG.USDC,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [walletAddress],
    }),
  ]);
  
  return {
    MON: formatUnits(monBalance, 18),
    WMON: formatUnits(wmonBalance, 18),
    USDC: formatUnits(usdcBalance, 6),
    raw: { monBalance, wmonBalance, usdcBalance },
  };
}
```

## Usage Examples

### Example 1: Wrap MON and Swap to USDC

```typescript
// Wrap 10 MON to WMON
const wrapTx = await wrapMON(parseEther('10'));
console.log('Wrapped MON:', wrapTx);

// Swap 10 WMON to USDC (1% slippage)
const swapResult = await swapWMONtoUSDC(parseEther('10'), 100);
console.log('Received USDC:', formatUnits(swapResult.expectedUSDC, 6));
```

### Example 2: Swap USDC to WMON and Unwrap

```typescript
// Swap 100 USDC to WMON (1% slippage)
const swapResult = await swapUSDCtoWMON(parseUnits('100', 6), 100);
console.log('Received WMON:', formatUnits(swapResult.expectedWMON, 18));

// Unwrap WMON to MON
const unwrapTx = await unwrapWMON(swapResult.expectedWMON);
console.log('Unwrapped to MON:', unwrapTx);
```

### Example 3: Get Current Price

```typescript
// Get price for 1 WMON in USDC
const quote = await getWMONtoUSDCQuote(parseEther('1'));
console.log('1 WMON =', formatUnits(quote.amountOut, 6), 'USDC');

// Get price for 1 USDC in WMON
const reverseQuote = await getUSDCtoWMONQuote(parseUnits('1', 6));
console.log('1 USDC =', formatUnits(reverseQuote.amountOut, 18), 'WMON');
```

### Example 4: Check Portfolio

```typescript
const balances = await getBalances(account.address);
console.log('Balances:', balances);
// Output: { MON: "5.2", WMON: "10.0", USDC: "150.5" }
```

## Key Points

- **Slippage:** Default 1% (100 basis points). Adjust based on volatility.
- **Fee Tiers:** 0.05% (500) recommended for most swaps. Use 0.01% (100) for large trades.
- **Gas:** Always estimate gas before sending transactions.
- **Approvals:** Only needed once per token/spender pair until allowance is used up.
- **Price Impact:** Use quotes to check price impact before large swaps.

## Error Handling

```typescript
// Common errors and solutions
try {
  await swapWMONtoUSDC(parseEther('100'), 100);
} catch (error) {
  if (error.message.includes('Too little received')) {
    console.error('Slippage too high. Increase slippage tolerance or reduce amount.');
  } else if (error.message.includes('STF')) {
    console.error('Insufficient balance or approval.');
  } else {
    console.error('Swap failed:', error.message);
  }
}
```

## Installation

```bash
npm install viem
```

## Security

- Never hardcode private keys
- Use environment variables: `process.env.PRIVATE_KEY`
- Always verify contract addresses before transactions
- Test with small amounts first
- Monitor gas prices on mainnet

## Contract Addresses Reference

| Contract | Address | Purpose |
|----------|---------|---------|
| WMON | 0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A | Wrapped MON |
| USDC | 0x754704Bc059F8C67012fEd69BC8A327a5aafb603 | USD Coin |
| SwapRouter02 | 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45 | Uniswap V3 Router |
| QuoterV2 | 0x61fFE014bA17989E743c5F6cB21bF9697530B21e | Price quotes |

## Links

- Monad Docs: https://docs.monad.xyz
- Uniswap V3 Docs: https://docs.uniswap.org/contracts/v3/overview
- Explorer: https://monad.socialscan.io