"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { ChatMessage, ChatInput } from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type ChatMessage as ChatMessageType,
  type IncubationSession,
  createChatMessage,
  createIncubationSession,
  generateAgentResponse,
  getActionDescription,
  INCUBATION_FLOW,
  formatUSDC,
} from "@/lib/agent";
import { 
  Rocket, 
  Sparkles, 
  Coins, 
  Shield, 
  Droplets,
  CheckCircle,
  Circle,
  Loader2,
  Settings,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";

export default function IncubatorPage() {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [session, setSession] = useState<IncubationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Start my project",
    "What is ConsulDAO?",
    "How does incubation work?",
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Welcome message on mount
  useEffect(() => {
    if (messages.length === 0 && isConnected) {
      const welcomeMessage = createChatMessage(
        "agent",
        `👋 Welcome to ConsulDAO Incubator!\n\nI'm your AI incubation assistant. I'll guide you through launching your project on Base.\n\nSay **"Start my project"** to begin!`
      );
      setMessages([welcomeMessage]);
      setSuggestions(["Start my project", "How does it work?", "What is ConsulDAO?"]);
    } else if (messages.length === 0 && !isConnected) {
      const connectMessage = createChatMessage(
        "agent",
        `👋 Welcome to ConsulDAO Incubator!\n\nPlease connect your wallet to begin the incubation process.`
      );
      setMessages([connectMessage]);
    }
  }, [isConnected, messages.length]);

  const handleSendMessage = async (content: string) => {
    if (!isConnected || !address) {
      const errorMessage = createChatMessage(
        "agent",
        "Please connect your wallet first to start the incubation process."
      );
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Add user message
    const userMessage = createChatMessage("user", content);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate agent processing
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lowerContent = content.toLowerCase();

    // If no session, create one when user wants to start
    if (!session) {
      if (
        lowerContent.includes("start") ||
        lowerContent.includes("launch") ||
        lowerContent.includes("create") ||
        lowerContent.includes("begin") ||
        lowerContent.includes("new")
      ) {
        const projectName = extractProjectName(content) || "My Project";
        const newSession = createIncubationSession(projectName, address);
        setSession(newSession);

        const response = createChatMessage(
          "agent",
          `🚀 Great! Let's launch **"${projectName}"**!\n\nFirst, choose your ENS subdomain.\n\nYour project identity will be: \`yourname.consul.eth\`\n\n**Enter the name you want** (lowercase, 3-32 chars):`
        );

        setMessages((prev) => [...prev, response]);
        setSuggestions(["defi-hub", "nft-marketplace", projectName.toLowerCase().replace(/\s+/g, "-")]);
        setIsLoading(false);
        return;
      }

      // Handle general questions when no session
      if (lowerContent.includes("how") && lowerContent.includes("work")) {
        const response = createChatMessage(
          "agent",
          `**How ConsulDAO Incubation Works:**\n\n1️⃣ **Setup** - Choose ENS name, treasury & vesting\n2️⃣ **Mint ENS** - Get yourproject.consul.eth\n3️⃣ **Treasury** - Setup USDC funding\n4️⃣ **Channels** - Open payment channels\n5️⃣ **Liquidity** - Deploy Uniswap v4 pool\n6️⃣ **Anti-Rug** - Lock founder tokens\n\nReady? Say "Start my project"!`
        );
        setMessages((prev) => [...prev, response]);
        setIsLoading(false);
        return;
      }

      if (lowerContent.includes("what") && lowerContent.includes("consuldao")) {
        const response = createChatMessage(
          "agent",
          `**ConsulDAO** is an AI-powered DAO incubator on Base.\n\nWe help founders:\n• 🔷 Create on-chain identity (ENS)\n• 💰 Setup USDC treasury\n• 🦄 Deploy liquidity pools\n• 🔒 Anti-rug protection\n\nReady to launch? Say "Start my project"!`
        );
        setMessages((prev) => [...prev, response]);
        setIsLoading(false);
        return;
      }

      // Default
      const response = createChatMessage(
        "agent",
        `I can help you launch your Web3 project on Base!\n\nSay **"Start my project"** to begin.`
      );
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
      return;
    }

    // Session exists - use the agent response generator
    const agentResponse = generateAgentResponse(content, session);

    // Update session FIRST before creating message
    let updatedSession = session;
    if (agentResponse.updateSession) {
      updatedSession = { 
        ...session, 
        ...agentResponse.updateSession,
        // Deep merge config object
        config: {
          ...session.config,
          ...(agentResponse.updateSession.config || {}),
        },
      };
      setSession(updatedSession);
      console.log("Session updated:", updatedSession.conversationStep, updatedSession.config);
    }

    // Handle action execution
    if (agentResponse.action) {
      const actionMessage = createChatMessage("agent", agentResponse.message, agentResponse.action);
      setMessages((prev) => [...prev, actionMessage]);

      // Simulate action execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Complete the action
      const completedAction = { 
        ...agentResponse.action, 
        status: "completed" as const, 
        txHash: `0x${Math.random().toString(16).slice(2, 66)}` 
      };
      
      setSession((prev) => {
        if (!prev) return null;
        const newActions = [...prev.actions, completedAction];
        
        // Update status based on action type
        const updates: Partial<IncubationSession> = { actions: newActions };
        
        if (completedAction.type === "mint_ens") {
          updates.isEnsRegistered = true;
        } else if (completedAction.type === "setup_treasury") {
          updates.usdcBalance = prev.config.treasuryAmount || 0;
        } else if (completedAction.type === "deploy_pool") {
          updates.isPoolDeployed = true;
        } else if (completedAction.type === "lock_liquidity") {
          updates.isAntiRugActive = true;
        }
        
        // Update stage
        if (newActions.length <= 2) updates.stage = "screening";
        else if (newActions.length <= 4) updates.stage = "incubating";
        else if (newActions.length <= 5) updates.stage = "launching";
        else updates.stage = "launched";
        
        return { ...prev, ...updates };
      });

      const successMessage = createChatMessage(
        "agent",
        `✅ **${getActionDescription(completedAction.type)}** completed!\n\nTx: \`${completedAction.txHash?.slice(0, 10)}...${completedAction.txHash?.slice(-6)}\`\n\nType **"continue"** for the next step.`
      );
      setMessages((prev) => [...prev, successMessage]);
      setSuggestions(["Continue", "Check status"]);
    } else {
      const responseMessage = createChatMessage("agent", agentResponse.message);
      setMessages((prev) => [...prev, responseMessage]);
      if (agentResponse.suggestions) {
        setSuggestions(agentResponse.suggestions);
      }
    }

    setIsLoading(false);
  };


  // Calculate progress
  const completedSteps = session?.actions.filter(a => a.status === "completed").length || 0;
  const progressPercent = (completedSteps / INCUBATION_FLOW.length) * 100;

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Main Container */}
      <div className="flex-1 flex pt-16 overflow-hidden">
        {/* Left Sidebar - Status Panel */}
        <div 
          className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? "w-80" : "w-0"
          } overflow-hidden`}
        >
          <div className="w-80 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Incubation Status
              </h2>
            </div>

            {/* Project Status */}
            {session && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{session.projectName}</p>
                    <p className="text-sm text-primary font-mono truncate">
                      {session.ensName || "—"}
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold">{completedSteps}/{INCUBATION_FLOW.length}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                
                <Badge variant="secondary" className="capitalize">
                  Stage: {session.stage}
                </Badge>
              </div>
            )}

            {/* Configuration Status */}
            {session && (
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configuration
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      ENS Identity
                    </span>
                    <span className={`text-sm font-medium ${session.isEnsRegistered ? "text-green-600" : ""}`}>
                      {session.isEnsRegistered && "✓ "}
                      {session.ensName?.split(".")[0] || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-500" />
                      Treasury
                    </span>
                    <span className={`text-sm font-bold ${session.usdcBalance > 0 ? "text-green-600" : ""}`}>
                      {session.config.treasuryAmount 
                        ? formatUSDC(session.config.treasuryAmount) 
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-violet-500" />
                      Vesting Lock
                    </span>
                    <span className="text-sm font-medium">
                      {session.config.vestingPeriod 
                        ? `${session.config.vestingPeriod} months` 
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Liquidity Pool
                    </span>
                    <span className={`text-sm font-medium ${session.isPoolDeployed ? "text-green-600" : ""}`}>
                      {session.isPoolDeployed ? "✓ Deployed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Incubation Steps */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-bold mb-4">
                Incubation Steps
              </h3>
              <div className="space-y-2">
                {INCUBATION_FLOW.map((actionType, index) => {
                  const isCompleted = session?.actions.some(
                    a => a.type === actionType && a.status === "completed"
                  );
                  const isExecuting = session?.actions.some(
                    a => a.type === actionType && a.status === "executing"
                  );

                  return (
                    <div
                      key={actionType}
                      className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${
                        isCompleted 
                          ? "bg-green-100 text-green-800" 
                          : isExecuting 
                          ? "bg-primary/10 text-primary" 
                          : "bg-gray-100 text-muted-foreground"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : isExecuting ? (
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{getActionDescription(actionType)}</span>
                      </div>
                      <span className="text-xs opacity-60">#{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            </div>
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-r-lg p-2 shadow-sm hover:bg-gray-50 transition-all"
          style={{ left: isSidebarOpen ? "318px" : "0" }}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-gray-600" />
          ) : (
            <PanelLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto"
          >
            {messages.length === 0 ? (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center px-4">
                <div className="p-6 rounded-full bg-gradient-to-br from-primary to-accent mb-8">
                  <Rocket className="w-16 h-16 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Launch your project</h1>
                <p className="text-lg text-muted-foreground text-center max-w-lg mb-8">
                  Connect your wallet and I'll guide you through launching your Web3 project on Base with ENS, treasury, and anti-rug protection.
                </p>
              </div>
            ) : (
              /* Messages List */
              <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-3 text-muted-foreground p-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Agent is thinking...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                suggestions={suggestions}
                placeholder={
                  isConnected
                    ? "Type your message..."
                    : "Connect wallet to start..."
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function
function extractProjectName(content: string): string | null {
  const quotedMatch = content.match(/["']([^"']+)["']/);
  if (quotedMatch) return quotedMatch[1];

  const namedMatch = content.match(/(?:called|named)\s+(\w+)/i);
  if (namedMatch) return namedMatch[1];

  const projectMatch = content.match(/project\s+["']?(\w+)["']?/i);
  if (projectMatch) return projectMatch[1];

  return null;
}
