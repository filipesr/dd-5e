# DM Session Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add progress clocks, random event generator, inspiration system, and quick NPC generator to the DM dashboard.

**Architecture:** Pure data/function libs for random tables and NPC generation, new UI components, campaign store extended with clocks and character store with inspiration.

**Spec:** `docs/superpowers/specs/modules/12-dm-session-tools.md`

---

## Task 1: Types + Random Tables + NPC Generator libs

**Files:**
- Modify: `types/dnd5e.ts`
- Create: `lib/randomTables.ts`, `lib/npcGenerator.ts`

### Types

Add to `types/dnd5e.ts`:

```typescript
export interface ProgressClock {
  id: string;
  name: string;
  segments: number;
  filled: number;
}
```

Add `clocks: ProgressClock[]` to Campaign interface.
Add `inspiration: boolean` to Character interface (default false).

### lib/randomTables.ts

Export categorized random event tables and a pick function:

```typescript
export const RANDOM_TABLES: Record<string, string[]> = {
  "Encontro - Floresta": [...20 entries in PT-BR...],
  "Encontro - Montanha": [...],
  "Encontro - Cidade": [...],
  "Clima": [...10 entries...],
  "Complicacao de Masmorra": [...15 entries...],
  "Evento Social": [...15 entries...],
  "Twist de Plot": [...10 entries...],
};

export function rollRandomEvent(category: string): string
export function getCategories(): string[]
```

### lib/npcGenerator.ts

Pools of names, races, professions, motivations, secrets, traits. All in PT-BR.

```typescript
export interface GeneratedNPC {
  name: string;
  race: string;
  profession: string;
  motivation: string;
  secret: string;
  trait: string;
}

export function generateQuickNPC(): GeneratedNPC
```

### Commit
```
feat: add random tables and NPC generator libs
```

---

## Task 2: Store Extensions (Campaign clocks + Character inspiration)

**Files:**
- Modify: `store/campaignStore.ts`, `store/characterStore.ts`

### Campaign Store

Add:
```typescript
addClock: (campaignId: string, clock: Omit<ProgressClock, "id">) => void;
updateClock: (campaignId: string, clockId: string, filled: number) => void;
deleteClock: (campaignId: string, clockId: string) => void;
```

In createCampaign, add `clocks: []`.

### Character Store

Add:
```typescript
toggleInspiration: (id: string) => void;
```

Flips `character.inspiration` boolean. Add `inspiration: false` to DEFAULT_CHARACTER.

### Commit
```
feat: extend stores with progress clocks and inspiration
```

---

## Task 3: UI Components

**Files:**
- Create: `components/master/ProgressClock.tsx`, `components/master/ProgressClockManager.tsx`, `components/master/RandomEventGenerator.tsx`, `components/master/QuickNpcGenerator.tsx`

### ProgressClock

SVG circular clock divided into segments (4, 6, or 8 slices). Click a segment to fill/unfill. Filled segments colored gold, empty transparent with gold border.

### ProgressClockManager

List of clocks + "Novo Relogio" button (input: name, segment count select 4/6/8). Each clock shows name + ProgressClock + delete button.

### RandomEventGenerator

Select category dropdown + "Sortear" button + result display card. "Sortear Novamente" button.

### QuickNpcGenerator

"Gerar NPC" button → shows generated NPC in a card (name, race, profession, motivation, secret, trait). "Adicionar a Campanha" button calls addNpc.

### Commit
```
feat: add progress clocks, random events, and quick NPC generator components
```

---

## Task 4: Wire into Campaign Page

**Files:**
- Modify: `app/master/campaign/[id]/page.tsx`

### Changes

- Add ProgressClockManager to the "Notas" tab (above RichTextEditor)
- Add RandomEventGenerator to a new section in "Notas" tab (or as a floating tool)
- Add QuickNpcGenerator button in "NPCs" tab header (next to "Novo NPC")
- Add inspiration toggle per linked PJ in the campaign sidebar/header (if PJ ids linked)

Wire store actions: addClock, updateClock, deleteClock, addNpc.

### Commit
```
feat: wire DM session tools into campaign page
```
