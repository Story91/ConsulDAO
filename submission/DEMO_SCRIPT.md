# Demo Video Script (3 minutes)

## Video Structure

| Time | Section | What to Show |
|------|---------|--------------|
| 0:00 - 0:30 | Introduction | Problem + Solution |
| 0:30 - 1:00 | ENS Identity | Subdomain minting |
| 1:00 - 1:30 | Anti-Rug Hook | Blocked founder sell |
| 1:30 - 2:00 | Circle Treasury | USDC operations |
| 2:00 - 2:30 | DAO Dashboard | Governance UI |
| 2:30 - 3:00 | Summary | Tech stack + call to action |

---

## Detailed Script

### 0:00 - 0:30: Introduction

**Screen**: Landing page

**Narration**:
> "DAOs are powerful, but they're slow and risky. Founders can rug, treasuries are opaque, and identity is fragmented."
>
> "ConsulDAO changes that. We built an **Autonomous DAO Incubator** where AI agents launch, fund, and **protect** crypto projects."
>
> "Let me show you how."

**Action**: Click "Launch with AI Agent"

---

### 0:30 - 1:00: ENS Identity

**Screen**: Incubator chat interface

**Narration**:
> "First, every project gets an on-chain identity. Using **ENS**, we mint a subdomain for each project."

**Action**: Type "Start my project called DeFi Protocol"

**Narration**:
> "The AI agent creates a session and prepares the ENS subdomain: `defi-protocol.consul.eth`"

**Action**: Click "Mint ENS Identity"

**Show**: 
- Network switch to Sepolia
- Transaction confirmation
- Success message with Etherscan link

**Narration**:
> "This isn't just a name - it's an on-chain database. The project's metadata is stored in ENS text records, making it verifiable by anyone."

---

### 1:00 - 1:30: Anti-Rug Hook

**Screen**: (Can be simulated or show contract)

**Narration**:
> "Now here's the magic. When a project launches its token, we deploy it with our **AntiRugHook** - a Uniswap v4 hook that enforces vesting at the DEX level."

**Show**: AntiRugHook.sol code briefly

**Narration**:
> "Watch what happens when a founder tries to sell during the vesting period..."

**Action**: Attempt swap transaction

**Show**: Transaction REVERTS with error:
```
VestingPeriodActive(12960000) // 150 days remaining
```

**Narration**:
> "The transaction **fails**. The hook detected a founder sell during the cliff period and blocked it. This protection is built into the liquidity pool itself - impossible to bypass."

---

### 1:30 - 2:00: Circle Treasury

**Screen**: `/dao/funds` page

**Narration**:
> "All treasury operations use Circle's **USDC**. Here you can see real-time balances from the blockchain."

**Show**:
- USDC balance (live from contract)
- CONSUL held
- Total raised
- Total burned

**Narration**:
> "The DAO can also execute **buybacks** - swapping USDC for CONSUL and burning it to reduce supply."

**Action**: (If possible) Show buyback UI

**Narration**:
> "And with Circle's **CCTP**, we can bridge USDC to any supported chain - paying contractors wherever they are."

---

### 2:00 - 2:30: DAO Dashboard

**Screen**: `/dao` pages

**Narration**:
> "The DAO dashboard gives full visibility into governance."

**Show quickly**:
- `/dao` - Overview
- `/dao/governance` - Proposals
- `/dao/squads` - Team management
- `/dao/funds` - Treasury

**Narration**:
> "Squads manage operations, proposals go through voting, and the AI agent can automate routine decisions."

---

### 2:30 - 3:00: Summary

**Screen**: Landing page or architecture diagram

**Narration**:
> "ConsulDAO combines:"
> 
> "**ENS** for decentralized project identity..."
> 
> "**Uniswap v4** for trustless anti-rug protection..."
> 
> "**Circle** for transparent treasury management..."
> 
> "All orchestrated by AI agents."

**Show**: Tech stack logos

**Narration**:
> "From idea to launch in minutes. With protection built in."
>
> "ConsulDAO - The Autonomous DAO Incubator."

**End screen**: GitHub link + team info

---

## Recording Tips

1. **Resolution**: 1920x1080 or 2560x1440
2. **Browser**: Chrome with clean profile (no extensions visible)
3. **Wallet**: Pre-funded with testnet ETH/USDC
4. **Network**: Pre-connected to correct chains
5. **Audio**: Use good microphone, quiet room
6. **Pace**: Don't rush - 3 minutes is enough

## Assets Needed

- [ ] Sepolia ETH for ENS transaction
- [ ] Base Sepolia ETH for contract interactions
- [ ] Testnet USDC from faucet.circle.com
- [ ] Pre-created test project session
- [ ] Screen recording software (OBS, Loom, etc.)

## Post-Production

- [ ] Add captions (accessibility)
- [ ] Add subtle background music
- [ ] Add transition effects between sections
- [ ] Add text overlays for key points
- [ ] Export as MP4, upload to YouTube (unlisted)
- [ ] Add YouTube link to submission

