# Session Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Modo Sessao" toggle to the character sheet that enables class-specific resource counters, initiative roller with animation, and an ephemeral roll log.

**Architecture:** New ephemeral Zustand store (no persist) for session state. Pure function `getClassResources()` derives counters from class/level. SessionPanel component renders counters, initiative roller, and roll log. Integrates into the existing character sheet page via a toggle button.

**Tech Stack:** Zustand (no persist), framer-motion (initiative animation), existing lib/dice.ts

**Spec:** `docs/superpowers/specs/modules/07-session-mode.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/classResources.ts` | Create | Pure function: class + level + attrs → resource counters |
| `lib/__tests__/classResources.test.ts` | Create | Tests for resource derivation |
| `store/sessionStore.ts` | Create | Ephemeral Zustand store (no persist) |
| `components/character/ResourceCounter.tsx` | Create | Visual counter (circles + use/restore) |
| `components/character/InitiativeRoller.tsx` | Create | d20 roll button with animation |
| `components/character/RollLog.tsx` | Create | Scrollable log of session rolls |
| `components/character/SessionPanel.tsx` | Create | Composes counters + initiative + log + rest buttons |
| `app/character/[id]/page.tsx` | Modify | Add session toggle + SessionPanel |

---

### Task 1: Class Resources Library (TDD)

**Files:**
- Create: `lib/classResources.ts`, `lib/__tests__/classResources.test.ts`

- [x] **Step 1: Write failing tests**

Create `lib/__tests__/classResources.test.ts`:

```ts
import { getClassResources } from "@/lib/classResources";
import type { Attribute } from "@/types/dnd5e";

const DEFAULT_ATTRS: Record<Attribute, number> = {
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
};

describe("getClassResources", () => {
  it("returns Rage for barbarian level 1 with 2 uses", () => {
    const resources = getClassResources("barbarian", 1, DEFAULT_ATTRS);
    expect(resources).toHaveLength(1);
    expect(resources[0].key).toBe("rage");
    expect(resources[0].max).toBe(2);
    expect(resources[0].recharge).toBe("long");
  });

  it("returns Rage with 4 uses for barbarian level 6", () => {
    const resources = getClassResources("barbarian", 6, DEFAULT_ATTRS);
    expect(resources[0].max).toBe(4);
  });

  it("returns Bardic Inspiration with CHA mod uses for bard", () => {
    const attrs = { ...DEFAULT_ATTRS, cha: 16 }; // +3
    const resources = getClassResources("bard", 1, attrs);
    expect(resources).toHaveLength(1);
    expect(resources[0].key).toBe("bardic-inspiration");
    expect(resources[0].max).toBe(3);
    expect(resources[0].recharge).toBe("long");
  });

  it("returns minimum 1 use for bard with low CHA", () => {
    const attrs = { ...DEFAULT_ATTRS, cha: 8 }; // -1
    const resources = getClassResources("bard", 1, attrs);
    expect(resources[0].max).toBe(1);
  });

  it("returns Channel Divinity for cleric level 2", () => {
    const resources = getClassResources("cleric", 2, DEFAULT_ATTRS);
    expect(resources).toHaveLength(1);
    expect(resources[0].key).toBe("channel-divinity");
    expect(resources[0].max).toBe(1);
    expect(resources[0].recharge).toBe("short");
  });

  it("returns Channel Divinity with 2 uses for cleric level 6", () => {
    const resources = getClassResources("cleric", 6, DEFAULT_ATTRS);
    expect(resources[0].max).toBe(2);
  });

  it("returns no Channel Divinity for cleric level 1", () => {
    const resources = getClassResources("cleric", 1, DEFAULT_ATTRS);
    expect(resources).toHaveLength(0);
  });

  it("returns Second Wind and Action Surge for fighter level 2", () => {
    const resources = getClassResources("fighter", 2, DEFAULT_ATTRS);
    expect(resources).toHaveLength(2);
    expect(resources.find((r) => r.key === "second-wind")).toBeDefined();
    expect(resources.find((r) => r.key === "action-surge")).toBeDefined();
  });

  it("returns Ki Points equal to level for monk", () => {
    const resources = getClassResources("monk", 5, DEFAULT_ATTRS);
    expect(resources[0].key).toBe("ki");
    expect(resources[0].max).toBe(5);
    expect(resources[0].recharge).toBe("short");
  });

  it("returns Lay on Hands and Divine Sense for paladin level 2", () => {
    const attrs = { ...DEFAULT_ATTRS, cha: 14 }; // +2
    const resources = getClassResources("paladin", 2, attrs);
    const loh = resources.find((r) => r.key === "lay-on-hands");
    const ds = resources.find((r) => r.key === "divine-sense");
    expect(loh?.max).toBe(10); // 5 * level
    expect(ds?.max).toBe(3);   // 1 + CHA mod
  });

  it("returns Sorcery Points equal to level for sorcerer", () => {
    const resources = getClassResources("sorcerer", 3, DEFAULT_ATTRS);
    expect(resources[0].key).toBe("sorcery-points");
    expect(resources[0].max).toBe(3);
    expect(resources[0].recharge).toBe("long");
  });

  it("returns Pact Slots for warlock", () => {
    const resources = getClassResources("warlock", 1, DEFAULT_ATTRS);
    expect(resources[0].key).toBe("pact-slots");
    expect(resources[0].max).toBe(1);
    expect(resources[0].recharge).toBe("short");
  });

  it("returns empty array for wizard", () => {
    const resources = getClassResources("wizard", 5, DEFAULT_ATTRS);
    expect(resources).toHaveLength(0);
  });

  it("returns empty array for rogue", () => {
    const resources = getClassResources("rogue", 5, DEFAULT_ATTRS);
    expect(resources).toHaveLength(0);
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/__tests__/classResources.test.ts --verbose
```

