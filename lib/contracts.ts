/**
 * Contract ABIs and addresses for ConsulDAO
 */

import { type Address } from "viem";
import { DEPLOYED_ADDRESSES, EXTERNAL_ADDRESSES } from "./deployed-addresses";

// Contract addresses by network
export const CONTRACT_ADDRESSES = {
  // Base Sepolia (Testnet)
  baseSepolia: {
    CONSUL_TOKEN: DEPLOYED_ADDRESSES.consulToken || ("" as Address),
    CONSUL_STAKING: DEPLOYED_ADDRESSES.consulStaking || ("" as Address),
    HUB_DAO: DEPLOYED_ADDRESSES.hubDAO || ("" as Address),
    BUYBACK: DEPLOYED_ADDRESSES.buyback || ("" as Address),
    FUNDRAISER: DEPLOYED_ADDRESSES.fundraiser || ("" as Address),
    SQUADS: DEPLOYED_ADDRESSES.squads || ("" as Address),
    PROJECT_REGISTRY: DEPLOYED_ADDRESSES.projectRegistry || ("" as Address),
    ANTI_RUG_HOOK: DEPLOYED_ADDRESSES.antiRugHook || ("" as Address),
    // External contracts
    USDC: EXTERNAL_ADDRESSES.usdc,
    POOL_MANAGER: EXTERNAL_ADDRESSES.poolManager,
  },
  // Base Mainnet
  base: {
    CONSUL_TOKEN: "" as Address,
    CONSUL_STAKING: "" as Address,
    HUB_DAO: "" as Address,
    BUYBACK: "" as Address,
    FUNDRAISER: "" as Address,
    SQUADS: "" as Address,
    PROJECT_REGISTRY: "" as Address,
    ANTI_RUG_HOOK: "" as Address,
    // External contracts
    USDC: "" as Address,
    POOL_MANAGER: "0x498581fF718922c3f8e6A244956aF099B2652b2b" as Address,
  },
} as const;

// HubDAO ABI - Core functions
export const HUB_DAO_ABI = [
  {
    name: "proposeBudget",
    type: "function",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "voteOnBudget",
    type: "function",
    inputs: [
      { name: "quarter", type: "uint256" },
      { name: "support", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "approveBudget",
    type: "function",
    inputs: [{ name: "quarter", type: "uint256" }],
    outputs: [],
  },
  {
    name: "executeBudget",
    type: "function",
    inputs: [
      { name: "quarter", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getTreasuryBalance",
    type: "function",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "currentQuarter",
    type: "function",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
] as const;

// AntiRugHook ABI
export const ANTI_RUG_HOOK_ABI = [
  {
    name: "initializeVesting",
    type: "function",
    inputs: [
      {
        name: "key",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      { name: "founder", type: "address" },
      { name: "cliffDuration", type: "uint256" },
      { name: "vestingDuration", type: "uint256" },
      { name: "totalLocked", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getVestingStatus",
    type: "function",
    inputs: [
      {
        name: "key",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
    ],
    outputs: [
      { name: "initialized", type: "bool" },
      { name: "founder", type: "address" },
      { name: "totalLocked", type: "uint256" },
      { name: "vested", type: "uint256" },
      { name: "released", type: "uint256" },
      { name: "available", type: "uint256" },
      { name: "timeUntilFullyVested", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    name: "calculateVestedAmount",
    type: "function",
    inputs: [
      {
        name: "config",
        type: "tuple",
        components: [
          { name: "founder", type: "address" },
          { name: "lockStartTime", type: "uint256" },
          { name: "cliffDuration", type: "uint256" },
          { name: "vestingDuration", type: "uint256" },
          { name: "totalLocked", type: "uint256" },
          { name: "released", type: "uint256" },
          { name: "initialized", type: "bool" },
        ],
      },
      { name: "timeElapsed", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "pure",
  },
  {
    name: "VestingInitialized",
    type: "event",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "founder", type: "address", indexed: true },
      { name: "cliffDuration", type: "uint256", indexed: false },
      { name: "vestingDuration", type: "uint256", indexed: false },
      { name: "totalLocked", type: "uint256", indexed: false },
    ],
  },
  {
    name: "FounderSellBlocked",
    type: "event",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "founder", type: "address", indexed: true },
      { name: "attemptedAmount", type: "uint256", indexed: false },
      { name: "timeRemaining", type: "uint256", indexed: false },
    ],
  },
  {
    name: "TokensReleased",
    type: "event",
    inputs: [
      { name: "poolId", type: "bytes32", indexed: true },
      { name: "founder", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

// Uniswap v4 Pool Manager ABI (partial)
export const POOL_MANAGER_ABI = [
  {
    name: "initialize",
    type: "function",
    inputs: [
      {
        name: "key",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      { name: "sqrtPriceX96", type: "uint160" },
    ],
    outputs: [{ name: "tick", type: "int24" }],
  },
  {
    name: "swap",
    type: "function",
    inputs: [
      {
        name: "key",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "zeroForOne", type: "bool" },
          { name: "amountSpecified", type: "int256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
      { name: "hookData", type: "bytes" },
    ],
    outputs: [{ name: "delta", type: "int256" }],
  },
] as const;

// Get contract address for current network
export function getContractAddress(
  contract: keyof (typeof CONTRACT_ADDRESSES)["baseSepolia"],
  chainId: number
): Address | null {
  const network = chainId === 8453 ? "base" : "baseSepolia";
  const addr = CONTRACT_ADDRESSES[network][contract];
  return addr || null;
}
