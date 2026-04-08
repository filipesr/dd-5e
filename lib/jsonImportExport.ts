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

export function validateCharacterJSON(
  data: unknown
): { valid: true; character: Character } | { valid: false; error: string } {
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

  if (typeof charData.name !== "string" || !charData.name)
    return { valid: false, error: "Nome obrigatorio" };
  if (!RACES.includes(charData.race as any))
    return { valid: false, error: `Raca invalida: ${charData.race}` };
  if (!CLASSES.includes(charData.class as any))
    return { valid: false, error: `Classe invalida: ${charData.class}` };
  if (!ALIGNMENTS.includes(charData.alignment as any))
    return { valid: false, error: "Alinhamento invalido" };

  const level = Number(charData.level);
  if (!level || level < 1 || level > 20) return { valid: false, error: "Nivel deve ser 1-20" };

  const attrs = charData.attributes as Record<string, number> | undefined;
  if (!attrs) return { valid: false, error: "Atributos obrigatorios" };
  for (const attr of ATTRIBUTES) {
    if (typeof attrs[attr] !== "number") return { valid: false, error: `Atributo ${attr} faltando` };
  }

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
