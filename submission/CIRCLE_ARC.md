# Circle/Arc Integration - USDC Treasury

## 🎯 Prize Track: Arc/Circle ($10,000)

**Tracks**:
- Crosschain Financial Apps ($5,000)
- Global Payouts ($2,500)
- Agentic Commerce ($2,500)

---

## Overview

ConsulDAO uses **Circle's USDC** as the base currency for all treasury operations. The DAO manages funds, executes buybacks, and can bridge USDC cross-chain using **CCTP**.

---

## Deployed Contracts (Base Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Circle's testnet USDC |
| HubDAO | `0x0104f0a251C08804fb8F568EB8FEd48503BAf9D5` | Treasury management |
| Buyback | `0x75A606b73DdEba6e08F1a97478e5c2B01Ce4c0a0` | USDC → CONSUL buybacks |
| Fundraiser | `0xA93B4229bAb4E07614D0dB8927322c99b809283c` | USDC fundraising |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ConsulDAO Treasury                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐       ┌──────────────┐                    │
│  │ Contributors │──USDC─▶│  Fundraiser  │                   │
│  └──────────────┘       └──────┬───────┘                    │
│                                │                             │
│                          Forward USDC                        │
│                                │                             │
│                                ▼                             │
│                        ┌──────────────┐                     │
│                        │   HubDAO     │◀──── Quarterly      │
│                        │  Treasury    │      Budgets        │
│                        └──────┬───────┘                     │
│                               │                              │
│              ┌────────────────┼────────────────┐            │
│              │                │                │            │
│              ▼                ▼                ▼            │
│       ┌──────────┐    ┌──────────┐    ┌──────────┐        │
│       │  Squads  │    │  Buyback │    │   CCTP   │        │
│       │ (Budget) │    │  & Burn  │    │ (Bridge) │        │
│       └──────────┘    └────┬─────┘    └────┬─────┘        │
│                            │                │              │
│                            ▼                ▼              │
│                       ┌────────┐      ┌─────────┐         │
│                       │ DEX    │      │ Other   │         │
│                       │(Swap)  │      │ Chains  │         │
│                       └────┬───┘      └─────────┘         │
│                            │                               │
│                            ▼                               │
│                     ┌────────────┐                        │
│                     │ CONSUL     │                        │
│                     │ (Burned)   │                        │
│                     └────────────┘                        │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## USDC Flows

### 1. Fundraising

Contributors deposit USDC to fund projects:

```solidity
// Fundraiser.sol
function contribute(uint256 amount) external {
    require(isLive && !finalized, "Not active");
    require(block.timestamp <= deadline, "Deadline passed");
    
    contributionToken.safeTransferFrom(msg.sender, address(this), amount);
    contributions[msg.sender] += amount;
    totalRaised += amount;
}
```

**Features**:
- Goal-based fundraising
- Deadline enforcement
- Refunds if goal not met
- Finalization protection

### 2. Treasury Management

HubDAO allocates funds via governance:

```solidity
// HubDAO.sol
function proposeQuarterlyBudget(uint256 amount, string calldata description) external {
    require(amount <= treasuryToken.balanceOf(address(this)), "Insufficient");
    // Create governance proposal
}

function allocateSquadBudget(uint256 squadId, uint256 amount) external onlyOwner {
    treasuryToken.safeTransfer(squadsContract, amount);
    ISquads(squadsContract).fundSquadBudget(squadId, amount);
}
```

### 3. Buyback & Burn

Treasury uses USDC to buy and burn CONSUL:

```solidity
// Buyback.sol
function executeBuyback(uint256 usdcAmount, uint256 minConsulOut) external onlyHubDao {
    // Swap USDC → CONSUL via DEX
    uint256 consulBought = _executeSwap(usdcAmount, minConsulOut);
    
    // Burn CONSUL (reduces totalSupply!)
    IERC20Burnable(address(consulToken)).burn(consulBought);
    
    totalBuybackSpent += usdcAmount;
    totalBurned += consulBought;
}
```

**Security**: Uses real `burn()` function, not transfer to dead address.

---

## Cross-Chain (CCTP)

Circle's Cross-Chain Transfer Protocol enables native USDC bridging.

### Supported Chains

| Chain | Domain ID |
|-------|-----------|
| Ethereum | 0 |
| Avalanche | 1 |
| Optimism | 2 |
| Arbitrum | 3 |
| **Base** | **6** |
| Polygon | 7 |

### Transfer Flow

```typescript
// 1. Approve USDC
await usdc.approve(CCTP_TOKEN_MESSENGER, amount);

// 2. Burn on source chain
await tokenMessenger.depositForBurn(
    amount,
    CCTP_DOMAINS.arbitrum,  // destination
    recipientBytes32,
    usdcAddress
);

// 3. Wait for attestation (~15 min)
// 4. Mint on destination (automatic)
```

### Use Cases

1. **Cross-Chain Payroll**: Pay contractors on their preferred chain
2. **Multi-Chain Treasury**: Diversify across chains
3. **Arbitrage Protection**: Move funds to cheapest chain

---

## Frontend Integration

### Real-Time Treasury Display

```typescript
// hooks/useTreasury.ts
export function useTreasuryBalance() {
    const { data } = useReadContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [HUB_DAO_ADDRESS],
        chainId: baseSepolia.id,
    });
    
    return formatUSDC(data);
}
```

### Live at `/dao/funds`

- Treasury USDC balance
- CONSUL held
- Total raised
- Total burned
- Buyback history

---

## Transaction Proofs

| Action | TxHash | Status |
|--------|--------|--------|
| USDC Deposit to Treasury | [TBD] | ⏳ |
| Buyback Execution | [TBD] | ⏳ |
| CCTP Transfer | [TBD] | ⏳ |

---

## Prize Requirements Checklist

### Crosschain Financial Apps ($5,000)
| Requirement | Status |
|-------------|--------|
| ✅ Use Arc as liquidity hub | HubDAO Treasury |
| ✅ USDC as base currency | All contracts use USDC |
| ⏳ CCTP demo | Pending |

### Global Payouts ($2,500)
| Requirement | Status |
|-------------|--------|
| ✅ Treasury system | HubDAO + Squads |
| ✅ Budget allocations | Squad funding |
| ⏳ Cross-chain payments | Pending |

### Agentic Commerce ($2,500)
| Requirement | Status |
|-------------|--------|
| ✅ Agent-driven buyback | Auto-propose on price drop |
| ✅ Treasury monitoring | Balance tracking |
| ⏳ Automated actions | Pending |

### Required Deliverables
| Requirement | Status |
|-------------|--------|
| ✅ Functional MVP | Deployed contracts |
| ✅ Architecture diagram | Above |
| ⏳ Video demonstration | Pending |
| ✅ GitHub repo | Open source |

---

## Files

| File | Description |
|------|-------------|
| `contracts/HubDAO.sol` | Treasury management |
| `contracts/Buyback.sol` | USDC→CONSUL swap & burn |
| `contracts/Fundraiser.sol` | USDC fundraising |
| `lib/circle.ts` | USDC utilities |
| `hooks/useTreasury.ts` | React hooks for treasury |

---

## Resources

- [Circle Faucet](https://faucet.circle.com/) - Get testnet USDC
- [CCTP Docs](https://developers.circle.com/stablecoins/cctp)
- [Arc Docs](https://docs.arc.network/)
- [Base Sepolia USDC](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e)

