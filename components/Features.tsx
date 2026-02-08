"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Scale, Rocket, TrendingUp, Target, Wrench } from "lucide-react";

const features = [
  {
    title: "AI Incubation Agent",
    description: "Autonomous AI agent that guides you through the entire launch process - from identity to liquidity.",
    icon: Rocket,
    badge: "Agentic",
    color: "primary",
  },
  {
    title: "ENS Identity",
    description: "Instant brand identity with projectname.consultest.eth subdomain and on-chain metadata storage.",
    icon: Target,
    badge: "ENS",
    color: "accent",
  },
  {
    title: "Anti-Rug Protection",
    description: "Uniswap v4 Hook that prevents founder token dumps during 12-month vesting period.",
    icon: Scale,
    badge: "Uniswap v4",
    color: "primary",
  },
  {
    title: "USDC Treasury",
    description: "Circle-powered treasury with cross-chain transfers via CCTP for global payouts.",
    icon: TrendingUp,
    badge: "Circle",
    color: "accent",
  },
  {
    title: "Gasless Governance",
    description: "Yellow Network state channels for instant, gasless micro-agreements and approvals.",
    icon: Users,
    badge: "Yellow",
    color: "primary",
  },
  {
    title: "One-Click Launch",
    description: "Complete infrastructure to go from idea to token launch in minutes, not months.",
    icon: Wrench,
    badge: "Base",
    color: "accent",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 gradient-bg opacity-50" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge 
            variant="outline" 
            className="mb-4 px-4 py-1.5 text-sm font-medium border-accent/30 bg-accent/5 text-accent"
          >
            Complete Infrastructure
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Everything you need to{" "}
            <span className="gradient-text">launch</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            ConsulDAO comes batteries included. Complete infrastructure for Web3 founders: 
            legal setup, fundraising, talent, and product management in one DAO.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const isAccent = feature.color === "accent";
            
            return (
              <Card 
                key={index} 
                className={`group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-${feature.color}/30 hover:shadow-lg hover:shadow-${feature.color}/5 hover:-translate-y-1 animate-slide-up opacity-0`}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${feature.color}/5 rounded-full blur-2xl transition-opacity group-hover:opacity-100 opacity-0`} />
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl ${isAccent ? 'bg-accent/10' : 'bg-primary/10'} transition-colors group-hover:${isAccent ? 'bg-accent/20' : 'bg-primary/20'}`}>
                      <IconComponent className={`w-6 h-6 ${isAccent ? 'text-accent' : 'text-primary'}`} />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-medium"
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
