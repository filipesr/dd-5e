"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Wand2, Swords, Dices } from "lucide-react";
import { useCharacterStore } from "@/store/characterStore";
import { useSessionStore } from "@/store/sessionStore";
import { useI18n } from "@/lib/i18n";
import { getClassResources } from "@/lib/classResources";
import { getModifier, getProficiencyBonus, getCarryCapacity, getXpForNextLevel } from "@/lib/dnd5e";
import { formatModifier, generateId } from "@/lib/utils";
import { rollD20WithAdvantage } from "@/lib/rollWithAdvantage";
import { rollNotation } from "@/lib/dice";
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
import { JsonExportButton } from "@/components/character/JsonExportButton";
import { SessionPanel } from "@/components/character/SessionPanel";

import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { ScrollSection } from "@/components/ui/ScrollSection";

export default function CharacterSheetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { t } = useI18n();

  const { getCharacter, updateCharacter, isHydrated } = useCharacterStore();
  const { isActive: sessionActive, startSession, endSession, addRoll, advantageMode } = useSessionStore();
  const character = getCharacter(id);

  const [showAttrGen, setShowAttrGen] = useState(false);

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-cinzel text-gold text-xl animate-pulse">{t.common.loading}</p>
      </main>
    );
  }

  if (!character) {
    return (
      <main className="flex min-h-screen items-center justify-center flex-col gap-4">
        <p className="font-cinzel text-parchment-light/60 text-xl">{t.character.notFound}</p>
        <Button variant="ghost" onClick={() => router.push("/character")} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          {t.common.back}
        </Button>
      </main>
    );
  }

  const profBonus = getProficiencyBonus(character.level);
  const xpNext = getXpForNextLevel(character.level);
  const carryCapacity = getCarryCapacity(character.attributes.str);
  const totalWeight = character.inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);

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
    str: t.attributes.strFull,
    dex: t.attributes.dexFull,
    con: t.attributes.conFull,
    int: t.attributes.intFull,
    wis: t.attributes.wisFull,
    cha: t.attributes.chaFull,
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
  const raceOptions = RACES.map((r) => ({ value: r, label: t.races[r] || r }));
  const classOptions = CLASSES.map((c) => ({ value: c, label: t.classes[c] || c }));
  const alignmentOptions = ALIGNMENTS.map((a) => ({ value: a, label: t.alignments[a] || a }));

  return (
    <main className="min-h-screen p-4 max-w-3xl mx-auto space-y-3 pb-16">
      {/* Back button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/character")} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            {t.common.back}
          </Button>
          <h1 className="font-cinzel text-gold text-lg truncate">{character.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={toggleSession} variant={sessionActive ? "danger" : "secondary"} size="sm">
            <Swords size={14} className="mr-1" />
            {sessionActive ? t.character.actions.endSession : t.character.actions.startSession}
          </Button>
          <PdfExportButton character={character} />
          <JsonExportButton character={character} />
        </div>
      </div>

      {sessionActive && (
        <ScrollSection title={t.character.sections.sessionMode} defaultOpen={true}>
          <SessionPanel dexMod={dexMod} />
        </ScrollSection>
      )}

      {/* 1. Identidade */}
      <ScrollSection title={t.character.sections.identity}>
        <div className="space-y-3">
          <Input
            label={t.common.name}
            value={character.name}
            onChange={(e) => update({ name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t.character.fields.race}
              value={character.race}
              options={raceOptions}
              onChange={(e) => update({ race: e.target.value as typeof character.race })}
            />
            <Select
              label={t.character.fields.class_}
              value={character.class}
              options={classOptions}
              onChange={(e) => update({ class: e.target.value as typeof character.class })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t.common.level}
              type="number"
              value={character.level}
              min={1}
              max={20}
              onChange={(e) => update({ level: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
            />
            <Input
              label={t.character.fields.background}
              value={character.background}
              onChange={(e) => update({ background: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t.character.fields.alignment}
              value={character.alignment}
              options={alignmentOptions}
              onChange={(e) => update({ alignment: e.target.value as typeof character.alignment })}
            />
            <Input
              label={t.character.fields.xp}
              type="number"
              value={character.xp}
              min={0}
              onChange={(e) => update({ xp: Math.max(0, parseInt(e.target.value) || 0) })}
            />
          </div>
          <div className="flex gap-4 text-sm text-parchment-light/50">
            <span className="font-cinzel">
              {t.character.fields.profBonus}{" "}
              <span className="text-gold">{formatModifier(profBonus)}</span>
            </span>
            {xpNext !== null && (
              <span className="font-cinzel">
                {t.character.fields.xpNext}{" "}
                <span className="text-gold">{xpNext.toLocaleString()}</span>
              </span>
            )}
          </div>
        </div>
      </ScrollSection>

      {/* 2. Atributos */}
      <ScrollSection title={t.character.sections.attributes}>
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
            {t.character.actions.generateAttrs}
          </Button>
        </div>
        <AttributeGeneration
          isOpen={showAttrGen}
          onClose={() => setShowAttrGen(false)}
          onApply={(attrs) => update({ attributes: attrs })}
        />
      </ScrollSection>

      {/* 3. Combate */}
      <ScrollSection title={t.character.sections.combat}>
        <div className="space-y-4">
          <HpTracker
            hp={character.hp}
            ac={character.ac}
            onChange={(hp) => update({ hp })}
            onAcChange={(ac) => update({ ac })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t.character.fields.initiative}
              type="number"
              value={character.initiative}
              onChange={(e) => update({ initiative: parseInt(e.target.value) || 0 })}
            />
            <Input
              label={t.character.fields.speed}
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
      <ScrollSection title={t.character.sections.savingThrows}>
        <div className="space-y-1">
          {ATTRIBUTES.map((attr) => {
            const isProficient = character.savingThrowProficiencies.includes(attr);
            const val = getModifier(character.attributes[attr]) + (isProficient ? profBonus : 0);
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
                  {formatModifier(val)}
                </span>
                {sessionActive && (
                  <button onClick={() => {
                    const result = rollD20WithAdvantage(val, advantageMode);
                    addRoll({
                      type: "save",
                      notation: `1d20${val >= 0 ? "+" : ""}${val}`,
                      rolls: result.rolls,
                      total: result.total,
                      description: `${ATTR_LABELS[attr]} Save`,
                    });
                  }} className="ml-1 text-gold/40 hover:text-gold transition-colors" title="Rolar Save">
                    <Dices size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollSection>

      {/* 5. Perícias */}
      <ScrollSection title={t.character.sections.skills}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {SKILLS.map((skill) => {
            const attr = SKILL_ATTRIBUTE_MAP[skill];
            return (
              <SkillRow
                key={skill}
                skill={skill}
                skillName={t.skills[skill] ?? skill}
                attributeScore={character.attributes[attr]}
                level={character.level}
                proficiency={character.skillProficiencies[skill] ?? "none"}
                onToggle={() => cycleSkillProficiency(skill)}
                onRoll={sessionActive ? (value) => {
                  const result = rollD20WithAdvantage(value, advantageMode);
                  addRoll({
                    type: "ability",
                    notation: `1d20${value >= 0 ? "+" : ""}${value}`,
                    rolls: result.rolls,
                    total: result.total,
                    description: t.skills[skill] || skill,
                  });
                } : undefined}
              />
            );
          })}
        </div>
      </ScrollSection>

      {/* 6. Ataques */}
      <ScrollSection title={t.character.sections.attacks}>
        {character.attacks.length > 0 && (
          <div className="flex items-center gap-2 py-1 mb-1 text-xs text-parchment-light/40 font-cinzel border-b border-gold/10">
            <span className="flex-1">{t.character.attackHeaders.name}</span>
            <span className="w-16 text-center">{t.character.attackHeaders.bonus}</span>
            <span className="w-20">{t.character.attackHeaders.damage}</span>
            {sessionActive && <span className="w-14" />}
            <span className="w-4" />
          </div>
        )}
        <div className="space-y-1">
          {character.attacks.length === 0 && (
            <p className="text-parchment-light/40 text-sm py-2">{t.character.actions.noAttacks}</p>
          )}
          {character.attacks.map((attack) => (
            <AttackRow
              key={attack.id}
              attack={attack}
              onChange={(updated) => updateAttack(attack.id, updated)}
              onDelete={() => deleteAttack(attack.id)}
              onRollAttack={sessionActive ? () => {
                const result = rollD20WithAdvantage(attack.attackBonus, advantageMode);
                addRoll({
                  type: "attack",
                  notation: `1d20${attack.attackBonus >= 0 ? "+" : ""}${attack.attackBonus}`,
                  rolls: result.rolls,
                  total: result.total,
                  description: `${attack.name} (ataque)`,
                });
              } : undefined}
              onRollDamage={sessionActive ? () => {
                try {
                  const result = rollNotation(attack.damage);
                  addRoll({
                    type: "damage",
                    notation: attack.damage,
                    rolls: result.rolls,
                    total: result.total,
                    description: `${attack.name} (dano)`,
                  });
                } catch {}
              } : undefined}
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
          {t.character.actions.addAttack}
        </Button>
      </ScrollSection>

      {/* 7. Magias */}
      <ScrollSection title={t.character.sections.spells} defaultOpen={false}>
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
              {t.character.actions.noSpellSlots}
            </p>
          )}
        </div>
      </ScrollSection>

      {/* 8. Condições */}
      <ScrollSection title={t.character.sections.conditions}>
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
      <ScrollSection title={t.character.sections.inventory}>
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
              <span className="font-cinzel text-xs text-gold/60">{t.character.fields.items}</span>
              <span className="text-xs text-parchment-light/40">
                {t.character.fields.weight}: {totalWeight.toFixed(1)} / {carryCapacity.toFixed(1)} kg
              </span>
            </div>
            {character.inventory.length > 0 && (
              <div className="flex items-center gap-2 py-1 mb-1 text-xs text-parchment-light/40 font-cinzel border-b border-gold/10">
                <span className="flex-1">{t.character.itemHeaders.item}</span>
                <span className="w-12 text-center">{t.character.itemHeaders.qty}</span>
                <span className="w-16 text-center">{t.character.itemHeaders.weight}</span>
                <span className="w-16 text-center">{t.character.itemHeaders.value}</span>
                <span className="w-4" />
              </div>
            )}
            {character.inventory.length === 0 && (
              <p className="text-parchment-light/40 text-sm py-2">{t.character.actions.noItems}</p>
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
              {t.character.actions.addItem}
            </Button>
          </div>
        </div>
      </ScrollSection>

      {/* 10. Traços & Notas */}
      <ScrollSection title={t.character.sections.traitsNotes} defaultOpen={false}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Textarea
              label={t.character.fields.personality}
              rows={3}
              value={character.traits.personality}
              onChange={(e) =>
                update({ traits: { ...character.traits, personality: e.target.value } })
              }
            />
            <Textarea
              label={t.character.fields.ideals}
              rows={3}
              value={character.traits.ideals}
              onChange={(e) =>
                update({ traits: { ...character.traits, ideals: e.target.value } })
              }
            />
            <Textarea
              label={t.character.fields.bonds}
              rows={3}
              value={character.traits.bonds}
              onChange={(e) =>
                update({ traits: { ...character.traits, bonds: e.target.value } })
              }
            />
            <Textarea
              label={t.character.fields.flaws}
              rows={3}
              value={character.traits.flaws}
              onChange={(e) =>
                update({ traits: { ...character.traits, flaws: e.target.value } })
              }
            />
          </div>
          <Textarea
            label={t.character.fields.appearance}
            rows={3}
            value={character.notes.appearance}
            onChange={(e) =>
              update({ notes: { ...character.notes, appearance: e.target.value } })
            }
          />
          <Textarea
            label={t.character.fields.backstory}
            rows={5}
            value={character.notes.backstory}
            onChange={(e) =>
              update({ notes: { ...character.notes, backstory: e.target.value } })
            }
          />
          <Textarea
            label={t.character.fields.allies}
            rows={3}
            value={character.notes.allies}
            onChange={(e) =>
              update({ notes: { ...character.notes, allies: e.target.value } })
            }
          />
          <Textarea
            label={t.character.fields.freeNotes}
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
