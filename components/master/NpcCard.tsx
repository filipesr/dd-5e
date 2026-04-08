"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { NPC } from "@/types/dnd5e";

const ROLE_COLORS: Record<NPC["role"], "green" | "gold" | "blood" | "purple"> = {
  ally: "green", neutral: "gold", antagonist: "blood", unknown: "purple",
};
const ROLE_LABELS: Record<NPC["role"], string> = {
  ally: "Aliado", neutral: "Neutro", antagonist: "Antagonista", unknown: "Desconhecido",
};

interface NpcCardProps { npc: NPC; onClick?: () => void; }

export function NpcCard({ npc, onClick }: NpcCardProps) {
  const initials = npc.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <Card className="p-3 cursor-pointer hover:shadow-tome-hover transition-shadow" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center font-cinzel text-sm text-gold">{initials}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-cinzel text-sm text-parchment-light truncate">{npc.name}</h4>
          <p className="text-xs text-parchment-light/40">{npc.race} — {npc.profession}</p>
        </div>
        <Badge label={ROLE_LABELS[npc.role]} color={ROLE_COLORS[npc.role]} />
      </div>
    </Card>
  );
}
