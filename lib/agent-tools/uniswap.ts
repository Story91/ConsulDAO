/**
 * Agent Tools - Uniswap v4 Operations
 * 
 * Runtime-agnostic functions for Uniswap v4 pool and swap operations.
 * All write functions return PreparedTx for agent proposal → human signing.
 */

import { type Address, type Hex, encodeFunctionData, encodeAbiParameters } from "viem";
import { CONTRACT_ADDRESSES, POOL_MANAGER_ABI } from "../contracts";
import type { PreparedTx } from "./circle";

// ============================================
// Types
// ============================================

export interface PoolKey {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
}

export interface SwapParams {
    tokenIn: Address;
    tokenOut: Address;
    amountIn: bigint;
    minAmountOut: bigint;
    recipient: Address;
}

export interface PoolConfig {
    token: Address;
    quoteToken: Address; // Usually USDC
    feeTier: 500 | 3000 | 10000; // 0.05%, 0.3%, 1%
    initialPrice: bigint; // sqrtPriceX96 format
    hookAddress?: Address;
}

export interface LiquidityParams {
    poolId: Hex;
    amount0: bigint;
    amount1: bigint;
    tickLower: number;
    tickUpper: number;
}

// ============================================
// Constants
// ============================================

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

// Tick spacing per fee tier
const TICK_SPACING: Record<number, number> = {
    500: 10,
    3000: 60,
    10000: 200,
};

// ============================================
// Pool Operations
// ============================================

/**
 * Create a pool key structure
 */
export function createPoolKey(config: PoolConfig): PoolKey {
    // Sort tokens (currency0 < currency1)
    const [currency0, currency1] =
        config.token.toLowerCase() < config.quoteToken.toLowerCase()
            ? [config.token, config.quoteToken]
            : [config.quoteToken, config.token];

    return {
        currency0,
        currency1,
        fee: config.feeTier,
        tickSpacing: TICK_SPACING[config.feeTier],
        hooks: config.hookAddress || ZERO_ADDRESS,
    };
}

/**
 * Initialize a new Uniswap v4 pool
 */
export function initializePool(
    config: PoolConfig,
    chainId: number = 8453
): PreparedTx {
    const poolKey = createPoolKey(config);
    const network = chainId === 8453 ? "base" : "baseSepolia";
    const poolManager = CONTRACT_ADDRESSES[network].POOL_MANAGER;

    const data = encodeFunctionData({
        abi: POOL_MANAGER_ABI,
        functionName: "initialize",
        args: [
            [
                poolKey.currency0,
                poolKey.currency1,
                poolKey.fee,
                poolKey.tickSpacing,
                poolKey.hooks,
            ],
            config.initialPrice,
        ],
    });

    return {
        to: poolManager,
        data,
        value: BigInt(0),
        chainId,
        description: `Initialize pool: ${poolKey.currency0.slice(0, 6)}/${poolKey.currency1.slice(0, 6)} (${config.feeTier / 10000}% fee)`,
    };
}

/**
 * Execute a swap on Uniswap v4
 */
export function executeSwap(
    params: SwapParams,
    poolKey: PoolKey,
    chainId: number = 8453
): PreparedTx {
    const network = chainId === 8453 ? "base" : "baseSepolia";
    const poolManager = CONTRACT_ADDRESSES[network].POOL_MANAGER;

    // Determine swap direction
    const zeroForOne = params.tokenIn.toLowerCase() === poolKey.currency0.toLowerCase();

    const data = encodeFunctionData({
        abi: POOL_MANAGER_ABI,
        functionName: "swap",
        args: [
            [
                poolKey.currency0,
                poolKey.currency1,
                poolKey.fee,
                poolKey.tickSpacing,
                poolKey.hooks,
            ],
            {
                zeroForOne,
                amountSpecified: params.amountIn,
                sqrtPriceLimitX96: zeroForOne
                    ? BigInt("4295128739")  // MIN_SQRT_RATIO + 1
                    : BigInt("1461446703485210103287273052203988822378723970342"), // MAX_SQRT_RATIO - 1
            },
            "0x" as Hex,
        ],
    });

    return {
        to: poolManager,
        data,
        value: BigInt(0),
        chainId,
        description: `Swap ${formatAmount(params.amountIn)} ${params.tokenIn.slice(0, 6)} → ${params.tokenOut.slice(0, 6)}`,
    };
}

// ============================================
// Price Helpers
// ============================================

/**
 * Calculate sqrtPriceX96 from human-readable price
 * @param price - e.g., 1.5 means 1 token0 = 1.5 token1
 */
export function priceToSqrtPriceX96(price: number): bigint {
    const sqrtPrice = Math.sqrt(price);
    const Q96 = BigInt(2) ** BigInt(96);
    return BigInt(Math.floor(sqrtPrice * Number(Q96)));
}

/**
 * Calculate human-readable price from sqrtPriceX96
 */
export function sqrtPriceX96ToPrice(sqrtPriceX96: bigint): number {
    const Q96 = BigInt(2) ** BigInt(96);
    const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
    return sqrtPrice * sqrtPrice;
}

/**
 * Calculate minimum output with slippage
 */
export function calculateMinOutput(
    expectedOutput: bigint,
    slippageBps: number = 50 // 0.5% default
): bigint {
    return expectedOutput * BigInt(10000 - slippageBps) / BigInt(10000);
}

// ============================================
// Pool ID Helpers
// ============================================

/**
 * Compute pool ID from pool key
 */
export function computePoolId(poolKey: PoolKey): Hex {
    const encoded = encodeAbiParameters(
        [
            { type: "address" },
            { type: "address" },
            { type: "uint24" },
            { type: "int24" },
            { type: "address" },
        ],
        [
            poolKey.currency0,
            poolKey.currency1,
            poolKey.fee,
            poolKey.tickSpacing,
            poolKey.hooks,
        ]
    );
    // In practice, this would be keccak256(encoded)
    // Keeping simple for now
    return encoded;
}

// ============================================
// Helpers
// ============================================

function formatAmount(amount: bigint): string {
    // Assume 18 decimals for display
    return (Number(amount) / 1e18).toFixed(4);
}
