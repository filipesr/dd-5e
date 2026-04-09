"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Users, Swords, ScrollText, StickyNote, ArrowLeft, Trash2, Gem, Map, ChevronLeft, Eye, EyeOff, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { NpcCard } from "@/components/master/NpcCard";
import { EncounterPlanner } from "@/components/master/EncounterPlanner";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/master/RichTextEditor").then(m => ({ default: m.RichTextEditor })), { ssr: false, loading: () => <p className="text-parchment-light/30 p-4">Carregando editor...</p> });
import { TreasureGenerator } from "@/components/master/TreasureGenerator";
import { TreasureInventory } from "@/components/master/TreasureInventory";
import { MapUploader } from "@/components/master/MapUploader";
import { MapViewer } from "@/components/master/MapViewer";
import { PinEditor } from "@/components/master/PinEditor";
import { MapExporter } from "@/components/master/MapExporter";
import { ProgressClockManager } from "@/components/master/ProgressClockManager";
import { RandomEventGenerator } from "@/components/master/RandomEventGenerator";
import { SessionTimeline } from "@/components/master/SessionTimeline";
import { QuickNpcGenerator } from "@/components/master/QuickNpcGenerator";
import { useCampaignStore } from "@/store/campaignStore";
import { ALIGNMENTS, RACES } from "@/types/dnd5e";
import type { NPC, EncounterMonster, MapPin, MapData } from "@/types/dnd5e";
import type { GeneratedNPC } from "@/lib/npcGenerator";
import { useI18n } from "@/lib/i18n";

const DIFFICULTY_COLORS: Record<string, "green" | "gold" | "blood" | "purple"> = {
  easy: "green",
  medium: "gold",
  hard: "blood",
  deadly: "purple",
};

type TabKey = "npcs" | "encounters" | "sessions" | "notes" | "treasures" | "maps";

