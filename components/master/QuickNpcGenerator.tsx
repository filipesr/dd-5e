"use client";

import { useState } from "react";
import { RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { generateQuickNPC } from "@/lib/npcGenerator";
import type { GeneratedNPC } from "@/lib/npcGenerator";

interface QuickNpcGeneratorProps {
  onAddToCampaign: (npc: GeneratedNPC) => void;
}

interface NpcField {
  label: string;
  key: keyof GeneratedNPC;
}

const NPC_FIELDS: NpcField[] = [
  { label: "Nome", key: "name" },
  { label: "Raca", key: "race" },
  { label: "Profissao", key: "profession" },
  { label: "Motivacao", key: "motivation" },
  { label: "Segredo", key: "secret" },
  { label: "Traco", key: "trait" },
];

export function QuickNpcGenerator({ onAddToCampaign }: QuickNpcGeneratorProps) {
  const [npc, setNpc] = useState<GeneratedNPC | null>(null);

  const handleGenerate = () => {
    setNpc(generateQuickNPC());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-cinzel text-parchment-light/60 uppercase tracking-wide">
          Gerador Rapido de NPC
        </h3>
        <Button size="sm" onClick={handleGenerate}>
          <RefreshCw size={14} className="mr-1" /> Gerar NPC
        </Button>
      </div>

      {npc && (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NPC_FIELDS.map(({ label, key }) => (
              <div key={key}>
                <span className="text-xs font-cinzel text-parchment-light/40 block mb-0.5">
                  {label}
                </span>
                <span className="text-sm text-parchment-light">{npc[key]}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gold/20">
            <Button variant="ghost" size="sm" onClick={handleGenerate}>
              <RefreshCw size={12} className="mr-1" /> Gerar Outro
            </Button>
            <Button size="sm" onClick={() => onAddToCampaign(npc)}>
              <UserPlus size={12} className="mr-1" /> Adicionar a Campanha
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
