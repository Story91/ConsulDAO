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

// Project configuration - user-defined values
export interface ProjectConfig {
  ensName: string;
  treasuryAmount: number; // USDC amount
  vestingPeriod: number; // months
  liquidityPercent: number; // % of tokens for liquidity
}

// Conversation state for guiding user through setup
export type ConversationStep =
  | "welcome"
  | "ask_project_name"
  | "ask_ens_name"
  | "ask_treasury_amount"
  | "ask_vesting_period"
  | "confirm_config"
  | "incubating"
  | "completed";

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
  // New fields for configuration
  config: Partial<ProjectConfig>;
  conversationStep: ConversationStep;
  // Status tracking
  usdcBalance: number;
  isEnsRegistered: boolean;
  isPoolDeployed: boolean;
  isAntiRugActive: boolean;
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
  updateSession?: Partial<IncubationSession>;
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
    config: {},
    conversationStep: "ask_ens_name",
    usdcBalance: 0,
    isEnsRegistered: false,
    isPoolDeployed: false,
    isAntiRugActive: false,
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
 * Validate ENS name format
 */
export function validateEnsName(name: string): boolean {
  // Basic validation: alphanumeric, lowercase, no spaces
  return /^[a-z0-9-]+$/.test(name) && name.length >= 3 && name.length <= 32;
}

/**
 * Format USDC amount
 */
