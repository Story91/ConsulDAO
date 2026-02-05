/**
 * Agent Tools - Buyback Operations
 * 
 * Runtime-agnostic functions for treasury buyback and burn.
 * All write functions return PreparedTx for agent proposal → human signing.
 */

import { type Address, type Hex, encodeFunctionData } from "viem";
import type { PreparedTx } from "./circle";
import { approveUSDC } from "./circle";

// ============================================
// Types
// ============================================

export interface BuybackEstimate {
    usdcIn: bigint;
    consulOut: bigint;
    priceImpact: number; // Percentage
    effectivePrice: number; // USDC per CONSUL
}

export interface BuybackConfig {
    buybackContract: Address;
    consulToken: Address;
    usdcAmount: string;
    minConsulOut: bigint;
}

// ============================================
// Buyback Contract ABI (from Buyback.sol)
// ============================================

const BUYBACK_ABI = [
    {
        name: "executeBuyback",
        type: "function",
        inputs: [
            { name: "usdcAmount", type: "uint256" },
            { name: "minConsulOut", type: "uint256" },
        ],
        outputs: [],
    },
    {
        name: "getQuote",
        type: "function",
        inputs: [{ name: "usdcAmount", type: "uint256" }],
        outputs: [{ name: "consulAmount", type: "uint256" }],
        stateMutability: "view",
    },
    {
        name: "totalBurned",
        type: "function",
        inputs: [],
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
    },
] as const;

// ============================================
// Read Functions
// ============================================

/**
 * Get quote for buyback (call data for RPC)
 */
export function getBuybackQuoteCall(
    buybackContract: Address,
    usdcAmount: bigint
): { to: Address; data: Hex } {
    const data = encodeFunctionData({
        abi: BUYBACK_ABI,
        functionName: "getQuote",
        args: [usdcAmount],
    });
    return { to: buybackContract, data };
}

/**
 * Get total CONSUL burned (call data for RPC)
 */
export function getTotalBurnedCall(
    buybackContract: Address
): { to: Address; data: Hex } {
    const data = encodeFunctionData({
        abi: BUYBACK_ABI,
        functionName: "totalBurned",
        args: [],
    });
    return { to: buybackContract, data };
}

/**
 * Estimate buyback with price impact
 */
export function estimateBuyback(
    usdcIn: bigint,
    consulOut: bigint,
    currentPrice: number // USDC per CONSUL
): BuybackEstimate {
    const effectivePrice = Number(usdcIn) / Number(consulOut) / 1e12; // Adjust for decimals
    const priceImpact = ((effectivePrice - currentPrice) / currentPrice) * 100;

    return {
        usdcIn,
        consulOut,
        priceImpact,
        effectivePrice,
    };
}

// ============================================
// Write Functions
// ============================================

/**
 * Execute buyback - swaps USDC to CONSUL and burns
 * 
 * Note: This requires prior USDC approval to the buyback contract
 */
export function executeBuyback(
    config: BuybackConfig,
    chainId: number = 8453
): PreparedTx {
    const usdcAmount = parseUSDCAmount(config.usdcAmount);

    const data = encodeFunctionData({
        abi: BUYBACK_ABI,
        functionName: "executeBuyback",
        args: [usdcAmount, config.minConsulOut],
    });

    const formattedAmount = formatUSDCAmount(usdcAmount);
    const formattedConsul = formatConsulAmount(config.minConsulOut);

    return {
        to: config.buybackContract,
        data,
        value: BigInt(0),
        chainId,
        description: `Buyback: Swap ${formattedAmount} USDC → ${formattedConsul}+ CONSUL (then burn)`,
    };
}

/**
 * Prepare buyback with approval
 * Returns array of PreparedTx: [approve, buyback]
 */
export function prepareBuybackWithApproval(
    config: BuybackConfig,
    chainId: number = 8453
): PreparedTx[] {
    const chain = chainId === 8453 ? "base" : "baseSepolia";

    return [
        approveUSDC(config.buybackContract, config.usdcAmount, chain),
        executeBuyback(config, chainId),
    ];
}

// ============================================
// Helpers
// ============================================

function parseUSDCAmount(amount: string): bigint {
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ""));
    return BigInt(Math.round(parsed * 1e6));
}

function formatUSDCAmount(amount: bigint): string {
    return `$${(Number(amount) / 1e6).toLocaleString()}`;
}

function formatConsulAmount(amount: bigint): string {
    return `${(Number(amount) / 1e18).toLocaleString()} CONSUL`;
}
