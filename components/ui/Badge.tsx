"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  color?: "gold" | "blood" | "green" | "blue" | "purple";
  className?: string;
}

const colors = {
  gold: "bg-gold/20 text-gold border-gold/40",
  blood: "bg-blood/20 text-red-300 border-blood/40",
  green: "bg-green-900/30 text-green-300 border-green-700/40",
  blue: "bg-blue-900/30 text-blue-300 border-blue-700/40",
  purple: "bg-purple-900/30 text-purple-300 border-purple-700/40",
};

const activeColors = {
  gold: "bg-gold text-ink border-gold",
  blood: "bg-blood text-parchment-light border-blood",
  green: "bg-green-700 text-white border-green-600",
  blue: "bg-blue-700 text-white border-blue-600",
  purple: "bg-purple-700 text-white border-purple-600",
};

export function Badge({ label, active = false, onClick, color = "gold", className }: BadgeProps) {
  const Component = onClick ? "button" : "span";
  return (
    <Component
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-cinzel rounded border transition-colors",
        active ? activeColors[color] : colors[color],
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
    >
      {label}
    </Component>
  );
}
