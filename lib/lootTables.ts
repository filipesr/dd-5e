import { rollDice } from "@/lib/dice";
import type { CoinType } from "@/types/dnd5e";

// === Magic Items Pool ===

export const MAGIC_ITEMS: Record<string, { name: string; description: string }[]> = {
  Common: [
    { name: "Cantrip Spell Scroll", description: "A scroll containing a single cantrip that any class can cast once." },
    { name: "Cloak of Billowing", description: "While wearing this cloak, you can use a bonus action to make it billow dramatically." },
    { name: "Clockwork Amulet", description: "Grants a +10 to one attack roll once per day instead of rolling." },
    { name: "Ersatz Eye", description: "A magical glass eye that replaces a missing eye and grants normal vision." },
    { name: "Hat of Vermin", description: "Allows the wearer to produce a harmless bat, frog, or rat from the hat once per day." },
    { name: "Pipe of Smoke Monsters", description: "Creates small smoke shapes of creatures when you blow smoke through it." },
  ],
  Uncommon: [
    { name: "Bag of Holding", description: "A bag with an interior space considerably larger than its outside dimensions." },
    { name: "Boots of Elvenkind", description: "Your steps make no sound regardless of the surface you move across." },
    { name: "Cloak of Protection", description: "Grants +1 bonus to AC and saving throws while attuned." },
    { name: "Goggles of Night", description: "While wearing these dark lenses, you have darkvision out to 60 feet." },
    { name: "Rope of Climbing", description: "A 60-foot silk rope that can animate on command and climb up to 10 feet per round." },
    { name: "Wand of Magic Detection", description: "Has 3 charges; lets you cast detect magic using a charge." },
  ],
  Rare: [
    { name: "Belt of Dwarvenkind", description: "Grants Constitution +2 (max 20), advantage on Charisma saves, and darkvision 60 ft." },
    { name: "Cloak of Displacement", description: "Attackers have disadvantage on attack rolls against you; negated when hit." },
    { name: "Flame Tongue Sword", description: "Ignites on command, dealing extra 2d6 fire damage and shedding bright light 40 ft." },
    { name: "Necklace of Fireballs", description: "Contains 1d6+3 beads, each of which can be thrown to create a 3d6 fireball." },
    { name: "Ring of Protection", description: "Grants +1 bonus to AC and saving throws while attuned." },
    { name: "Wand of Fireballs", description: "Has 7 charges; expend 1–3 to cast fireball at spell level 3–5." },
  ],
  "Very Rare": [
    { name: "Amulet of the Planes", description: "Allows casting plane shift at will, but failure sends you to a random plane." },
    { name: "Cloak of Invisibility", description: "While wearing the cloak with the hood up, you are invisible." },
    { name: "Manual of Bodily Health", description: "Reading this tome increases your Constitution score and maximum by 2." },
    { name: "Ring of Regeneration", description: "Regain 1d6 HP every 10 minutes; also regenerates severed body parts over 1d6+1 days." },
    { name: "Staff of Fire", description: "Has 10 charges; cast burning hands, fireball, or wall of fire using charges." },
    { name: "Vorpal Sword", description: "On a natural 20, severs the target's head (if it has one) unless it succeeds on a DC 15 Con save." },
  ],
  Legendary: [
    { name: "Apparatus of Kwalish", description: "A crab-shaped mechanical vehicle that can walk, swim, and has several weapons." },
    { name: "Deck of Many Things", description: "A set of magical cards, each with a powerful — often catastrophic — effect." },
    { name: "Holy Avenger", description: "A +3 sword that deals extra 2d10 radiant to undead and grants a 10-ft aura of magic resistance." },
    { name: "Ring of Three Wishes", description: "Contains 3 charges; expend a charge to cast the wish spell." },
    { name: "Sphere of Annihilation", description: "A 2-foot sphere of utter darkness that destroys all matter it touches." },
    { name: "Talisman of Pure Good", description: "Mortally harmful to fiends and undead; grants several powerful abilities to good-aligned wielders." },
  ],
};

// === Loot Generation ===

export interface LootResult {
  coins: Record<CoinType, number>;
  items: { name: string; rarity: string; description: string }[];
}

export function generateLootByCR(cr: number): LootResult {
  let coins: Record<CoinType, number>;

  if (cr <= 4) {
    coins = {
      cp: rollDice(6, 6).total * 100,
      sp: rollDice(3, 6).total * 100,
      ep: 0,
      gp: rollDice(2, 6).total * 10,
      pp: 0,
    };
  } else if (cr <= 10) {
    coins = {
      cp: rollDice(2, 6).total * 100,
      sp: rollDice(2, 6).total * 1000,
      ep: 0,
      gp: rollDice(6, 6).total * 100,
      pp: rollDice(3, 6).total * 10,
    };
  } else if (cr <= 16) {
    coins = {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: rollDice(4, 6).total * 1000,
      pp: rollDice(5, 6).total * 100,
    };
  } else {
    coins = {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: rollDice(12, 6).total * 1000,
      pp: rollDice(8, 6).total * 1000,
    };
  }

  return { coins, items: [] };
}

export function getRandomMagicItem(rarity: string): { name: string; rarity: string; description: string } {
  const pool = MAGIC_ITEMS[rarity];
  if (!pool || pool.length === 0) {
    throw new Error(`No magic items found for rarity: ${rarity}`);
  }
  const idx = Math.floor(Math.random() * pool.length);
  return { ...pool[idx], rarity };
}
