# Baby Shark

**Your capital works as hard when you're asleep as when you're awake.** Baby Shark is a **fully autonomous swap agent** — describe your strategy once, then disappear. No app. No confirmation prompts. The agent reasons, signs, and broadcasts on **Base** using **Anthropic Claude**, **Uniswap Trading API**, and **Permit2**, with optional cron-driven execution via **OpenClaw**.

---

## What Is Baby Shark?

Baby Shark isn’t a trading bot. It’s a step toward **agentic finance**: an LLM doesn’t just answer questions about markets — it *acts* in them. Autonomously. On-chain. With real money.

- **Intent-driven execution** — You describe what you want in natural language. The agent turns intent into quotes, Permit2 signatures, and Universal Router calldata, then can broadcast while you’re offline.
- **No human in the loop** — No wallet popup, no “confirm swap.” The agent signs with a server-side key and submits to Base.
- **Frontier stack** — Claude (Anthropic) for reasoning and transaction construction, Uniswap Trading API for quotes and swap payloads, Base for execution. Optional **OpenClaw** runs the agent on a schedule so it trades without you.

---

## AI & Autonomous Capabilities

| Component | Role |
|-----------|------|
| **Anthropic Claude** | Market reasoning, swap decisions, transaction construction. The agent uses Claude (e.g. `claude-sonnet-4-6` / `claude-haiku-4-5`) for skill selection and tool use. |
| **OpenClaw** | Cron-based agent runner. Triggers the agent on a schedule so it can evaluate conditions, call the Trading API, and execute — fully autonomous, no UI. |
| **Uniswap Trading API** | `/quote` and `/swap`. The agent uses the `http_request` tool to call `trade-api.gateway.uniswap.org` for executable quotes and unsigned transactions. |
| **Trading skill (prompt)** | The **swap-integration** skill defines how to call the Trading API (headers, chainId 8453 Base, Permit2, Universal Router). Claude follows it to build valid requests. |
| **Pre-broadcast validation** | LLM outputs can be wrong (wrong address, decimals, slippage). The design supports validation of recipient, `amountIn`/`amountOutMin`, and deadline before any tx is sent. |
| **Base network** | All quotes, swaps, and contract interactions target **Base** (chainId 8453). Contracts are built and deployed for Base. |
| **Permit2** | Signature-based approvals. The agent (or frontend) signs EIP-712 Permit2 messages; the Universal Router uses them so the user approves once. |

### How the agent runs

1. **Cron trigger** (e.g. OpenClaw) or **HTTP** — A scheduled job or client calls the API (e.g. `POST /ai/chat` with a strategy message).
2. **Claude** selects skills (e.g. `swap-integration`) and gets a system prompt that includes the Trading API rules and secrets (e.g. `x-api-key`).
3. **Tool loop** — Claude calls the `http_request` tool to hit Uniswap Trading API (`/quote`, `/swap`) and, in a full deployment, can sign and broadcast via an agent wallet.
4. **Outcome** — Quote → unsigned tx → (optional) validation layer → Permit2 sign → broadcast on Base → receipt and baseline updates.

The API implements the brain (Claude + skills + `http_request`); an external runner like OpenClaw can run this brain on a schedule so the agent trades 24/7 without a human.

---

## Use Cases

- **Set it once, trade forever** — Describe your strategy once. The agent runs it on a cron — swaps, Permit2, broadcast — with no further input.
- **No confirmation prompts** — Unlike a normal DEX, there’s no wallet popup. The agent signs and submits on your behalf, end-to-end, while you’re offline.
- **Autonomous risk management** — Define a stop-loss or exit condition; the agent monitors and executes without asking.
- **Self-running DCA** — Recurring swaps on a schedule with zero touchpoints after setup.
- **Always on** — No open tab or connected wallet. The agent runs on a server, watches the market, and acts whether you’re asleep, traveling, or unreachable.

---

## Repo Structure

