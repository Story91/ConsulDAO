# ConsulDAO - Hackathon Implementation Plan

## 🎯 Strategy: "The Autonomous Incubator"

**Goal**: Build a **Vertical Slice** - one polished user flow that demos every sponsor feature in 5 minutes.

Instead of building the whole DAO platform, we build **one specific flow**: An AI Agent that incubates one project, gives it an identity (ENS), manages its budget (Arc/Circle), and launches its token (Uniswap v4).

---

## 📊 Prize Targets

| Sponsor | Prize Pool | Integration |
|---------|------------|-------------|
| 🔷 ENS | $5,000 | Subdomain minting + text records |
| 🔵 Arc/Circle | $10,000 | USDC treasury + CCTP cross-chain |
| 🦄 Uniswap v4 | $10,000 | Anti-Rug Hook |
| 🟡 Yellow Network | $15,000 | State channels (bonus if time) |
| 🔘 Base/OnchainKit | N/A | Already integrated |

**Total Potential: ~$40,000+**

---

## ✅ Current Implementation Status

### Completed Features

| Feature | Files | Status |
|---------|-------|--------|
| **Professional Landing Page** | `app/page.tsx`, `components/Hero.tsx`, etc. | ✅ Done |
| **AI Incubator Chat Interface** | `app/incubator/page.tsx` | ✅ Done |
| **Chat Components** | `components/chat/*` | ✅ Done |
| **Agent API** | `app/api/agent/route.ts` | ✅ Done |
| **Agent Utilities** | `lib/agent.ts` | ✅ Done |
| **ENS Integration** | `lib/ens.ts` | ✅ Done |
| **Circle/Arc Integration** | `lib/circle.ts` | ✅ Done |
| **Contract ABIs** | `lib/contracts.ts` | ✅ Done |
| **AntiRugHook Contract** | `contracts/AntiRugHook.sol` | ✅ Done |
| **HubDAO Contract** | `contracts/HubDAO.sol` | ✅ Done |

### Project Structure

```
ConsulDAO/
├── app/
│   ├── api/agent/route.ts      # Agent API endpoint
│   ├── incubator/page.tsx      # Chat interface for AI agent
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Professional styling
│   └── layout.tsx, rootProvider.tsx
├── components/
│   ├── chat/                   # Chat UI components
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── IncubationStatus.tsx
│   ├── Hero.tsx, Features.tsx, CTA.tsx, Footer.tsx, Navbar.tsx
│   └── ui/                     # shadcn components
├── contracts/
│   ├── AntiRugHook.sol         # Uniswap v4 Hook (Anti-Rug)
│   └── HubDAO.sol              # DAO Treasury
├── lib/
│   ├── agent.ts                # Agent logic & types
│   ├── circle.ts               # Circle/Arc USDC integration
│   ├── contracts.ts            # Contract ABIs
│   ├── ens.ts                  # ENS subdomain utilities
│   └── utils.ts
└── docs/
    ├── IMPLEMENTATION_PLAN.md  # This file - main plan
    ├── INTEGRATION_GUIDES.md   # Quick reference for integrations
    └── hackathon_plan.md       # Original strategy (reference)
```

---

## 🚀 Demo Flow

The AI Agent guides users through the complete incubation process:

```
1. User: "Start my project called XYZ"
2. Agent creates session → xyz.consul.eth
3. User: "Begin incubation"
4. Agent executes:
   ├── Step 1: 🔷 Mint ENS Identity
   ├── Step 2: 💰 Setup USDC Treasury
   ├── Step 3: 🟡 Open Yellow Channel (optional)
   ├── Step 4: ✅ Approve Budget
   ├── Step 5: 🦄 Deploy Uniswap Pool
   └── Step 6: 🔒 Lock with Anti-Rug Hook
5. Project launched! 🎉
```

---

## 📅 Remaining Tasks

### Priority 1: Contract Deployment (Day 1)

- [ ] Deploy HubDAO to Base Sepolia
- [ ] Deploy AntiRugHook to Base Sepolia
- [ ] Update contract addresses in `lib/contracts.ts`
- [ ] Test contract interactions

