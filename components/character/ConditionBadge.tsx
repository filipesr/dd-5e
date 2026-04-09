"use client";

import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import type { Condition } from "@/types/dnd5e";

interface ConditionBadgeProps {
  condition: Condition;
  active: boolean;
  onToggle: () => void;
}

export function ConditionBadge({ condition, active, onToggle }: ConditionBadgeProps) {
  const { t } = useI18n();
  return <Badge label={t.conditions[condition] ?? condition} active={active} onClick={onToggle} color="blood" />;
}
