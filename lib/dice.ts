function secureRandom(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  return Math.random();
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
