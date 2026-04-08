# Plano: Etapa 2 — Camada de Dados e UI Base (T6-T10)

**Status:** ✅ Completo
**Specs:** `00-foundation.md`, `01-domain.md`, `02-compendium.md`, `03-master.md`

---

### Task 6: Open5e API Client

**Files:**
- Create: `lib/open5e.ts`

- [x] **Step 1: Create Open5e API wrapper**

Create `lib/open5e.ts`:

```ts
import type {
  Open5eSpell,
  Open5eMonster,
  Open5eMagicItem,
  Open5ePaginatedResponse,
} from "@/types/dnd5e";

const BASE_URL = "https://api.open5e.com/v1";
const REVALIDATE = 86400; // 24 hours

async function fetchPaginated<T>(endpoint: string): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = `${BASE_URL}${endpoint}?format=json&limit=50`;

  while (url) {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      console.error(`Open5e API error: ${res.status} for ${url}`);
      break;
    }
    const data: Open5ePaginatedResponse<T> = await res.json();
    results.push(...data.results);
    url = data.next;
  }

  return results;
}

export async function fetchSpells(): Promise<Open5eSpell[]> {
  return fetchPaginated<Open5eSpell>("/spells/");
}

export async function fetchSpellBySlug(slug: string): Promise<Open5eSpell | null> {
  const res = await fetch(`${BASE_URL}/spells/${slug}/?format=json`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMonsters(): Promise<Open5eMonster[]> {
  return fetchPaginated<Open5eMonster>("/monsters/");
}

export async function fetchMonsterBySlug(slug: string): Promise<Open5eMonster | null> {
  const res = await fetch(`${BASE_URL}/monsters/${slug}/?format=json`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMagicItems(): Promise<Open5eMagicItem[]> {
  return fetchPaginated<Open5eMagicItem>("/magicitems/");
}

export async function fetchMagicItemBySlug(slug: string): Promise<Open5eMagicItem | null> {
  const res = await fetch(`${BASE_URL}/magicitems/${slug}/?format=json`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  return res.json();
}
```

- [x] **Step 2: Commit**

```bash
git add lib/open5e.ts
git commit -m "feat: add Open5e API client with auto-pagination and 24h cache

Fetch wrappers for spells, monsters, and magic items.
Uses Next.js fetch revalidate for server-side caching."
```

---

### Task 7: Character Zustand Store

**Files:**
- Create: `store/characterStore.ts`, `lib/utils.ts`

- [x] **Step 1: Create utils**

Create `lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
```

Wait — we don't need `clsx` since we're using Tailwind utility classes and simple string concatenation. Simplify:

```ts
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
```

- [x] **Step 2: Create character store**

Create `store/characterStore.ts`:

```ts
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
    })),
    {
      name: "dd5e-characters",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
```

- [x] **Step 3: Commit**

```bash
git add lib/utils.ts store/characterStore.ts
git commit -m "feat: add character Zustand store with localStorage persistence

CRUD operations with immer for deep updates. Hydration guard pattern
to prevent SSR/client mismatch. Default character template included."
```

---

### Task 8: Campaign Zustand Store

**Files:**
- Create: `store/campaignStore.ts`

- [x] **Step 1: Create campaign store**

Create `store/campaignStore.ts`:

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Campaign, NPC, Encounter, Session, Condition } from "@/types/dnd5e";
import { generateId } from "@/lib/utils";
import { getXpMultiplier, getEncounterDifficulty } from "@/lib/dnd5e";

interface CampaignState {
  campaigns: Campaign[];
  pinHash: string | null;
  activeCampaignId: string | null;
  isHydrated: boolean;

  setHydrated: () => void;

  // PIN
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  isPinSet: () => boolean;

  // Campaigns
  createCampaign: (data: Pick<Campaign, "name" | "description" | "world">) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  setActiveCampaign: (id: string | null) => void;
  getCampaign: (id: string) => Campaign | undefined;

  // NPCs (within active campaign)
  addNpc: (campaignId: string, npc: Omit<NPC, "id">) => void;
  updateNpc: (campaignId: string, npcId: string, updates: Partial<NPC>) => void;
  deleteNpc: (campaignId: string, npcId: string) => void;

  // Encounters
  addEncounter: (campaignId: string, encounter: Omit<Encounter, "id" | "difficulty" | "totalXP" | "adjustedXP" | "currentTurnIndex">) => void;
  updateEncounter: (campaignId: string, encounterId: string, updates: Partial<Encounter>) => void;
  deleteEncounter: (campaignId: string, encounterId: string) => void;
  recalculateEncounter: (campaignId: string, encounterId: string) => void;

  // Sessions
  addSession: (campaignId: string, session: Omit<Session, "id">) => void;
  updateSession: (campaignId: string, sessionId: string, updates: Partial<Session>) => void;
  deleteSession: (campaignId: string, sessionId: string) => void;

