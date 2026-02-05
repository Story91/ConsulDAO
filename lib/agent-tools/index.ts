/**
 * Agent Tools - Main Export
 * 
 * Runtime-agnostic toolkit for ConsulDAO agent operations.
 * Import specific functions or use the AGENT_TOOLS registry.
 */

// Re-export all tools
export * from "./circle";
export * from "./uniswap";
export * from "./buyback";

// Import for registry
import {
    // Circle tools
    getUSDCBalanceCall,
    parseBalanceResult,
    transferUSDC,
    approveUSDC,
    bridgeUSDC,
    disburseBudget,
    estimateBridgeFee,
    type PreparedTx,
    type BalanceResult,
    type BridgeEstimate,
} from "./circle";

import {
    // Uniswap tools
    createPoolKey,
    initializePool,
    executeSwap,
    priceToSqrtPriceX96,
    sqrtPriceX96ToPrice,
    calculateMinOutput,
    computePoolId,
    type PoolKey,
    type SwapParams,
    type PoolConfig,
    type LiquidityParams,
} from "./uniswap";

import {
    // Buyback tools
    getBuybackQuoteCall,
    getTotalBurnedCall,
    estimateBuyback,
    executeBuyback,
    prepareBuybackWithApproval,
    type BuybackEstimate,
    type BuybackConfig,
} from "./buyback";

// ============================================
// Tool Registry
// ============================================

/**
 * Registry of all agent-callable tools.
 * Use this for dynamic tool discovery by agent frameworks.
 */
export const AGENT_TOOLS = {
    circle: {
        // Read
        getUSDCBalanceCall,
        parseBalanceResult,
        estimateBridgeFee,
        // Write
        transferUSDC,
        approveUSDC,
        bridgeUSDC,
        disburseBudget,
    },
    uniswap: {
        // Helpers
        createPoolKey,
        priceToSqrtPriceX96,
        sqrtPriceX96ToPrice,
        calculateMinOutput,
        computePoolId,
        // Write
        initializePool,
        executeSwap,
    },
    buyback: {
        // Read
        getBuybackQuoteCall,
        getTotalBurnedCall,
        estimateBuyback,
        // Write
        executeBuyback,
        prepareBuybackWithApproval,
    },
} as const;

// ============================================
// Tool Descriptions (for LLM agents)
// ============================================

export const TOOL_DESCRIPTIONS = {
    // Circle
    transferUSDC: "Transfer USDC to an address on Base",
    bridgeUSDC: "Bridge USDC cross-chain via Circle CCTP",
    disburseBudget: "Send USDC from treasury to a squad Safe",
    approveUSDC: "Approve USDC spending for a contract",

    // Uniswap
    initializePool: "Create a new Uniswap v4 liquidity pool",
    executeSwap: "Swap tokens on Uniswap v4",

    // Buyback
    executeBuyback: "Swap USDC to CONSUL and burn it",
    prepareBuybackWithApproval: "Approve + execute buyback in sequence",
} as const;

// ============================================
// Type exports
// ============================================

export type {
    PreparedTx,
    BalanceResult,
    BridgeEstimate,
    PoolKey,
    SwapParams,
    PoolConfig,
    LiquidityParams,
    BuybackEstimate,
    BuybackConfig,
};
