"use client";

import { ReactNode } from "react";
import { baseSepolia, sepolia as _sepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";

// Create a client for React Query
const queryClient = new QueryClient();

/**
 * Multi-chain setup:
 * - Base Sepolia (84532): Smart contracts (HubDAO, AntiRugHook, etc.)
 * - Sepolia (11155111): ENS subdomain minting and text records
 * 
 * WagmiProvider enables switching between chains.
 * OnchainKitProvider adds Coinbase wallet features.
 */
export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={baseSepolia}
          config={{
            appearance: {
              mode: "auto",
            },
            wallet: {
              display: "modal",
              preference: "all",
            },
          }}
          miniKit={{
            enabled: true,
            autoConnect: true,
            notificationProxyUrl: undefined,
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
