# ConsulDAO - Hackathon Implementation Plan

**Last Updated**: 2026-02-08

## 🎯 Strategy: "The Autonomous Incubator"

**Goal**: Build a **Vertical Slice** - one polished user flow that demos every sponsor feature in 5 minutes.

An AI Agent that incubates projects, gives them identity (ENS), manages budget (Arc/Circle), and launches tokens (Uniswap v4) with anti-rug protection.

---

## 📊 Prize Targets

| Sponsor | Prize Pool | Integration | Status |
|---------|------------|-------------|--------|
| 🦄 Uniswap v4 | $10,000 | Anti-Rug Hook | ✅ Deployed |
| 🔵 Arc/Circle | $10,000 | USDC treasury + CCTP | ✅ Integrated |
| 🔷 ENS | $5,000 | Subdomain minting | ✅ Implemented |
| 🟡 Yellow Network | $15,000 | State channels | ⏳ Bonus |
| 🔘 Base/OnchainKit | N/A | Wallet + Identity | ✅ Done |

**Total Potential: ~$40,000+**

---

## ✅ Implementation Status

### Smart Contracts (8 deployed to Base Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| ConsulToken | `0xf1a699d7...` | ERC20Votes governance token |
| HubDAO | `0x0104f0a2...` | Treasury management |
| ConsulStaking | `0xfdAB9063...` | Lock tokens for voting power |
| Buyback | `0x75A606b7...` | USDC→CONSUL swap & burn |
| Fundraiser | `0xA93B4229...` | USDC fundraising with refunds |
| Squads | `0xECc9A86e...` | Team management |
| ProjectRegistry | `0x83C0dA3f...` | Project registration |
| AntiRugHook | `0xDF2AC968...` | Uniswap v4 vesting hook |

### Frontend

| Feature | Route | Status |
|---------|-------|--------|
| Landing Page | `/` | ✅ Done |
| AI Incubator | `/incubator` | ✅ Done |
| DAO Overview | `/dao` | ✅ Done |
| Governance | `/dao/governance` | ✅ Done |
| Squads | `/dao/squads` | ✅ Done |
| Treasury | `/dao/funds` | ✅ Done (live data) |

### Integrations

| Integration | Files | Status |
|-------------|-------|--------|
| ENS | `lib/ens.ts`, `hooks/useENS.ts` | ✅ Multi-chain ready |
| Circle | `lib/circle.ts`, `hooks/useTreasury.ts` | ✅ Live balance display |
| OnchainKit | `app/rootProvider.tsx` | ✅ Wallet + Identity |
| Network Switching | `components/NetworkSwitcher.tsx` | ✅ Sepolia ↔ Base Sepolia |

---

## 📁 Project Structure

```
ConsulDAO/
├── app/
│   ├── api/agent/route.ts      # Agent API endpoint
│   ├── incubator/page.tsx      # AI chat interface
│   ├── dao/                    # DAO dashboard pages
│   ├── page.tsx                # Landing page
│   └── rootProvider.tsx        # OnchainKit + Wagmi
├── components/
│   ├── chat/                   # Chat UI components
│   ├── NetworkSwitcher.tsx     # Chain switching
│   └── ui/                     # shadcn components
├── contracts/                  # All 8 Solidity contracts
├── hooks/
│   ├── useENS.ts               # ENS operations
│   ├── useTreasury.ts          # Treasury data
│   └── useProjectRegistry.ts   # Project management
├── lib/
│   ├── deployed-addresses.ts   # All contract addresses
│   ├── contracts.ts            # ABIs
│   ├── ens.ts                  # ENS utilities
│   ├── circle.ts               # USDC utilities
│   └── wagmi.ts                # Multi-chain config
├── docs/                       # Development documentation
└── submission/                 # Judge-facing documentation
    ├── README.md
    ├── UNISWAP_V4.md
    ├── CIRCLE_ARC.md
    ├── ENS_INTEGRATION.md
    ├── ARCHITECTURE.md
    └── DEMO_SCRIPT.md
```

