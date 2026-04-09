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

  inspiration: boolean;

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

export interface SessionEvent {
  id: string;
  timestamp: string;
  type: "combat" | "social" | "exploration" | "plot" | "custom";
  title: string;
  description: string;
}

export interface Session {
  id: string;
  date: string;
  title: string;
  summary: string;
  tags: string[];
  notes: string;
  events: SessionEvent[];
}

export interface TreasureRecord {
  id: string;
  date: string;
  description: string;
  givenTo: string;
  coins: Record<CoinType, number>;
  items: { name: string; rarity: string; description: string }[];
  notes: string;
}

export const PIN_TYPES = [
  "city", "dungeon", "encounter", "treasure", "npc", "poi",
] as const;
export type PinType = (typeof PIN_TYPES)[number];

export interface MapPin {
  id: string;
  x: number;
  y: number;
  type: PinType;
  name: string;
  description: string;
  revealed: boolean;
}

export interface MapData {
  id: string;
  name: string;
  imageBase64: string;
  pins: MapPin[];
  createdAt: string;
}

export interface ProgressClock {
  id: string;
  name: string;
  segments: number;
  filled: number;
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
  treasures: TreasureRecord[];
  maps: MapData[];
  clocks: ProgressClock[];
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
