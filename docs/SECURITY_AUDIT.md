# ConsulDAO Smart Contract Security Audit (v2)

**Date**: 2026-02-05
**Auditor**: AI Security Review (Round 2)
**Scope**: All 8 contracts in `/contracts` — post-fix re-audit

---

## Previous Issues Status

All Critical, High, and Medium issues from v1 have been addressed:

| ID | Issue | Status |
|----|-------|--------|
| C-1 | Buyback swap not implemented | **FIXED** — real Uniswap V3 `exactInputSingle` swap |
| C-2 | No access control on `initializeVesting()` | **FIXED** — `onlyOwner` modifier added |
| C-3 | Voting counts addresses, not stake weight | **FIXED** — uses `stakingContract.getVotingPower()` |
| H-1 | Buyback simulation mode in production | **FIXED** — simulation fallback removed, requires `dexRouter` |
| H-2 | No SafeERC20 in HubDAO | **FIXED** — `using SafeERC20 for IERC20` + `safeTransfer` |
| H-3 | Staking `lockDuration` overwritten by shorter lock | **FIXED** — preserves longer lock and its duration |
| H-4 | Budget drained multiple times | **FIXED** — `spent` field tracks usage, checks `remaining` |
| M-1 | No reentrancy guard on `fundSquadBudget` | **FIXED** — `nonReentrant` added |
| M-3 | No refund mechanism in Fundraiser | **FIXED** — `refund()` after deadline if goal not met |
| M-4 | AntiRugHook only checks zeroForOne | **FIXED** — `founderToken` field determines sell direction |
| M-5 | No project ownership transfer | **FIXED** — `transferProjectOwnership()` added |
| M-6 | No `removeMember()` in Squads | **FIXED** — swap-and-pop removal added |
| L-1 | Missing zero-address checks | **FIXED** — added to all constructors |

---

## New Findings Summary

| Severity | Count |
|----------|-------|
| 🟠 High | 4 |
| 🟡 Medium | 4 |
| 🔵 Low | 6 |
| 📝 Informational | 3 |

---

## 🟠 High Issues

### H-1: AntiRugHook — `sender` is the router, not the end user

**File**: `AntiRugHook.sol` L194
**Issue**: In Uniswap v4, `_beforeSwap(address sender, ...)` receives the `msg.sender` of the `PoolManager.swap()` call. When users swap through a router contract (which is the normal path), `sender` is the **router address**, not the founder.

```solidity
if (sender == config.founder) {  // sender is the router, not the user
```

**Impact**: Founder can bypass the vesting restriction entirely by swapping through any router contract (the standard Uniswap flow).
**Fix**: Use `tx.origin` as a fallback check (note: breaks multisig compatibility), or integrate with a custom router that passes the original sender, or enforce restrictions at the token transfer level instead of at the swap level.

---

### H-2: ConsulStaking — voting power multiplier persists after lock expiry

**File**: `ConsulStaking.sol` L159-166
**Issue**: `getVotingPower()` uses `lockDuration` to look up the multiplier regardless of whether the lock has expired.

```solidity
function getVotingPower(address user) external view returns (uint256) {
    // ...
    uint256 multiplier = lockMultipliers[info.lockDuration];  // Always uses original lock tier
    return (info.amount * multiplier) / 10000;
}
```

**Impact**: A user who locked for 12 months (2x) and whose lock expired 6 months ago still gets 2x voting power. Inflates governance power without any lock commitment.
**Fix**: If `lockEnd > 0 && block.timestamp >= lockEnd`, fall back to the base 1x multiplier (10000).

---

### H-3: Fundraiser — contributions after finalization are permanently stuck

**File**: `Fundraiser.sol` L56-58, L81-92
**Issue**: `setFundraisingState(true)` can be called after `finalized == true`. New contributions would be accepted, but:
- `forwardToTreasury()` reverts (`"Already finalized"`)
- `refund()` reverts (`totalRaised >= goal` since goal was already met)

```solidity
function setFundraisingState(bool _isOpen) external onlyOwner {
    isLive = _isOpen;  // No check on finalized
}
```

**Impact**: Any contributions made after finalization are permanently locked in the contract with no recovery path.
**Fix**: Add `require(!finalized, "Already finalized")` to `setFundraisingState()`.

---

### H-4: Buyback — `_burnConsul` doesn't reduce `totalSupply()`

**File**: `Buyback.sol` L168-173
**Issue**: Burns by transferring to the dead address (`0x...dEaD`) instead of calling `burn()` on ConsulToken (which inherits ERC20Burnable).

```solidity
function _burnConsul(uint256 amount) internal {
    consulToken.safeTransfer(
        address(0x000000000000000000000000000000000000dEaD),
        amount
    );
}
```

**Impact**: `totalSupply()` never decreases after buybacks. This breaks the supply cap logic — `ConsulToken.mint()` checks `totalSupply() + amount > MAX_SUPPLY`, but "burned" tokens still count toward supply. Buyback-and-burn becomes purely cosmetic.
**Fix**: Call `ERC20Burnable(address(consulToken)).burn(amount)` or `transfer` to the Buyback contract first, then call `ConsulToken.burn(amount)`. Requires Buyback to hold the tokens and call `burn` directly.

