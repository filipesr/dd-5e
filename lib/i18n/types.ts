export type Locale = "pt-BR" | "en" | "es";

export interface Dictionary {
  nav: { characters: string; compendium: string; master: string };
  landing: {
    title: string; subtitle: string;
    characters: { title: string; desc: string };
    compendium: { title: string; desc: string };
    master: { title: string; desc: string };
  };
  common: {
    loading: string; save: string; cancel: string; delete: string; close: string;
    edit: string; add: string; create: string; update: string; back: string;
    search: string; name: string; description: string; notes: string; type: string;
    level: string; yes: string; no: string; none: string; export_: string; import_: string;
  };
  character: {
    title: string; newCharacter: string; noCharacters: string; noCharactersDesc: string;
    createFirst: string; deleteConfirmTitle: string; deleteConfirmText: string; notFound: string;
    sections: {
      identity: string; attributes: string; combat: string; savingThrows: string;
      skills: string; attacks: string; spells: string; conditions: string;
      inventory: string; traitsNotes: string; sessionMode: string;
    };
    fields: {
      race: string; class_: string; background: string; alignment: string; xp: string;
      profBonus: string; xpNext: string; initiative: string; speed: string;
      hitDice: string; deathSaves: string; hitPoints: string; armorClass: string;
      tempHp: string; damage: string; heal: string; personality: string; ideals: string;
      bonds: string; flaws: string; appearance: string; backstory: string;
      allies: string; freeNotes: string; items: string; coins: string;
      weight: string; capacity: string;
    };
    actions: {
      generateAttrs: string; rollAll: string; apply: string; addAttack: string;
      addItem: string; noAttacks: string; noSpellSlots: string; noItems: string;
      startSession: string; endSession: string; exportPdf: string; exporting: string;
      exportJson: string; importJson: string; importError: string;
      rollInitiative: string; roll: string; rollAttack: string; rollDamage: string;
    };
    advantage: { normal: string; advantage: string; disadvantage: string };
    deathSaveSuccess: string; deathSaveFailure: string;
    shortRest: string; longRest: string; shortRecharge: string; longRecharge: string;
    use: string; rollLog: string; noRolls: string; clear: string; points: string;
    attackHeaders: { name: string; bonus: string; damage: string };
    itemHeaders: { item: string; qty: string; weight: string; value: string };
  };
  attributes: {
    str: string; dex: string; con: string; int: string; wis: string; cha: string;
    strFull: string; dexFull: string; conFull: string; intFull: string; wisFull: string; chaFull: string;
  };
  skills: Record<string, string>;
  conditions: Record<string, string>;
  compendium: {
    title: string; subtitle: string; results: string;
    categories: Record<string, { name: string; desc: string }>;
    detail: {
      speed: string; darkvision: string; abilityBonus: string; languages: string;
      racialTraits: string; hitDie: string; saves: string; armorProf: string;
      weaponProf: string; spellcasting: string; castingTime: string; range: string;
      components: string; duration: string; concentration: string; school: string;
      classes: string; higherLevels: string; cr: string; hp: string; ac: string;
      actions: string; reactions: string; legendaryActions: string; specialAbilities: string;
      rarity: string; attunement: string; cantrips: string; features: string;
    };
  };
  master: {
    title: string; newCampaign: string; noCampaigns: string; noCampaignsDesc: string;
    campaignName: string; world: string;
    tabs: { npcs: string; encounters: string; sessions: string; notes: string; treasures: string; maps: string };
    npc: {
      newNpc: string; noNpcs: string; profession: string; role: string; secrets: string;
      roles: { ally: string; neutral: string; antagonist: string; unknown: string };
      quickGen: string; generate: string; generateAnother: string; addToCampaign: string;
      motivation: string; trait: string;
    };
    encounter: {
      new_: string; none: string; encounterName: string; partyLevel: string; partySize: string;
      tracker: string; rollInitiatives: string; nextTurn: string;
      difficulty: { easy: string; medium: string; hard: string; deadly: string };
    };
    session: {
      new_: string; edit: string; none: string; title: string; summary: string;
      timeline: string; addEvent: string; noEvents: string;
      eventTypes: { combat: string; social: string; exploration: string; plot: string; custom: string };
    };
    treasure: {
      generate: string; crRange: string; includeMagic: string; rarity: string;
      addToInventory: string; givenTo: string; inventory: string; none: string; totalCoins: string;
    };
    map: {
      new_: string; none: string; add: string; mapName: string; playerView: string;
      masterView: string; exportPng: string; clickToAdd: string; editPin: string;
      newPin: string; revealed: string; pins: string; dropImage: string; dragImage: string;
      imageTooLarge: string;
      pinTypes: { city: string; dungeon: string; encounter: string; treasure: string; npc: string; poi: string };
    };
    clock: { title: string; new_: string; seg4: string; seg6: string; seg8: string };
    events: { title: string; category: string; roll: string; rollAgain: string };
    notesPlaceholder: string; loadingEditor: string;
    pin: {
      createTitle: string; loginTitle: string; createDesc: string; loginDesc: string;
      minLength: string; incorrect: string; createBtn: string; loginBtn: string;
    };
  };
  coins: { cp: string; sp: string; ep: string; gp: string; pp: string };
  alignments: Record<string, string>;
  races: Record<string, string>;
  classes: Record<string, string>;
}
