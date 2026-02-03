"use client";

import { type IncubationSession } from "@/lib/agent";
import { INCUBATION_FLOW, getActionDescription, getActionIcon, getStageEmoji } from "@/lib/agent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncubationStatusProps {
  session: IncubationSession | null;
}

export function IncubationStatus({ session }: IncubationStatusProps) {
  if (!session) {
    return (
      <Card className="border-dashed bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No active incubation session. Start by telling the agent about your project.
          </p>
        </CardContent>
      </Card>
    );
  }

  const completedActions = session.actions.filter(a => a.status === "completed");
  const currentAction = session.actions.find(a => a.status === "executing");
  const progress = (completedActions.length / INCUBATION_FLOW.length) * 100;

  return (
    <Card className="border-primary/20 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {getStageEmoji(session.stage)} {session.projectName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {session.ensName || "ENS pending..."}
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {session.stage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Incubation Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {INCUBATION_FLOW.map((actionType, index) => {
            const completedAction = session.actions.find(
              a => a.type === actionType && a.status === "completed"
            );
            const isExecuting = currentAction?.type === actionType;
            const isCompleted = !!completedAction;
            const isPending = !isCompleted && !isExecuting;

            return (
              <div
                key={actionType}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  isExecuting && "bg-primary/10",
                  isCompleted && "opacity-70"
                )}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : isExecuting ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    isPending && "text-muted-foreground"
                  )}>
                    {getActionIcon(actionType)} {getActionDescription(actionType)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Step {index + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Session info */}
        <div className="pt-3 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Started: {new Date(session.startedAt).toLocaleDateString()}</span>
            <span>ID: {session.id.slice(0, 12)}...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

