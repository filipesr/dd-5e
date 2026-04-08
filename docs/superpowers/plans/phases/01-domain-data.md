# Plano: Etapa 1 — Dominio e Dados (T2-T5)

**Status:** ✅ Completo
**Spec:** `docs/superpowers/specs/modules/01-domain.md`

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

