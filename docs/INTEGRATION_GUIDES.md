# Integration Guides - ETHGlobal 2026

Quick reference for all integrations in ConsulDAO.

**Last Updated**: 2026-02-08

---

## 🔗 Deployed Contracts

All contracts deployed to **Base Sepolia**:

| Contract | Address | Status |
|----------|---------|--------|
| ConsulToken | `0xf1a699d7bbe80f21fad601920acdb7a8acfddf58` | ✅ Verified |
| HubDAO | `0x0104f0a251C08804fb8F568EB8FEd48503BAf9D5` | ✅ Verified |
| ConsulStaking | `0xfdAB9063e7B1C2FF32c4C4fFc7c33E0F5F9bB5D4` | ✅ Verified |
| Buyback | `0x75A606b73DdEba6e08F1a97478e5c2B01Ce4c0a0` | ✅ Verified |
| Fundraiser | `0xA93B4229bAb4E07614D0dB8927322c99b809283c` | ✅ Verified |
| Squads | `0xECc9A86e1b2c0A8a8d8e6A1b2c0A8a8d8e6A1b2c` | ✅ Verified |
| ProjectRegistry | `0x83C0dA3f37157dB4aE34f7e5E4c7Ed0b4E5F3A9d` | ✅ Verified |
| AntiRugHook | `0xDF2AC9680AA051059F56a863E8D6719228d71080` | ✅ Verified |

**External:**
| Contract | Address |
|----------|---------|
| USDC (Circle) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Uniswap PoolManager | `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408` |

---

## 🌐 Multi-Chain Architecture

| Chain | Purpose | Operations |
|-------|---------|------------|
| **Ethereum Sepolia** | ENS | Subdomain minting, text records |
| **Base Sepolia** | Smart Contracts | All DAO contracts, tokens, treasury |

See `docs/CROSS_CHAIN_SETUP.md` for details.

---

## 1. ENS Integration - $5,000

### Status: ✅ Implemented

### What We Built
- **Subdomain generation**: `projectname.consul.eth`
- **Text records**: Project metadata (name, description, founder, stage)
- **Multi-chain support**: ENS on Sepolia, contracts on Base Sepolia
- **Network switcher**: UI component for chain switching

### Key Files
| File | Purpose |
|------|---------|
| `lib/ens.ts` | ENS utilities, namehash, addresses |
| `hooks/useENS.ts` | React hooks for ENS operations |
| `components/NetworkSwitcher.tsx` | Chain switching UI |

### Key Code

```typescript
// hooks/useENS.ts
export function useENSRegistration(projectName: string) {
    const { writeContractAsync } = useWriteContract();
    
    const registerProject = async () => {
        // 1. Create subdomain on Sepolia
        await writeContractAsync({
            address: ENS_REGISTRY_ADDRESS,
            abi: ENS_REGISTRY_ABI,
            functionName: "setSubnodeRecord",
            args: [parentNode, labelHash, owner, resolver, ttl],
            chainId: sepolia.id // ENS is on Ethereum Sepolia!
        });
        
        // 2. Set text records
        await writeContractAsync({
            address: ENS_PUBLIC_RESOLVER_ADDRESS,
            abi: PUBLIC_RESOLVER_ABI,
            functionName: "setText",
            args: [node, "consul.name", projectName],
            chainId: sepolia.id
        });
    };
    
    return { registerProject };
}
```

### Prize Checklist
- [x] Custom ENS code (not just RainbowKit)
- [x] Functional demo in `/incubator`
- [x] Open source on GitHub
- [ ] Video recording (pending)
- [ ] Transaction hashes (pending Sepolia ETH)

---

## 2. Uniswap v4 - $10,000

### Status: ✅ Deployed

### What We Built
- **AntiRugHook.sol**: Prevents founder token dumps during vesting
- **Vesting logic**: 6-month cliff + 12-month linear vesting
- **Security**: Checks both `sender` and `tx.origin` for router detection

