"use client";

import { Badge } from "@/components/ui/Badge";
import type { Condition } from "@/types/dnd5e";

const CONDITION_LABELS: Record<Condition, string> = {
  blinded: "Cego", charmed: "Enfeitiçado", deafened: "Surdo",
  frightened: "Amedrontado", grappled: "Agarrado", incapacitated: "Incapacitado",
  invisible: "Invisível", paralyzed: "Paralisado", petrified: "Petrificado",
  poisoned: "Envenenado", prone: "Prostrado", stunned: "Atordoado",
};

interface ConditionBadgeProps {
  condition: Condition;
  active: boolean;
  onToggle: () => void;
}

export function ConditionBadge({ condition, active, onToggle }: ConditionBadgeProps) {
  return <Badge label={CONDITION_LABELS[condition]} active={active} onClick={onToggle} color="blood" />;
}
