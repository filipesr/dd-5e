import { generateLootByCR, getRandomMagicItem, MAGIC_ITEMS } from "@/lib/lootTables";

describe("generateLootByCR", () => {
  describe("CR 0-4", () => {
    it("produces coins within expected range", () => {
      for (let i = 0; i < 20; i++) {
        const result = generateLootByCR(2);
        // 6d6 × 100 CP: min=600, max=3600
        expect(result.coins.cp).toBeGreaterThanOrEqual(600);
        expect(result.coins.cp).toBeLessThanOrEqual(3600);
        // 3d6 × 100 SP: min=300, max=1800
        expect(result.coins.sp).toBeGreaterThanOrEqual(300);
        expect(result.coins.sp).toBeLessThanOrEqual(1800);
        // EP always 0
        expect(result.coins.ep).toBe(0);
        // 2d6 × 10 GP: min=20, max=120
        expect(result.coins.gp).toBeGreaterThanOrEqual(20);
        expect(result.coins.gp).toBeLessThanOrEqual(120);
        // PP always 0
        expect(result.coins.pp).toBe(0);
      }
    });

    it("works for CR 0", () => {
      const result = generateLootByCR(0);
      expect(result.coins.cp).toBeGreaterThan(0);
    });

    it("works for CR 4 boundary", () => {
      const result = generateLootByCR(4);
      expect(result.coins.cp).toBeGreaterThanOrEqual(600);
      expect(result.coins.pp).toBe(0);
    });
  });

  describe("CR 5-10", () => {
    it("produces coins within expected range", () => {
      for (let i = 0; i < 20; i++) {
        const result = generateLootByCR(7);
        // 2d6 × 100 CP: min=200, max=1200
        expect(result.coins.cp).toBeGreaterThanOrEqual(200);
        expect(result.coins.cp).toBeLessThanOrEqual(1200);
        // 2d6 × 1000 SP: min=2000, max=12000
        expect(result.coins.sp).toBeGreaterThanOrEqual(2000);
        expect(result.coins.sp).toBeLessThanOrEqual(12000);
        // 6d6 × 100 GP: min=600, max=3600
        expect(result.coins.gp).toBeGreaterThanOrEqual(600);
        expect(result.coins.gp).toBeLessThanOrEqual(3600);
        // 3d6 × 10 PP: min=30, max=180
        expect(result.coins.pp).toBeGreaterThanOrEqual(30);
        expect(result.coins.pp).toBeLessThanOrEqual(180);
      }
    });

    it("works for CR 5 boundary", () => {
      const result = generateLootByCR(5);
      expect(result.coins.sp).toBeGreaterThanOrEqual(2000);
    });

    it("works for CR 10 boundary", () => {
      const result = generateLootByCR(10);
      expect(result.coins.gp).toBeGreaterThanOrEqual(600);
    });
  });

  describe("CR 11-16", () => {
    it("produces coins within expected range", () => {
      for (let i = 0; i < 20; i++) {
        const result = generateLootByCR(13);
        // CP and SP are 0
        expect(result.coins.cp).toBe(0);
        expect(result.coins.sp).toBe(0);
        // 4d6 × 1000 GP: min=4000, max=24000
        expect(result.coins.gp).toBeGreaterThanOrEqual(4000);
        expect(result.coins.gp).toBeLessThanOrEqual(24000);
        // 5d6 × 100 PP: min=500, max=3000
        expect(result.coins.pp).toBeGreaterThanOrEqual(500);
        expect(result.coins.pp).toBeLessThanOrEqual(3000);
      }
    });
  });

  describe("CR 17+", () => {
    it("produces coins within expected range", () => {
      for (let i = 0; i < 20; i++) {
        const result = generateLootByCR(20);
        // CP and SP are 0
        expect(result.coins.cp).toBe(0);
        expect(result.coins.sp).toBe(0);
        // 12d6 × 1000 GP: min=12000, max=72000
        expect(result.coins.gp).toBeGreaterThanOrEqual(12000);
        expect(result.coins.gp).toBeLessThanOrEqual(72000);
        // 8d6 × 1000 PP: min=8000, max=48000
        expect(result.coins.pp).toBeGreaterThanOrEqual(8000);
        expect(result.coins.pp).toBeLessThanOrEqual(48000);
      }
    });

    it("works for CR 17 boundary", () => {
      const result = generateLootByCR(17);
      expect(result.coins.gp).toBeGreaterThanOrEqual(12000);
    });
  });

  it("always returns empty items array", () => {
    const result = generateLootByCR(5);
    expect(result.items).toEqual([]);
  });
});

describe("getRandomMagicItem", () => {
  const rarities = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary"];

  it.each(rarities)("returns a valid item for rarity: %s", (rarity) => {
    const item = getRandomMagicItem(rarity);
    expect(item.name).toBeTruthy();
    expect(item.description).toBeTruthy();
    expect(item.rarity).toBe(rarity);
  });

  it("returns an item that exists in the pool", () => {
    const rarity = "Rare";
    const item = getRandomMagicItem(rarity);
    const pool = MAGIC_ITEMS[rarity];
    const found = pool.some((p) => p.name === item.name && p.description === item.description);
    expect(found).toBe(true);
  });

  it("throws for unknown rarity", () => {
    expect(() => getRandomMagicItem("Mythic")).toThrow();
  });
});

describe("MAGIC_ITEMS pool", () => {
  const rarities = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary"];

  it.each(rarities)("has at least 5 items for rarity: %s", (rarity) => {
    expect(MAGIC_ITEMS[rarity].length).toBeGreaterThanOrEqual(5);
  });

  it("every item has name and description", () => {
    for (const rarity of rarities) {
      for (const item of MAGIC_ITEMS[rarity]) {
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
      }
    }
  });
});
