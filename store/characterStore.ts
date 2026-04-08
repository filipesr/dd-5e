import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Character } from "@/types/dnd5e";
import { generateId } from "@/lib/utils";

interface CharacterState {
  characters: Character[];
  isHydrated: boolean;
  setHydrated: () => void;
  createCharacter: (partial: Partial<Character>) => Character;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  getCharacter: (id: string) => Character | undefined;
  toggleInspiration: (id: string) => void;
}

const DEFAULT_CHARACTER: Omit<Character, "id" | "createdAt" | "updatedAt"> = {
  name: "Novo Personagem",
  race: "human",
  class: "fighter",
  level: 1,
  background: "",
  alignment: "true-neutral",
  xp: 0,
  attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  hp: { max: 10, current: 10, temporary: 0 },
  ac: 10,
  initiative: 0,
  speed: 30,
  skillProficiencies: {},
  savingThrowProficiencies: [],
  attacks: [],
  spellSlots: {},
  spells: {},
  spellcastingAbility: null,
  conditions: [],
  hitDice: { dieType: 10, total: 1, used: 0 },
  deathSaves: { successes: 0, failures: 0 },
  inspiration: false,
  inventory: [],
  coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  traits: { personality: "", ideals: "", bonds: "", flaws: "" },
  notes: { appearance: "", backstory: "", allies: "", freeNotes: "" },
};

export const useCharacterStore = create<CharacterState>()(
  persist(
    immer((set, get) => ({
      characters: [],
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      createCharacter: (partial) => {
        const now = new Date().toISOString();
        const character: Character = {
          ...DEFAULT_CHARACTER,
          ...partial,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          state.characters.push(character);
        });
        return character;
      },

      updateCharacter: (id, updates) => {
        set((state) => {
          const index = state.characters.findIndex((c) => c.id === id);
          if (index !== -1) {
            Object.assign(state.characters[index], updates, {
              updatedAt: new Date().toISOString(),
            });
          }
        });
      },

      deleteCharacter: (id) => {
        set((state) => {
          state.characters = state.characters.filter((c) => c.id !== id);
        });
      },

      getCharacter: (id) => {
        return get().characters.find((c) => c.id === id);
      },

      toggleInspiration: (id) => {
        set((state) => {
          const character = state.characters.find((c) => c.id === id);
          if (character) {
            character.inspiration = !character.inspiration;
            character.updatedAt = new Date().toISOString();
          }
        });
      },
    })),
    {
      name: "dd5e-characters",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
