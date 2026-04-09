import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Campaign, NPC, Encounter, Session, SessionEvent, Condition, TreasureRecord, MapData, MapPin, ProgressClock } from "@/types/dnd5e";
import { generateId } from "@/lib/utils";
import { getXpMultiplier, getEncounterDifficulty } from "@/lib/dnd5e";

interface CampaignState {
  campaigns: Campaign[];
  pinHash: string | null;
  activeCampaignId: string | null;
  isHydrated: boolean;

  setHydrated: () => void;

  // PIN
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  isPinSet: () => boolean;

  // Campaigns
  createCampaign: (data: Pick<Campaign, "name" | "description" | "world">) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  setActiveCampaign: (id: string | null) => void;
  getCampaign: (id: string) => Campaign | undefined;

  // NPCs
  addNpc: (campaignId: string, npc: Omit<NPC, "id">) => void;
  updateNpc: (campaignId: string, npcId: string, updates: Partial<NPC>) => void;
  deleteNpc: (campaignId: string, npcId: string) => void;

  // Encounters
  addEncounter: (campaignId: string, encounter: Omit<Encounter, "id" | "difficulty" | "totalXP" | "adjustedXP" | "currentTurnIndex">) => void;
  updateEncounter: (campaignId: string, encounterId: string, updates: Partial<Encounter>) => void;
  deleteEncounter: (campaignId: string, encounterId: string) => void;
  recalculateEncounter: (campaignId: string, encounterId: string) => void;

  // Sessions
  addSession: (campaignId: string, session: Omit<Session, "id">) => void;
  updateSession: (campaignId: string, sessionId: string, updates: Partial<Session>) => void;
  deleteSession: (campaignId: string, sessionId: string) => void;
  addSessionEvent: (campaignId: string, sessionId: string, event: Omit<SessionEvent, "id">) => void;
  deleteSessionEvent: (campaignId: string, sessionId: string, eventId: string) => void;

  // Notes
  updateCampaignNotes: (campaignId: string, notes: string) => void;

  // Treasures
  addTreasure: (campaignId: string, treasure: Omit<TreasureRecord, "id">) => void;
  deleteTreasure: (campaignId: string, treasureId: string) => void;

  // Maps
  addMap: (campaignId: string, map: Omit<MapData, "id" | "createdAt">) => void;
  deleteMap: (campaignId: string, mapId: string) => void;
  addPin: (campaignId: string, mapId: string, pin: Omit<MapPin, "id">) => void;
  updatePin: (campaignId: string, mapId: string, pinId: string, updates: Partial<MapPin>) => void;
  deletePin: (campaignId: string, mapId: string, pinId: string) => void;

