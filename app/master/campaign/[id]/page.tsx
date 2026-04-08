"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Users, Swords, ScrollText, StickyNote, ArrowLeft, Trash2, Gem, Map, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { NpcCard } from "@/components/master/NpcCard";
import { EncounterPlanner } from "@/components/master/EncounterPlanner";
import { RichTextEditor } from "@/components/master/RichTextEditor";
import { TreasureGenerator } from "@/components/master/TreasureGenerator";
import { TreasureInventory } from "@/components/master/TreasureInventory";
import { MapUploader } from "@/components/master/MapUploader";
import { MapViewer } from "@/components/master/MapViewer";
import { PinEditor } from "@/components/master/PinEditor";
import { MapExporter } from "@/components/master/MapExporter";
import { useCampaignStore } from "@/store/campaignStore";
import { ALIGNMENTS } from "@/types/dnd5e";
import type { NPC, EncounterMonster, MapPin, MapData } from "@/types/dnd5e";

const TABS = [
  { key: "npcs", label: "NPCs", icon: Users },
  { key: "encounters", label: "Encontros", icon: Swords },
  { key: "sessions", label: "Sessões", icon: ScrollText },
  { key: "notes", label: "Notas", icon: StickyNote },
  { key: "treasures", label: "Tesouros", icon: Gem },
  { key: "maps", label: "Mapas", icon: Map },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const ALIGNMENT_OPTIONS = ALIGNMENTS.map((a) => ({
  value: a,
  label: a.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const ROLE_OPTIONS = [
  { value: "ally", label: "Aliado" },
  { value: "neutral", label: "Neutro" },
  { value: "antagonist", label: "Antagonista" },
  { value: "unknown", label: "Desconhecido" },
];

const DIFFICULTY_COLORS: Record<string, "green" | "gold" | "blood" | "purple"> = {
  easy: "green",
  medium: "gold",
  hard: "blood",
  deadly: "purple",
};
const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  deadly: "Mortal",
};

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const { getCampaign, addNpc, deleteNpc, addEncounter, addSession, updateCampaignNotes, addTreasure, deleteTreasure, addMap, deleteMap, addPin, updatePin, deletePin } =
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
  const [npcRace, setNpcRace] = useState("");
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

  if (!campaign) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-parchment-light/50">Campanha não encontrada.</p>
        <Link href="/master">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft size={16} className="mr-2" /> Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const resetNpcForm = () => {
    setNpcName("");
    setNpcRace("");
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

  const handleAddSession = () => {
    if (!sessionTitle.trim()) return;
    addSession(campaignId, {
      title: sessionTitle.trim(),
      summary: sessionSummary.trim(),
      date: new Date().toISOString(),
      tags: [],
      notes: "",
    });
    setSessionTitle("");
    setSessionSummary("");
    setShowSessionModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/master" className="inline-flex items-center gap-1 text-sm text-parchment-light/50 hover:text-parchment-light mb-4">
        <ArrowLeft size={14} /> Voltar
      </Link>

      <SectionHeader title={campaign.name} />
      {campaign.world && (
        <p className="text-center text-sm text-parchment-light/40 -mt-2 mb-6">{campaign.world}</p>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gold/20">
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
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowNpcModal(true)}>
              Novo NPC
            </Button>
          </div>
          {campaign.npcs.length === 0 ? (
            <p className="text-center text-parchment-light/40 py-12">Nenhum NPC adicionado ainda.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaign.npcs.map((npc) => (
                <NpcCard key={npc.id} npc={npc} onClick={() => setSelectedNpc(npc)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Encounters Tab */}
      {activeTab === "encounters" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowEncounterModal(true)}>
              Novo Encontro
            </Button>
          </div>
          {campaign.encounters.length === 0 ? (
            <p className="text-center text-parchment-light/40 py-12">Nenhum encontro criado ainda.</p>
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
                    label={DIFFICULTY_LABELS[enc.difficulty] ?? enc.difficulty}
                    color={DIFFICULTY_COLORS[enc.difficulty] ?? "gold"}
                  />
                  <Link href={`/master/encounter/${enc.id}?campaign=${campaignId}`}>
                    <Button size="sm" variant="secondary">
                      <Swords size={14} className="mr-1" /> Tracker
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
            <Button size="sm" onClick={() => setShowSessionModal(true)}>
              Nova Sessão
            </Button>
          </div>
          {campaign.sessions.length === 0 ? (
            <p className="text-center text-parchment-light/40 py-12">Nenhuma sessão registrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {campaign.sessions.map((session) => (
                <Card key={session.id} className="p-4">
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
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <RichTextEditor
          content={campaign.notes}
          onChange={(html) => updateCampaignNotes(campaignId, html)}
        />
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
                      <ChevronLeft size={14} className="mr-1" /> Voltar
                    </Button>
                    <span className="font-cinzel text-parchment-light text-sm">{selectedMap.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={playerView ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setPlayerView(!playerView)}
                      title={playerView ? "Modo Mestre" : "Visão do Jogador"}
                    >
                      {playerView ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
                      {playerView ? "Modo Mestre" : "Visão do Jogador"}
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
                    Clique no mapa para adicionar um pino
                  </p>
                )}
              </div>
            );
          })() : (
            <div>
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => setShowMapUploader(true)}>
                  Novo Mapa
                </Button>
              </div>

              {(campaign.maps ?? []).length === 0 ? (
                <p className="text-center text-parchment-light/40 py-12">
                  Nenhum mapa adicionado ainda.
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
            title="Adicionar Mapa"
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
      <Modal isOpen={showNpcModal} onClose={() => { setShowNpcModal(false); resetNpcForm(); }} title="Novo NPC">
        <div className="space-y-4">
          <Input label="Nome" value={npcName} onChange={(e) => setNpcName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Raça" value={npcRace} onChange={(e) => setNpcRace(e.target.value)} />
            <Input label="Profissão" value={npcProfession} onChange={(e) => setNpcProfession(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Alinhamento"
              options={ALIGNMENT_OPTIONS}
              value={npcAlignment}
              onChange={(e) => setNpcAlignment(e.target.value)}
            />
            <Select
              label="Papel"
              options={ROLE_OPTIONS}
              value={npcRole}
              onChange={(e) => setNpcRole(e.target.value as NPC["role"])}
            />
          </div>
          <Textarea label="Notas" value={npcNotes} onChange={(e) => setNpcNotes(e.target.value)} rows={3} />
          <Textarea label="Segredos" value={npcSecrets} onChange={(e) => setNpcSecrets(e.target.value)} rows={3} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setShowNpcModal(false); resetNpcForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleAddNpc} disabled={!npcName.trim()}>
              Adicionar
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
                <span className="text-parchment-light/40 block text-xs font-cinzel">Raça</span>
                <span className="text-parchment-light">{selectedNpc.race || "—"}</span>
              </div>
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel">Profissão</span>
                <span className="text-parchment-light">{selectedNpc.profession || "—"}</span>
              </div>
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel">Alinhamento</span>
                <span className="text-parchment-light">
                  {selectedNpc.alignment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel">Papel</span>
                <span className="text-parchment-light">
                  {ROLE_OPTIONS.find((r) => r.value === selectedNpc.role)?.label ?? selectedNpc.role}
                </span>
              </div>
            </div>
            {selectedNpc.notes && (
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel mb-1">Notas</span>
                <p className="text-sm text-parchment-light/80 whitespace-pre-wrap">{selectedNpc.notes}</p>
              </div>
            )}
            {selectedNpc.secrets && (
              <div>
                <span className="text-parchment-light/40 block text-xs font-cinzel mb-1">Segredos</span>
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
                <Trash2 size={14} className="mr-1" /> Excluir
              </Button>
              <Button variant="ghost" onClick={() => setSelectedNpc(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Encounter Modal */}
      <Modal
        isOpen={showEncounterModal}
        onClose={() => setShowEncounterModal(false)}
        title="Novo Encontro"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Encontro"
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
              Cancelar
            </Button>
            <Button onClick={handleAddEncounter} disabled={!encounterName.trim()}>
              Criar
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Session Modal */}
      <Modal isOpen={showSessionModal} onClose={() => setShowSessionModal(false)} title="Nova Sessão">
        <div className="space-y-4">
          <Input
            label="Título"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            placeholder="Ex: A chegada em Neverwinter"
          />
          <Textarea
            label="Resumo"
            value={sessionSummary}
            onChange={(e) => setSessionSummary(e.target.value)}
            placeholder="O que aconteceu nesta sessão..."
            rows={4}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowSessionModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSession} disabled={!sessionTitle.trim()}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