export function formatUSDC(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate agent response based on conversation step
 * This handles the interactive flow asking user for configuration
 */
export function generateAgentResponse(
  userMessage: string,
  session: IncubationSession
): AgentResponse {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Handle based on conversation step
  switch (session.conversationStep) {
    case "ask_ens_name": {
      // User is providing ENS name
      const ensInput = lowerMessage.replace(/\.consul\.eth$/, "").replace(/[^a-z0-9-]/g, "");
      
      if (!ensInput || ensInput.length < 3) {
        return {
          message: "Please provide a valid name (at least 3 characters, letters and numbers only).\n\nExample: \"myproject\" → myproject.consul.eth",
          suggestions: ["defi-hub", "nft-marketplace", "dao-tools"],
        };
      }
      
      if (!validateEnsName(ensInput)) {
        return {
          message: `"${ensInput}" is not valid. Use only lowercase letters, numbers, and hyphens (3-32 characters).\n\nTry again:`,
          suggestions: ["myproject", "web3-app", "token-launch"],
        };
      }
      
      const fullEnsName = `${ensInput}.consul.eth`;
      
      return {
        message: `✅ Great choice! Your ENS identity will be: **${fullEnsName}**\n\nNow, how much USDC would you like to allocate to your treasury?\n\nThis will be used for:\n• Development costs\n• Marketing\n• Initial liquidity\n\nEnter amount in USD (minimum $1,000):`,
        suggestions: ["$5,000", "$10,000", "$25,000", "$50,000"],
        updateSession: {
          ensName: fullEnsName,
          config: { ...session.config, ensName: fullEnsName },
          conversationStep: "ask_treasury_amount",
        },
      };
    }
    
    case "ask_treasury_amount": {
      // Parse USDC amount from user input
      const amountMatch = lowerMessage.match(/[\d,]+/);
      if (!amountMatch) {
        return {
          message: "Please enter a valid amount in USD.\n\nExample: \"10000\" or \"$25,000\"",
          suggestions: ["$5,000", "$10,000", "$25,000"],
        };
      }
      
      const amount = parseInt(amountMatch[0].replace(/,/g, ""), 10);
      
      if (isNaN(amount) || amount < 1000) {
        return {
          message: "Minimum treasury amount is $1,000 USDC.\n\nPlease enter a higher amount:",
          suggestions: ["$5,000", "$10,000", "$25,000"],
        };
      }
      
      if (amount > 10000000) {
        return {
          message: "For amounts over $10M, please contact our team directly.\n\nEnter a smaller amount or reach out to us:",
          suggestions: ["$100,000", "$500,000", "Contact team"],
        };
      }
      
      return {
        message: `💰 Treasury: **${formatUSDC(amount)} USDC**\n\nNext, set your founder vesting period.\n\nThis determines how long your tokens are locked (Anti-Rug protection):\n• Minimum: 6 months\n• Recommended: 12 months\n• Maximum: 48 months\n\nHow many months?`,
        suggestions: ["6 months", "12 months", "24 months", "36 months"],
        updateSession: {
          config: { ...session.config, treasuryAmount: amount },
          conversationStep: "ask_vesting_period",
        },
      };
    }
    
    case "ask_vesting_period": {
      // Parse months from user input
      const monthsMatch = lowerMessage.match(/\d+/);
      if (!monthsMatch) {
        return {
          message: "Please enter the vesting period in months.\n\nExample: \"12\" or \"12 months\"",
          suggestions: ["6 months", "12 months", "24 months"],
        };
      }
      
      const months = parseInt(monthsMatch[0], 10);
      
      if (months < 6) {
        return {
          message: "⚠️ Minimum vesting period is 6 months for Anti-Rug protection.\n\nPlease choose at least 6 months:",
          suggestions: ["6 months", "12 months", "24 months"],
        };
      }
      
      if (months > 48) {
        return {
          message: "Maximum vesting period is 48 months.\n\nPlease choose a shorter period:",
          suggestions: ["24 months", "36 months", "48 months"],
        };
      }
      
      const config = {
        ...session.config,
        vestingPeriod: months,
        liquidityPercent: 20, // Default 20%
      };
      
      return {
        message: `🔒 Vesting: **${months} months**\n\n━━━━━━━━━━━━━━━━━━━━━\n\n**📋 Configuration Summary**\n\n🔷 ENS Identity: ${session.ensName}\n💰 Treasury: ${formatUSDC(config.treasuryAmount || 0)} USDC\n🔒 Vesting: ${months} months\n💧 Liquidity: 20% of tokens\n\n━━━━━━━━━━━━━━━━━━━━━\n\nDoes this look correct? Type "confirm" to start incubation or "change" to modify.`,
        suggestions: ["Confirm and start", "Change ENS name", "Change treasury amount"],
        updateSession: {
          config,
          conversationStep: "confirm_config",
        },
      };
    }
    
    case "confirm_config": {
      if (lowerMessage.includes("confirm") || lowerMessage.includes("yes") || lowerMessage.includes("start")) {
        return {
          message: `🚀 **Incubation Started!**\n\nI'll now begin the 6-step process:\n\n1. Mint ENS: ${session.ensName}\n2. Setup Treasury: ${formatUSDC(session.config.treasuryAmount || 0)}\n3. Open Yellow Channel\n4. Approve Budget\n5. Deploy Liquidity Pool\n6. Activate Anti-Rug (${session.config.vestingPeriod}mo lock)\n\nType "continue" to execute the first step.`,
          suggestions: ["Continue", "View status"],
          updateSession: {
            conversationStep: "incubating",
            stage: "screening",
          },
        };
      }
      
      if (lowerMessage.includes("change") || lowerMessage.includes("modify")) {
        if (lowerMessage.includes("ens") || lowerMessage.includes("name")) {
          return {
            message: "What would you like your new ENS name to be?\n\nCurrent: " + session.ensName,
            suggestions: ["new-project", "my-dao", "web3-app"],
            updateSession: { conversationStep: "ask_ens_name" },
          };
        }
        if (lowerMessage.includes("treasury") || lowerMessage.includes("usdc") || lowerMessage.includes("amount")) {
          return {
            message: `What treasury amount would you like?\n\nCurrent: ${formatUSDC(session.config.treasuryAmount || 0)}`,
            suggestions: ["$10,000", "$25,000", "$50,000"],
            updateSession: { conversationStep: "ask_treasury_amount" },
          };
        }
        return {
          message: "What would you like to change?\n\n• ENS name\n• Treasury amount\n• Vesting period",
          suggestions: ["Change ENS name", "Change treasury", "Change vesting"],
        };
      }
      
      return {
        message: "Please confirm the configuration or tell me what you'd like to change.",
        suggestions: ["Confirm and start", "Change ENS name", "Change treasury amount"],
      };
    }
    
    case "incubating": {
      // Handle incubation commands
      if (lowerMessage.includes("continue") || lowerMessage.includes("next") || lowerMessage.includes("execute")) {
        const completedTypes = session.actions
          .filter(a => a.status === "completed")
          .map(a => a.type);
        
        const nextAction = getNextIncubationAction(completedTypes);
        
        if (nextAction) {
          return {
            message: `⏳ Executing: ${getActionDescription(nextAction)}...`,
            action: createAgentAction(nextAction, getActionDescription(nextAction)),
            suggestions: ["Continue", "View status"],
          };
        } else {
          return {
            message: `🎉 **Incubation Complete!**\n\nYour project "${session.projectName}" is now fully configured:\n\n✅ ENS: ${session.ensName}\n✅ Treasury: ${formatUSDC(session.config.treasuryAmount || 0)} USDC\n✅ Liquidity Pool: Deployed\n✅ Anti-Rug: Active (${session.config.vestingPeriod}mo)\n\nYou're ready to launch!`,
            suggestions: ["View project", "Start new project"],
            updateSession: {
              conversationStep: "completed",
              stage: "launched",
              isAntiRugActive: true,
              isPoolDeployed: true,
            },
          };
        }
      }
      
      if (lowerMessage.includes("status")) {
        const completed = session.actions.filter(a => a.status === "completed").length;
        return {
          message: `📊 **Incubation Status**\n\nProject: ${session.projectName}\nProgress: ${completed}/${INCUBATION_FLOW.length} steps\n\n🔷 ENS: ${session.isEnsRegistered ? "✅ Registered" : "⏳ Pending"}\n💰 Treasury: ${formatUSDC(session.usdcBalance)} / ${formatUSDC(session.config.treasuryAmount || 0)}\n🦄 Pool: ${session.isPoolDeployed ? "✅ Deployed" : "⏳ Pending"}\n🔒 Anti-Rug: ${session.isAntiRugActive ? "✅ Active" : "⏳ Pending"}`,
          suggestions: ["Continue", "View details"],
        };
      }
      
      return {
        message: `I'm working on "${session.projectName}". What would you like to do?`,
        suggestions: ["Continue incubation", "Check status", "View config"],
      };
    }
    
    default:
      return {
        message: `How can I help you with your project?`,
        suggestions: ["Start incubation", "Check status"],
      };
  }
}
