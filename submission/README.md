# ConsulDAO - ETHGlobal Hackathon Submission

> **The Autonomous DAO Incubator** - AI agents that launch, fund, and protect crypto projects.

## 🎯 What We Built

ConsulDAO is a **vertical slice** of an autonomous DAO platform. An AI Agent guides founders through the complete project lifecycle: identity creation, treasury setup, and token launch with built-in anti-rug protection.

### Live Demo
- **URL**: [Coming soon]
- **Network**: Base Sepolia + Ethereum Sepolia (ENS)

### Video Demo
- **YouTube**: [Coming soon - 3 min demo]

---

## 🏆 Prize Tracks

| Sponsor | Track | Prize Pool | Our Integration |
|---------|-------|------------|-----------------|
| 🦄 **Uniswap** | v4 Hooks | $10,000 | AntiRugHook - On-chain vesting at DEX level |
| 🔵 **Arc/Circle** | Crosschain Financial | $10,000 | USDC Treasury + CCTP |
| 🔷 **ENS** | Integrate ENS | $5,000 | Subdomain identity (xyz.consul.eth) |
| 🟡 **Yellow** | Best SDK Integration | $15,000 | [Bonus if time] |

---

## 📂 Submission Structure

```
submission/
├── README.md              ← You are here
├── UNISWAP_V4.md          ← Uniswap v4 Hook details
├── CIRCLE_ARC.md          ← Circle/Arc integration
├── ENS_INTEGRATION.md     ← ENS subdomain minting
├── ARCHITECTURE.md        ← System architecture diagram
└── DEMO_SCRIPT.md         ← Demo video script
```

---

## 🔗 Quick Links

### Deployed Contracts (Base Sepolia)

| Contract | Address | Basescan |
|----------|---------|----------|
| ConsulToken | `0xf1a6...` | [View](https://sepolia.basescan.org/address/0xf1a699d7bbe80f21fad601920acdb7a8acfddf58) |
| HubDAO | `0x0104...` | [View](https://sepolia.basescan.org/address/0x0104f0a251C08804fb8F568EB8FEd48503BAf9D5) |
| AntiRugHook | `0xDF2A...` | [View](https://sepolia.basescan.org/address/0xDF2AC9680AA051059F56a863E8D6719228d71080) |
| Buyback | `0x75A6...` | [View](https://sepolia.basescan.org/address/0x75A606b73DdEba6e08F1a97478e5c2B01Ce4c0a0) |
| Fundraiser | `0xA93B...` | [View](https://sepolia.basescan.org/address/0xA93B4229bAb4E07614D0dB8927322c99b809283c) |

### Transaction Proofs

| Action | TxHash | Description |
|--------|--------|-------------|
| Contract Deployment | [TBD] | All 8 contracts deployed |
| ENS Minting | [TBD] | Subdomain creation on Sepolia |
| AntiRugHook Block | [TBD] | Founder sell attempt blocked |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Wallet | OnchainKit (Coinbase) |
| Contracts | Solidity 0.8.24, Hardhat |
| L2 | Base Sepolia |
| ENS | Ethereum Sepolia |
| Token | USDC (Circle) |

---

## 🚀 How to Run

```bash
# Clone
git clone https://github.com/[your-repo]/ConsulDAO

# Install
cd ConsulDAO && npm install

# Configure
cp .env.example .env.local
# Add your NEXT_PUBLIC_ONCHAINKIT_API_KEY

# Run
npm run dev
```

---

## 👥 Team

- **Founder**: [Your Name]
- **GitHub**: [Your GitHub]

---

## 📄 License

MIT

