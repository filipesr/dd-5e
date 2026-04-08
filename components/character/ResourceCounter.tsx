"use client";

import type { ResourceCounter as ResourceCounterType } from "@/lib/classResources";

interface ResourceCounterProps {
  counter: ResourceCounterType;
  onUse: () => void;
  onRestore: () => void;
}

export function ResourceCounter({ counter, onUse, onRestore }: ResourceCounterProps) {
  const available = counter.max - counter.used;
  const isPool = counter.max > 10; // lay on hands, etc — show as number instead of circles

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-sm text-gold">{counter.name}</span>
          <span className="text-xs text-parchment-light/40">
            ({counter.recharge === "short" ? "Desc. Curto" : "Desc. Longo"})
          </span>
        </div>
        {isPool ? (
          <span className="text-lg font-cinzel text-parchment-light">{available} / {counter.max}</span>
        ) : (
          <div className="flex gap-1 mt-1">
            {Array.from({ length: counter.max }, (_, i) => (
              <button
                key={i}
                onClick={() => (i < counter.used ? onRestore() : onUse())}
                className={`w-5 h-5 rounded-full border transition-colors ${
                  i < counter.used
                    ? "bg-gold/20 border-gold/30"
                    : "bg-gold border-gold"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <button
          onClick={onUse}
          disabled={available <= 0}
          className="px-2 py-1 text-xs bg-blood/20 border border-blood/30 rounded text-red-300 hover:bg-blood/30 disabled:opacity-30 transition-colors"
        >
          Usar
        </button>
        <button
          onClick={onRestore}
          disabled={counter.used <= 0}
          className="px-2 py-1 text-xs bg-green-900/20 border border-green-700/30 rounded text-green-300 hover:bg-green-900/30 disabled:opacity-30 transition-colors"
        >
          +1
        </button>
      </div>
    </div>
  );
}
