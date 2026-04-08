import { rollD20WithAdvantage } from "@/lib/rollWithAdvantage";

describe("rollD20WithAdvantage", () => {
  it("normal mode rolls exactly 1 die", () => {
    for (let i = 0; i < 20; i++) {
      const result = rollD20WithAdvantage(0, "normal");
      expect(result.rolls).toHaveLength(1);
    }
  });

  it("advantage mode rolls exactly 2 dice", () => {
    for (let i = 0; i < 20; i++) {
      const result = rollD20WithAdvantage(0, "advantage");
      expect(result.rolls).toHaveLength(2);
    }
  });

  it("disadvantage mode rolls exactly 2 dice", () => {
    for (let i = 0; i < 20; i++) {
      const result = rollD20WithAdvantage(0, "disadvantage");
      expect(result.rolls).toHaveLength(2);
    }
  });

  it("advantage takes the max of 2 rolls", () => {
    for (let i = 0; i < 50; i++) {
      const result = rollD20WithAdvantage(0, "advantage");
      expect(result.chosen).toBe(Math.max(...result.rolls));
    }
  });

  it("disadvantage takes the min of 2 rolls", () => {
    for (let i = 0; i < 50; i++) {
      const result = rollD20WithAdvantage(0, "disadvantage");
      expect(result.chosen).toBe(Math.min(...result.rolls));
    }
  });

  it("normal mode chosen equals the single roll", () => {
    for (let i = 0; i < 20; i++) {
      const result = rollD20WithAdvantage(0, "normal");
      expect(result.chosen).toBe(result.rolls[0]);
    }
  });

  it("modifier is added to total", () => {
    for (let i = 0; i < 50; i++) {
      const modifier = 5;
      const result = rollD20WithAdvantage(modifier, "normal");
      expect(result.total).toBe(result.chosen + modifier);
      expect(result.modifier).toBe(modifier);
    }
  });

  it("negative modifier is correctly applied", () => {
    for (let i = 0; i < 50; i++) {
      const modifier = -3;
      const result = rollD20WithAdvantage(modifier, "normal");
      expect(result.total).toBe(result.chosen + modifier);
    }
  });

  it("isCritical is true when chosen is 20", () => {
    // Mock rollDice by testing the flag logic directly
    // Run many rolls and verify that whenever chosen === 20, isCritical === true
    for (let i = 0; i < 200; i++) {
      const result = rollD20WithAdvantage(0, "normal");
      if (result.chosen === 20) {
        expect(result.isCritical).toBe(true);
      } else {
        expect(result.isCritical).toBe(false);
      }
    }
  });

  it("isFumble is true when chosen is 1", () => {
    for (let i = 0; i < 200; i++) {
      const result = rollD20WithAdvantage(0, "normal");
      if (result.chosen === 1) {
        expect(result.isFumble).toBe(true);
      } else {
        expect(result.isFumble).toBe(false);
      }
    }
  });

  it("advantage field matches the mode passed", () => {
    expect(rollD20WithAdvantage(0, "normal").advantage).toBe("normal");
    expect(rollD20WithAdvantage(0, "advantage").advantage).toBe("advantage");
    expect(rollD20WithAdvantage(0, "disadvantage").advantage).toBe("disadvantage");
  });

  it("all dice rolls are between 1 and 20", () => {
    for (let i = 0; i < 100; i++) {
      const result = rollD20WithAdvantage(0, "advantage");
      result.rolls.forEach((r) => {
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(20);
      });
    }
  });
});
