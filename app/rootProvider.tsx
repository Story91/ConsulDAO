"use client";
import { ReactNode } from "react";
import { baseSepolia, sepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";

// Multi-chain setup:
// - Base Sepolia: Smart contracts (HubDAO, AntiRugHook, etc.)
// - Sepolia: ENS subdomain minting and text records
export function RootProvider({ children }: { children: ReactNode }) {
  return (
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
  );
}