Expected: FAIL (module not found).

- [x] **Step 3: Implement getClassResources**

Create `lib/classResources.ts`:

```ts
import type { CharacterClass, Attribute } from "@/types/dnd5e";
import { getModifier } from "@/lib/dnd5e";

export interface ResourceCounter {
  key: string;
  name: string;
  max: number;
  used: number;
  recharge: "short" | "long";
}

function rageUses(level: number): number {
  if (level >= 20) return 999; // unlimited
  if (level >= 17) return 6;
  if (level >= 12) return 5;
  if (level >= 6) return 4;
  if (level >= 3) return 3;
  return 2;
}

function channelDivinityUses(level: number): number {
  if (level >= 18) return 3;
  if (level >= 6) return 2;
  if (level >= 2) return 1;
  return 0;
}

function actionSurgeUses(level: number): number {
  if (level >= 17) return 2;
  if (level >= 2) return 1;
  return 0;
}

function pactSlots(level: number): number {
  if (level >= 17) return 4;
  if (level >= 11) return 3;
  if (level >= 2) return 2;
  return 1;
}

export function getClassResources(
  characterClass: CharacterClass,
  level: number,
  attributes: Record<Attribute, number>
): ResourceCounter[] {
  const chaMod = getModifier(attributes.cha);
  const resources: ResourceCounter[] = [];

  switch (characterClass) {
    case "barbarian":
      resources.push({
        key: "rage",
        name: "Furia",
        max: rageUses(level),
        used: 0,
        recharge: "long",
      });
      break;

    case "bard":
      resources.push({
        key: "bardic-inspiration",
        name: "Inspiracao Bardica",
        max: Math.max(1, chaMod),
        used: 0,
        recharge: "long",
      });
      break;

    case "cleric": {
      const cdUses = channelDivinityUses(level);
      if (cdUses > 0) {
        resources.push({
          key: "channel-divinity",
          name: "Canalizar Divindade",
          max: cdUses,
          used: 0,
          recharge: "short",
        });
      }
      break;
    }

    case "fighter": {
      if (level >= 1) {
        resources.push({
          key: "second-wind",
          name: "Segundo Folego",
          max: 1,
          used: 0,
          recharge: "short",
        });
      }
      const asUses = actionSurgeUses(level);
      if (asUses > 0) {
        resources.push({
          key: "action-surge",
          name: "Surto de Acao",
          max: asUses,
          used: 0,
          recharge: "short",
        });
      }
      break;
    }

    case "monk":
      if (level >= 2) {
        resources.push({
          key: "ki",
          name: "Ki",
          max: level,
          used: 0,
          recharge: "short",
        });
      }
      break;

    case "paladin": {
      if (level >= 1) {
        resources.push({
          key: "divine-sense",
          name: "Sentido Divino",
          max: 1 + chaMod,
          used: 0,
          recharge: "long",
        });
      }
      if (level >= 1) {
        resources.push({
          key: "lay-on-hands",
          name: "Cura pelas Maos",
          max: 5 * level,
          used: 0,
          recharge: "long",
        });
      }
      break;
    }

    case "sorcerer":
      if (level >= 2) {
        resources.push({
          key: "sorcery-points",
          name: "Pontos de Feiticaria",
          max: level,
          used: 0,
          recharge: "long",
        });
      }
      break;

    case "warlock":
      resources.push({
        key: "pact-slots",
        name: "Slots de Pacto",
        max: pactSlots(level),
        used: 0,
        recharge: "short",
      });
      break;

    // druid, ranger, rogue, wizard: no special counters
    default:
      break;
  }

  return resources;
}
```

