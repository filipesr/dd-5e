"use client";

import { useSessionStore } from "@/store/sessionStore";
import type { AdvantageMode } from "@/lib/rollWithAdvantage";
import { cn } from "@/lib/utils";

const MODES: { value: AdvantageMode; label: string; color: string; activeColor: string }[] = [
  { value: "normal", label: "Normal", color: "text-parchment-light/50 border-gold/20", activeColor: "text-gold bg-gold/20 border-gold" },
  { value: "advantage", label: "Vantagem", color: "text-parchment-light/50 border-gold/20", activeColor: "text-green-300 bg-green-900/30 border-green-700" },
  { value: "disadvantage", label: "Desvantagem", color: "text-parchment-light/50 border-gold/20", activeColor: "text-red-300 bg-blood/20 border-blood" },
];

export function AdvantageToggle() {
  const { advantageMode, setAdvantageMode } = useSessionStore();

  return (
    <div className="flex gap-1">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setAdvantageMode(mode.value)}
          className={cn(
            "px-2 py-1 text-xs font-cinzel rounded border transition-colors",
            advantageMode === mode.value ? mode.activeColor : mode.color
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
