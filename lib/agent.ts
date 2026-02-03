/**
 * Agent Utilities for ConsulDAO Incubator
 * 
 * Defines the AI Agent that helps incubate projects:
 * - Mints ENS subdomain
 * - Opens Yellow Channel
 * - Manages treasury
 * - Deploys liquidity pool
 */

import { type Address } from "viem";
import { type ProjectStage } from "./ens";

// Agent action types
export type AgentActionType =
  | "mint_ens"
  | "setup_treasury"
  | "open_channel"
  | "approve_budget"
  | "process_payment"
  | "deploy_pool"
  | "lock_liquidity"
  | "verify_vesting";

// Agent action status
export type ActionStatus = 
  | "pending"
  | "executing"
  | "completed"
  | "failed";

// Individual agent action
export interface AgentAction {
  id: string;
  type: AgentActionType;
  status: ActionStatus;
  description: string;
  txHash?: string;
  result?: string;
  error?: string;
  timestamp: string;
}

// Incubation session - full project incubation flow
export interface IncubationSession {
  id: string;
  projectName: string;
  founderAddress: Address;
  ensName?: string;
  stage: ProjectStage;
  actions: AgentAction[];
  startedAt: string;
  completedAt?: string;
}

// Chat message in the agent interface
export interface ChatMessage {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  action?: AgentAction;
  timestamp: string;
}

// Agent response
export interface AgentResponse {
  message: string;
  action?: AgentAction;
  suggestions?: string[];
}

/**
 * Create a new incubation session
 */
export function createIncubationSession(
  projectName: string,
  founderAddress: Address
): IncubationSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    projectName,
    founderAddress,
    stage: "applied",
    actions: [],
    startedAt: new Date().toISOString(),
  };
}

/**
 * Create an agent action
 */
export function createAgentAction(
  type: AgentActionType,
  description: string
): AgentAction {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type,
    status: "pending",
    description,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a chat message
 */
export function createChatMessage(
  role: ChatMessage["role"],
  content: string,
  action?: AgentAction
): ChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    action,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get action description for UI
 */
export function getActionDescription(type: AgentActionType): string {
  const descriptions: Record<AgentActionType, string> = {
    mint_ens: "Minting ENS subdomain identity",
    setup_treasury: "Setting up USDC treasury",
    open_channel: "Opening Yellow Network channel",
    approve_budget: "Approving quarterly budget",
    process_payment: "Processing contractor payment",
    deploy_pool: "Deploying Uniswap v4 liquidity pool",
    lock_liquidity: "Locking liquidity with Anti-Rug hook",
    verify_vesting: "Verifying token vesting schedule",
  };
  return descriptions[type];
}

/**
 * Get action icon for UI
 */
export function getActionIcon(type: AgentActionType): string {
  const icons: Record<AgentActionType, string> = {
    mint_ens: "🔷",
    setup_treasury: "💰",
    open_channel: "🟡",
    approve_budget: "✅",
    process_payment: "💸",
    deploy_pool: "🦄",
    lock_liquidity: "🔒",
    verify_vesting: "📋",
  };
  return icons[type];
}

/**
 * Get stage emoji for UI
 */
export function getStageEmoji(stage: ProjectStage): string {
  const emojis: Record<ProjectStage, string> = {
    applied: "📝",
    screening: "🔍",
    incubating: "🚀",
    launching: "🎯",
    launched: "✨",
  };
  return emojis[stage];
}

/**
 * Incubation flow steps - defines the sequence of actions
 */
export const INCUBATION_FLOW: AgentActionType[] = [
  "mint_ens",       // Step 1: Create identity
  "setup_treasury", // Step 2: Setup treasury
  "open_channel",   // Step 3: Open Yellow channel for micro-agreements
  "approve_budget", // Step 4: Approve initial budget
  "deploy_pool",    // Step 5: Deploy liquidity pool
  "lock_liquidity", // Step 6: Lock with Anti-Rug hook
];

/**
 * Get the next action in the incubation flow
 */
export function getNextIncubationAction(
  completedActions: AgentActionType[]
): AgentActionType | null {
  for (const action of INCUBATION_FLOW) {
    if (!completedActions.includes(action)) {
      return action;
    }
  }
  return null;
}

/**
 * Generate agent response based on user input
 * This is a simplified version - in production, this would call an LLM
 */
export function generateAgentResponse(
  userMessage: string,
  session: IncubationSession
): AgentResponse {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for launch intent
  if (lowerMessage.includes("launch") || lowerMessage.includes("start") || lowerMessage.includes("begin")) {
    const completedTypes = session.actions
      .filter(a => a.status === "completed")
      .map(a => a.type);
    
    const nextAction = getNextIncubationAction(completedTypes);
    
    if (nextAction) {
      return {
        message: `Great! Let's continue with your project "${session.projectName}". I'll now ${getActionDescription(nextAction).toLowerCase()}.`,
        action: createAgentAction(nextAction, getActionDescription(nextAction)),
        suggestions: ["Continue", "Show status", "Cancel"],
      };
    } else {
      return {
        message: `🎉 Congratulations! Your project "${session.projectName}" has completed the incubation process and is now launched!`,
        suggestions: ["View project", "Start new project"],
      };
    }
  }
  
  // Check for status request
  if (lowerMessage.includes("status") || lowerMessage.includes("progress")) {
    const completed = session.actions.filter(a => a.status === "completed").length;
    const total = INCUBATION_FLOW.length;
    
    return {
      message: `📊 Project "${session.projectName}" Progress: ${completed}/${total} steps completed.\n\nStage: ${getStageEmoji(session.stage)} ${session.stage.charAt(0).toUpperCase() + session.stage.slice(1)}`,
      suggestions: ["Continue incubation", "View details"],
    };
  }
  
  // Default response
  return {
    message: `I'm your AI incubation assistant. How can I help you with "${session.projectName}"?`,
    suggestions: ["Launch project", "Check status", "Setup treasury"],
  };
}

