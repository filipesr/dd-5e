"use client";

import { Trash2, Dices, Swords } from "lucide-react";
import type { Attack } from "@/types/dnd5e";

interface AttackRowProps {
  attack: Attack;
  onChange: (attack: Attack) => void;
  onDelete: () => void;
  onRollAttack?: () => void;
  onRollDamage?: () => void;
}

export function AttackRow({ attack, onChange, onDelete, onRollAttack, onRollDamage }: AttackRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input value={attack.name} onChange={(e) => onChange({ ...attack, name: e.target.value })} placeholder="Nome do ataque" className="flex-1 bg-parchment/10 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment-light focus:outline-none focus:border-gold" />
      <input type="number" value={attack.attackBonus} onChange={(e) => onChange({ ...attack, attackBonus: parseInt(e.target.value) || 0 })} placeholder="+0" className="w-16 bg-parchment/10 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment-light text-center focus:outline-none focus:border-gold" />
      <input value={attack.damage} onChange={(e) => onChange({ ...attack, damage: e.target.value })} placeholder="1d8+3" className="w-20 bg-parchment/10 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment-light focus:outline-none focus:border-gold" />
      {onRollAttack && (
        <button onClick={onRollAttack} className="text-gold/40 hover:text-gold transition-colors" title="Rolar Ataque">
          <Dices size={14} />
        </button>
      )}
      {onRollDamage && (
        <button onClick={onRollDamage} className="text-blue-400/40 hover:text-blue-400 transition-colors" title="Rolar Dano">
          <Swords size={14} />
        </button>
      )}
      <button onClick={onDelete} className="text-blood/60 hover:text-blood transition-colors" title="Excluir ataque"><Trash2 size={14} /></button>
    </div>
  );
}
