import { http, createConfig } from "wagmi";
import { baseSepolia, sepolia } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

// WalletConnect project ID (get from cloud.walletconnect.com)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const wagmiConfig = createConfig({
  chains: [baseSepolia, sepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "ConsulDAO",
      preference: "all",
    }),
    ...(projectId
      ? [
          walletConnect({
            projectId,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

