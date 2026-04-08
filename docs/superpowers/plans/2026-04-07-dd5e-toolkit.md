# D&D 5e Toolkit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a D&D 5e web toolkit with Character Sheet, Compendium, and DM Dashboard — medieval themed, Vercel-deployed.

**Architecture:** Next.js 14 App Router monolith. Client-side state with Zustand + localStorage. Hybrid data: static JSON (races/classes/conditions/rules/skills) + Open5e API (spells/monsters/items). Server Components for compendium, Client Components for character sheet and DM area.

**Tech Stack:** Next.js 14, TypeScript strict, TailwindCSS, Zustand (+ immer + persist), TipTap, framer-motion, lucide-react, Open5e API

**Spec:** `docs/superpowers/specs/2026-04-07-dd5e-toolkit-design.md`

---

## Implementation Status (Updated 2026-04-08)

| Task | Description | Status | Commit |
|------|-------------|--------|--------|
| T1 | Project Scaffold and Configuration | ✅ Done | `48bc3ab` |
| T2 | Domain Types | ✅ Done | `0ba9381` |
| T3 | Static JSON Data Files | ✅ Done | `d2adc83` |
| T4 | Core Calculation Library (TDD) | ✅ Done | `26d02b2` |
| T5 | Dice Roller Library (TDD) | ✅ Done | `26d02b2` |
| T6 | Open5e API Client | ✅ Done | `6760692` |
| T7 | Character Zustand Store | ✅ Done | `6760692` |
| T8 | Campaign Zustand Store | ✅ Done | `6760692` |
| T9 | Shared UI Components | ✅ Done | `04d2607` |
| T10 | Layout Components and Navigation | ✅ Done | `04d2607` |
| T11 | Character Sheet Components | ✅ Done | `5d63f79` |
| T12 | Compendium Components | ✅ Done | `884f2f1` |
| T13 | Master Area Components | ✅ Done | `bf8e412` |
| T14 | Character Pages | ✅ Done | `b92ebcf` |
| T15 | Compendium Pages | ✅ Done | `7f74c81` |
| T16 | Master Pages | ✅ Done | `8223c64` |
| T17 | Visual Polish and Responsiveness | ⏳ Pending | — |
| T18 | Build Verification and Deploy | ⏳ Partial | Build passes, deploy pending |

**Summary:** 16/18 tasks complete. Build passes (`npm run build` ✓). 46 tests passing (`npm test` ✓). Tasks 17 (polish) and 18 (deploy) remaining.

**Known items to address:**
- Task 17: Page transitions (framer-motion), hover effects polish, responsive audit
- Task 18: Vercel deployment, Lighthouse audit
- `data/classes.json`: Half-elf abilityBonuses use placeholder keys for player-choice bonuses
- `master/campaign/[id]` page: First Load JS is 270kB (TipTap bundle) — consider dynamic import

---

## Parallelization Map

```
Sequential:  T1 (scaffold)              ✅
Parallel:    T2, T3, T4, T5             ✅ (types, data, libs — independent)
Parallel:    T6, T7, T8, T9, T10        ✅ (stores, API client, UI — independent)
Parallel:    T11, T12, T13              ✅ (feature components — per module)
Parallel:    T14, T15, T16              ✅ (pages — per module)
Sequential:  T17 → T18                  ⏳ (polish, deploy)
```

---

### Task 1: Project Scaffold and Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [x] **Step 1: Create Next.js 14 project**

```bash
cd /Users/fsrezende/Documents/algorithm/dd-5e
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Select defaults. This scaffolds the project with App Router and Tailwind.

- [x] **Step 2: Install all dependencies**

```bash
npm install zustand immer framer-motion lucide-react @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder uuid
npm install -D @types/uuid
```

- [x] **Step 3: Configure Tailwind theme**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: "#f4e4c1",
          DEFAULT: "#ede0b0",
          dark: "#d4c48a",
        },
        ink: {
          light: "#1a0f02",
          DEFAULT: "#0d0600",
          dark: "#000000",
        },
        blood: {
          light: "#a52a2a",
          DEFAULT: "#8b1a1a",
          dark: "#5c1010",
        },
        gold: {
          light: "#b8941e",
          DEFAULT: "#8b6914",
          dark: "#6b4f0e",
        },
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        crimson: ["var(--font-crimson)", "serif"],
      },
      boxShadow: {
        tome: "0 4px 12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(139, 105, 20, 0.3)",
        "tome-hover":
          "0 6px 20px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(139, 105, 20, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [x] **Step 4: Configure root layout with fonts**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
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
        {children}
      </body>
    </html>
  );
}
```

- [x] **Step 5: Configure globals.css**

Replace `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background: linear-gradient(180deg, #0d0600 0%, #1a0f02 100%);
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #0d0600;
  }

  ::-webkit-scrollbar-thumb {
    background: #8b6914;
    border-radius: 4px;
  }
}

@layer components {
  .card-medieval {
    @apply bg-parchment border border-gold rounded-lg shadow-tome text-ink;
  }

  .card-medieval-dark {
    @apply bg-ink-light border border-gold/30 rounded-lg shadow-tome text-parchment-light;
  }

  .btn-primary {
    @apply bg-gold hover:bg-gold-light text-ink font-cinzel font-bold px-4 py-2 rounded transition-colors;
  }

  .btn-danger {
    @apply bg-blood hover:bg-blood-light text-parchment-light font-cinzel font-bold px-4 py-2 rounded transition-colors;
  }

  .input-medieval {
    @apply bg-parchment-light border border-gold/50 rounded px-3 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold;
  }
}
```

- [x] **Step 6: Create placeholder landing page**

Replace `app/page.tsx` with:

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="font-cinzel text-5xl text-gold mb-4">D&D 5e Toolkit</h1>
      <p className="text-parchment-light/70 text-lg mb-12 text-center max-w-md">
        Ferramenta completa para jogadores e mestres de Dungeons & Dragons 5a Edição
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <Link href="/character" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">Personagens</h2>
          <p className="text-sm text-parchment-light/60">Crie e gerencie fichas de personagem</p>
        </Link>
        <Link href="/compendium" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">Compêndio</h2>
          <p className="text-sm text-parchment-light/60">Raças, classes, magias, monstros e itens</p>
        </Link>
        <Link href="/master" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">Mestre</h2>
          <p className="text-sm text-parchment-light/60">Dashboard completo para o DM</p>
        </Link>
      </div>
    </main>
  );
}
```

- [x] **Step 7: Create folder structure**

```bash
mkdir -p components/ui components/character components/compendium components/master components/layout
mkdir -p data lib store types
```

- [x] **Step 8: Verify build and commit**

```bash
npm run build
```

Expected: Build succeeds.

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 project with medieval Tailwind theme

Configure Cinzel + Crimson Text fonts, custom color palette (parchment/ink/blood/gold),
base CSS components, and folder structure for all 3 modules."
```

---

### Task 2: Domain Types

**Files:**
- Create: `types/dnd5e.ts`

- [x] **Step 1: Create all domain types**

Create `types/dnd5e.ts`:

```ts
// === Enums & Union Types ===

export const RACES = [
  "human", "elf", "dwarf", "halfling", "gnome",
  "half-elf", "half-orc", "tiefling", "dragonborn",
] as const;
export type Race = (typeof RACES)[number];

export const CLASSES = [
  "barbarian", "bard", "cleric", "druid", "fighter", "monk",
  "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard",
] as const;
export type CharacterClass = (typeof CLASSES)[number];

export const ATTRIBUTES = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type Attribute = (typeof ATTRIBUTES)[number];

export const SKILLS = [
  "acrobatics", "animalHandling", "arcana", "athletics",
  "deception", "history", "insight", "intimidation",
  "investigation", "medicine", "nature", "perception",
  "performance", "persuasion", "religion", "sleightOfHand",
  "stealth", "survival",
] as const;
export type Skill = (typeof SKILLS)[number];

export const SKILL_ATTRIBUTE_MAP: Record<Skill, Attribute> = {
  acrobatics: "dex",
  animalHandling: "wis",
  arcana: "int",
  athletics: "str",
  deception: "cha",
  history: "int",
  insight: "wis",
  intimidation: "cha",
  investigation: "int",
  medicine: "wis",
  nature: "int",
  perception: "wis",
  performance: "cha",
  persuasion: "cha",
  religion: "int",
  sleightOfHand: "dex",
  stealth: "dex",
  survival: "wis",
};

export const ALIGNMENTS = [
  "lawful-good", "neutral-good", "chaotic-good",
  "lawful-neutral", "true-neutral", "chaotic-neutral",
  "lawful-evil", "neutral-evil", "chaotic-evil",
] as const;
export type Alignment = (typeof ALIGNMENTS)[number];

export const CONDITIONS = [
  "blinded", "charmed", "deafened", "frightened",
  "grappled", "incapacitated", "invisible", "paralyzed",
  "petrified", "poisoned", "prone", "stunned",
] as const;
export type Condition = (typeof CONDITIONS)[number];

export const DAMAGE_TYPES = [
  "slashing", "piercing", "bludgeoning", "fire", "cold",
  "lightning", "thunder", "poison", "acid", "necrotic",
  "radiant", "force", "psychic",
] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];

export type CoinType = "cp" | "sp" | "ep" | "gp" | "pp";

// === Character ===

export interface Attack {
  id: string;
  name: string;
  attackBonus: number;
  damage: string;
  damageType: DamageType;
}

export interface SpellReference {
  name: string;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  valuePO: number;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  race: Race;
  class: CharacterClass;
  level: number;
  background: string;
  alignment: Alignment;
  xp: number;

  attributes: Record<Attribute, number>;

  hp: { max: number; current: number; temporary: number };
  ac: number;
  initiative: number;
  speed: number;

  skillProficiencies: Partial<Record<Skill, "proficient" | "expertise">>;
  savingThrowProficiencies: Attribute[];

  attacks: Attack[];

  spellSlots: Record<number, { max: number; used: number }>;
  spells: Record<number, SpellReference[]>;
  spellcastingAbility: Attribute | null;

  conditions: Condition[];

  hitDice: { dieType: number; total: number; used: number };
  deathSaves: { successes: number; failures: number };

  inventory: InventoryItem[];
  coins: Record<CoinType, number>;

  traits: {
    personality: string;
    ideals: string;
    bonds: string;
    flaws: string;
  };

  notes: {
    appearance: string;
    backstory: string;
    allies: string;
    freeNotes: string;
  };

  createdAt: string;
  updatedAt: string;
}

// === Campaign & Master ===

export interface NPC {
  id: string;
  name: string;
  race: string;
  profession: string;
  alignment: Alignment;
  hp: { max: number; current: number };
  ac: number;
  attributes: Record<Attribute, number>;
  role: "ally" | "neutral" | "antagonist" | "unknown";
  relationships: string;
  secrets: string;
  avatar: string;
  notes: string;
}

export interface EncounterMonster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  conditions: Condition[];
  xp: number;
}

export interface Encounter {
  id: string;
  name: string;
  monsters: EncounterMonster[];
  playerCharacters: { name: string; initiative: number; ac: number }[];
  partyLevel: number;
  partySize: number;
  difficulty: "easy" | "medium" | "hard" | "deadly";
  totalXP: number;
  adjustedXP: number;
  status: "planning" | "active" | "completed";
  currentTurnIndex: number;
}

export interface Session {
  id: string;
  date: string;
  title: string;
  summary: string;
  tags: string[];
  notes: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  world: string;
  playerCharacterIds: string[];
  sessions: Session[];
  npcs: NPC[];
  encounters: Encounter[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// === Compendium Data Types ===

export interface RaceData {
  slug: string;
  name: string;
  traits: string[];
  abilityBonuses: Partial<Record<Attribute, number>>;
  speed: number;
  darkvision: boolean;
  languages: string[];
  description: string;
}

export interface ClassData {
  slug: string;
  name: string;
  hitDie: number;
  primaryAbility: Attribute[];
  savingThrows: Attribute[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  skillChoices: { count: number; options: Skill[] };
  spellcasting: boolean;
  spellcastingAbility: Attribute | null;
  features: { level: number; name: string; description: string }[];
  spellSlots: Record<number, number[]>;
}

export interface ConditionData {
  slug: string;
  name: string;
  description: string;
}

export interface RuleData {
  slug: string;
  name: string;
  category: string;
  content: string;
}

export interface SkillData {
  slug: Skill;
  name: string;
  attribute: Attribute;
  description: string;
}

// === Open5e API response shapes ===

export interface Open5eSpell {
  slug: string;
  name: string;
  level: string;
  level_int: number;
  school: string;
  casting_time: string;
  range: string;
  components: string;
  duration: string;
  desc: string;
  higher_level?: string;
  dnd_class: string;
  ritual: string;
  concentration: string;
}

export interface Open5eMonster {
  slug: string;
  name: string;
  type: string;
  size: string;
  challenge_rating: string;
  hit_points: number;
  armor_class: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  speed: Record<string, number>;
  actions: { name: string; desc: string }[];
  reactions?: { name: string; desc: string }[];
  legendary_actions?: { name: string; desc: string }[];
  special_abilities?: { name: string; desc: string }[];
  desc?: string;
}

export interface Open5eMagicItem {
  slug: string;
  name: string;
  type: string;
  rarity: string;
  requires_attunement: string;
  desc: string;
}

export interface Open5ePaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

- [x] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [x] **Step 3: Commit**

```bash
git add types/dnd5e.ts
git commit -m "feat: add complete D&D 5e domain types

