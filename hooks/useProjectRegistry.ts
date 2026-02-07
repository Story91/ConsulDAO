"use client";

/**
 * ProjectRegistry Hooks for ConsulDAO
 * 
 * Uses our own ProjectRegistry contract instead of ENS
 * This gives us real blockchain transactions for the hackathon demo
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useCallback, useEffect } from "react";
import { type Address } from "viem";
import { DEPLOYED_ADDRESSES } from "@/lib/deployed-addresses";

// ProjectRegistry contract address on Base Sepolia
const PROJECT_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_PROJECT_REGISTRY_ADDRESS || 
  DEPLOYED_ADDRESSES.projectRegistry || "0x0000000000000000000000000000000000000000") as Address;

// ProjectRegistry ABI (only the functions we need)
const PROJECT_REGISTRY_ABI = [
  {
    name: "registerProject",
    type: "function",
    inputs: [
      { name: "name", type: "string" },
      { name: "manifest", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "updateManifest",
    type: "function",
    inputs: [
      { name: "name", type: "string" },
      { name: "manifest", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getProject",
    type: "function",
    inputs: [{ name: "name", type: "string" }],
    outputs: [
      { name: "projectName", type: "string" },
      { name: "manifest", type: "string" },
      { name: "founder", type: "address" },
      { name: "registeredAt", type: "uint256" },
      { name: "exists", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    name: "isNameAvailable",
    type: "function",
    inputs: [{ name: "name", type: "string" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    name: "totalProjects",
    type: "function",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "ProjectRegistered",
    type: "event",
    inputs: [
      { name: "nameHash", type: "string", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "founder", type: "address", indexed: true },
      { name: "manifest", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

/**
 * Hook to check if a project name is available
 */
export function useProjectNameAvailable(name: string | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: PROJECT_REGISTRY_ADDRESS,
    abi: PROJECT_REGISTRY_ABI,
    functionName: "isNameAvailable",
    args: name ? [name] : undefined,
    query: {
      enabled: !!name && PROJECT_REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  return {
    isAvailable: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get project details
 */
export function useProject(name: string | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: PROJECT_REGISTRY_ADDRESS,
    abi: PROJECT_REGISTRY_ABI,
    functionName: "getProject",
    args: name ? [name] : undefined,
    query: {
      enabled: !!name && PROJECT_REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  const project = data ? {
    name: data[0] as string,
    manifest: data[1] as string,
    founder: data[2] as Address,
    registeredAt: data[3] as bigint,
    exists: data[4] as boolean,
  } : undefined;

  return {
    project,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for registering a project
 * This triggers a real blockchain transaction
 */
export function useRegisterProject() {
  const [status, setStatus] = useState<
    "idle" | "registering" | "confirming" | "completed" | "error"
  >("idle");
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync, data: txHash, reset: resetWrite } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Update status based on transaction state
  useEffect(() => {
    if (isConfirming && status === "registering") {
      setStatus("confirming");
    }
    if (isSuccess && (status === "confirming" || status === "registering")) {
      setStatus("completed");
    }
  }, [isConfirming, isSuccess, status]);

  const registerProject = useCallback(
    async (params: { name: string; manifest: string }) => {
      const { name, manifest } = params;

      if (PROJECT_REGISTRY_ADDRESS === "0x0000000000000000000000000000000000000000") {
        throw new Error("ProjectRegistry contract not deployed. Please deploy first.");
      }

      setStatus("registering");
      setError(null);

      try {
        console.log("[useRegisterProject] Registering project:", name);
        
        const hash = await writeContractAsync({
          address: PROJECT_REGISTRY_ADDRESS,
          abi: PROJECT_REGISTRY_ABI,
          functionName: "registerProject",
          args: [name, manifest],
        });

        console.log("[useRegisterProject] Transaction submitted:", hash);
        return hash;
      } catch (err) {
        console.error("[useRegisterProject] Error:", err);
        setStatus("error");
        const errorObj = err instanceof Error ? err : new Error("Registration failed");
        setError(errorObj);
        throw errorObj;
      }
    },
    [writeContractAsync]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    resetWrite();
  }, [resetWrite]);

  return {
    registerProject,
    status,
    txHash,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

/**
 * Get the contract address (for display)
 */
export function getProjectRegistryAddress(): Address {
  return PROJECT_REGISTRY_ADDRESS;
}

/**
 * Check if contract is deployed
 */
export function isContractDeployed(): boolean {
  return PROJECT_REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000";
}

