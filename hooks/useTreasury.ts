"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { DEPLOYED_ADDRESSES, EXTERNAL_ADDRESSES } from "@/lib/deployed-addresses";
import { formatUnits } from "viem";

// USDC ABI (minimal - just balanceOf)
const USDC_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
] as const;

// Buyback ABI (minimal)
const BUYBACK_ABI = [
  {
    name: "totalBuybackSpent",
    type: "function",
    inputs: [],
    outputs: [{ type: "uint256" }],
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

/**
 * Hook to read treasury USDC balance
 */
export function useTreasuryBalance() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: EXTERNAL_ADDRESSES.usdc,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [DEPLOYED_ADDRESSES.hubDAO],
    chainId: baseSepolia.id,
  });

  return {
    balance: data ? formatUnits(data, 6) : "0", // USDC has 6 decimals
    balanceRaw: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to read buyback stats
 */
export function useBuybackStats() {
  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        address: DEPLOYED_ADDRESSES.buyback,
        abi: BUYBACK_ABI,
        functionName: "totalBuybackSpent",
        chainId: baseSepolia.id,
      },
      {
        address: DEPLOYED_ADDRESSES.buyback,
        abi: BUYBACK_ABI,
        functionName: "totalBurned",
        chainId: baseSepolia.id,
      },
      {
        address: EXTERNAL_ADDRESSES.usdc,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [DEPLOYED_ADDRESSES.buyback],
        chainId: baseSepolia.id,
      },
    ],
  });

  const totalSpent = data?.[0]?.result;
  const totalBurned = data?.[1]?.result;
  const buybackBalance = data?.[2]?.result;

  return {
    totalSpent: totalSpent ? formatUnits(totalSpent, 6) : "0",
    totalBurned: totalBurned ? formatUnits(totalBurned, 18) : "0", // CONSUL has 18 decimals
    buybackBalance: buybackBalance ? formatUnits(buybackBalance, 6) : "0",
    totalSpentRaw: totalSpent,
    totalBurnedRaw: totalBurned,
    buybackBalanceRaw: buybackBalance,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to read CONSUL token balance
 */
export function useConsulBalance(address?: `0x${string}`) {
  const CONSUL_ABI = [
    {
      name: "balanceOf",
      type: "function",
      inputs: [{ name: "account", type: "address" }],
      outputs: [{ type: "uint256" }],
      stateMutability: "view",
    },
  ] as const;

  const { data, isLoading, error, refetch } = useReadContract({
    address: DEPLOYED_ADDRESSES.consulToken,
    abi: CONSUL_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data ? formatUnits(data, 18) : "0",
    balanceRaw: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to read fundraiser stats
 */
export function useFundraiserStats() {
  const FUNDRAISER_ABI = [
    {
      name: "totalRaised",
      type: "function",
      inputs: [],
      outputs: [{ type: "uint256" }],
      stateMutability: "view",
    },
    {
      name: "goal",
      type: "function",
      inputs: [],
      outputs: [{ type: "uint256" }],
      stateMutability: "view",
    },
    {
      name: "isLive",
      type: "function",
      inputs: [],
      outputs: [{ type: "bool" }],
      stateMutability: "view",
    },
    {
      name: "finalized",
      type: "function",
      inputs: [],
      outputs: [{ type: "bool" }],
      stateMutability: "view",
    },
  ] as const;

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        address: DEPLOYED_ADDRESSES.fundraiser,
        abi: FUNDRAISER_ABI,
        functionName: "totalRaised",
        chainId: baseSepolia.id,
      },
      {
        address: DEPLOYED_ADDRESSES.fundraiser,
        abi: FUNDRAISER_ABI,
        functionName: "goal",
        chainId: baseSepolia.id,
      },
      {
        address: DEPLOYED_ADDRESSES.fundraiser,
        abi: FUNDRAISER_ABI,
        functionName: "isLive",
        chainId: baseSepolia.id,
      },
      {
        address: DEPLOYED_ADDRESSES.fundraiser,
        abi: FUNDRAISER_ABI,
        functionName: "finalized",
        chainId: baseSepolia.id,
      },
    ],
  });

  const totalRaised = data?.[0]?.result;
  const goal = data?.[1]?.result;
  const isLive = data?.[2]?.result;
  const finalized = data?.[3]?.result;

  return {
    totalRaised: totalRaised ? formatUnits(totalRaised, 6) : "0",
    goal: goal ? formatUnits(goal, 6) : "0",
    isLive: isLive ?? false,
    finalized: finalized ?? false,
    totalRaisedRaw: totalRaised,
    goalRaw: goal,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Format USDC amount for display
 */
export function formatUSDC(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format CONSUL amount for display
 */
export function formatConsul(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

