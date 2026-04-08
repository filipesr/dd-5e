import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Campaign, NPC, Encounter, Session, Condition } from "@/types/dnd5e";
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

  // Notes
  updateCampaignNotes: (campaignId: string, notes: string) => void;
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

      updateCampaignNotes: (campaignId, notes) => {
        set((state) => {
          const campaign = state.campaigns.find((c) => c.id === campaignId);
          if (campaign) {
            campaign.notes = notes;
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
