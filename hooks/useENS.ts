"use client";

/**
 * ENS Hooks for ConsulDAO
 * 
 * Provides wagmi hooks for real ENS operations:
 * - Resolve ENS names
 * - Set text records on ENS names
 * - Register subdomains (via custom registrar or L2 resolver)
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { namehash, encodeFunctionData } from "viem";
import { normalize } from "viem/ens";
import { useState, useCallback } from "react";
import { type Address } from "viem";
import { sepolia } from "wagmi/chains";

// ENS Public Resolver on Sepolia (official ENS testnet)
// This is the official ENS resolver for Ethereum Sepolia
const ENS_PUBLIC_RESOLVER_ADDRESS = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD" as Address;

// ENS Public Resolver ABI (subset we need)
const ENS_RESOLVER_ABI = [
  {
    name: "setText",
    type: "function",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
      { name: "value", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "text",
    type: "function",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
    ],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    name: "setAddr",
    type: "function",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "addr", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "addr",
    type: "function",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
] as const;

// ENS Registry ABI (for subdomain registration)
const ENS_REGISTRY_ABI = [
  {
    name: "setSubnodeRecord",
    type: "function",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "label", type: "bytes32" },
      { name: "owner", type: "address" },
      { name: "resolver", type: "address" },
      { name: "ttl", type: "uint64" },
    ],
    outputs: [],
  },
  {
    name: "owner",
    type: "function",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
] as const;

/**
 * Hook to read ENS text record
 */
export function useENSTextRecord(ensName: string | undefined, key: string) {
  const node = ensName ? namehash(normalize(ensName)) : undefined;

  const { data, isLoading, error, refetch } = useReadContract({
    address: ENS_PUBLIC_RESOLVER_ADDRESS,
    abi: ENS_RESOLVER_ABI,
    functionName: "text",
    args: node ? [node, key] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!node,
    },
  });

  return {
    value: data as string | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to set ENS text record
 * Requires user to own the ENS name
 */
export function useSetENSTextRecord() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync, data: txHash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const setTextRecord = useCallback(
    async (ensName: string, key: string, value: string) => {
      setIsPending(true);
      setError(null);

      try {
        const node = namehash(normalize(ensName));

        const hash = await writeContractAsync({
          address: ENS_PUBLIC_RESOLVER_ADDRESS,
          abi: ENS_RESOLVER_ABI,
          functionName: "setText",
          args: [node, key, value],
          chainId: sepolia.id,
        });

        return hash;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to set text record"));
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [writeContractAsync]
  );

  return {
    setTextRecord,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for the full ENS registration flow
 * This combines subdomain creation + text record setting
 */
export function useENSRegistration() {
  const [status, setStatus] = useState<
    "idle" | "registering" | "setting_records" | "completed" | "error"
  >("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
  });

  /**
   * Register a project with ENS
   * Sets the project manifest as a text record
   */
  const registerProject = useCallback(
    async (params: {
      ensName: string;
      projectManifest: string;
      founderAddress: Address;
    }) => {
      const { ensName, projectManifest, founderAddress } = params;

      setStatus("registering");
      setError(null);
      setTxHash(null);

      try {
        const node = namehash(normalize(ensName));

        // Set the project manifest as a text record on Sepolia
        // Key: "consul.manifest" (defined in lib/ens.ts)
        const hash = await writeContractAsync({
          address: ENS_PUBLIC_RESOLVER_ADDRESS,
          abi: ENS_RESOLVER_ABI,
          functionName: "setText",
          args: [node, "consul.manifest", projectManifest],
          chainId: sepolia.id,
        });

        setTxHash(hash);
        setStatus("setting_records");

        return hash;
      } catch (err) {
        setStatus("error");
        const errorObj = err instanceof Error ? err : new Error("Registration failed");
        setError(errorObj);
        throw errorObj;
      }
    },
    [writeContractAsync]
  );

  // Update status when transaction confirms
  if (isSuccess && status === "setting_records") {
    setStatus("completed");
  }

  return {
    registerProject,
    status,
    txHash,
    isConfirming,
    isSuccess,
    error,
    reset: () => {
      setStatus("idle");
      setTxHash(null);
      setError(null);
    },
  };
}

/**
 * Hook to check if an ENS name is available
 * (Checks if it has an owner set)
 */
export function useENSAvailability(ensName: string | undefined) {
  const node = ensName ? namehash(normalize(ensName)) : undefined;

  const { data: owner, isLoading, error } = useReadContract({
    address: ENS_L2_RESOLVER_ADDRESS,
    abi: ENS_RESOLVER_ABI,
    functionName: "addr",
    args: node ? [node] : undefined,
    query: {
      enabled: !!node,
    },
  });

  const isAvailable = owner === "0x0000000000000000000000000000000000000000" || !owner;

  return {
    isAvailable,
    owner: owner as Address | undefined,
    isLoading,
    error,
  };
}

/**
 * Utility to generate namehash for an ENS name
 */
export function getNamehash(ensName: string): `0x${string}` {
  return namehash(normalize(ensName));
}

