"use client";

import { useState } from "react";
import {
    Coins,
    TrendingUp,
    HandCoins,
    Flame,
    History,
    DollarSign,
    Loader2,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    useTreasuryBalance, 
    useBuybackStats, 
    useConsulBalance, 
    useFundraiserStats,
    formatUSDC,
    formatConsul
} from "@/hooks/useTreasury";
import { DEPLOYED_ADDRESSES } from "@/lib/deployed-addresses";

// Mock contribution history
const CONTRIBUTIONS = [
    { id: 1, contributor: "0x1234...5678", amount: 10000, timestamp: "2026-02-01" },
    { id: 2, contributor: "0xABCD...EF01", amount: 25000, timestamp: "2026-01-28" },
    { id: 3, contributor: "0x9876...5432", amount: 15000, timestamp: "2026-01-25" }
];

// Mock buyback history
const BUYBACKS = [
    { id: 1, usdcSpent: 5000, consulBurned: 12500, timestamp: "2026-02-04" },
    { id: 2, usdcSpent: 10000, consulBurned: 23000, timestamp: "2026-01-30" },
    { id: 3, usdcSpent: 3000, consulBurned: 7500, timestamp: "2026-01-20" }
];

export default function FundsPage() {
    const [isExecutingBuyback, setIsExecutingBuyback] = useState(false);
    const [buybackAmount, setBuybackAmount] = useState("");

    // Real blockchain data
    const { balance: treasuryBalance, isLoading: isLoadingTreasury, refetch: refetchTreasury } = useTreasuryBalance();
    const { totalSpent, totalBurned, buybackBalance, isLoading: isLoadingBuyback, refetch: refetchBuyback } = useBuybackStats();
    const { balance: consulBalance, isLoading: isLoadingConsul, refetch: refetchConsul } = useConsulBalance(DEPLOYED_ADDRESSES.hubDAO);
    const { totalRaised, goal, isLive, finalized, isLoading: isLoadingFundraiser, refetch: refetchFundraiser } = useFundraiserStats();

    const isLoading = isLoadingTreasury || isLoadingBuyback || isLoadingConsul || isLoadingFundraiser;

    const handleRefresh = () => {
        refetchTreasury();
        refetchBuyback();
        refetchConsul();
        refetchFundraiser();
    };

    const handleBuyback = async () => {
        setIsExecutingBuyback(true);
        // TODO: Implement real buyback transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsExecutingBuyback(false);
        setBuybackAmount("");
        handleRefresh();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Coins className="w-8 h-8 text-amber-500" />
                        Treasury & Fundraising
                    </h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                        Manage DAO treasury, view contributions, and execute buybacks.
                        <Badge variant="outline" className="text-xs">
                            Live Data from Base Sepolia
                        </Badge>
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">USDC Balance</p>
                                {isLoadingTreasury ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-green-700 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-green-700">
                                        {formatUSDC(treasuryBalance)}
                                    </p>
                                )}
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
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">$CONSUL Held</p>
                                {isLoadingConsul ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-primary mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">
                                        {formatConsul(consulBalance)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Total Raised</p>
                                {isLoadingFundraiser ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold">
                                        {formatUSDC(totalRaised)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100">
                                <Flame className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">$CONSUL Burned</p>
                                {isLoadingBuyback ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-orange-700 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-orange-700">
                                        {formatConsul(totalBurned)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Buyback Panel */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            Buyback & Burn
                        </CardTitle>
                        <CardDescription>
                            Use USDC to buy $CONSUL from the market and burn it
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">USDC Amount</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="flex-1 px-3 py-2 border rounded-md"
                                    value={buybackAmount}
                                    onChange={(e) => setBuybackAmount(e.target.value)}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setBuybackAmount(TREASURY.balance.toString())}
                                >
                                    Max
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Available: ${TREASURY.balance.toLocaleString()} USDC
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50 text-sm">
                            <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">Estimated $CONSUL</span>
                                <span className="font-medium">
                                    ~{buybackAmount ? (parseFloat(buybackAmount) * 2.5).toLocaleString() : "0"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Slippage</span>
                                <span className="font-medium">1%</span>
                            </div>
                        </div>

                        <Button
                            className="w-full gap-2"
                            disabled={!buybackAmount || isExecutingBuyback}
                            onClick={handleBuyback}
                        >
                            {isExecutingBuyback ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Executing...
                                </>
                            ) : (
                                <>
                                    <Flame className="w-4 h-4" />
                                    Execute Buyback
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            Requires governance approval for amounts {'>'} $10k
                        </p>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contributions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HandCoins className="w-5 h-5 text-green-500" />
                                Recent Contributions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {CONTRIBUTIONS.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-green-100">
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{c.contributor}</p>
                                                <p className="text-xs text-muted-foreground">{c.timestamp}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-green-600">
                                            +${c.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Buyback History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5 text-orange-500" />
                                Buyback History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {BUYBACKS.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-orange-100">
                                                <Flame className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {b.consulBurned.toLocaleString()} $CONSUL burned
                                                </p>
                                                <p className="text-xs text-muted-foreground">{b.timestamp}</p>
                                            </div>
                                        </div>
                                        <span className="font-mono text-sm">
                                            ${b.usdcSpent.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