Character, Campaign, NPC, Encounter, Compendium data types,
Open5e API response shapes, and all union types/enums."
```

---

### Task 3: Static JSON Data Files

**Files:**
- Create: `data/races.json`, `data/classes.json`, `data/conditions.json`, `data/rules.json`, `data/skills.json`

- [x] **Step 1: Create races.json**

Create `data/races.json` with all 9 SRD races. Structure per race:

```json
[
  {
    "slug": "human",
    "name": "Humano",
    "traits": ["Versatilidade (aumento +1 em todos os atributos)", "Idioma extra"],
    "abilityBonuses": { "str": 1, "dex": 1, "con": 1, "int": 1, "wis": 1, "cha": 1 },
    "speed": 30,
    "darkvision": false,
    "languages": ["Comum", "Um idioma à escolha"],
    "description": "Os humanos são a raça mais adaptável e ambiciosa..."
  },
  {
    "slug": "elf",
    "name": "Elfo",
    "traits": ["Visão no Escuro", "Sentidos Aguçados (proficiência em Perception)", "Ancestralidade Feérica (vantagem contra Charmed)", "Transe (4h em vez de 8h de sono)"],
    "abilityBonuses": { "dex": 2 },
    "speed": 30,
    "darkvision": true,
    "languages": ["Comum", "Élfico"],
    "description": "Elfos são um povo mágico de graça sobrenatural..."
  },
  {
    "slug": "dwarf",
    "name": "Anão",
    "traits": ["Visão no Escuro", "Resiliência Anã (vantagem contra veneno)", "Treinamento de Combate Anão", "Especialização em Ferramentas", "Conhecimento em Pedra"],
    "abilityBonuses": { "con": 2 },
    "speed": 25,
    "darkvision": true,
    "languages": ["Comum", "Anão"],
    "description": "Anões são um povo resistente e robusto..."
  },
  {
    "slug": "halfling",
    "name": "Halfling",
    "traits": ["Sortudo (re-rolar 1 natural)", "Bravura (vantagem contra Frightened)", "Agilidade Halfling (mover através de criaturas maiores)"],
    "abilityBonuses": { "dex": 2 },
    "speed": 25,
    "darkvision": false,
    "languages": ["Comum", "Halfling"],
    "description": "Halflings são um povo pequeno e prático..."
  },
  {
    "slug": "gnome",
    "name": "Gnomo",
    "traits": ["Visão no Escuro", "Esperteza Gnômica (vantagem em saves INT/WIS/CHA contra magia)"],
    "abilityBonuses": { "int": 2 },
    "speed": 25,
    "darkvision": true,
    "languages": ["Comum", "Gnômico"],
    "description": "Gnomos são inventores e entusiastas eternos..."
  },
  {
    "slug": "half-elf",
    "name": "Meio-Elfo",
    "traits": ["Visão no Escuro", "Ancestralidade Feérica", "Versatilidade em Perícias (2 proficiências)"],
    "abilityBonuses": { "cha": 2 },
    "speed": 30,
    "darkvision": true,
    "languages": ["Comum", "Élfico", "Um idioma à escolha"],
    "description": "Meio-elfos combinam o melhor de humanos e elfos..."
  },
  {
    "slug": "half-orc",
    "name": "Meio-Orc",
    "traits": ["Visão no Escuro", "Ameaçador (proficiência em Intimidation)", "Resistência Implacável (1 HP em vez de 0, 1x por descanso longo)", "Ataques Selvagens (dado extra de dano em crítico corpo-a-corpo)"],
    "abilityBonuses": { "str": 2, "con": 1 },
    "speed": 30,
    "darkvision": true,
    "languages": ["Comum", "Orc"],
    "description": "Meio-orcs possuem a força e coragem de suas linhagens orc..."
  },
  {
    "slug": "tiefling",
    "name": "Tiefling",
    "traits": ["Visão no Escuro", "Resistência Infernal (resistência a dano de fogo)", "Legado Infernal (cantrip Thaumaturgy; Hellish Rebuke nível 3; Darkness nível 5)"],
    "abilityBonuses": { "cha": 2, "int": 1 },
    "speed": 30,
    "darkvision": true,
    "languages": ["Comum", "Infernal"],
    "description": "Tieflings carregam a marca de um passado infernal..."
  },
  {
    "slug": "dragonborn",
    "name": "Dragonborn",
    "traits": ["Ancestral Dracônico (tipo de dano e arma de sopro)", "Arma de Sopro (cone ou linha de dano elemental)", "Resistência a Dano (tipo do ancestral)"],
    "abilityBonuses": { "str": 2, "cha": 1 },
    "speed": 30,
    "darkvision": false,
    "languages": ["Comum", "Dracônico"],
    "description": "Dragonborn reivindicam descendência de dragões..."
  }
]
```

- [x] **Step 2: Create skills.json**

Create `data/skills.json`:

```json
[
  { "slug": "acrobatics", "name": "Acrobacia", "attribute": "dex", "description": "Tentativas de manter equilíbrio, acrobacias, manobras no ar." },
  { "slug": "animalHandling", "name": "Adestrar Animais", "attribute": "wis", "description": "Acalmar um animal domesticado, intuir intenções de animais, controlar montaria." },
  { "slug": "arcana", "name": "Arcanismo", "attribute": "int", "description": "Conhecimento sobre magias, itens mágicos, planos de existência e tradições arcanas." },
  { "slug": "athletics", "name": "Atletismo", "attribute": "str", "description": "Escalar, saltar, nadar e situações de força física." },
  { "slug": "deception", "name": "Enganação", "attribute": "cha", "description": "Enganar outros com mentiras, disfarces ou meias-verdades." },
  { "slug": "history", "name": "História", "attribute": "int", "description": "Lembrar-se de eventos históricos, civilizações, guerras e personalidades." },
  { "slug": "insight", "name": "Intuição", "attribute": "wis", "description": "Determinar as verdadeiras intenções de uma criatura." },
  { "slug": "intimidation", "name": "Intimidação", "attribute": "cha", "description": "Influenciar outros através de ameaças, hostilidade e presença física." },
  { "slug": "investigation", "name": "Investigação", "attribute": "int", "description": "Procurar pistas, fazer deduções e reunir informações." },
  { "slug": "medicine", "name": "Medicina", "attribute": "wis", "description": "Estabilizar um companheiro moribundo ou diagnosticar uma doença." },
  { "slug": "nature", "name": "Natureza", "attribute": "int", "description": "Conhecimento sobre terreno, plantas, animais, clima e ciclos naturais." },
  { "slug": "perception", "name": "Percepção", "attribute": "wis", "description": "Detectar a presença de algo usando visão, audição ou outros sentidos." },
  { "slug": "performance", "name": "Atuação", "attribute": "cha", "description": "Entreter uma audiência com música, dança, atuação ou narrativa." },
  { "slug": "persuasion", "name": "Persuasão", "attribute": "cha", "description": "Influenciar outros com tato, graça social ou boa índole." },
  { "slug": "religion", "name": "Religião", "attribute": "int", "description": "Conhecimento sobre deidades, ritos, orações, hierarquias e símbolos sagrados." },
  { "slug": "sleightOfHand", "name": "Prestidigitação", "attribute": "dex", "description": "Truques de mão, esconder objetos, furtar ou plantar itens." },
  { "slug": "stealth", "name": "Furtividade", "attribute": "dex", "description": "Esconder-se, mover-se silenciosamente e evitar detecção." },
  { "slug": "survival", "name": "Sobrevivência", "attribute": "wis", "description": "Rastrear, caçar, guiar-se por terras selvagens e prever o clima." }
]
```

- [x] **Step 3: Create conditions.json**

Create `data/conditions.json`:

```json
[
  { "slug": "blinded", "name": "Cego", "description": "Falha automaticamente em qualquer teste de habilidade que exija visão. Ataques contra a criatura têm vantagem, e ataques da criatura têm desvantagem." },
  { "slug": "charmed", "name": "Enfeitiçado", "description": "Não pode atacar quem o enfeitiçou nem alvo-lo com habilidades ou efeitos mágicos nocivos. O encantador tem vantagem em testes de interação social." },
  { "slug": "deafened", "name": "Surdo", "description": "Falha automaticamente em qualquer teste de habilidade que exija audição." },
  { "slug": "frightened", "name": "Amedrontado", "description": "Desvantagem em testes de habilidade e ataques enquanto a fonte do medo estiver em linha de visão. Não pode se mover voluntariamente para mais perto da fonte." },
  { "slug": "grappled", "name": "Agarrado", "description": "Deslocamento se torna 0 e não pode se beneficiar de bônus de deslocamento. Termina se o agarrador ficar incapacitado ou for afastado." },
  { "slug": "incapacitated", "name": "Incapacitado", "description": "Não pode realizar ações ou reações." },
  { "slug": "invisible", "name": "Invisível", "description": "Impossível de ser visto sem magia ou sentido especial. Considerado em obscurecimento total. Ataques da criatura têm vantagem, ataques contra ela têm desvantagem." },
  { "slug": "paralyzed", "name": "Paralisado", "description": "Incapacitado e não pode se mover ou falar. Falha automaticamente em Saving Throws de STR e DEX. Ataques contra têm vantagem. Acerto corpo-a-corpo dentro de 1,5m é crítico automático." },
  { "slug": "petrified", "name": "Petrificado", "description": "Transformado em substância sólida inanimada. Peso multiplicado por 10. Não envelhece. Incapacitado, não pode se mover ou falar. Resistência a todos os danos." },
  { "slug": "poisoned", "name": "Envenenado", "description": "Desvantagem em jogadas de ataque e testes de habilidade." },
  { "slug": "prone", "name": "Prostrado", "description": "Só pode rastejar. Desvantagem em ataques. Ataques dentro de 1,5m têm vantagem, ataques à distância têm desvantagem. Levantar custa metade do deslocamento." },
  { "slug": "stunned", "name": "Atordoado", "description": "Incapacitado, não pode se mover e fala com dificuldade. Falha automaticamente em Saving Throws de STR e DEX. Ataques contra têm vantagem." }
]
```

- [x] **Step 4: Create classes.json**

Create `data/classes.json` with all 12 SRD classes. Each includes hitDie, primaryAbility, savingThrows, proficiencies, spellcasting flag, features array, and spellSlots table. Example structure for the first 3 classes (implement all 12):

```json
[
  {
    "slug": "barbarian",
    "name": "Bárbaro",
    "hitDie": 12,
    "primaryAbility": ["str"],
    "savingThrows": ["str", "con"],
    "armorProficiencies": ["Armaduras leves", "Armaduras médias", "Escudos"],
    "weaponProficiencies": ["Armas simples", "Armas marciais"],
    "skillChoices": { "count": 2, "options": ["animalHandling", "athletics", "intimidation", "nature", "perception", "survival"] },
    "spellcasting": false,
    "spellcastingAbility": null,
    "features": [
      { "level": 1, "name": "Fúria", "description": "Em combate, bônus de dano e resistência a dano contundente, cortante e perfurante. Usos: 2 (nv1), 3 (nv3), 4 (nv6), 5 (nv12), 6 (nv17), ilimitado (nv20)." },
      { "level": 1, "name": "Defesa sem Armadura", "description": "AC = 10 + mod DEX + mod CON quando não usa armadura." },
      { "level": 2, "name": "Ataque Imprudente", "description": "Vantagem em ataques corpo-a-corpo com STR neste turno, mas ataques contra você têm vantagem até seu próximo turno." },
      { "level": 2, "name": "Sentido de Perigo", "description": "Vantagem em Saving Throws de DEX contra efeitos que você pode ver." },
      { "level": 3, "name": "Caminho Primitivo", "description": "Escolha uma subclasse: Caminho do Berserker ou Caminho do Guerreiro Totêmico." },
      { "level": 5, "name": "Ataque Extra", "description": "Ataque duas vezes ao usar a ação Atacar." },
      { "level": 5, "name": "Movimento Rápido", "description": "+10ft de deslocamento quando não usa armadura pesada." },
      { "level": 7, "name": "Instinto Selvagem", "description": "Vantagem em iniciativa. Pode agir normalmente no primeiro turno mesmo se surpreendido (se entrar em Fúria)." },
      { "level": 9, "name": "Crítico Brutal", "description": "1 dado adicional de dano em acertos críticos corpo-a-corpo. Aumenta para 2 dados (nv13) e 3 dados (nv17)." },
      { "level": 11, "name": "Fúria Implacável", "description": "Se cair a 0 HP em Fúria, pode fazer um Saving Throw de CON CD 10 para ficar com 1 HP (CD aumenta +5 a cada uso)." },
      { "level": 15, "name": "Fúria Persistente", "description": "Fúria só termina prematuramente se ficar inconsciente ou escolher terminá-la." },
      { "level": 18, "name": "Poder Indomável", "description": "Se o total de um teste de STR for menor que seu valor de STR, use o valor de STR." },
      { "level": 20, "name": "Campeão Primitivo", "description": "STR e CON aumentam em 4 (máximo 24)." }
    ],
    "spellSlots": {}
  },
  {
    "slug": "bard",
    "name": "Bardo",
    "hitDie": 8,
    "primaryAbility": ["cha"],
    "savingThrows": ["dex", "cha"],
    "armorProficiencies": ["Armaduras leves"],
    "weaponProficiencies": ["Armas simples", "Bestas de mão", "Espadas longas", "Rapieiras", "Espadas curtas"],
    "skillChoices": { "count": 3, "options": ["acrobatics", "animalHandling", "arcana", "athletics", "deception", "history", "insight", "intimidation", "investigation", "medicine", "nature", "perception", "performance", "persuasion", "religion", "sleightOfHand", "stealth", "survival"] },
    "spellcasting": true,
    "spellcastingAbility": "cha",
    "features": [
      { "level": 1, "name": "Conjuração", "description": "Pode conjurar magias de bardo usando CHA como habilidade de conjuração." },
      { "level": 1, "name": "Inspiração Bárdica", "description": "Use uma ação bônus para dar a um aliado um dado de Inspiração (d6). Usos: mod CHA por descanso longo. O dado sobe para d8 (nv5), d10 (nv10), d12 (nv15)." },
      { "level": 2, "name": "Versatilidade", "description": "Adicione metade do bônus de proficiência a testes de habilidade nos quais não é proficiente." },
      { "level": 2, "name": "Canção de Descanso", "description": "Aliados recuperam 1d6 HP extra durante descanso curto. Sobe: d8 (nv9), d10 (nv13), d12 (nv17)." },
      { "level": 3, "name": "Colégio de Bardos", "description": "Escolha: Colégio do Conhecimento ou Colégio do Valor." },
      { "level": 5, "name": "Fonte de Inspiração", "description": "Recupera usos de Inspiração Bárdica em descanso curto." },
      { "level": 6, "name": "Contramágica", "description": "Pode usar Inspiração Bárdica para contramágica." },
      { "level": 10, "name": "Segredos Mágicos", "description": "Aprende 2 magias de qualquer classe." },
      { "level": 20, "name": "Inspiração Superior", "description": "Ao rolar iniciativa sem usos de Inspiração Bárdica, recupera 1 uso." }
    ],
    "spellSlots": {
      "1": [0,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
      "2": [0,0,0,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
      "3": [0,0,0,0,0,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
      "4": [0,0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3],
      "5": [0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,3,3,3],
      "6": [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,2,2],
      "7": [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2],
      "8": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
      "9": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1]
    }
  }
]
```

Continue with all remaining 10 classes (cleric, druid, fighter, monk, paladin, ranger, rogue, sorcerer, warlock, wizard) following the same structure. Include hit die, saving throws, proficiencies, key features per level, and spell slot progression where applicable.

- [x] **Step 5: Create rules.json**

Create `data/rules.json` with quick-reference rules:

```json
[
  {
    "slug": "combat-actions",
    "name": "Ações de Combate",
    "category": "Combate",
    "content": "**Atacar:** Faça um ataque corpo-a-corpo ou à distância.\n**Conjurar Magia:** Conjure uma magia com tempo de 1 ação.\n**Correr:** Dobre seu deslocamento neste turno.\n**Esquivar:** Ataques contra você têm desvantagem e você tem vantagem em Saving Throws de DEX.\n**Desengajar:** Seu movimento não provoca ataques de oportunidade.\n**Ajudar:** Dê vantagem a um aliado em um teste ou ataque.\n**Esconder-se:** Faça um teste de Stealth.\n**Preparar:** Prepare uma ação para usar como reação a um gatilho.\n**Usar Objeto:** Interaja com um segundo objeto ou use um objeto especial."
  },
  {
    "slug": "rest",
    "name": "Descanso",
    "category": "Descanso",
    "content": "**Descanso Curto (1+ hora):** Gaste Hit Dice para recuperar HP. Algumas habilidades recarregam.\n**Descanso Longo (8+ horas):** Recupere todo HP e metade dos Hit Dice gastos (mínimo 1). Spell slots recarregam. Máximo 1 por 24h."
  },
  {
    "slug": "cover",
    "name": "Cobertura",
    "category": "Combate",
    "content": "**Meia Cobertura:** +2 AC e Saving Throws de DEX.\n**Três-quartos de Cobertura:** +5 AC e Saving Throws de DEX.\n**Cobertura Total:** Não pode ser alvo direto de ataque ou magia."
  },
  {
    "slug": "conditions-summary",
    "name": "Resumo de Condições",
    "category": "Combate",
    "content": "Condições alteram as capacidades de uma criatura. Consulte o compêndio de condições para detalhes completos de cada uma das 12 condições do jogo."
  },
  {
    "slug": "travel",
    "name": "Viagem",
    "category": "Exploração",
    "content": "**Ritmo Normal:** 24 milhas/dia, 8 horas de viagem.\n**Ritmo Rápido:** 30 milhas/dia, -5 em Perception passiva.\n**Ritmo Lento:** 18 milhas/dia, pode usar Stealth.\n**Marcha Forçada:** Após 8h, CON save CD 10 (+1 por hora) ou ganhe 1 nível de Exhaustion."
  },
  {
    "slug": "difficulty-class",
    "name": "Classes de Dificuldade",
    "category": "Regras Gerais",
    "content": "**CD 5:** Muito Fácil\n**CD 10:** Fácil\n**CD 15:** Médio\n**CD 20:** Difícil\n**CD 25:** Muito Difícil\n**CD 30:** Quase Impossível"
  }
]
```

- [x] **Step 6: Commit**

```bash
git add data/
git commit -m "feat: add SRD static data files

9 races, 12 classes with progression, 18 skills, 12 conditions,
and quick reference rules — all in PT-BR with D&D terms in English."
```

---

### Task 4: Core Calculation Library (TDD)

**Files:**
- Create: `lib/dnd5e.ts`, `lib/__tests__/dnd5e.test.ts`

- [x] **Step 1: Install testing dependencies**

```bash
npm install -D jest @types/jest ts-jest @jest/globals
```

Create `jest.config.ts`:

```ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default config;
```

Add to `package.json` scripts: `"test": "jest"`

- [x] **Step 2: Write failing tests for all calculation functions**

Create `lib/__tests__/dnd5e.test.ts`:

```ts
import {
  getModifier,
  getProficiencyBonus,
  getSkillValue,
  getCarryCapacity,
  getXpForNextLevel,
  getEncounterDifficulty,
  getXpMultiplier,
  getPointBuyCost,
  getStandardArray,
} from "@/lib/dnd5e";

describe("getModifier", () => {
  it("returns -5 for score 1", () => {
    expect(getModifier(1)).toBe(-5);
  });

  it("returns -1 for score 8", () => {
    expect(getModifier(8)).toBe(-1);
  });

  it("returns 0 for score 10", () => {
    expect(getModifier(10)).toBe(0);
  });

  it("returns 0 for score 11", () => {
    expect(getModifier(11)).toBe(0);
  });

  it("returns +2 for score 14", () => {
    expect(getModifier(14)).toBe(2);
  });

  it("returns +5 for score 20", () => {
    expect(getModifier(20)).toBe(5);
  });

  it("returns +10 for score 30", () => {
    expect(getModifier(30)).toBe(10);
  });
});

describe("getProficiencyBonus", () => {
  it("returns +2 for levels 1-4", () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(4)).toBe(2);
  });

  it("returns +3 for levels 5-8", () => {
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(8)).toBe(3);
  });

  it("returns +4 for levels 9-12", () => {
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(12)).toBe(4);
  });

  it("returns +5 for levels 13-16", () => {
    expect(getProficiencyBonus(13)).toBe(5);
    expect(getProficiencyBonus(16)).toBe(5);
  });

  it("returns +6 for levels 17-20", () => {
    expect(getProficiencyBonus(17)).toBe(6);
    expect(getProficiencyBonus(20)).toBe(6);
  });
});

