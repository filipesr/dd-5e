"use client";

import { getProficiencyBonus, getSkillValue } from "@/lib/dnd5e";
import { formatModifier } from "@/lib/utils";
import type { Skill, Attribute } from "@/types/dnd5e";
import { SKILL_ATTRIBUTE_MAP } from "@/types/dnd5e";
import { Dices } from "lucide-react";

interface SkillRowProps {
  skill: Skill;
  skillName: string;
  attributeScore: number;
  level: number;
  proficiency: "none" | "proficient" | "expertise";
  onToggle: () => void;
  onRoll?: (value: number) => void;
}

const ATTR_SHORT: Record<Attribute, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

export function SkillRow({ skill, skillName, attributeScore, level, proficiency, onToggle, onRoll }: SkillRowProps) {
  const attr = SKILL_ATTRIBUTE_MAP[skill];
  const profBonus = getProficiencyBonus(level);
  const value = getSkillValue(attributeScore, profBonus, proficiency);

  return (
    <div className="flex items-center gap-2 py-1 text-sm">
      <button
        onClick={onToggle}
        className="w-4 h-4 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0"
        title={`Proficiência: ${proficiency}`}
      >
        {proficiency === "proficient" && <div className="w-2 h-2 rounded-full bg-gold" />}
        {proficiency === "expertise" && <div className="w-3 h-3 rounded-full bg-gold" />}
      </button>
      <span className="font-cinzel text-gold/50 text-xs w-8">{ATTR_SHORT[attr]}</span>
      <span className="flex-1 text-parchment-light/80">{skillName}</span>
      <span className="font-cinzel text-parchment-light w-8 text-right">{formatModifier(value)}</span>
      {onRoll && (
        <button onClick={() => onRoll(value)} className="ml-1 text-gold/40 hover:text-gold transition-colors" title="Rolar">
          <Dices size={14} />
        </button>
      )}
    </div>
  );
}
