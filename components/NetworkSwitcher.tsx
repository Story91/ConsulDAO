"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { sepolia, baseSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
      await switchChain({ chainId: requiredChainId });
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

