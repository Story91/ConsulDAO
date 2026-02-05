/**
 * Agent Tools - Circle/USDC Operations
 * 
 * Runtime-agnostic functions for USDC management.
 * All write functions return PreparedTx for agent proposal → human signing.
 */

import { type Address, type Hex, encodeFunctionData } from "viem";
import {
    USDC_ADDRESSES,
    USDC_ABI,
    CCTP_TOKEN_MESSENGER,
    CCTP_TOKEN_MESSENGER_ABI,
    CCTP_DOMAINS,
    type SupportedChain,
    formatUSDC,
    parseUSDC,
} from "../circle";

// ============================================
// Types
// ============================================

export interface PreparedTx {
    to: Address;
    data: Hex;
    value: bigint;
    chainId: number;
    description: string;
}

export interface BalanceResult {
    balance: bigint;
    formatted: string;
    chain: SupportedChain;
}

export interface BridgeEstimate {
    amount: bigint;
    fee: bigint;
    netAmount: bigint;
    destinationChain: SupportedChain;
}

// ============================================
// Read Functions (No tx needed)
// ============================================

/**
 * Get USDC balance for an address
 */
export function getUSDCBalanceCall(
    address: Address,
    chain: SupportedChain
): { to: Address; data: Hex } {
    const usdcAddress = USDC_ADDRESSES[chain];
    const data = encodeFunctionData({
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [address],
    });
    return { to: usdcAddress, data };
}

/**
 * Parse balance result from RPC call
 */
export function parseBalanceResult(
    result: Hex,
    chain: SupportedChain
): BalanceResult {
    const balance = BigInt(result);
    return {
        balance,
        formatted: formatUSDC(balance),
        chain,
    };
}

// ============================================
// Write Functions (Return PreparedTx)
// ============================================

/**
 * Transfer USDC to an address
 */
export function transferUSDC(
    to: Address,
    amount: string,
    chain: SupportedChain = "base"
): PreparedTx {
    const amountBigInt = parseUSDC(amount);
    const usdcAddress = USDC_ADDRESSES[chain];

    const data = encodeFunctionData({
        abi: USDC_ABI,
        functionName: "transfer",
        args: [to, amountBigInt],
    });

    return {
        to: usdcAddress,
        data,
        value: BigInt(0),
        chainId: getChainId(chain),
        description: `Transfer ${amount} USDC to ${to.slice(0, 6)}...${to.slice(-4)}`,
    };
}

/**
 * Approve USDC spending
 */
export function approveUSDC(
    spender: Address,
    amount: string,
    chain: SupportedChain = "base"
): PreparedTx {
    const amountBigInt = parseUSDC(amount);
    const usdcAddress = USDC_ADDRESSES[chain];

    const data = encodeFunctionData({
        abi: USDC_ABI,
        functionName: "approve",
        args: [spender, amountBigInt],
    });

    return {
        to: usdcAddress,
        data,
        value: BigInt(0),
        chainId: getChainId(chain),
        description: `Approve ${amount} USDC for ${spender.slice(0, 6)}...${spender.slice(-4)}`,
    };
}

/**
 * Bridge USDC cross-chain via Circle CCTP
 */
export function bridgeUSDC(
    amount: string,
    recipient: Address,
    sourceChain: SupportedChain,
    destChain: SupportedChain
): PreparedTx {
    const amountBigInt = parseUSDC(amount);
    const messengerAddress = CCTP_TOKEN_MESSENGER[sourceChain as keyof typeof CCTP_TOKEN_MESSENGER];
    const destDomain = CCTP_DOMAINS[destChain as keyof typeof CCTP_DOMAINS];
    const usdcAddress = USDC_ADDRESSES[sourceChain];

    // Convert recipient address to bytes32 (pad to 32 bytes)
    const mintRecipient = `0x000000000000000000000000${recipient.slice(2)}` as Hex;

    const data = encodeFunctionData({
        abi: CCTP_TOKEN_MESSENGER_ABI,
        functionName: "depositForBurn",
        args: [amountBigInt, destDomain, mintRecipient, usdcAddress],
    });

    return {
        to: messengerAddress,
        data,
        value: BigInt(0),
        chainId: getChainId(sourceChain),
        description: `Bridge ${amount} USDC from ${sourceChain} to ${destChain}`,
    };
}

/**
 * Disburse budget from treasury to a squad Safe
 */
export function disburseBudget(
    squadAddress: Address,
    amount: string,
    description: string
): PreparedTx {
    return {
        ...transferUSDC(squadAddress, amount, "base"),
        description: `Disburse ${amount} USDC to squad: ${description}`,
    };
}

// ============================================
// Helpers
// ============================================

function getChainId(chain: SupportedChain): number {
    const chainIds: Record<SupportedChain, number> = {
        ethereum: 1,
        base: 8453,
        baseSepolia: 84532,
        arbitrum: 42161,
        polygon: 137,
    };
    return chainIds[chain];
}

/**
 * Estimate bridge fee (CCTP is actually free, but include for future)
 */
export function estimateBridgeFee(
    _amount: string,
    _sourceChain: SupportedChain,
    _destChain: SupportedChain
): BridgeEstimate {
    const amountBigInt = parseUSDC(_amount);
    // CCTP has no protocol fee
    return {
        amount: amountBigInt,
        fee: BigInt(0),
        netAmount: amountBigInt,
        destinationChain: _destChain,
    };
}
