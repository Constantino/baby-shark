# Baby Shark

Uniswap V3 quoter API and Claude trading skill for Monad blockchain.

## Components

### API (`/api`)


**Endpoints**
```bash
GET /quoter/pair/WMON/USDC    # Specific pair across fee tiers
GET /quoter/health            # RPC connection check
```

```bash
GET /ai/chat 

curl -X POST http://54.221.121.74:3000/ai/chat \                                                                                                      INT | base py | 09:59:27 PM
-H "Content-Type: application/json" \
-d '{"message": "Get me a quote for swapping 2 ETH to USDC on Base"}'
```

**Setup**
```bash
cd api
npm install
cp .env.example .env
npm run start:dev
```