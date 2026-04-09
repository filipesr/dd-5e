"use client";

import { useState } from "react";
import { useSessionStore } from "@/store/sessionStore";
import { useI18n } from "@/lib/i18n";
import { rollNotation } from "@/lib/dice";
import { Button } from "@/components/ui/Button";
import { Dices } from "lucide-react";

export function CustomRoller() {
  const { t } = useI18n();
  const [notation, setNotation] = useState("1d20");
  const { addRoll } = useSessionStore();

  const handleRoll = () => {
    try {
      const result = rollNotation(notation);
      addRoll({
        type: "custom",
        notation: result.notation,
        rolls: result.rolls,
        total: result.total,
        description: `Rolagem: ${notation}`,
      });
    } catch {
      // Invalid notation, ignore
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        value={notation}
        onChange={(e) => setNotation(e.target.value)}
        placeholder="1d20, 2d6+3..."
        className="flex-1 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold"
        onKeyDown={(e) => e.key === "Enter" && handleRoll()}
      />
      <Button onClick={handleRoll} variant="ghost" size="sm">
        <Dices size={14} className="mr-1" /> {t.character.actions.roll}
      </Button>
    </div>
  );
}
