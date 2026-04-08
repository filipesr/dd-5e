"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { RollLogEntry } from "@/store/sessionStore";
import { Trash2 } from "lucide-react";

interface RollLogProps {
  entries: RollLogEntry[];
  onClear: () => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

const TYPE_COLORS: Record<string, string> = {
  initiative: "text-gold",
  attack: "text-blue-300",
  damage: "text-red-300",
  ability: "text-green-300",
  save: "text-purple-300",
  custom: "text-parchment-light",
};

export function RollLog({ entries, onClear }: RollLogProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-cinzel text-xs text-gold/60">Log de Rolagens</span>
        {entries.length > 0 && (
          <button onClick={onClear} className="text-xs text-parchment-light/30 hover:text-parchment-light flex items-center gap-1">
            <Trash2 size={12} /> Limpar
          </button>
        )}
      </div>
      <div className="max-h-48 overflow-y-auto space-y-1">
        <AnimatePresence initial={false}>
          {entries.length === 0 ? (
            <p className="text-xs text-parchment-light/30 text-center py-4">Nenhuma rolagem ainda</p>
          ) : (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs py-1 border-b border-gold/5"
              >
                <span className="text-parchment-light/30 w-10">{formatTime(entry.timestamp)}</span>
                <span className={TYPE_COLORS[entry.type] || "text-parchment-light"}>
                  {entry.description}:
                </span>
                <span className="text-parchment-light/60">{entry.notation}</span>
                <span className="text-parchment-light font-bold">= {entry.total}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
