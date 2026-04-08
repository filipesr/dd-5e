# Treasure Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add loot generation by CR (DMG tables), random magic items, and campaign treasure inventory to the DM dashboard.

**Architecture:** Pure function lib for loot tables + Zustand store extension + 2 UI components + new tab in campaign page.

**Spec:** `docs/superpowers/specs/modules/08-treasure-management.md`

---

## Task 1: Types + Loot Tables Library (TDD)

**Files:**
- Modify: `types/dnd5e.ts`
- Create: `lib/lootTables.ts`, `lib/__tests__/lootTables.test.ts`

### Types to add in types/dnd5e.ts

Add before the `// === Compendium Data Types ===` section (after Campaign interface):

```typescript
export interface TreasureRecord {
  id: string;
  date: string;
  description: string;
  givenTo: string;
  coins: Record<CoinType, number>;
  items: { name: string; rarity: string; description: string }[];
  notes: string;
}
```

Add `treasures: TreasureRecord[]` to the Campaign interface.

### lib/lootTables.ts

Exports:
- `generateLootByCR(cr: number): { coins: Record<CoinType, number>; items: { name, rarity, description }[] }`
- `getRandomMagicItem(rarity: string): { name, rarity, description }`
- `MAGIC_ITEMS` constant — pool of items by rarity

Uses `lib/dice.ts` rollDice for coin generation.

CR tiers:
- 0-4: 6d6×100 CP, 3d6×100 SP, 2d6×10 GP
- 5-10: 2d6×100 CP, 2d6×1000 SP, 6d6×100 GP, 3d6×10 PP
- 11-16: 4d6×1000 GP, 5d6×100 PP
- 17+: 12d6×1000 GP, 8d6×1000 PP

Tests: verify coin ranges per CR tier, magic item returns valid item from pool.

### Commit after implementing

```
feat: add loot tables library with CR-based generation and magic items
```

---

## Task 2: Campaign Store Extension + UI Components

**Files:**
- Modify: `store/campaignStore.ts`
- Create: `components/master/TreasureGenerator.tsx`, `components/master/TreasureInventory.tsx`

### Store changes

Add to CampaignState interface:
```typescript
addTreasure: (campaignId: string, treasure: Omit<TreasureRecord, "id">) => void;
deleteTreasure: (campaignId: string, treasureId: string) => void;
```

Implement in the store actions (same pattern as addNpc/deleteNpc but on campaign.treasures[]).

### TreasureGenerator component

- Select CR range (0-4, 5-10, 11-16, 17+)
- Toggle include magic items + rarity select
- "Gerar Tesouro" button → calls generateLootByCR
- Shows result: coins table + item cards
- "Adicionar ao Inventario" button → calls addTreasure with description and givenTo fields

### TreasureInventory component

- Lists campaign.treasures as Cards
- Each: date, description, givenTo, coins summary, items list
- Delete button per entry
- Footer with accumulated coin totals

### Commit

```
feat: add treasure generator and inventory components
```

---

## Task 3: Wire into Campaign Page

**Files:**
- Modify: `app/master/campaign/[id]/page.tsx`

Add "Tesouros" tab (icon: Gem from lucide-react) to TABS array. Render TreasureGenerator + TreasureInventory in the tab content.

### Commit

```
feat: add Tesouros tab to campaign page
```
