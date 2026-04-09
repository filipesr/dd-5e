import { exportCharacterToJSON, validateCharacterJSON, importCharacterFromJSON } from "@/lib/jsonImportExport";
import type { Character } from "@/types/dnd5e";

const mockCharacter: Character = {
  id: "test-id-123",
  name: "Thorin Ironforge",
  race: "dwarf",
  class: "fighter",
  level: 5,
  background: "Soldier",
  alignment: "lawful-good",
  xp: 6500,
  attributes: { str: 16, dex: 12, con: 15, int: 10, wis: 11, cha: 8 },
  hp: { max: 52, current: 52, temporary: 0 },
  ac: 18,
  initiative: 1,
  speed: 25,
  skillProficiencies: { athletics: "proficient", intimidation: "proficient" },
  savingThrowProficiencies: ["str", "con"],
  attacks: [
    {
      id: "attack-1",
      name: "Battleaxe",
      attackBonus: 6,
      damage: "1d8+3",
      damageType: "slashing",
    },
  ],
  spellSlots: {},
  spells: {},
  spellcastingAbility: null,
  conditions: [],
  hitDice: { dieType: 10, total: 5, used: 0 },
  deathSaves: { successes: 0, failures: 0 },
  inventory: [],
  coins: { cp: 0, sp: 50, ep: 0, gp: 100, pp: 0 },
  inspiration: false,
  traits: { personality: "Brave", ideals: "Honor", bonds: "My clan", flaws: "Stubborn" },
  notes: { appearance: "Stocky dwarf", backstory: "Veteran soldier", allies: "", freeNotes: "" },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

// Blob may not be available globally in all Jest environments; use Node's buffer Blob if needed
const BlobImpl: typeof Blob =
  typeof globalThis.Blob !== "undefined" ? globalThis.Blob : (require("buffer").Blob as typeof Blob);

describe("exportCharacterToJSON", () => {
  it("creates a Blob with application/json type", () => {
    const blob = exportCharacterToJSON(mockCharacter);
    expect(blob).toBeInstanceOf(BlobImpl);
    expect(blob.type).toBe("application/json");
  });

  it("blob contains valid JSON with version wrapper", async () => {
    const blob = exportCharacterToJSON(mockCharacter);
    const text = await blob.text();
    const parsed = JSON.parse(text);
    expect(parsed.version).toBe(1);
    expect(parsed.source).toBe("dd5e-toolkit");
    expect(parsed.exportedAt).toBeDefined();
    expect(parsed.character.name).toBe(mockCharacter.name);
  });
});

describe("validateCharacterJSON", () => {
  it("accepts valid wrapped data (version + character)", () => {
    const wrapped = {
      version: 1,
      exportedAt: new Date().toISOString(),
      source: "dd5e-toolkit",
      character: mockCharacter,
    };
    const result = validateCharacterJSON(wrapped);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.character.name).toBe(mockCharacter.name);
    }
  });

  it("accepts raw Character data (no wrapper)", () => {
    const result = validateCharacterJSON(mockCharacter);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.character.name).toBe(mockCharacter.name);
    }
  });

  it("rejects null/non-object", () => {
    const result = validateCharacterJSON(null);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("JSON invalido");
    }
  });

  it("rejects missing name (wrapped format)", () => {
    const { name: _name, ...noName } = mockCharacter;
    const wrapped = { version: 1, exportedAt: new Date().toISOString(), source: "dd5e-toolkit", character: noName };
    const result = validateCharacterJSON(wrapped);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("Nome obrigatorio");
    }
  });

  it("rejects empty name (wrapped format)", () => {
    const wrapped = {
      version: 1,
      exportedAt: new Date().toISOString(),
      source: "dd5e-toolkit",
      character: { ...mockCharacter, name: "" },
    };
    const result = validateCharacterJSON(wrapped);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("Nome obrigatorio");
    }
  });

  it("rejects invalid race", () => {
    const result = validateCharacterJSON({ ...mockCharacter, race: "orc" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Raca invalida");
    }
  });

  it("rejects invalid class", () => {
    const result = validateCharacterJSON({ ...mockCharacter, class: "necromancer" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Classe invalida");
    }
  });

  it("rejects invalid alignment", () => {
    const result = validateCharacterJSON({ ...mockCharacter, alignment: "chaotic-stupid" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("Alinhamento invalido");
    }
  });

  it("rejects level 0", () => {
    const result = validateCharacterJSON({ ...mockCharacter, level: 0 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("Nivel deve ser 1-20");
    }
  });

  it("rejects level 21", () => {
    const result = validateCharacterJSON({ ...mockCharacter, level: 21 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("Nivel deve ser 1-20");
    }
  });

  it("rejects missing attributes", () => {
    const { attributes: _attrs, ...noAttrs } = mockCharacter;
    const result = validateCharacterJSON(noAttrs);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("Atributos obrigatorios");
    }
  });

  it("rejects attributes with missing key", () => {
    const { str: _str, ...partialAttrs } = mockCharacter.attributes;
    const result = validateCharacterJSON({ ...mockCharacter, attributes: partialAttrs });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("faltando");
    }
  });

  it("generates new id different from input", () => {
    const result = validateCharacterJSON(mockCharacter);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.character.id).not.toBe(mockCharacter.id);
    }
  });

  it("sets new createdAt and updatedAt", () => {
    const result = validateCharacterJSON(mockCharacter);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.character.createdAt).not.toBe(mockCharacter.createdAt);
      expect(result.character.updatedAt).not.toBe(mockCharacter.updatedAt);
    }
  });

  it("rejects unrecognized format (no name/race/class and no version wrapper)", () => {
    const result = validateCharacterJSON({ foo: "bar" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("Formato nao reconhecido");
    }
  });
});

describe("importCharacterFromJSON", () => {
  it("parses a wrapped JSON file and returns a Character", async () => {
    const wrapped = {
      version: 1,
      exportedAt: new Date().toISOString(),
      source: "dd5e-toolkit",
      character: mockCharacter,
    };
    const file = new File([JSON.stringify(wrapped)], "character.json", { type: "application/json" });
    const character = await importCharacterFromJSON(file);
    expect(character.name).toBe(mockCharacter.name);
    expect(character.id).not.toBe(mockCharacter.id);
  });

  it("throws on invalid JSON content", async () => {
    const invalid = { foo: "bar" };
    const file = new File([JSON.stringify(invalid)], "invalid.json", { type: "application/json" });
    await expect(importCharacterFromJSON(file)).rejects.toThrow("Formato nao reconhecido");
  });

  it("throws on malformed JSON", async () => {
    const file = new File(["not valid json {{{"], "bad.json", { type: "application/json" });
    await expect(importCharacterFromJSON(file)).rejects.toThrow();
  });
});
