# ConsulDAO

**AI-Powered DAO Incubator on Base**

ConsulDAO is an autonomous incubator that helps Web3 founders launch projects on Base. Our AI agent guides you through the entire process - from creating your on-chain identity to deploying liquidity with built-in anti-rug protection.

## Features

- **AI Incubation Agent** - Autonomous agent that executes the complete launch flow
- **ENS Identity** - Automatic subdomain minting (yourproject.consul.eth)
- **USDC Treasury** - Cross-chain treasury management with Circle
- **Uniswap v4 Integration** - Token swaps and liquidity deployment
- **Anti-Rug Protection** - On-chain vesting enforced at the DEX level
- **$CONSUL Governance** - Stake tokens for voting power with lock multipliers
- **3-Squad Structure** - Admissions, Services, and Treasury Safes

## Governance Model

### $CONSUL Token

The governance token provides voting rights over DAO decisions:

| Feature | Details |
|---------|---------|
| Max Supply | 100,000,000 CONSUL |
| Standard | ERC20 + ERC20Votes |
| Decimals | 18 |

### Staking & Voting Power

Lock tokens to earn multiplied voting power (veConsul model):

| Lock Period | Multiplier |
|-------------|------------|
| None | 1.0x |
| 3 months | 1.25x |
| 6 months | 1.5x |
| 12 months | 2.0x |

### 3-Squad Safe Structure

| Squad | Purpose |
|-------|---------|
| Admissions | Decide which projects get incubated |
| Services | Execute work via agents & contractors |
| Treasury | Hold and manage DAO funds |

## How It Works

1. Connect your wallet and go to the Incubator
2. Tell the agent about your project
3. The agent executes the incubation steps:
   - Mints your ENS identity
   - Sets up your USDC treasury
   - Deploys your liquidity pool
   - Activates anti-rug protection
4. Your project is launched with on-chain safeguards

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI**: shadcn/ui
- **Wallet**: OnchainKit
- **Blockchain**: Base L2
- **Contracts**: Solidity 0.8.24, Hardhat

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/consuldao/consuldao.git
cd consuldao
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000 to see the app.

### Environment Variables

Create a `.env` file:

```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
NEXT_PUBLIC_HUB_DAO_ADDRESS=0x...
NEXT_PUBLIC_CONSUL_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_ADDRESS=0x...
```

## Project Structure

```
consuldao/
├── app/
│   ├── dao/              # DAO dashboard
│   │   ├── funds/        # Treasury management
│   │   ├── governance/   # Voting interface
│   │   └── squads/       # Squad management
│   ├── incubator/        # AI chat interface
│   └── api/agent/        # Agent API
├── contracts/
│   ├── ConsulToken.sol   # $CONSUL governance token
│   ├── ConsulStaking.sol # veConsul staking
│   ├── Buyback.sol       # Treasury buyback & burn
│   ├── HubDAO.sol        # Treasury & governance
│   ├── Squads.sol        # Squad management
│   └── AntiRugHook.sol   # Uniswap v4 hook
└── lib/
    ├── agent.ts          # Agent logic
    └── ens.ts            # ENS utilities
```

## Smart Contracts

### ConsulToken

ERC20 governance token with on-chain vote delegation:

- 100M max supply cap
- Owner-controlled minting
- Burnable for buyback mechanism

### ConsulStaking

Stake $CONSUL to earn veConsul voting power:

- Lock period multipliers (1x - 2x)
- Flexible or time-locked staking
- Voting power = staked × multiplier

### Buyback

Treasury buyback & burn mechanism:

- Swaps USDC → CONSUL via DEX
- Burns bought tokens
- Governance-controlled execution

### AntiRugHook

A Uniswap v4 hook that prevents founder token dumps during the vesting period:

- Cliff period: No sells allowed (configurable, default 6 months)
- Linear vesting: Gradual unlocking after cliff
- On-chain enforcement: Works at the DEX level

### HubDAO

Treasury contract for managing project funds:

- Quarterly budget proposals
- Staking-weighted voting
- Buyback integration
- Veto power mechanism

## Scripts

```bash
npm run dev              # Development
npm run build            # Build
npm run compile          # Compile contracts
npm run deploy:sepolia   # Deploy to Base Sepolia
npm run test             # Run tests
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Links

- Website: https://consuldao.xyz
- Twitter: https://twitter.com/consuldao
- Discord: https://discord.gg/consuldao

---

Built on Base
