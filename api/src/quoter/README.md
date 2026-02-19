# Base Uniswap V3 Quoter

Fast batch quoter for **Uniswap V3** on Base blockchain.

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Configure
Edit `.env`:
```env
BASE_RPC_URL=https://mainnet.base.org
TOKEN_WETH=0x4200000000000000000000000000000000000006
TOKEN_USDC=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
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
GET /quoter/pair/WETH/USDC
```

Returns quotes for specific pair across all fee tiers.

### Get Arbitrage Opportunities
```bash
GET /quoter/opportunities
```

Returns detected arbitrage between different fee tiers.

## Trading Pairs

Example pairs (configured via .env):
- WETH/USDC
- Add more tokens via TOKEN_* variables

## Official Addresses (Hardcoded)

From https://docs.uniswap.org/contracts/v3/reference/deployments

- **Chain ID:** 8453
- **V3 Factory:** `0x33128a8fC17869897dcE68Ed026d694621f6FDfD`
- **QuoterV2:** `0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a`
- **Multicall3:** `0xcA11bde05977b3631167028862bE2a173976CA11`
- **WETH:** `0x4200000000000000000000000000000000000006`

## Architecture

```
Multicall3 Batch Query
  ↓
N pairs × 4 fee tiers = M quotes
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
      "pair": "WETH/USDC",
      "version": "v3",
      "fee": 3000,
      "price": 3000.5,
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

- Uses **Uniswap V3** on Base
- **Native ETH** must use WETH wrapper (0x4200...0006)
- Supports all standard V3 fee tiers (0.01%, 0.05%, 0.3%, 1%)
