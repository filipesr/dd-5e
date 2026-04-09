import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "open5e");

// ── Translation lookup tables ──────────────────────────────────────────────

const SCHOOLS: Record<string, Record<string, string>> = {
  "pt-BR": {
    abjuration: "Abjuração",
    conjuration: "Conjuração",
    divination: "Adivinhação",
    enchantment: "Encantamento",
    evocation: "Evocação",
    illusion: "Ilusão",
    necromancy: "Necromancia",
    transmutation: "Transmutação",
  },
  es: {
    abjuration: "Abjuración",
    conjuration: "Conjuración",
    divination: "Adivinación",
    enchantment: "Encantamiento",
    evocation: "Evocación",
    illusion: "Ilusión",
    necromancy: "Nigromancia",
    transmutation: "Transmutación",
  },
};

const TYPES: Record<string, Record<string, string>> = {
  "pt-BR": {
    aberration: "Aberração",
    beast: "Besta",
    celestial: "Celestial",
    construct: "Constructo",
    dragon: "Dragão",
    elemental: "Elemental",
    fey: "Feérico",
    fiend: "Corruptor",
    giant: "Gigante",
    humanoid: "Humanoide",
    monstrosity: "Monstruosidade",
    ooze: "Gosma",
    plant: "Planta",
    undead: "Morto-vivo",
    swarm: "Enxame",
  },
  es: {
    aberration: "Aberración",
    beast: "Bestia",
    celestial: "Celestial",
    construct: "Constructo",
    dragon: "Dragón",
    elemental: "Elemental",
    fey: "Feérico",
    fiend: "Infernal",
    giant: "Gigante",
    humanoid: "Humanoide",
    monstrosity: "Monstruosidad",
    ooze: "Cieno",
    plant: "Planta",
    undead: "No-muerto",
    swarm: "Enjambre",
  },
};

const SIZES: Record<string, Record<string, string>> = {
  "pt-BR": {
    Tiny: "Miúdo",
    Small: "Pequeno",
    Medium: "Médio",
    Large: "Grande",
    Huge: "Enorme",
    Gargantuan: "Colossal",
  },
  es: {
    Tiny: "Diminuto",
    Small: "Pequeño",
    Medium: "Mediano",
    Large: "Grande",
    Huge: "Enorme",
    Gargantuan: "Gargantuesco",
  },
};

const RARITIES: Record<string, Record<string, string>> = {
  "pt-BR": {
    common: "Comum",
    uncommon: "Incomum",
    rare: "Raro",
    "very rare": "Muito Raro",
    legendary: "Lendário",
    artifact: "Artefato",
  },
  es: {
    common: "Común",
    uncommon: "Poco común",
    rare: "Raro",
    "very rare": "Muy raro",
    legendary: "Legendario",
    artifact: "Artefacto",
  },
};

const COMMON_TERMS: Record<string, Record<string, string>> = {
  "pt-BR": {
    Instantaneous: "Instantâneo",
    Concentration: "Concentração",
    "1 action": "1 ação",
    "1 bonus action": "1 ação bônus",
    "1 reaction": "1 reação",
    "1 minute": "1 minuto",
    "10 minutes": "10 minutos",
    "1 hour": "1 hora",
    "8 hours": "8 horas",
    "24 hours": "24 horas",
    "Until dispelled": "Até ser dissipada",
    Self: "Pessoal",
    Touch: "Toque",
    feet: "pés",
    mile: "milha",
    miles: "milhas",
    yes: "sim",
    no: "não",
  },
  es: {
    Instantaneous: "Instantáneo",
    Concentration: "Concentración",
    "1 action": "1 acción",
    "1 bonus action": "1 acción adicional",
    "1 reaction": "1 reacción",
    "1 minute": "1 minuto",
    "10 minutes": "10 minutos",
    "1 hour": "1 hora",
    "8 hours": "8 horas",
    "24 hours": "24 horas",
    "Until dispelled": "Hasta ser disipado",
    Self: "Personal",
    Touch: "Toque",
    feet: "pies",
    mile: "milla",
    miles: "millas",
    yes: "sí",
    no: "no",
  },
};

const WEAPON_CATEGORIES: Record<string, Record<string, string>> = {
  "pt-BR": {
    "Simple Melee Weapons": "Armas Simples de Combate",
    "Simple Ranged Weapons": "Armas Simples à Distância",
    "Martial Melee Weapons": "Armas Marciais de Combate",
    "Martial Ranged Weapons": "Armas Marciais à Distância",
  },
  es: {
    "Simple Melee Weapons": "Armas Simples de Cuerpo a Cuerpo",
    "Simple Ranged Weapons": "Armas Simples a Distancia",
    "Martial Melee Weapons": "Armas Marciales de Cuerpo a Cuerpo",
    "Martial Ranged Weapons": "Armas Marciales a Distancia",
  },
};

const ARMOR_CATEGORIES: Record<string, Record<string, string>> = {
  "pt-BR": {
    "Light Armor": "Armadura Leve",
    "Medium Armor": "Armadura Média",
    "Heavy Armor": "Armadura Pesada",
    Shield: "Escudo",
  },
  es: {
    "Light Armor": "Armadura Ligera",
    "Medium Armor": "Armadura Media",
    "Heavy Armor": "Armadura Pesada",
    Shield: "Escudo",
  },
};

