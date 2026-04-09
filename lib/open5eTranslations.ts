/**
 * D&D 5e metadata translation lookup tables.
 * These are exported for use in both server components (direct import) and
 * client components (import without Node.js fs usage).
 */

import type { Locale } from "@/lib/i18n/types";

export const SCHOOLS: Record<Locale, Record<string, string>> = {
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
  en: {},
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

export const TYPES: Record<Locale, Record<string, string>> = {
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
  en: {},
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

export const SIZES: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    Tiny: "Miúdo",
    Small: "Pequeno",
    Medium: "Médio",
    Large: "Grande",
    Huge: "Enorme",
    Gargantuan: "Colossal",
  },
  en: {},
  es: {
    Tiny: "Diminuto",
    Small: "Pequeño",
    Medium: "Mediano",
    Large: "Grande",
    Huge: "Enorme",
    Gargantuan: "Gargantuesco",
  },
};

export const RARITIES: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    common: "Comum",
    uncommon: "Incomum",
    rare: "Raro",
    "very rare": "Muito Raro",
    legendary: "Lendário",
    artifact: "Artefato",
  },
  en: {},
  es: {
    common: "Común",
    uncommon: "Poco común",
    rare: "Raro",
    "very rare": "Muy raro",
    legendary: "Legendario",
    artifact: "Artefacto",
  },
};

export const COMMON_TERMS: Record<Locale, Record<string, string>> = {
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
  en: {},
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

/**
 * Translate a single metadata term using a lookup table.
 * Falls back to the original value if no translation is found.
 */
export function translateTerm(
  value: string,
  table: Record<string, string>
): string {
  if (!value) return value;
  // Try exact match first
  if (table[value]) return table[value];
  // Try lowercase
  if (table[value.toLowerCase()]) return table[value.toLowerCase()];
  // Try replacing known terms within the string
  let result = value;
  for (const [en, translated] of Object.entries(table)) {
    result = result.replace(new RegExp(en, "gi"), translated);
  }
  return result;
}

/**
 * Translate a spell level string to the target locale.
 * e.g. "4th-level" → "4° nível" (pt-BR) / "nivel 4" (es)
 */
export function translateLevel(level: string, locale: Locale): string {
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
