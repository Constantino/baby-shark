<!-- content-hash:508f3db178e8e55f -->
# Swap Integration

## Quick Decision Guide

| Building... | Use This Method |
|---|---|
| Frontend/Backend | Trading API |
| Smart contract integration | Universal Router direct calls |
| Full control over routing | Universal Router SDK |

### Routing Types

| Type | Description | Chains |
|---|---|---|
| CLASSIC | Standard AMM swap | All |
| DUTCH_V2 | UniswapX Dutch auction V2 | Ethereum, Arbitrum, Base, Unichain |
| DUTCH_V3 | UniswapX Dutch auction V3 | — |
| PRIORITY | MEV-protected priority order | Base, Unichain |
| DUTCH_LIMIT | UniswapX Dutch limit order | — |
| LIMIT_ORDER | Limit order | — |
| WRAP | ETH to WETH | All |
| UNWRAP | WETH to ETH | All |
| BRIDGE | Cross-chain bridge | — |
| QUICKROUTE | Fast approximation quote | — |

---

## Trading API Reference

**Base URL**: `https://trade-api.gateway.uniswap.org/v1`

**Required Headers** (all requests):
```
Content-Type: application/json
x-api-key: <your-api-key>
x-universal-router-version: 2.0
```

**API Key**: Register at [developers.uniswap.org](https://developers.uniswap.org/)

**Flow**: `POST /check_approval` → `POST /quote` → `POST /swap`

### POST /check_approval

```json
{
  "walletAddress": "0x...",
  "token": "0x...",
  "amount": "1000000000",
  "chainId": 1
}
```

Response: `{ "approval": { "to": "0x...", "from": "0x...", "data": "0x...", "value": "0", "chainId": 1 } }`

If `approval` is `null`, token is already approved.

### POST /quote

```json
{
  "swapper": "0x...",
  "tokenIn": "0x...",
  "tokenOut": "0x...",
  "tokenInChainId": "1",
  "tokenOutChainId": "1",
  "amount": "1000000000000000000",
  "type": "EXACT_INPUT",
  "slippageTolerance": 0.5,
  "routingPreference": "BEST_PRICE"
}
```

**`tokenInChainId`/`tokenOutChainId` must be strings (e.g., `"1"`), not numbers.**

| Parameter | Values |
|---|---|
| `type` | `EXACT_INPUT` or `EXACT_OUTPUT` |
| `slippageTolerance` | 0–100 percentage |
| `protocols` | `["V2", "V3", "V4"]` |
| `routingPreference` | `BEST_PRICE`, `FASTEST`, `CLASSIC` |
| `autoSlippage` | `true` to auto-calculate (overrides `slippageTolerance`) |
| `urgency` | `normal` or `fast` — affects UniswapX auction timing |

Response:
```json
{
  "routing": "CLASSIC",
  "quote": {
    "input": { "token": "0x...", "amount": "1000000000000000000" },
    "output": { "token": "0x...", "amount": "999000000" },
    "slippage": 0.5,
    "gasFee": "5000000000000000",
    "gasFeeUSD": "0.01",
    "gasUseEstimate": "150000"
  },
  "permitData": {}
}
```

Use `gasFeeUSD` for display. Do not manually convert `gasFee` (wei) with a hardcoded ETH price.

### POST /swap

**Spread the full quote response into the body. Do NOT wrap in `{quote: quoteResponse}`.**

```typescript
const { permitData, permitTransaction, ...cleanQuote } = quoteResponse;

const swapRequest: Record<string, unknown> = { ...cleanQuote };

// Include BOTH signature+permitData, or NEITHER. Never send permitData: null.
if (permit2Signature && permitData && typeof permitData === 'object') {
  swapRequest.signature = permit2Signature;
  swapRequest.permitData = permitData;
}
```

Response:
```json
{
  "swap": {
    "to": "0x...",
    "from": "0x...",
    "data": "0x...",
    "value": "0",
    "chainId": 1,
    "gasLimit": "250000"
  }
}
```

**Validate before broadcasting:**
```typescript
function validateSwapResponse(response): void {
  if (!response.swap?.data || response.swap.data === '' || response.swap.data === '0x')
    throw new Error('swap.data is empty - quote may have expired');
  if (!isAddress(response.swap.to) || !isAddress(response.swap.from))
    throw new Error('Invalid address in swap response');
}
```

### Permit2 Rules

| Scenario | `signature` | `permitData` |
|---|---|---|
| Standard swap | Omit | Omit |
| Permit2 swap | Required | Required |
| **Invalid** | Present | Missing |
| **Invalid** | Missing | Present |
| **Invalid** | Any | `null` |

### Supported Chains

| ID | Chain | ID | Chain |
|---|---|---|---|
| 1 | Ethereum | 8453 | Base |
| 10 | Optimism | 42161 | Arbitrum |
| 56 | BNB | 42220 | Celo |
| 130 | Unichain | 43114 | Avalanche |
| 137 | Polygon | 81457 | Blast |
| 196 | X Layer | 7777777 | Zora |
| 324 | zkSync | 480 | World Chain |
| 1868 | Soneium | 143 | Monad |

---

## API Error Reference

| Code | Meaning |
|---|---|
| 400 | Invalid request parameters |
| 401 | Invalid or missing API key |
| 404 | No route found |
| 429 | Rate limit exceeded |
| 500 | API error — retry with backoff |

| Error Message | Cause | Fix |
|---|---|---|
| `"permitData" must be of type object` | Sending `permitData: null` | Omit field entirely |
| `"quote" does not match any of the allowed types` | Wrapping quote in `{quote: ...}` | Spread: `{...quoteResponse}` |
| `signature and permitData must both be present` | Only one Permit2 field | Include both or neither |

---

## Key Contract Addresses

### Universal Router (v4)

| Chain | ID | Address |
|---|---|---|
| Ethereum | 1 | `0x66a9893cc07d91d95644aedd05d03f95e1dba8af` |
| Unichain | 130 | `0xef740bf23acae26f6492b10de645d6b98dc8eaf3` |
| Optimism | 10 | `0x851116d9223fabed8e56c0e6b8ad0c31d98b3507` |
| Base | 8453 | `0x6ff5693b99212da76ad316178a184ab56d299b43` |
| Arbitrum | 42161 | `0xa51afafe0263b40edaef0df8781ea9aa03e381a3` |
| Polygon | 137 | `0x1095692a6237d83c6a72f3f5efedb9a670c49223` |
| Blast | 81457 | `0xeabbcb3e8e415306207ef514f660a3f820025be3` |
| BNB | 56 | `0x1906c1d672b88cd1b9ac7593301ca990f94eae07` |
| Zora | 7777777 | `0x3315ef7ca28db74abadc6c44570efdf06b04b020` |
| World Chain | 480 | `0x8ac7bee993bb44dab564ea4bc9ea67bf9eb5e743` |
| Avalanche | 43114 | `0x94b75331ae8d42c1b61065089b7d48fe14aa73b7` |
| Celo | 42220 | `0xcb695bc5d3aa22cad1e6df07801b061a05a0233a` |
| Soneium | 1868 | `0x4cded7edf52c8aa5259a54ec6a3ce7c6d2a455df` |
| Ink | 57073 | `0x112908dac86e20e7241b0927479ea3bf935d1fa0` |
| Monad | 143 | `0x0d97dc33264bfc1c226207428a79b26757fb9dc3` |

### Permit2 (all chains)
`0x000000000022D473030F116dDEE9F6B43aC78BA3`

---

## Universal Router Reference

### Core Function (Solidity)
```solidity
function execute(
    bytes calldata commands,
    bytes[] calldata inputs,
    uint256 deadline
) external payable;
```

### Command Byte Encoding
| Bits | Purpose |
|---|---|
| 0 | Allow revert flag (1 = continue on fail) |
| 1–2 | Reserved (use 0) |
| 3–7 | Command identifier |

### Swap Commands
| Code | Command | Parameters |
|---|---|---|
| 0x00 | V3_SWAP_EXACT_IN | (recipient, amountIn, amountOutMin, path, payerIsUser) |
| 0x01 | V3_SWAP_EXACT_OUT | (recipient, amountOut, amountInMax, path, payerIsUser) |
| 0x08 | V2_SWAP_EXACT_IN | (recipient, amountIn, amountOutMin, path[], payerIsUser) |
| 0x09 | V2_SWAP_EXACT_OUT | (recipient, amountOut, amountInMax, path[], payerIsUser) |
| 0x10 | V4_SWAP | — |

### Token Operations
| Code | Command | Parameters |
|---|---|---|
| 0x04 | SWEEP | (token, recipient, amountMin) |
| 0x05 | TRANSFER | (token, recipient, amount) |
| 0x0b | WRAP_ETH | (recipient, amount) |
| 0x0c | UNWRAP_WETH | (recipient, amountMin) |

### Permit2 Commands
| Code | Command | Description |
|---|---|---|
| 0x02 | PERMIT2_TRANSFER_FROM | Single token transfer |
| 0x03 | PERMIT2_PERMIT_BATCH | Batch approval |
| 0x0a | PERMIT2_PERMIT | Single approval |

### Special Addresses
```typescript
const MSG_SENDER   = '0x0000000000000000000000000000000000000001';
const ADDRESS_THIS = '0x0000000000000000000000000000000000000002';
```

### Fee Tiers
| Value | Percentage |
|---|---|
| 100 | 0.01% |
| 500 | 0.05% |
| 3000 | 0.30% |
| 10000 | 1.00% |

---

## Universal Router SDK

```bash
npm install @uniswap/universal-router-sdk @uniswap/router-sdk @uniswap/sdk-core @uniswap/v3-sdk viem
```

### High-Level Usage
```typescript
import { SwapRouter } from '@uniswap/universal-router-sdk';
import { Trade as RouterTrade } from '@uniswap/router-sdk';
import { TradeType, Percent } from '@uniswap/sdk-core';

const { calldata, value } = SwapRouter.swapCallParameters(trade, {
  slippageTolerance: new Percent(50, 10000),
  recipient: walletAddress,
  deadline: Math.floor(Date.now() / 1000) + 1800,
});

const hash = await walletClient.sendTransaction({
  to: UNIVERSAL_ROUTER_ADDRESS('2.0', chainId),
  data: calldata,
  value: BigInt(value),
});
```

### Low-Level: RoutePlanner
```typescript
import { RoutePlanner, CommandType } from '@uniswap/universal-router-sdk';
import { encodeRouteToPath } from '@uniswap/v3-sdk';

// V3 exact input
const planner = new RoutePlanner();
planner.addCommand(CommandType.V3_SWAP_EXACT_IN, [
  MSG_SENDER, amountIn, amountOutMin, path, true
]);

// ETH → Token (wrap + swap)
planner.addCommand(CommandType.WRAP_ETH, [ADDRESS_THIS, amountIn]);
planner.addCommand(CommandType.V3_SWAP_EXACT_IN, [MSG_SENDER, amountIn, amountOutMin, path, false]);
// send with value: amountIn

// Token → ETH (swap + unwrap)
planner.addCommand(CommandType.V3_SWAP_EXACT_IN, [ADDRESS_THIS, amountIn, amountOutMin, path, true]);
planner.addCommand(CommandType.UNWRAP_WETH, [MSG_SENDER, amountOutMin]);

// With fee collection
planner.addCommand(CommandType.V3_SWAP_EXACT_IN, [ADDRESS_THIS, amountIn, 0n, path, true]);
planner.addCommand(CommandType.PAY_PORTION, [outputToken, feeRecipient, feeBips]);
planner.addCommand(CommandType.SWEEP, [outputToken, MSG_SENDER, 0n]);
```

### Execute Helper
```typescript
const ROUTER_ABI = [{
  name: 'execute', type: 'function', stateMutability: 'payable',
  inputs: [
    { name: 'commands', type: 'bytes' },
    { name: 'inputs', type: 'bytes[]' },
    { name: 'deadline', type: 'uint256' },
  ],
  outputs: [],
}] as const;

const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
const { request } = await publicClient.simulateContract({
  address: UNIVERSAL_ROUTER_ADDRESS('2.0', chainId),
  abi: ROUTER_ABI,
  functionName: 'execute',
  args: [planner.commands, planner.inputs, deadline],
  account,
  value: options?.value ?? 0n,
});
return walletClient.writeContract(request);
```

---

## Permit2 Integration

**Permit2 address (all chains)**: `0x000000000022D473030F116dDEE9F6B43aC78BA3`

### Approval Targets
| Approach | Approve To | Per-Swap Auth | Best For |
|---|---|---|---|
| Permit2 | Permit2 contract | EIP-712 signature | Frontends |
| Legacy | Universal Router | None | Backends, smart accounts |

### Pattern
```typescript
const allowance = await publicClient.readContract({
  address: PERMIT2_ADDRESS,
  abi: permit2Abi,
  functionName: 'allowance',
  args: [userAddress, tokenAddress, spenderAddress],
});

if (allowance.amount < requiredAmount) {
  const hash = await walletClient.writeContract({
    address: tokenAddress, abi: erc20Abi,
    functionName: 'approve',
    args