# Monad Uniswap V3 Quoter

Fast batch quoter for **Uniswap V3 ONLY** on Monad blockchain.

**V2 is NOT deployed on Monad** - this implementation uses only V3.

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Configure
Edit `.env`:
```env
MONAD_RPC_URL=https://your-monad-rpc-url
TOKEN_USDC=0x...
TOKEN_USDT=0x...
TOKEN_SHIBA=0x...
```

### 3. Run
```bash
npm run start:dev
```

### 4. Test
```bash
curl http://localhost:3000/quoter/batch
```

## API Endpoints

### Get All Quotes
```bash
GET /quoter/batch
```

Returns all V3 quotes across 3 fee tiers (0.05%, 0.3%, 1%) + arbitrage opportunities.

### Get Pair Quotes
```bash
GET /quoter/pair/WMON/USDC
```

Returns quotes for specific pair across all fee tiers.

### Get Arbitrage Opportunities
```bash
GET /quoter/opportunities
```

Returns detected arbitrage between different fee tiers.

## Trading Pairs

- WMON/USDC
- WMON/USDT
- USDC/USDT
- SHIBA/USDC
- SHIBA/USDT
- SHIBA/WMON

## Official Addresses (Hardcoded)

From https://docs.uniswap.org/contracts/v3/reference/deployments/monad-deployments

- **Chain ID:** 143
- **V3 Factory:** `0x204faca1764b154221e35c0d20abb3c525710498`
- **QuoterV2:** `0x661e93cca42afacb172121ef892830ca3b70f08d`
- **Multicall3:** `0xd1b797d92d87b688193a2b976efc8d577d204343`
- **WMON:** `0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A`

## Architecture

```
Multicall3 Batch Query
  ↓
6 pairs × 3 fee tiers = 18 quotes
  ↓
Single RPC call (~20-50ms)
  ↓
Compare prices across fee tiers
  ↓
Detect arbitrage opportunities
```

## Response Format

```json
{
  "quotes": [
    {
      "pair": "WMON/USDC",
      "version": "v3",
      "fee": 3000,
      "price": 1.5,
      "gasEstimate": "100000"
    }
  ],
  "opportunities": [
    {
      "profitPercent": 0.5,
      "route": "Buy on V3 (1%) → Sell on V3 (0.05%)"
    }
  ],
  "executionTime": 35
}
```

## Notes

- **V2 NOT available** on Monad
- **Native MON** must use WMON wrapper
- **QuoterV2** is V3's quoter (not a universal V2/V3 quoter)

See `V3-MIGRATION.md` for detailed changes.
