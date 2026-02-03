"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { ChatMessage, ChatInput, IncubationStatus } from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  type ChatMessage as ChatMessageType,
  type IncubationSession,
  type AgentAction,
  createChatMessage,
  createIncubationSession,
  generateAgentResponse,
  createAgentAction,
  getActionDescription,
  INCUBATION_FLOW,
} from "@/lib/agent";
import { generateProjectSubdomain } from "@/lib/ens";
import { Rocket, Sparkles, Zap } from "lucide-react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = createChatMessage(
        "agent",
        `👋 Welcome to ConsulDAO Incubator!\n\nI'm your AI incubation assistant. I'll help you launch your project on Base with:\n\n🔷 ENS Identity (projectname.consul.eth)\n💰 USDC Treasury setup\n🦄 Uniswap v4 liquidity pool\n🔒 Anti-Rug protection\n\n${isConnected ? `Connected as: ${address?.slice(0, 6)}...${address?.slice(-4)}\n\nTell me about your project to get started!` : "Please connect your wallet to begin."}`
      );
      setMessages([welcomeMessage]);
    }
  }, [isConnected, address, messages.length]);

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
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if starting a new project
    const lowerContent = content.toLowerCase();
    if (
      !session &&
      (lowerContent.includes("start") ||
        lowerContent.includes("launch") ||
        lowerContent.includes("create") ||
        lowerContent.includes("begin"))
    ) {
      // Extract project name or use default
      const projectName = extractProjectName(content) || "My Project";
      const newSession = createIncubationSession(projectName, address);
      newSession.ensName = generateProjectSubdomain(projectName);
      setSession(newSession);

      const response = createChatMessage(
        "agent",
        `🚀 Great! Let's incubate "${projectName}"!\n\nI've created your incubation session. Your project will get:\n\n• ENS: ${newSession.ensName}\n• Stage: Applied\n\nShall I begin the incubation process? This will:\n1. Mint your ENS identity\n2. Setup your treasury\n3. Configure anti-rug protection\n4. Prepare liquidity pool`,
        undefined
      );

      setMessages((prev) => [...prev, response]);
      setSuggestions(["Begin incubation", "Change project name", "Learn more"]);
      setIsLoading(false);
      return;
    }

    // Handle incubation commands
    if (session) {
      if (
        lowerContent.includes("begin") ||
        lowerContent.includes("continue") ||
        lowerContent.includes("next")
      ) {
        await executeNextAction();
        return;
      }

      // Generate response based on session
      const response = generateAgentResponse(content, session);
      const agentMessage = createChatMessage(
        "agent",
        response.message,
        response.action
      );
      setMessages((prev) => [...prev, agentMessage]);
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } else {
      // General Q&A
      const response = handleGeneralQuery(content);
      const agentMessage = createChatMessage("agent", response);
      setMessages((prev) => [...prev, agentMessage]);
    }

    setIsLoading(false);
  };

  const executeNextAction = async () => {
    if (!session) return;

    const completedTypes = session.actions
      .filter((a) => a.status === "completed")
      .map((a) => a.type);

    const nextActionType = INCUBATION_FLOW.find(
      (type) => !completedTypes.includes(type)
    );

    if (!nextActionType) {
      const completeMessage = createChatMessage(
        "agent",
        `🎉 Congratulations! "${session.projectName}" has completed the incubation process!\n\nYour project is now:\n✅ Identity: ${session.ensName}\n✅ Treasury: Configured\n✅ Liquidity: Deployed\n✅ Anti-Rug: Active\n\nYou're ready to launch!`
      );
      setMessages((prev) => [...prev, completeMessage]);
      setSession((prev) =>
        prev ? { ...prev, stage: "launched", completedAt: new Date().toISOString() } : null
      );
      setSuggestions(["View project", "Start new project"]);
      setIsLoading(false);
      return;
    }

    // Create and start action
    const action = createAgentAction(
      nextActionType,
      getActionDescription(nextActionType)
    );
    action.status = "executing";

    const executingMessage = createChatMessage(
      "agent",
      `⏳ Executing: ${getActionDescription(nextActionType)}...`,
      action
    );
    setMessages((prev) => [...prev, executingMessage]);

    // Simulate execution
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

    // Complete action
    action.status = "completed";
    action.txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    action.result = "Success";

    // Update session
    setSession((prev) => {
      if (!prev) return null;
      const newActions = [...prev.actions, action];
      const newStage = getStageForCompletedActions(newActions.length);
      return { ...prev, actions: newActions, stage: newStage };
    });

    // Success message
    const successMessage = createChatMessage(
      "agent",
      `✅ ${getActionDescription(nextActionType)} completed!\n\n${getActionSuccessDetails(nextActionType, session)}`,
      { ...action, status: "completed" }
    );
    setMessages((prev) => [...prev, successMessage]);
    setSuggestions(["Continue to next step", "View status", "Pause"]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">AI Incubator</h1>
              <Badge variant="outline" className="ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Autonomous
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Your AI-powered incubation assistant. From idea to token launch in minutes.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat Section */}
            <div className="lg:col-span-2">
              <Card className="h-[calc(100vh-280px)] flex flex-col">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Incubation Chat
                    </CardTitle>
                    {session && (
                      <Badge variant="secondary" className="capitalize">
                        {session.stage}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input */}
                <div className="p-4 border-t">
                  <ChatInput
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                    suggestions={suggestions}
                    placeholder={
                      isConnected
                        ? "Tell me about your project..."
                        : "Connect wallet to start..."
                    }
                  />
                </div>
              </Card>
            </div>

            {/* Status Sidebar */}
            <div className="space-y-6">
              <IncubationStatus session={session} />

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSendMessage("Start my project")}
                    disabled={!!session || !isConnected}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSendMessage("Continue incubation")}
                    disabled={!session || isLoading}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">💡 Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    The AI agent will automatically mint your ENS identity, setup
                    treasury, and deploy your liquidity pool with anti-rug protection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper functions
