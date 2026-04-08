"use client";

import { Trash2 } from "lucide-react";
import type { Attack } from "@/types/dnd5e";

interface AttackRowProps {
  attack: Attack;
  onChange: (attack: Attack) => void;
  onDelete: () => void;
}

export function AttackRow({ attack, onChange, onDelete }: AttackRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input value={attack.name} onChange={(e) => onChange({ ...attack, name: e.target.value })} placeholder="Nome" className="flex-1 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold" />
      <input type="number" value={attack.attackBonus} onChange={(e) => onChange({ ...attack, attackBonus: parseInt(e.target.value) || 0 })} placeholder="+Atq" className="w-16 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold" />
      <input value={attack.damage} onChange={(e) => onChange({ ...attack, damage: e.target.value })} placeholder="Dano" className="w-20 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold" />
      <button onClick={onDelete} className="text-blood/60 hover:text-blood transition-colors"><Trash2 size={14} /></button>
    </div>
  );
}
