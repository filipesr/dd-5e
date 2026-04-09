"use client";

import { useState } from "react";
import { Dice6 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { getCategories, rollRandomEvent } from "@/lib/randomTables";
import { useI18n } from "@/lib/i18n";

export function RandomEventGenerator() {
  const { t } = useI18n();
  const categories = getCategories();
  const [selectedCategory, setSelectedCategory] = useState(categories[0] ?? "");
  const [result, setResult] = useState<string | null>(null);

  const handleRoll = () => {
    setResult(rollRandomEvent(selectedCategory));
  };

  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-cinzel text-parchment-light/60 uppercase tracking-wide">
        {t.master.events.title}
      </h3>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Select
            label={t.master.events.category}
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>
        <div className="pb-0.5">
          <Button onClick={handleRoll}>
            <Dice6 size={14} className="mr-2" /> {t.master.events.roll}
          </Button>
        </div>
      </div>

      {result && (
        <Card className="p-4">
          <p className="text-sm text-parchment-light leading-relaxed">{result}</p>
          <div className="flex justify-end mt-3">
            <Button variant="ghost" size="sm" onClick={handleRoll}>
              <Dice6 size={12} className="mr-1" /> {t.master.events.rollAgain}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