function extractProjectName(content: string): string | null {
  // Try to extract project name from quotes
  const quotedMatch = content.match(/["']([^"']+)["']/);
  if (quotedMatch) return quotedMatch[1];

  // Try to extract from "called X" or "named X"
  const namedMatch = content.match(/(?:called|named)\s+(\w+)/i);
  if (namedMatch) return namedMatch[1];

  // Try to extract from "project X" or "X project"
  const projectMatch = content.match(/(?:project\s+)?(\w+)(?:\s+project)?/i);
  if (projectMatch && projectMatch[1].toLowerCase() !== "my") {
    return projectMatch[1];
  }

  return null;
}

function handleGeneralQuery(content: string): string {
  const lower = content.toLowerCase();

  if (lower.includes("what") && lower.includes("consuldao")) {
    return `ConsulDAO is an AI-powered DAO incubator on Base. We help founders:\n\n• Create on-chain identity (ENS)\n• Setup USDC treasury\n• Deploy liquidity with anti-rug protection\n• Launch tokens safely\n\nWant to start your project?`;
  }

  if (lower.includes("how") && lower.includes("work")) {
    return `The incubation process has 6 steps:\n\n1️⃣ Mint ENS identity\n2️⃣ Setup USDC treasury\n3️⃣ Open governance channel\n4️⃣ Approve budget\n5️⃣ Deploy liquidity pool\n6️⃣ Lock with Anti-Rug hook\n\nAll automated by your AI agent!`;
  }

  return `I can help you incubate your Web3 project on Base. Try saying "Start my project called [name]" to begin!`;
}

function getStageForCompletedActions(count: number): IncubationSession["stage"] {
  if (count === 0) return "applied";
  if (count <= 2) return "screening";
  if (count <= 4) return "incubating";
  if (count <= 5) return "launching";
  return "launched";
}

function getActionSuccessDetails(
  actionType: string,
  session: IncubationSession
): string {
  switch (actionType) {
    case "mint_ens":
      return `Your project identity is now: ${session.ensName}`;
    case "setup_treasury":
      return "USDC treasury is ready to receive funds.";
    case "open_channel":
      return "Yellow Network channel opened for micro-agreements.";
    case "approve_budget":
      return "Initial budget approved for operations.";
    case "deploy_pool":
      return "Uniswap v4 liquidity pool deployed.";
    case "lock_liquidity":
      return "Anti-Rug Hook activated. Founder sells are restricted for 1 year.";
    default:
      return "Action completed successfully.";
  }
}

