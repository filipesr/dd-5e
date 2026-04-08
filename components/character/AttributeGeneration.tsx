"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { roll4d6DropLowest } from "@/lib/dice";
import { getPointBuyCost, getStandardArray, getModifier } from "@/lib/dnd5e";
import { formatModifier } from "@/lib/utils";
import type { Attribute } from "@/types/dnd5e";
import { ATTRIBUTES } from "@/types/dnd5e";

type Method = "roll" | "pointBuy" | "standard";

const ATTR_LABELS: Record<Attribute, string> = {
  str: "Força", dex: "Destreza", con: "Constituição",
  int: "Inteligência", wis: "Sabedoria", cha: "Carisma",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (attributes: Record<Attribute, number>) => void;
}

export function AttributeGeneration({ isOpen, onClose, onApply }: Props) {
  const [method, setMethod] = useState<Method>("roll");
  const [values, setValues] = useState<Record<Attribute, number>>({
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  });

  const rollAll = () => {
    const newValues = {} as Record<Attribute, number>;
    ATTRIBUTES.forEach((attr) => { newValues[attr] = roll4d6DropLowest().total; });
    setValues(newValues);
  };

  const applyStandard = () => {
    const arr = getStandardArray();
    const newValues = {} as Record<Attribute, number>;
    ATTRIBUTES.forEach((attr, i) => { newValues[attr] = arr[i]; });
    setValues(newValues);
  };

  const totalPointBuyCost = ATTRIBUTES.reduce((sum, attr) => sum + getPointBuyCost(values[attr]), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerar Atributos" className="max-w-md">
      <div className="space-y-4">
        <div className="flex gap-2">
          {([["roll", "4d6 Drop Lowest"], ["pointBuy", "Point Buy (27)"], ["standard", "Standard Array"]] as [Method, string][]).map(([m, label]) => (
            <button key={m} onClick={() => { setMethod(m); if (m === "standard") applyStandard(); }}
              className={`flex-1 py-2 px-2 text-xs font-cinzel rounded border transition-colors ${method === m ? "bg-gold/20 border-gold text-gold" : "border-gold/20 text-parchment-light/50 hover:text-parchment-light"}`}>
              {label}
            </button>
          ))}
        </div>
        {method === "roll" && <Button onClick={rollAll} variant="secondary" size="sm" className="w-full">Rolar Todos</Button>}
        {method === "pointBuy" && (
          <div className="text-center text-sm">
            <span className={totalPointBuyCost > 27 ? "text-blood" : "text-gold"}>Pontos: {totalPointBuyCost}/27</span>
          </div>
        )}
        <div className="space-y-2">
          {ATTRIBUTES.map((attr) => (
            <div key={attr} className="flex items-center gap-3">
              <span className="font-cinzel text-sm text-gold/70 w-24">{ATTR_LABELS[attr]}</span>
              {method === "pointBuy" ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => setValues({ ...values, [attr]: Math.max(8, values[attr] - 1) })} className="w-6 h-6 rounded bg-parchment/10 text-parchment-light hover:bg-parchment/20">-</button>
                  <span className="w-8 text-center text-parchment-light">{values[attr]}</span>
                  <button onClick={() => setValues({ ...values, [attr]: Math.min(15, values[attr] + 1) })} className="w-6 h-6 rounded bg-parchment/10 text-parchment-light hover:bg-parchment/20">+</button>
                </div>
              ) : (
                <span className="text-parchment-light text-lg">{values[attr]}</span>
              )}
              <span className="text-parchment-light/50 text-sm">({formatModifier(getModifier(values[attr]))})</span>
            </div>
          ))}
        </div>
        <Button onClick={() => { onApply(values); onClose(); }} className="w-full">Aplicar</Button>
      </div>
    </Modal>
  );
}
