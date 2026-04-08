"use client";

interface SpellSlotTrackerProps {
  level: number;
  max: number;
  used: number;
  onChange: (used: number) => void;
}

export function SpellSlotTracker({ level, max, used, onChange }: SpellSlotTrackerProps) {
  if (max === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="font-cinzel text-xs text-gold/60 w-8">Nv {level}</span>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i < used ? i : i + 1)}
            className={`w-5 h-5 rounded-full border transition-colors ${
              i < used ? "bg-gold/20 border-gold/30" : "bg-gold border-gold"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-parchment-light/50">{max - used}/{max}</span>
    </div>
  );
}
