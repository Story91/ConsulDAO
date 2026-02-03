"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float opacity-60" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-full blur-3xl opacity-50" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <div className="text-center">
          {/* Main headline */}
          <h1 className="animate-slide-up opacity-0 stagger-2 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6">
            <span className="block">From Idea to</span>
            <span className="gradient-text">Token Launch</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-slide-up opacity-0 stagger-3 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            ConsulDAO is a comprehensive DAO incubator for the Base ecosystem. 
            Complete infrastructure, legal wrapper, and expert squads to transform 
            your concept into reality.
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up opacity-0 stagger-4 flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <Link href="/incubator" className="flex items-center gap-2">
                Launch with AI Agent
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="h-14 px-8 text-base font-semibold border-2 hover:bg-secondary transition-all hover:-translate-y-0.5"
            >
              <Link href="#features">
                How It Works
              </Link>
            </Button>
          </div>

          {/* Stats or Trust badges */}
          <div className="animate-slide-up opacity-0 stagger-5 flex flex-wrap justify-center gap-8 sm:gap-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">50+</p>
                <p className="text-sm">Projects Launched</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 rounded-lg bg-accent/10">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">$10M+</p>
                <p className="text-sm">Capital Raised</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm">Expert Squads</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
