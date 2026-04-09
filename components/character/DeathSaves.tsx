"use client";

import { Skull } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface DeathSavesProps {
  successes: number;
  failures: number;
  onChange: (saves: { successes: number; failures: number }) => void;
}

export function DeathSaves({ successes, failures, onChange }: DeathSavesProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-400 font-cinzel">{t.character.deathSaveSuccess}</span>
        {[0, 1, 2].map((i) => (
          <button key={`s-${i}`} onClick={() => onChange({ successes: i < successes ? i : i + 1, failures })}
            className={`w-4 h-4 rounded-full border transition-colors ${i < successes ? "bg-green-500 border-green-400" : "border-green-700/50"}`} />
        ))}
      </div>
      <Skull size={16} className="text-parchment-light/30" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400 font-cinzel">{t.character.deathSaveFailure}</span>
        {[0, 1, 2].map((i) => (
          <button key={`f-${i}`} onClick={() => onChange({ successes, failures: i < failures ? i : i + 1 })}
            className={`w-4 h-4 rounded-full border transition-colors ${i < failures ? "bg-blood border-blood-light" : "border-blood/30"}`} />
        ))}
      </div>
    </div>
  );
}
