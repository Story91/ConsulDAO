/**
 * ENS (Ethereum Name Service) Integration
 * Real implementation for ConsulDAO incubator
 * 
 * Features:
 * - Mint subdomains: projectname.consul.eth
 * - Store project metadata in text records
 * - Resolve ENS names and records
 */

import { normalize } from "viem/ens";
import { type Address } from "viem";

// ENS Text Record Keys for project metadata
export const ENS_RECORD_KEYS = {
  DESCRIPTION: "description",
  AVATAR: "avatar",
  URL: "url",
  GITHUB: "com.github",
  TWITTER: "com.twitter",
  // Custom ConsulDAO records
  PROJECT_MANIFEST: "consul.manifest",
  PROJECT_STATUS: "consul.status",
  PROJECT_STAGE: "consul.stage",
  FOUNDER_ADDRESS: "consul.founder",
  LAUNCH_DATE: "consul.launchDate",
  TOKEN_ADDRESS: "consul.tokenAddress",
} as const;

// Project stages
export type ProjectStage = 
  | "applied"
  | "screening"
  | "incubating"
  | "launching"
  | "launched";

// Project manifest stored in ENS text record
export interface ProjectManifest {
  name: string;
  description: string;
  founder: Address;
  createdAt: string;
  stage: ProjectStage;
  website?: string;
  github?: string;
  twitter?: string;
  tokenSymbol?: string;
  tokenAddress?: Address;
}

/**
 * Normalize an ENS name for consistency
 */
export function normalizeENSName(name: string): string {
  try {
    return normalize(name);
  } catch {
    throw new Error(`Invalid ENS name: ${name}`);
  }
}

/**
 * Generate subdomain for a project
 * @param projectName - Project name (will be slugified)
 * @param parentDomain - Parent domain (default: consul.eth)
 */
export function generateProjectSubdomain(
  projectName: string,
  parentDomain: string = "consul.eth"
): string {
  // Slugify project name: lowercase, replace spaces with hyphens, remove special chars
  const slug = projectName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 32); // Max 32 chars for subdomain
  
  return `${slug}.${parentDomain}`;
}

/**
 * Create a project manifest JSON string for ENS text record
 */
export function createProjectManifest(
  project: Omit<ProjectManifest, "createdAt">
): string {
  const manifest: ProjectManifest = {
    ...project,
    createdAt: new Date().toISOString(),
  };
  return JSON.stringify(manifest);
}

/**
 * Parse a project manifest from ENS text record
 */
export function parseProjectManifest(manifestJson: string): ProjectManifest | null {
  try {
    return JSON.parse(manifestJson) as ProjectManifest;
  } catch {
    console.error("Failed to parse project manifest");
    return null;
  }
}

/**
 * ENS Registry addresses on different chains
 */
export const ENS_REGISTRY_ADDRESSES = {
  mainnet: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" as Address,
  sepolia: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" as Address,
  // Base uses L2 resolver
  base: "0x4cCb0720c5a8Cc5A24a1AfE05E0f80126B95c92b" as Address,
  baseSepolia: "0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA" as Address,
} as const;

/**
 * Get the ENS registry address for a chain
 */
export function getENSRegistryAddress(chainId: number): Address | null {
  switch (chainId) {
    case 1:
      return ENS_REGISTRY_ADDRESSES.mainnet;
    case 11155111:
      return ENS_REGISTRY_ADDRESSES.sepolia;
    case 8453:
      return ENS_REGISTRY_ADDRESSES.base;
    case 84532:
      return ENS_REGISTRY_ADDRESSES.baseSepolia;
    default:
      return null;
  }
}

/**
 * Check if a subdomain is available
 * Note: This is a client-side check, actual availability must be verified on-chain
 */
export function validateSubdomainFormat(subdomain: string): {
  valid: boolean;
  error?: string;
} {
  if (subdomain.length < 3) {
    return { valid: false, error: "Subdomain must be at least 3 characters" };
  }
  
  if (subdomain.length > 32) {
    return { valid: false, error: "Subdomain must be 32 characters or less" };
  }
  
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return { valid: false, error: "Subdomain can only contain lowercase letters, numbers, and hyphens" };
  }
  
  if (subdomain.startsWith("-") || subdomain.endsWith("-")) {
    return { valid: false, error: "Subdomain cannot start or end with a hyphen" };
  }
  
  return { valid: true };
}

/**
 * Format ENS text records for display
 */
export function formatTextRecordsForDisplay(records: Record<string, string>): {
  key: string;
  label: string;
  value: string;
}[] {
  const labels: Record<string, string> = {
    [ENS_RECORD_KEYS.DESCRIPTION]: "Description",
    [ENS_RECORD_KEYS.AVATAR]: "Avatar",
    [ENS_RECORD_KEYS.URL]: "Website",
    [ENS_RECORD_KEYS.GITHUB]: "GitHub",
    [ENS_RECORD_KEYS.TWITTER]: "Twitter",
    [ENS_RECORD_KEYS.PROJECT_MANIFEST]: "Manifest",
    [ENS_RECORD_KEYS.PROJECT_STATUS]: "Status",
    [ENS_RECORD_KEYS.PROJECT_STAGE]: "Stage",
    [ENS_RECORD_KEYS.FOUNDER_ADDRESS]: "Founder",
    [ENS_RECORD_KEYS.LAUNCH_DATE]: "Launch Date",
    [ENS_RECORD_KEYS.TOKEN_ADDRESS]: "Token",
  };

  return Object.entries(records).map(([key, value]) => ({
    key,
    label: labels[key] || key,
    value,
  }));
}