  // Notes
  updateCampaignNotes: (campaignId: string, notes: string) => void;
}

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    immer((set, get) => ({
      campaigns: [],
      pinHash: null,
      activeCampaignId: null,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      // PIN
      setPin: async (pin) => {
        const hash = await hashPin(pin);
        set({ pinHash: hash });
      },

      verifyPin: async (pin) => {
        const hash = await hashPin(pin);
        return hash === get().pinHash;
      },

      isPinSet: () => get().pinHash !== null,

      // Campaigns
      createCampaign: (data) => {
        const now = new Date().toISOString();
        const campaign: Campaign = {
          ...data,
          id: generateId(),
          playerCharacterIds: [],
          sessions: [],
          npcs: [],
          encounters: [],
          notes: "",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          state.campaigns.push(campaign);
        });
        return campaign;
      },

      updateCampaign: (id, updates) => {
        set((state) => {
          const idx = state.campaigns.findIndex((c) => c.id === id);
          if (idx !== -1) {
            Object.assign(state.campaigns[idx], updates, { updatedAt: new Date().toISOString() });
          }
        });
      },

      deleteCampaign: (id) => {
        set((state) => {
          state.campaigns = state.campaigns.filter((c) => c.id !== id);
          if (state.activeCampaignId === id) state.activeCampaignId = null;
        });
      },

      setActiveCampaign: (id) => set({ activeCampaignId: id }),

      getCampaign: (id) => get().campaigns.find((c) => c.id === id),

      // NPCs
      addNpc: (campaignId, npcData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.npcs.push({ ...npcData, id: generateId() });
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      updateNpc: (campaignId, npcId, updates) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const npc = campaign.npcs.find((n) => n.id === npcId);
            if (npc) Object.assign(npc, updates);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteNpc: (campaignId, npcId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.npcs = campaign.npcs.filter((n) => n.id !== npcId);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      // Encounters
      addEncounter: (campaignId, encounterData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const totalXP = encounterData.monsters.reduce((sum, m) => sum + m.xp, 0);
            const multiplier = getXpMultiplier(encounterData.monsters.length);
            const adjustedXP = Math.floor(totalXP * multiplier);
            const difficulty = getEncounterDifficulty(
              encounterData.partyLevel,
              encounterData.partySize,
              adjustedXP
            );
            campaign.encounters.push({
              ...encounterData,
              id: generateId(),
              totalXP,
              adjustedXP,
              difficulty,
              currentTurnIndex: 0,
            });
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      updateEncounter: (campaignId, encounterId, updates) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const encounter = campaign.encounters.find((e) => e.id === encounterId);
            if (encounter) Object.assign(encounter, updates);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteEncounter: (campaignId, encounterId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.encounters = campaign.encounters.filter((e) => e.id !== encounterId);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      recalculateEncounter: (campaignId, encounterId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (!campaign) return;
          const encounter = campaign.encounters.find((e) => e.id === encounterId);
          if (!encounter) return;
          encounter.totalXP = encounter.monsters.reduce((sum, m) => sum + m.xp, 0);
          const multiplier = getXpMultiplier(encounter.monsters.length);
          encounter.adjustedXP = Math.floor(encounter.totalXP * multiplier);
          encounter.difficulty = getEncounterDifficulty(
            encounter.partyLevel,
            encounter.partySize,
            encounter.adjustedXP
          );
        });
      },

      // Sessions
      addSession: (campaignId, sessionData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.sessions.push({ ...sessionData, id: generateId() });
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      updateSession: (campaignId, sessionId, updates) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const session = campaign.sessions.find((s) => s.id === sessionId);
            if (session) Object.assign(session, updates);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteSession: (campaignId, sessionId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.sessions = campaign.sessions.filter((s) => s.id !== sessionId);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      // Notes
      updateCampaignNotes: (campaignId, notes) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.notes = notes;
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },
    })),
    {
      name: "dd5e-campaigns",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
```

- [x] **Step 2: Commit**

```bash
git add store/campaignStore.ts
git commit -m "feat: add campaign Zustand store with PIN auth and encounter management

CRUD for campaigns, NPCs, encounters, sessions, and notes.
SHA-256 PIN hashing via Web Crypto API. Auto-calculates encounter difficulty."
```

---

### Task 9: Shared UI Components

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/Card.tsx`, `components/ui/Modal.tsx`, `components/ui/Input.tsx`, `components/ui/ScrollSection.tsx`, `components/ui/SectionHeader.tsx`, `components/ui/Badge.tsx`

- [x] **Step 1: Create Button component**

Create `components/ui/Button.tsx`:

```tsx
"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-gold hover:bg-gold-light text-ink font-bold",
  danger: "bg-blood hover:bg-blood-light text-parchment-light font-bold",
  ghost: "bg-transparent hover:bg-parchment/10 text-parchment-light",
  secondary: "bg-parchment-dark/20 hover:bg-parchment-dark/30 text-parchment-light border border-gold/30",
};

const sizes = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "font-cinzel rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
```

- [x] **Step 2: Create Card component**

Create `components/ui/Card.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "parchment" | "dark";
}

export function Card({ className, variant = "dark", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg shadow-tome",
        variant === "parchment"
          ? "bg-parchment border border-gold text-ink"
          : "bg-ink-light border border-gold/30 text-parchment-light",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [x] **Step 3: Create Modal component**

Create `components/ui/Modal.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={cn(
              "bg-ink-light border border-gold/30 rounded-lg shadow-tome max-h-[90vh] overflow-y-auto w-full max-w-lg",
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20">
                <h2 className="font-cinzel text-lg text-gold">{title}</h2>
                <button onClick={onClose} className="text-parchment-light/50 hover:text-parchment-light">
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [x] **Step 4: Create Input component**

Create `components/ui/Input.tsx`:

```tsx
"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-parchment-light/70 font-cinzel">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "bg-parchment-light/10 border border-gold/30 rounded px-3 py-2 text-parchment-light",
          "placeholder:text-parchment-light/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50",
          className
        )}
        {...props}
      />
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-parchment-light/70 font-cinzel">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "bg-parchment-light/10 border border-gold/30 rounded px-3 py-2 text-parchment-light",
          "placeholder:text-parchment-light/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 resize-y",
          className
        )}
        {...props}
      />
    </div>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, options, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-parchment-light/70 font-cinzel">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          "bg-parchment-light/10 border border-gold/30 rounded px-3 py-2 text-parchment-light",
          "focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-ink-light">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
);
Select.displayName = "Select";
```

- [x] **Step 5: Create ScrollSection (accordion) component**

Create `components/ui/ScrollSection.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ScrollSection({ title, defaultOpen = true, children, className }: ScrollSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border border-gold/20 rounded-lg overflow-hidden", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-ink-light hover:bg-ink-light/80 transition-colors"
      >
        <h3 className="font-cinzel text-gold text-sm tracking-wide">{title}</h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-gold/60" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 border-t border-gold/10">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [x] **Step 6: Create SectionHeader and Badge**

Create `components/ui/SectionHeader.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  className?: string;
}

export function SectionHeader({ title, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-4", className)}>
      <div className="h-px flex-1 bg-gold/30" />
      <h2 className="font-cinzel text-gold text-xl tracking-wider">{title}</h2>
      <div className="h-px flex-1 bg-gold/30" />
    </div>
  );
}
```

Create `components/ui/Badge.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  color?: "gold" | "blood" | "green" | "blue" | "purple";
  className?: string;
}

const colors = {
  gold: "bg-gold/20 text-gold border-gold/40",
  blood: "bg-blood/20 text-red-300 border-blood/40",
  green: "bg-green-900/30 text-green-300 border-green-700/40",
  blue: "bg-blue-900/30 text-blue-300 border-blue-700/40",
  purple: "bg-purple-900/30 text-purple-300 border-purple-700/40",
};

const activeColors = {
  gold: "bg-gold text-ink border-gold",
  blood: "bg-blood text-parchment-light border-blood",
  green: "bg-green-700 text-white border-green-600",
  blue: "bg-blue-700 text-white border-blue-600",
  purple: "bg-purple-700 text-white border-purple-600",
};

export function Badge({ label, active = false, onClick, color = "gold", className }: BadgeProps) {
  const Component = onClick ? "button" : "span";
  return (
    <Component
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-cinzel rounded border transition-colors",
        active ? activeColors[color] : colors[color],
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
    >
      {label}
    </Component>
  );
}
```

- [x] **Step 7: Commit**

```bash
git add components/ui/
git commit -m "feat: add shared UI components with medieval theme

Button, Card, Modal, Input/Textarea/Select, ScrollSection (accordion),
SectionHeader, and Badge. All styled with parchment/gold/ink palette."
```

---

### Task 10: Layout Components and Navigation

**Files:**
- Create: `components/layout/Navbar.tsx`, `app/layout.tsx` (update)

- [x] **Step 1: Create Navbar**

Create `components/layout/Navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sword, BookOpen, Crown, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/character", label: "Personagens", icon: Sword },
  { href: "/compendium", label: "Compêndio", icon: BookOpen },
  { href: "/master", label: "Mestre", icon: Crown },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors">
          <Scroll size={24} />
          <span className="font-cinzel font-bold text-lg hidden sm:inline">D&D 5e Toolkit</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded font-cinzel text-sm transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-gold/20 text-gold"
                  : "text-parchment-light/60 hover:text-parchment-light hover:bg-parchment/5"
              )}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-parchment-light/60 hover:text-parchment-light"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gold/20 bg-ink/95 backdrop-blur">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-cinzel text-sm border-b border-gold/10 transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-gold/10 text-gold"
                  : "text-parchment-light/60 hover:text-parchment-light"
              )}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
```

- [x] **Step 2: Update root layout to include Navbar**

Update `app/layout.tsx` — add Navbar import and render it inside `<body>`:

```tsx
import type { Metadata } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "D&D 5e Toolkit",
  description:
    "Ferramenta completa para jogadores e mestres de Dungeons & Dragons 5a Edição",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${crimsonText.variable}`}>
      <body className="bg-ink font-crimson text-parchment-light min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
```

- [x] **Step 3: Verify dev server runs**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: landing page with Navbar, 3 module cards, medieval theme visible.

- [x] **Step 4: Commit**

```bash
git add components/layout/ app/layout.tsx
git commit -m "feat: add Navbar with responsive mobile menu and active link highlighting"
```

---

