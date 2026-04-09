"use client";

import { Trash2, Gem } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { TreasureRecord, CoinType } from "@/types/dnd5e";
import { useI18n } from "@/lib/i18n";

const RARITY_COLORS: Record<string, "gold" | "green" | "blue" | "purple" | "blood"> = {
  Common: "gold",
  Uncommon: "green",
  Rare: "blue",
  "Very Rare": "purple",
  Legendary: "blood",
};

interface TreasureInventoryProps {
  treasures: TreasureRecord[];
  onDelete: (id: string) => void;
}

export function TreasureInventory({ treasures, onDelete }: TreasureInventoryProps) {
  const { t } = useI18n();

  if (treasures.length === 0) {
    return (
      <p className="text-center text-parchment-light/40 py-12">
        {t.master.treasure.none}
      </p>
    );
  }

  // Accumulated totals across all records
  const totals: Record<CoinType, number> = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  for (const tr of treasures) {
    for (const coin of Object.keys(tr.coins) as CoinType[]) {
      totals[coin] += tr.coins[coin] ?? 0;
    }
  }

  const hasTotals = Object.values(totals).some((v) => v > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Gem size={16} className="text-gold" />
        <h3 className="font-cinzel text-gold text-sm">{t.master.treasure.inventory}</h3>
      </div>

      <div className="space-y-3">
        {treasures.map((treasure) => {
          const coinEntries = (Object.entries(treasure.coins) as [CoinType, number][]).filter(
            ([, v]) => v > 0
          );
          return (
            <Card key={treasure.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-cinzel text-sm text-parchment-light">
                      {treasure.description || "Tesouro"}
                    </h4>
                    {treasure.givenTo && (
                      <span className="text-xs text-parchment-light/40">→ {treasure.givenTo}</span>
                    )}
                  </div>

                  <p className="text-xs text-parchment-light/40">
                    {new Date(treasure.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  {coinEntries.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {coinEntries.map(([coin, amount]) => (
                        <span key={coin} className="text-xs text-parchment-light/70">
                          <span className="text-gold">{amount.toLocaleString("pt-BR")}</span>{" "}
                          {t.coins[coin]}
                        </span>
                      ))}
                    </div>
                  )}

                  {treasure.items.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {treasure.items.map((item, i) => (
                        <span key={i} title={`${item.name} (${item.rarity})\n${item.description}`} className="cursor-help">
                          <Badge
                            label={item.name}
                            color={RARITY_COLORS[item.rarity] ?? "gold"}
                          />
                        </span>
                      ))}
                    </div>
                  )}

                  {treasure.notes && (
                    <p className="text-xs text-parchment-light/50 italic">{treasure.notes}</p>
                  )}
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(treasure.id)}
                  className="shrink-0"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {hasTotals && (
        <Card className="p-4">
          <p className="text-xs text-parchment-light/50 font-cinzel mb-2">{t.master.treasure.totalCoins}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {(Object.entries(totals) as [CoinType, number][])
              .filter(([, v]) => v > 0)
              .map(([coin, amount]) => (
                <span key={coin} className="text-sm text-parchment-light">
                  <span className="text-gold font-cinzel">{amount.toLocaleString("pt-BR")}</span>{" "}
                  {t.coins[coin]}
                </span>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
