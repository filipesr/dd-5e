"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { formatModifier } from "@/lib/utils";

interface InitiativeRollerProps {
  dexMod: number;
  currentRoll: number | null;
  onRoll: () => void;
}

export function InitiativeRoller({ dexMod, currentRoll, onRoll }: InitiativeRollerProps) {
  const { t } = useI18n();
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    setIsRolling(true);
    setTimeout(() => {
      onRoll();
      setIsRolling(false);
    }, 600);
  };

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleRoll} variant="secondary" size="sm" disabled={isRolling}>
        <motion.div
          animate={isRolling ? { rotate: [0, 360, 720, 1080], scale: [1, 1.3, 1.1, 1] } : {}}
          transition={{ duration: 0.6 }}
          className="mr-2"
        >
          <Dices size={16} />
        </motion.div>
        {t.character.actions.rollInitiative}
      </Button>
      <AnimatePresence mode="wait">
        {currentRoll !== null && (
          <motion.div
            key={currentRoll}
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-center"
          >
            <span className="font-cinzel text-2xl text-gold font-bold">{currentRoll}</span>
            <span className="text-xs text-parchment-light/40 ml-2">
              (1d20{formatModifier(dexMod)})
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
