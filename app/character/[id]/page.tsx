"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Wand2, Swords } from "lucide-react";
import { useCharacterStore } from "@/store/characterStore";
import { useSessionStore } from "@/store/sessionStore";
import { getClassResources } from "@/lib/classResources";
import { getModifier, getProficiencyBonus, getCarryCapacity, getXpForNextLevel } from "@/lib/dnd5e";
import { formatModifier, generateId } from "@/lib/utils";
import {
  ATTRIBUTES,
  SKILLS,
  CONDITIONS,
  RACES,
  CLASSES,
  ALIGNMENTS,
  SKILL_ATTRIBUTE_MAP,
  type Attribute,
  type Skill,
  type Condition,
} from "@/types/dnd5e";
import type { Attack, InventoryItem } from "@/types/dnd5e";

import { StatBox } from "@/components/character/StatBox";
import { SkillRow } from "@/components/character/SkillRow";
import { HpTracker } from "@/components/character/HpTracker";
import { SpellSlotTracker } from "@/components/character/SpellSlotTracker";
import { ConditionBadge } from "@/components/character/ConditionBadge";
import { DeathSaves } from "@/components/character/DeathSaves";
import { AttackRow } from "@/components/character/AttackRow";
import { InventoryRow } from "@/components/character/InventoryRow";
import { AttributeGeneration } from "@/components/character/AttributeGeneration";
import { PdfExportButton } from "@/components/character/PdfExportButton";
import { SessionPanel } from "@/components/character/SessionPanel";

import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { ScrollSection } from "@/components/ui/ScrollSection";

import skillsData from "@/data/skills.json";

// Build a lookup map from slug → PT-BR name
const SKILL_NAMES: Record<string, string> = Object.fromEntries(
  skillsData.map((s) => [s.slug, s.name])
);

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatAlignment(slug: string): string {
  return slug
    .split("-")
    .map((word) => capitalize(word))
    .join(" ");
}

