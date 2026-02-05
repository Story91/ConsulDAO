"use client";

import { useState } from "react";
import {
    Vote,
    Clock,
    CheckCircle2,
    XCircle,
    Lock,
    TrendingUp,
    Plus,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

// Mock staking data
const STAKING = {
    userStaked: 50000,
    userVotingPower: 75000, // With 1.5x multiplier
    lockEnd: "2026-08-05",
    lockDuration: "6 months",
    totalStaked: 15000000
};

// Mock proposals
const PROPOSALS = [
    {
        id: 1,
        title: "Increase Incubator Fee to 7%",
        description: "Proposal to raise the incubator fee from 5% to 7% to fund marketing expansion.",
        type: "fee_change",
        status: "active",
        votesFor: 850000,
        votesAgainst: 320000,
        quorum: 1000000,
        endTime: "2026-02-10",
        proposer: "0x1234...5678"
    },
    {
        id: 2,
        title: "Q1 Marketing Budget: $25,000",
        description: "Allocate $25,000 USDC from treasury for Q1 marketing campaigns.",
        type: "budget",
        status: "active",
        votesFor: 620000,
        votesAgainst: 180000,
        quorum: 1000000,
        endTime: "2026-02-12",
        proposer: "0xABCD...EF01"
    },
    {
        id: 3,
        title: "Execute $10k Buyback",
        description: "Use $10,000 USDC from treasury to execute a buyback and burn.",
        type: "buyback",
        status: "passed",
        votesFor: 1200000,
        votesAgainst: 150000,
        quorum: 1000000,
        endTime: "2026-02-01",
        proposer: "0x9876...5432"
    }
];

export default function GovernancePage() {
    const [_selectedProposal, setSelectedProposal] = useState<typeof PROPOSALS[0] | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [isStaking, setIsStaking] = useState(false);
    const [stakeAmount, setStakeAmount] = useState("");
    const [stakeLock, setStakeLock] = useState("180"); // days

    const handleVote = async (_support: boolean) => {
        setIsVoting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsVoting(false);
    };

    const handleStake = async () => {
        setIsStaking(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsStaking(false);
        setStakeAmount("");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-blue-100 text-blue-700">Active</Badge>;
            case "passed":
                return <Badge className="bg-green-100 text-green-700">Passed</Badge>;
            case "rejected":
                return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "fee_change":
                return <Badge variant="outline">Fee Change</Badge>;
            case "budget":
                return <Badge variant="outline">Budget</Badge>;
            case "buyback":
                return <Badge variant="outline">Buyback</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Vote className="w-8 h-8 text-blue-500" />
                        Governance
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Stake $CONSUL, vote on proposals, and shape the DAO&apos;s future.
                    </p>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            New Proposal
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create Proposal</SheetTitle>
                            <SheetDescription>
                                Submit a new proposal for governance voting.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Coming soon - proposal creation requires minimum 100k $CONSUL staked.
                            </p>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Staking Panel */}
                <div className="space-y-4">
                    {/* Your Stake */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-violet-500" />
                                Your Stake
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Staked</p>
                                    <p className="text-xl font-bold">
                                        {STAKING.userStaked.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">$CONSUL</p>
                                </div>
                                <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
                                    <p className="text-xs text-violet-600 uppercase font-medium">Voting Power</p>
                                    <p className="text-xl font-bold text-violet-700">
                                        {STAKING.userVotingPower.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-violet-600">1.5x multiplier</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Lock Period</span>
                                <span className="font-medium">{STAKING.lockDuration}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Unlocks</span>
                                <span className="font-medium">{STAKING.lockEnd}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stake More */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                Stake $CONSUL
                            </CardTitle>
                            <CardDescription>
                                Lock tokens to earn voting power
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={stakeAmount}
                                    onChange={(e) => setStakeAmount(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Lock Period</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { days: "0", label: "None", mult: "1x" },
                                        { days: "90", label: "3mo", mult: "1.25x" },
                                        { days: "180", label: "6mo", mult: "1.5x" },
                                        { days: "365", label: "12mo", mult: "2x" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.days}
                                            className={`p-2 rounded-lg border text-center transition-colors ${stakeLock === opt.days
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "hover:bg-muted"
                                                }`}
                                            onClick={() => setStakeLock(opt.days)}
                                        >
                                            <p className="text-xs font-medium">{opt.label}</p>
                                            <p className="text-xs text-muted-foreground">{opt.mult}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                disabled={!stakeAmount || isStaking}
                                onClick={handleStake}
                            >
                                {isStaking ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Stake $CONSUL"
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Global Stats */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Staked</span>
                                <span className="font-bold">
                                    {(STAKING.totalStaked / 1000000).toFixed(1)}M $CONSUL
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Proposals List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold">Active Proposals</h2>

                    {PROPOSALS.filter(p => p.status === "active").map((proposal) => (
                        <Card
                            key={proposal.id}
                            className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => setSelectedProposal(proposal)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-2">
                                        {getStatusBadge(proposal.status)}
                                        {getTypeBadge(proposal.type)}
                                    </div>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Ends {proposal.endTime}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg mb-2">{proposal.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-1 text-green-600">
                                            <CheckCircle2 className="w-3 h-3" />
                                            For: {(proposal.votesFor / 1000).toFixed(0)}K
                                        </span>
                                        <span className="flex items-center gap-1 text-red-600">
                                            <XCircle className="w-3 h-3" />
                                            Against: {(proposal.votesAgainst / 1000).toFixed(0)}K
                                        </span>
                                    </div>
                                    <Progress
                                        value={(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}
                                        className="h-2"
                                    />
                                    <p className="text-xs text-muted-foreground text-center">
                                        Quorum: {((proposal.votesFor + proposal.votesAgainst) / proposal.quorum * 100).toFixed(0)}% of {(proposal.quorum / 1000).toFixed(0)}K required
                                    </p>
                                </div>

                                <Separator className="my-4" />

                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVote(true);
                                        }}
                                        disabled={isVoting}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Vote For
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVote(false);
                                        }}
                                        disabled={isVoting}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Vote Against
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Separator className="my-6" />

                    <h2 className="text-xl font-bold">Past Proposals</h2>

                    {PROPOSALS.filter(p => p.status !== "active").map((proposal) => (
                        <Card key={proposal.id} className="opacity-70">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex gap-2">
                                        {getStatusBadge(proposal.status)}
                                        {getTypeBadge(proposal.type)}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Ended {proposal.endTime}
                                    </span>
                                </div>
                                <h3 className="font-bold">{proposal.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Final: {(proposal.votesFor / 1000).toFixed(0)}K For / {(proposal.votesAgainst / 1000).toFixed(0)}K Against
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