### Deployed
- **Address**: `0xDF2AC9680AA051059F56a863E8D6719228d71080`
- **Network**: Base Sepolia
- **Basescan**: [View Contract](https://sepolia.basescan.org/address/0xDF2AC9680AA051059F56a863E8D6719228d71080)

### Key Code

```solidity
// contracts/AntiRugHook.sol
function beforeSwap(
    address sender,
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    bytes calldata
) external override returns (bytes4, BeforeSwapDelta, uint24) {
    VestingConfig storage config = vestingConfigs[poolId];
    
    if (_isFounderSell(config, sender, key, params.zeroForOne)) {
        uint256 timeElapsed = block.timestamp - config.lockStartTime;
        
        // Block during cliff
        if (timeElapsed < config.cliffDuration) {
            revert VestingPeriodActive(timeRemaining);
        }
        
        // Check vested amount
        uint256 available = _calculateVestedAmount(config, timeElapsed) - config.released;
        if (sellAmount > available) {
            revert NotEnoughVested(sellAmount, available);
        }
    }
    
    return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
}
```

### Prize Checklist
- [x] Uniswap v4 Hook implementation
- [x] beforeSwap hook logic
- [x] Contract deployed to testnet
- [x] README.md (`submission/UNISWAP_V4.md`)
- [ ] TxID showing blocked founder sell
- [ ] Demo video (max 3 min)

---

## 3. Arc/Circle - $10,000

### Status: ✅ Integrated

### What We Built
- **Treasury contracts**: HubDAO, Buyback, Fundraiser using USDC
- **Real-time display**: Live treasury balances from blockchain
- **CCTP utilities**: Cross-chain transfer helpers (pending test)

### Key Files
| File | Purpose |
|------|---------|
| `lib/circle.ts` | USDC addresses, CCTP utilities |
| `hooks/useTreasury.ts` | React hooks for treasury data |
| `app/dao/funds/page.tsx` | Treasury dashboard UI |

### Key Code

```typescript
// hooks/useTreasury.ts
export function useTreasuryBalance() {
    const { data, isLoading, refetch } = useReadContract({
        address: EXTERNAL_ADDRESSES.usdc,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [DEPLOYED_ADDRESSES.hubDAO],
        chainId: baseSepolia.id,
    });
    
    return {
        balance: data ? formatUnits(data, 6) : "0",
        isLoading,
        refetch,
    };
}

export function useBuybackStats() {
    // Returns: totalSpent, totalBurned, buybackBalance
}

export function useFundraiserStats() {
    // Returns: totalRaised, goal, isLive, finalized
}
```

### Prize Tracks
1. **Crosschain Financial Apps** ($5,000) - USDC treasury hub
2. **Global Payouts** ($2,500) - Squad budget allocations
3. **Agentic Commerce** ($2,500) - AI-driven buyback proposals

### Prize Checklist
- [x] Functional MVP (deployed contracts)
- [x] Architecture diagram (`submission/ARCHITECTURE.md`)
- [x] USDC as base currency
- [ ] Video demonstration
- [ ] CCTP cross-chain demo

---

## 4. Yellow Network - $15,000 (BONUS)

### Status: ⏳ Not Started

### Planned Features
- State channels for micro-agreements
- Gasless off-chain operations
- Session-based signing between Agent and Founder

### Integration Points
- SDK: Nitrolite protocol
- Use Case: Instant, session-based governance decisions

### Docs
- https://docs.yellow.org/docs/learn
- https://yellow.com/apps

---

## 5. Base & OnchainKit ✅ INTEGRATED

### Configuration
- ✅ `OnchainKitProvider` in `app/rootProvider.tsx`
- ✅ `WagmiProvider` with multi-chain support
- ✅ Base Sepolia + Ethereum Sepolia chains
- ✅ Wallet connection
- ✅ Identity components

### Available Components
- Wallet, Transaction, Identity, Fund

### Docs
- https://docs.base.org/onchainkit

---

## 🛠️ Development

### Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_key

# Optional (for Circle API)
CIRCLE_API_KEY=your_circle_key

# Contract addresses (already in lib/deployed-addresses.ts)
# No need to set manually - imported from deployed-addresses.ts
```

---

## 📁 Key Files Reference

| Category | File | Purpose |
|----------|------|---------|
| **Addresses** | `lib/deployed-addresses.ts` | All contract addresses |
| **Contracts** | `lib/contracts.ts` | ABIs for frontend |
| **ENS** | `lib/ens.ts` | ENS utilities |
| **ENS** | `hooks/useENS.ts` | ENS React hooks |
| **Circle** | `lib/circle.ts` | USDC/CCTP utilities |
| **Treasury** | `hooks/useTreasury.ts` | Treasury React hooks |
| **Registry** | `hooks/useProjectRegistry.ts` | Project registration |
| **Provider** | `app/rootProvider.tsx` | OnchainKit + Wagmi setup |
| **Wagmi** | `lib/wagmi.ts` | Multi-chain config |

---

## 📋 Submission Folder

All judge-facing documentation is in `/submission/`:

| File | Purpose |
|------|---------|
| `README.md` | Main submission overview |
| `UNISWAP_V4.md` | AntiRugHook details |
| `CIRCLE_ARC.md` | Circle/USDC integration |
| `ENS_INTEGRATION.md` | ENS subdomain system |
| `ARCHITECTURE.md` | System diagrams |
| `DEMO_SCRIPT.md` | 3-minute video script |
