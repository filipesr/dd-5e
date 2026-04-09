"use client";

import { getModifier } from "@/lib/dnd5e";
import { formatModifier } from "@/lib/utils";
import type { Attribute } from "@/types/dnd5e";

const ATTR_LABELS: Record<Attribute, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

interface StatBoxProps {
  attribute: Attribute;
  value: number;
  onChange: (value: number) => void;
}

export function StatBox({ attribute, value, onChange }: StatBoxProps) {
  const mod = getModifier(value);

  return (
    <div className="flex flex-col items-center bg-ink-light border border-gold/30 rounded-lg p-3 min-w-[80px]">
      <span className="font-cinzel text-xs text-gold/70 tracking-wider">{ATTR_LABELS[attribute]}</span>
      <span className="font-cinzel text-2xl text-parchment-light font-bold">{formatModifier(mod)}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
        className="w-12 text-center bg-parchment/10 border border-gold/20 rounded text-sm text-parchment-light mt-1 py-1 focus:outline-none focus:border-gold"
      />
    </div>
  );
}
