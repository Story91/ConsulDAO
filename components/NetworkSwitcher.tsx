"use client";

import { useChainId, useSwitchChain, useAccount } from "wagmi";
import { sepolia, baseSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, CheckCircle2, ChevronDown, Globe } from "lucide-react";

interface NetworkSwitcherProps {
  requiredChainId: number;
  requiredChainName: string;
  onSwitchSuccess?: () => void;
  className?: string;
}

export function NetworkSwitcher({
  requiredChainId,
  requiredChainName,
  onSwitchSuccess,
  className = "",
}: NetworkSwitcherProps) {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isCorrectNetwork = chainId === requiredChainId;

  if (isCorrectNetwork) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span className="text-muted-foreground">
          Connected to {requiredChainName}
        </span>
      </div>
    );
  }

  const handleSwitch = async () => {
    try {
      await switchChain({ chainId: requiredChainId as 1 | 11155111 | 84532 });
      onSwitchSuccess?.();
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg ${className}`}>
      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900">
          Wrong Network
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Please switch to {requiredChainName} to continue
        </p>
      </div>
      <Button
        onClick={handleSwitch}
        disabled={isPending}
        size="sm"
        className="bg-amber-600 hover:bg-amber-700 text-white"
      >
        {isPending ? "Switching..." : "Switch Network"}
      </Button>
    </div>
  );
}

/**
 * Quick network badge showing current network
 */
export function NetworkBadge() {
  const chainId = useChainId();

  const getNetworkInfo = () => {
    switch (chainId) {
      case sepolia.id:
        return { name: "Sepolia", color: "bg-blue-100 text-blue-700" };
      case baseSepolia.id:
        return { name: "Base Sepolia", color: "bg-purple-100 text-purple-700" };
      default:
        return { name: "Unknown", color: "bg-gray-100 text-gray-700" };
    }
  };

  const { name, color } = getNetworkInfo();

  return (
    <Badge variant="outline" className={`${color} border-0`}>
      {name}
    </Badge>
  );
}

/**
 * Quick network switcher dropdown for navbar
 */
export function QuickNetworkSwitcher() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) {
    return null;
  }

  const networks = [
    {
      id: baseSepolia.id,
      name: "Base Sepolia",
      description: "Contracts & DAO",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: sepolia.id,
      name: "Sepolia",
      description: "ENS Names",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  const currentNetwork = networks.find((n) => n.id === chainId) || networks[0];

  const handleSwitch = async (networkId: number) => {
    if (networkId === chainId) return;
    try {
      await switchChain({ chainId: networkId as 1 | 11155111 | 84532 });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${currentNetwork.bgColor} ${currentNetwork.color} border-0 gap-1.5 font-medium`}
          disabled={isPending}
        >
          <Globe className="w-3.5 h-3.5" />
          {isPending ? "Switching..." : currentNetwork.name}
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => handleSwitch(network.id)}
            className={`flex items-center justify-between cursor-pointer ${
              network.id === chainId ? "bg-muted" : ""
            }`}
          >
            <div>
              <div className={`font-medium ${network.color}`}>{network.name}</div>
              <div className="text-xs text-muted-foreground">{network.description}</div>
            </div>
            {network.id === chainId && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

