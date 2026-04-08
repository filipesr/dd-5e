# JSON Import/Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Export character sheets as JSON files and import them back with validation, for backup and sharing.

**Architecture:** Pure function lib for serialization/validation + 2 button components + integration into character pages.

**Spec:** `docs/superpowers/specs/modules/10-json-import-export.md`

---

## Task 1: JSON Import/Export Library (TDD)

**Files:**
- Create: `lib/jsonImportExport.ts`, `lib/__tests__/jsonImportExport.test.ts`

### lib/jsonImportExport.ts

```typescript
import type { Character } from "@/types/dnd5e";
import { RACES, CLASSES, ALIGNMENTS, ATTRIBUTES } from "@/types/dnd5e";
import { generateId } from "@/lib/utils";

interface CharacterExport {
  version: 1;
  exportedAt: string;
  source: "dd5e-toolkit";
  character: Character;
}

export function exportCharacterToJSON(character: Character): Blob {
  const data: CharacterExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    source: "dd5e-toolkit",
    character,
  };
  return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
}

export function validateCharacterJSON(data: unknown): { valid: true; character: Character } | { valid: false; error: string } {
  // Check wrapper
  if (typeof data !== "object" || data === null) return { valid: false, error: "JSON invalido" };

  const obj = data as Record<string, unknown>;
  let charData: Record<string, unknown>;

  // Support both wrapped and raw formats
  if (obj.version === 1 && obj.character) {
    charData = obj.character as Record<string, unknown>;
  } else if (obj.name && obj.race && obj.class) {
    charData = obj;
  } else {
    return { valid: false, error: "Formato nao reconhecido" };
  }

  // Validate required fields
  if (typeof charData.name !== "string" || !charData.name) return { valid: false, error: "Nome obrigatorio" };
  if (!RACES.includes(charData.race as any)) return { valid: false, error: `Raca invalida: ${charData.race}` };
  if (!CLASSES.includes(charData.class as any)) return { valid: false, error: `Classe invalida: ${charData.class}` };
  if (!ALIGNMENTS.includes(charData.alignment as any)) return { valid: false, error: `Alinhamento invalido` };

  const level = Number(charData.level);
  if (!level || level < 1 || level > 20) return { valid: false, error: "Nivel deve ser 1-20" };

  // Validate attributes
  const attrs = charData.attributes as Record<string, number> | undefined;
  if (!attrs) return { valid: false, error: "Atributos obrigatorios" };
  for (const attr of ATTRIBUTES) {
    if (typeof attrs[attr] !== "number") return { valid: false, error: `Atributo ${attr} faltando` };
  }

  // Generate new id and timestamps
  const character: Character = {
    ...(charData as unknown as Character),
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { valid: true, character };
}

export async function importCharacterFromJSON(file: File): Promise<Character> {
  const text = await file.text();
  const data = JSON.parse(text);
  const result = validateCharacterJSON(data);
  if (!result.valid) throw new Error(result.error);
  return result.character;
}
```

### Tests

Test: export creates valid JSON blob, validate accepts valid data, validate rejects missing name/invalid race/bad level, import reads file and returns Character with new id, raw Character (no wrapper) also validates.

### Commit

```
feat: add JSON import/export library with validation
```

---

## Task 2: UI Buttons + Integration

**Files:**
- Create: `components/character/JsonExportButton.tsx`, `components/character/JsonImportButton.tsx`
- Modify: `app/character/[id]/page.tsx`, `app/character/page.tsx`

### JsonExportButton

Same pattern as PdfExportButton: lazy import, generate blob, download as `<name>_ficha.json`.

### JsonImportButton

Hidden file input (accept=".json"). On file select: call importCharacterFromJSON, then createCharacter with result, navigate to new character page. Show error alert if validation fails.

### Integration

- `app/character/[id]/page.tsx`: Add JsonExportButton in header next to PdfExportButton
- `app/character/page.tsx`: Add JsonImportButton next to "Novo Personagem" button

### Commit

```
feat: add JSON import/export buttons to character pages
```
