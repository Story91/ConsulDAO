import { NextRequest, NextResponse } from "next/server";
import {
  type AgentAction,
  type IncubationSession,
  type AgentActionType,
  createAgentAction,
  getActionDescription,
  INCUBATION_FLOW,
} from "@/lib/agent";
import { generateProjectSubdomain, createProjectManifest } from "@/lib/ens";

/**
 * Agent API Route
 * Handles incubation actions and returns results
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, projectName, founderAddress } = body;

    switch (action) {
      case "create_session":
        return handleCreateSession(projectName, founderAddress);

      case "execute_action":
        return handleExecuteAction(body.actionType, body.session);

      case "get_status":
        return handleGetStatus(sessionId);

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleCreateSession(
  projectName: string,
  founderAddress: string
) {
  const session: IncubationSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    projectName,
    founderAddress: founderAddress as `0x${string}`,
    ensName: generateProjectSubdomain(projectName),
    stage: "applied",
    actions: [],
    startedAt: new Date().toISOString(),
  };

  // Create project manifest for ENS
  const manifest = createProjectManifest({
    name: projectName,
    description: `${projectName} - Incubated by ConsulDAO`,
    founder: founderAddress as `0x${string}`,
    stage: "applied",
  });

  return NextResponse.json({
    success: true,
    session,
    manifest,
  });
}

async function handleExecuteAction(
  actionType: AgentActionType,
  session: IncubationSession
) {
  const action = createAgentAction(actionType, getActionDescription(actionType));
  action.status = "executing";

  // Simulate action execution
  // In production, this would call actual blockchain functions
  const result = await simulateAction(actionType, session);

  if (result.success) {
    action.status = "completed";
    action.txHash = result.txHash;
    action.result = result.message;
  } else {
    action.status = "failed";
    action.error = result.error;
  }

  // Calculate new stage
  const completedCount = session.actions.filter(
    (a) => a.status === "completed"
  ).length + (action.status === "completed" ? 1 : 0);
  
  const newStage = getStageForCompletedActions(completedCount);

  return NextResponse.json({
    success: action.status === "completed",
    action,
    newStage,
  });
}

async function handleGetStatus(sessionId: string) {
  // In production, this would fetch from database
  return NextResponse.json({
    success: true,
    sessionId,
    message: "Status check not implemented in demo",
  });
}

async function simulateAction(
  actionType: AgentActionType,
  session: IncubationSession
): Promise<{
  success: boolean;
  txHash?: string;
  message?: string;
  error?: string;
}> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate random success (95% success rate)
  const isSuccess = Math.random() > 0.05;

  if (!isSuccess) {
    return {
      success: false,
      error: "Transaction failed. Please try again.",
    };
  }

  // Generate mock transaction hash
  const txHash = `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")}`;

  // Action-specific results
  const results: Record<AgentActionType, string> = {
    mint_ens: `ENS subdomain ${session.ensName} minted successfully`,
    setup_treasury: "Treasury configured with USDC support",
    open_channel: "Yellow Network channel opened",
    approve_budget: "Initial budget of 10,000 USDC approved",
    process_payment: "Payment processed successfully",
    deploy_pool: "Uniswap v4 pool deployed",
    lock_liquidity: "Anti-Rug Hook activated (12 month lock)",
    verify_vesting: "Vesting schedule verified",
  };

  return {
    success: true,
    txHash,
    message: results[actionType],
  };
}

function getStageForCompletedActions(count: number): IncubationSession["stage"] {
  if (count === 0) return "applied";
  if (count <= 2) return "screening";
  if (count <= 4) return "incubating";
  if (count <= 5) return "launching";
  return "launched";
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ConsulDAO Agent",
    version: "1.0.0",
    supportedActions: INCUBATION_FLOW,
  });
}