---

## 🚀 Demo Flow

The AI Agent guides users through incubation:

```
1. User: "Start my project called XYZ"
2. Agent creates session → xyz.consul.eth

3. User clicks "Mint ENS Identity"
   → Switch to Sepolia
   → Mint subdomain
   → Set text records

4. Project registered in DAO
   → Treasury setup (USDC)
   → Token deployment ready

5. Uniswap pool with AntiRugHook
   → Founder sells blocked during vesting!
```

---

## 📅 Remaining Tasks

### ✅ Completed
- [x] Deploy all 8 contracts to Base Sepolia
- [x] Contract verification on Basescan
- [x] Security audit fixes (4 High issues resolved)
- [x] Multi-chain setup (Sepolia + Base Sepolia)
- [x] ENS hooks with network switching
- [x] Treasury hooks with live blockchain data
- [x] Submission folder with judge docs

### ⏳ Pending - Priority 1

1. **Test ENS on Sepolia**
   - [ ] Get Sepolia ETH from faucet
   - [ ] Test subdomain minting
   - [ ] Document transaction hash

2. **Test AntiRugHook**
   - [ ] Create test pool
   - [ ] Attempt founder sell → should REVERT
   - [ ] Document blocked transaction

3. **Demo Video** (CRITICAL!)
   - [ ] Record 3-minute demo
   - [ ] Script in `submission/DEMO_SCRIPT.md`

### ⏳ Pending - Priority 2 (Bonus)

4. **Yellow Network** ($15,000)
   - [ ] Research Nitrolite SDK
   - [ ] Implement state channel demo

5. **CCTP Cross-Chain**
   - [ ] Test USDC bridge Base → Arbitrum

---

## 🛠️ Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Wallet | OnchainKit (Coinbase) |
| State | Wagmi, TanStack Query |
| Contracts | Solidity 0.8.24, Hardhat |
| L2 | Base Sepolia |
| ENS | Ethereum Sepolia |

---

## 🔑 Environment Variables

```env
# Required
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key

# Optional
CIRCLE_API_KEY=your_circle_key

# Contract addresses are in lib/deployed-addresses.ts
# No env vars needed for contracts
```

---

## 🏆 Prize Submission Checklist

### ENS ($5,000)
- [x] Custom ENS code (not RainbowKit)
- [x] Subdomain generation utilities
- [x] Text record support
- [x] Multi-chain setup (Sepolia for ENS)
- [ ] Actual minting transaction
- [ ] Demo video

### Uniswap v4 ($10,000)
- [x] AntiRugHook.sol deployed
- [x] beforeSwap vesting logic
- [x] Security fixes applied
- [x] README.md (`submission/UNISWAP_V4.md`)
- [ ] TxID showing blocked sell
- [ ] Demo video

### Arc/Circle ($10,000)
- [x] USDC treasury contracts
- [x] Buyback & burn mechanism
- [x] Live balance display
- [x] Architecture diagram
- [ ] CCTP demo
- [ ] Demo video

### Yellow Network ($15,000) - Bonus
- [ ] Nitrolite SDK
- [ ] State channel demo

---

## 📹 Demo Video (3 minutes)

See full script: `submission/DEMO_SCRIPT.md`

| Time | Content |
|------|---------|
| 0:00-0:30 | Problem + Solution intro |
| 0:30-1:00 | ENS identity minting |
| 1:00-1:30 | AntiRugHook blocking sell |
| 1:30-2:00 | Circle treasury |
| 2:00-2:30 | DAO dashboard |
| 2:30-3:00 | Summary + tech stack |

---

## 📝 Notes

1. **Multi-chain is working** - Sepolia for ENS, Base Sepolia for contracts
2. **Agent is simulated** - Scripted actions for hackathon demo
3. **Demo is key** - Judges may not run code, video quality matters!
4. **All contracts verified** - Check on Basescan
