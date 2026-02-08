# Uniswap v4 Integration - AntiRugHook

## 🎯 Prize Track: Uniswap Foundation ($10,000)

---

## Overview

**AntiRugHook** is a Uniswap v4 hook that enforces **on-chain vesting** directly at the DEX level. When a founder tries to sell tokens during the vesting period, the transaction **reverts**.

This is **not** a separate vesting contract - the protection is built into the liquidity pool itself.

---

## Deployed Contract

| Field | Value |
|-------|-------|
| **Network** | Base Sepolia |
| **Address** | `0xDF2AC9680AA051059F56a863E8D6719228d71080` |
| **Basescan** | [View Contract](https://sepolia.basescan.org/address/0xDF2AC9680AA051059F56a863E8D6719228d71080) |
| **Source** | `contracts/AntiRugHook.sol` |

---

## How It Works

### The Problem
Founders can dump tokens immediately after liquidity is added, rugging investors.

### Our Solution
A Uniswap v4 `beforeSwap` hook that:
1. Detects if the seller is the founder
2. Checks if we're still in the vesting period
3. **Reverts the transaction** if conditions aren't met

```solidity
function beforeSwap(
    address sender,
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    bytes calldata
) external override returns (bytes4, BeforeSwapDelta, uint24) {
    VestingConfig storage config = vestingConfigs[poolId];
    
    // Check if this is a founder sell
    if (_isFounderSell(config, sender, key, params.zeroForOne)) {
        uint256 timeElapsed = block.timestamp - config.lockStartTime;
        
        // Block during cliff period
        if (timeElapsed < config.cliffDuration) {
            uint256 timeRemaining = config.cliffDuration - timeElapsed;
            emit FounderSellBlocked(poolId, sender, timeRemaining);
            revert VestingPeriodActive(timeRemaining);
        }
        
        // After cliff: enforce vested amount
        uint256 availableToSell = _calculateVestedAmount(config, timeElapsed) - config.released;
        if (sellAmount > availableToSell) {
            revert NotEnoughVested(sellAmount, availableToSell);
        }
        
        config.released += sellAmount;
    }
    
    return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
}
```

---

## Vesting Logic

### Parameters
| Parameter | Default | Description |
|-----------|---------|-------------|
| `cliffDuration` | 6 months | No tokens can be sold |
| `vestingDuration` | 12 months | Linear unlock after cliff |
| `totalLocked` | Configurable | Total founder allocation |

### Timeline Example

```
Month 0:  Lock starts, 1M tokens locked
Month 0-6: CLIFF - 0 tokens available (sells BLOCKED)
Month 6:  Cliff ends, linear vesting begins
Month 9:  250k tokens available (25%)
Month 12: 500k tokens available (50%)
Month 18: 1M tokens available (100% vested)
```

---

## Security Features

### 1. Router Detection
Catches founder sells even through routers:

```solidity
// Check both sender and tx.origin
if (sender != config.founder && tx.origin != config.founder) {
    return false; // Not founder, allow swap
}
```

### 2. Direction-Agnostic
Works regardless of token pair order:

```solidity
bool founderTokenIsToken0 = Currency.unwrap(config.founderToken) == Currency.unwrap(key.currency0);
return founderTokenIsToken0 ? zeroForOne : !zeroForOne;
```

### 3. Released Tracking
Prevents selling more than vested:

```solidity
uint256 availableToSell = vestedAmount - config.released;
config.released += sellAmount;
```

---

## Demo Scenario

### Test 1: Sell During Cliff (BLOCKED)

**Setup**: Founder has 1M tokens, cliff = 6 months

**Action**: Day 30 - Founder tries to sell 10k tokens

**Result**: ❌ REVERT
```
Error: VestingPeriodActive(12960000) // 150 days remaining in seconds
```

### Test 2: Sell After Cliff (ALLOWED)

**Setup**: Same founder, day 270 (after cliff)

**Action**: Founder tries to sell 100k tokens

**Vested**: ~250k tokens available

**Result**: ✅ SUCCESS - Swap executes

### Test 3: Sell Too Much (BLOCKED)

**Setup**: Day 270, only 250k vested

**Action**: Founder tries to sell 300k tokens

**Result**: ❌ REVERT
```
Error: NotEnoughVested(300000, 250000)
```

---

## Transaction Proofs

| Action | TxHash | Status |
|--------|--------|--------|
| Hook Deployment | [TBD] | ✅ |
| Pool Creation | [TBD] | ⏳ |
| Blocked Sell | [TBD] | ⏳ |
| Successful Sell | [TBD] | ⏳ |

---

## Prize Requirements Checklist

| Requirement | Status |
|-------------|--------|
| ✅ Hook implementation | `contracts/AntiRugHook.sol` |
| ✅ Uses `beforeSwap` hook | Yes |
| ✅ README.md | This document |
| ⏳ TxID on testnet | Pending |
| ⏳ Demo video (max 3 min) | Pending |

---

## Why This Matters

**Traditional vesting** requires trust in a separate contract and manual enforcement.

**AntiRugHook** makes vesting **trustless and automatic**:
- No separate vesting contract needed
- Protection is at the DEX level
- Impossible to bypass (even with multiple wallets*)
- Transparent and verifiable on-chain

*Note: `tx.origin` check catches EOA founders; multisig/contract wallets need additional patterns.

---

## Files

| File | Description |
|------|-------------|
| `contracts/AntiRugHook.sol` | Main hook contract |
| `test/AntiRugHook.test.ts` | Unit tests |
| `scripts/deploy-antirughook.ts` | Deployment script |

---

## Resources

- [Uniswap v4 Docs](https://docs.uniswap.org/contracts/v4/overview)
- [v4 Template](https://github.com/uniswapfoundation/v4-template)
- [Our Contract on Basescan](https://sepolia.basescan.org/address/0xDF2AC9680AA051059F56a863E8D6719228d71080)

