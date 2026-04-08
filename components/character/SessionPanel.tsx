"use client";

import { useSessionStore } from "@/store/sessionStore";
import { ResourceCounter } from "@/components/character/ResourceCounter";
import { InitiativeRoller } from "@/components/character/InitiativeRoller";
import { RollLog } from "@/components/character/RollLog";
import { Button } from "@/components/ui/Button";
import { Moon, Sun } from "lucide-react";

interface SessionPanelProps {
  dexMod: number;
}

export function SessionPanel({ dexMod }: SessionPanelProps) {
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

      {/* Resource Counters */}
      {resourceCounters.length > 0 && (
        <div>
          <span className="font-cinzel text-xs text-gold/60">Recursos</span>
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
          <Moon size={14} className="mr-1" /> Descanso Curto
        </Button>
        <Button variant="ghost" size="sm" onClick={longRest}>
          <Sun size={14} className="mr-1" /> Descanso Longo
        </Button>
      </div>

      {/* Roll Log */}
      <RollLog entries={rollLog} onClear={clearLog} />
    </div>
  );
}
