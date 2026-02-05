# ConsulDAO

**AI-Powered DAO Incubator on Base**

ConsulDAO is an autonomous incubator that helps Web3 founders launch projects on Base. Our AI agent guides you through the entire process - from creating your on-chain identity to deploying liquidity with built-in anti-rug protection.

## Features

- **AI Incubation Agent** - Autonomous agent that executes the complete launch flow
- **ENS Identity** - Automatic subdomain minting (yourproject.consul.eth)
- **USDC Treasury** - Cross-chain treasury management with Circle
- **Uniswap v4 Integration** - Token swaps and liquidity deployment
- **Anti-Rug Protection** - On-chain vesting enforced at the DEX level via Uniswap v4 hook
- **$CONSUL Governance** - Stake tokens for voting power with lock multipliers
- **3-Squad Structure** - Admissions, Services, and Treasury Safes
- **Public Fundraising** - Goal-based fundraising with automatic refunds on failure
- **On-Chain Project Registry** - ENS-like project identity and metadata storage

## Governance Model

### $CONSUL Token

The governance token provides voting rights over DAO decisions:

| Feature | Details |
|---------|---------|
| Max Supply | 100,000,000 CONSUL |
| Standard | ERC20 + ERC20Votes + ERC20Burnable |
| Decimals | 18 |

### Staking & Voting Power

Lock tokens to earn multiplied voting power (veConsul model):

| Lock Period | Multiplier |
|-------------|------------|
| None | 1.0x |
| 3 months | 1.25x |
| 6 months | 1.5x |
| 12 months | 2.0x |

Multipliers decay to 1x after the lock period expires.

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
- **Wallet**: OnchainKit (Coinbase)
- **Blockchain**: Base L2
- **Contracts**: Solidity 0.8.24, Hardhat, OpenZeppelin v5

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
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_deployer_private_key
BASESCAN_API_KEY=your_basescan_api_key
```

## Project Structure

```
consuldao/
├── app/
│   ├── dao/                # DAO dashboard
│   │   ├── funds/          # Treasury management
│   │   ├── governance/     # Voting interface
│   │   └── squads/         # Squad management
│   ├── incubator/          # AI chat interface
│   └── api/agent/          # Agent API
├── contracts/
│   ├── ConsulToken.sol     # $CONSUL governance token
│   ├── ConsulStaking.sol   # veConsul staking
│   ├── HubDAO.sol          # Treasury & governance
│   ├── Buyback.sol         # Treasury buyback & burn
│   ├── Squads.sol          # Squad management & tasks
│   ├── AntiRugHook.sol     # Uniswap v4 anti-rug hook
│   ├── ProjectRegistry.sol # On-chain project registry
│   ├── Fundraiser.sol      # Public fundraising
│   └── test/
│       └── MockSwapRouter.sol # Mock DEX router for tests
├── test/
│   ├── ConsulToken.test.ts
│   ├── ConsulStaking.test.ts
│   ├── HubDAO.test.ts
│   ├── Buyback.test.ts
│   ├── Squads.test.ts
│   ├── ProjectRegistry.test.ts
│   └── Fundraiser.test.ts
├── lib/
│   ├── agent.ts            # Agent logic
│   └── ens.ts              # ENS utilities
└── docs/
    └── SECURITY_AUDIT.md   # Security audit report
```

## Smart Contracts

### ConsulToken

ERC20 governance token with on-chain vote delegation:

- 100M max supply cap
- Owner-controlled minting with one-time initial mint
- Burnable for buyback mechanism (reduces totalSupply)
- ERC20Votes for delegation and voting snapshots

### ConsulStaking

Stake $CONSUL to earn veConsul voting power:

- Lock period multipliers (1x - 2x)
- Flexible or time-locked staking
- Voting power = staked x multiplier
- Multiplier decays to 1x after lock expiry

### HubDAO

Treasury contract for managing project funds:

- Quarterly budget proposals with vote-weighted governance
- Vote power snapshots at proposal time (prevents flash-stake attacks)
- Squad budget allocation and buyback integration
- Veto power mechanism for emergency governance

### Buyback

Treasury buyback & burn mechanism:

- Swaps USDC -> CONSUL via Uniswap V3 router
- Burns bought tokens (real ERC20Burnable.burn, reduces totalSupply)
- Governance-controlled execution through HubDAO
- Configurable pool fee tiers (0.01%, 0.05%, 0.3%, 1%)

### AntiRugHook

A Uniswap v4 hook that prevents founder token dumps during the vesting period:

- Cliff period: No sells allowed (configurable)
- Linear vesting: Gradual unlocking after cliff
- On-chain enforcement: Works at the DEX level
- Founder detection via both direct sender and tx.origin

### Squads

Manages specialized squads and their tasks:

- Squad types: General, Admissions, Services, Treasury
- Member management with add/remove
- Task creation, assignment, and completion tracking
- Budget allocation from HubDAO

### ProjectRegistry

On-chain registry for incubated projects (ENS-like):

- Register project name (up to 32 bytes) with JSON manifest
- Founder-controlled manifest updates
- Project ownership transfer with list bookkeeping
- Name availability checks

### Fundraiser

Public fundraising with goal-based mechanics:

- Configurable goal amount and deadline
- ERC20 contributions (e.g., USDC)
- Automatic refunds if goal not met after deadline
- Funds forwarded to treasury on success

## Testing

145 tests covering all 7 contracts:

```bash
npm run compile    # Compile contracts
npm run test       # Run test suite
```

| Contract | Tests |
|----------|-------|
| ConsulToken | 11 |
| ConsulStaking | 21 |
| HubDAO | 22 |
| Buyback | 17 |
| Squads | 17 |
| ProjectRegistry | 13 |
| Fundraiser | 18 |

## Security

Two rounds of security audits have been performed. See [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md) for the full report.

Key security measures:
- ReentrancyGuard on all state-changing external functions
- SafeERC20 for all token transfers
- Zero-address validation on all constructors and setters
- Vote power snapshots to prevent flash-stake governance attacks
- Budget spend tracking to prevent multi-drain
- Lock multiplier decay after expiry

## Scripts

```bash
npm run dev              # Development server
npm run build            # Build frontend
npm run compile          # Compile contracts
npm run test             # Run test suite
npm run deploy:sepolia   # Deploy to Base Sepolia
npm run deploy:base      # Deploy to Base Mainnet
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