| Part | Stack | Purpose |
|------|--------|---------|
| **API** | NestJS, Anthropic SDK, ethers, pg | Claude agent, skill registry, `http_request` tool, Base Uniswap V3 quoter, vault deposit tracking |
| **Web** | Next.js, React, RainbowKit, wagmi, viem | Agent dashboard, balances, performance, trade activity, Permit2 signing (Base) |
| **Contracts** | Solidity, Foundry, OpenZeppelin | ERC4626 Vault (Base); deploy with `DeployVault.s.sol` |
| **Infra** | Terraform, AWS (EC2), Lambda | API host; Lambda hits `GET /api/check` for health |

---

## Quick Start

### API (agent + quoter + vault)

```bash
cd api
npm install
cp .env.example .env
# Set: ANTHROPIC_API_KEY, BASE_RPC_URL, DATABASE_CONNECTION_STRING, etc.
# Optional: SKILLS_PATH (default: ./skills), ANTHROPIC_MODEL (default: claude-sonnet-4-6)
npm run start:dev
```

- **Quoter (Base Uniswap V3):** `GET /quoter/pair/WETH/USDC`, `GET /quoter/health`
- **AI chat (agent):** `POST /ai/chat` with `{ "message": "Get me a quote for swapping 2 ETH to USDC on Base" }`
- **Vault:** `POST /vault/deposit` with vault address, wallet, amount, tx hash

### Web (dashboard + Permit2)

```bash
cd web
npm install
# Set NEXT_PUBLIC_API_URL (and NEXT_PUBLIC_VAULT_ADDRESS if using vault)
npm run dev
```

- **Agent** — Balances, performance chart, trade activity (Base).
- **Permit2** — Sign Permit2 message, approve USDC to Permit2, execute swap on Base (chainId 8453).

### Contracts (Base)

```bash
cd contracts
forge install
forge build
# Deploy (Base): set PRIVATE_KEY, ASSET_ADDRESS (e.g. USDC), OWNER_ADDRESS, VAULT_NAME, VAULT_SYMBOL
forge script script/DeployVault.s.sol:DeployVault --rpc-url <BASE_RPC> --broadcast
```

---

## Build & Environment

- **Base** — All on-chain logic targets Base (chainId 8453): quoter, Permit2, Universal Router, Vault.
- **Build codes from Base** — Use Base RPC and Base contract addresses (Uniswap V3, Permit2, USDC) everywhere; see `api/.env.example`, `api/src/quoter/constants/addresses.ts`, `web/src/utils/permit2.ts`.
- **Skills** — API loads skills from `api/skills/` by default (`SKILLS_PATH`). The **swap-integration** skill documents the Uniswap Trading API, Permit2, and Base.

---

## Key Files

| Area | Files |
|------|--------|
| Agent | `api/src/llm/llm.service.ts`, `api/src/llm/llm.controller.ts`, `api/src/llm/tools/http-request.executor.ts` |
| Skills | `api/skills/swap-integration/SKILL.md` |
| Base quoter | `api/src/quoter/quoter.service.ts`, `api/src/quoter/constants/addresses.ts` |
| Vault API | `api/src/vault/vault.service.ts`, `api/src/vault/vault.controller.ts` |
| Web agent UI | `web/src/app/agent/page.tsx`, `web/src/components/TradeActivity.tsx`, `web/src/components/PerformanceMetrics.tsx` |
| Permit2 (Base) | `web/src/utils/permit2.ts`, `web/src/app/permit2/page.tsx` |
| Contracts | `contracts/src/Vault.sol`, `contracts/script/DeployVault.s.sol` |

---

## Summary

Baby Shark combines **Anthropic Claude**, **Uniswap Trading API**, and **Base** into an autonomous swap agent: natural-language intent → quotes and swap payloads → (optional) validation → Permit2 signing → on-chain execution. The API is the brain; **OpenClaw** or any cron can drive it so your capital keeps working while you sleep — non-custodial, agentic DeFi on Base.
