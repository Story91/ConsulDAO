# ConsulDAO Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONSULDAO                                       │
│                     The Autonomous DAO Incubator                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────┐           ┌───────────────────┐
        │  Ethereum Sepolia │           │   Base Sepolia    │
        │      (ENS)        │           │   (Contracts)     │
        └─────────┬─────────┘           └─────────┬─────────┘
                  │                               │
    ┌─────────────┴─────────────┐   ┌─────────────┴─────────────┐
    │                           │   │                           │
    ▼                           ▼   ▼                           ▼
┌───────┐                   ┌───────────────────────────────────────┐
│  ENS  │                   │           Smart Contracts             │
│Registry                   ├───────────────────────────────────────┤
│       │                   │ ConsulToken │ HubDAO    │ Staking    │
│xyz.   │                   │ (ERC20Votes)│ (Treasury)│ (Lock)     │
│consul.│                   ├─────────────┼───────────┼────────────┤
│eth    │                   │ AntiRugHook │ Buyback   │ Fundraiser │
│       │                   │ (Uniswap v4)│ (Burn)    │ (USDC)     │
│       │                   ├─────────────┼───────────┼────────────┤
└───────┘                   │ Squads      │ Registry  │            │
                            │ (Teams)     │ (Projects)│            │
                            └─────────────┴───────────┴────────────┘
