import { create } from "zustand";
import type { ResourceCounter } from "@/lib/classResources";
import { rollNotation } from "@/lib/dice";
import { generateId } from "@/lib/utils";
import type { AdvantageMode } from "@/lib/rollWithAdvantage";

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
  advantageMode: AdvantageMode;

  startSession: (characterId: string, counters: ResourceCounter[]) => void;
  endSession: () => void;
  useResource: (key: string) => void;
  restoreResource: (key: string) => void;
  shortRest: () => void;
  longRest: () => void;
  rollInitiative: (dexMod: number) => void;
  addRoll: (entry: Omit<RollLogEntry, "id" | "timestamp">) => void;
  clearLog: () => void;
  setAdvantageMode: (mode: AdvantageMode) => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  isActive: false,
  characterId: null,
  resourceCounters: [],
  rollLog: [],
  initiativeRoll: null,
  advantageMode: "normal",

  startSession: (characterId, counters) => {
    set({
      isActive: true,
      characterId,
      resourceCounters: counters.map((c) => ({ ...c, used: 0 })),
      rollLog: [],
      initiativeRoll: null,
      advantageMode: "normal",
    });
  },

  endSession: () => {
    set({
      isActive: false,
      characterId: null,
      resourceCounters: [],
      rollLog: [],
      initiativeRoll: null,
      advantageMode: "normal",
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

  setAdvantageMode: (mode) => set({ advantageMode: mode }),
}));
