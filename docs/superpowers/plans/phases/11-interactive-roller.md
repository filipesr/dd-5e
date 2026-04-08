# Interactive Roller Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make skills, saves, and attacks rollable from the character sheet during session mode, with advantage/disadvantage support.

**Architecture:** New `rollWithAdvantage` lib function, session store extended with advantageMode, existing skill/attack rows enhanced with roll buttons when session is active.

**Spec:** `docs/superpowers/specs/modules/11-interactive-roller.md`

---

## Task 1: Roll With Advantage lib + Session Store extension

**Files:**
- Create: `lib/rollWithAdvantage.ts`, `lib/__tests__/rollWithAdvantage.test.ts`
- Modify: `store/sessionStore.ts`

### lib/rollWithAdvantage.ts

Core rolling function that handles normal/advantage/disadvantage:

```typescript
import { rollDice } from "@/lib/dice";

export type AdvantageMode = "normal" | "advantage" | "disadvantage";

export interface D20RollResult {
  rolls: number[];
  chosen: number;
  modifier: number;
  total: number;
  isCritical: boolean;
  isFumble: boolean;
  advantage: AdvantageMode;
}

export function rollD20WithAdvantage(modifier: number, mode: AdvantageMode): D20RollResult {
  const count = mode === "normal" ? 1 : 2;
  const { rolls } = rollDice(count, 20);
  const chosen = mode === "advantage" ? Math.max(...rolls) : mode === "disadvantage" ? Math.min(...rolls) : rolls[0];
  return {
    rolls,
    chosen,
    modifier,
    total: chosen + modifier,
    isCritical: chosen === 20,
    isFumble: chosen === 1,
    advantage: mode,
  };
}
```

### Tests

Test: normal rolls 1d20, advantage rolls 2d20 takes max, disadvantage rolls 2d20 takes min, modifier added to total, critical on nat 20, fumble on nat 1.

### Session Store changes

Add to SessionState:
```typescript
advantageMode: AdvantageMode;
setAdvantageMode: (mode: AdvantageMode) => void;
```

Initialize `advantageMode: "normal"` in state. Add to `startSession` reset. Implement `setAdvantageMode`.

Import `AdvantageMode` from `lib/rollWithAdvantage`.

### Commit
```
feat: add rollWithAdvantage lib and advantage mode to session store
```

---

## Task 2: Rollable Components + AdvantageToggle + CustomRoller

**Files:**
- Create: `components/character/AdvantageToggle.tsx`, `components/character/CustomRoller.tsx`
- Modify: `components/character/SkillRow.tsx`, `components/character/AttackRow.tsx`
- Modify: `components/character/SessionPanel.tsx`

### AdvantageToggle

3-state toggle: Normal / Vantagem / Desvantagem. Reads/writes `advantageMode` from session store.

```
[Normal] [Vantagem ↑] [Desvantagem ↓]
```

Active state highlighted (gold for advantage, blood for disadvantage).

### CustomRoller

Input field + "Rolar" button. User types any dice notation (e.g., "2d6+3"), clicks roll, result goes to Roll Log.

### SkillRow enhancement

Add optional `onRoll` prop. When provided (session active), show a dice icon button at the end of the row. On click: call `rollD20WithAdvantage(skillValue, advantageMode)`, then `addRoll()` to log.

Keep backward compatible — without `onRoll`, behaves exactly as before.

### AttackRow enhancement

Add optional `onRollAttack` and `onRollDamage` props. When session active:
- Show "Atacar" button (dice icon)
- On click: roll attack (1d20+attackBonus with advantage mode), log it
- If result shows, show "Dano" button
- On damage click: roll damage dice (parse attack.damage notation), if critical double dice count, log it

### SessionPanel changes

Add AdvantageToggle and CustomRoller to the panel layout (between rest buttons and roll log).

### Commit
```
feat: add rollable skills, attacks, advantage toggle, and custom roller
```

---

## Task 3: Wire into Character Sheet Page

**Files:**
- Modify: `app/character/[id]/page.tsx`

### Changes

When session is active, pass `onRoll` callbacks to SkillRow and AttackRow components:

For skills: wrap the existing SkillRow with an onRoll that calls rollD20WithAdvantage with the skill's calculated value, then addRoll.

For attacks: wrap AttackRow with onRollAttack/onRollDamage.

For saving throws: add a roll button next to each save value (same pattern as skills).

Import rollD20WithAdvantage and addRoll from stores/libs.

### Commit
```
feat: wire rollable skills, saves, and attacks into character sheet
```