  // Progress Clocks
  addClock: (campaignId: string, clock: Omit<ProgressClock, "id">) => void;
  updateClock: (campaignId: string, clockId: string, filled: number) => void;
  deleteClock: (campaignId: string, clockId: string) => void;
}

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    immer((set, get) => ({
      campaigns: [],
      pinHash: null,
      activeCampaignId: null,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      setPin: async (pin) => {
        const hash = await hashPin(pin);
        set({ pinHash: hash });
      },

      verifyPin: async (pin) => {
        const hash = await hashPin(pin);
        return hash === get().pinHash;
      },

      isPinSet: () => get().pinHash !== null,

      createCampaign: (data) => {
        const now = new Date().toISOString();
        const campaign: Campaign = {
          ...data,
          id: generateId(),
          playerCharacterIds: [],
          sessions: [],
          npcs: [],
          encounters: [],
          treasures: [],
          maps: [],
          clocks: [],
          notes: "",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          state.campaigns.push(campaign);
        });
        return campaign;
      },

      updateCampaign: (id, updates) => {
        set((state) => {
          const idx = state.campaigns.findIndex((c) => c.id === id);
          if (idx !== -1) {
            Object.assign(state.campaigns[idx], updates, { updatedAt: new Date().toISOString() });
          }
        });
      },

      deleteCampaign: (id) => {
        set((state) => {
          state.campaigns = state.campaigns.filter((c) => c.id !== id);
          if (state.activeCampaignId === id) state.activeCampaignId = null;
        });
      },

      setActiveCampaign: (id) => set({ activeCampaignId: id }),

      getCampaign: (id) => get().campaigns.find((c) => c.id === id),

      addNpc: (campaignId, npcData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.npcs.push({ ...npcData, id: generateId() });
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      updateNpc: (campaignId, npcId, updates) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const npc = campaign.npcs.find((n) => n.id === npcId);
            if (npc) Object.assign(npc, updates);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteNpc: (campaignId, npcId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.npcs = campaign.npcs.filter((n) => n.id !== npcId);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      addEncounter: (campaignId, encounterData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const totalXP = encounterData.monsters.reduce((sum, m) => sum + m.xp, 0);
            const multiplier = getXpMultiplier(encounterData.monsters.length);
            const adjustedXP = Math.floor(totalXP * multiplier);
            const difficulty = getEncounterDifficulty(
              encounterData.partyLevel,
              encounterData.partySize,
              adjustedXP
            );
            campaign.encounters.push({
              ...encounterData,
              id: generateId(),
              totalXP,
              adjustedXP,
              difficulty,
              currentTurnIndex: 0,
            });
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      updateEncounter: (campaignId, encounterId, updates) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const encounter = campaign.encounters.find((e) => e.id === encounterId);
            if (encounter) Object.assign(encounter, updates);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteEncounter: (campaignId, encounterId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.encounters = campaign.encounters.filter((e) => e.id !== encounterId);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      recalculateEncounter: (campaignId, encounterId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (!campaign) return;
          const encounter = campaign.encounters.find((e) => e.id === encounterId);
          if (!encounter) return;
          encounter.totalXP = encounter.monsters.reduce((sum, m) => sum + m.xp, 0);
          const multiplier = getXpMultiplier(encounter.monsters.length);
          encounter.adjustedXP = Math.floor(encounter.totalXP * multiplier);
          encounter.difficulty = getEncounterDifficulty(
            encounter.partyLevel,
            encounter.partySize,
            encounter.adjustedXP
          );
        });
      },

      addSession: (campaignId, sessionData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.sessions.push({ ...sessionData, id: generateId() });
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      updateSession: (campaignId, sessionId, updates) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const session = campaign.sessions.find((s) => s.id === sessionId);
            if (session) Object.assign(session, updates);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteSession: (campaignId, sessionId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.sessions = campaign.sessions.filter((s) => s.id !== sessionId);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      addSessionEvent: (campaignId, sessionId, eventData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const session = campaign.sessions.find((s) => s.id === sessionId);
            if (session) {
              if (!session.events) session.events = [];
              session.events.push({ ...eventData, id: generateId() });
              campaign.updatedAt = new Date().toISOString();
            }
          }
        });
      },

      deleteSessionEvent: (campaignId, sessionId, eventId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const session = campaign.sessions.find((s) => s.id === sessionId);
            if (session) {
              session.events = (session.events ?? []).filter((e) => e.id !== eventId);
              campaign.updatedAt = new Date().toISOString();
            }
          }
        });
      },

      updateCampaignNotes: (campaignId, notes) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.notes = notes;
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      addTreasure: (campaignId, treasureData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            if (!campaign.treasures) campaign.treasures = [];
            campaign.treasures.push({ ...treasureData, id: generateId() });
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteTreasure: (campaignId, treasureId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.treasures = (campaign.treasures ?? []).filter((t) => t.id !== treasureId);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      addMap: (campaignId, mapData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            if (!campaign.maps) campaign.maps = [];
            campaign.maps.push({ ...mapData, id: generateId(), createdAt: new Date().toISOString() });
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteMap: (campaignId, mapId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.maps = (campaign.maps ?? []).filter((m) => m.id !== mapId);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      addPin: (campaignId, mapId, pinData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const map = (campaign.maps ?? []).find((m) => m.id === mapId);
            if (map) {
              map.pins.push({ ...pinData, id: generateId() });
              campaign.updatedAt = new Date().toISOString();
            }
          }
        });
      },

      updatePin: (campaignId, mapId, pinId, updates) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const map = (campaign.maps ?? []).find((m) => m.id === mapId);
            if (map) {
              const pin = map.pins.find((p) => p.id === pinId);
              if (pin) Object.assign(pin, updates);
              campaign.updatedAt = new Date().toISOString();
            }
          }
        });
      },

      deletePin: (campaignId, mapId, pinId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const map = (campaign.maps ?? []).find((m) => m.id === mapId);
            if (map) {
              map.pins = map.pins.filter((p) => p.id !== pinId);
              campaign.updatedAt = new Date().toISOString();
            }
          }
        });
      },

      addClock: (campaignId, clockData) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            if (!campaign.clocks) campaign.clocks = [];
            campaign.clocks.push({ ...clockData, id: generateId() });
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      updateClock: (campaignId, clockId, filled) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            const clock = (campaign.clocks ?? []).find((cl) => cl.id === clockId);
            if (clock) clock.filled = filled;
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },

      deleteClock: (campaignId, clockId) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.clocks = (campaign.clocks ?? []).filter((cl) => cl.id !== clockId);
            campaign.updatedAt = new Date().toISOString();
          }
        });
      },
    })),
    {
      name: "dd5e-campaigns",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
