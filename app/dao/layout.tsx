"use client";

import { Navbar } from "@/components/Navbar";
import {
    Users,
    Coins,
    Vote,
    LayoutDashboard,
    PanelLeftClose,
    PanelLeft
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DaoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        {
            name: "Overview",
            href: "/dao",
            icon: LayoutDashboard // Summary dashboard
        },
        {
            name: "Squads",
            href: "/dao/squads",
            icon: Users // Squads & Tasks
        },
        {
            name: "Treasury",
            href: "/dao/funds",
            icon: Coins // Fundraising & Treasury
        },
        {
            name: "Governance",
            href: "/dao/governance",
            icon: Vote // Voting
        }
    ];

    return (
        <div className="h-screen flex flex-col bg-white">
            <Navbar />

            <div className="flex-1 flex pt-16 overflow-hidden">
                {/* Sidebar */}
                <div
                    className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-0"
                        } overflow-hidden`}
                >
                    <div className="w-64 flex flex-col h-full p-4">
                        <div className="mb-8">
                            <h2 className="font-bold text-lg flex items-center gap-2 px-2">
                                <span className="p-1 rounded bg-primary text-white">
                                    <LayoutDashboard className="w-4 h-4" />
                                </span>
                                ConsulDAO
                            </h2>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                                            }`}
                                    >
                                        <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute left-0 top-24 z-20 bg-white border border-gray-200 rounded-r-lg p-1.5 shadow-sm hover:bg-gray-50 transition-all"
                    style={{ left: isSidebarOpen ? "256px" : "0" }}
                >
                    {isSidebarOpen ? (
                        <PanelLeftClose className="w-4 h-4 text-gray-600" />
                    ) : (
                        <PanelLeft className="w-4 h-4 text-gray-600" />
                    )}
                </button>

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-white">
                    <div className="h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
