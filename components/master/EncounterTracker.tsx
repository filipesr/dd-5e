"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Encounter, Condition } from "@/types/dnd5e";
import { ChevronRight, Swords, SkipForward } from "lucide-react";
import { rollNotation } from "@/lib/dice";
import { useI18n } from "@/lib/i18n";

interface TrackerEntry {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  conditions: Condition[];
  isPlayer: boolean;
}

interface EncounterTrackerProps {
  encounter: Encounter;
  onUpdate: (updates: Partial<Encounter>) => void;
}

export function EncounterTracker({ encounter, onUpdate }: EncounterTrackerProps) {
  const { t } = useI18n();
  const [damageInput, setDamageInput] = useState<Record<string, string>>({});

  const entries: TrackerEntry[] = [
    ...encounter.monsters.map((m) => ({ id: m.id, name: m.name, initiative: m.initiative, hp: m.hp, maxHp: m.maxHp, ac: m.ac, conditions: m.conditions, isPlayer: false })),
    ...encounter.playerCharacters.map((pc, i) => ({ id: `pc-${i}`, name: pc.name, initiative: pc.initiative, hp: 0, maxHp: 0, ac: pc.ac, conditions: [] as Condition[], isPlayer: true })),
  ].sort((a, b) => b.initiative - a.initiative);

  const currentEntry = entries[encounter.currentTurnIndex % entries.length];

  const rollAllInitiatives = () => {
    const updatedMonsters = encounter.monsters.map((m) => ({ ...m, initiative: rollNotation("1d20").total }));
    const updatedPCs = encounter.playerCharacters.map((pc) => ({ ...pc, initiative: rollNotation("1d20").total }));
    onUpdate({ monsters: updatedMonsters, playerCharacters: updatedPCs, status: "active", currentTurnIndex: 0 });
  };

  const nextTurn = () => {
    onUpdate({ currentTurnIndex: (encounter.currentTurnIndex + 1) % entries.length });
  };

  const applyDamage = (monsterId: string) => {
    const amount = parseInt(damageInput[monsterId] || "0");
    if (!amount) return;
    const updatedMonsters = encounter.monsters.map((m) => m.id === monsterId ? { ...m, hp: Math.max(0, m.hp - amount) } : m);
    onUpdate({ monsters: updatedMonsters });
    setDamageInput({ ...damageInput, [monsterId]: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={rollAllInitiatives} variant="secondary" size="sm"><Swords size={14} className="mr-1" /> {t.master.encounter.rollInitiatives}</Button>
        {encounter.status === "active" && <Button onClick={nextTurn} size="sm"><SkipForward size={14} className="mr-1" /> {t.master.encounter.nextTurn}</Button>}
      </div>
      <div className="space-y-1">
        {entries.map((entry) => {
          const isCurrent = currentEntry?.id === entry.id && encounter.status === "active";
          const hpPct = entry.maxHp > 0 ? (entry.hp / entry.maxHp) * 100 : 100;
          return (
            <div key={entry.id} className={`flex items-center gap-3 p-2 rounded transition-colors ${isCurrent ? "bg-gold/10 border border-gold/30" : "border border-transparent"}`}>
              {isCurrent && <ChevronRight size={16} className="text-gold flex-shrink-0" />}
              <span className="font-cinzel text-sm w-8 text-center text-gold/60">{entry.initiative}</span>
              <span className={`flex-1 text-sm ${entry.isPlayer ? "text-blue-300" : "text-parchment-light"}`}>{entry.name}</span>
              <span className="text-xs text-parchment-light/40">AC {entry.ac}</span>
              {!entry.isPlayer && (
                <>
                  <div className="w-24">
                    <div className="h-2 bg-ink rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${hpPct > 50 ? "bg-green-600" : hpPct > 25 ? "bg-yellow-600" : "bg-blood"}`} style={{ width: `${hpPct}%` }} />
                    </div>
                    <span className="text-xs text-parchment-light/40">{entry.hp}/{entry.maxHp}</span>
                  </div>
                  <div className="flex gap-1">
                    <input type="number" value={damageInput[entry.id] || ""} onChange={(e) => setDamageInput({ ...damageInput, [entry.id]: e.target.value })}
                      placeholder="Dano" className="w-14 bg-parchment/10 border border-gold/20 rounded px-1 py-0.5 text-xs text-parchment-light text-center focus:outline-none focus:border-gold" />
                    <button onClick={() => applyDamage(entry.id)} className="text-xs text-blood hover:text-blood-light">Hit</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
