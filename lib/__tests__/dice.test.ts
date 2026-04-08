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
