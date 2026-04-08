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
  return 9;
}

export function getStandardArray(): number[] {
  return [15, 14, 13, 12, 10, 8];
}
