"use client";

import { useSessionStore } from "@/store/sessionStore";
import { useI18n } from "@/lib/i18n";
import { ResourceCounter } from "@/components/character/ResourceCounter";
import { InitiativeRoller } from "@/components/character/InitiativeRoller";
import { RollLog } from "@/components/character/RollLog";
import { AdvantageToggle } from "@/components/character/AdvantageToggle";
import { CustomRoller } from "@/components/character/CustomRoller";
import { Button } from "@/components/ui/Button";
import { Moon, Sun } from "lucide-react";

interface SessionPanelProps {
  dexMod: number;
}

export function SessionPanel({ dexMod }: SessionPanelProps) {
  const { t } = useI18n();
  const {
    resourceCounters,
    rollLog,
    initiativeRoll,
    useResource,
    restoreResource,
    shortRest,
    longRest,
    rollInitiative,
    clearLog,
  } = useSessionStore();

  return (
    <div className="space-y-4">
      {/* Initiative */}
      <InitiativeRoller dexMod={dexMod} currentRoll={initiativeRoll} onRoll={() => rollInitiative(dexMod)} />

      {/* Advantage Toggle */}
      <AdvantageToggle />

      {/* Resource Counters */}
      {resourceCounters.length > 0 && (
        <div>
          <span className="font-cinzel text-xs text-gold/60">{t.master.session.title}</span>
          <div className="divide-y divide-gold/10">
            {resourceCounters.map((counter) => (
              <ResourceCounter
                key={counter.key}
                counter={counter}
                onUse={() => useResource(counter.key)}
                onRestore={() => restoreResource(counter.key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rest Buttons */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={shortRest}>
          <Moon size={14} className="mr-1" /> {t.character.shortRest}
        </Button>
        <Button variant="ghost" size="sm" onClick={longRest}>
          <Sun size={14} className="mr-1" /> {t.character.longRest}
        </Button>
      </div>

      {/* Custom Roller */}
      <CustomRoller />

      {/* Roll Log */}
      <RollLog entries={rollLog} onClear={clearLog} />
    </div>
  );
}
