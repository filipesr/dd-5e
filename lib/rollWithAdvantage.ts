import { rollDice } from "@/lib/dice";

export type AdvantageMode = "normal" | "advantage" | "disadvantage";

export interface D20RollResult {
  rolls: number[];
  chosen: number;
  modifier: number;
  total: number;
  isCritical: boolean;
  isFumble: boolean;
  advantage: AdvantageMode;
}

export function rollD20WithAdvantage(modifier: number, mode: AdvantageMode): D20RollResult {
  const count = mode === "normal" ? 1 : 2;
  const { rolls } = rollDice(count, 20);
  const chosen = mode === "advantage"
    ? Math.max(...rolls)
    : mode === "disadvantage"
      ? Math.min(...rolls)
      : rolls[0];
  return {
    rolls,
    chosen,
    modifier,
    total: chosen + modifier,
    isCritical: chosen === 20,
    isFumble: chosen === 1,
    advantage: mode,
  };
}
