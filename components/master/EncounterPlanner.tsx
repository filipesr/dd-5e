"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getXpMultiplier, getEncounterDifficulty } from "@/lib/dnd5e";
import { generateId } from "@/lib/utils";
import type { EncounterMonster } from "@/types/dnd5e";
import { Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface EncounterPlannerProps {
  partyLevel: number;
  partySize: number;
  onPartyChange: (level: number, size: number) => void;
  monsters: EncounterMonster[];
  onMonstersChange: (monsters: EncounterMonster[]) => void;
}

const DIFFICULTY_COLORS: Record<string, "green" | "gold" | "blood" | "purple"> = { easy: "green", medium: "gold", hard: "blood", deadly: "purple" };

export function EncounterPlanner({ partyLevel, partySize, onPartyChange, monsters, onMonstersChange }: EncounterPlannerProps) {
  const { t } = useI18n();
  const [newName, setNewName] = useState("");
  const [newHp, setNewHp] = useState(10);
  const [newAc, setNewAc] = useState(10);
  const [newXp, setNewXp] = useState(25);

  const totalXP = monsters.reduce((sum, m) => sum + m.xp, 0);
  const multiplier = getXpMultiplier(monsters.length);
  const adjustedXP = Math.floor(totalXP * multiplier);
  const difficulty = monsters.length > 0 ? getEncounterDifficulty(partyLevel, partySize, adjustedXP) : null;

  const addMonster = () => {
    if (!newName) return;
    onMonstersChange([...monsters, { id: generateId(), name: newName, hp: newHp, maxHp: newHp, ac: newAc, initiative: 0, conditions: [], xp: newXp }]);
    setNewName("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input label={t.master.encounter.partyLevel} type="number" value={partyLevel} onChange={(e) => onPartyChange(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)), partySize)} />
        <Input label={t.master.encounter.partySize} type="number" value={partySize} onChange={(e) => onPartyChange(partyLevel, Math.max(1, parseInt(e.target.value) || 1))} />
      </div>
      {difficulty && (
        <div className="flex items-center gap-3 p-3 bg-ink border border-gold/20 rounded">
          <Badge label={t.master.encounter.difficulty[difficulty as keyof typeof t.master.encounter.difficulty]} color={DIFFICULTY_COLORS[difficulty]} active />
          <span className="text-sm text-parchment-light/60">XP Total: {totalXP} | Ajustado: {adjustedXP} (x{multiplier})</span>
        </div>
      )}
      <div className="space-y-1">
        {monsters.map((m, i) => (
          <div key={m.id} className="flex items-center gap-2 py-1 text-sm">
            <span className="flex-1 text-parchment-light">{m.name}</span>
            <span className="text-parchment-light/50">HP:{m.maxHp} AC:{m.ac} XP:{m.xp}</span>
            <button onClick={() => onMonstersChange(monsters.filter((_, j) => j !== i))} className="text-blood/60 hover:text-blood"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <Input label={t.common.name} value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Input label="HP" type="number" value={newHp} onChange={(e) => setNewHp(parseInt(e.target.value) || 1)} className="w-20" />
        <Input label="AC" type="number" value={newAc} onChange={(e) => setNewAc(parseInt(e.target.value) || 10)} className="w-20" />
        <Input label="XP" type="number" value={newXp} onChange={(e) => setNewXp(parseInt(e.target.value) || 0)} className="w-20" />
        <Button onClick={addMonster} size="sm"><Plus size={14} /></Button>
      </div>
    </div>
  );
}