// ── Translation helpers ────────────────────────────────────────────────────

function translateTerm(value: string, table: Record<string, string>): string {
  // Try exact match first
  if (table[value]) return table[value];
  // Try lowercase
  if (table[value.toLowerCase()]) return table[value.toLowerCase()];
  // Try replacing common terms within the string
  let result = value;
  for (const [en, translated] of Object.entries(table)) {
    result = result.replace(new RegExp(en, "gi"), translated);
  }
  return result;
}

function translateLevel(level: string, locale: string): string {
  if (locale === "pt-BR") {
    return level
      .replace(/cantrip/i, "Truque")
      .replace(/(\d+)(st|nd|rd|th)-level/i, "$1° nível");
  }
  if (locale === "es") {
    return level
      .replace(/cantrip/i, "Truco")
      .replace(/(\d+)(st|nd|rd|th)-level/i, "nivel $1");
  }
  return level;
}

// ── File loading / saving ──────────────────────────────────────────────────

function loadJSON<T>(filename: string): T[] {
  const path = join(DATA_DIR, filename);
  if (!existsSync(path)) {
    console.warn(`[translate] File not found: ${path}`);
    return [];
  }
  return JSON.parse(readFileSync(path, "utf-8")) as T[];
}

function saveJSON(filename: string, data: unknown): void {
  const path = join(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  Saved ${path}`);
}

// ── Per-type translation logic ─────────────────────────────────────────────

type AnyRecord = Record<string, unknown>;

function translateSpells(locale: string): void {
  console.log(`\nTranslating spells → ${locale}...`);
  const spells = loadJSON<AnyRecord>("spells.json");
  const schools = SCHOOLS[locale];
  const terms = COMMON_TERMS[locale];

  const translated = spells.map((spell) => ({
    ...spell,
    school: translateTerm(spell.school as string, schools),
    duration: translateTerm(spell.duration as string, terms),
    casting_time: translateTerm(spell.casting_time as string, terms),
    range: translateTerm(spell.range as string, terms),
    concentration: translateTerm(spell.concentration as string, terms),
    level: translateLevel(spell.level as string, locale),
  }));

  const suffix = locale === "pt-BR" ? "pt" : locale;
  saveJSON(`spells-${suffix}.json`, translated);
  console.log(`  ${translated.length} spells translated.`);
}

function translateMonsters(locale: string): void {
  console.log(`\nTranslating monsters → ${locale}...`);
  const monsters = loadJSON<AnyRecord>("monsters.json");
  const types = TYPES[locale];
  const sizes = SIZES[locale];

  const translated = monsters.map((monster) => ({
    ...monster,
    type: translateTerm(monster.type as string, types),
    size: translateTerm(monster.size as string, sizes),
  }));

  const suffix = locale === "pt-BR" ? "pt" : locale;
  saveJSON(`monsters-${suffix}.json`, translated);
  console.log(`  ${translated.length} monsters translated.`);
}

function translateItems(locale: string): void {
  console.log(`\nTranslating items → ${locale}...`);
  const items = loadJSON<AnyRecord>("items.json");
  const rarities = RARITIES[locale];

  const translated = items.map((item) => ({
    ...item,
    rarity: translateTerm(item.rarity as string, rarities),
  }));

  const suffix = locale === "pt-BR" ? "pt" : locale;
  saveJSON(`items-${suffix}.json`, translated);
  console.log(`  ${translated.length} items translated.`);
}

function translateWeapons(locale: string): void {
  console.log(`\nTranslating weapons → ${locale}...`);
  const weapons = loadJSON<AnyRecord>("weapons.json");
  const categories = WEAPON_CATEGORIES[locale];

  const translated = weapons.map((weapon) => ({
    ...weapon,
    category: weapon.category
      ? translateTerm(weapon.category as string, categories)
      : weapon.category,
  }));

  const suffix = locale === "pt-BR" ? "pt" : locale;
  saveJSON(`weapons-${suffix}.json`, translated);
  console.log(`  ${translated.length} weapons translated.`);
}

function translateArmor(locale: string): void {
  console.log(`\nTranslating armor → ${locale}...`);
  const armor = loadJSON<AnyRecord>("armor.json");
  const categories = ARMOR_CATEGORIES[locale];

  const translated = armor.map((item) => ({
    ...item,
    category: item.category
      ? translateTerm(item.category as string, categories)
      : item.category,
  }));

  const suffix = locale === "pt-BR" ? "pt" : locale;
  saveJSON(`armor-${suffix}.json`, translated);
  console.log(`  ${translated.length} armor pieces translated.`);
}

// ── Main ───────────────────────────────────────────────────────────────────

const LOCALES = ["pt-BR", "es"];

console.log("=== Open5e Translation Script ===");
console.log(`Data directory: ${DATA_DIR}\n`);

for (const locale of LOCALES) {
  console.log(`\n--- Processing locale: ${locale} ---`);
  translateSpells(locale);
  translateMonsters(locale);
  translateItems(locale);
  translateWeapons(locale);
  translateArmor(locale);
}

console.log("\n=== Translation complete! ===");
