# Baby Shark

Uniswap V3 quoter API and Claude trading skill for Monad blockchain.

## Components

### API (`/api`)
NestJS service providing real-time Uniswap V3 price quotes on Monad mainnet.

**Features**
- Batch quotes across multiple fee tiers (0.01%, 0.05%, 0.3%, 1%)
- Arbitrage opportunity detection
- Multicall3 optimization for fast RPC queries

**Endpoints**
```bash
GET /quoter/batch              # All quotes + arbitrage opportunities
GET /quoter/pair/WMON/USDC    # Specific pair across fee tiers
GET /quoter/opportunities      # Detected arbitrage
GET /quoter/tokens            # Available tokens
GET /quoter/health            # RPC connection check
```

**Setup**
```bash
cd api
npm install
cp .env.example .env          # Configure MONAD_RPC_URL
npm run start:dev
```

### Claude Skill (`/docs/skills/uniswap-monad-wmon-usdc`)
Complete trading guide for WMON/USDC on Monad using viem.

**Capabilities**
- Wrap/unwrap MON ↔ WMON
- Swap WMON ↔ USDC with slippage protection
- Get price quotes before trading
- Check balances and approvals

**Usage**: Copy skill to Claude's skill directory or reference directly in prompts.

## Network Details
- **Chain ID**: 143 (Monad Mainnet)
- **RPC**: https://monad-mainnet.drpc.org
- **WMON**: 0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A
- **USDC**: 0x754704Bc059F8C67012fEd69BC8A327a5aafb603
- **SwapRouter02**: 0xfe31f71c1b106eac32f1a19239c9a9a72ddfb900
- **QuoterV2**: 0x661e93cca42afacb172121ef892830ca3b70f08d

# Requirements
- OpenClaw 
- Anthropic or other AI LLM API configured on OpenClaw


# AI agent configuration

Skill installation, open the bot on Telegram and
```
Install this skill https://github.com/Constantino/baby-shark/blob/main/docs/skills/uniswap-monad-wmon-usdc/SKILL.md
```

## demo

```
give me the token balances on monad for that address

Ragnarbot, [17/02/26 6:13 P.M.]
Monad Balances for 0x3E6dD...A24e:

• MON: 4.94
• WMON: 9.9
• USDC: 0.002217

Constantino Mora | Kompensa.app, [17/02/26 6:16 P.M.]
swap 0.1 wmon to usdc

Ragnarbot, [17/02/26 6:17 P.M.]
✅ Swap complete!

Swapped 0.1 WMON → 0.002178 USDC

Tx: 0x9713f68da1debe00e884c96dcc46752d63cf7ffc6b3b27ea7d5781b58333dd55
```