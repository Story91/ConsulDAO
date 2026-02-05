"use client";
import {
    LayoutDashboard,
    Users,
    Coins,
    Vote,
    Shield,
    Briefcase,
    ArrowUpRight,
    TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data for 3 squads (Genesis Transition model)
const SQUADS = [
    {
        id: 1,
        name: "Admissions",
        type: "Admissions",
        description: "Decide who gets incubated",
        members: 1,
        budget: 0,
        safeAddress: "0x...admissions",
        icon: Shield,
        color: "text-violet-500",
        bgColor: "bg-violet-100"
    },
    {
        id: 2,
        name: "Services",
        type: "Services",
        description: "Execute work via agents & contractors",
        members: 1,
        budget: 5000,
        safeAddress: "0x...services",
        icon: Briefcase,
        color: "text-blue-500",
        bgColor: "bg-blue-100"
    },
    {
        id: 3,
        name: "Treasury",
        type: "Treasury",
        description: "Hold and manage DAO funds",
        members: 1,
        budget: 50000,
        safeAddress: "0x...treasury",
        icon: Coins,
        color: "text-amber-500",
        bgColor: "bg-amber-100"
    }
];

// Mock stats
const STATS = {
    treasuryBalance: 50000,
    totalStaked: 1500000,
    activeProposals: 2,
    consulPrice: 0.42
};

export default function DaoPage() {

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <LayoutDashboard className="w-8 h-8 text-primary" />
                    DAO Overview
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage your DAO&apos;s squads, treasury, and governance.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                                <Coins className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Treasury</p>
                                <p className="text-2xl font-bold">${STATS.treasuryBalance.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-100">
                                <TrendingUp className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">$CONSUL Staked</p>
                                <p className="text-2xl font-bold">{(STATS.totalStaked / 1000000).toFixed(1)}M</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Vote className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Proposals</p>
                                <p className="text-2xl font-bold">{STATS.activeProposals}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Coins className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">$CONSUL Price</p>
                                <p className="text-2xl font-bold">${STATS.consulPrice}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3 Squads Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Genesis Squads
                    </h2>
                    <Link href="/dao/squads">
                        <Button variant="outline" size="sm" className="gap-1">
                            Manage <ArrowUpRight className="w-3 h-3" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SQUADS.map((squad) => (
                        <Card key={squad.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${squad.bgColor}`}>
                                        <squad.icon className={`w-6 h-6 ${squad.color}`} />
                                    </div>
                                    <Badge variant="secondary">{squad.type}</Badge>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{squad.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {squad.description}
                                </p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        <Users className="w-3 h-3 inline mr-1" />
                                        {squad.members} signer(s)
                                    </span>
                                    <span className="font-medium">
                                        ${squad.budget.toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-amber-500" />
                            Treasury & Fundraising
                        </CardTitle>
                        <CardDescription>
                            View treasury balance, contributions, and execute buybacks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dao/funds">
                            <Button className="w-full">Open Treasury</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Vote className="w-5 h-5 text-blue-500" />
                            Governance
                        </CardTitle>
                        <CardDescription>
                            Vote on proposals, stake $CONSUL, and participate in DAO decisions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dao/governance">
                            <Button className="w-full">View Proposals</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
