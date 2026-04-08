"use client";

import { useState } from "react";
import { Heart, Shield, Plus, Minus } from "lucide-react";

interface HpTrackerProps {
  hp: { max: number; current: number; temporary: number };
  ac: number;
  onChange: (hp: { max: number; current: number; temporary: number }) => void;
  onAcChange: (ac: number) => void;
}

export function HpTracker({ hp, ac, onChange, onAcChange }: HpTrackerProps) {
  const [quickValue, setQuickValue] = useState(1);
  const pct = hp.max > 0 ? (hp.current / hp.max) * 100 : 0;
  const barColor = pct > 50 ? "bg-green-600" : pct > 25 ? "bg-yellow-600" : "bg-blood";

  const applyDamage = () => {
    let remaining = quickValue;
    let temp = hp.temporary;
    let current = hp.current;
    if (temp > 0) {
      const absorbedByTemp = Math.min(temp, remaining);
      temp -= absorbedByTemp;
      remaining -= absorbedByTemp;
    }
    current = Math.max(0, current - remaining);
    onChange({ ...hp, current, temporary: temp });
  };

  const applyHeal = () => {
    const current = Math.min(hp.max, hp.current + quickValue);
    onChange({ ...hp, current });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} className="text-blood" />
            <span className="font-cinzel text-sm text-gold/70">Hit Points</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" value={hp.current} onChange={(e) => onChange({ ...hp, current: Math.max(0, parseInt(e.target.value) || 0) })} className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light focus:outline-none focus:border-gold" />
            <span className="text-gold/50">/</span>
            <input type="number" value={hp.max} onChange={(e) => onChange({ ...hp, max: Math.max(1, parseInt(e.target.value) || 1) })} className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light focus:outline-none focus:border-gold" />
          </div>
          <div className="h-2 bg-ink rounded-full mt-2 overflow-hidden">
            <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1 mb-1">
            <Shield size={16} className="text-gold" />
            <span className="font-cinzel text-sm text-gold/70">AC</span>
          </div>
          <input type="number" value={ac} onChange={(e) => onAcChange(parseInt(e.target.value) || 10)} className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light text-xl font-cinzel focus:outline-none focus:border-gold" />
        </div>
        <div className="text-center">
          <span className="font-cinzel text-sm text-gold/70 block mb-1">Temp HP</span>
          <input type="number" value={hp.temporary} onChange={(e) => onChange({ ...hp, temporary: Math.max(0, parseInt(e.target.value) || 0) })} className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light focus:outline-none focus:border-gold" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={applyDamage} className="flex items-center gap-1 px-2 py-1 bg-blood/20 border border-blood/40 rounded text-sm text-red-300 hover:bg-blood/30 transition-colors">
          <Minus size={14} /> Dano
        </button>
        <input type="number" value={quickValue} onChange={(e) => setQuickValue(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light text-sm focus:outline-none focus:border-gold" />
        <button onClick={applyHeal} className="flex items-center gap-1 px-2 py-1 bg-green-900/20 border border-green-700/40 rounded text-sm text-green-300 hover:bg-green-900/30 transition-colors">
          <Plus size={14} /> Cura
        </button>
      </div>
    </div>
  );
}
