# Integration Guides - HackMoney 2026

Quick reference for prize-winning integrations in ConsulDAO.

---

## 1. ENS Integration - $5,000

### What We Built
- **Subdomain generation**: `projectname.consul.eth`
- **Text records**: Store project manifest (name, description, stage, founder)
- **Utilities**: `lib/ens.ts`

### Key Code

```typescript
// lib/ens.ts
import { generateProjectSubdomain, createProjectManifest, ENS_RECORD_KEYS } from "@/lib/ens";

// Generate subdomain
const subdomain = generateProjectSubdomain("My Project");
// → "my-project.consul.eth"

// Create manifest for text record
const manifest = createProjectManifest({
  name: "My Project",
  description: "A DeFi protocol",
  founder: "0x...",
  stage: "applied"
});
```

### Prize Requirements ✅
- [x] Custom ENS code (not just RainbowKit)
- [x] Functional demo
- [x] Open source on GitHub
- [ ] Video recording

### Docs
- https://docs.ens.domains
- https://docs.ens.domains/web/records

---

## 2. Uniswap v4 - $10,000

### What We Built
- **AntiRugHook.sol**: Prevents founder token dumps during vesting
- **Vesting logic**: Cliff period + linear vesting
- **Events**: VestingInitialized, FounderSellBlocked, TokensReleased

### Key Code

```solidity
// contracts/AntiRugHook.sol
function beforeSwap(
    address sender,
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    bytes calldata
) external override returns (bytes4, BeforeSwapDelta, uint24) {
    // If sender is founder and selling during vesting → REVERT
    if (sender == config.founder && isSelling) {
        if (timeElapsed < config.cliffDuration) {
            revert VestingPeriodActive(timeRemaining);
        }
    }
    // ...
}
```

### Prize Requirements ✅
- [x] Uniswap v4 Hook implementation
- [x] beforeSwap hook logic
- [x] README.md
- [ ] TxID transactions on testnet
- [ ] Demo video (max 3 min)

### Docs
- https://docs.uniswap.org/contracts/v4/overview
- https://github.com/uniswapfoundation/v4-template

---

## 3. Arc/Circle - $10,000

### What We Built
- **USDC addresses**: All supported chains
- **CCTP utilities**: Cross-chain transfer helpers
- **Payment types**: Invoice, Payment, Treasury
- **Utilities**: `lib/circle.ts`

### Key Code

```typescript
// lib/circle.ts
import { 
  USDC_ADDRESSES, 
  CCTP_TOKEN_MESSENGER,
  createPaymentRequest,
  formatUSDC 
} from "@/lib/circle";

// Get USDC address
const usdc = USDC_ADDRESSES.base; // 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

// Create cross-chain payment
const payment = createPaymentRequest({
  from: "0x...",
  to: "0x...",
  amount: "1000.00",
  sourceChain: "base",
  destinationChain: "arbitrum"
});
```

### Prize Tracks
1. **Crosschain Financial Apps** ($5,000) - Using Arc as liquidity hub
2. **Global Payouts** ($2,500) - Treasury systems with USDC
3. **Agentic Commerce** ($2,500) - RWA-backed agents

### Docs
- https://docs.arc.network/arc/concepts/welcome-to-arc
- https://developers.circle.com/gateway
- https://faucet.circle.com/

---

## 4. Yellow Network - $15,000 (BONUS)

### Status: Not Yet Implemented

### Planned Features
- State channels for micro-agreements
- Gasless off-chain operations
- Session-based signing

### Integration Points
- SDK: Yellow SDK / Nitrolite protocol
- Use Case: Instant, session-based transactions

### Docs
- https://docs.yellow.org/docs/learn
- https://yellow.com/apps

---

## 5. Base & OnchainKit ✅ INTEGRATED

### Already Configured
- ✅ OnchainKitProvider in `app/rootProvider.tsx`
- ✅ MiniKit enabled for Farcaster
- ✅ Base chain configured
- ✅ Wallet component ready

### Available Components
- Wallet, Transaction, Swap, Identity, Checkout, Earn, Fund, Mint, Token

### Docs
- https://docs.base.org/onchainkit

---

## Quick Start Checklist

### Day 1: ENS + Contracts
- [ ] Deploy HubDAO to Base Sepolia
- [ ] Deploy AntiRugHook to Base Sepolia
- [ ] Test ENS subdomain minting

### Day 2: Circle Integration
- [ ] Get Circle API key from console.circle.com
- [ ] Test USDC transfers on testnet
- [ ] Implement treasury balance display

### Day 3: Demo & Video
- [ ] Record demo video (3 min max)
- [ ] Show ENS minting
- [ ] Show Anti-Rug Hook blocking founder sell
- [ ] Show treasury operations

### Bonus: Yellow Network
- [ ] Integrate Nitrolite SDK
- [ ] Open state channel
- [ ] Show gasless micro-agreements

---

## Environment Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Compile contracts
npm run compile

# Deploy to Base Sepolia
npm run deploy:sepolia
```

### Required Environment Variables

```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key_here
NEXT_PUBLIC_HUB_DAO_ADDRESS=0x...
NEXT_PUBLIC_ANTI_RUG_HOOK_ADDRESS=0x...
CIRCLE_API_KEY=your_circle_key
```
