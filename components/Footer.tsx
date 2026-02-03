"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, MessageCircle } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "AI Incubator", href: "/incubator" },
    { label: "How it works", href: "#features" },
  ],
  developers: [
    { label: "GitHub", href: "https://github.com/consuldao" },
    { label: "Documentation", href: "https://docs.base.org/onchainkit" },
    { label: "Base", href: "https://base.org" },
  ],
  integrations: [
    { label: "ENS", href: "https://ens.domains" },
    { label: "Uniswap v4", href: "https://docs.uniswap.org" },
    { label: "Circle", href: "https://circle.com" },
  ],
};

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com/consuldao", icon: Twitter },
  { label: "GitHub", href: "https://github.com/consuldao", icon: Github },
  { label: "Discord", href: "https://discord.gg/consuldao", icon: MessageCircle },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-bold">
                  <span className="text-foreground">Consul</span>
                  <span className="text-muted-foreground">DAO</span>
                </span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
                AI-powered DAO incubator for the Base ecosystem. 
                From idea to token launch with autonomous agents and anti-rug protection.
              </p>
              
              {/* Social links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all"
                      aria-label={social.label}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Product links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Developers links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Developers</h4>
              <ul className="space-y-3">
                {footerLinks.developers.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Integrations links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Integrations</h4>
              <ul className="space-y-3">
                {footerLinks.integrations.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ConsulDAO. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ on{" "}
            <a 
              href="https://base.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Base
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
