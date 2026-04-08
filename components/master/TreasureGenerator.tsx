"use client";

import { useState } from "react";
import { Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { generateLootByCR, getRandomMagicItem } from "@/lib/lootTables";
import type { TreasureRecord, CoinType } from "@/types/dnd5e";

const CR_OPTIONS = [
  { value: "0", label: "CR 0–4" },
  { value: "5", label: "CR 5–10" },
  { value: "11", label: "CR 11–16" },
  { value: "17", label: "CR 17+" },
];

const RARITY_OPTIONS = [
  { value: "Common", label: "Common" },
  { value: "Uncommon", label: "Uncommon" },
  { value: "Rare", label: "Rare" },
  { value: "Very Rare", label: "Very Rare" },
  { value: "Legendary", label: "Legendary" },
];

const RARITY_COLORS: Record<string, "gold" | "green" | "blue" | "purple" | "blood"> = {
  Common: "gold",
  Uncommon: "green",
  Rare: "blue",
  "Very Rare": "purple",
  Legendary: "blood",
};

const COIN_LABELS: Record<CoinType, string> = {
  cp: "PC (Cobre)",
  sp: "PP (Prata)",
  ep: "PE (Electrum)",
  gp: "PO (Ouro)",
  pp: "PL (Platina)",
};

interface GeneratedLoot {
  coins: Record<CoinType, number>;
  items: { name: string; rarity: string; description: string }[];
}

interface TreasureGeneratorProps {
  campaignId: string;
  onAdd: (treasure: Omit<TreasureRecord, "id">) => void;
}

export function TreasureGenerator({ campaignId: _campaignId, onAdd }: TreasureGeneratorProps) {
  const [crValue, setCrValue] = useState("0");
  const [includeMagicItem, setIncludeMagicItem] = useState(false);
  const [rarity, setRarity] = useState("Common");
  const [loot, setLoot] = useState<GeneratedLoot | null>(null);
  const [description, setDescription] = useState("");
  const [givenTo, setGivenTo] = useState("");

  const handleGenerate = () => {
    const cr = parseInt(crValue, 10);
    const result = generateLootByCR(cr);
    const items = includeMagicItem ? [getRandomMagicItem(rarity)] : [];
    setLoot({ coins: result.coins, items });
  };

  const handleAddToInventory = () => {
    if (!loot) return;
    onAdd({
      date: new Date().toISOString(),
      description: description.trim() || "Tesouro gerado",
      givenTo: givenTo.trim(),
      coins: loot.coins,
      items: loot.items,
      notes: "",
    });
    setLoot(null);
    setDescription("");
    setGivenTo("");
  };

  const hasCoins = loot && Object.values(loot.coins).some((v) => v > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Coins size={16} className="text-gold" />
        <h3 className="font-cinzel text-gold text-sm">Gerar Tesouro</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Nível de Desafio (CR)"
          options={CR_OPTIONS}
          value={crValue}
          onChange={(e) => setCrValue(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm text-parchment-light/70 font-cinzel">Item Mágico</label>
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm text-parchment-light cursor-pointer">
              <input
                type="checkbox"
                checked={includeMagicItem}
                onChange={(e) => setIncludeMagicItem(e.target.checked)}
                className="accent-gold w-4 h-4"
              />
              Incluir item mágico
            </label>
          </div>
        </div>
      </div>

      {includeMagicItem && (
        <Select
          label="Raridade do Item"
          options={RARITY_OPTIONS}
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
        />
      )}

      <Button onClick={handleGenerate} size="sm">
        <Sparkles size={14} className="mr-2" />
        Gerar Tesouro
      </Button>

      {loot && (
        <Card className="p-4 space-y-4">
          <h4 className="font-cinzel text-parchment-light text-sm">Resultado</h4>

          {hasCoins && (
            <div>
              <p className="text-xs text-parchment-light/50 font-cinzel mb-2">Moedas</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(loot.coins) as [CoinType, number][])
                  .filter(([, v]) => v > 0)
                  .map(([coin, amount]) => (
                    <span key={coin} className="text-sm text-parchment-light">
                      <span className="text-gold font-cinzel">{amount.toLocaleString("pt-BR")}</span>{" "}
                      {COIN_LABELS[coin]}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {loot.items.length > 0 && (
            <div>
              <p className="text-xs text-parchment-light/50 font-cinzel mb-2">Itens Mágicos</p>
              <div className="space-y-2">
                {loot.items.map((item, i) => (
                  <div key={i} className="bg-parchment-light/5 rounded p-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-cinzel text-parchment-light">{item.name}</span>
                      <Badge
                        label={item.rarity}
                        color={RARITY_COLORS[item.rarity] ?? "gold"}
                      />
                    </div>
                    <p className="text-xs text-parchment-light/60">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gold/20 pt-4 space-y-3">
            <Input
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Tesouro do dragão vermelho"
            />
            <Input
              label="Dado para"
              value={givenTo}
              onChange={(e) => setGivenTo(e.target.value)}
              placeholder="Ex: Grupo, Aria, Thorin..."
            />
            <Button size="sm" variant="secondary" onClick={handleAddToInventory}>
              Adicionar ao Inventário
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