describe("getSkillValue", () => {
  it("returns just modifier when not proficient", () => {
    expect(getSkillValue(14, 5, "none")).toBe(2);
  });

  it("adds proficiency bonus when proficient", () => {
    expect(getSkillValue(14, 5, "proficient")).toBe(5);
  });

  it("doubles proficiency bonus for expertise", () => {
    expect(getSkillValue(14, 5, "expertise")).toBe(8);
  });
});

describe("getCarryCapacity", () => {
  it("calculates carry capacity as STR * 7.5", () => {
    expect(getCarryCapacity(10)).toBe(75);
    expect(getCarryCapacity(15)).toBe(112.5);
    expect(getCarryCapacity(20)).toBe(150);
  });
});

describe("getXpForNextLevel", () => {
  it("returns 300 XP for level 1 -> 2", () => {
    expect(getXpForNextLevel(1)).toBe(300);
  });

  it("returns 900 XP for level 2 -> 3", () => {
    expect(getXpForNextLevel(2)).toBe(900);
  });

  it("returns 355000 XP for level 19 -> 20", () => {
    expect(getXpForNextLevel(19)).toBe(355000);
  });

  it("returns null for level 20 (max)", () => {
    expect(getXpForNextLevel(20)).toBeNull();
  });
});

describe("getXpMultiplier", () => {
  it("returns 1 for a single monster", () => {
    expect(getXpMultiplier(1)).toBe(1);
  });

  it("returns 1.5 for 2 monsters", () => {
    expect(getXpMultiplier(2)).toBe(1.5);
  });

  it("returns 2 for 3-6 monsters", () => {
    expect(getXpMultiplier(3)).toBe(2);
    expect(getXpMultiplier(6)).toBe(2);
  });

  it("returns 2.5 for 7-10 monsters", () => {
    expect(getXpMultiplier(7)).toBe(2.5);
    expect(getXpMultiplier(10)).toBe(2.5);
  });

  it("returns 3 for 11-14 monsters", () => {
    expect(getXpMultiplier(11)).toBe(3);
  });

  it("returns 4 for 15+ monsters", () => {
    expect(getXpMultiplier(15)).toBe(4);
  });
});

describe("getEncounterDifficulty", () => {
  it("returns easy for low XP", () => {
    expect(getEncounterDifficulty(1, 4, 50)).toBe("easy");
  });

  it("returns medium for moderate XP", () => {
    expect(getEncounterDifficulty(1, 4, 200)).toBe("medium");
  });

  it("returns hard for high XP", () => {
    expect(getEncounterDifficulty(1, 4, 340)).toBe("hard");
  });

  it("returns deadly for very high XP", () => {
    expect(getEncounterDifficulty(1, 4, 500)).toBe("deadly");
  });
});

describe("getPointBuyCost", () => {
  it("returns 0 for score 8", () => {
    expect(getPointBuyCost(8)).toBe(0);
  });

  it("returns 5 for score 13", () => {
    expect(getPointBuyCost(13)).toBe(5);
  });

  it("returns 7 for score 14", () => {
    expect(getPointBuyCost(14)).toBe(7);
  });

  it("returns 9 for score 15", () => {
    expect(getPointBuyCost(15)).toBe(9);
  });
});

describe("getStandardArray", () => {
  it("returns [15, 14, 13, 12, 10, 8]", () => {
    expect(getStandardArray()).toEqual([15, 14, 13, 12, 10, 8]);
  });
});
```

- [x] **Step 3: Run tests to verify they fail**

```bash
npm test -- --verbose
```

Expected: All tests FAIL (functions not defined).

- [x] **Step 4: Implement all calculation functions**

Create `lib/dnd5e.ts`:

```ts
// XP thresholds per character level (index 0 = level 1)
// Each entry: [easy, medium, hard, deadly]
const XP_THRESHOLDS: [number, number, number, number][] = [
  [25, 50, 75, 100],       // Level 1
  [50, 100, 150, 200],     // Level 2
  [75, 150, 225, 400],     // Level 3
  [125, 250, 375, 500],    // Level 4
  [250, 500, 750, 1100],   // Level 5
  [300, 600, 900, 1400],   // Level 6
  [350, 750, 1100, 1700],  // Level 7
  [450, 900, 1400, 2100],  // Level 8
  [550, 1100, 1600, 2400], // Level 9
  [600, 1200, 1900, 2800], // Level 10
  [800, 1600, 2400, 3600], // Level 11
  [1000, 2000, 3000, 4500],// Level 12
  [1100, 2200, 3400, 5100],// Level 13
  [1250, 2500, 3800, 5700],// Level 14
  [1400, 2800, 4300, 6400],// Level 15
  [1600, 3200, 4800, 7200],// Level 16
  [2000, 3900, 5900, 8800],// Level 17
  [2100, 4200, 6300, 9500],// Level 18
  [2400, 4900, 7300, 10900],// Level 19
  [2800, 5700, 8500, 12700],// Level 20
];

// XP required to reach each level (index 0 = level 2)
const XP_LEVELS = [
  300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000,
  100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function getSkillValue(
  attributeScore: number,
  proficiencyBonus: number,
  proficiency: "none" | "proficient" | "expertise"
): number {
  const mod = getModifier(attributeScore);
  if (proficiency === "expertise") return mod + proficiencyBonus * 2;
  if (proficiency === "proficient") return mod + proficiencyBonus;
  return mod;
}

export function getCarryCapacity(strength: number): number {
  return strength * 7.5;
}

export function getXpForNextLevel(currentLevel: number): number | null {
  if (currentLevel >= 20) return null;
  return XP_LEVELS[currentLevel - 1];
}

export function getXpMultiplier(monsterCount: number): number {
  if (monsterCount <= 1) return 1;
  if (monsterCount === 2) return 1.5;
  if (monsterCount <= 6) return 2;
  if (monsterCount <= 10) return 2.5;
  if (monsterCount <= 14) return 3;
  return 4;
}

export function getEncounterDifficulty(
  partyLevel: number,
  partySize: number,
  adjustedXP: number
): "easy" | "medium" | "hard" | "deadly" {
  const thresholds = XP_THRESHOLDS[partyLevel - 1];
  const easy = thresholds[0] * partySize;
  const medium = thresholds[1] * partySize;
  const hard = thresholds[2] * partySize;
  const deadly = thresholds[3] * partySize;

  if (adjustedXP >= deadly) return "deadly";
  if (adjustedXP >= hard) return "hard";
  if (adjustedXP >= medium) return "medium";
  return "easy";
}

export function getPointBuyCost(score: number): number {
  if (score <= 8) return 0;
  if (score <= 13) return score - 8;
  if (score === 14) return 7;
  if (score === 15) return 9;
  return 9; // max 15 for point buy
}

export function getStandardArray(): number[] {
  return [15, 14, 13, 12, 10, 8];
}
```

- [x] **Step 5: Run tests to verify they pass**

```bash
npm test -- --verbose
```

Expected: All tests PASS.

- [x] **Step 6: Commit**

```bash
git add lib/dnd5e.ts lib/__tests__/dnd5e.test.ts jest.config.ts
git commit -m "feat: add D&D 5e calculation library with full test coverage

Modifier, proficiency bonus, skill values, carry capacity, XP thresholds,
encounter difficulty, point buy costs, and standard array."
```

---

### Task 5: Dice Roller Library (TDD)

**Files:**
- Create: `lib/dice.ts`, `lib/__tests__/dice.test.ts`

- [x] **Step 1: Write failing tests**

Create `lib/__tests__/dice.test.ts`:

```ts
import { rollDice, parseNotation, rollNotation, roll4d6DropLowest } from "@/lib/dice";

describe("rollDice", () => {
  it("returns correct number of dice", () => {
    const result = rollDice(4, 6);
    expect(result.rolls).toHaveLength(4);
  });

  it("all values are within range", () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDice(1, 20);
      expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(result.rolls[0]).toBeLessThanOrEqual(20);
    }
  });

  it("total equals sum of rolls", () => {
    const result = rollDice(3, 6);
    expect(result.total).toBe(result.rolls.reduce((a, b) => a + b, 0));
  });
});

describe("parseNotation", () => {
  it("parses '2d6'", () => {
    expect(parseNotation("2d6")).toEqual({ count: 2, sides: 6, modifier: 0 });
  });

  it("parses '1d20+5'", () => {
    expect(parseNotation("1d20+5")).toEqual({ count: 1, sides: 20, modifier: 5 });
  });

  it("parses '3d8-2'", () => {
    expect(parseNotation("3d8-2")).toEqual({ count: 3, sides: 8, modifier: -2 });
  });

  it("parses 'd20' as 1d20", () => {
    expect(parseNotation("d20")).toEqual({ count: 1, sides: 20, modifier: 0 });
  });
});

describe("rollNotation", () => {
  it("rolls 1d20+5 and includes modifier in total", () => {
    for (let i = 0; i < 50; i++) {
      const result = rollNotation("1d20+5");
      expect(result.total).toBeGreaterThanOrEqual(6);
      expect(result.total).toBeLessThanOrEqual(25);
      expect(result.modifier).toBe(5);
    }
  });
});

