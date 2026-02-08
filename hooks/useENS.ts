"use client";

/**
 * ENS Hooks for ConsulDAO
 * 
 * Provides wagmi hooks for real ENS operations:
 * - Create subdomains: xyz.consultest.eth
 * - Set text records on ENS names
 * - Resolve ENS names
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { namehash, keccak256, encodePacked } from "viem";
import { normalize } from "viem/ens";
import { useState, useCallback } from "react";
import { type Address } from "viem";
import { sepolia } from "wagmi/chains";
import { CONSUL_PARENT_DOMAIN } from "@/lib/ens";

// ENS Registry on Sepolia (same address as mainnet)
const ENS_REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" as Address;

// ENS Public Resolver on Sepolia
const ENS_PUBLIC_RESOLVER_ADDRESS = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD" as Address;

// ENS Registry ABI
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
  {
    name: "resolver",
    type: "function",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
] as const;

// ENS Public Resolver ABI
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
 * Hook to check ENS name owner
 */
export function useENSOwner(ensName: string | undefined) {
  const node = ensName ? namehash(normalize(ensName)) : undefined;

  const { data, isLoading, error, refetch } = useReadContract({
    address: ENS_REGISTRY_ADDRESS,
    abi: ENS_REGISTRY_ABI,
    functionName: "owner",
    args: node ? [node] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!node,
    },
  });

  return {
    owner: data as Address | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for the full ENS subdomain registration
 * 
 * This creates a subdomain under consultest.eth and sets text records
 */
export function useENSRegistration() {
  const [status, setStatus] = useState<
    "idle" | "creating_subdomain" | "setting_records" | "completed" | "error"
  >("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
  });

  /**
   * Register a subdomain and set project manifest
   * 
   * Steps:
   * 1. Create subdomain: xyz.consultest.eth
   * 2. Set text record with project manifest
   */
  const registerProject = useCallback(
    async (params: {
      projectSlug: string; // e.g., "my-project"
      projectManifest: string;
      founderAddress: Address;
    }) => {
      const { projectSlug, projectManifest, founderAddress } = params;

      setStatus("creating_subdomain");
      setError(null);
      setTxHash(null);

      try {
        // Calculate parent node (consultest.eth)
        const parentNode = namehash(normalize(CONSUL_PARENT_DOMAIN));
        
        // Calculate label hash for subdomain
        const labelHash = keccak256(encodePacked(["string"], [projectSlug]));
        
        // Full subdomain name
        const fullName = `${projectSlug}.${CONSUL_PARENT_DOMAIN}`;
        const subdomainNode = namehash(normalize(fullName));

        console.log("Creating subdomain:", fullName);
        console.log("Parent node:", parentNode);
        console.log("Label hash:", labelHash);
        console.log("Subdomain node:", subdomainNode);

        // Step 1: Create subdomain using setSubnodeRecord
        // This sets owner, resolver, and TTL in one call
        const hash = await writeContractAsync({
          address: ENS_REGISTRY_ADDRESS,
          abi: ENS_REGISTRY_ABI,
          functionName: "setSubnodeRecord",
          args: [
            parentNode,
            labelHash,
            founderAddress, // Owner of the subdomain
            ENS_PUBLIC_RESOLVER_ADDRESS, // Resolver
            BigInt(0), // TTL (0 = inherit from parent)
          ],
          chainId: sepolia.id,
        });

        setTxHash(hash);
        setStatus("setting_records");

        console.log("Subdomain created! TX:", hash);
        console.log("Now set text records manually or in a follow-up transaction");

        return hash;
      } catch (err) {
        console.error("Registration error:", err);
        setStatus("error");
        const errorObj = err instanceof Error ? err : new Error("Registration failed");
        setError(errorObj);
        throw errorObj;
      }
    },
    [writeContractAsync]
  );

  /**
   * Set text record on an existing ENS name
   */
  const setTextRecord = useCallback(
    async (ensName: string, key: string, value: string) => {
      const node = namehash(normalize(ensName));

      const hash = await writeContractAsync({
        address: ENS_PUBLIC_RESOLVER_ADDRESS,
        abi: ENS_RESOLVER_ABI,
        functionName: "setText",
        args: [node, key, value],
        chainId: sepolia.id,
      });

      return hash;
    },
    [writeContractAsync]
  );

  // Update status when transaction confirms
  if (isSuccess && status === "setting_records") {
    setStatus("completed");
  }

  return {
    registerProject,
    setTextRecord,
    status,
    txHash,
    isConfirming,
    isSuccess,
    error,
    parentDomain: CONSUL_PARENT_DOMAIN,
    reset: () => {
      setStatus("idle");
      setTxHash(null);
      setError(null);
    },
  };
}

/**
 * Hook to check if a subdomain is available
 */
export function useSubdomainAvailability(subdomain: string | undefined) {
  const fullName = subdomain ? `${subdomain}.${CONSUL_PARENT_DOMAIN}` : undefined;
  const { owner, isLoading, error } = useENSOwner(fullName);

  const isAvailable = !owner || owner === "0x0000000000000000000000000000000000000000";

  return {
    isAvailable,
    owner,
    fullName,
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
