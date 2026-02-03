"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ExternalLink, 
  Users, 
  Coins, 
  Calendar,
  CheckCircle,
  Clock,
  Rocket,
  TrendingUp
} from "lucide-react";

// Mock projects data
const projects = [
  {
    id: "1",
    name: "DeFi Nexus",
    ensName: "definexus.consul.eth",
    description: "Cross-chain yield aggregator with AI-powered portfolio optimization. Automatically rebalances across 10+ chains.",
    logo: "🔮",
    stage: "launched",
    progress: 100,
    raised: "$2.4M",
    members: 12,
    launchDate: "Jan 2026",
    tags: ["DeFi", "AI", "Cross-chain"],
    website: "https://definexus.xyz",
    twitter: "definexus",
  },
  {
    id: "2",
    name: "NFT Forge",
    ensName: "nftforge.consul.eth",
    description: "No-code NFT collection builder with on-chain royalties and gasless minting on Base.",
    logo: "🎨",
    stage: "launched",
    progress: 100,
    raised: "$890K",
    members: 8,
    launchDate: "Dec 2025",
    tags: ["NFT", "Creator Tools", "Base"],
    website: "https://nftforge.io",
    twitter: "nftforge",
  },
  {
    id: "3",
    name: "PayStream",
    ensName: "paystream.consul.eth",
    description: "Real-time salary streaming for DAOs. Pay contributors by the second with USDC.",
    logo: "💸",
    stage: "launching",
    progress: 85,
    raised: "$1.2M",
    members: 6,
    launchDate: "Feb 2026",
    tags: ["Payments", "DAO", "USDC"],
    website: null,
    twitter: "paystreamfi",
  },
  {
    id: "4",
    name: "GreenDAO",
    ensName: "greendao.consul.eth",
    description: "Carbon credit marketplace with on-chain verification. Trade and retire credits transparently.",
    logo: "🌱",
    stage: "incubating",
    progress: 60,
    raised: "$500K",
    members: 5,
    launchDate: "Q2 2026",
    tags: ["RWA", "Climate", "Marketplace"],
    website: null,
    twitter: "greendao_xyz",
  },
  {
    id: "5",
    name: "SocialFi Hub",
    ensName: "socialfihub.consul.eth",
    description: "Decentralized social platform with token-gated communities and creator monetization.",
    logo: "🌐",
    stage: "incubating",
    progress: 45,
    raised: "$320K",
    members: 4,
    launchDate: "Q2 2026",
    tags: ["SocialFi", "Creator", "Community"],
    website: null,
    twitter: "socialfihub",
  },
  {
    id: "6",
    name: "GameVault",
    ensName: "gamevault.consul.eth",
    description: "Cross-game inventory system. Own your gaming assets across multiple titles.",
    logo: "🎮",
    stage: "screening",
    progress: 20,
    raised: "Seed",
    members: 3,
    launchDate: "Q3 2026",
    tags: ["Gaming", "NFT", "Interoperability"],
    website: null,
    twitter: null,
  },
];

const stageConfig = {
  launched: {
    label: "Launched",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: CheckCircle,
  },
  launching: {
    label: "Launching",
    color: "bg-primary/10 text-primary border-primary/20",
    icon: Rocket,
  },
  incubating: {
    label: "Incubating",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: TrendingUp,
  },
  screening: {
    label: "Screening",
    color: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  },
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              {projects.length} Projects
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Incubated <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover innovative Web3 projects launched through ConsulDAO. 
              All projects feature anti-rug protection and verified on-chain identity.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="text-center bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-primary">$5.3M+</p>
                <p className="text-sm text-muted-foreground">Total Raised</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">{projects.length}</p>
                <p className="text-sm text-muted-foreground">Projects</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">38</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Launched</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button variant="default" size="sm">All</Button>
            <Button variant="outline" size="sm">Launched</Button>
            <Button variant="outline" size="sm">Incubating</Button>
            <Button variant="outline" size="sm">DeFi</Button>
            <Button variant="outline" size="sm">NFT</Button>
            <Button variant="outline" size="sm">Gaming</Button>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const stage = stageConfig[project.stage as keyof typeof stageConfig];
              const StageIcon = stage.icon;
              
              return (
                <Card 
                  key={project.id} 
                  className="group hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{project.logo}</div>
                      <Badge variant="outline" className={stage.color}>
                        <StageIcon className="w-3 h-3 mr-1" />
                        {stage.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-primary font-mono">
                      {project.ensName}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        <span>{project.raised}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.members}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{project.launchDate}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {project.website && (
                      <Button asChild variant="outline" className="w-full mt-2">
                        <a href={project.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <h2 className="text-2xl font-bold mb-4">Want to join them?</h2>
            <p className="text-muted-foreground mb-6">
              Start your incubation journey with our AI agent today.
            </p>
            <Button asChild size="lg">
              <Link href="/incubator">
                <Rocket className="w-5 h-5 mr-2" />
                Start Incubation
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

