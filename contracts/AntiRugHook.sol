// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";
import {Currency} from "v4-core/src/types/Currency.sol";

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

    // Vesting configuration per pool
    struct VestingConfig {
        address founder;           // Founder address (restricted seller)
        uint256 lockStartTime;     // When the lock period started
        uint256 cliffDuration;     // Time before any tokens can be sold (e.g., 6 months)
        uint256 vestingDuration;   // Total vesting period (e.g., 12 months)
        uint256 totalLocked;       // Total tokens locked
        uint256 released;          // Tokens already released
        bool initialized;          // Whether config is set
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

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    /**
     * @notice Returns the hook permissions
     * @dev Only beforeSwap is needed for this hook
     */
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: true,  // To set up vesting config
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,       // Main hook - check founder sells
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
        uint256 cliffDuration,
        uint256 vestingDuration,
        uint256 totalLocked
    ) external {
        PoolId poolId = key.toId();
        
        if (vestingConfigs[poolId].initialized) {
            revert AlreadyInitialized();
        }
        
        if (vestingDuration == 0 || cliffDuration > vestingDuration) {
            revert InvalidDuration();
        }

        vestingConfigs[poolId] = VestingConfig({
            founder: founder,
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
     * @notice Hook called before every swap
     * @dev Blocks founder sells during vesting period
     */
    function beforeSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata
    ) external override returns (bytes4, BeforeSwapDelta, uint24) {
        PoolId poolId = key.toId();
        VestingConfig storage config = vestingConfigs[poolId];

        // If no vesting config, allow all swaps
        if (!config.initialized) {
            return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
        }

        // Check if sender is the founder
        if (sender == config.founder) {
            // Check if this is a sell (founder selling their tokens)
            // In Uniswap v4, zeroForOne means selling token0 for token1
            bool isSelling = params.zeroForOne;
            
            if (isSelling) {
                uint256 timeElapsed = block.timestamp - config.lockStartTime;
                
                // Check if cliff period has passed
                if (timeElapsed < config.cliffDuration) {
                    uint256 timeRemaining = config.cliffDuration - timeElapsed;
                    
                    emit FounderSellBlocked(
                        poolId,
                        config.founder,
                        params.amountSpecified > 0 ? uint256(params.amountSpecified) : uint256(-params.amountSpecified),
                        timeRemaining
                    );
                    
                    revert VestingPeriodActive(timeRemaining);
                }
                
                // Calculate vested amount after cliff
                uint256 vestedAmount = calculateVestedAmount(config, timeElapsed);
                uint256 availableToSell = vestedAmount - config.released;
                
                uint256 sellAmount = params.amountSpecified > 0 
                    ? uint256(params.amountSpecified) 
                    : uint256(-params.amountSpecified);
                
                if (sellAmount > availableToSell) {
                    revert NotEnoughVested(sellAmount, availableToSell);
                }
                
                // Update released amount
                config.released += sellAmount;
                
                emit TokensReleased(poolId, config.founder, sellAmount);
            }
        }

        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
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
    function getVestingStatus(PoolKey calldata key) external view returns (
        bool initialized,
        address founder,
        uint256 totalLocked,
        uint256 vested,
        uint256 released,
        uint256 available,
        uint256 timeUntilFullyVested
    ) {
        PoolId poolId = key.toId();
        VestingConfig memory config = vestingConfigs[poolId];
        
        if (!config.initialized) {
            return (false, address(0), 0, 0, 0, 0, 0);
        }
        
        uint256 timeElapsed = block.timestamp - config.lockStartTime;
        uint256 vestedAmount = calculateVestedAmount(config, timeElapsed);
        uint256 availableAmount = vestedAmount > config.released ? vestedAmount - config.released : 0;
        
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
    function afterInitialize(
        address,
        PoolKey calldata,
        uint160,
        int24
    ) external pure override returns (bytes4) {
        return BaseHook.afterInitialize.selector;
    }
}