---

## 🟡 Medium Issues

### M-1: HubDAO — `allocateSquadBudget` and `triggerBuyback` bypass budget system

**File**: `HubDAO.sol` L204-215, L257-268
**Issue**: Both functions transfer treasury funds without deducting from any quarterly budget. The owner can drain the treasury through squad allocations or buybacks even when no budget is approved.
**Fix**: Require an approved budget and deduct from `budget.spent`, or add separate governance approval for squad allocations and buybacks.

---

### M-2: Fundraiser — `contribute()` accepts funds past deadline

**File**: `Fundraiser.sol` L65-76
**Issue**: Only checks `isLive`, not `deadline`. If the owner forgets to close fundraising, contributors can send funds after the deadline. These late contributions could push `totalRaised` past `goal`, preventing earlier contributors from claiming refunds.
**Fix**: Add `require(block.timestamp <= deadline, "Deadline passed")` to `contribute()`.

---

### M-3: AntiRugHook — no ownership transfer mechanism

**File**: `AntiRugHook.sol` L33, L80-83
**Issue**: `owner` is set in the constructor and cannot be changed. If the owner key is compromised or needs rotation, the contract must be redeployed.
**Fix**: Add a `transferOwnership(address newOwner)` function with appropriate checks.

---

### M-4: HubDAO — vote power snapshot not taken at proposal time

**File**: `HubDAO.sol` L103-120
**Issue**: Voting power is read live from the staking contract at vote time. A voter can stake before voting and unstake immediately after, inflating their vote with flash-staked tokens.
**Fix**: Snapshot `totalStaked` at proposal creation time, or add a minimum staking duration before voting eligibility.

---

## 🔵 Low Issues

### L-1: Buyback — `usdc.approve()` before swap uses non-safe pattern

**File**: `Buyback.sol` L149
**Issue**: Uses `approve()` directly. Some tokens (like USDT) require approval to be set to 0 before setting a new value. USDC doesn't have this problem, but it's not best practice.
**Fix**: Use `safeIncreaseAllowance()` or approve 0 first then approve the amount.

---

### L-2: Squads — `fundSquadBudget` doesn't validate squad exists

**File**: `Squads.sol` L85-91
**Issue**: No check that `squadId <= squadCount`. Budget can be added to non-existent squad IDs.
**Fix**: Add `require(squadId > 0 && squadId <= squadCount, "Invalid squad")`.

---

### L-3: HubDAO setters lack zero-address validation

**File**: `HubDAO.sol` L230-231, L237-238
**Issue**: `setStakingContract()` and `setBuybackContract()` accept `address(0)`, which would break voting and buyback functionality silently.
**Fix**: Add `require(_address != address(0))`.

---

### L-4: ConsulToken — `initialMint` and `mint` don't validate recipient

**File**: `ConsulToken.sol` L51, L71
**Issue**: Can mint to `address(0)`, which would lock tokens permanently (ERC20 `_mint` to zero address reverts in OZ v5, so this is actually safe by framework). Informational.

---

### L-5: Buyback — `setHubDao(address(0))` disables buyback permanently

**File**: `Buyback.sol` L187-190
**Issue**: Setting hubDao to zero address locks out all buyback functionality since `onlyHubDao` would always revert.
**Fix**: Add `require(_hubDao != address(0))`.

---

### L-6: Buyback — `setPoolFee` has no tier validation

**File**: `Buyback.sol` L135-137
**Issue**: No validation that `_poolFee` is a valid Uniswap fee tier (500, 3000, 10000). An invalid fee would cause swaps to revert with an unhelpful error.
**Fix**: Validate against known fee tiers.

---

## 📝 Informational

### I-1: ConsulToken — owner can mint to MAX_SUPPLY without governance

Centralization risk. Owner has unilateral minting authority. Acceptable for hackathon but should be behind a timelock or governance in production.

### I-2: Squads — task completion has no reward payment

`completeTask()` marks a task done but doesn't transfer the reward. The comment at L214 acknowledges this is future work.

### I-3: ProjectRegistry — `transferProjectOwnership` has O(n) loop

The removal from `founderProjects` array iterates over all projects by that founder. Acceptable at small scale but could hit gas limits if a founder has hundreds of projects.

---

## Recommended Actions

| Priority | Action | Severity |
|----------|--------|----------|
| 1 | Fix H-1: AntiRugHook sender bypass via router | High |
| 2 | Fix H-2: Staking multiplier decay after lock expiry | High |
| 3 | Fix H-3: Block fundraising state change after finalization | High |
| 4 | Fix H-4: Use real `burn()` in Buyback instead of dead address | High |
| 5 | Fix M-2: Add deadline check to `contribute()` | Medium |
| 6 | Fix M-4: Snapshot vote power at proposal time | Medium |

---

## Overall Assessment

The v1 fixes significantly improved the codebase — all 3 Critical issues are resolved and the contracts are much more robust. The remaining High issues are:
- **H-1** is an architectural challenge inherent to Uniswap v4 hooks (router indirection)
- **H-2, H-3, H-4** are straightforward code fixes

For a **hackathon deployment on testnet**, the current state is acceptable. For **mainnet**, all High and Medium issues should be addressed first.