- [x] **Step 4: Run tests**

```bash
npm test -- lib/__tests__/classResources.test.ts --verbose
```

Expected: All PASS.

- [x] **Step 5: Commit**

```bash
git add lib/classResources.ts lib/__tests__/classResources.test.ts
git commit -m "feat: add class resource derivation library with tests

getClassResources returns counters for barbarian rage, bardic inspiration,
channel divinity, second wind, action surge, ki, lay on hands, divine sense,
sorcery points, and pact slots based on class and level."
```

---

### Task 2: Session Store (Ephemeral Zustand)

**Files:**
- Create: `store/sessionStore.ts`

- [x] **Step 1: Create ephemeral session store**

Create `store/sessionStore.ts`:

```ts
import { create } from "zustand";
import type { ResourceCounter } from "@/lib/classResources";
import { rollNotation } from "@/lib/dice";
import { generateId } from "@/lib/utils";

export interface RollLogEntry {
  id: string;
  type: "initiative" | "attack" | "damage" | "ability" | "save" | "custom";
  notation: string;
  rolls: number[];
  total: number;
  description: string;
  timestamp: number;
}

interface SessionState {
  isActive: boolean;
  characterId: string | null;
  resourceCounters: ResourceCounter[];
  rollLog: RollLogEntry[];
  initiativeRoll: number | null;

  startSession: (characterId: string, counters: ResourceCounter[]) => void;
  endSession: () => void;
  useResource: (key: string) => void;
  restoreResource: (key: string) => void;
  shortRest: () => void;
  longRest: () => void;
  rollInitiative: (dexMod: number) => void;
  addRoll: (entry: Omit<RollLogEntry, "id" | "timestamp">) => void;
  clearLog: () => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  isActive: false,
  characterId: null,
  resourceCounters: [],
  rollLog: [],
  initiativeRoll: null,

  startSession: (characterId, counters) => {
    set({
      isActive: true,
      characterId,
      resourceCounters: counters.map((c) => ({ ...c, used: 0 })),
      rollLog: [],
      initiativeRoll: null,
    });
  },

  endSession: () => {
    set({
      isActive: false,
      characterId: null,
      resourceCounters: [],
      rollLog: [],
      initiativeRoll: null,
    });
  },

  useResource: (key) => {
    set((state) => ({
      resourceCounters: state.resourceCounters.map((r) =>
        r.key === key && r.used < r.max ? { ...r, used: r.used + 1 } : r
      ),
    }));
  },

  restoreResource: (key) => {
    set((state) => ({
      resourceCounters: state.resourceCounters.map((r) =>
        r.key === key && r.used > 0 ? { ...r, used: r.used - 1 } : r
      ),
    }));
  },

  shortRest: () => {
    set((state) => ({
      resourceCounters: state.resourceCounters.map((r) =>
        r.recharge === "short" ? { ...r, used: 0 } : r
      ),
    }));
  },

  longRest: () => {
    set((state) => ({
      resourceCounters: state.resourceCounters.map((r) => ({ ...r, used: 0 })),
    }));
  },

  rollInitiative: (dexMod) => {
    const result = rollNotation(`1d20${dexMod >= 0 ? "+" : ""}${dexMod}`);
    set((state) => ({
      initiativeRoll: result.total,
      rollLog: [
        {
          id: generateId(),
          type: "initiative",
          notation: result.notation,
          rolls: result.rolls,
          total: result.total,
          description: "Iniciativa",
          timestamp: Date.now(),
        },
        ...state.rollLog,
      ],
    }));
  },

  addRoll: (entry) => {
    set((state) => ({
      rollLog: [
        { ...entry, id: generateId(), timestamp: Date.now() },
        ...state.rollLog,
      ],
    }));
  },

  clearLog: () => set({ rollLog: [] }),
}));
```

