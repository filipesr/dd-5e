"use client";

import { useSessionStore } from "@/store/sessionStore";
import { useI18n } from "@/lib/i18n";
import type { AdvantageMode } from "@/lib/rollWithAdvantage";
import { cn } from "@/lib/utils";

export function AdvantageToggle() {
  const { t } = useI18n();
  const { advantageMode, setAdvantageMode } = useSessionStore();

  const MODES: { value: AdvantageMode; label: string; color: string; activeColor: string }[] = [
    { value: "normal", label: t.character.advantage.normal, color: "text-parchment-light/50 border-gold/20", activeColor: "text-gold bg-gold/20 border-gold" },
    { value: "advantage", label: t.character.advantage.advantage, color: "text-parchment-light/50 border-gold/20", activeColor: "text-green-300 bg-green-900/30 border-green-700" },
    { value: "disadvantage", label: t.character.advantage.disadvantage, color: "text-parchment-light/50 border-gold/20", activeColor: "text-red-300 bg-blood/20 border-blood" },
  ];

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