export default function CampaignDetailPage() {
  const { t, locale } = useI18n();
  const params = useParams();
  const campaignId = params.id as string;
  const { getCampaign, addNpc, deleteNpc, addEncounter, addSession, updateSession, deleteSession, addSessionEvent, deleteSessionEvent, updateCampaignNotes, addTreasure, deleteTreasure, addMap, deleteMap, addPin, updatePin, deletePin, addClock, updateClock, deleteClock } =
    useCampaignStore();

  const campaign = getCampaign(campaignId);
  const [activeTab, setActiveTab] = useState<TabKey>("npcs");

  // Map state
  const mapViewerRef = useRef<HTMLDivElement>(null);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [showMapUploader, setShowMapUploader] = useState(false);
  const [editingPin, setEditingPin] = useState<MapPin | null>(null);
  const [newPinPosition, setNewPinPosition] = useState<{ x: number; y: number } | null>(null);
  const [showPinEditor, setShowPinEditor] = useState(false);
  const [playerView, setPlayerView] = useState(false);

  // NPC modal state
  const [showNpcModal, setShowNpcModal] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [npcName, setNpcName] = useState("");
  const [npcRace, setNpcRace] = useState("human");
  const [npcProfession, setNpcProfession] = useState("");
  const [npcAlignment, setNpcAlignment] = useState<string>(ALIGNMENTS[0]);
  const [npcRole, setNpcRole] = useState<NPC["role"]>("unknown");
  const [npcNotes, setNpcNotes] = useState("");
  const [npcSecrets, setNpcSecrets] = useState("");

  // Encounter modal state
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [encounterName, setEncounterName] = useState("");
  const [encounterMonsters, setEncounterMonsters] = useState<EncounterMonster[]>([]);
  const [partyLevel, setPartyLevel] = useState(1);
  const [partySize, setPartySize] = useState(4);

  // Session modal state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionSummary, setSessionSummary] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const TABS = [
    { key: "npcs" as TabKey, label: t.master.tabs.npcs, icon: Users },
    { key: "encounters" as TabKey, label: t.master.tabs.encounters, icon: Swords },
    { key: "sessions" as TabKey, label: t.master.tabs.sessions, icon: ScrollText },
    { key: "notes" as TabKey, label: t.master.tabs.notes, icon: StickyNote },
    { key: "treasures" as TabKey, label: t.master.tabs.treasures, icon: Gem },
    { key: "maps" as TabKey, label: t.master.tabs.maps, icon: Map },
  ];

  const ALIGNMENT_OPTIONS = ALIGNMENTS.map((a) => ({
    value: a,
    label: t.alignments[a] ?? a.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  const RACE_OPTIONS = RACES.map((r) => ({
    value: r,
    label: t.races[r] ?? r.charAt(0).toUpperCase() + r.slice(1).replace("-", " "),
  }));

  const ROLE_OPTIONS = [
    { value: "ally", label: t.master.npc.roles.ally },
    { value: "neutral", label: t.master.npc.roles.neutral },
    { value: "antagonist", label: t.master.npc.roles.antagonist },
    { value: "unknown", label: t.master.npc.roles.unknown },
  ];

  if (!campaign) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-parchment-light/50">Campanha não encontrada.</p>
        <Link href={`/${locale}/master`}>
          <Button variant="ghost" className="mt-4">
            <ArrowLeft size={16} className="mr-2" /> {t.common.back}
          </Button>
        </Link>
      </div>
    );
  }

  const resetNpcForm = () => {
    setNpcName("");
    setNpcRace("human");
    setNpcProfession("");
    setNpcAlignment(ALIGNMENTS[0]);
    setNpcRole("unknown");
    setNpcNotes("");
    setNpcSecrets("");
  };

  const handleAddNpc = () => {
    if (!npcName.trim()) return;
    addNpc(campaignId, {
      name: npcName.trim(),
      race: npcRace.trim(),
      profession: npcProfession.trim(),
      alignment: npcAlignment as NPC["alignment"],
      role: npcRole,
      notes: npcNotes.trim(),
      secrets: npcSecrets.trim(),
      hp: { max: 10, current: 10 },
      ac: 10,
      attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      relationships: "",
      avatar: "",
    });
    resetNpcForm();
    setShowNpcModal(false);
  };

  const handleAddEncounter = () => {
    if (!encounterName.trim()) return;
    addEncounter(campaignId, {
      name: encounterName.trim(),
      monsters: encounterMonsters,
      playerCharacters: [],
      partyLevel,
      partySize,
      status: "planning",
    });
    setEncounterName("");
    setEncounterMonsters([]);
    setPartyLevel(1);
    setPartySize(4);
    setShowEncounterModal(false);
  };

  const handleSaveSession = () => {
    if (!sessionTitle.trim()) return;
    if (editingSessionId) {
      updateSession(campaignId, editingSessionId, {
        title: sessionTitle.trim(),
        summary: sessionSummary.trim(),
      });
    } else {
      addSession(campaignId, {
        title: sessionTitle.trim(),
        summary: sessionSummary.trim(),
        date: new Date().toISOString(),
        tags: [],
        notes: "",
        events: [],
      });
    }
    setSessionTitle("");
    setSessionSummary("");
    setEditingSessionId(null);
    setShowSessionModal(false);
  };

  const addQuickNpc = (generated: GeneratedNPC) => {
    addNpc(campaignId, {
      name: generated.name,
      race: generated.race,
      profession: generated.profession,
      alignment: "true-neutral" as const,
      hp: { max: 10, current: 10 },
      ac: 10,
      attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      role: "neutral" as const,
      relationships: "",
      secrets: generated.secret,
      avatar: generated.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      notes: `Motivacao: ${generated.motivation}\nTraco: ${generated.trait}`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href={`/${locale}/master`} className="inline-flex items-center gap-1 text-sm text-parchment-light/50 hover:text-parchment-light mb-4">
        <ArrowLeft size={14} /> {t.common.back}
      </Link>

      <SectionHeader title={campaign.name} />
      {campaign.world && (
        <p className="text-center text-sm text-parchment-light/40 -mt-2 mb-6">{campaign.world}</p>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gold/20">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-cinzel transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? "border-gold text-gold"
                : "border-transparent text-parchment-light/50 hover:text-parchment-light"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* NPCs Tab */}
      {activeTab === "npcs" && (
        <div className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowNpcModal(true)}>
              {t.master.npc.newNpc}
            </Button>
          </div>
          {campaign.npcs.length === 0 ? (
            <p className="text-center text-parchment-light/40 py-12">{t.master.npc.noNpcs}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaign.npcs.map((npc) => (
                <NpcCard key={npc.id} npc={npc} onClick={() => setSelectedNpc(npc)} />
              ))}
            </div>
          )}
          <div className="border-t border-gold/20 pt-6">
            <QuickNpcGenerator onAddToCampaign={addQuickNpc} />
          </div>
        </div>
      )}

      {/* Encounters Tab */}
      {activeTab === "encounters" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowEncounterModal(true)}>
              {t.master.encounter.new_}
            </Button>
          </div>
          {campaign.encounters.length === 0 ? (
            <p className="text-center text-parchment-light/40 py-12">{t.master.encounter.none}</p>
          ) : (
            <div className="space-y-3">
              {campaign.encounters.map((enc) => (
                <Card key={enc.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-cinzel text-parchment-light">{enc.name}</h4>
                    <p className="text-xs text-parchment-light/40 mt-1">
                      {enc.monsters.length} monstro{enc.monsters.length !== 1 ? "s" : ""} · {enc.adjustedXP} XP ajustado
                    </p>
                  </div>
                  <Badge
                    label={t.master.encounter.difficulty[enc.difficulty as keyof typeof t.master.encounter.difficulty] ?? enc.difficulty}
                    color={DIFFICULTY_COLORS[enc.difficulty] ?? "gold"}
                  />
                  <Link href={`/${locale}/master/encounter/${enc.id}?campaign=${campaignId}`}>
                    <Button size="sm" variant="secondary">
                      <Swords size={14} className="mr-1" /> {t.master.encounter.tracker}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => { setEditingSessionId(null); setSessionTitle(""); setSessionSummary(""); setShowSessionModal(true); }}>
              {t.master.session.new_}
            </Button>
          </div>
          {campaign.sessions.length === 0 ? (
            <p className="text-center text-parchment-light/40 py-12">{t.master.session.none}</p>
          ) : (
            <div className="space-y-3">
              {campaign.sessions.map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-cinzel text-parchment-light">{session.title}</h4>
                      <p className="text-xs text-parchment-light/40 mt-1">
                        {new Date(session.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {session.summary && (
                        <p className="text-sm text-parchment-light/60 mt-2 line-clamp-3">{session.summary}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => {
                          setEditingSessionId(session.id);
                          setSessionTitle(session.title);
                          setSessionSummary(session.summary);
                          setShowSessionModal(true);
                        }}
                        className="text-gold/40 hover:text-gold transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteSession(campaignId, session.id)}
                        className="text-blood/40 hover:text-blood transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gold/10">
                    <SessionTimeline
                      events={session.events ?? []}
                      onAddEvent={(event) => addSessionEvent(campaignId, session.id, event)}
                      onDeleteEvent={(eventId) => deleteSessionEvent(campaignId, session.id, eventId)}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <ProgressClockManager
            clocks={campaign.clocks ?? []}
            onAdd={(name, segments) => addClock(campaignId, { name, segments, filled: 0 })}
            onUpdate={(clockId, filled) => updateClock(campaignId, clockId, filled)}
            onDelete={(clockId) => deleteClock(campaignId, clockId)}
          />
          <div className="border-t border-gold/20 pt-4">
            <RichTextEditor
              content={campaign.notes}
              onChange={(html) => updateCampaignNotes(campaignId, html)}
            />
          </div>
          <div className="border-t border-gold/20 pt-4">
            <RandomEventGenerator />
          </div>
        </div>
      )}

      {/* Treasures Tab */}
      {activeTab === "treasures" && (
        <div className="space-y-8">
          <TreasureGenerator
            campaignId={campaignId}
            onAdd={(treasure) => addTreasure(campaignId, treasure)}
          />
          <div className="border-t border-gold/20 pt-6">
            <TreasureInventory
              treasures={campaign.treasures ?? []}
              onDelete={(id) => deleteTreasure(campaignId, id)}
            />
          </div>
        </div>
      )}

      {/* Maps Tab */}
      {activeTab === "maps" && (
        <div>
          {selectedMapId ? (() => {
            const selectedMap = (campaign.maps ?? []).find((m) => m.id === selectedMapId);
            if (!selectedMap) return null;
            return (
              <div className="space-y-4">
                {/* Map Controls Bar */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSelectedMapId(null); setPlayerView(false); }}
                    >
                      <ChevronLeft size={14} className="mr-1" /> {t.common.back}
                    </Button>
                    <span className="font-cinzel text-parchment-light text-sm">{selectedMap.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={playerView ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setPlayerView(!playerView)}
                      title={playerView ? t.master.map.masterView : t.master.map.playerView}
                    >
                      {playerView ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
                      {playerView ? t.master.map.masterView : t.master.map.playerView}
                    </Button>
                    <MapExporter mapRef={mapViewerRef} mapName={selectedMap.name} />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        deleteMap(campaignId, selectedMapId);
                        setSelectedMapId(null);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Map Viewer */}
                <div className="border border-gold/20 rounded-lg overflow-hidden bg-ink">
                  <MapViewer
                    ref={mapViewerRef}
                    map={selectedMap}
                    playerView={playerView}
                    onMapClick={(x, y) => {
                      setEditingPin(null);
                      setNewPinPosition({ x, y });
                      setShowPinEditor(true);
                    }}
                    onPinClick={(pin) => {
                      setEditingPin(pin);
                      setNewPinPosition(null);
                      setShowPinEditor(true);
                    }}
                  />
                </div>

                {!playerView && (
                  <p className="text-xs text-center text-parchment-light/30">
                    {t.master.map.clickToAdd}
                  </p>
                )}
              </div>
            );
          })() : (
            <div>
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => setShowMapUploader(true)}>
                  {t.master.map.new_}
                </Button>
              </div>

              {(campaign.maps ?? []).length === 0 ? (
                <p className="text-center text-parchment-light/40 py-12">
                  {t.master.map.none}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(campaign.maps ?? []).map((map) => (
                    <Card
                      key={map.id}
                      className="p-0 overflow-hidden cursor-pointer hover:border-gold/60 transition-colors"
                      onClick={() => setSelectedMapId(map.id)}
                    >
                      <div className="aspect-video bg-ink flex items-center justify-center overflow-hidden">
                        <img
                          src={map.imageBase64}
                          alt={map.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="px-3 py-2">
                        <p className="font-cinzel text-sm text-parchment-light truncate">{map.name}</p>
                        <p className="text-xs text-parchment-light/40 mt-0.5">
                          {map.pins.length} pino{map.pins.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Map Uploader Modal */}
          <Modal
            isOpen={showMapUploader}
            onClose={() => setShowMapUploader(false)}
            title={t.master.map.add}
            className="max-w-xl"
          >
            <MapUploader
              onAdd={(name, imageBase64) => {
                addMap(campaignId, { name, imageBase64, pins: [] });
                setShowMapUploader(false);
              }}
              onCancel={() => setShowMapUploader(false)}
            />
          </Modal>

          {/* Pin Editor Modal */}
          <PinEditor
            isOpen={showPinEditor}
            onClose={() => { setShowPinEditor(false); setEditingPin(null); setNewPinPosition(null); }}
            pin={editingPin}
            position={newPinPosition}
            onSave={(pinData) => {
              if (selectedMapId) {
                if (editingPin) {
                  updatePin(campaignId, selectedMapId, editingPin.id, pinData);
                } else {
                  addPin(campaignId, selectedMapId, pinData);
                }
              }
            }}
            onDelete={(pinId) => {
              if (selectedMapId) {
                deletePin(campaignId, selectedMapId, pinId);
              }
            }}
          />
        </div>
      )}

      {/* New NPC Modal */}
      <Modal isOpen={showNpcModal} onClose={() => { setShowNpcModal(false); resetNpcForm(); }} title={t.master.npc.newNpc}>
        <div className="space-y-4">
          <Input label={t.common.name} value={npcName} onChange={(e) => setNpcName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select label={t.character.fields.race} options={RACE_OPTIONS} value={npcRace} onChange={(e) => setNpcRace(e.target.value)} />
            <Input label={t.master.npc.profession} value={npcProfession} onChange={(e) => setNpcProfession(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t.character.fields.alignment}
              options={ALIGNMENT_OPTIONS}
              value={npcAlignment}
              onChange={(e) => setNpcAlignment(e.target.value)}
            />
            <Select
              label={t.master.npc.role}
              options={ROLE_OPTIONS}
              value={npcRole}
              onChange={(e) => setNpcRole(e.target.value as NPC["role"])}
            />
          </div>
          <Textarea label={t.common.notes} value={npcNotes} onChange={(e) => setNpcNotes(e.target.value)} rows={3} />
          <Textarea label={t.master.npc.secrets} value={npcSecrets} onChange={(e) => setNpcSecrets(e.target.value)} rows={3} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setShowNpcModal(false); resetNpcForm(); }}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleAddNpc} disabled={!npcName.trim()}>
              {t.common.add}
            </Button>
          </div>
        </div>
      </Modal>

      {/* NPC Detail Modal */}
      {selectedNpc && (
        <Modal isOpen={!!selectedNpc} onClose={() => setSelectedNpc(null)} title={selectedNpc.name}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel">{t.character.fields.race}</span>
                <span className="text-parchment-light">{selectedNpc.race || "—"}</span>
              </div>
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel">{t.master.npc.profession}</span>
                <span className="text-parchment-light">{selectedNpc.profession || "—"}</span>
              </div>
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel">{t.character.fields.alignment}</span>
                <span className="text-parchment-light">
                  {t.alignments[selectedNpc.alignment] ?? selectedNpc.alignment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel">{t.master.npc.role}</span>
                <span className="text-parchment-light">
                  {ROLE_OPTIONS.find((r) => r.value === selectedNpc.role)?.label ?? selectedNpc.role}
                </span>
              </div>
            </div>
            {selectedNpc.notes && (
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel mb-1">{t.common.notes}</span>
                <p className="text-sm text-parchment-light/80 whitespace-pre-wrap">{selectedNpc.notes}</p>
              </div>
            )}
            {selectedNpc.secrets && (
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel mb-1">{t.master.npc.secrets}</span>
                <p className="text-sm text-parchment-light/80 whitespace-pre-wrap">{selectedNpc.secrets}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t border-gold/20">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  deleteNpc(campaignId, selectedNpc.id);
                  setSelectedNpc(null);
                }}
              >
                <Trash2 size={14} className="mr-1" /> {t.common.delete}
              </Button>
              <Button variant="ghost" onClick={() => setSelectedNpc(null)}>
                {t.common.close}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Encounter Modal */}
      <Modal
        isOpen={showEncounterModal}
        onClose={() => setShowEncounterModal(false)}
        title={t.master.encounter.new_}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <Input
            label={t.master.encounter.encounterName}
            value={encounterName}
            onChange={(e) => setEncounterName(e.target.value)}
          />
          <EncounterPlanner
            partyLevel={partyLevel}
            partySize={partySize}
            onPartyChange={(lvl, sz) => { setPartyLevel(lvl); setPartySize(sz); }}
            monsters={encounterMonsters}
            onMonstersChange={setEncounterMonsters}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowEncounterModal(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleAddEncounter} disabled={!encounterName.trim()}>
              {t.common.create}
            </Button>
          </div>
        </div>
      </Modal>

      {/* New/Edit Session Modal */}
      <Modal isOpen={showSessionModal} onClose={() => { setShowSessionModal(false); setEditingSessionId(null); setSessionTitle(""); setSessionSummary(""); }} title={editingSessionId ? t.master.session.edit : t.master.session.new_}>
        <div className="space-y-4">
          <Input
            label={t.master.session.title}
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            placeholder="Ex: A chegada em Neverwinter"
          />
          <Textarea
            label={t.master.session.summary}
            value={sessionSummary}
            onChange={(e) => setSessionSummary(e.target.value)}
            placeholder="O que aconteceu nesta sessão..."
            rows={4}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowSessionModal(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSaveSession} disabled={!sessionTitle.trim()}>
              {editingSessionId ? t.common.update : t.common.save}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
