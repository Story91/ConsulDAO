"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Rocket } from "lucide-react";

// Dynamic import for PillNav to avoid SSR issues with GSAP
const PillNav = dynamic(() => import("./PillNav"), {
  ssr: false,
  loading: () => <div className="h-[42px]" />,
});

const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Features", href: "#features" },
  { label: "Incubator", href: "/incubator" },
];

// Custom logo component
function Logo() {
  return (
    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
      <Rocket className="w-4 h-4 text-white" />
    </div>
  );
}

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else {
        // Hide navbar when scrolling down
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 pt-4 px-4 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center relative">
        {/* Centered PillNav */}
        <PillNav
          logo={<Logo />}
          logoAlt="ConsulDAO"
          items={navItems}
          className=""
          ease="power2.easeOut"
          baseColor="#000000"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#000000"
          initialLoadAnimation={true}
          onMobileMenuClick={() => {}}
        />

        {/* Wallet - Right side, absolute positioned */}
        <div className="absolute right-0 top-0 hidden md:block">
          <Wallet />
        </div>
      </div>
    </header>
  );
}
