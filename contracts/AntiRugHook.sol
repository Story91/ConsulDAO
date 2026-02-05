// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {
    BeforeSwapDelta,
    BeforeSwapDeltaLibrary
} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

/**
 * @title AntiRugHook
 * @notice Uniswap v4 Hook that prevents founder token dumps during vesting period
 * @dev Implements beforeSwap hook to check if seller is founder and if vesting period has passed
 *
 * Prize Target: Uniswap v4 - "Agentic Finance" track
 *
 * Features:
 * - Blocks founder sells during lock period (default: 1 year)
 * - Allows gradual unlocking after cliff
 * - Emits events for transparency
 * - Configurable per-pool settings
 */
contract AntiRugHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    /// @notice Contract owner (deployer) who can initialize vesting
    address public owner;

    // Vesting configuration per pool
    struct VestingConfig {
        address founder; // Founder address (restricted seller)
        Currency founderToken; // Which token in the pair belongs to the founder
        uint256 lockStartTime; // When the lock period started
        uint256 cliffDuration; // Time before any tokens can be sold (e.g., 6 months)
        uint256 vestingDuration; // Total vesting period (e.g., 12 months)
        uint256 totalLocked; // Total tokens locked
        uint256 released; // Tokens already released
        bool initialized; // Whether config is set
    }

    // Pool ID => Vesting Config
    mapping(PoolId => VestingConfig) public vestingConfigs;

    // Events
    event VestingInitialized(
        PoolId indexed poolId,
        address indexed founder,
        uint256 cliffDuration,
        uint256 vestingDuration,
        uint256 totalLocked
    );

    event FounderSellBlocked(
        PoolId indexed poolId,
        address indexed founder,
        uint256 attemptedAmount,
        uint256 timeRemaining
    );

    event TokensReleased(
        PoolId indexed poolId,
        address indexed founder,
        uint256 amount
    );

    // Errors
    error VestingPeriodActive(uint256 timeRemaining);
    error NotEnoughVested(uint256 requested, uint256 available);
    error AlreadyInitialized();
    error NotInitialized();
    error InvalidDuration();
    error NotOwner();
    error ZeroAddress();

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {
        owner = msg.sender;
    }

    /**
     * @notice Transfer ownership to a new address
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @notice Returns the hook permissions
     * @dev Only beforeSwap is needed for this hook
     */
    function getHookPermissions()
        public
        pure
        override
        returns (Hooks.Permissions memory)
    {
        return
            Hooks.Permissions({
                beforeInitialize: false,
                afterInitialize: true, // To set up vesting config
                beforeAddLiquidity: false,
                afterAddLiquidity: false,
                beforeRemoveLiquidity: false,
                afterRemoveLiquidity: false,
                beforeSwap: true, // Main hook - check founder sells
                afterSwap: false,
                beforeDonate: false,
                afterDonate: false,
                beforeSwapReturnDelta: false,
                afterSwapReturnDelta: false,
                afterAddLiquidityReturnDelta: false,
                afterRemoveLiquidityReturnDelta: false
            });
    }

    /**
     * @notice Initialize vesting for a pool after it's created
     * @param key Pool key
     * @param founder Address of the founder (restricted seller)
     * @param cliffDuration Time in seconds before any sells allowed
     * @param vestingDuration Total vesting period in seconds
     * @param totalLocked Total tokens subject to vesting
     */
    function initializeVesting(
        PoolKey calldata key,
        address founder,
        Currency founderToken,
        uint256 cliffDuration,
        uint256 vestingDuration,
        uint256 totalLocked
    ) external onlyOwner {
        PoolId poolId = key.toId();

        if (vestingConfigs[poolId].initialized) {
            revert AlreadyInitialized();
        }

        if (vestingDuration == 0 || cliffDuration > vestingDuration) {
            revert InvalidDuration();
        }

        // Validate that founderToken is one of the pool's currencies
        require(
            Currency.unwrap(founderToken) == Currency.unwrap(key.currency0) ||
            Currency.unwrap(founderToken) == Currency.unwrap(key.currency1),
            "founderToken must be in pool"
        );

        vestingConfigs[poolId] = VestingConfig({
            founder: founder,
            founderToken: founderToken,
            lockStartTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            totalLocked: totalLocked,
            released: 0,
            initialized: true
        });

        emit VestingInitialized(
            poolId,
            founder,
            cliffDuration,
            vestingDuration,
            totalLocked
        );
    }

    /**
     * @notice Get the absolute swap amount from params
     */
    function _absAmount(int256 amountSpecified) internal pure returns (uint256) {
        return amountSpecified > 0
            ? uint256(amountSpecified)
            : uint256(-amountSpecified);
    }

    /**
     * @notice Check if this swap is a founder selling their token
     */
    function _isFounderSell(
        VestingConfig storage config,
        address sender,
        PoolKey calldata key,
        bool zeroForOne
    ) internal view returns (bool) {
        // Check if the swap originates from the founder.
        // `sender` is the direct caller of PoolManager (often a router).
        // `tx.origin` catches the founder even when using a router.
        // Note: tx.origin does not work for multisig/contract wallets.
        if (sender != config.founder && tx.origin != config.founder) {
            return false;
        }
        // If founder token is token0, selling is zeroForOne; otherwise it's !zeroForOne
        bool founderTokenIsToken0 = Currency.unwrap(config.founderToken) == Currency.unwrap(key.currency0);
        return founderTokenIsToken0 ? zeroForOne : !zeroForOne;
    }

    /**
     * @notice Hook called before every swap
     * @dev Blocks founder sells during vesting period
     */
    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        PoolId poolId = key.toId();
        VestingConfig storage config = vestingConfigs[poolId];

        // If no vesting config, allow all swaps
        if (!config.initialized) {
            return (
                BaseHook.beforeSwap.selector,
                BeforeSwapDeltaLibrary.ZERO_DELTA,
                0
            );
        }

        if (_isFounderSell(config, sender, key, params.zeroForOne)) {
            uint256 timeElapsed = block.timestamp - config.lockStartTime;
            uint256 sellAmount = _absAmount(params.amountSpecified);

            // Check if cliff period has passed
            if (timeElapsed < config.cliffDuration) {
                emit FounderSellBlocked(
                    poolId,
                    config.founder,
                    sellAmount,
                    config.cliffDuration - timeElapsed
                );
                revert VestingPeriodActive(config.cliffDuration - timeElapsed);
            }

            // Calculate vested amount after cliff
            uint256 availableToSell = calculateVestedAmount(config, timeElapsed) - config.released;

            if (sellAmount > availableToSell) {
                revert NotEnoughVested(sellAmount, availableToSell);
            }

            // Update released amount
            config.released += sellAmount;
            emit TokensReleased(poolId, config.founder, sellAmount);
        }

        return (
            BaseHook.beforeSwap.selector,
            BeforeSwapDeltaLibrary.ZERO_DELTA,
            0
        );
    }

    /**
     * @notice Calculate how many tokens have vested
     * @param config Vesting configuration
     * @param timeElapsed Time since lock started
     */
    function calculateVestedAmount(
        VestingConfig memory config,
        uint256 timeElapsed
    ) public pure returns (uint256) {
        if (timeElapsed < config.cliffDuration) {
            return 0;
        }

        if (timeElapsed >= config.vestingDuration) {
            return config.totalLocked;
        }

        // Linear vesting after cliff
        uint256 vestingTimeElapsed = timeElapsed - config.cliffDuration;
        uint256 vestingPeriod = config.vestingDuration - config.cliffDuration;

        return (config.totalLocked * vestingTimeElapsed) / vestingPeriod;
    }

    /**
     * @notice Get vesting status for a pool
     * @param key Pool key
     */
    function getVestingStatus(
        PoolKey calldata key
    )
        external
        view
        returns (
            bool initialized,
            address founder,
            uint256 totalLocked,
            uint256 vested,
            uint256 released,
            uint256 available,
            uint256 timeUntilFullyVested
        )
    {
        PoolId poolId = key.toId();
        VestingConfig memory config = vestingConfigs[poolId];

        if (!config.initialized) {
            return (false, address(0), 0, 0, 0, 0, 0);
        }

        uint256 timeElapsed = block.timestamp - config.lockStartTime;
        uint256 vestedAmount = calculateVestedAmount(config, timeElapsed);
        uint256 availableAmount = vestedAmount > config.released
            ? vestedAmount - config.released
            : 0;

        uint256 timeRemaining = 0;
        if (timeElapsed < config.vestingDuration) {
            timeRemaining = config.vestingDuration - timeElapsed;
        }

        return (
            true,
            config.founder,
            config.totalLocked,
            vestedAmount,
            config.released,
            availableAmount,
            timeRemaining
        );
    }

    /**
     * @notice After initialize hook - placeholder for future use
     */
    function _afterInitialize(
        address,
        PoolKey calldata,
        uint160,
        int24
    ) internal pure override returns (bytes4) {
        return BaseHook.afterInitialize.selector;
    }
}
