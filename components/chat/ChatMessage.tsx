"use client";

import { type ChatMessage as ChatMessageType } from "@/lib/agent";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle, Clock, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAgent = message.role === "agent";
  const isSystem = message.role === "system";

  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-up",
        isAgent || isSystem ? "justify-start" : "justify-end"
      )}
    >
      {(isAgent || isSystem) && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] space-y-2",
          !isAgent && !isSystem && "order-first"
        )}
      >
        <Card
          className={cn(
            "p-4",
            isAgent || isSystem
              ? "bg-muted/50 border-border"
              : "bg-primary text-primary-foreground border-primary"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Action status */}
          {message.action && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <ActionStatus action={message.action} />
            </div>
          )}
        </Card>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {!isAgent && !isSystem && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}

function ActionStatus({ action }: { action: ChatMessageType["action"] }) {
  if (!action) return null;

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-muted-foreground",
      bg: "bg-muted",
      label: "Pending",
      animate: false,
    },
    executing: {
      icon: Loader2,
      color: "text-primary",
      bg: "bg-primary/10",
      label: "Executing",
      animate: true,
    },
    completed: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-500/10",
      label: "Completed",
      animate: false,
    },
    failed: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "Failed",
      animate: false,
    },
  };

  const config = statusConfig[action.status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={cn("p-1.5 rounded-lg", config.bg)}>
        <Icon
          className={cn(
            "w-4 h-4",
            config.color,
            config.animate && "animate-spin"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{action.description}</p>
        {action.txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${action.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View transaction →
          </a>
        )}
        {action.error && (
          <p className="text-xs text-destructive">{action.error}</p>
        )}
      </div>
      <Badge variant="outline" className={cn("text-xs", config.color)}>
        {config.label}
      </Badge>
    </div>
  );
}

