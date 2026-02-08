# ConsulDAO - TODO List

**Last Updated**: 2026-02-08

## ✅ COMPLETED

### Smart Contracts
- [x] All 8 contracts deployed to Base Sepolia
- [x] AntiRugHook with vesting logic
- [x] HubDAO with governance
- [x] ConsulToken (ERC20Votes)
- [x] ConsulStaking with lock multipliers
- [x] Buyback mechanism
- [x] Fundraiser with refunds
- [x] Squads management
- [x] ProjectRegistry
- [x] Security audit fixes (all 4 High issues resolved)
- [x] Contract verification on Basescan

### Frontend
- [x] Landing page with Hero, Features, CTA
- [x] AI Incubator chat interface (`/incubator`)
- [x] DAO Dashboard (`/dao`, `/dao/governance`, `/dao/squads`, `/dao/funds`)
- [x] Navigation with DAO link
- [x] OnchainKit wallet integration
- [x] Responsive design

### Infrastructure
- [x] Multi-chain setup (Sepolia for ENS + Base Sepolia for contracts)
- [x] ENS utilities and hooks
- [x] Circle/USDC utilities
- [x] Agent tools (buyback, circle, uniswap)
- [x] Test suite (7 test files)
- [x] Deployment scripts
- [x] TypeScript strict mode fixes

---

## 🚀 PRIORITY 1 - MUST DO (Critical for prizes)

### ENS Integration ($5,000)
- [x] **Add network switching UI**
  - [x] Created `NetworkSwitcher` component
  - [x] Show current network badge in sidebar
  - [x] Prompt user to switch to Sepolia for ENS operations
  - [x] Handle network switch errors gracefully
- [x] **Integrate real ENS hook**
  - [x] Updated `useENS.ts` to use Sepolia Public Resolver
  - [x] Updated incubator to use `useENSRegistration`
  - [x] Added ENS success/error handling
- [x] **Demo ENS in incubator flow**
  - [x] Show ENS minting in chat interface
  - [x] Display minted subdomain (xyz.consul.eth)
  - [x] Show Etherscan link for transaction
- [ ] **Test ENS subdomain minting on Sepolia** (NEXT)
  - [ ] Get Sepolia testnet ETH from faucet
  - [ ] Test `useENSRegistration` hook
  - [ ] Verify text records are set correctly
  - [ ] Document transaction hashes

### Uniswap v4 ($10,000)
- [ ] **Document deployed AntiRugHook**
  - [ ] Get transaction hash from deployment
  - [ ] Show contract on Basescan
  - [ ] Explain vesting logic in README
- [ ] **Create test scenario**
  - [ ] Deploy test token
  - [ ] Create pool with AntiRugHook
  - [ ] Attempt founder sell → should REVERT
  - [ ] Document transaction showing blocked sell
- [ ] **Update README with TxIDs**

### Circle/Arc ($10,000)
- [ ] **Get Circle API key**
  - [ ] Register at console.circle.com
  - [ ] Add to .env.local
- [ ] **Implement USDC balance display**
  - [ ] Show treasury balance in `/dao/funds`
  - [ ] Real-time balance updates
- [ ] **Test USDC transfer**
  - [ ] Get testnet USDC from faucet.circle.com
  - [ ] Transfer to HubDAO treasury
  - [ ] Show transaction in UI
- [ ] **Architecture diagram** (required by Arc)
  - [ ] Create diagram showing USDC flow
  - [ ] Treasury → Buyback → Burn flow
  - [ ] Cross-chain CCTP (bonus)

### Demo Video ($$$)
- [ ] **Record 3-minute demo** (CRITICAL)
  - [ ] 0:00-0:30: Landing page + problem statement
  - [ ] 0:30-1:00: ENS minting (Sepolia)
  - [ ] 1:00-1:30: AntiRugHook blocking founder sell
  - [ ] 1:30-2:00: Circle treasury operations
  - [ ] 2:00-2:30: DAO dashboard
  - [ ] 2:30-3:00: Summary + tech stack
- [ ] **Edit and upload**
  - [ ] Add captions
  - [ ] Add music
  - [ ] Upload to YouTube (unlisted)
  - [ ] Add link to submission

---

## 🎯 PRIORITY 2 - SHOULD DO (Increases prize chances)

### Yellow Network ($15,000)
- [ ] Research Nitrolite SDK
- [ ] Install Yellow SDK
- [ ] Create state channel demo
- [ ] Show gasless micro-agreements
- [ ] Document in README

### Cross-Chain Demo
- [ ] Implement CCTP transfer (Base Sepolia → Arbitrum Sepolia)
- [ ] Show in UI
- [ ] Add to demo video

### Documentation
- [ ] Update IMPLEMENTATION_PLAN.md with completed items
- [ ] Update INTEGRATION_PLAN.md with actual status
- [ ] Add CROSS_CHAIN_SETUP.md to main README
- [ ] Create architecture diagram

---

## 💡 PRIORITY 3 - NICE TO HAVE

### LI.FI Integration ($6,000)
- [ ] Install LI.FI SDK
- [ ] Add cross-chain swap widget
- [ ] Support 2+ chains

### Agent Enhancements
- [ ] ERC-8004 Reputation contract
- [ ] Screening Agent with wallet analysis
- [ ] Treasury Monitor with alerts
- [ ] Action logging schema

### UI Polish
- [ ] Loading states
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Transaction history

---

## 📋 Submission Checklist

### ENS Prize
- [ ] Custom ENS code (not RainbowKit) ✅
- [ ] Functional demo with real transactions
- [ ] Video or live demo
- [ ] Open source on GitHub ✅

### Uniswap v4 Prize
- [ ] Hook implementation ✅
- [ ] TxID on testnet
- [ ] README.md ✅
- [ ] Demo video (max 3 min)

### Arc/Circle Prize
- [ ] Functional MVP ✅
- [ ] Architecture diagram
- [ ] Video demonstration
- [ ] GitHub repo ✅

### Yellow Network Prize
- [ ] Use Yellow SDK / Nitrolite
- [ ] Show off-chain logic
- [ ] Working prototype
- [ ] 2-3 min demo video

---

## 🔧 Technical Debt

- [ ] Add error handling to all hooks
- [ ] Add loading states to all async operations
- [ ] Add unit tests for utilities
- [ ] Add E2E tests for critical flows
- [ ] Optimize bundle size
- [ ] Add Sentry error tracking

---

## 📅 Timeline

**Today (Day 1)**:
- ✅ Multi-chain setup
- [ ] ENS testing on Sepolia
- [ ] Network switching UI
- [ ] Circle API key setup

**Day 2**:
- [ ] USDC integration
- [ ] AntiRugHook demo scenario
- [ ] Architecture diagram
- [ ] Start demo video

**Day 3**:
- [ ] Finish demo video
- [ ] Yellow Network (if time)
- [ ] Final testing
- [ ] Submit to ETHGlobal

