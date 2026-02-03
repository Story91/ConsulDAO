/**
 * Circle/Arc Integration for ConsulDAO
 * 
 * Features:
 * - USDC Treasury management
 * - Cross-chain transfers via CCTP (Cross-Chain Transfer Protocol)
 * - Payment processing for contractors
 */

import { type Address } from "viem";

// USDC Contract Addresses
export const USDC_ADDRESSES = {
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address,
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address,
  polygon: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" as Address,
} as const;

// Circle CCTP Message Transmitter addresses
export const CCTP_MESSAGE_TRANSMITTER = {
  ethereum: "0x0a992d191deec32afe36203ad87d7d289a738f81" as Address,
  base: "0xAD09780d193884d503182aD4588450C416D6F9D4" as Address,
  arbitrum: "0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca" as Address,
  polygon: "0xF3be9355363857F3e001be68856A2f96b4C39Ba9" as Address,
} as const;

// Circle CCTP Token Messenger addresses
export const CCTP_TOKEN_MESSENGER = {
  ethereum: "0xbd3fa81b58ba92a82136038b25adec7066af3155" as Address,
  base: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962" as Address,
  arbitrum: "0x19330d10D9Cc8751218eaf51E8885D058642E08A" as Address,
  polygon: "0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE" as Address,
} as const;

// Chain domains for CCTP
export const CCTP_DOMAINS = {
  ethereum: 0,
  base: 6,
  arbitrum: 3,
  polygon: 7,
} as const;

export type SupportedChain = keyof typeof USDC_ADDRESSES;

// Payment types
export interface Payment {
  id: string;
  from: Address;
  to: Address;
  amount: string; // In USDC (6 decimals)
  sourceChain: SupportedChain;
  destinationChain: SupportedChain;
  status: PaymentStatus;
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export type PaymentStatus = 
  | "pending"
  | "processing"
  | "completed"
  | "failed";

// Treasury types
export interface Treasury {
  address: Address;
  chain: SupportedChain;
  balanceUSDC: string;
  allocatedBudget: string;
  availableBudget: string;
}

// Invoice for contractor payments
export interface Invoice {
  id: string;
  contractor: Address;
  projectId: string;
  amount: string;
  description: string;
  preferredChain: SupportedChain;
  status: "pending" | "approved" | "paid" | "rejected";
  createdAt: string;
}

/**
 * Get USDC address for a chain
 */
export function getUSDCAddress(chain: SupportedChain): Address {
  return USDC_ADDRESSES[chain];
}

/**
 * Get CCTP domain for a chain
 */
export function getCCTPDomain(chain: SupportedChain): number | undefined {
  return CCTP_DOMAINS[chain as keyof typeof CCTP_DOMAINS];
}

/**
 * Check if cross-chain transfer is supported
 */
export function isCrossChainSupported(
  sourceChain: SupportedChain,
  destChain: SupportedChain
): boolean {
  const sourceDomain = getCCTPDomain(sourceChain);
  const destDomain = getCCTPDomain(destChain);
  return sourceDomain !== undefined && destDomain !== undefined;
}

/**
 * Format USDC amount (6 decimals)
 */
export function formatUSDC(amount: bigint): string {
  const formatted = Number(amount) / 1e6;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(formatted);
}

/**
 * Parse USDC amount to bigint
 */
export function parseUSDC(amount: string): bigint {
  const parsed = parseFloat(amount.replace(/[^0-9.]/g, ""));
  return BigInt(Math.round(parsed * 1e6));
}

/**
 * Create a payment request
 */
export function createPaymentRequest(params: {
  from: Address;
  to: Address;
  amount: string;
  sourceChain: SupportedChain;
  destinationChain: SupportedChain;
}): Payment {
  return {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    ...params,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create an invoice
 */
export function createInvoice(params: {
  contractor: Address;
  projectId: string;
  amount: string;
  description: string;
  preferredChain: SupportedChain;
}): Invoice {
  return {
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    ...params,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

/**
 * ABI for USDC transfers
 */
export const USDC_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

/**
 * ABI for CCTP Token Messenger (cross-chain transfers)
 */
export const CCTP_TOKEN_MESSENGER_ABI = [
  {
    name: "depositForBurn",
    type: "function",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
    ],
    outputs: [{ name: "nonce", type: "uint64" }],
  },
] as const;