export default function CharacterSheetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { getCharacter, updateCharacter, isHydrated } = useCharacterStore();
  const character = getCharacter(id);

  const [showAttrGen, setShowAttrGen] = useState(false);

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-cinzel text-gold text-xl animate-pulse">Carregando...</p>
      </main>
    );
  }

  if (!character) {
    return (
      <main className="flex min-h-screen items-center justify-center flex-col gap-4">
        <p className="font-cinzel text-parchment-light/60 text-xl">Personagem não encontrado</p>
        <Button variant="ghost" onClick={() => router.push("/character")} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Voltar
        </Button>
      </main>
    );
  }

  const profBonus = getProficiencyBonus(character.level);
  const xpNext = getXpForNextLevel(character.level);
  const carryCapacity = getCarryCapacity(character.attributes.str);
  const totalWeight = character.inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);

  const { isActive: sessionActive, startSession, endSession } = useSessionStore();
  const dexMod = getModifier(character.attributes.dex);

  const toggleSession = () => {
    if (sessionActive) {
      endSession();
    } else {
      const resources = getClassResources(character.class, character.level, character.attributes);
      startSession(character.id, resources);
    }
  };

  const update = (updates: Parameters<typeof updateCharacter>[1]) => {
    updateCharacter(id, updates);
  };

  // ── Saving throws ──────────────────────────────────────────────────────────
  const ATTR_LABELS: Record<Attribute, string> = {
    str: "Força", dex: "Destreza", con: "Constituição",
    int: "Inteligência", wis: "Sabedoria", cha: "Carisma",
  };

  const toggleSavingThrow = (attr: Attribute) => {
    const current = character.savingThrowProficiencies;
    const next = current.includes(attr)
      ? current.filter((a) => a !== attr)
      : [...current, attr];
    update({ savingThrowProficiencies: next });
  };

  // ── Skills ─────────────────────────────────────────────────────────────────
  const cycleSkillProficiency = (skill: Skill) => {
    const current = character.skillProficiencies[skill] ?? "none";
    const next =
      current === "none" ? "proficient" :
      current === "proficient" ? "expertise" : "none";
    const updated = { ...character.skillProficiencies };
    if (next === "none") {
      delete updated[skill];
    } else {
      updated[skill] = next;
    }
    update({ skillProficiencies: updated });
  };

  // ── Attacks ────────────────────────────────────────────────────────────────
  const addAttack = () => {
    const newAttack: Attack = {
      id: generateId(),
      name: "",
      attackBonus: 0,
      damage: "1d6",
      damageType: "slashing",
    };
    update({ attacks: [...character.attacks, newAttack] });
  };

  const updateAttack = (attackId: string, updated: Attack) => {
    update({ attacks: character.attacks.map((a) => (a.id === attackId ? updated : a)) });
  };

  const deleteAttack = (attackId: string) => {
    update({ attacks: character.attacks.filter((a) => a.id !== attackId) });
  };

  // ── Inventory ──────────────────────────────────────────────────────────────
  const addInventoryItem = () => {
    const newItem: InventoryItem = {
      id: generateId(),
      name: "",
      quantity: 1,
      weight: 0,
      valuePO: 0,
      description: "",
    };
    update({ inventory: [...character.inventory, newItem] });
  };

  const updateInventoryItem = (itemId: string, updated: InventoryItem) => {
    update({ inventory: character.inventory.map((i) => (i.id === itemId ? updated : i)) });
  };

  const deleteInventoryItem = (itemId: string) => {
    update({ inventory: character.inventory.filter((i) => i.id !== itemId) });
  };

  // ── Conditions ─────────────────────────────────────────────────────────────
  const toggleCondition = (condition: Condition) => {
    const current = character.conditions;
    const next = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    update({ conditions: next });
  };

  // ── Select options ─────────────────────────────────────────────────────────
  const raceOptions = RACES.map((r) => ({ value: r, label: capitalize(r) }));
  const classOptions = CLASSES.map((c) => ({ value: c, label: capitalize(c) }));
  const alignmentOptions = ALIGNMENTS.map((a) => ({ value: a, label: formatAlignment(a) }));

  return (
    <main className="min-h-screen p-4 max-w-3xl mx-auto space-y-3 pb-16">
      {/* Back button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/character")} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Voltar
          </Button>
          <h1 className="font-cinzel text-gold text-lg truncate">{character.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={toggleSession} variant={sessionActive ? "danger" : "secondary"} size="sm">
            <Swords size={14} className="mr-1" />
            {sessionActive ? "Encerrar Sessao" : "Modo Sessao"}
          </Button>
          <PdfExportButton character={character} />
        </div>
      </div>

      {sessionActive && (
        <ScrollSection title="Modo Sessao" defaultOpen={true}>
          <SessionPanel dexMod={dexMod} />
        </ScrollSection>
      )}

      {/* 1. Identidade */}
      <ScrollSection title="Identidade">
        <div className="space-y-3">
          <Input
            label="Nome"
            value={character.name}
            onChange={(e) => update({ name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Raça"
              value={character.race}
              options={raceOptions}
              onChange={(e) => update({ race: e.target.value as typeof character.race })}
            />
            <Select
              label="Classe"
              value={character.class}
              options={classOptions}
              onChange={(e) => update({ class: e.target.value as typeof character.class })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nível"
              type="number"
              value={character.level}
              min={1}
              max={20}
              onChange={(e) => update({ level: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
            />
            <Input
              label="Background"
              value={character.background}
              onChange={(e) => update({ background: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Alinhamento"
              value={character.alignment}
              options={alignmentOptions}
              onChange={(e) => update({ alignment: e.target.value as typeof character.alignment })}
            />
            <Input
              label="XP"
              type="number"
              value={character.xp}
              min={0}
              onChange={(e) => update({ xp: Math.max(0, parseInt(e.target.value) || 0) })}
            />
          </div>
          <div className="flex gap-4 text-sm text-parchment-light/50">
            <span className="font-cinzel">
              Bônus de Proficiência:{" "}
              <span className="text-gold">{formatModifier(profBonus)}</span>
            </span>
            {xpNext !== null && (
              <span className="font-cinzel">
                XP para próx. nível:{" "}
                <span className="text-gold">{xpNext.toLocaleString("pt-BR")}</span>
              </span>
            )}
          </div>
        </div>
      </ScrollSection>

      {/* 2. Atributos */}
      <ScrollSection title="Atributos">
        <div className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ATTRIBUTES.map((attr) => (
              <StatBox
                key={attr}
                attribute={attr}
                value={character.attributes[attr]}
                onChange={(val) =>
                  update({ attributes: { ...character.attributes, [attr]: val } })
                }
              />
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAttrGen(true)}
            className="flex items-center gap-2"
          >
            <Wand2 size={14} />
            Gerar Atributos
          </Button>
        </div>
        <AttributeGeneration
          isOpen={showAttrGen}
          onClose={() => setShowAttrGen(false)}
          onApply={(attrs) => update({ attributes: attrs })}
        />
      </ScrollSection>

      {/* 3. Combate */}
      <ScrollSection title="Combate">
        <div className="space-y-4">
          <HpTracker
            hp={character.hp}
            ac={character.ac}
            onChange={(hp) => update({ hp })}
            onAcChange={(ac) => update({ ac })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Iniciativa"
              type="number"
              value={character.initiative}
              onChange={(e) => update({ initiative: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Deslocamento (m)"
              type="number"
              value={character.speed}
              min={0}
              onChange={(e) => update({ speed: Math.max(0, parseInt(e.target.value) || 0) })}
            />
          </div>
          <div className="space-y-1">
            <span className="font-cinzel text-xs text-gold/60">Dados de Vida</span>
            <p className="text-parchment-light text-sm">
              {character.hitDice.total - character.hitDice.used}d{character.hitDice.dieType} disponíveis
              {" "}({character.hitDice.total} total, {character.hitDice.used} usados)
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-cinzel text-xs text-gold/60">Testes de Morte</span>
            <DeathSaves
              successes={character.deathSaves.successes}
              failures={character.deathSaves.failures}
              onChange={(saves) => update({ deathSaves: saves })}
            />
          </div>
        </div>
      </ScrollSection>

      {/* 4. Saving Throws */}
      <ScrollSection title="Testes de Resistência">
        <div className="space-y-1">
          {ATTRIBUTES.map((attr) => {
            const isProficient = character.savingThrowProficiencies.includes(attr);
            const mod = getModifier(character.attributes[attr]) + (isProficient ? profBonus : 0);
            return (
              <div key={attr} className="flex items-center gap-3 py-1 text-sm">
                <button
                  onClick={() => toggleSavingThrow(attr)}
                  className="w-4 h-4 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0"
                  title={isProficient ? "Remover proficiência" : "Adicionar proficiência"}
                >
                  {isProficient && <div className="w-2 h-2 rounded-full bg-gold" />}
                </button>
                <span className="flex-1 text-parchment-light/80">{ATTR_LABELS[attr]}</span>
                <span className="font-cinzel text-parchment-light w-8 text-right">
                  {formatModifier(mod)}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollSection>

      {/* 5. Perícias */}
      <ScrollSection title="Perícias">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {SKILLS.map((skill) => {
            const attr = SKILL_ATTRIBUTE_MAP[skill];
            return (
              <SkillRow
                key={skill}
                skill={skill}
                skillName={SKILL_NAMES[skill] ?? skill}
                attributeScore={character.attributes[attr]}
                level={character.level}
                proficiency={character.skillProficiencies[skill] ?? "none"}
                onToggle={() => cycleSkillProficiency(skill)}
              />
            );
          })}
        </div>
      </ScrollSection>

      {/* 6. Ataques */}
      <ScrollSection title="Ataques">
        <div className="space-y-1">
          {character.attacks.length === 0 && (
            <p className="text-parchment-light/40 text-sm py-2">Nenhum ataque cadastrado.</p>
          )}
          {character.attacks.map((attack) => (
            <AttackRow
              key={attack.id}
              attack={attack}
              onChange={(updated) => updateAttack(attack.id, updated)}
              onDelete={() => deleteAttack(attack.id)}
            />
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={addAttack}
          className="flex items-center gap-2 mt-3"
        >
          <Plus size={14} />
          Adicionar Ataque
        </Button>
      </ScrollSection>

      {/* 7. Magias */}
      <ScrollSection title="Magias" defaultOpen={false}>
        <div className="space-y-2">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((lvl) => {
            const slot = character.spellSlots[lvl];
            if (!slot || slot.max === 0) return null;
            return (
              <SpellSlotTracker
                key={lvl}
                level={lvl}
                max={slot.max}
                used={slot.used}
                onChange={(used) =>
                  update({
                    spellSlots: {
                      ...character.spellSlots,
                      [lvl]: { ...slot, used },
                    },
                  })
                }
              />
            );
          })}
          {Object.values(character.spellSlots).every((s) => !s || s.max === 0) && (
            <p className="text-parchment-light/40 text-sm py-2">
              Nenhum espaço de magia configurado.
            </p>
          )}
        </div>
      </ScrollSection>

      {/* 8. Condições */}
      <ScrollSection title="Condições">
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((condition) => (
            <ConditionBadge
              key={condition}
              condition={condition}
              active={character.conditions.includes(condition)}
              onToggle={() => toggleCondition(condition)}
            />
          ))}
        </div>
      </ScrollSection>

      {/* 9. Inventário */}
      <ScrollSection title="Inventário">
        <div className="space-y-4">
          {/* Coins */}
          <div>
            <span className="font-cinzel text-xs text-gold/60 mb-2 block">Moedas</span>
            <div className="grid grid-cols-5 gap-2">
              {(["cp", "sp", "ep", "gp", "pp"] as const).map((coin) => (
                <div key={coin} className="flex flex-col items-center gap-1">
                  <label className="font-cinzel text-xs text-parchment-light/50 uppercase">{coin}</label>
                  <input
                    type="number"
                    value={character.coins[coin]}
                    min={0}
                    onChange={(e) =>
                      update({
                        coins: {
                          ...character.coins,
                          [coin]: Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="w-full text-center bg-parchment/10 border border-gold/20 rounded px-1 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-cinzel text-xs text-gold/60">Itens</span>
              <span className="text-xs text-parchment-light/40">
                Peso: {totalWeight.toFixed(1)} / {carryCapacity.toFixed(1)} kg
              </span>
            </div>
            {character.inventory.length === 0 && (
              <p className="text-parchment-light/40 text-sm py-2">Nenhum item no inventário.</p>
            )}
            {character.inventory.map((item) => (
              <InventoryRow
                key={item.id}
                item={item}
                onChange={(updated) => updateInventoryItem(item.id, updated)}
                onDelete={() => deleteInventoryItem(item.id)}
              />
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={addInventoryItem}
              className="flex items-center gap-2 mt-2"
            >
              <Plus size={14} />
              Adicionar Item
            </Button>
          </div>
        </div>
      </ScrollSection>

      {/* 10. Traços & Notas */}
      <ScrollSection title="Traços & Notas" defaultOpen={false}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Textarea
              label="Traços de Personalidade"
              rows={3}
              value={character.traits.personality}
              onChange={(e) =>
                update({ traits: { ...character.traits, personality: e.target.value } })
              }
            />
            <Textarea
              label="Ideais"
              rows={3}
              value={character.traits.ideals}
              onChange={(e) =>
                update({ traits: { ...character.traits, ideals: e.target.value } })
              }
            />
            <Textarea
              label="Vínculos"
              rows={3}
              value={character.traits.bonds}
              onChange={(e) =>
                update({ traits: { ...character.traits, bonds: e.target.value } })
              }
            />
            <Textarea
              label="Defeitos"
              rows={3}
              value={character.traits.flaws}
              onChange={(e) =>
                update({ traits: { ...character.traits, flaws: e.target.value } })
              }
            />
          </div>
          <Textarea
            label="Aparência"
            rows={3}
            value={character.notes.appearance}
            onChange={(e) =>
              update({ notes: { ...character.notes, appearance: e.target.value } })
            }
          />
          <Textarea
            label="História"
            rows={5}
            value={character.notes.backstory}
            onChange={(e) =>
              update({ notes: { ...character.notes, backstory: e.target.value } })
            }
          />
          <Textarea
            label="Aliados & Organizações"
            rows={3}
            value={character.notes.allies}
            onChange={(e) =>
              update({ notes: { ...character.notes, allies: e.target.value } })
            }
          />
          <Textarea
            label="Notas Livres"
            rows={4}
            value={character.notes.freeNotes}
            onChange={(e) =>
              update({ notes: { ...character.notes, freeNotes: e.target.value } })
            }
          />
        </div>
      </ScrollSection>
    </main>
  );
}