- [x] **Step 2: Commit**

```bash
git add store/sessionStore.ts
git commit -m "feat: add ephemeral session store for Session Mode

No persist — data clears on page exit. Manages resource counters,
initiative rolls, roll log, short/long rest recovery."
```

---

### Task 3: Session UI Components

**Files:**
- Create: `components/character/ResourceCounter.tsx`, `components/character/InitiativeRoller.tsx`, `components/character/RollLog.tsx`, `components/character/SessionPanel.tsx`

- [x] **Step 1: Create ResourceCounter**

Create `components/character/ResourceCounter.tsx`:

```tsx
"use client";

import type { ResourceCounter as ResourceCounterType } from "@/lib/classResources";

interface ResourceCounterProps {
  counter: ResourceCounterType;
  onUse: () => void;
  onRestore: () => void;
}

export function ResourceCounter({ counter, onUse, onRestore }: ResourceCounterProps) {
  const available = counter.max - counter.used;
  const isPool = counter.max > 10; // lay on hands, etc — show as number instead of circles

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-sm text-gold">{counter.name}</span>
          <span className="text-xs text-parchment-light/40">
            ({counter.recharge === "short" ? "Desc. Curto" : "Desc. Longo"})
          </span>
        </div>
        {isPool ? (
          <span className="text-lg font-cinzel text-parchment-light">{available} / {counter.max}</span>
        ) : (
          <div className="flex gap-1 mt-1">
            {Array.from({ length: counter.max }, (_, i) => (
              <button
                key={i}
                onClick={() => (i < counter.used ? onRestore() : onUse())}
                className={`w-5 h-5 rounded-full border transition-colors ${
                  i < counter.used
                    ? "bg-gold/20 border-gold/30"
                    : "bg-gold border-gold"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <button
          onClick={onUse}
          disabled={available <= 0}
          className="px-2 py-1 text-xs bg-blood/20 border border-blood/30 rounded text-red-300 hover:bg-blood/30 disabled:opacity-30 transition-colors"
        >
          Usar
        </button>
        <button
          onClick={onRestore}
          disabled={counter.used <= 0}
          className="px-2 py-1 text-xs bg-green-900/20 border border-green-700/30 rounded text-green-300 hover:bg-green-900/30 disabled:opacity-30 transition-colors"
        >
          +1
        </button>
      </div>
    </div>
  );
}
```

- [x] **Step 2: Create InitiativeRoller**

Create `components/character/InitiativeRoller.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatModifier } from "@/lib/utils";

interface InitiativeRollerProps {
  dexMod: number;
  currentRoll: number | null;
  onRoll: () => void;
}

