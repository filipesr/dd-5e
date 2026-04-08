"use client";

import { Trash2 } from "lucide-react";
import type { InventoryItem } from "@/types/dnd5e";

interface InventoryRowProps {
  item: InventoryItem;
  onChange: (item: InventoryItem) => void;
  onDelete: () => void;
}

export function InventoryRow({ item, onChange, onDelete }: InventoryRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })} placeholder="Item" className="flex-1 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold" />
      <input type="number" value={item.quantity} onChange={(e) => onChange({ ...item, quantity: Math.max(0, parseInt(e.target.value) || 0) })} className="w-12 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold" />
      <input type="number" value={item.weight} step={0.1} onChange={(e) => onChange({ ...item, weight: parseFloat(e.target.value) || 0 })} className="w-16 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold" placeholder="Peso" />
      <input type="number" value={item.valuePO} onChange={(e) => onChange({ ...item, valuePO: parseFloat(e.target.value) || 0 })} className="w-16 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold" placeholder="PO" />
      <button onClick={onDelete} className="text-blood/60 hover:text-blood transition-colors"><Trash2 size={14} /></button>
    </div>
  );
}
