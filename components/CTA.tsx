"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative">
          {/* Main CTA Card */}
          <div className="relative rounded-3xl overflow-hidden border border-border bg-card">
            {/* Background gradient - subtle */}
            <div className="absolute inset-0 gradient-bg opacity-50" />
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

            {/* Content */}
            <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24">
              <div className="max-w-3xl mx-auto text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-8">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>

                {/* Headline */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 tracking-tight">
                  Ready to launch your{" "}
                  <span className="gradient-text">project?</span>
                </h2>

                {/* Description */}
                <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join ConsulDAO and get access to complete infrastructure, expert squads, 
                  and the Base ecosystem to take your idea from concept to token launch.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild 
                    size="lg" 
                    className="h-14 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5"
                  >
                    <Link href="/incubator" className="flex items-center gap-2">
                      Start Incubation
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
                      See Features
                    </Link>
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="mt-12 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Trusted by leading Web3 projects</p>
                  <div className="flex flex-wrap justify-center gap-8">
                    {/* Placeholder for partner logos */}
                    <div className="h-8 w-24 bg-muted rounded-lg" />
                    <div className="h-8 w-20 bg-muted rounded-lg" />
                    <div className="h-8 w-28 bg-muted rounded-lg" />
                    <div className="h-8 w-24 bg-muted rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
