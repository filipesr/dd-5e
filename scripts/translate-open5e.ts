/**
 * Translate Open5e data to PT-BR and ES.
 * Translates ALL text fields: metadata, descriptions, actions, senses, etc.
 * Run: npm run translate-data
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "open5e");

// ══════════════════════════════════════════════════════════════════════════════
// TRANSLATION TABLES — D&D 5e mechanical terms
// ══════════════════════════════════════════════════════════════════════════════

// Order matters: longer phrases first to avoid partial replacements
function buildGameTerms(locale: "pt-BR" | "es"): [RegExp, string][] {
  const terms: [string, string][] = locale === "pt-BR" ? [
    // ── Damage types ──
    ["slashing damage", "dano cortante"], ["piercing damage", "dano perfurante"],
    ["bludgeoning damage", "dano contundente"], ["fire damage", "dano de fogo"],
    ["cold damage", "dano de frio"], ["lightning damage", "dano de relâmpago"],
    ["thunder damage", "dano de trovão"], ["poison damage", "dano de veneno"],
    ["acid damage", "dano de ácido"], ["necrotic damage", "dano necrótico"],
    ["radiant damage", "dano radiante"], ["force damage", "dano de força"],
    ["psychic damage", "dano psíquico"],
    // Damage types standalone
    ["slashing", "cortante"], ["piercing", "perfurante"], ["bludgeoning", "contundente"],
    ["fire", "fogo"], ["cold", "frio"], ["lightning", "relâmpago"],
    ["thunder", "trovão"], ["poison", "veneno"], ["acid", "ácido"],
    ["necrotic", "necrótico"], ["radiant", "radiante"], ["force", "força"],
    ["psychic", "psíquico"],
    // ── Conditions ──
    ["frightened", "amedrontado"], ["blinded", "cego"], ["charmed", "enfeitiçado"],
    ["deafened", "surdo"], ["grappled", "agarrado"], ["incapacitated", "incapacitado"],
    ["invisible", "invisível"], ["paralyzed", "paralisado"], ["petrified", "petrificado"],
    ["poisoned", "envenenado"], ["prone", "prostrado"], ["stunned", "atordoado"],
    ["restrained", "imobilizado"], ["unconscious", "inconsciente"],
    ["exhaustion", "exaustão"],
    // ── Saving throws ──
    ["Strength saving throw", "teste de resistência de Força"],
    ["Dexterity saving throw", "teste de resistência de Destreza"],
    ["Constitution saving throw", "teste de resistência de Constituição"],
    ["Intelligence saving throw", "teste de resistência de Inteligência"],
    ["Wisdom saving throw", "teste de resistência de Sabedoria"],
    ["Charisma saving throw", "teste de resistência de Carisma"],
    ["saving throw", "teste de resistência"],
    // ── Ability checks ──
    ["Strength check", "teste de Força"], ["Dexterity check", "teste de Destreza"],
    ["Constitution check", "teste de Constituição"], ["Intelligence check", "teste de Inteligência"],
    ["Wisdom check", "teste de Sabedoria"], ["Charisma check", "teste de Carisma"],
    ["ability check", "teste de habilidade"],
    // ── Attributes ──
    ["Strength", "Força"], ["Dexterity", "Destreza"], ["Constitution", "Constituição"],
    ["Intelligence", "Inteligência"], ["Wisdom", "Sabedoria"], ["Charisma", "Carisma"],
    // ── Skills ──
    ["Perception", "Percepção"], ["Stealth", "Furtividade"], ["Athletics", "Atletismo"],
    ["Acrobatics", "Acrobacia"], ["Arcana", "Arcanismo"], ["Deception", "Enganação"],
    ["History", "História"], ["Insight", "Intuição"], ["Intimidation", "Intimidação"],
    ["Investigation", "Investigação"], ["Medicine", "Medicina"], ["Nature", "Natureza"],
    ["Performance", "Atuação"], ["Persuasion", "Persuasão"], ["Religion", "Religião"],
    ["Sleight of Hand", "Prestidigitação"], ["Survival", "Sobrevivência"],
    ["Animal Handling", "Adestrar Animais"],
    // ── Senses ──
    ["darkvision", "visão no escuro"], ["blindsight", "visão cega"],
    ["tremorsense", "sentido sísmico"], ["truesight", "visão verdadeira"],
    ["passive Perception", "Percepção passiva"],
    // ── Languages ──
    ["understands", "entende"], ["but can't speak", "mas não pode falar"],
    ["all languages", "todos os idiomas"], ["telepathy", "telepatia"],
    ["Common", "Comum"], ["Dwarvish", "Anão"], ["Elvish", "Élfico"],
    ["Giant", "Gigante"], ["Gnomish", "Gnômico"], ["Goblin", "Goblin"],
    ["Halfling", "Halfling"], ["Orc", "Orc"], ["Abyssal", "Abissal"],
    ["Celestial", "Celestial"], ["Draconic", "Dracônico"], ["Deep Speech", "Fala Profunda"],
    ["Infernal", "Infernal"], ["Primordial", "Primordial"], ["Sylvan", "Silvestre"],
    ["Undercommon", "Subcomum"], ["Auran", "Auran"], ["Aquan", "Aquan"],
    ["Ignan", "Ignan"], ["Terran", "Terran"],
    // ── Combat mechanics ──
    ["Hit:", "Acerto:"], ["hit points", "pontos de vida"], ["hit point", "ponto de vida"],
    ["Armor Class", "Classe de Armadura"], ["armor class", "classe de armadura"],
    ["spell attack", "ataque mágico"], ["melee weapon attack", "ataque corpo a corpo com arma"],
    ["ranged weapon attack", "ataque à distância com arma"],
    ["melee spell attack", "ataque mágico corpo a corpo"],
    ["ranged spell attack", "ataque mágico à distância"],
    ["melee attack", "ataque corpo a corpo"], ["ranged attack", "ataque à distância"],
    ["attack roll", "jogada de ataque"], ["damage roll", "jogada de dano"],
    ["to hit", "para acertar"], ["reach", "alcance"],
    ["one target", "um alvo"], ["one creature", "uma criatura"],
    ["each creature", "cada criatura"], ["all creatures", "todas as criaturas"],
    // ── Actions ──
    ["Multiattack", "Ataque Múltiplo"], ["multiattack", "ataque múltiplo"],
    ["bonus action", "ação bônus"], ["reaction", "reação"],
    ["opportunity attack", "ataque de oportunidade"],
    ["at the start of", "no início de"], ["at the end of", "no final de"],
    ["each of its turns", "cada um de seus turnos"],
    ["on a failed save", "em uma falha no teste"], ["on a successful save", "em um sucesso no teste"],
    ["on a success", "em um sucesso"], ["on a failure", "em uma falha"],
    // ── Distances & time ──
    ["feet", "pés"], ["foot", "pé"], ["mile", "milha"], ["miles", "milhas"],
    ["Instantaneous", "Instantâneo"], ["Concentration", "Concentração"],
    ["round", "rodada"], ["rounds", "rodadas"],
    ["minute", "minuto"], ["minutes", "minutos"],
    ["hour", "hora"], ["hours", "horas"],
    ["day", "dia"], ["days", "dias"],
    // ── Spell terms ──
    ["spell slot", "espaço de magia"], ["spell slots", "espaços de magia"],
    ["cantrip", "truque"], ["ritual", "ritual"],
    ["concentration", "concentração"],
    ["material component", "componente material"],
    ["verbal component", "componente verbal"],
    ["somatic component", "componente somático"],
    ["spell save DC", "CD de resistência à magia"],
    ["DC", "CD"],
    // ── Creature terms ──
    ["creature", "criatura"], ["creatures", "criaturas"],
    ["target", "alvo"], ["targets", "alvos"],
    ["ally", "aliado"], ["allies", "aliados"],
    ["enemy", "inimigo"], ["enemies", "inimigos"],
    // ── Rest ──
    ["long rest", "descanso longo"], ["short rest", "descanso curto"],
    ["short or long rest", "descanso curto ou longo"],
    // ── Movement ──
    ["flying", "voando"], ["swimming", "nadando"], ["climbing", "escalando"],
    ["burrowing", "escavando"], ["walking", "andando"],
    ["Speed", "Deslocamento"], ["speed", "deslocamento"],
    // ── Weapon properties ──
    ["versatile", "versátil"], ["two-handed", "duas mãos"],
    ["light", "leve"], ["heavy", "pesada"], ["finesse", "acuidade"],
    ["thrown", "arremesso"], ["loading", "munição"], ["ammunition", "munição"],
    ["reach", "alcance"], ["special", "especial"],
    ["double-headed", "dupla cabeça"],
    // ── General ──
    ["advantage", "vantagem"], ["disadvantage", "desvantagem"],
    ["proficiency", "proficiência"], ["proficient", "proficiente"],
    ["half damage", "metade do dano"], ["the damage", "o dano"],
    ["takes", "recebe"], ["deals", "causa"],
    ["must succeed on", "deve ter sucesso em"], ["must make", "deve fazer"],
    ["or be", "ou ficar"], ["or take", "ou receber"],
    ["for 1 minute", "por 1 minuto"],
    ["until the end of its next turn", "até o final de seu próximo turno"],
    ["at the start of each of its turns", "no início de cada um de seus turnos"],
    ["repeat the saving throw", "repetir o teste de resistência"],
    ["nonmagical attacks", "ataques não mágicos"],
    ["magical", "mágico"], ["nonmagical", "não mágico"],
  ] : [
    // ── ES: Damage types ──
    ["slashing damage", "daño cortante"], ["piercing damage", "daño perforante"],
    ["bludgeoning damage", "daño contundente"], ["fire damage", "daño de fuego"],
    ["cold damage", "daño de frío"], ["lightning damage", "daño de rayo"],
    ["thunder damage", "daño de trueno"], ["poison damage", "daño de veneno"],
    ["acid damage", "daño de ácido"], ["necrotic damage", "daño necrótico"],
    ["radiant damage", "daño radiante"], ["force damage", "daño de fuerza"],
    ["psychic damage", "daño psíquico"],
    ["slashing", "cortante"], ["piercing", "perforante"], ["bludgeoning", "contundente"],
    ["fire", "fuego"], ["cold", "frío"], ["lightning", "rayo"],
    ["thunder", "trueno"], ["poison", "veneno"], ["acid", "ácido"],
    ["necrotic", "necrótico"], ["radiant", "radiante"], ["force", "fuerza"],
    ["psychic", "psíquico"],
    // ── ES: Conditions ──
    ["frightened", "asustado"], ["blinded", "cegado"], ["charmed", "hechizado"],
    ["deafened", "ensordecido"], ["grappled", "agarrado"], ["incapacitated", "incapacitado"],
    ["invisible", "invisible"], ["paralyzed", "paralizado"], ["petrified", "petrificado"],
    ["poisoned", "envenenado"], ["prone", "derribado"], ["stunned", "aturdido"],
    ["restrained", "apresado"], ["unconscious", "inconsciente"],
    ["exhaustion", "agotamiento"],
    // ── ES: Saving throws ──
    ["Strength saving throw", "tirada de salvación de Fuerza"],
    ["Dexterity saving throw", "tirada de salvación de Destreza"],
    ["Constitution saving throw", "tirada de salvación de Constitución"],
    ["Intelligence saving throw", "tirada de salvación de Inteligencia"],
    ["Wisdom saving throw", "tirada de salvación de Sabiduría"],
    ["Charisma saving throw", "tirada de salvación de Carisma"],
    ["saving throw", "tirada de salvación"],
    // ── ES: Attributes ──
    ["Strength", "Fuerza"], ["Dexterity", "Destreza"], ["Constitution", "Constitución"],
    ["Intelligence", "Inteligencia"], ["Wisdom", "Sabiduría"], ["Charisma", "Carisma"],
    // ── ES: Skills ──
    ["Perception", "Percepción"], ["Stealth", "Sigilo"], ["Athletics", "Atletismo"],
    ["Acrobatics", "Acrobacias"], ["Arcana", "Arcanos"], ["Deception", "Engaño"],
    ["History", "Historia"], ["Insight", "Perspicacia"], ["Intimidation", "Intimidación"],
    ["Investigation", "Investigación"], ["Medicine", "Medicina"], ["Nature", "Naturaleza"],
    ["Performance", "Interpretación"], ["Persuasion", "Persuasión"], ["Religion", "Religión"],
    ["Sleight of Hand", "Juego de Manos"], ["Survival", "Supervivencia"],
    ["Animal Handling", "Trato con Animales"],
    // ── ES: Senses ──
    ["darkvision", "visión en la oscuridad"], ["blindsight", "vista ciega"],
    ["tremorsense", "sentido de temblor"], ["truesight", "vista verdadera"],
    ["passive Perception", "Percepción pasiva"],
    // ── ES: Languages ──
    ["understands", "entiende"], ["but can't speak", "pero no puede hablar"],
    ["all languages", "todos los idiomas"], ["telepathy", "telepatía"],
    ["Common", "Común"], ["Dwarvish", "Enano"], ["Elvish", "Élfico"],
    ["Giant", "Gigante"], ["Gnomish", "Gnomo"], ["Abyssal", "Abisal"],
    ["Celestial", "Celestial"], ["Draconic", "Dracónico"], ["Deep Speech", "Habla Profunda"],
    ["Infernal", "Infernal"], ["Primordial", "Primordial"], ["Sylvan", "Silvano"],
    ["Undercommon", "Infracomún"],
    // ── ES: Combat ──
    ["Hit:", "Impacto:"], ["hit points", "puntos de golpe"], ["hit point", "punto de golpe"],
    ["Armor Class", "Clase de Armadura"], ["spell attack", "ataque de conjuro"],
    ["melee weapon attack", "ataque cuerpo a cuerpo con arma"],
    ["ranged weapon attack", "ataque a distancia con arma"],
    ["melee spell attack", "ataque de conjuro cuerpo a cuerpo"],
    ["ranged spell attack", "ataque de conjuro a distancia"],
    ["melee attack", "ataque cuerpo a cuerpo"], ["ranged attack", "ataque a distancia"],
    ["attack roll", "tirada de ataque"], ["damage roll", "tirada de daño"],
    ["to hit", "para impactar"], ["reach", "alcance"],
    ["one target", "un objetivo"], ["one creature", "una criatura"],
    ["each creature", "cada criatura"], ["all creatures", "todas las criaturas"],
    // ── ES: Actions ──
    ["Multiattack", "Ataque Múltiple"], ["bonus action", "acción adicional"],
    ["reaction", "reacción"], ["opportunity attack", "ataque de oportunidad"],
    ["on a failed save", "en una salvación fallida"], ["on a successful save", "en una salvación exitosa"],
    ["on a success", "en un éxito"], ["on a failure", "en un fallo"],
    // ── ES: Distances ──
    ["feet", "pies"], ["foot", "pie"], ["mile", "milla"], ["miles", "millas"],
    ["Instantaneous", "Instantáneo"], ["Concentration", "Concentración"],
    ["round", "ronda"], ["rounds", "rondas"],
    ["minute", "minuto"], ["minutes", "minutos"],
    ["hour", "hora"], ["hours", "horas"],
    // ── ES: Spell terms ──
    ["spell slot", "espacio de conjuro"], ["spell slots", "espacios de conjuro"],
    ["cantrip", "truco"], ["concentration", "concentración"],
    ["spell save DC", "CD de salvación del conjuro"], ["DC", "CD"],
    // ── ES: Creature ──
    ["creature", "criatura"], ["creatures", "criaturas"],
    ["target", "objetivo"], ["targets", "objetivos"],
    ["ally", "aliado"], ["allies", "aliados"],
    ["enemy", "enemigo"], ["enemies", "enemigos"],
    // ── ES: Rest ──
    ["long rest", "descanso largo"], ["short rest", "descanso corto"],
    // ── ES: Movement ──
    ["flying", "volando"], ["swimming", "nadando"], ["climbing", "escalando"],
    ["Speed", "Velocidad"], ["speed", "velocidad"],
    // ── ES: Weapon properties ──
    ["versatile", "versátil"], ["two-handed", "a dos manos"],
    ["light", "ligera"], ["heavy", "pesada"], ["finesse", "sutil"],
    ["thrown", "arrojadiza"], ["ammunition", "munición"],
    ["double-headed", "doble cabeza"],
    // ── ES: General ──
    ["advantage", "ventaja"], ["disadvantage", "desventaja"],
    ["proficiency", "competencia"],
    ["half damage", "la mitad del daño"], ["the damage", "el daño"],
    ["takes", "recibe"], ["deals", "causa"],
    ["must succeed on", "debe tener éxito en"], ["must make", "debe realizar"],
    ["nonmagical attacks", "ataques no mágicos"],
    ["magical", "mágico"], ["nonmagical", "no mágico"],
  ];

  // Build regexes with word boundaries, longer phrases first
  return terms.map(([en, tr]) => [new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi"), tr]);
}

// ── Metadata-only tables (exact match) ──
const SCHOOLS: Record<string, Record<string, string>> = {
  "pt-BR": { abjuration:"Abjuração", conjuration:"Conjuração", divination:"Adivinhação", enchantment:"Encantamento", evocation:"Evocação", illusion:"Ilusão", necromancy:"Necromancia", transmutation:"Transmutação" },
  es: { abjuration:"Abjuración", conjuration:"Conjuración", divination:"Adivinación", enchantment:"Encantamiento", evocation:"Evocación", illusion:"Ilusión", necromancy:"Nigromancia", transmutation:"Transmutación" },
};
const TYPES: Record<string, Record<string, string>> = {
  "pt-BR": { aberration:"Aberração", beast:"Besta", celestial:"Celestial", construct:"Constructo", dragon:"Dragão", elemental:"Elemental", fey:"Feérico", fiend:"Corruptor", giant:"Gigante", humanoid:"Humanoide", monstrosity:"Monstruosidade", ooze:"Gosma", plant:"Planta", undead:"Morto-vivo", swarm:"Enxame" },
  es: { aberration:"Aberración", beast:"Bestia", celestial:"Celestial", construct:"Constructo", dragon:"Dragón", elemental:"Elemental", fey:"Feérico", fiend:"Infernal", giant:"Gigante", humanoid:"Humanoide", monstrosity:"Monstruosidad", ooze:"Cieno", plant:"Planta", undead:"No-muerto", swarm:"Enjambre" },
};
const SIZES: Record<string, Record<string, string>> = {
  "pt-BR": { Tiny:"Miúdo", Small:"Pequeno", Medium:"Médio", Large:"Grande", Huge:"Enorme", Gargantuan:"Colossal" },
  es: { Tiny:"Diminuto", Small:"Pequeño", Medium:"Mediano", Large:"Grande", Huge:"Enorme", Gargantuan:"Gargantuesco" },
};
const RARITIES: Record<string, Record<string, string>> = {
  "pt-BR": { common:"Comum", uncommon:"Incomum", rare:"Raro", "very rare":"Muito Raro", legendary:"Lendário", artifact:"Artefato" },
  es: { common:"Común", uncommon:"Poco común", rare:"Raro", "very rare":"Muy raro", legendary:"Legendario", artifact:"Artefacto" },
};
const COMMON_TERMS: Record<string, Record<string, string>> = {
  "pt-BR": { Instantaneous:"Instantâneo", "1 action":"1 ação", "1 bonus action":"1 ação bônus", "1 reaction":"1 reação", "1 minute":"1 minuto", "10 minutes":"10 minutos", "1 hour":"1 hora", "8 hours":"8 horas", "24 hours":"24 horas", "Until dispelled":"Até ser dissipada", Self:"Pessoal", Touch:"Toque", yes:"sim", no:"não" },
  es: { Instantaneous:"Instantáneo", "1 action":"1 acción", "1 bonus action":"1 acción adicional", "1 reaction":"1 reacción", "1 minute":"1 minuto", "10 minutes":"10 minutos", "1 hour":"1 hora", "8 hours":"8 horas", "24 hours":"24 horas", "Until dispelled":"Hasta ser disipado", Self:"Personal", Touch:"Toque", yes:"sí", no:"no" },
};
const WEAPON_CATEGORIES: Record<string, Record<string, string>> = {
  "pt-BR": { "Simple Melee Weapons":"Armas Simples Corpo a Corpo", "Simple Ranged Weapons":"Armas Simples à Distância", "Martial Melee Weapons":"Armas Marciais Corpo a Corpo", "Martial Ranged Weapons":"Armas Marciais à Distância" },
  es: { "Simple Melee Weapons":"Armas Simples Cuerpo a Cuerpo", "Simple Ranged Weapons":"Armas Simples a Distancia", "Martial Melee Weapons":"Armas Marciales Cuerpo a Cuerpo", "Martial Ranged Weapons":"Armas Marciales a Distancia" },
};
const ARMOR_CATEGORIES: Record<string, Record<string, string>> = {
  "pt-BR": { "Light Armor":"Armadura Leve", "Medium Armor":"Armadura Média", "Heavy Armor":"Armadura Pesada", Shield:"Escudo" },
  es: { "Light Armor":"Armadura Ligera", "Medium Armor":"Armadura Media", "Heavy Armor":"Armadura Pesada", Shield:"Escudo" },
};

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function translateExact(value: string, table: Record<string, string>): string {
  return table[value] ?? table[value.toLowerCase()] ?? value;
}

function translateText(text: string, rules: [RegExp, string][]): string {
  let result = text;
  for (const [re, replacement] of rules) {
    result = result.replace(re, replacement);
  }
  return result;
}

function translateLevel(level: string, locale: string): string {
  if (locale === "pt-BR") return level.replace(/cantrip/i, "Truque").replace(/(\d+)(st|nd|rd|th)-level/i, "$1° nível");
  if (locale === "es") return level.replace(/cantrip/i, "Truco").replace(/(\d+)(st|nd|rd|th)-level/i, "nivel $1");
  return level;
}

type AnyRecord = Record<string, unknown>;

function loadJSON<T>(filename: string): T[] {
  const path = join(DATA_DIR, filename);
  if (!existsSync(path)) { console.warn(`  Not found: ${path}`); return []; }
  return JSON.parse(readFileSync(path, "utf-8")) as T[];
}

function saveJSON(filename: string, data: unknown): void {
  const path = join(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  Saved ${path}`);
}

function suffix(locale: string): string {
  return locale === "pt-BR" ? "pt" : locale;
}

// Translate string or array-of-objects fields
function tr(val: unknown, rules: [RegExp, string][]): unknown {
  if (typeof val === "string") return translateText(val, rules);
  if (Array.isArray(val)) return val.map((item) => {
    if (typeof item === "string") return translateText(item, rules);
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      const result: Record<string, unknown> = { ...obj };
      if (typeof obj.name === "string") result.name = translateText(obj.name, rules);
      if (typeof obj.desc === "string") result.desc = translateText(obj.desc, rules);
      return result;
    }
    return item;
  });
  return val;
}

// ══════════════════════════════════════════════════════════════════════════════
// PER-TYPE TRANSLATION
// ══════════════════════════════════════════════════════════════════════════════

function translateSpells(locale: "pt-BR" | "es"): void {
  console.log(`\nTranslating spells → ${locale}...`);
  const spells = loadJSON<AnyRecord>("spells.json");
  const rules = buildGameTerms(locale);
  const schools = SCHOOLS[locale];
  const terms = COMMON_TERMS[locale];

  const translated = spells.map((s) => ({
    ...s,
    school: translateExact(s.school as string, schools),
    duration: translateExact(s.duration as string, terms) || translateText(s.duration as string, rules),
    casting_time: translateExact(s.casting_time as string, terms) || translateText(s.casting_time as string, rules),
    range: translateExact(s.range as string, terms) || translateText(s.range as string, rules),
    concentration: translateExact(s.concentration as string, terms),
    level: translateLevel(s.level as string, locale),
    desc: translateText(s.desc as string, rules),
    higher_level: s.higher_level ? translateText(s.higher_level as string, rules) : s.higher_level,
    material: s.material ? translateText(s.material as string, rules) : s.material,
  }));

  saveJSON(`spells-${suffix(locale)}.json`, translated);
  console.log(`  ${translated.length} spells translated.`);
}

function translateMonsters(locale: "pt-BR" | "es"): void {
  console.log(`\nTranslating monsters → ${locale}...`);
  const monsters = loadJSON<AnyRecord>("monsters.json");
  const rules = buildGameTerms(locale);
  const types = TYPES[locale];
  const sizes = SIZES[locale];

  const translated = monsters.map((m) => ({
    ...m,
    type: translateExact(m.type as string, types),
    size: translateExact(m.size as string, sizes),
    desc: m.desc ? translateText(m.desc as string, rules) : m.desc,
    senses: m.senses ? translateText(m.senses as string, rules) : m.senses,
    languages: m.languages ? translateText(m.languages as string, rules) : m.languages,
    damage_vulnerabilities: m.damage_vulnerabilities ? translateText(m.damage_vulnerabilities as string, rules) : m.damage_vulnerabilities,
    damage_resistances: m.damage_resistances ? translateText(m.damage_resistances as string, rules) : m.damage_resistances,
    damage_immunities: m.damage_immunities ? translateText(m.damage_immunities as string, rules) : m.damage_immunities,
    condition_immunities: m.condition_immunities ? translateText(m.condition_immunities as string, rules) : m.condition_immunities,
    actions: tr(m.actions, rules),
    reactions: tr(m.reactions, rules),
    legendary_actions: tr(m.legendary_actions, rules),
    special_abilities: tr(m.special_abilities, rules),
  }));

  saveJSON(`monsters-${suffix(locale)}.json`, translated);
  console.log(`  ${translated.length} monsters translated.`);
}

function translateItems(locale: "pt-BR" | "es"): void {
  console.log(`\nTranslating items → ${locale}...`);
  const items = loadJSON<AnyRecord>("items.json");
  const rules = buildGameTerms(locale);
  const rarities = RARITIES[locale];

  const translated = items.map((i) => ({
    ...i,
    rarity: translateExact(i.rarity as string, rarities),
    desc: i.desc ? translateText(i.desc as string, rules) : i.desc,
  }));

  saveJSON(`items-${suffix(locale)}.json`, translated);
  console.log(`  ${translated.length} items translated.`);
}

function translateWeapons(locale: "pt-BR" | "es"): void {
  console.log(`\nTranslating weapons → ${locale}...`);
  const weapons = loadJSON<AnyRecord>("weapons.json");
  const rules = buildGameTerms(locale);
  const categories = WEAPON_CATEGORIES[locale];

  const translated = weapons.map((w) => ({
    ...w,
    category: w.category ? translateExact(w.category as string, categories) : w.category,
    damage_type: w.damage_type ? translateText(w.damage_type as string, rules) : w.damage_type,
    properties: Array.isArray(w.properties) ? (w.properties as string[]).map((p) => translateText(p, rules)) : w.properties,
  }));

  saveJSON(`weapons-${suffix(locale)}.json`, translated);
  console.log(`  ${translated.length} weapons translated.`);
}

function translateArmor(locale: "pt-BR" | "es"): void {
  console.log(`\nTranslating armor → ${locale}...`);
  const armor = loadJSON<AnyRecord>("armor.json");
  const categories = ARMOR_CATEGORIES[locale];

  const translated = armor.map((a) => ({
    ...a,
    category: a.category ? translateExact(a.category as string, categories) : a.category,
  }));

  saveJSON(`armor-${suffix(locale)}.json`, translated);
  console.log(`  ${translated.length} armor pieces translated.`);
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════

const LOCALES: ("pt-BR" | "es")[] = ["pt-BR", "es"];

console.log("=== Open5e Translation Script (Full) ===");
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