```

---

## Component Details

### Frontend Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js 15 App                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Landing    │  │  Incubator   │  │     DAO      │          │
│  │    Page      │  │    Chat      │  │  Dashboard   │          │
│  │     /        │  │  /incubator  │  │    /dao/*    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    OnchainKit Provider                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │   Wallet   │  │  Identity  │  │    Transaction     │  │   │
│  │  │  Connect   │  │   Avatar   │  │      Handler       │  │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Wagmi Hooks                          │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐            │   │
│  │  │  useENS   │  │useTreasury│  │useRegistry│            │   │
│  │  └───────────┘  └───────────┘  └───────────┘            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Smart Contract Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                    Base Sepolia Contracts                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    ConsulToken                           │    │
│  │  ERC20 + ERC20Votes + ERC20Permit + Burnable            │    │
│  │  - Governance voting power                               │    │
│  │  - Delegation support                                    │    │
│  │  - Permit for gasless approvals                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │   HubDAO      │  │ ConsulStaking │  │   Buyback     │       │
│  │  - Treasury   │  │  - Lock CONSUL│  │  - Swap USDC  │       │
│  │  - Proposals  │  │  - Multipliers│  │  - Burn CONSUL│       │
│  │  - Voting     │  │  - Voting pwr │  │  - Track stats│       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│          │                                     ▲                 │
│          ▼                                     │                 │
│  ┌───────────────┐                      ┌───────────────┐       │
│  │    Squads     │                      │  Fundraiser   │       │
│  │  - Team mgmt  │                      │  - USDC goals │       │
│  │  - Budgets    │                      │  - Refunds    │       │
│  │  - Roles      │                      │  - Finalize   │       │
│  └───────────────┘                      └───────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Uniswap v4 Integration                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    AntiRugHook                           │    │
│  │                                                          │    │
│  │  beforeSwap() ─┬─▶ Is founder selling?                  │    │
│  │                │   └─▶ YES: Check vesting               │    │
│  │                │       └─▶ Cliff active? → REVERT       │    │
│  │                │       └─▶ Over vested? → REVERT        │    │
│  │                │       └─▶ OK → Allow + track           │    │
│  │                └─▶ NO: Allow swap                        │    │
│  │                                                          │    │
│  │  Vesting: 6 month cliff + 12 month linear                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### USDC Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       USDC Treasury Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Contributors                                                  │
│         │                                                        │
│         │ USDC                                                   │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ Fundraiser  │◀─── Goal: 10,000 USDC                         │
│  │             │◀─── Deadline: 30 days                          │
│  └──────┬──────┘                                                │
│         │                                                        │
│         │ Forward (on success)                                   │
│         ▼                                                        │
│  ┌─────────────┐     Quarterly     ┌─────────────┐             │
│  │   HubDAO    │────Proposals────▶│   Voting    │             │
│  │  Treasury   │◀───────────────────────────────┘             │
│  └──────┬──────┘                                                │
│         │                                                        │
│    ┌────┴────┬────────────┐                                     │
│    │         │            │                                      │
│    ▼         ▼            ▼                                      │
│ ┌──────┐ ┌──────┐   ┌─────────┐                                │
│ │Squads│ │Buyback│   │  CCTP   │                                │
│ │Budget│ │       │   │ Bridge  │                                │
│ └──────┘ └───┬───┘   └────┬────┘                                │
│              │            │                                      │
│              ▼            ▼                                      │
│         ┌────────┐   ┌─────────┐                                │
│         │  DEX   │   │ Other   │                                │
│         │ (Swap) │   │ Chains  │                                │
│         └───┬────┘   └─────────┘                                │
│             │                                                    │
│             ▼                                                    │
│      ┌────────────┐                                             │
│      │  CONSUL    │                                             │
│      │  (Burned)  │ ← Reduces totalSupply                       │
│      └────────────┘                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### ENS Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENS Identity System                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Ethereum Sepolia                                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │     consul.eth (Parent Domain)                          │    │
│  │           │                                              │    │
│  │     ┌─────┴─────┬──────────────┬──────────────┐         │    │
│  │     │           │              │              │         │    │
│  │     ▼           ▼              ▼              ▼         │    │
│  │  project1   project2       project3       project4      │    │
│  │  .consul    .consul        .consul        .consul       │    │
│  │  .eth       .eth           .eth           .eth          │    │
│  │                                                          │    │
│  │  Each subdomain has text records:                        │    │
│  │  ├── consul.name        = "Project Name"                │    │
│  │  ├── consul.description = "Description..."              │    │
│  │  ├── consul.founder     = "0x..."                       │    │
│  │  ├── consul.stage       = "incubating"                  │    │
│  │  └── consul.manifest    = "ipfs://..."                  │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### AI Agent Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Incubator Agent                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Message                                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────┐                                                │
│  │   Parser    │──▶ Extract intent (start, status, action)     │
│  └──────┬──────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ Orchestrator│──▶ Manage session state                        │
│  └──────┬──────┘                                                │
│         │                                                        │
│    ┌────┴────┬────────┬────────┬────────┐                       │
│    │         │        │        │        │                        │
│    ▼         ▼        ▼        ▼        ▼                        │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│ │ ENS  │ │Circle│ │Uniswap│ │Yellow│ │Registry                 │
│ │Agent │ │Agent │ │Agent │ │Agent │ │Agent │                   │
│ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘                   │
│    │        │        │        │        │                         │
│    ▼        ▼        ▼        ▼        ▼                         │
│ [Mint    [Setup   [Deploy  [Open    [Register                   │
│  ENS]    Treasury] Pool]   Channel] Project]                    │
│                                                                  │
│                              │                                   │
│                              ▼                                   │
│                     ┌───────────────┐                           │
│                     │   Response    │                           │
│                     │   to User     │                           │
│                     └───────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Contract Addresses

| Contract | Base Sepolia Address |
|----------|---------------------|
| ConsulToken | `0xf1a699d7bbe80f21fad601920acdb7a8acfddf58` |
| HubDAO | `0x0104f0a251C08804fb8F568EB8FEd48503BAf9D5` |
| ConsulStaking | `0xfdAB9063e7B1C2FF32c4C4fFc7c33E0F5F9bB5D4` |
| Buyback | `0x75A606b73DdEba6e08F1a97478e5c2B01Ce4c0a0` |
| Fundraiser | `0xA93B4229bAb4E07614D0dB8927322c99b809283c` |
| Squads | `0xECc9A86e1b2c0A8a8d8e6A1b2c0A8a8d8e6A1b2c` |
| ProjectRegistry | `0x83C0dA3f37157dB4aE34f7e5E4c7Ed0b4E5F3A9d` |
| AntiRugHook | `0xDF2AC9680AA051059F56a863E8D6719228d71080` |

| External | Address |
|----------|---------|
| USDC (Circle) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Uniswap PoolManager | `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408` |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Wallet | OnchainKit (Coinbase) |
| State | Wagmi, TanStack Query |
| Contracts | Solidity 0.8.24, Hardhat |
| L2 | Base Sepolia |
| ENS | Ethereum Sepolia |
| Token | USDC (Circle) |