describe("roll4d6DropLowest", () => {
  it("returns a value between 3 and 18", () => {
    for (let i = 0; i < 100; i++) {
      const result = roll4d6DropLowest();
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.total).toBeLessThanOrEqual(18);
    }
  });

  it("returns 4 rolls and 3 kept", () => {
    const result = roll4d6DropLowest();
    expect(result.rolls).toHaveLength(4);
    expect(result.kept).toHaveLength(3);
  });

  it("dropped value is the minimum", () => {
    const result = roll4d6DropLowest();
    const dropped = result.rolls.find(
      (r, i) => !result.keptIndices.includes(i)
    )!;
    expect(dropped).toBe(Math.min(...result.rolls));
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/__tests__/dice.test.ts --verbose
```

Expected: FAIL.

- [x] **Step 3: Implement dice roller**

Create `lib/dice.ts`:

```ts
function secureRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

function rollSingleDie(sides: number): number {
  return Math.floor(secureRandom() * sides) + 1;
}

export interface DiceResult {
  rolls: number[];
  total: number;
  notation: string;
  modifier: number;
}

export function rollDice(count: number, sides: number): DiceResult {
  const rolls = Array.from({ length: count }, () => rollSingleDie(sides));
  const total = rolls.reduce((a, b) => a + b, 0);
  return { rolls, total, notation: `${count}d${sides}`, modifier: 0 };
}

export interface ParsedNotation {
  count: number;
  sides: number;
  modifier: number;
}

export function parseNotation(notation: string): ParsedNotation {
  const match = notation.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!match) throw new Error(`Invalid dice notation: ${notation}`);
  return {
    count: match[1] ? parseInt(match[1]) : 1,
    sides: parseInt(match[2]),
    modifier: match[3] ? parseInt(match[3]) : 0,
  };
}

export function rollNotation(notation: string): DiceResult {
  const parsed = parseNotation(notation);
  const result = rollDice(parsed.count, parsed.sides);
  return {
    ...result,
    total: result.total + parsed.modifier,
    modifier: parsed.modifier,
    notation,
  };
}

export interface Drop4d6Result {
  rolls: number[];
  kept: number[];
  keptIndices: number[];
  total: number;
}

export function roll4d6DropLowest(): Drop4d6Result {
  const rolls = Array.from({ length: 4 }, () => rollSingleDie(6));
  const minVal = Math.min(...rolls);
  const minIndex = rolls.indexOf(minVal);
  const keptIndices = [0, 1, 2, 3].filter((i) => i !== minIndex);
  const kept = keptIndices.map((i) => rolls[i]);
  return {
    rolls,
    kept,
    keptIndices,
    total: kept.reduce((a, b) => a + b, 0),
  };
}
```

- [x] **Step 4: Run tests to verify they pass**

```bash
npm test -- lib/__tests__/dice.test.ts --verbose
```

Expected: All PASS.

- [x] **Step 5: Commit**

```bash
git add lib/dice.ts lib/__tests__/dice.test.ts
git commit -m "feat: add dice roller library with notation parsing

rollDice, rollNotation (NdM+B), roll4d6DropLowest for attribute generation.
Uses crypto.getRandomValues for secure randomness."
```

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

### Task 11: Character Sheet Components

**Files:**
- Create all files in `components/character/`

- [x] **Step 1: Create StatBox component**

Create `components/character/StatBox.tsx`:

```tsx
"use client";

import { getModifier } from "@/lib/dnd5e";
import { formatModifier } from "@/lib/utils";
import type { Attribute } from "@/types/dnd5e";

const ATTR_LABELS: Record<Attribute, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

interface StatBoxProps {
  attribute: Attribute;
  value: number;
  onChange: (value: number) => void;
}

export function StatBox({ attribute, value, onChange }: StatBoxProps) {
  const mod = getModifier(value);

  return (
    <div className="flex flex-col items-center bg-ink-light border border-gold/30 rounded-lg p-3 min-w-[80px]">
      <span className="font-cinzel text-xs text-gold/70 tracking-wider">{ATTR_LABELS[attribute]}</span>
      <span className="font-cinzel text-2xl text-parchment-light font-bold">{formatModifier(mod)}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
        className="w-12 text-center bg-parchment/10 border border-gold/20 rounded text-sm text-parchment-light mt-1 py-0.5 focus:outline-none focus:border-gold"
      />
    </div>
  );
}
```

- [x] **Step 2: Create SkillRow component**

Create `components/character/SkillRow.tsx`:

```tsx
"use client";

import { getModifier, getProficiencyBonus, getSkillValue } from "@/lib/dnd5e";
import { formatModifier } from "@/lib/utils";
import type { Skill, Attribute } from "@/types/dnd5e";
import { SKILL_ATTRIBUTE_MAP } from "@/types/dnd5e";

interface SkillRowProps {
  skill: Skill;
  skillName: string;
  attributeScore: number;
  level: number;
  proficiency: "none" | "proficient" | "expertise";
  onToggle: () => void;
}

const CYCLE: ("none" | "proficient" | "expertise")[] = ["none", "proficient", "expertise"];

const ATTR_SHORT: Record<Attribute, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

export function SkillRow({ skill, skillName, attributeScore, level, proficiency, onToggle }: SkillRowProps) {
  const attr = SKILL_ATTRIBUTE_MAP[skill];
  const profBonus = getProficiencyBonus(level);
  const value = getSkillValue(attributeScore, profBonus, proficiency);

  return (
    <div className="flex items-center gap-2 py-1 text-sm">
      <button
        onClick={onToggle}
        className="w-4 h-4 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0"
        title={`Proficiência: ${proficiency}`}
      >
        {proficiency === "proficient" && <div className="w-2 h-2 rounded-full bg-gold" />}
        {proficiency === "expertise" && <div className="w-3 h-3 rounded-full bg-gold" />}
      </button>
      <span className="font-cinzel text-gold/50 text-xs w-8">{ATTR_SHORT[attr]}</span>
      <span className="flex-1 text-parchment-light/80">{skillName}</span>
      <span className="font-cinzel text-parchment-light w-8 text-right">{formatModifier(value)}</span>
    </div>
  );
}
```

- [x] **Step 3: Create HpTracker component**

Create `components/character/HpTracker.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Heart, Shield, Plus, Minus } from "lucide-react";

interface HpTrackerProps {
  hp: { max: number; current: number; temporary: number };
  ac: number;
  onChange: (hp: { max: number; current: number; temporary: number }) => void;
  onAcChange: (ac: number) => void;
}

export function HpTracker({ hp, ac, onChange, onAcChange }: HpTrackerProps) {
  const [quickValue, setQuickValue] = useState(1);
  const pct = hp.max > 0 ? (hp.current / hp.max) * 100 : 0;
  const barColor = pct > 50 ? "bg-green-600" : pct > 25 ? "bg-yellow-600" : "bg-blood";

  const applyDamage = () => {
    let remaining = quickValue;
    let temp = hp.temporary;
    let current = hp.current;

    if (temp > 0) {
      const absorbedByTemp = Math.min(temp, remaining);
      temp -= absorbedByTemp;
      remaining -= absorbedByTemp;
    }
    current = Math.max(0, current - remaining);
    onChange({ ...hp, current, temporary: temp });
  };

  const applyHeal = () => {
    const current = Math.min(hp.max, hp.current + quickValue);
    onChange({ ...hp, current });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* HP */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} className="text-blood" />
            <span className="font-cinzel text-sm text-gold/70">Hit Points</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={hp.current}
              onChange={(e) => onChange({ ...hp, current: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light focus:outline-none focus:border-gold"
            />
            <span className="text-gold/50">/</span>
            <input
              type="number"
              value={hp.max}
              onChange={(e) => onChange({ ...hp, max: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light focus:outline-none focus:border-gold"
            />
          </div>
          {/* HP bar */}
          <div className="h-2 bg-ink rounded-full mt-2 overflow-hidden">
            <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* AC */}
        <div className="text-center">
          <div className="flex items-center gap-1 mb-1">
            <Shield size={16} className="text-gold" />
            <span className="font-cinzel text-sm text-gold/70">AC</span>
          </div>
          <input
            type="number"
            value={ac}
            onChange={(e) => onAcChange(parseInt(e.target.value) || 10)}
            className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light text-xl font-cinzel focus:outline-none focus:border-gold"
          />
        </div>

        {/* Temp HP */}
        <div className="text-center">
          <span className="font-cinzel text-sm text-gold/70 block mb-1">Temp HP</span>
          <input
            type="number"
            value={hp.temporary}
            onChange={(e) => onChange({ ...hp, temporary: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Quick damage/heal */}
      <div className="flex items-center gap-2">
        <button onClick={applyDamage} className="flex items-center gap-1 px-2 py-1 bg-blood/20 border border-blood/40 rounded text-sm text-red-300 hover:bg-blood/30 transition-colors">
          <Minus size={14} /> Dano
        </button>
        <input
          type="number"
          value={quickValue}
          onChange={(e) => setQuickValue(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light text-sm focus:outline-none focus:border-gold"
        />
        <button onClick={applyHeal} className="flex items-center gap-1 px-2 py-1 bg-green-900/20 border border-green-700/40 rounded text-sm text-green-300 hover:bg-green-900/30 transition-colors">
          <Plus size={14} /> Cura
        </button>
      </div>
    </div>
  );
}
```

- [x] **Step 4: Create SpellSlotTracker component**

Create `components/character/SpellSlotTracker.tsx`:

```tsx
"use client";

interface SpellSlotTrackerProps {
  level: number;
  max: number;
  used: number;
  onChange: (used: number) => void;
}

export function SpellSlotTracker({ level, max, used, onChange }: SpellSlotTrackerProps) {
  if (max === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="font-cinzel text-xs text-gold/60 w-8">Nv {level}</span>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i < used ? i : i + 1)}
            className={`w-5 h-5 rounded-full border transition-colors ${
              i < used
                ? "bg-gold/20 border-gold/30"
                : "bg-gold border-gold"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-parchment-light/50">{max - used}/{max}</span>
    </div>
  );
}
```

- [x] **Step 5: Create ConditionBadge, DeathSaves, AttackRow, InventoryRow**

Create `components/character/ConditionBadge.tsx`:

```tsx
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
  return (
    <Badge
      label={CONDITION_LABELS[condition]}
      active={active}
      onClick={onToggle}
      color="blood"
    />
  );
}
```

Create `components/character/DeathSaves.tsx`:

```tsx
"use client";

import { Skull } from "lucide-react";

interface DeathSavesProps {
  successes: number;
  failures: number;
  onChange: (saves: { successes: number; failures: number }) => void;
}

export function DeathSaves({ successes, failures, onChange }: DeathSavesProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-400 font-cinzel">Sucesso</span>
        {[0, 1, 2].map((i) => (
          <button
            key={`s-${i}`}
            onClick={() => onChange({ successes: i < successes ? i : i + 1, failures })}
            className={`w-4 h-4 rounded-full border transition-colors ${
              i < successes ? "bg-green-500 border-green-400" : "border-green-700/50"
            }`}
          />
        ))}
      </div>
      <Skull size={16} className="text-parchment-light/30" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400 font-cinzel">Falha</span>
        {[0, 1, 2].map((i) => (
          <button
            key={`f-${i}`}
            onClick={() => onChange({ successes, failures: i < failures ? i : i + 1 })}
            className={`w-4 h-4 rounded-full border transition-colors ${
              i < failures ? "bg-blood border-blood-light" : "border-blood/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

Create `components/character/AttackRow.tsx`:

```tsx
"use client";

import { Trash2 } from "lucide-react";
import type { Attack, DamageType, DAMAGE_TYPES } from "@/types/dnd5e";

interface AttackRowProps {
  attack: Attack;
  onChange: (attack: Attack) => void;
  onDelete: () => void;
}

export function AttackRow({ attack, onChange, onDelete }: AttackRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input
        value={attack.name}
        onChange={(e) => onChange({ ...attack, name: e.target.value })}
        placeholder="Nome"
        className="flex-1 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold"
      />
      <input
        type="number"
        value={attack.attackBonus}
        onChange={(e) => onChange({ ...attack, attackBonus: parseInt(e.target.value) || 0 })}
        placeholder="+Atq"
        className="w-16 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold"
      />
      <input
        value={attack.damage}
        onChange={(e) => onChange({ ...attack, damage: e.target.value })}
        placeholder="Dano"
        className="w-20 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold"
      />
      <button onClick={onDelete} className="text-blood/60 hover:text-blood transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
```

Create `components/character/InventoryRow.tsx`:

```tsx
"use client";

import { Trash2 } from "lucide-react";
import type { InventoryItem } from "@/types/dnd5e";

interface InventoryRowProps {
  item: InventoryItem;
  onChange: (item: InventoryItem) => void;
  onDelete: () => void;
}

export function InventoryRow({ item, onChange, onDelete }: InventoryRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
        placeholder="Item"
        className="flex-1 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold"
      />
      <input
        type="number"
        value={item.quantity}
        onChange={(e) => onChange({ ...item, quantity: Math.max(0, parseInt(e.target.value) || 0) })}
        className="w-12 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold"
      />
      <input
        type="number"
        value={item.weight}
        step={0.1}
        onChange={(e) => onChange({ ...item, weight: parseFloat(e.target.value) || 0 })}
        className="w-16 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold"
        placeholder="Peso"
      />
      <input
        type="number"
        value={item.valuePO}
        onChange={(e) => onChange({ ...item, valuePO: parseFloat(e.target.value) || 0 })}
        className="w-16 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold"
        placeholder="PO"
      />
      <button onClick={onDelete} className="text-blood/60 hover:text-blood transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
```

- [x] **Step 6: Create AttributeGeneration modal component**

Create `components/character/AttributeGeneration.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { roll4d6DropLowest } from "@/lib/dice";
import { getPointBuyCost, getStandardArray } from "@/lib/dnd5e";
import { formatModifier } from "@/lib/utils";
import { getModifier } from "@/lib/dnd5e";
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
    ATTRIBUTES.forEach((attr) => {
      newValues[attr] = roll4d6DropLowest().total;
    });
    setValues(newValues);
  };

  const applyStandard = () => {
    const arr = getStandardArray();
    const newValues = {} as Record<Attribute, number>;
    ATTRIBUTES.forEach((attr, i) => {
      newValues[attr] = arr[i];
    });
    setValues(newValues);
  };

  const totalPointBuyCost = ATTRIBUTES.reduce((sum, attr) => sum + getPointBuyCost(values[attr]), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerar Atributos" className="max-w-md">
      <div className="space-y-4">
        {/* Method selector */}
        <div className="flex gap-2">
          {([
            ["roll", "4d6 Drop Lowest"],
            ["pointBuy", "Point Buy (27)"],
            ["standard", "Standard Array"],
          ] as [Method, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => {
                setMethod(m);
                if (m === "standard") applyStandard();
              }}
              className={`flex-1 py-2 px-2 text-xs font-cinzel rounded border transition-colors ${
                method === m
                  ? "bg-gold/20 border-gold text-gold"
                  : "border-gold/20 text-parchment-light/50 hover:text-parchment-light"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {method === "roll" && (
          <Button onClick={rollAll} variant="secondary" size="sm" className="w-full">
            Rolar Todos
          </Button>
        )}

        {method === "pointBuy" && (
          <div className="text-center text-sm">
            <span className={totalPointBuyCost > 27 ? "text-blood" : "text-gold"}>
              Pontos: {totalPointBuyCost}/27
            </span>
          </div>
        )}

        {/* Attribute values */}
        <div className="space-y-2">
          {ATTRIBUTES.map((attr) => (
            <div key={attr} className="flex items-center gap-3">
              <span className="font-cinzel text-sm text-gold/70 w-24">{ATTR_LABELS[attr]}</span>
              {method === "pointBuy" ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setValues({ ...values, [attr]: Math.max(8, values[attr] - 1) })}
                    className="w-6 h-6 rounded bg-parchment/10 text-parchment-light hover:bg-parchment/20"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-parchment-light">{values[attr]}</span>
                  <button
                    onClick={() => setValues({ ...values, [attr]: Math.min(15, values[attr] + 1) })}
                    className="w-6 h-6 rounded bg-parchment/10 text-parchment-light hover:bg-parchment/20"
                  >
                    +
                  </button>
                </div>
              ) : (
                <span className="text-parchment-light text-lg">{values[attr]}</span>
              )}
              <span className="text-parchment-light/50 text-sm">({formatModifier(getModifier(values[attr]))})</span>
            </div>
          ))}
        </div>

        <Button onClick={() => { onApply(values); onClose(); }} className="w-full">
          Aplicar
        </Button>
      </div>
    </Modal>
  );
}
```

- [x] **Step 7: Commit**

```bash
git add components/character/
git commit -m "feat: add character sheet components

StatBox, SkillRow, HpTracker, SpellSlotTracker, ConditionBadge,
DeathSaves, AttackRow, InventoryRow, and AttributeGeneration modal."
```

---

### Task 12: Compendium Components

**Files:**
- Create: `components/compendium/SearchBar.tsx`, `components/compendium/FilterPanel.tsx`, `components/compendium/CompendiumCard.tsx`, `components/compendium/CategoryHub.tsx`

- [x] **Step 1: Create SearchBar**

Create `components/compendium/SearchBar.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Buscar..." }: SearchBarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/40" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-parchment/10 border border-gold/30 rounded-lg text-parchment-light placeholder:text-parchment-light/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-light/40 hover:text-parchment-light"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
```

- [x] **Step 2: Create FilterPanel**

Create `components/compendium/FilterPanel.tsx`:

```tsx
"use client";

import { Badge } from "@/components/ui/Badge";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterPanelProps {
  groups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
}

export function FilterPanel({ groups, activeFilters, onFilterChange }: FilterPanelProps) {
  const toggleFilter = (key: string, value: string) => {
    const current = activeFilters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(key, next);
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key}>
          <h4 className="font-cinzel text-xs text-gold/60 mb-2 tracking-wider">{group.label}</h4>
          <div className="flex flex-wrap gap-1">
            {group.options.map((opt) => (
              <Badge
                key={opt.value}
                label={opt.label}
                active={(activeFilters[group.key] || []).includes(opt.value)}
                onClick={() => toggleFilter(group.key, opt.value)}
                color="gold"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [x] **Step 3: Create CompendiumCard**

Create `components/compendium/CompendiumCard.tsx`:

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CompendiumCardProps {
  href: string;
  name: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function CompendiumCard({ href, name, subtitle, description, icon: Icon, className }: CompendiumCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "card-medieval p-4 hover:shadow-tome-hover transition-shadow block",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 bg-gold/10 rounded">
            <Icon size={20} className="text-gold" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-cinzel text-sm font-bold text-ink truncate">{name}</h3>
          {subtitle && <p className="text-xs text-ink/60 mt-0.5">{subtitle}</p>}
          {description && <p className="text-xs text-ink/50 mt-1 line-clamp-2">{description}</p>}
        </div>
      </div>
    </Link>
  );
}
```

- [x] **Step 4: Create CategoryHub**

Create `components/compendium/CategoryHub.tsx`:

```tsx
import Link from "next/link";
import { Users, Swords, Sparkles, Skull, Shield, AlertTriangle, BookOpen } from "lucide-react";

const CATEGORIES = [
  { slug: "races", name: "Raças", icon: Users, description: "9 raças jogáveis do SRD" },
  { slug: "classes", name: "Classes", icon: Swords, description: "12 classes com progressão completa" },
  { slug: "spells", name: "Magias", icon: Sparkles, description: "Magias de todas as classes e níveis" },
  { slug: "monsters", name: "Monstros", icon: Skull, description: "Criaturas por tipo, tamanho e CR" },
  { slug: "items", name: "Itens Mágicos", icon: Shield, description: "Itens por raridade e tipo" },
  { slug: "conditions", name: "Condições", icon: AlertTriangle, description: "12 condições de jogo" },
  { slug: "rules", name: "Regras Rápidas", icon: BookOpen, description: "Referência rápida de combate e exploração" },
];

export function CategoryHub() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/compendium/${cat.slug}`}
          className="card-medieval-dark p-5 hover:shadow-tome-hover transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gold/10 rounded group-hover:bg-gold/20 transition-colors">
              <cat.icon size={24} className="text-gold" />
            </div>
            <h3 className="font-cinzel text-gold text-lg">{cat.name}</h3>
          </div>
          <p className="text-sm text-parchment-light/50">{cat.description}</p>
        </Link>
      ))}
    </div>
  );
}
```

- [x] **Step 5: Commit**

```bash
git add components/compendium/
git commit -m "feat: add compendium components

SearchBar (debounced), FilterPanel (multi-select badges),
CompendiumCard (parchment style), and CategoryHub (7 categories)."
```

---

### Task 13: Master Area Components

**Files:**
- Create: `components/master/PinGuard.tsx`, `components/master/CampaignCard.tsx`, `components/master/NpcCard.tsx`, `components/master/EncounterTracker.tsx`, `components/master/EncounterPlanner.tsx`, `components/master/RichTextEditor.tsx`

- [x] **Step 1: Create PinGuard**

Create `components/master/PinGuard.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useCampaignStore } from "@/store/campaignStore";
import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";

export function PinGuard({ children }: { children: React.ReactNode }) {
  const { pinHash, isPinSet, setPin, verifyPin, isHydrated } = useCampaignStore();
  const [input, setInput] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isHydrated && !isPinSet()) setIsCreating(true);
  }, [isHydrated, isPinSet]);

  if (!isHydrated) {
    return <div className="flex items-center justify-center h-64 text-parchment-light/50">Carregando...</div>;
  }

  if (confirmed) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length < 4) {
      setError("PIN deve ter pelo menos 4 dígitos");
      return;
    }

    if (isCreating) {
      await setPin(input);
      setConfirmed(true);
    } else {
      const valid = await verifyPin(input);
      if (valid) {
        setConfirmed(true);
      } else {
        setError("PIN incorreto");
        setInput("");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <Lock size={48} className="text-gold/60" />
      <h2 className="font-cinzel text-2xl text-gold">
        {isCreating ? "Criar PIN do Mestre" : "Área do Mestre"}
      </h2>
      <p className="text-parchment-light/50 text-center max-w-sm">
        {isCreating
          ? "Crie um PIN de 4-6 dígitos para proteger sua área de mestre."
          : "Digite seu PIN para acessar o dashboard."}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
          placeholder="PIN"
          className="w-40 text-center text-2xl tracking-[0.5em] bg-parchment/10 border border-gold/30 rounded py-2 text-parchment-light focus:outline-none focus:border-gold"
          autoFocus
        />
        {error && <p className="text-blood text-sm">{error}</p>}
        <Button type="submit">{isCreating ? "Criar PIN" : "Entrar"}</Button>
      </form>
    </div>
  );
}
```

- [x] **Step 2: Create CampaignCard and NpcCard**

Create `components/master/CampaignCard.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Users, ScrollText } from "lucide-react";
import type { Campaign } from "@/types/dnd5e";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link href={`/master/campaign/${campaign.id}`}>
      <Card className="p-4 hover:shadow-tome-hover transition-shadow cursor-pointer">
        <h3 className="font-cinzel text-gold text-lg mb-1">{campaign.name}</h3>
        {campaign.world && <p className="text-xs text-parchment-light/40 mb-2">{campaign.world}</p>}
        <p className="text-sm text-parchment-light/60 line-clamp-2 mb-3">{campaign.description}</p>
        <div className="flex items-center gap-4 text-xs text-parchment-light/40">
          <span className="flex items-center gap-1"><Users size={12} /> {campaign.playerCharacterIds.length} PJs</span>
          <span className="flex items-center gap-1"><ScrollText size={12} /> {campaign.sessions.length} sessões</span>
        </div>
      </Card>
    </Link>
  );
}
```

Create `components/master/NpcCard.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { NPC } from "@/types/dnd5e";

const ROLE_COLORS: Record<NPC["role"], "green" | "gold" | "blood" | "purple"> = {
  ally: "green",
  neutral: "gold",
  antagonist: "blood",
  unknown: "purple",
};

const ROLE_LABELS: Record<NPC["role"], string> = {
  ally: "Aliado",
  neutral: "Neutro",
  antagonist: "Antagonista",
  unknown: "Desconhecido",
};

interface NpcCardProps {
  npc: NPC;
  onClick?: () => void;
}

export function NpcCard({ npc, onClick }: NpcCardProps) {
  const initials = npc.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Card className="p-3 cursor-pointer hover:shadow-tome-hover transition-shadow" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center font-cinzel text-sm text-gold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-cinzel text-sm text-parchment-light truncate">{npc.name}</h4>
          <p className="text-xs text-parchment-light/40">{npc.race} — {npc.profession}</p>
        </div>
        <Badge label={ROLE_LABELS[npc.role]} color={ROLE_COLORS[npc.role]} />
      </div>
    </Card>
  );
}
```

- [x] **Step 3: Create EncounterPlanner**

Create `components/master/EncounterPlanner.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getXpMultiplier, getEncounterDifficulty } from "@/lib/dnd5e";
import { generateId } from "@/lib/utils";
import type { EncounterMonster } from "@/types/dnd5e";
import { Plus, Trash2 } from "lucide-react";

interface EncounterPlannerProps {
  partyLevel: number;
  partySize: number;
  onPartyChange: (level: number, size: number) => void;
  monsters: EncounterMonster[];
  onMonstersChange: (monsters: EncounterMonster[]) => void;
}

const DIFFICULTY_COLORS: Record<string, "green" | "gold" | "blood" | "purple"> = {
  easy: "green",
  medium: "gold",
  hard: "blood",
  deadly: "purple",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  deadly: "Mortal",
};

export function EncounterPlanner({ partyLevel, partySize, onPartyChange, monsters, onMonstersChange }: EncounterPlannerProps) {
  const [newName, setNewName] = useState("");
  const [newHp, setNewHp] = useState(10);
  const [newAc, setNewAc] = useState(10);
  const [newXp, setNewXp] = useState(25);

  const totalXP = monsters.reduce((sum, m) => sum + m.xp, 0);
  const multiplier = getXpMultiplier(monsters.length);
  const adjustedXP = Math.floor(totalXP * multiplier);
  const difficulty = monsters.length > 0 ? getEncounterDifficulty(partyLevel, partySize, adjustedXP) : null;

  const addMonster = () => {
    if (!newName) return;
    onMonstersChange([
      ...monsters,
      { id: generateId(), name: newName, hp: newHp, maxHp: newHp, ac: newAc, initiative: 0, conditions: [], xp: newXp },
    ]);
    setNewName("");
  };

  return (
    <div className="space-y-4">
      {/* Party info */}
      <div className="flex gap-4">
        <Input
          label="Nível do Grupo"
          type="number"
          value={partyLevel}
          onChange={(e) => onPartyChange(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)), partySize)}
        />
        <Input
          label="Tamanho do Grupo"
          type="number"
          value={partySize}
          onChange={(e) => onPartyChange(partyLevel, Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>

      {/* Difficulty display */}
      {difficulty && (
        <div className="flex items-center gap-3 p-3 bg-ink border border-gold/20 rounded">
          <Badge label={DIFFICULTY_LABELS[difficulty]} color={DIFFICULTY_COLORS[difficulty]} active />
          <span className="text-sm text-parchment-light/60">
            XP Total: {totalXP} | Ajustado: {adjustedXP} (x{multiplier})
          </span>
        </div>
      )}

      {/* Monster list */}
      <div className="space-y-1">
        {monsters.map((m, i) => (
          <div key={m.id} className="flex items-center gap-2 py-1 text-sm">
            <span className="flex-1 text-parchment-light">{m.name}</span>
            <span className="text-parchment-light/50">HP:{m.maxHp} AC:{m.ac} XP:{m.xp}</span>
            <button onClick={() => onMonstersChange(monsters.filter((_, j) => j !== i))} className="text-blood/60 hover:text-blood">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add monster */}
      <div className="flex gap-2 items-end">
        <Input label="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Input label="HP" type="number" value={newHp} onChange={(e) => setNewHp(parseInt(e.target.value) || 1)} className="w-20" />
        <Input label="AC" type="number" value={newAc} onChange={(e) => setNewAc(parseInt(e.target.value) || 10)} className="w-20" />
        <Input label="XP" type="number" value={newXp} onChange={(e) => setNewXp(parseInt(e.target.value) || 0)} className="w-20" />
        <Button onClick={addMonster} size="sm"><Plus size={14} /></Button>
      </div>
    </div>
  );
}
```

- [x] **Step 4: Create EncounterTracker**

Create `components/master/EncounterTracker.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConditionBadge } from "@/components/character/ConditionBadge";
import { CONDITIONS } from "@/types/dnd5e";
import type { Encounter, Condition } from "@/types/dnd5e";
import { ChevronRight, Swords, SkipForward } from "lucide-react";
import { rollNotation } from "@/lib/dice";

interface TrackerEntry {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  conditions: Condition[];
  isPlayer: boolean;
}

interface EncounterTrackerProps {
  encounter: Encounter;
  onUpdate: (updates: Partial<Encounter>) => void;
}

export function EncounterTracker({ encounter, onUpdate }: EncounterTrackerProps) {
  const [damageInput, setDamageInput] = useState<Record<string, string>>({});

  // Build combined initiative list
  const entries: TrackerEntry[] = [
    ...encounter.monsters.map((m) => ({
      id: m.id, name: m.name, initiative: m.initiative,
      hp: m.hp, maxHp: m.maxHp, ac: m.ac, conditions: m.conditions, isPlayer: false,
    })),
    ...encounter.playerCharacters.map((pc, i) => ({
      id: `pc-${i}`, name: pc.name, initiative: pc.initiative,
      hp: 0, maxHp: 0, ac: pc.ac, conditions: [] as Condition[], isPlayer: true,
    })),
  ].sort((a, b) => b.initiative - a.initiative);

  const currentEntry = entries[encounter.currentTurnIndex % entries.length];

  const rollAllInitiatives = () => {
    const updatedMonsters = encounter.monsters.map((m) => ({
      ...m, initiative: rollNotation("1d20").total,
    }));
    const updatedPCs = encounter.playerCharacters.map((pc) => ({
      ...pc, initiative: rollNotation("1d20").total,
    }));
    onUpdate({ monsters: updatedMonsters, playerCharacters: updatedPCs, status: "active", currentTurnIndex: 0 });
  };

  const nextTurn = () => {
    onUpdate({ currentTurnIndex: (encounter.currentTurnIndex + 1) % entries.length });
  };

  const applyDamage = (monsterId: string) => {
    const amount = parseInt(damageInput[monsterId] || "0");
    if (!amount) return;
    const updatedMonsters = encounter.monsters.map((m) =>
      m.id === monsterId ? { ...m, hp: Math.max(0, m.hp - amount) } : m
    );
    onUpdate({ monsters: updatedMonsters });
    setDamageInput({ ...damageInput, [monsterId]: "" });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2">
        <Button onClick={rollAllInitiatives} variant="secondary" size="sm">
          <Swords size={14} className="mr-1" /> Rolar Iniciativas
        </Button>
        {encounter.status === "active" && (
          <Button onClick={nextTurn} size="sm">
            <SkipForward size={14} className="mr-1" /> Próximo Turno
          </Button>
        )}
      </div>

      {/* Initiative list */}
      <div className="space-y-1">
        {entries.map((entry) => {
          const isCurrent = currentEntry?.id === entry.id && encounter.status === "active";
          const hpPct = entry.maxHp > 0 ? (entry.hp / entry.maxHp) * 100 : 100;

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-2 rounded transition-colors ${
                isCurrent ? "bg-gold/10 border border-gold/30" : "border border-transparent"
              }`}
            >
              {isCurrent && <ChevronRight size={16} className="text-gold flex-shrink-0" />}
              <span className="font-cinzel text-sm w-8 text-center text-gold/60">{entry.initiative}</span>
              <span className={`flex-1 text-sm ${entry.isPlayer ? "text-blue-300" : "text-parchment-light"}`}>
                {entry.name}
              </span>
              <span className="text-xs text-parchment-light/40">AC {entry.ac}</span>

              {!entry.isPlayer && (
                <>
                  {/* HP bar */}
                  <div className="w-24">
                    <div className="h-2 bg-ink rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${hpPct > 50 ? "bg-green-600" : hpPct > 25 ? "bg-yellow-600" : "bg-blood"}`}
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-parchment-light/40">{entry.hp}/{entry.maxHp}</span>
                  </div>

                  {/* Quick damage */}
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={damageInput[entry.id] || ""}
                      onChange={(e) => setDamageInput({ ...damageInput, [entry.id]: e.target.value })}
                      placeholder="Dano"
                      className="w-14 bg-parchment/10 border border-gold/20 rounded px-1 py-0.5 text-xs text-parchment-light text-center focus:outline-none focus:border-gold"
                    />
                    <button
                      onClick={() => applyDamage(entry.id)}
                      className="text-xs text-blood hover:text-blood-light"
                    >
                      Hit
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [x] **Step 5: Create RichTextEditor (TipTap wrapper)**

Create `components/master/RichTextEditor.tsx`:

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Escreva suas notas..." }: RichTextEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(editor.getHTML());
      }, 3000);
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none p-4 min-h-[200px] focus:outline-none",
      },
    },
  });

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  if (!editor) return null;

  const ToolButton = ({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded transition-colors",
        active ? "bg-gold/20 text-gold" : "text-parchment-light/40 hover:text-parchment-light"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gold/20 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-gold/10 bg-ink">
        <ToolButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolButton>
      </div>
      <EditorContent editor={editor} className="bg-ink-light" />
    </div>
  );
}
```

- [x] **Step 6: Commit**

```bash
git add components/master/
git commit -m "feat: add DM dashboard components

PinGuard (SHA-256 auth), CampaignCard, NpcCard (avatar initials),
EncounterPlanner (XP budget + difficulty), EncounterTracker (initiative),
and RichTextEditor (TipTap with auto-save)."
```

---

### Task 14: Character Pages

**Files:**
- Create: `app/character/page.tsx`, `app/character/[id]/page.tsx`

- [x] **Step 1: Create character list page**

Create `app/character/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCharacterStore } from "@/store/characterStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Plus, Trash2 } from "lucide-react";

export default function CharacterListPage() {
  const router = useRouter();
  const { characters, createCharacter, deleteCharacter, isHydrated } = useCharacterStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (!isHydrated) {
    return <div className="text-center py-20 text-parchment-light/50">Carregando personagens...</div>;
  }

  const handleCreate = () => {
    const char = createCharacter({});
    router.push(`/character/${char.id}`);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteCharacter(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Personagens" />
        <Button onClick={handleCreate} size="sm">
          <Plus size={16} className="mr-1" /> Novo Personagem
        </Button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-parchment-light/50 mb-4">Nenhum personagem criado ainda.</p>
          <Button onClick={handleCreate}>Criar Primeiro Personagem</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <Card
              key={char.id}
              className="p-4 cursor-pointer hover:shadow-tome-hover transition-shadow relative group"
              onClick={() => router.push(`/character/${char.id}`)}
            >
              <h3 className="font-cinzel text-gold text-lg">{char.name}</h3>
              <p className="text-sm text-parchment-light/60">
                {char.race} {char.class} — Nível {char.level}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(char.id); }}
                className="absolute top-3 right-3 text-blood/0 group-hover:text-blood/60 hover:text-blood transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar Exclusão">
        <p className="text-parchment-light/70 mb-4">Tem certeza que deseja excluir este personagem? Esta ação não pode ser desfeita.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
```

- [x] **Step 2: Create character sheet page**

Create `app/character/[id]/page.tsx`. This is the largest page — it renders all 10 sections as collapsible accordions using the character components. The page reads the character from the store and auto-saves on every change.

```tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useCharacterStore } from "@/store/characterStore";
import { ScrollSection } from "@/components/ui/ScrollSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatBox } from "@/components/character/StatBox";
import { SkillRow } from "@/components/character/SkillRow";
import { HpTracker } from "@/components/character/HpTracker";
import { SpellSlotTracker } from "@/components/character/SpellSlotTracker";
import { ConditionBadge } from "@/components/character/ConditionBadge";
import { DeathSaves } from "@/components/character/DeathSaves";
import { AttackRow } from "@/components/character/AttackRow";
import { InventoryRow } from "@/components/character/InventoryRow";
import { AttributeGeneration } from "@/components/character/AttributeGeneration";
import { getModifier, getProficiencyBonus, getCarryCapacity, getXpForNextLevel } from "@/lib/dnd5e";
import { formatModifier, generateId } from "@/lib/utils";
import {
  ATTRIBUTES, SKILLS, RACES, CLASSES, ALIGNMENTS, CONDITIONS,
  SKILL_ATTRIBUTE_MAP,
  type Character, type Attribute, type Skill, type Condition,
} from "@/types/dnd5e";
import skillsData from "@/data/skills.json";
import { ArrowLeft, Dices } from "lucide-react";

const RACE_OPTIONS = RACES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1).replace("-", " ") }));
const CLASS_OPTIONS = CLASSES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));
const ALIGNMENT_OPTIONS = ALIGNMENTS.map((a) => ({ value: a, label: a.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));

export default function CharacterSheetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getCharacter, updateCharacter, isHydrated } = useCharacterStore();
  const [showAttrGen, setShowAttrGen] = useState(false);

  const char = getCharacter(id);

  const update = useCallback(
    (updates: Partial<Character>) => updateCharacter(id, updates),
    [id, updateCharacter]
  );

  if (!isHydrated) {
    return <div className="text-center py-20 text-parchment-light/50">Carregando...</div>;
  }

  if (!char) {
    return (
      <div className="text-center py-20">
        <p className="text-parchment-light/50 mb-4">Personagem não encontrado.</p>
        <Button onClick={() => router.push("/character")}>Voltar à Lista</Button>
      </div>
    );
  }

  const profBonus = getProficiencyBonus(char.level);
  const xpNext = getXpForNextLevel(char.level);
  const totalWeight = char.inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const carryCapacity = getCarryCapacity(char.attributes.str);

  const cycleSkillProficiency = (skill: Skill) => {
    const current = char.skillProficiencies[skill] || "none";
    const next = current === "none" ? "proficient" : current === "proficient" ? "expertise" : "none";
    const updated = { ...char.skillProficiencies };
    if (next === "none") delete updated[skill];
    else updated[skill] = next;
    update({ skillProficiencies: updated });
  };

  const toggleSaveProficiency = (attr: Attribute) => {
    const current = char.savingThrowProficiencies;
    const updated = current.includes(attr)
      ? current.filter((a) => a !== attr)
      : [...current, attr];
    update({ savingThrowProficiencies: updated });
  };

  const toggleCondition = (condition: Condition) => {
    const current = char.conditions;
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    update({ conditions: updated });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button onClick={() => router.push("/character")} className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-2">
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* 1. Identity */}
      <ScrollSection title="Identidade">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Input label="Nome" value={char.name} onChange={(e) => update({ name: e.target.value })} className="col-span-2 md:col-span-1" />
          <Select label="Raça" options={RACE_OPTIONS} value={char.race} onChange={(e) => update({ race: e.target.value as Character["race"] })} />
          <Select label="Classe" options={CLASS_OPTIONS} value={char.class} onChange={(e) => update({ class: e.target.value as Character["class"] })} />
          <Input label="Nível" type="number" value={char.level} onChange={(e) => update({ level: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })} />
          <Input label="Background" value={char.background} onChange={(e) => update({ background: e.target.value })} />
          <Select label="Alinhamento" options={ALIGNMENT_OPTIONS} value={char.alignment} onChange={(e) => update({ alignment: e.target.value as Character["alignment"] })} />
          <Input label="XP" type="number" value={char.xp} onChange={(e) => update({ xp: Math.max(0, parseInt(e.target.value) || 0) })} />
          {xpNext && <p className="text-xs text-parchment-light/40 self-end pb-2">Próximo nível: {xpNext} XP</p>}
        </div>
        <p className="text-xs text-gold/50 mt-2">Bônus de Proficiência: {formatModifier(profBonus)}</p>
      </ScrollSection>

      {/* 2. Attributes */}
      <ScrollSection title="Atributos">
        <div className="flex justify-end mb-2">
          <Button variant="ghost" size="sm" onClick={() => setShowAttrGen(true)}>
            <Dices size={14} className="mr-1" /> Gerar Atributos
          </Button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {ATTRIBUTES.map((attr) => (
            <StatBox
              key={attr}
              attribute={attr}
              value={char.attributes[attr]}
              onChange={(value) => update({ attributes: { ...char.attributes, [attr]: value } })}
            />
          ))}
        </div>
        <AttributeGeneration
          isOpen={showAttrGen}
          onClose={() => setShowAttrGen(false)}
          onApply={(attributes) => update({ attributes })}
        />
      </ScrollSection>

      {/* 3. Combat */}
      <ScrollSection title="Combate">
        <HpTracker
          hp={char.hp}
          ac={char.ac}
          onChange={(hp) => update({ hp })}
          onAcChange={(ac) => update({ ac })}
        />
        <div className="flex gap-4 mt-3">
          <Input label="Iniciativa" type="number" value={char.initiative} onChange={(e) => update({ initiative: parseInt(e.target.value) || 0 })} className="w-24" />
          <Input label="Deslocamento" type="number" value={char.speed} onChange={(e) => update({ speed: parseInt(e.target.value) || 30 })} className="w-24" />
        </div>
        <div className="mt-3">
          <DeathSaves successes={char.deathSaves.successes} failures={char.deathSaves.failures} onChange={(deathSaves) => update({ deathSaves })} />
        </div>
        <div className="flex gap-4 mt-3 items-center">
          <span className="text-sm text-parchment-light/60 font-cinzel">Hit Dice</span>
          <span className="text-sm text-parchment-light">d{char.hitDice.dieType}</span>
          <span className="text-sm text-parchment-light/50">{char.hitDice.total - char.hitDice.used}/{char.hitDice.total}</span>
        </div>
      </ScrollSection>

      {/* 4. Saving Throws */}
      <ScrollSection title="Saving Throws">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ATTRIBUTES.map((attr) => {
            const prof = char.savingThrowProficiencies.includes(attr);
            const value = getModifier(char.attributes[attr]) + (prof ? profBonus : 0);
            return (
              <div key={attr} className="flex items-center gap-2">
                <button
                  onClick={() => toggleSaveProficiency(attr)}
                  className="w-4 h-4 rounded-full border border-gold/40 flex items-center justify-center"
                >
                  {prof && <div className="w-2 h-2 rounded-full bg-gold" />}
                </button>
                <span className="text-sm text-parchment-light/80 flex-1">{attr.toUpperCase()}</span>
                <span className="font-cinzel text-sm">{formatModifier(value)}</span>
              </div>
            );
          })}
        </div>
      </ScrollSection>

      {/* 5. Skills */}
      <ScrollSection title="Perícias">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {SKILLS.map((skill) => {
            const data = skillsData.find((s) => s.slug === skill);
            return (
              <SkillRow
                key={skill}
                skill={skill}
                skillName={data?.name || skill}
                attributeScore={char.attributes[SKILL_ATTRIBUTE_MAP[skill]]}
                level={char.level}
                proficiency={char.skillProficiencies[skill] || "none"}
                onToggle={() => cycleSkillProficiency(skill)}
              />
            );
          })}
        </div>
      </ScrollSection>

      {/* 6. Attacks */}
      <ScrollSection title="Ataques">
        {char.attacks.map((attack, i) => (
          <AttackRow
            key={attack.id}
            attack={attack}
            onChange={(updated) => {
              const attacks = [...char.attacks];
              attacks[i] = updated;
              update({ attacks });
            }}
            onDelete={() => update({ attacks: char.attacks.filter((_, j) => j !== i) })}
          />
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => update({
            attacks: [...char.attacks, { id: generateId(), name: "", attackBonus: 0, damage: "", damageType: "slashing" }],
          })}
          className="mt-2"
        >
          + Adicionar Ataque
        </Button>
      </ScrollSection>

      {/* 7. Spells */}
      <ScrollSection title="Magias" defaultOpen={false}>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const slot = char.spellSlots[level];
            if (!slot || slot.max === 0) return null;
            return (
              <SpellSlotTracker
                key={level}
                level={level}
                max={slot.max}
                used={slot.used}
                onChange={(used) => update({
                  spellSlots: { ...char.spellSlots, [level]: { ...slot, used } },
                })}
              />
            );
          })}
        </div>
      </ScrollSection>

      {/* 8. Conditions */}
      <ScrollSection title="Condições">
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((condition) => (
            <ConditionBadge
              key={condition}
              condition={condition}
              active={char.conditions.includes(condition)}
              onToggle={() => toggleCondition(condition)}
            />
          ))}
        </div>
      </ScrollSection>

      {/* 9. Inventory */}
      <ScrollSection title="Inventário">
        <div className="mb-2 text-xs text-parchment-light/40">
          Peso: {totalWeight.toFixed(1)} / {carryCapacity.toFixed(1)} kg
          {totalWeight > carryCapacity && <span className="text-blood ml-2">Sobrecarregado!</span>}
        </div>

        {/* Coins */}
        <div className="flex gap-2 mb-3">
          {(["cp", "sp", "ep", "gp", "pp"] as const).map((coin) => (
            <div key={coin} className="text-center">
              <label className="text-xs text-gold/50 font-cinzel uppercase">{coin}</label>
              <input
                type="number"
                value={char.coins[coin]}
                onChange={(e) => update({ coins: { ...char.coins, [coin]: Math.max(0, parseInt(e.target.value) || 0) } })}
                className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-sm text-parchment-light focus:outline-none focus:border-gold"
              />
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="text-xs text-parchment-light/30 flex gap-2 mb-1">
          <span className="flex-1">Item</span>
          <span className="w-12 text-center">Qtd</span>
          <span className="w-16 text-center">Peso</span>
          <span className="w-16 text-center">PO</span>
        </div>
        {char.inventory.map((item, i) => (
          <InventoryRow
            key={item.id}
            item={item}
            onChange={(updated) => {
              const inventory = [...char.inventory];
              inventory[i] = updated;
              update({ inventory });
            }}
            onDelete={() => update({ inventory: char.inventory.filter((_, j) => j !== i) })}
          />
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => update({
            inventory: [...char.inventory, { id: generateId(), name: "", quantity: 1, weight: 0, valuePO: 0, description: "" }],
          })}
          className="mt-2"
        >
          + Adicionar Item
        </Button>
      </ScrollSection>

      {/* 10. Traits & Notes */}
      <ScrollSection title="Traços & Notas" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Textarea label="Traços de Personalidade" value={char.traits.personality} onChange={(e) => update({ traits: { ...char.traits, personality: e.target.value } })} rows={3} />
          <Textarea label="Ideais" value={char.traits.ideals} onChange={(e) => update({ traits: { ...char.traits, ideals: e.target.value } })} rows={3} />
          <Textarea label="Vínculos" value={char.traits.bonds} onChange={(e) => update({ traits: { ...char.traits, bonds: e.target.value } })} rows={3} />
          <Textarea label="Fraquezas" value={char.traits.flaws} onChange={(e) => update({ traits: { ...char.traits, flaws: e.target.value } })} rows={3} />
        </div>
        <div className="grid grid-cols-1 gap-3 mt-4">
          <Textarea label="Aparência" value={char.notes.appearance} onChange={(e) => update({ notes: { ...char.notes, appearance: e.target.value } })} rows={3} />
          <Textarea label="História Pessoal" value={char.notes.backstory} onChange={(e) => update({ notes: { ...char.notes, backstory: e.target.value } })} rows={5} />
          <Textarea label="Aliados & Organizações" value={char.notes.allies} onChange={(e) => update({ notes: { ...char.notes, allies: e.target.value } })} rows={3} />
          <Textarea label="Notas Livres" value={char.notes.freeNotes} onChange={(e) => update({ notes: { ...char.notes, freeNotes: e.target.value } })} rows={5} />
        </div>
      </ScrollSection>
    </div>
  );
}
```

- [x] **Step 3: Verify pages load**

```bash
npm run dev
```

Navigate to `/character` — should show empty state. Click "Novo Personagem" — should navigate to sheet. Fill in fields — should auto-save.

- [x] **Step 4: Commit**

```bash
git add app/character/
git commit -m "feat: add character list and full character sheet pages

List with create/delete, sheet with 10 collapsible sections: identity,
attributes (with generator), combat, saving throws, skills, attacks,
spells, conditions, inventory, and traits/notes. Auto-saves to localStorage."
```

---

### Task 15: Compendium Pages

**Files:**
- Create: `app/compendium/page.tsx`, `app/compendium/[category]/page.tsx`, `app/compendium/[category]/[slug]/page.tsx`

- [x] **Step 1: Create compendium hub page**

Create `app/compendium/page.tsx`:

```tsx
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryHub } from "@/components/compendium/CategoryHub";

export default function CompendiumPage() {
  return (
    <div>
      <SectionHeader title="Compêndio" />
      <p className="text-parchment-light/50 text-center mb-8">
        Consulte raças, classes, magias, monstros, itens e regras do D&D 5e
      </p>
      <CategoryHub />
    </div>
  );
}
```

- [x] **Step 2: Create category list page**

Create `app/compendium/[category]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import racesData from "@/data/races.json";
import classesData from "@/data/classes.json";
import conditionsData from "@/data/conditions.json";
import rulesData from "@/data/rules.json";
import { fetchSpells, fetchMonsters, fetchMagicItems } from "@/lib/open5e";
import { CompendiumListClient } from "./CompendiumListClient";

const STATIC_CATEGORIES = {
  races: { data: racesData, label: "Raças" },
  classes: { data: classesData, label: "Classes" },
  conditions: { data: conditionsData, label: "Condições" },
  rules: { data: rulesData, label: "Regras Rápidas" },
};

type StaticCategory = keyof typeof STATIC_CATEGORIES;
type ApiCategory = "spells" | "monsters" | "items";

const API_LABELS: Record<ApiCategory, string> = {
  spells: "Magias",
  monsters: "Monstros",
  items: "Itens Mágicos",
};

const VALID_CATEGORIES = [...Object.keys(STATIC_CATEGORIES), "spells", "monsters", "items"];

interface PageProps {
  params: { category: string };
}

export function generateStaticParams() {
  return Object.keys(STATIC_CATEGORIES).map((category) => ({ category }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = params;

  if (!VALID_CATEGORIES.includes(category)) notFound();

  // Static categories
  if (category in STATIC_CATEGORIES) {
    const { data, label } = STATIC_CATEGORIES[category as StaticCategory];
    const items = (data as { slug: string; name: string; description?: string; content?: string }[]).map((d) => ({
      slug: d.slug,
      name: d.name,
      description: d.description || d.content || "",
    }));
    return <CompendiumListClient category={category} label={label} items={items} />;
  }

  // API categories
  const apiCategory = category as ApiCategory;
  const label = API_LABELS[apiCategory];

  let items: { slug: string; name: string; description: string; meta?: Record<string, string> }[] = [];

  if (apiCategory === "spells") {
    const spells = await fetchSpells();
    items = spells.map((s) => ({
      slug: s.slug, name: s.name,
      description: s.desc.slice(0, 150),
      meta: { level: String(s.level_int), school: s.school, class: s.dnd_class },
    }));
  } else if (apiCategory === "monsters") {
    const monsters = await fetchMonsters();
    items = monsters.map((m) => ({
      slug: m.slug, name: m.name,
      description: `${m.type} — CR ${m.challenge_rating}`,
      meta: { cr: m.challenge_rating, type: m.type, size: m.size },
    }));
  } else if (apiCategory === "items") {
    const magicItems = await fetchMagicItems();
    items = magicItems.map((i) => ({
      slug: i.slug, name: i.name,
      description: i.desc.slice(0, 150),
      meta: { rarity: i.rarity, type: i.type },
    }));
  }

  return <CompendiumListClient category={category} label={label} items={items} />;
}
```

Create `app/compendium/[category]/CompendiumListClient.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { SearchBar } from "@/components/compendium/SearchBar";
import { CompendiumCard } from "@/components/compendium/CompendiumCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Item {
  slug: string;
  name: string;
  description: string;
  meta?: Record<string, string>;
}

interface Props {
  category: string;
  label: string;
  items: Item[];
}

export function CompendiumListClient({ category, label, items }: Props) {
  const [query, setQuery] = useState("");

  const onSearch = useCallback((q: string) => setQuery(q.toLowerCase()), []);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );

  return (
    <div>
      <Link href="/compendium" className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4">
        <ArrowLeft size={16} /> Compêndio
      </Link>
      <SectionHeader title={label} />
      <div className="mb-6">
        <SearchBar onSearch={onSearch} placeholder={`Buscar em ${label.toLowerCase()}...`} />
      </div>
      <p className="text-sm text-parchment-light/40 mb-4">{filtered.length} resultados</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => (
          <CompendiumCard
            key={item.slug}
            href={`/compendium/${category}/${item.slug}`}
            name={item.name}
            subtitle={item.meta ? Object.values(item.meta).join(" · ") : undefined}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
}
```

- [x] **Step 3: Create detail page**

Create `app/compendium/[category]/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import racesData from "@/data/races.json";
import classesData from "@/data/classes.json";
import conditionsData from "@/data/conditions.json";
import rulesData from "@/data/rules.json";
import { fetchSpellBySlug, fetchMonsterBySlug, fetchMagicItemBySlug } from "@/lib/open5e";
import { Card } from "@/components/ui/Card";

interface PageProps {
  params: { category: string; slug: string };
}

export default async function CompendiumDetailPage({ params }: PageProps) {
  const { category, slug } = params;

  let content: React.ReactNode = null;
  let title = "";

  if (category === "races") {
    const race = racesData.find((r) => r.slug === slug);
    if (!race) notFound();
    title = race.name;
    content = (
      <div className="space-y-4">
        <p className="text-ink/70">{race.description}</p>
        <div><strong className="text-ink font-cinzel">Deslocamento:</strong> {race.speed}ft</div>
        <div><strong className="text-ink font-cinzel">Visão no Escuro:</strong> {race.darkvision ? "Sim" : "Não"}</div>
        <div><strong className="text-ink font-cinzel">Idiomas:</strong> {race.languages.join(", ")}</div>
        <div>
          <strong className="text-ink font-cinzel">Bônus de Atributo:</strong>
          <span className="ml-2">{Object.entries(race.abilityBonuses).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(", ")}</span>
        </div>
        <div>
          <strong className="text-ink font-cinzel">Traços:</strong>
          <ul className="list-disc list-inside mt-1">
            {race.traits.map((t, i) => <li key={i} className="text-ink/70">{t}</li>)}
          </ul>
        </div>
      </div>
    );
  } else if (category === "classes") {
    const cls = classesData.find((c) => c.slug === slug);
    if (!cls) notFound();
    title = cls.name;
    content = (
      <div className="space-y-4">
        <div><strong className="text-ink font-cinzel">Dado de Vida:</strong> d{cls.hitDie}</div>
        <div><strong className="text-ink font-cinzel">Saving Throws:</strong> {cls.savingThrows.map((s) => s.toUpperCase()).join(", ")}</div>
        <div><strong className="text-ink font-cinzel">Proficiências de Armadura:</strong> {cls.armorProficiencies.join(", ")}</div>
        <div><strong className="text-ink font-cinzel">Proficiências de Arma:</strong> {cls.weaponProficiencies.join(", ")}</div>
        <div>
          <strong className="text-ink font-cinzel">Características:</strong>
          <div className="space-y-2 mt-2">
            {cls.features.map((f, i) => (
              <div key={i} className="border-l-2 border-gold/30 pl-3">
                <span className="text-xs text-gold/60">Nível {f.level}</span>
                <h4 className="font-cinzel text-sm text-ink font-bold">{f.name}</h4>
                <p className="text-xs text-ink/60">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else if (category === "conditions") {
    const cond = conditionsData.find((c) => c.slug === slug);
    if (!cond) notFound();
    title = cond.name;
    content = <p className="text-ink/70">{cond.description}</p>;
  } else if (category === "rules") {
    const rule = rulesData.find((r) => r.slug === slug);
    if (!rule) notFound();
    title = rule.name;
    content = <div className="text-ink/70 whitespace-pre-wrap">{rule.content}</div>;
  } else if (category === "spells") {
    const spell = await fetchSpellBySlug(slug);
    if (!spell) notFound();
    title = spell.name;
    content = (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3 text-sm">
          <span><strong className="text-ink font-cinzel">Nível:</strong> {spell.level_int === 0 ? "Cantrip" : spell.level_int}</span>
          <span><strong className="text-ink font-cinzel">Escola:</strong> {spell.school}</span>
          <span><strong className="text-ink font-cinzel">Tempo:</strong> {spell.casting_time}</span>
          <span><strong className="text-ink font-cinzel">Alcance:</strong> {spell.range}</span>
        </div>
        <div className="text-sm">
          <strong className="text-ink font-cinzel">Componentes:</strong> {spell.components}
        </div>
        <div className="text-sm">
          <strong className="text-ink font-cinzel">Duração:</strong> {spell.duration}
          {spell.concentration === "yes" && <span className="text-gold ml-2">(Concentração)</span>}
        </div>
        <div className="text-sm">
          <strong className="text-ink font-cinzel">Classes:</strong> {spell.dnd_class}
        </div>
        <hr className="border-gold/20" />
        <p className="text-ink/70 whitespace-pre-wrap">{spell.desc}</p>
        {spell.higher_level && (
          <div>
            <strong className="text-ink font-cinzel text-sm">Em Níveis Superiores:</strong>
            <p className="text-ink/60 text-sm">{spell.higher_level}</p>
          </div>
        )}
      </div>
    );
  } else if (category === "monsters") {
    const monster = await fetchMonsterBySlug(slug);
    if (!monster) notFound();
    title = monster.name;
    content = (
      <div className="space-y-3">
        <div className="text-sm text-ink/60">{monster.size} {monster.type} — CR {monster.challenge_rating}</div>
        <div className="flex gap-4 text-sm">
          <span><strong>HP:</strong> {monster.hit_points}</span>
          <span><strong>AC:</strong> {monster.armor_class}</span>
        </div>
        <div className="grid grid-cols-6 gap-2 text-center text-sm">
          {(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const).map((attr) => (
            <div key={attr}>
              <div className="text-xs text-gold/60 font-cinzel">{attr.slice(0, 3).toUpperCase()}</div>
              <div className="text-ink">{monster[attr]}</div>
            </div>
          ))}
        </div>
        {monster.actions?.length > 0 && (
          <div>
            <strong className="text-ink font-cinzel">Ações:</strong>
            {monster.actions.map((a, i) => (
              <div key={i} className="mt-1">
                <span className="font-bold text-sm text-ink">{a.name}.</span>
                <span className="text-sm text-ink/60 ml-1">{a.desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else if (category === "items") {
    const item = await fetchMagicItemBySlug(slug);
    if (!item) notFound();
    title = item.name;
    content = (
      <div className="space-y-3">
        <div className="flex gap-3 text-sm">
          <span><strong className="text-ink font-cinzel">Tipo:</strong> {item.type}</span>
          <span><strong className="text-ink font-cinzel">Raridade:</strong> {item.rarity}</span>
          {item.requires_attunement && <span className="text-gold">Requer Sintonização</span>}
        </div>
        <p className="text-ink/70 whitespace-pre-wrap">{item.desc}</p>
      </div>
    );
  } else {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/compendium/${category}`} className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <Card variant="parchment" className="p-6">
        <h1 className="font-cinzel text-2xl text-ink mb-4 border-b border-gold/30 pb-2">{title}</h1>
        {content}
      </Card>
    </div>
  );
}
```

- [x] **Step 4: Verify compendium navigation**

```bash
npm run dev
```

Navigate to `/compendium` — should show category hub. Click "Raças" — should show 9 races. Click a race — should show detail. Check that `/compendium/spells` loads from Open5e (may take a moment).

- [x] **Step 5: Commit**

```bash
git add app/compendium/
git commit -m "feat: add compendium pages with hybrid data (JSON + Open5e)

Hub, category list with search, and detail pages. Static categories
(races, classes, conditions, rules) via JSON. API categories (spells,
monsters, items) fetched from Open5e with 24h cache."
```

---

### Task 16: Master Pages

**Files:**
- Create: `app/master/page.tsx`, `app/master/layout.tsx`, `app/master/campaign/[id]/page.tsx`, `app/master/encounter/[id]/page.tsx`

- [x] **Step 1: Create master layout with PinGuard**

Create `app/master/layout.tsx`:

```tsx
import { PinGuard } from "@/components/master/PinGuard";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return <PinGuard>{children}</PinGuard>;
}
```

- [x] **Step 2: Create master dashboard page**

Create `app/master/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useCampaignStore } from "@/store/campaignStore";
import { CampaignCard } from "@/components/master/CampaignCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Plus } from "lucide-react";

export default function MasterPage() {
  const { campaigns, createCampaign } = useCampaignStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [world, setWorld] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    createCampaign({ name, description, world });
    setName("");
    setDescription("");
    setWorld("");
    setShowCreate(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Área do Mestre" />
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus size={16} className="mr-1" /> Nova Campanha
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-parchment-light/50 mb-4">Nenhuma campanha criada ainda.</p>
          <Button onClick={() => setShowCreate(true)}>Criar Primeira Campanha</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nova Campanha">
        <div className="space-y-3">
          <Input label="Nome da Campanha" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <Input label="Mundo" value={world} onChange={(e) => setWorld(e.target.value)} placeholder="Forgotten Realms, Eberron..." />
          <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <Button onClick={handleCreate} className="w-full">Criar Campanha</Button>
        </div>
      </Modal>
    </div>
  );
}
```

- [x] **Step 3: Create campaign detail page with tabs**

Create `app/master/campaign/[id]/page.tsx`:

```tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useCampaignStore } from "@/store/campaignStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { NpcCard } from "@/components/master/NpcCard";
import { EncounterPlanner } from "@/components/master/EncounterPlanner";
import { RichTextEditor } from "@/components/master/RichTextEditor";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { ALIGNMENTS, ATTRIBUTES, type NPC, type Alignment, type EncounterMonster, type Encounter } from "@/types/dnd5e";
import { ArrowLeft, Users, Swords, ScrollText, StickyNote, Plus } from "lucide-react";
import Link from "next/link";
import { generateId } from "@/lib/utils";

const TABS = [
  { key: "npcs", label: "NPCs", icon: Users },
  { key: "encounters", label: "Encontros", icon: Swords },
  { key: "sessions", label: "Sessões", icon: ScrollText },
  { key: "notes", label: "Notas", icon: StickyNote },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const ALIGNMENT_OPTIONS = ALIGNMENTS.map((a) => ({
  value: a,
  label: a.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const ROLE_OPTIONS = [
  { value: "ally", label: "Aliado" },
  { value: "neutral", label: "Neutro" },
  { value: "antagonist", label: "Antagonista" },
  { value: "unknown", label: "Desconhecido" },
];

export default function CampaignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    getCampaign, addNpc, updateNpc, deleteNpc,
    addEncounter, deleteEncounter, updateCampaignNotes,
    addSession,
  } = useCampaignStore();

  const campaign = getCampaign(id);
  const [tab, setTab] = useState<TabKey>("npcs");
  const [showNpcModal, setShowNpcModal] = useState(false);
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingNpc, setEditingNpc] = useState<NPC | null>(null);

  // NPC form state
  const [npcForm, setNpcForm] = useState({ name: "", race: "", profession: "", alignment: "true-neutral" as Alignment, role: "neutral" as NPC["role"], notes: "", secrets: "", relationships: "" });
  // Encounter form
  const [encName, setEncName] = useState("");
  const [encPartyLevel, setEncPartyLevel] = useState(1);
  const [encPartySize, setEncPartySize] = useState(4);
  const [encMonsters, setEncMonsters] = useState<EncounterMonster[]>([]);
  // Session form
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionSummary, setSessionSummary] = useState("");

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-parchment-light/50 mb-4">Campanha não encontrada.</p>
        <Button onClick={() => router.push("/master")}>Voltar</Button>
      </div>
    );
  }

  const handleAddNpc = () => {
    if (!npcForm.name.trim()) return;
    const defaultAttrs = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } as Record<typeof ATTRIBUTES[number], number>;
    addNpc(id, {
      ...npcForm,
      hp: { max: 10, current: 10 },
      ac: 10,
      attributes: defaultAttrs,
      avatar: npcForm.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    });
    setNpcForm({ name: "", race: "", profession: "", alignment: "true-neutral", role: "neutral", notes: "", secrets: "", relationships: "" });
    setShowNpcModal(false);
  };

  const handleAddEncounter = () => {
    if (!encName.trim()) return;
    addEncounter(id, {
      name: encName,
      monsters: encMonsters,
      playerCharacters: [],
      partyLevel: encPartyLevel,
      partySize: encPartySize,
      status: "planning",
    });
    setEncName("");
    setEncMonsters([]);
    setShowEncounterModal(false);
  };

  const handleAddSession = () => {
    if (!sessionTitle.trim()) return;
    addSession(id, { date: new Date().toISOString(), title: sessionTitle, summary: sessionSummary, tags: [], notes: "" });
    setSessionTitle("");
    setSessionSummary("");
    setShowSessionModal(false);
  };

  return (
    <div>
      <Link href="/master" className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4">
        <ArrowLeft size={16} /> Dashboard
      </Link>

      <h1 className="font-cinzel text-2xl text-gold mb-1">{campaign.name}</h1>
      {campaign.world && <p className="text-parchment-light/40 text-sm mb-4">{campaign.world}</p>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gold/20">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 font-cinzel text-sm border-b-2 transition-colors ${
              tab === t.key ? "border-gold text-gold" : "border-transparent text-parchment-light/40 hover:text-parchment-light"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* NPCs Tab */}
      {tab === "npcs" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowNpcModal(true)}><Plus size={14} className="mr-1" /> Novo NPC</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaign.npcs.map((npc) => (
              <NpcCard key={npc.id} npc={npc} onClick={() => setEditingNpc(npc)} />
            ))}
          </div>
          {campaign.npcs.length === 0 && <p className="text-center text-parchment-light/40 py-10">Nenhum NPC cadastrado.</p>}

          <Modal isOpen={showNpcModal} onClose={() => setShowNpcModal(false)} title="Novo NPC">
            <div className="space-y-3">
              <Input label="Nome" value={npcForm.name} onChange={(e) => setNpcForm({ ...npcForm, name: e.target.value })} autoFocus />
              <Input label="Raça" value={npcForm.race} onChange={(e) => setNpcForm({ ...npcForm, race: e.target.value })} />
              <Input label="Profissão" value={npcForm.profession} onChange={(e) => setNpcForm({ ...npcForm, profession: e.target.value })} />
              <Select label="Alinhamento" options={ALIGNMENT_OPTIONS} value={npcForm.alignment} onChange={(e) => setNpcForm({ ...npcForm, alignment: e.target.value as Alignment })} />
              <Select label="Papel" options={ROLE_OPTIONS} value={npcForm.role} onChange={(e) => setNpcForm({ ...npcForm, role: e.target.value as NPC["role"] })} />
              <Textarea label="Notas" value={npcForm.notes} onChange={(e) => setNpcForm({ ...npcForm, notes: e.target.value })} rows={2} />
              <Textarea label="Segredos (só DM)" value={npcForm.secrets} onChange={(e) => setNpcForm({ ...npcForm, secrets: e.target.value })} rows={2} />
              <Button onClick={handleAddNpc} className="w-full">Criar NPC</Button>
            </div>
          </Modal>

          {/* NPC detail modal */}
          <Modal isOpen={!!editingNpc} onClose={() => setEditingNpc(null)} title={editingNpc?.name || ""}>
            {editingNpc && (
              <div className="space-y-3 text-sm">
                <p><strong className="text-gold">Raça:</strong> {editingNpc.race}</p>
                <p><strong className="text-gold">Profissão:</strong> {editingNpc.profession}</p>
                <p><strong className="text-gold">Papel:</strong> {ROLE_OPTIONS.find((r) => r.value === editingNpc.role)?.label}</p>
                <p><strong className="text-gold">HP:</strong> {editingNpc.hp.current}/{editingNpc.hp.max} | <strong className="text-gold">AC:</strong> {editingNpc.ac}</p>
                {editingNpc.notes && <div><strong className="text-gold">Notas:</strong><p className="text-parchment-light/60">{editingNpc.notes}</p></div>}
                {editingNpc.secrets && <div className="p-2 bg-blood/10 border border-blood/20 rounded"><strong className="text-blood-light">Segredos:</strong><p className="text-parchment-light/60">{editingNpc.secrets}</p></div>}
                <div className="flex gap-2 pt-2">
                  <Button variant="danger" size="sm" onClick={() => { deleteNpc(id, editingNpc.id); setEditingNpc(null); }}>Excluir</Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      {/* Encounters Tab */}
      {tab === "encounters" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowEncounterModal(true)}><Plus size={14} className="mr-1" /> Novo Encontro</Button>
          </div>
          <div className="space-y-3">
            {campaign.encounters.map((enc) => (
              <Card key={enc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-cinzel text-gold">{enc.name}</h4>
                    <p className="text-xs text-parchment-light/40">
                      {enc.monsters.length} monstros — {enc.difficulty.toUpperCase()} — {enc.adjustedXP} XP ajustado
                    </p>
                  </div>
                  <Link href={`/master/encounter/${enc.id}?campaign=${id}`}>
                    <Button size="sm" variant="secondary">Tracker</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          {campaign.encounters.length === 0 && <p className="text-center text-parchment-light/40 py-10">Nenhum encontro cadastrado.</p>}

          <Modal isOpen={showEncounterModal} onClose={() => setShowEncounterModal(false)} title="Novo Encontro" className="max-w-2xl">
            <div className="space-y-4">
              <Input label="Nome do Encontro" value={encName} onChange={(e) => setEncName(e.target.value)} />
              <EncounterPlanner
                partyLevel={encPartyLevel}
                partySize={encPartySize}
                onPartyChange={(l, s) => { setEncPartyLevel(l); setEncPartySize(s); }}
                monsters={encMonsters}
                onMonstersChange={setEncMonsters}
              />
              <Button onClick={handleAddEncounter} className="w-full">Criar Encontro</Button>
            </div>
          </Modal>
        </div>
      )}

      {/* Sessions Tab */}
      {tab === "sessions" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowSessionModal(true)}><Plus size={14} className="mr-1" /> Nova Sessão</Button>
          </div>
          <div className="space-y-3">
            {campaign.sessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-cinzel text-gold">{session.title}</h4>
                    <p className="text-xs text-parchment-light/40">{new Date(session.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                {session.summary && <p className="text-sm text-parchment-light/60 mt-2">{session.summary}</p>}
              </Card>
            ))}
          </div>
          {campaign.sessions.length === 0 && <p className="text-center text-parchment-light/40 py-10">Nenhuma sessão registrada.</p>}

          <Modal isOpen={showSessionModal} onClose={() => setShowSessionModal(false)} title="Nova Sessão">
            <div className="space-y-3">
              <Input label="Título" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} autoFocus />
              <Textarea label="Resumo" value={sessionSummary} onChange={(e) => setSessionSummary(e.target.value)} rows={4} />
              <Button onClick={handleAddSession} className="w-full">Registrar Sessão</Button>
            </div>
          </Modal>
        </div>
      )}

      {/* Notes Tab */}
      {tab === "notes" && (
        <div>
          <RichTextEditor
            content={campaign.notes}
            onChange={(notes) => updateCampaignNotes(id, notes)}
            placeholder="Notas da campanha, hooks de aventura, segredos pendentes..."
          />
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 4: Create encounter tracker page**

Create `app/master/encounter/[id]/page.tsx`:

```tsx
"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useCampaignStore } from "@/store/campaignStore";
import { EncounterTracker } from "@/components/master/EncounterTracker";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import type { Encounter } from "@/types/dnd5e";

export default function EncounterTrackerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const encounterId = params.id as string;
  const campaignId = searchParams.get("campaign") || "";
  const { getCampaign, updateEncounter } = useCampaignStore();

  const campaign = getCampaign(campaignId);
  const encounter = campaign?.encounters.find((e) => e.id === encounterId);

  if (!encounter || !campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-parchment-light/50 mb-4">Encontro não encontrado.</p>
        <Button onClick={() => router.push("/master")}>Voltar</Button>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Encounter>) => {
    updateEncounter(campaignId, encounterId, updates);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4">
        <ArrowLeft size={16} /> Voltar à Campanha
      </button>

      <h1 className="font-cinzel text-2xl text-gold mb-4">{encounter.name}</h1>

      <EncounterTracker encounter={encounter} onUpdate={handleUpdate} />
    </div>
  );
}
```

- [x] **Step 5: Verify master area**

```bash
npm run dev
```

Navigate to `/master` — should prompt for PIN. Create PIN → see dashboard. Create campaign → navigate → add NPC, encounter, session, notes.

- [x] **Step 6: Commit**

```bash
git add app/master/
git commit -m "feat: add DM dashboard pages with PIN auth

Campaign CRUD, tabbed campaign view (NPCs, Encounters, Sessions, Notes),
encounter tracker page, and TipTap rich text notes with auto-save."
```

---

### Task 17: Visual Polish and Responsiveness

**Files:**
- Modify: various component files, `app/globals.css`

- [ ] **Step 1: Add page transitions with framer-motion**

Create `components/layout/PageTransition.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

Wrap each page's content with `<PageTransition>` in the page files, or add it to the root layout.

- [ ] **Step 2: Add hover effects to cards**

Update `app/globals.css` to add hover scale and glow:

```css
@layer components {
  /* ...existing... */

  .card-medieval {
    @apply bg-parchment border border-gold rounded-lg shadow-tome text-ink transition-all duration-200;
  }

  .card-medieval:hover {
    transform: translateY(-1px);
  }

  .card-medieval-dark {
    @apply bg-ink-light border border-gold/30 rounded-lg shadow-tome text-parchment-light transition-all duration-200;
  }

  .card-medieval-dark:hover {
    transform: translateY(-1px);
  }
}
```

- [ ] **Step 3: Responsive audit fixes**

Review components for mobile (375px):
- Character sheet: ensure grid switches to single column
- Compendium: cards go to single column on mobile
- Master campaign tabs: horizontally scrollable on small screens
- Encounter tracker: stack controls vertically on mobile

Add responsive classes where needed (most are already handled by the `grid-cols-1 md:grid-cols-X` pattern).

For master tabs, add `overflow-x-auto` to the tabs container in `app/master/campaign/[id]/page.tsx`.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add page transitions, hover effects, and responsive fixes"
```

---

### Task 18: Build Verification and Deploy

**Files:**
- Modify: potentially any file that causes build errors

- [ ] **Step 1: Run type check**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 2: Run tests**

```bash
npm test
```

All tests should pass.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Fix any build errors. Common issues:
- **Hydration mismatch:** Ensure all Zustand store consumers check `isHydrated` before rendering store data
- **Server/client boundary:** Verify `'use client'` is present on all components using hooks
- **JSON imports:** May need `resolveJsonModule: true` in tsconfig (Next.js includes this by default)

- [ ] **Step 4: Test the built app locally**

```bash
npm run start
```

Verify all 3 modules work: create character, browse compendium, set PIN and create campaign.

- [ ] **Step 5: Deploy to Vercel**

```bash
npx vercel --prod
```

Or push to GitHub repo connected to Vercel for auto-deploy.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "fix: resolve build issues and verify production build

All type checks pass, tests pass, and build completes successfully."
```
