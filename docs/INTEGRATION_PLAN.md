# Integration Plan - ConsulDAO

## Current Status

| Integration | Status | What We Have | What's Missing |
|-------------|--------|--------------|----------------|
| ENS | 70% | `lib/ens.ts` utilities | Real minting transaction |
| Uniswap v4 | 60% | `AntiRugHook.sol` | Deploy + test on testnet |
| Circle/Arc | 50% | `lib/circle.ts` utilities | Real CCTP transfer |
| Yellow | 0% | Nothing | Full integration |
| LI.FI | 0% | Nothing | Full integration |

---

## Day-by-Day Plan

### Day 1: ENS + Uniswap v4

**Morning - ENS**

1. Use wagmi hooks for real ENS operations
2. Implement setTextRecord for project manifest
3. Show ENS resolution in chat interface

Resources:
- https://docs.ens.domains
- https://docs.ens.domains/web/records

**Afternoon - Uniswap v4**

1. Deploy AntiRugHook.sol to Base Sepolia
2. Create test pool with hook
3. Show founder sell blocking in demo

Resources:
- https://docs.uniswap.org/contracts/v4/overview
- https://github.com/uniswapfoundation/v4-template

---

### Day 2: Circle/Arc

1. Register at console.circle.com
2. Get testnet USDC from faucet.circle.com
3. Implement real USDC transfer
4. Add CCTP cross-chain (Base → Arbitrum)
5. Show treasury balance in UI

Resources:
- https://docs.arc.network/arc/concepts/welcome-to-arc
- https://developers.circle.com/wallets
- https://faucet.circle.com/

---

### Day 3: Yellow Network

1. Install Yellow SDK / Nitrolite
2. Create state channel between Agent and Founder
3. Implement off-chain micro-agreements
4. Show gasless operations in demo
5. On-chain settlement at session end

Resources:
- https://docs.yellow.org/docs/learn
- https://www.youtube.com/playlist?list=PL5Uk-e9pgXVldFAweILUcZjvaceTlgkKa
- https://yellow.com/apps

---

### Day 4: Demo Video + Polish

1. Record 3-minute demo
2. Show each integration working
3. Cleanup UI, fix bugs
4. Submit to ETHGlobal

---

## Demo Script (3 minutes)

```
0:00 - 0:30  "DAOs are slow. We made them Agentic."
             → Show landing page
             
0:30 - 1:00  ENS Identity
             → "Start my project" → xyz.consul.eth minted
             
1:00 - 1:30  Yellow Network Speed
             → Gasless micro-agreements (no wallet popups!)
             
1:30 - 2:00  Anti-Rug Hook
             → Try founder sell → BLOCKED
             
2:00 - 2:30  Circle Treasury
             → USDC balance, cross-chain payment
             
2:30 - 3:00  Summary
             → "From idea to launch in minutes"
```

---

## Prize Targets

| Integration | Track | Prize |
|-------------|-------|-------|
| Yellow | Best SDK Integration | $5,000 (1st) |
| Uniswap | Agentic Finance | $2,500 (1st) |
| Arc/Circle | Crosschain Financial | $5,000 (1st) |
| ENS | Integrate ENS | ~$500-1000 (pool) |
| ENS | Creative DeFi Use | $1,500 (1st) |
| **TOTAL** | | **~$14,500+** |

---

## Technical Priorities

### Priority 1 (MUST)

- [ ] Deploy AntiRugHook.sol
- [ ] Real ENS text records
- [ ] Circle USDC transfer

### Priority 2 (SHOULD)

- [ ] Yellow SDK integration
- [ ] Cross-chain CCTP demo

### Priority 3 (NICE TO HAVE)

- [ ] LI.FI integration
- [ ] Advanced UI polish

---

## Packages to Install

```bash
# Yellow Network (check exact package name in docs)
npm install @aspect-build/yellow-sdk

# LI.FI (optional)
npm install @lifi/sdk
```

---

## Documentation Links

### Yellow Network - $15,000

- Docs: https://docs.yellow.org/docs/learn
- Tutorials: https://www.youtube.com/playlist?list=PL5Uk-e9pgXVldFAweILUcZjvaceTlgkKa
- Example Apps: https://yellow.com/apps

### Uniswap v4 - $10,000

- Docs: https://docs.uniswap.org/contracts/v4/overview
- Template: https://github.com/uniswapfoundation/v4-template
- Course: https://updraft.cyfrin.io/courses/uniswap-v4
- OpenZeppelin Hooks: https://docs.openzeppelin.com/uniswap-hooks

### Arc/Circle - $10,000

- Arc Docs: https://docs.arc.network/arc/concepts/welcome-to-arc
- Quickstart: https://docs.arc.network/arc/tutorials/transfer-usdc-or-eurc
- Circle Signup: https://console.circle.com/signup
- Circle Wallets: https://developers.circle.com/wallets
- Circle Contracts: https://developers.circle.com/contracts
- Faucet: https://faucet.circle.com/
- Community: https://community.arc.network/home

### LI.FI - $6,000

- Docs: https://docs.li.fi/
- SDK: https://docs.li.fi/sdk/overview
- API: https://docs.li.fi/api-reference/introduction
- Example: https://docs.li.fi/introduction/user-flows-and-examples/end-to-end-example

### ENS - $5,000

- Docs: https://docs.ens.domains
- Text Records: https://docs.ens.domains/web/records
- Decentralized Websites: https://docs.ens.domains/dweb/intro

---

## Qualification Requirements Summary

### Yellow Network
- Use Yellow SDK / Nitrolite protocol
- Show off-chain transaction logic
- Deploy or simulate working prototype
- 2-3 minute demo video

### Uniswap v4
- TxID transactions (testnet/mainnet)
- GitHub repository
- README.md
- Demo video (max 3 min)

### Arc/Circle
- Functional MVP + architecture diagram
- Video demonstration
- GitHub/Replit repo link

### ENS
- Custom ENS code (not just RainbowKit)
- Functional demo (no hard-coded values)
- Video or live demo
- Open source on GitHub

### LI.FI
- Use LI.FI SDK/API for cross-chain action
- Support at least 2 EVM chains
- Working frontend
- GitHub repo + video demo

