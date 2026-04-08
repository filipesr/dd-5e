"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sword, BookOpen, Crown, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/character", label: "Personagens", icon: Sword },
  { href: "/compendium", label: "Compêndio", icon: BookOpen },
  { href: "/master", label: "Mestre", icon: Crown },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors">
          <Scroll size={24} />
          <span className="font-cinzel font-bold text-lg hidden sm:inline">D&D 5e Toolkit</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded font-cinzel text-sm transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-gold/20 text-gold"
                  : "text-parchment-light/60 hover:text-parchment-light hover:bg-parchment/5"
              )}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-parchment-light/60 hover:text-parchment-light"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gold/20 bg-ink/95 backdrop-blur">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-cinzel text-sm border-b border-gold/10 transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-gold/10 text-gold"
                  : "text-parchment-light/60 hover:text-parchment-light"
              )}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