### Priority 2: Real ENS Integration (Day 1-2)

- [ ] Implement actual ENS subdomain minting
- [ ] Store project manifest in text records
- [ ] Add ENS resolution in chat interface

### Priority 3: Real Circle Integration (Day 2)

- [ ] Add Circle API key configuration
- [ ] Implement USDC balance checking
- [ ] Add cross-chain transfer functionality

### Priority 4: Demo Video (Day 3)

- [ ] Record 3-minute demo video
- [ ] Show ENS minting
- [ ] Show Anti-Rug Hook rejecting founder dump
- [ ] Show treasury operations

### Bonus: Yellow Network (If time permits)

- [ ] Integrate Nitrolite SDK
- [ ] Open state channel for micro-agreements
- [ ] Show gasless operations

---

## 🛠️ Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| UI Components | shadcn/ui |
| Wallet | OnchainKit (Coinbase) |
| Blockchain | Base L2 (Sepolia testnet) |
| Smart Contracts | Solidity 0.8.24, Hardhat |
| Agent | Custom agent logic (simulated for MVP) |

---

## 🔑 Environment Variables Needed

```env
# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY=

# Deployed Contracts
NEXT_PUBLIC_HUB_DAO_ADDRESS=
NEXT_PUBLIC_ANTI_RUG_HOOK_ADDRESS=

# Circle (for real USDC integration)
CIRCLE_API_KEY=

# ENS (optional - for mainnet)
NEXT_PUBLIC_ENS_PARENT_DOMAIN=consul.eth
```

---

## 📹 Demo Video Script (3 minutes)

**0:00 - 0:30**: "DAOs are slow. We made them Agentic."
- Show the beautiful landing page
- Click "Launch with AI Agent"

**0:30 - 1:00**: Show the Chat Interface
- Type "Start my project called DeFiDAO"
- Agent creates session with ENS: `defidao.consul.eth`

**1:00 - 1:30**: Show the Incubation Flow
- Click "Begin incubation"
- Agent mints ENS ✅
- Agent sets up treasury ✅
- Agent deploys pool ✅

**1:30 - 2:00**: Show the Anti-Rug Hook
- Try to sell founder tokens → BLOCKED 🔴
- "Vesting period active: 365 days remaining"

**2:00 - 2:30**: Show Circle Treasury
- Display USDC balance
- Show cross-chain payment capability

**2:30 - 3:00**: Summary
- "From idea to token launch in minutes"
- "On-chain vesting at DEX level"
- "Autonomous treasury management"

---

## 🏆 Prize Submission Checklist

### ENS ($5,000)
- [x] Subdomain generation: `projectname.consul.eth`
- [x] Text record utilities for metadata
- [ ] Actual minting transaction
- [ ] Demo video showing ENS usage

### Uniswap v4 ($10,000)
- [x] AntiRugHook.sol with beforeSwap hook
- [x] Founder vesting logic (cliff + linear)
- [ ] Deploy to testnet
- [ ] Demo video showing blocked founder sell

### Arc/Circle ($10,000)
- [x] USDC address configuration
- [x] CCTP utilities for cross-chain
- [x] Payment request types
- [ ] Actual Circle API integration
- [ ] Demo video showing treasury

### Yellow Network ($15,000) - BONUS
- [ ] Nitrolite SDK integration
- [ ] State channel management
- [ ] Off-chain micro-agreements

---

## 🎯 What We Cut (Intentionally)

These were removed to focus on the vertical slice:

- ❌ SquadRegistry.sol - Not needed for MVP
- ❌ Complex voting system - Yellow Channel replaces it
- ❌ Talent marketplace - AI Agent is the talent
- ❌ Legal escrow - Simplified to treasury
- ❌ Multiple squad types - Single Agent handles all

---

## 📝 Notes

1. **Agent is simulated** - For hackathon, agent actions are scripted. Real LLM integration would come later.

2. **Contracts need deployment** - AntiRugHook requires Uniswap v4 infrastructure on testnet.

3. **ENS subdomains** - Real minting requires owning a parent domain or using testnet ENS.

4. **Demo is key** - Judges may not run code. Video quality matters!

