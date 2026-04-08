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
  it("returns -5 for score 1", () => { expect(getModifier(1)).toBe(-5); });
  it("returns -1 for score 8", () => { expect(getModifier(8)).toBe(-1); });
  it("returns 0 for score 10", () => { expect(getModifier(10)).toBe(0); });
  it("returns 0 for score 11", () => { expect(getModifier(11)).toBe(0); });
  it("returns +2 for score 14", () => { expect(getModifier(14)).toBe(2); });
  it("returns +5 for score 20", () => { expect(getModifier(20)).toBe(5); });
  it("returns +10 for score 30", () => { expect(getModifier(30)).toBe(10); });
});

describe("getProficiencyBonus", () => {
  it("returns +2 for levels 1-4", () => { expect(getProficiencyBonus(1)).toBe(2); expect(getProficiencyBonus(4)).toBe(2); });
  it("returns +3 for levels 5-8", () => { expect(getProficiencyBonus(5)).toBe(3); expect(getProficiencyBonus(8)).toBe(3); });
  it("returns +4 for levels 9-12", () => { expect(getProficiencyBonus(9)).toBe(4); expect(getProficiencyBonus(12)).toBe(4); });
  it("returns +5 for levels 13-16", () => { expect(getProficiencyBonus(13)).toBe(5); expect(getProficiencyBonus(16)).toBe(5); });
  it("returns +6 for levels 17-20", () => { expect(getProficiencyBonus(17)).toBe(6); expect(getProficiencyBonus(20)).toBe(6); });
});

describe("getSkillValue", () => {
  it("returns just modifier when not proficient", () => { expect(getSkillValue(14, 5, "none")).toBe(2); });
  it("adds proficiency bonus when proficient", () => { expect(getSkillValue(14, 5, "proficient")).toBe(7); });
  it("doubles proficiency bonus for expertise", () => { expect(getSkillValue(14, 5, "expertise")).toBe(12); });
});

describe("getCarryCapacity", () => {
  it("calculates STR * 7.5", () => {
    expect(getCarryCapacity(10)).toBe(75);
    expect(getCarryCapacity(15)).toBe(112.5);
    expect(getCarryCapacity(20)).toBe(150);
  });
});

describe("getXpForNextLevel", () => {
  it("returns 300 for level 1", () => { expect(getXpForNextLevel(1)).toBe(300); });
  it("returns 900 for level 2", () => { expect(getXpForNextLevel(2)).toBe(900); });
  it("returns 355000 for level 19", () => { expect(getXpForNextLevel(19)).toBe(355000); });
  it("returns null for level 20", () => { expect(getXpForNextLevel(20)).toBeNull(); });
});

describe("getXpMultiplier", () => {
  it("returns 1 for single monster", () => { expect(getXpMultiplier(1)).toBe(1); });
  it("returns 1.5 for 2 monsters", () => { expect(getXpMultiplier(2)).toBe(1.5); });
  it("returns 2 for 3-6 monsters", () => { expect(getXpMultiplier(3)).toBe(2); expect(getXpMultiplier(6)).toBe(2); });
  it("returns 2.5 for 7-10 monsters", () => { expect(getXpMultiplier(7)).toBe(2.5); });
  it("returns 3 for 11-14 monsters", () => { expect(getXpMultiplier(11)).toBe(3); });
  it("returns 4 for 15+ monsters", () => { expect(getXpMultiplier(15)).toBe(4); });
});

describe("getEncounterDifficulty", () => {
  it("returns easy for low XP", () => { expect(getEncounterDifficulty(1, 4, 50)).toBe("easy"); });
  it("returns medium for moderate XP", () => { expect(getEncounterDifficulty(1, 4, 200)).toBe("medium"); });
  it("returns hard for high XP", () => { expect(getEncounterDifficulty(1, 4, 340)).toBe("hard"); });
  it("returns deadly for very high XP", () => { expect(getEncounterDifficulty(1, 4, 500)).toBe("deadly"); });
});

describe("getPointBuyCost", () => {
  it("returns 0 for score 8", () => { expect(getPointBuyCost(8)).toBe(0); });
  it("returns 5 for score 13", () => { expect(getPointBuyCost(13)).toBe(5); });
  it("returns 7 for score 14", () => { expect(getPointBuyCost(14)).toBe(7); });
  it("returns 9 for score 15", () => { expect(getPointBuyCost(15)).toBe(9); });
});

describe("getStandardArray", () => {
  it("returns [15, 14, 13, 12, 10, 8]", () => { expect(getStandardArray()).toEqual([15, 14, 13, 12, 10, 8]); });
});
