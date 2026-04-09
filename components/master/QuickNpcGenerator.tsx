"use client";

import { useState } from "react";
import { RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { generateQuickNPC } from "@/lib/npcGenerator";
import type { GeneratedNPC } from "@/lib/npcGenerator";
import { useI18n } from "@/lib/i18n";

interface QuickNpcGeneratorProps {
  onAddToCampaign: (npc: GeneratedNPC) => void;
}

export function QuickNpcGenerator({ onAddToCampaign }: QuickNpcGeneratorProps) {
  const { t } = useI18n();
  const [npc, setNpc] = useState<GeneratedNPC | null>(null);

  const handleGenerate = () => {
    setNpc(generateQuickNPC());
  };

  const npcFields: { label: string; key: keyof GeneratedNPC }[] = [
    { label: t.common.name, key: "name" },
    { label: t.character.fields.race, key: "race" },
    { label: t.master.npc.profession, key: "profession" },
    { label: t.master.npc.motivation, key: "motivation" },
    { label: t.master.npc.secrets, key: "secret" },
    { label: t.master.npc.trait, key: "trait" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-cinzel text-parchment-light/60 uppercase tracking-wide">
          {t.master.npc.quickGen}
        </h3>
        <Button size="sm" onClick={handleGenerate}>
          <RefreshCw size={14} className="mr-1" /> {t.master.npc.generate}
        </Button>
      </div>

      {npc && (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {npcFields.map(({ label, key }) => (
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
              <RefreshCw size={12} className="mr-1" /> {t.master.npc.generateAnother}
            </Button>
            <Button size="sm" onClick={() => onAddToCampaign(npc)}>
              <UserPlus size={12} className="mr-1" /> {t.master.npc.addToCampaign}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
