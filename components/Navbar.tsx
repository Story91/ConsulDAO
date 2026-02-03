"use client";

import Link from "next/link";
import { useState } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "#features", label: "Features" },
  { href: "/incubator", label: "Incubator" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-foreground group-hover:text-primary transition-colors">Consul</span>
              <span className="text-muted-foreground">DAO</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Wallet - Desktop */}
            <div className="hidden sm:block">
              <Wallet />
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Sheet Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <SheetTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-white font-bold text-sm">C</span>
                      </div>
                      <span className="text-lg font-bold">ConsulDAO</span>
                    </SheetTitle>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex-1 p-4">
                    <div className="space-y-1">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary rounded-lg hover:bg-muted transition-all"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    <Separator className="my-6" />

                    {/* Wallet in mobile */}
                    <div className="px-4">
                      <p className="text-sm text-muted-foreground mb-3">Connect Wallet</p>
                      <Wallet />
                    </div>
                  </nav>

                  {/* Footer */}
                  <div className="p-4 border-t border-border">
                    <Button asChild className="w-full" size="lg">
                      <Link href="/incubator" onClick={() => setIsOpen(false)}>
                        Launch with AI Agent
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