export function InitiativeRoller({ dexMod, currentRoll, onRoll }: InitiativeRollerProps) {
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
        Rolar Iniciativa
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
```

- [x] **Step 3: Create RollLog**

Create `components/character/RollLog.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { RollLogEntry } from "@/store/sessionStore";
import { Trash2 } from "lucide-react";

interface RollLogProps {
  entries: RollLogEntry[];
  onClear: () => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

const TYPE_COLORS: Record<string, string> = {
  initiative: "text-gold",
  attack: "text-blue-300",
  damage: "text-red-300",
  ability: "text-green-300",
  save: "text-purple-300",
  custom: "text-parchment-light",
};

export function RollLog({ entries, onClear }: RollLogProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-cinzel text-xs text-gold/60">Log de Rolagens</span>
        {entries.length > 0 && (
          <button onClick={onClear} className="text-xs text-parchment-light/30 hover:text-parchment-light flex items-center gap-1">
            <Trash2 size={12} /> Limpar
          </button>
        )}
      </div>
      <div className="max-h-48 overflow-y-auto space-y-1">
        <AnimatePresence initial={false}>
          {entries.length === 0 ? (
            <p className="text-xs text-parchment-light/30 text-center py-4">Nenhuma rolagem ainda</p>
          ) : (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs py-1 border-b border-gold/5"
              >
                <span className="text-parchment-light/30 w-10">{formatTime(entry.timestamp)}</span>
                <span className={TYPE_COLORS[entry.type] || "text-parchment-light"}>
                  {entry.description}:
                </span>
                <span className="text-parchment-light/60">{entry.notation}</span>
                <span className="text-parchment-light font-bold">= {entry.total}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [x] **Step 4: Create SessionPanel**

Create `components/character/SessionPanel.tsx`:

```tsx
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
```

- [x] **Step 5: Commit**

```bash
git add components/character/ResourceCounter.tsx components/character/InitiativeRoller.tsx components/character/RollLog.tsx components/character/SessionPanel.tsx
git commit -m "feat: add Session Mode UI components

ResourceCounter (circles + use/restore), InitiativeRoller (d20 animation),
RollLog (timestamped entries), SessionPanel (composes all session controls)."
```

---

### Task 4: Wire Session Mode into Character Sheet

**Files:**
- Modify: `app/character/[id]/page.tsx`

- [x] **Step 1: Add session toggle and panel to character sheet**

In `app/character/[id]/page.tsx`, add imports:

```tsx
import { useSessionStore } from "@/store/sessionStore";
import { getClassResources } from "@/lib/classResources";
import { SessionPanel } from "@/components/character/SessionPanel";
import { ScrollSection } from "@/components/ui/ScrollSection";
import { Swords } from "lucide-react";
```

Inside the component function, after the existing state/calculations, add:

```tsx
const { isActive: sessionActive, startSession, endSession } = useSessionStore();
const dexMod = getModifier(character.attributes.dex);

const toggleSession = () => {
  if (sessionActive) {
    endSession();
  } else {
    const resources = getClassResources(character.class, character.level, character.attributes);
    startSession(character.id, resources);
  }
};
```

In the JSX, add the session toggle button in the header (next to PdfExportButton if it exists, or next to the back button):

```tsx
<Button
  onClick={toggleSession}
  variant={sessionActive ? "danger" : "secondary"}
  size="sm"
>
  <Swords size={14} className="mr-1" />
  {sessionActive ? "Encerrar Sessao" : "Modo Sessao"}
</Button>
```

Then add the SessionPanel as a ScrollSection right after the header, before the Identity section:

```tsx
{sessionActive && (
  <ScrollSection title="Modo Sessao" defaultOpen={true}>
    <SessionPanel dexMod={dexMod} />
  </ScrollSection>
)}
```

- [x] **Step 2: Verify build**

```bash
npm run build
```

- [x] **Step 3: Run tests**

```bash
npm test -- --verbose
```

All existing + new tests should pass.

- [x] **Step 4: Commit**

```bash
git add app/character/[id]/page.tsx
git commit -m "feat: wire Session Mode into character sheet

Toggle button in header, SessionPanel with class resource counters,
initiative roller, and roll log. Ephemeral — clears on page exit."
```

- [x] **Step 5: Update docs**

Update `docs/superpowers/ROADMAP.md` — change T20 status from "Pendente" to "✅ Completo".
Update `docs/superpowers/specs/modules/07-session-mode.md` — change status from "Pendente" to "✅ Implementado".

```bash
git add docs/
git commit -m "docs: mark Session Mode (T20) as complete in roadmap and spec"
```
