"use client";

import { useState } from "react";
import {
    Users,
    Plus,
    Briefcase,
    Coins,
    CheckCircle2,
    Clock,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// Mock Data Types
type Task = {
    id: number;
    description: string;
    reward: number;
    status: "pending" | "completed";
    assignee?: string;
};

type Squad = {
    id: number;
    name: string;
    budget: number;
    members: number;
    tasks: Task[];
};

// Mock Data
const MOCK_SQUADS: Squad[] = [
    {
        id: 1,
        name: "Legal Squad",
        budget: 5000,
        members: 3,
        tasks: [
            { id: 101, description: "Review incorporation docs", reward: 500, status: "completed", assignee: "0x12...34" },
            { id: 102, description: "File trademark application", reward: 1200, status: "pending" }
        ]
    },
    {
        id: 2,
        name: "Dev Squad",
        budget: 15000,
        members: 5,
        tasks: [
            { id: 201, description: "Audit smart contracts", reward: 3000, status: "pending" }
        ]
    },
    {
        id: 3,
        name: "Marketing Squad",
        budget: 2000,
        members: 2,
        tasks: []
    }
];

export default function SquadsPage() {
    const [squads, setSquads] = useState<Squad[]>(MOCK_SQUADS);
    const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);

    // New Squad Form State
    const [newSquadName, setNewSquadName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateSquad = () => {
        if (!newSquadName) return;

        // Simulate creation
        const newSquad: Squad = {
            id: squads.length + 1,
            name: newSquadName,
            budget: 0,
            members: 1, // Creator
            tasks: []
        };

        setSquads([...squads, newSquad]);
        setNewSquadName("");
        setIsCreating(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Squads
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage specialized teams, allocate budgets, and track tasks.
                    </p>
                </div>

                <Sheet open={isCreating} onOpenChange={setIsCreating}>
                    <SheetTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Squad
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create New Squad</SheetTitle>
                            <SheetDescription>
                                Establish a new specialized team within the DAO.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Squad Name</label>
                                <input
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="e.g. Legal, Marketing"
                                    value={newSquadName}
                                    onChange={(e) => setNewSquadName(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleCreateSquad} className="w-full">
                                Launch Squad
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">

                {/* Squad List */}
                <div className="grid gap-4 content-start overflow-y-auto pr-2">
                    {squads.map((squad) => (
                        <Card
                            key={squad.id}
                            className={`cursor-pointer transition-all hover:border-primary/50 ${selectedSquad?.id === squad.id ? "border-primary shadow-md bg-primary/5" : ""
                                }`}
                            onClick={() => setSelectedSquad(squad)}
                        >
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded-lg bg-white border shadow-sm">
                                        <Briefcase className="w-5 h-5 text-primary" />
                                    </div>
                                    <Badge variant="secondary" className="font-mono">
                                        ${squad.budget.toLocaleString()}
                                    </Badge>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{squad.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {squad.members}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {squad.tasks.length} tasks
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Detail View */}
                <div className="lg:col-span-2 bg-gray-50 rounded-xl border p-8 flex flex-col overflow-hidden">
                    {selectedSquad ? (
                        <div className="h-full flex flex-col">
                            {/* Squad Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedSquad.name}</h2>
                                    <p className="text-muted-foreground">Squad ID: #{selectedSquad.id}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">Add Member</Button>
                                    <Button size="sm">New Task</Button>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                    <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Budget</span>
                                    <div className="text-2xl font-bold mt-1 text-green-600">
                                        ${selectedSquad.budget.toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                    <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Members</span>
                                    <div className="text-2xl font-bold mt-1">
                                        {selectedSquad.members}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                    <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Active Tasks</span>
                                    <div className="text-2xl font-bold mt-1">
                                        {selectedSquad.tasks.filter(t => t.status === 'pending').length}
                                    </div>
                                </div>
                            </div>

                            <Separator className="mb-6" />

                            {/* Task Board */}
                            <div className="flex-1 overflow-y-auto">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Task Board
                                </h3>

                                {selectedSquad.tasks.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-white/50">
                                        No tasks assigned to this squad yet.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedSquad.tasks.map((task) => (
                                            <div key={task.id} className="bg-white p-4 rounded-lg border flex justify-between items-center group hover:shadow-sm transition-all">
                                                <div>
                                                    <p className="font-medium group-hover:text-primary transition-colors">{task.description}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {task.assignee ? `Assigned to ${task.assignee}` : "Unassigned"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant={task.status === 'completed' ? 'secondary' : 'default'}>
                                                        {task.status}
                                                    </Badge>
                                                    <div className="font-mono text-sm font-bold">
                                                        ${task.reward}
                                                    </div>
                                                    {task.status === 'pending' && (
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                            <ChevronRight className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Select a squad to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
