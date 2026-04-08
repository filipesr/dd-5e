import { getClassResources } from "@/lib/classResources";
import type { Attribute } from "@/types/dnd5e";

const DEFAULT_ATTRS: Record<Attribute, number> = {
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
};

describe("getClassResources", () => {
  it("returns Rage for barbarian level 1 with 2 uses", () => {
    const resources = getClassResources("barbarian", 1, DEFAULT_ATTRS);
    expect(resources).toHaveLength(1);
    expect(resources[0].key).toBe("rage");
    expect(resources[0].max).toBe(2);
    expect(resources[0].recharge).toBe("long");
  });

  it("returns Rage with 4 uses for barbarian level 6", () => {
    const resources = getClassResources("barbarian", 6, DEFAULT_ATTRS);
    expect(resources[0].max).toBe(4);
  });

  it("returns Bardic Inspiration with CHA mod uses for bard", () => {
    const attrs = { ...DEFAULT_ATTRS, cha: 16 }; // +3
    const resources = getClassResources("bard", 1, attrs);
    expect(resources).toHaveLength(1);
    expect(resources[0].key).toBe("bardic-inspiration");
    expect(resources[0].max).toBe(3);
    expect(resources[0].recharge).toBe("long");
  });

  it("returns minimum 1 use for bard with low CHA", () => {
    const attrs = { ...DEFAULT_ATTRS, cha: 8 }; // -1
    const resources = getClassResources("bard", 1, attrs);
    expect(resources[0].max).toBe(1);
  });

  it("returns Channel Divinity for cleric level 2", () => {
    const resources = getClassResources("cleric", 2, DEFAULT_ATTRS);
    expect(resources).toHaveLength(1);
    expect(resources[0].key).toBe("channel-divinity");
    expect(resources[0].max).toBe(1);
    expect(resources[0].recharge).toBe("short");
  });

  it("returns Channel Divinity with 2 uses for cleric level 6", () => {
    const resources = getClassResources("cleric", 6, DEFAULT_ATTRS);
    expect(resources[0].max).toBe(2);
  });

  it("returns no Channel Divinity for cleric level 1", () => {
    const resources = getClassResources("cleric", 1, DEFAULT_ATTRS);
    expect(resources).toHaveLength(0);
  });

  it("returns Second Wind and Action Surge for fighter level 2", () => {
    const resources = getClassResources("fighter", 2, DEFAULT_ATTRS);
    expect(resources).toHaveLength(2);
    expect(resources.find((r) => r.key === "second-wind")).toBeDefined();
    expect(resources.find((r) => r.key === "action-surge")).toBeDefined();
  });

  it("returns Ki Points equal to level for monk", () => {
    const resources = getClassResources("monk", 5, DEFAULT_ATTRS);
    expect(resources[0].key).toBe("ki");
    expect(resources[0].max).toBe(5);
    expect(resources[0].recharge).toBe("short");
  });

  it("returns Lay on Hands and Divine Sense for paladin level 2", () => {
    const attrs = { ...DEFAULT_ATTRS, cha: 14 }; // +2
    const resources = getClassResources("paladin", 2, attrs);
    const loh = resources.find((r) => r.key === "lay-on-hands");
    const ds = resources.find((r) => r.key === "divine-sense");
    expect(loh?.max).toBe(10); // 5 * level
    expect(ds?.max).toBe(3);   // 1 + CHA mod
  });

  it("returns Sorcery Points equal to level for sorcerer", () => {
    const resources = getClassResources("sorcerer", 3, DEFAULT_ATTRS);
    expect(resources[0].key).toBe("sorcery-points");
    expect(resources[0].max).toBe(3);
    expect(resources[0].recharge).toBe("long");
  });

  it("returns Pact Slots for warlock", () => {
    const resources = getClassResources("warlock", 1, DEFAULT_ATTRS);
    expect(resources[0].key).toBe("pact-slots");
    expect(resources[0].max).toBe(1);
    expect(resources[0].recharge).toBe("short");
  });

  it("returns empty array for wizard", () => {
    const resources = getClassResources("wizard", 5, DEFAULT_ATTRS);
    expect(resources).toHaveLength(0);
  });

  it("returns empty array for rogue", () => {
    const resources = getClassResources("rogue", 5, DEFAULT_ATTRS);
    expect(resources).toHaveLength(0);
  });
});
