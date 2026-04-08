# Plano: Etapa 4 — Paginas / Rotas (T14-T16)

**Status:** ✅ Completo
**Specs:** `01-domain.md`, `02-compendium.md`, `03-master.md`

---

### Task 14: Character Pages

**Files:**
- Create: `app/character/page.tsx`, `app/character/[id]/page.tsx`

- [x] **Step 1: Create character list page**

Create `app/character/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCharacterStore } from "@/store/characterStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Plus, Trash2 } from "lucide-react";

export default function CharacterListPage() {
  const router = useRouter();
  const { characters, createCharacter, deleteCharacter, isHydrated } = useCharacterStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (!isHydrated) {
    return <div className="text-center py-20 text-parchment-light/50">Carregando personagens...</div>;
  }

  const handleCreate = () => {
    const char = createCharacter({});
    router.push(`/character/${char.id}`);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteCharacter(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Personagens" />
        <Button onClick={handleCreate} size="sm">
          <Plus size={16} className="mr-1" /> Novo Personagem
        </Button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-parchment-light/50 mb-4">Nenhum personagem criado ainda.</p>
          <Button onClick={handleCreate}>Criar Primeiro Personagem</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <Card
              key={char.id}
              className="p-4 cursor-pointer hover:shadow-tome-hover transition-shadow relative group"
              onClick={() => router.push(`/character/${char.id}`)}
            >
              <h3 className="font-cinzel text-gold text-lg">{char.name}</h3>
              <p className="text-sm text-parchment-light/60">
                {char.race} {char.class} — Nível {char.level}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(char.id); }}
                className="absolute top-3 right-3 text-blood/0 group-hover:text-blood/60 hover:text-blood transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar Exclusão">
        <p className="text-parchment-light/70 mb-4">Tem certeza que deseja excluir este personagem? Esta ação não pode ser desfeita.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
```

- [x] **Step 2: Create character sheet page**

Create `app/character/[id]/page.tsx`. This is the largest page — it renders all 10 sections as collapsible accordions using the character components. The page reads the character from the store and auto-saves on every change.

```tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useCharacterStore } from "@/store/characterStore";
import { ScrollSection } from "@/components/ui/ScrollSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatBox } from "@/components/character/StatBox";
import { SkillRow } from "@/components/character/SkillRow";
import { HpTracker } from "@/components/character/HpTracker";
import { SpellSlotTracker } from "@/components/character/SpellSlotTracker";
import { ConditionBadge } from "@/components/character/ConditionBadge";
import { DeathSaves } from "@/components/character/DeathSaves";
import { AttackRow } from "@/components/character/AttackRow";
import { InventoryRow } from "@/components/character/InventoryRow";
import { AttributeGeneration } from "@/components/character/AttributeGeneration";
import { getModifier, getProficiencyBonus, getCarryCapacity, getXpForNextLevel } from "@/lib/dnd5e";
import { formatModifier, generateId } from "@/lib/utils";
import {
  ATTRIBUTES, SKILLS, RACES, CLASSES, ALIGNMENTS, CONDITIONS,
  SKILL_ATTRIBUTE_MAP,
  type Character, type Attribute, type Skill, type Condition,
} from "@/types/dnd5e";
import skillsData from "@/data/skills.json";
import { ArrowLeft, Dices } from "lucide-react";

const RACE_OPTIONS = RACES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1).replace("-", " ") }));
const CLASS_OPTIONS = CLASSES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));
const ALIGNMENT_OPTIONS = ALIGNMENTS.map((a) => ({ value: a, label: a.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));

export default function CharacterSheetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getCharacter, updateCharacter, isHydrated } = useCharacterStore();
  const [showAttrGen, setShowAttrGen] = useState(false);

  const char = getCharacter(id);

  const update = useCallback(
    (updates: Partial<Character>) => updateCharacter(id, updates),
    [id, updateCharacter]
  );

  if (!isHydrated) {
    return <div className="text-center py-20 text-parchment-light/50">Carregando...</div>;
  }

  if (!char) {
    return (
      <div className="text-center py-20">
        <p className="text-parchment-light/50 mb-4">Personagem não encontrado.</p>
        <Button onClick={() => router.push("/character")}>Voltar à Lista</Button>
      </div>
    );
  }

  const profBonus = getProficiencyBonus(char.level);
  const xpNext = getXpForNextLevel(char.level);
  const totalWeight = char.inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const carryCapacity = getCarryCapacity(char.attributes.str);

  const cycleSkillProficiency = (skill: Skill) => {
    const current = char.skillProficiencies[skill] || "none";
    const next = current === "none" ? "proficient" : current === "proficient" ? "expertise" : "none";
    const updated = { ...char.skillProficiencies };
    if (next === "none") delete updated[skill];
    else updated[skill] = next;
    update({ skillProficiencies: updated });
  };

  const toggleSaveProficiency = (attr: Attribute) => {
    const current = char.savingThrowProficiencies;
    const updated = current.includes(attr)
      ? current.filter((a) => a !== attr)
      : [...current, attr];
    update({ savingThrowProficiencies: updated });
  };

  const toggleCondition = (condition: Condition) => {
    const current = char.conditions;
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    update({ conditions: updated });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button onClick={() => router.push("/character")} className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-2">
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* 1. Identity */}
      <ScrollSection title="Identidade">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Input label="Nome" value={char.name} onChange={(e) => update({ name: e.target.value })} className="col-span-2 md:col-span-1" />
          <Select label="Raça" options={RACE_OPTIONS} value={char.race} onChange={(e) => update({ race: e.target.value as Character["race"] })} />
          <Select label="Classe" options={CLASS_OPTIONS} value={char.class} onChange={(e) => update({ class: e.target.value as Character["class"] })} />
          <Input label="Nível" type="number" value={char.level} onChange={(e) => update({ level: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })} />
          <Input label="Background" value={char.background} onChange={(e) => update({ background: e.target.value })} />
          <Select label="Alinhamento" options={ALIGNMENT_OPTIONS} value={char.alignment} onChange={(e) => update({ alignment: e.target.value as Character["alignment"] })} />
          <Input label="XP" type="number" value={char.xp} onChange={(e) => update({ xp: Math.max(0, parseInt(e.target.value) || 0) })} />
          {xpNext && <p className="text-xs text-parchment-light/40 self-end pb-2">Próximo nível: {xpNext} XP</p>}
        </div>
        <p className="text-xs text-gold/50 mt-2">Bônus de Proficiência: {formatModifier(profBonus)}</p>
      </ScrollSection>

      {/* 2. Attributes */}
      <ScrollSection title="Atributos">
        <div className="flex justify-end mb-2">
          <Button variant="ghost" size="sm" onClick={() => setShowAttrGen(true)}>
            <Dices size={14} className="mr-1" /> Gerar Atributos
          </Button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {ATTRIBUTES.map((attr) => (
            <StatBox
              key={attr}
              attribute={attr}
              value={char.attributes[attr]}
              onChange={(value) => update({ attributes: { ...char.attributes, [attr]: value } })}
            />
          ))}
        </div>
        <AttributeGeneration
          isOpen={showAttrGen}
          onClose={() => setShowAttrGen(false)}
          onApply={(attributes) => update({ attributes })}
        />
      </ScrollSection>

      {/* 3. Combat */}
      <ScrollSection title="Combate">
        <HpTracker
          hp={char.hp}
          ac={char.ac}
          onChange={(hp) => update({ hp })}
          onAcChange={(ac) => update({ ac })}
        />
        <div className="flex gap-4 mt-3">
          <Input label="Iniciativa" type="number" value={char.initiative} onChange={(e) => update({ initiative: parseInt(e.target.value) || 0 })} className="w-24" />
          <Input label="Deslocamento" type="number" value={char.speed} onChange={(e) => update({ speed: parseInt(e.target.value) || 30 })} className="w-24" />
        </div>
        <div className="mt-3">
          <DeathSaves successes={char.deathSaves.successes} failures={char.deathSaves.failures} onChange={(deathSaves) => update({ deathSaves })} />
        </div>
        <div className="flex gap-4 mt-3 items-center">
          <span className="text-sm text-parchment-light/60 font-cinzel">Hit Dice</span>
          <span className="text-sm text-parchment-light">d{char.hitDice.dieType}</span>
          <span className="text-sm text-parchment-light/50">{char.hitDice.total - char.hitDice.used}/{char.hitDice.total}</span>
        </div>
      </ScrollSection>

      {/* 4. Saving Throws */}
      <ScrollSection title="Saving Throws">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ATTRIBUTES.map((attr) => {
            const prof = char.savingThrowProficiencies.includes(attr);
            const value = getModifier(char.attributes[attr]) + (prof ? profBonus : 0);
            return (
              <div key={attr} className="flex items-center gap-2">
                <button
                  onClick={() => toggleSaveProficiency(attr)}
                  className="w-4 h-4 rounded-full border border-gold/40 flex items-center justify-center"
                >
                  {prof && <div className="w-2 h-2 rounded-full bg-gold" />}
                </button>
                <span className="text-sm text-parchment-light/80 flex-1">{attr.toUpperCase()}</span>
                <span className="font-cinzel text-sm">{formatModifier(value)}</span>
              </div>
            );
          })}
        </div>
      </ScrollSection>

      {/* 5. Skills */}
      <ScrollSection title="Perícias">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {SKILLS.map((skill) => {
            const data = skillsData.find((s) => s.slug === skill);
            return (
              <SkillRow
                key={skill}
                skill={skill}
                skillName={data?.name || skill}
                attributeScore={char.attributes[SKILL_ATTRIBUTE_MAP[skill]]}
                level={char.level}
                proficiency={char.skillProficiencies[skill] || "none"}
                onToggle={() => cycleSkillProficiency(skill)}
              />
            );
          })}
        </div>
      </ScrollSection>

      {/* 6. Attacks */}
      <ScrollSection title="Ataques">
        {char.attacks.map((attack, i) => (
          <AttackRow
            key={attack.id}
            attack={attack}
            onChange={(updated) => {
              const attacks = [...char.attacks];
              attacks[i] = updated;
              update({ attacks });
            }}
            onDelete={() => update({ attacks: char.attacks.filter((_, j) => j !== i) })}
          />
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => update({
            attacks: [...char.attacks, { id: generateId(), name: "", attackBonus: 0, damage: "", damageType: "slashing" }],
          })}
          className="mt-2"
        >
          + Adicionar Ataque
        </Button>
      </ScrollSection>

      {/* 7. Spells */}
      <ScrollSection title="Magias" defaultOpen={false}>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const slot = char.spellSlots[level];
            if (!slot || slot.max === 0) return null;
            return (
              <SpellSlotTracker
                key={level}
                level={level}
                max={slot.max}
                used={slot.used}
                onChange={(used) => update({
                  spellSlots: { ...char.spellSlots, [level]: { ...slot, used } },
                })}
              />
            );
          })}
        </div>
      </ScrollSection>

      {/* 8. Conditions */}
      <ScrollSection title="Condições">
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((condition) => (
            <ConditionBadge
              key={condition}
              condition={condition}
              active={char.conditions.includes(condition)}
              onToggle={() => toggleCondition(condition)}
            />
          ))}
        </div>
      </ScrollSection>

      {/* 9. Inventory */}
      <ScrollSection title="Inventário">
        <div className="mb-2 text-xs text-parchment-light/40">
          Peso: {totalWeight.toFixed(1)} / {carryCapacity.toFixed(1)} kg
          {totalWeight > carryCapacity && <span className="text-blood ml-2">Sobrecarregado!</span>}
        </div>

        {/* Coins */}
        <div className="flex gap-2 mb-3">
          {(["cp", "sp", "ep", "gp", "pp"] as const).map((coin) => (
            <div key={coin} className="text-center">
              <label className="text-xs text-gold/50 font-cinzel uppercase">{coin}</label>
              <input
                type="number"
                value={char.coins[coin]}
                onChange={(e) => update({ coins: { ...char.coins, [coin]: Math.max(0, parseInt(e.target.value) || 0) } })}
                className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-sm text-parchment-light focus:outline-none focus:border-gold"
              />
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="text-xs text-parchment-light/30 flex gap-2 mb-1">
          <span className="flex-1">Item</span>
          <span className="w-12 text-center">Qtd</span>
          <span className="w-16 text-center">Peso</span>
          <span className="w-16 text-center">PO</span>
        </div>
        {char.inventory.map((item, i) => (
          <InventoryRow
            key={item.id}
            item={item}
            onChange={(updated) => {
              const inventory = [...char.inventory];
              inventory[i] = updated;
              update({ inventory });
            }}
            onDelete={() => update({ inventory: char.inventory.filter((_, j) => j !== i) })}
          />
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => update({
            inventory: [...char.inventory, { id: generateId(), name: "", quantity: 1, weight: 0, valuePO: 0, description: "" }],
          })}
          className="mt-2"
        >
          + Adicionar Item
        </Button>
      </ScrollSection>

      {/* 10. Traits & Notes */}
      <ScrollSection title="Traços & Notas" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Textarea label="Traços de Personalidade" value={char.traits.personality} onChange={(e) => update({ traits: { ...char.traits, personality: e.target.value } })} rows={3} />
          <Textarea label="Ideais" value={char.traits.ideals} onChange={(e) => update({ traits: { ...char.traits, ideals: e.target.value } })} rows={3} />
          <Textarea label="Vínculos" value={char.traits.bonds} onChange={(e) => update({ traits: { ...char.traits, bonds: e.target.value } })} rows={3} />
          <Textarea label="Fraquezas" value={char.traits.flaws} onChange={(e) => update({ traits: { ...char.traits, flaws: e.target.value } })} rows={3} />
        </div>
        <div className="grid grid-cols-1 gap-3 mt-4">
          <Textarea label="Aparência" value={char.notes.appearance} onChange={(e) => update({ notes: { ...char.notes, appearance: e.target.value } })} rows={3} />
          <Textarea label="História Pessoal" value={char.notes.backstory} onChange={(e) => update({ notes: { ...char.notes, backstory: e.target.value } })} rows={5} />
          <Textarea label="Aliados & Organizações" value={char.notes.allies} onChange={(e) => update({ notes: { ...char.notes, allies: e.target.value } })} rows={3} />
          <Textarea label="Notas Livres" value={char.notes.freeNotes} onChange={(e) => update({ notes: { ...char.notes, freeNotes: e.target.value } })} rows={5} />
        </div>
      </ScrollSection>
    </div>
  );
}
```

- [x] **Step 3: Verify pages load**

```bash
npm run dev
```

Navigate to `/character` — should show empty state. Click "Novo Personagem" — should navigate to sheet. Fill in fields — should auto-save.

- [x] **Step 4: Commit**

```bash
git add app/character/
git commit -m "feat: add character list and full character sheet pages

List with create/delete, sheet with 10 collapsible sections: identity,
attributes (with generator), combat, saving throws, skills, attacks,
spells, conditions, inventory, and traits/notes. Auto-saves to localStorage."
```

---

### Task 15: Compendium Pages

**Files:**
- Create: `app/compendium/page.tsx`, `app/compendium/[category]/page.tsx`, `app/compendium/[category]/[slug]/page.tsx`

- [x] **Step 1: Create compendium hub page**

Create `app/compendium/page.tsx`:

```tsx
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryHub } from "@/components/compendium/CategoryHub";

export default function CompendiumPage() {
  return (
    <div>
      <SectionHeader title="Compêndio" />
      <p className="text-parchment-light/50 text-center mb-8">
        Consulte raças, classes, magias, monstros, itens e regras do D&D 5e
      </p>
      <CategoryHub />
    </div>
  );
}
```

- [x] **Step 2: Create category list page**

Create `app/compendium/[category]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import racesData from "@/data/races.json";
import classesData from "@/data/classes.json";
import conditionsData from "@/data/conditions.json";
import rulesData from "@/data/rules.json";
import { fetchSpells, fetchMonsters, fetchMagicItems } from "@/lib/open5e";
import { CompendiumListClient } from "./CompendiumListClient";

const STATIC_CATEGORIES = {
  races: { data: racesData, label: "Raças" },
  classes: { data: classesData, label: "Classes" },
  conditions: { data: conditionsData, label: "Condições" },
  rules: { data: rulesData, label: "Regras Rápidas" },
};

type StaticCategory = keyof typeof STATIC_CATEGORIES;
type ApiCategory = "spells" | "monsters" | "items";

const API_LABELS: Record<ApiCategory, string> = {
  spells: "Magias",
  monsters: "Monstros",
  items: "Itens Mágicos",
};

const VALID_CATEGORIES = [...Object.keys(STATIC_CATEGORIES), "spells", "monsters", "items"];

interface PageProps {
  params: { category: string };
}

export function generateStaticParams() {
  return Object.keys(STATIC_CATEGORIES).map((category) => ({ category }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = params;

  if (!VALID_CATEGORIES.includes(category)) notFound();

  // Static categories
  if (category in STATIC_CATEGORIES) {
    const { data, label } = STATIC_CATEGORIES[category as StaticCategory];
    const items = (data as { slug: string; name: string; description?: string; content?: string }[]).map((d) => ({
      slug: d.slug,
      name: d.name,
      description: d.description || d.content || "",
    }));
    return <CompendiumListClient category={category} label={label} items={items} />;
  }

  // API categories
  const apiCategory = category as ApiCategory;
  const label = API_LABELS[apiCategory];

  let items: { slug: string; name: string; description: string; meta?: Record<string, string> }[] = [];

  if (apiCategory === "spells") {
    const spells = await fetchSpells();
    items = spells.map((s) => ({
      slug: s.slug, name: s.name,
      description: s.desc.slice(0, 150),
      meta: { level: String(s.level_int), school: s.school, class: s.dnd_class },
    }));
  } else if (apiCategory === "monsters") {
    const monsters = await fetchMonsters();
    items = monsters.map((m) => ({
      slug: m.slug, name: m.name,
      description: `${m.type} — CR ${m.challenge_rating}`,
      meta: { cr: m.challenge_rating, type: m.type, size: m.size },
    }));
  } else if (apiCategory === "items") {
    const magicItems = await fetchMagicItems();
    items = magicItems.map((i) => ({
      slug: i.slug, name: i.name,
      description: i.desc.slice(0, 150),
      meta: { rarity: i.rarity, type: i.type },
    }));
  }

  return <CompendiumListClient category={category} label={label} items={items} />;
}
```

Create `app/compendium/[category]/CompendiumListClient.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { SearchBar } from "@/components/compendium/SearchBar";
import { CompendiumCard } from "@/components/compendium/CompendiumCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Item {
  slug: string;
  name: string;
  description: string;
  meta?: Record<string, string>;
}

interface Props {
  category: string;
  label: string;
  items: Item[];
}

export function CompendiumListClient({ category, label, items }: Props) {
  const [query, setQuery] = useState("");

  const onSearch = useCallback((q: string) => setQuery(q.toLowerCase()), []);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );

  return (
    <div>
      <Link href="/compendium" className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4">
        <ArrowLeft size={16} /> Compêndio
      </Link>
      <SectionHeader title={label} />
      <div className="mb-6">
        <SearchBar onSearch={onSearch} placeholder={`Buscar em ${label.toLowerCase()}...`} />
      </div>
      <p className="text-sm text-parchment-light/40 mb-4">{filtered.length} resultados</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => (
          <CompendiumCard
            key={item.slug}
            href={`/compendium/${category}/${item.slug}`}
            name={item.name}
            subtitle={item.meta ? Object.values(item.meta).join(" · ") : undefined}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
}
```

- [x] **Step 3: Create detail page**

Create `app/compendium/[category]/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import racesData from "@/data/races.json";
import classesData from "@/data/classes.json";
import conditionsData from "@/data/conditions.json";
import rulesData from "@/data/rules.json";
import { fetchSpellBySlug, fetchMonsterBySlug, fetchMagicItemBySlug } from "@/lib/open5e";
import { Card } from "@/components/ui/Card";

interface PageProps {
  params: { category: string; slug: string };
}

export default async function CompendiumDetailPage({ params }: PageProps) {
  const { category, slug } = params;

  let content: React.ReactNode = null;
  let title = "";

  if (category === "races") {
    const race = racesData.find((r) => r.slug === slug);
    if (!race) notFound();
    title = race.name;
    content = (
      <div className="space-y-4">
        <p className="text-ink/70">{race.description}</p>
        <div><strong className="text-ink font-cinzel">Deslocamento:</strong> {race.speed}ft</div>
        <div><strong className="text-ink font-cinzel">Visão no Escuro:</strong> {race.darkvision ? "Sim" : "Não"}</div>
        <div><strong className="text-ink font-cinzel">Idiomas:</strong> {race.languages.join(", ")}</div>
        <div>
          <strong className="text-ink font-cinzel">Bônus de Atributo:</strong>
          <span className="ml-2">{Object.entries(race.abilityBonuses).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(", ")}</span>
        </div>
        <div>
          <strong className="text-ink font-cinzel">Traços:</strong>
          <ul className="list-disc list-inside mt-1">
            {race.traits.map((t, i) => <li key={i} className="text-ink/70">{t}</li>)}
          </ul>
        </div>
      </div>
    );
  } else if (category === "classes") {
    const cls = classesData.find((c) => c.slug === slug);
    if (!cls) notFound();
    title = cls.name;
    content = (
      <div className="space-y-4">
        <div><strong className="text-ink font-cinzel">Dado de Vida:</strong> d{cls.hitDie}</div>
        <div><strong className="text-ink font-cinzel">Saving Throws:</strong> {cls.savingThrows.map((s) => s.toUpperCase()).join(", ")}</div>
        <div><strong className="text-ink font-cinzel">Proficiências de Armadura:</strong> {cls.armorProficiencies.join(", ")}</div>
        <div><strong className="text-ink font-cinzel">Proficiências de Arma:</strong> {cls.weaponProficiencies.join(", ")}</div>
        <div>
          <strong className="text-ink font-cinzel">Características:</strong>
          <div className="space-y-2 mt-2">
            {cls.features.map((f, i) => (
              <div key={i} className="border-l-2 border-gold/30 pl-3">
                <span className="text-xs text-gold/60">Nível {f.level}</span>
                <h4 className="font-cinzel text-sm text-ink font-bold">{f.name}</h4>
                <p className="text-xs text-ink/60">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else if (category === "conditions") {
    const cond = conditionsData.find((c) => c.slug === slug);
    if (!cond) notFound();
    title = cond.name;
    content = <p className="text-ink/70">{cond.description}</p>;
  } else if (category === "rules") {
    const rule = rulesData.find((r) => r.slug === slug);
    if (!rule) notFound();
    title = rule.name;
    content = <div className="text-ink/70 whitespace-pre-wrap">{rule.content}</div>;
  } else if (category === "spells") {
    const spell = await fetchSpellBySlug(slug);
    if (!spell) notFound();
    title = spell.name;
    content = (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3 text-sm">
          <span><strong className="text-ink font-cinzel">Nível:</strong> {spell.level_int === 0 ? "Cantrip" : spell.level_int}</span>
          <span><strong className="text-ink font-cinzel">Escola:</strong> {spell.school}</span>
          <span><strong className="text-ink font-cinzel">Tempo:</strong> {spell.casting_time}</span>
          <span><strong className="text-ink font-cinzel">Alcance:</strong> {spell.range}</span>
        </div>
        <div className="text-sm">
          <strong className="text-ink font-cinzel">Componentes:</strong> {spell.components}
        </div>
        <div className="text-sm">
          <strong className="text-ink font-cinzel">Duração:</strong> {spell.duration}
          {spell.concentration === "yes" && <span className="text-gold ml-2">(Concentração)</span>}
        </div>
        <div className="text-sm">
          <strong className="text-ink font-cinzel">Classes:</strong> {spell.dnd_class}
        </div>
        <hr className="border-gold/20" />
        <p className="text-ink/70 whitespace-pre-wrap">{spell.desc}</p>
        {spell.higher_level && (
          <div>
            <strong className="text-ink font-cinzel text-sm">Em Níveis Superiores:</strong>
            <p className="text-ink/60 text-sm">{spell.higher_level}</p>
          </div>
        )}
      </div>
    );
  } else if (category === "monsters") {
    const monster = await fetchMonsterBySlug(slug);
    if (!monster) notFound();
    title = monster.name;
    content = (
      <div className="space-y-3">
        <div className="text-sm text-ink/60">{monster.size} {monster.type} — CR {monster.challenge_rating}</div>
        <div className="flex gap-4 text-sm">
          <span><strong>HP:</strong> {monster.hit_points}</span>
          <span><strong>AC:</strong> {monster.armor_class}</span>
        </div>
        <div className="grid grid-cols-6 gap-2 text-center text-sm">
          {(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const).map((attr) => (
            <div key={attr}>
              <div className="text-xs text-gold/60 font-cinzel">{attr.slice(0, 3).toUpperCase()}</div>
              <div className="text-ink">{monster[attr]}</div>
            </div>
          ))}
        </div>
        {monster.actions?.length > 0 && (
          <div>
            <strong className="text-ink font-cinzel">Ações:</strong>
            {monster.actions.map((a, i) => (
              <div key={i} className="mt-1">
                <span className="font-bold text-sm text-ink">{a.name}.</span>
                <span className="text-sm text-ink/60 ml-1">{a.desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else if (category === "items") {
    const item = await fetchMagicItemBySlug(slug);
    if (!item) notFound();
    title = item.name;
    content = (
      <div className="space-y-3">
        <div className="flex gap-3 text-sm">
          <span><strong className="text-ink font-cinzel">Tipo:</strong> {item.type}</span>
          <span><strong className="text-ink font-cinzel">Raridade:</strong> {item.rarity}</span>
          {item.requires_attunement && <span className="text-gold">Requer Sintonização</span>}
        </div>
        <p className="text-ink/70 whitespace-pre-wrap">{item.desc}</p>
      </div>
    );
  } else {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/compendium/${category}`} className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <Card variant="parchment" className="p-6">
        <h1 className="font-cinzel text-2xl text-ink mb-4 border-b border-gold/30 pb-2">{title}</h1>
        {content}
      </Card>
    </div>
  );
}
```

- [x] **Step 4: Verify compendium navigation**

```bash
npm run dev
```

Navigate to `/compendium` — should show category hub. Click "Raças" — should show 9 races. Click a race — should show detail. Check that `/compendium/spells` loads from Open5e (may take a moment).

- [x] **Step 5: Commit**

```bash
git add app/compendium/
git commit -m "feat: add compendium pages with hybrid data (JSON + Open5e)

Hub, category list with search, and detail pages. Static categories
(races, classes, conditions, rules) via JSON. API categories (spells,
monsters, items) fetched from Open5e with 24h cache."
```

---

### Task 16: Master Pages

**Files:**
- Create: `app/master/page.tsx`, `app/master/layout.tsx`, `app/master/campaign/[id]/page.tsx`, `app/master/encounter/[id]/page.tsx`

- [x] **Step 1: Create master layout with PinGuard**

Create `app/master/layout.tsx`:

```tsx
import { PinGuard } from "@/components/master/PinGuard";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return <PinGuard>{children}</PinGuard>;
}
```

- [x] **Step 2: Create master dashboard page**

Create `app/master/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useCampaignStore } from "@/store/campaignStore";
import { CampaignCard } from "@/components/master/CampaignCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Plus } from "lucide-react";

export default function MasterPage() {
  const { campaigns, createCampaign } = useCampaignStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [world, setWorld] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    createCampaign({ name, description, world });
    setName("");
    setDescription("");
    setWorld("");
    setShowCreate(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Área do Mestre" />
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus size={16} className="mr-1" /> Nova Campanha
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-parchment-light/50 mb-4">Nenhuma campanha criada ainda.</p>
          <Button onClick={() => setShowCreate(true)}>Criar Primeira Campanha</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nova Campanha">
        <div className="space-y-3">
          <Input label="Nome da Campanha" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <Input label="Mundo" value={world} onChange={(e) => setWorld(e.target.value)} placeholder="Forgotten Realms, Eberron..." />
          <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <Button onClick={handleCreate} className="w-full">Criar Campanha</Button>
        </div>
      </Modal>
    </div>
  );
}
```

- [x] **Step 3: Create campaign detail page with tabs**

Create `app/master/campaign/[id]/page.tsx`:

```tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useCampaignStore } from "@/store/campaignStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { NpcCard } from "@/components/master/NpcCard";
import { EncounterPlanner } from "@/components/master/EncounterPlanner";
import { RichTextEditor } from "@/components/master/RichTextEditor";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { ALIGNMENTS, ATTRIBUTES, type NPC, type Alignment, type EncounterMonster, type Encounter } from "@/types/dnd5e";
import { ArrowLeft, Users, Swords, ScrollText, StickyNote, Plus } from "lucide-react";
import Link from "next/link";
import { generateId } from "@/lib/utils";

const TABS = [
  { key: "npcs", label: "NPCs", icon: Users },
  { key: "encounters", label: "Encontros", icon: Swords },
  { key: "sessions", label: "Sessões", icon: ScrollText },
  { key: "notes", label: "Notas", icon: StickyNote },
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

export default function CampaignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    getCampaign, addNpc, updateNpc, deleteNpc,
    addEncounter, deleteEncounter, updateCampaignNotes,
    addSession,
  } = useCampaignStore();

  const campaign = getCampaign(id);
  const [tab, setTab] = useState<TabKey>("npcs");
  const [showNpcModal, setShowNpcModal] = useState(false);
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingNpc, setEditingNpc] = useState<NPC | null>(null);

  // NPC form state
  const [npcForm, setNpcForm] = useState({ name: "", race: "", profession: "", alignment: "true-neutral" as Alignment, role: "neutral" as NPC["role"], notes: "", secrets: "", relationships: "" });
  // Encounter form
  const [encName, setEncName] = useState("");
  const [encPartyLevel, setEncPartyLevel] = useState(1);
  const [encPartySize, setEncPartySize] = useState(4);
  const [encMonsters, setEncMonsters] = useState<EncounterMonster[]>([]);
  // Session form
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionSummary, setSessionSummary] = useState("");

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-parchment-light/50 mb-4">Campanha não encontrada.</p>
        <Button onClick={() => router.push("/master")}>Voltar</Button>
      </div>
    );
  }

  const handleAddNpc = () => {
    if (!npcForm.name.trim()) return;
    const defaultAttrs = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } as Record<typeof ATTRIBUTES[number], number>;
    addNpc(id, {
      ...npcForm,
      hp: { max: 10, current: 10 },
      ac: 10,
      attributes: defaultAttrs,
      avatar: npcForm.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    });
    setNpcForm({ name: "", race: "", profession: "", alignment: "true-neutral", role: "neutral", notes: "", secrets: "", relationships: "" });
    setShowNpcModal(false);
  };

  const handleAddEncounter = () => {
    if (!encName.trim()) return;
    addEncounter(id, {
      name: encName,
      monsters: encMonsters,
      playerCharacters: [],
      partyLevel: encPartyLevel,
      partySize: encPartySize,
      status: "planning",
    });
    setEncName("");
    setEncMonsters([]);
    setShowEncounterModal(false);
  };

  const handleAddSession = () => {
    if (!sessionTitle.trim()) return;
    addSession(id, { date: new Date().toISOString(), title: sessionTitle, summary: sessionSummary, tags: [], notes: "" });
    setSessionTitle("");
    setSessionSummary("");
    setShowSessionModal(false);
  };

  return (
    <div>
      <Link href="/master" className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4">
        <ArrowLeft size={16} /> Dashboard
      </Link>

      <h1 className="font-cinzel text-2xl text-gold mb-1">{campaign.name}</h1>
      {campaign.world && <p className="text-parchment-light/40 text-sm mb-4">{campaign.world}</p>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gold/20">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 font-cinzel text-sm border-b-2 transition-colors ${
              tab === t.key ? "border-gold text-gold" : "border-transparent text-parchment-light/40 hover:text-parchment-light"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* NPCs Tab */}
      {tab === "npcs" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowNpcModal(true)}><Plus size={14} className="mr-1" /> Novo NPC</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaign.npcs.map((npc) => (
              <NpcCard key={npc.id} npc={npc} onClick={() => setEditingNpc(npc)} />
            ))}
          </div>
          {campaign.npcs.length === 0 && <p className="text-center text-parchment-light/40 py-10">Nenhum NPC cadastrado.</p>}

          <Modal isOpen={showNpcModal} onClose={() => setShowNpcModal(false)} title="Novo NPC">
            <div className="space-y-3">
              <Input label="Nome" value={npcForm.name} onChange={(e) => setNpcForm({ ...npcForm, name: e.target.value })} autoFocus />
              <Input label="Raça" value={npcForm.race} onChange={(e) => setNpcForm({ ...npcForm, race: e.target.value })} />
              <Input label="Profissão" value={npcForm.profession} onChange={(e) => setNpcForm({ ...npcForm, profession: e.target.value })} />
              <Select label="Alinhamento" options={ALIGNMENT_OPTIONS} value={npcForm.alignment} onChange={(e) => setNpcForm({ ...npcForm, alignment: e.target.value as Alignment })} />
              <Select label="Papel" options={ROLE_OPTIONS} value={npcForm.role} onChange={(e) => setNpcForm({ ...npcForm, role: e.target.value as NPC["role"] })} />
              <Textarea label="Notas" value={npcForm.notes} onChange={(e) => setNpcForm({ ...npcForm, notes: e.target.value })} rows={2} />
              <Textarea label="Segredos (só DM)" value={npcForm.secrets} onChange={(e) => setNpcForm({ ...npcForm, secrets: e.target.value })} rows={2} />
              <Button onClick={handleAddNpc} className="w-full">Criar NPC</Button>
            </div>
          </Modal>

          {/* NPC detail modal */}
          <Modal isOpen={!!editingNpc} onClose={() => setEditingNpc(null)} title={editingNpc?.name || ""}>
            {editingNpc && (
              <div className="space-y-3 text-sm">
                <p><strong className="text-gold">Raça:</strong> {editingNpc.race}</p>
                <p><strong className="text-gold">Profissão:</strong> {editingNpc.profession}</p>
                <p><strong className="text-gold">Papel:</strong> {ROLE_OPTIONS.find((r) => r.value === editingNpc.role)?.label}</p>
                <p><strong className="text-gold">HP:</strong> {editingNpc.hp.current}/{editingNpc.hp.max} | <strong className="text-gold">AC:</strong> {editingNpc.ac}</p>
                {editingNpc.notes && <div><strong className="text-gold">Notas:</strong><p className="text-parchment-light/60">{editingNpc.notes}</p></div>}
                {editingNpc.secrets && <div className="p-2 bg-blood/10 border border-blood/20 rounded"><strong className="text-blood-light">Segredos:</strong><p className="text-parchment-light/60">{editingNpc.secrets}</p></div>}
                <div className="flex gap-2 pt-2">
                  <Button variant="danger" size="sm" onClick={() => { deleteNpc(id, editingNpc.id); setEditingNpc(null); }}>Excluir</Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      {/* Encounters Tab */}
      {tab === "encounters" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowEncounterModal(true)}><Plus size={14} className="mr-1" /> Novo Encontro</Button>
          </div>
          <div className="space-y-3">
            {campaign.encounters.map((enc) => (
              <Card key={enc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-cinzel text-gold">{enc.name}</h4>
                    <p className="text-xs text-parchment-light/40">
                      {enc.monsters.length} monstros — {enc.difficulty.toUpperCase()} — {enc.adjustedXP} XP ajustado
                    </p>
                  </div>
                  <Link href={`/master/encounter/${enc.id}?campaign=${id}`}>
                    <Button size="sm" variant="secondary">Tracker</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          {campaign.encounters.length === 0 && <p className="text-center text-parchment-light/40 py-10">Nenhum encontro cadastrado.</p>}

          <Modal isOpen={showEncounterModal} onClose={() => setShowEncounterModal(false)} title="Novo Encontro" className="max-w-2xl">
            <div className="space-y-4">
              <Input label="Nome do Encontro" value={encName} onChange={(e) => setEncName(e.target.value)} />
              <EncounterPlanner
                partyLevel={encPartyLevel}
                partySize={encPartySize}
                onPartyChange={(l, s) => { setEncPartyLevel(l); setEncPartySize(s); }}
                monsters={encMonsters}
                onMonstersChange={setEncMonsters}
              />
              <Button onClick={handleAddEncounter} className="w-full">Criar Encontro</Button>
            </div>
          </Modal>
        </div>
      )}

      {/* Sessions Tab */}
      {tab === "sessions" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowSessionModal(true)}><Plus size={14} className="mr-1" /> Nova Sessão</Button>
          </div>
          <div className="space-y-3">
            {campaign.sessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-cinzel text-gold">{session.title}</h4>
                    <p className="text-xs text-parchment-light/40">{new Date(session.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                {session.summary && <p className="text-sm text-parchment-light/60 mt-2">{session.summary}</p>}
              </Card>
            ))}
          </div>
          {campaign.sessions.length === 0 && <p className="text-center text-parchment-light/40 py-10">Nenhuma sessão registrada.</p>}

          <Modal isOpen={showSessionModal} onClose={() => setShowSessionModal(false)} title="Nova Sessão">
            <div className="space-y-3">
              <Input label="Título" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} autoFocus />
              <Textarea label="Resumo" value={sessionSummary} onChange={(e) => setSessionSummary(e.target.value)} rows={4} />
              <Button onClick={handleAddSession} className="w-full">Registrar Sessão</Button>
            </div>
          </Modal>
        </div>
      )}

      {/* Notes Tab */}
      {tab === "notes" && (
        <div>
          <RichTextEditor
            content={campaign.notes}
            onChange={(notes) => updateCampaignNotes(id, notes)}
            placeholder="Notas da campanha, hooks de aventura, segredos pendentes..."
          />
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 4: Create encounter tracker page**

Create `app/master/encounter/[id]/page.tsx`:

```tsx
"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useCampaignStore } from "@/store/campaignStore";
import { EncounterTracker } from "@/components/master/EncounterTracker";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import type { Encounter } from "@/types/dnd5e";

export default function EncounterTrackerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const encounterId = params.id as string;
  const campaignId = searchParams.get("campaign") || "";
  const { getCampaign, updateEncounter } = useCampaignStore();

  const campaign = getCampaign(campaignId);
  const encounter = campaign?.encounters.find((e) => e.id === encounterId);

  if (!encounter || !campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-parchment-light/50 mb-4">Encontro não encontrado.</p>
        <Button onClick={() => router.push("/master")}>Voltar</Button>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Encounter>) => {
    updateEncounter(campaignId, encounterId, updates);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4">
        <ArrowLeft size={16} /> Voltar à Campanha
      </button>

      <h1 className="font-cinzel text-2xl text-gold mb-4">{encounter.name}</h1>

      <EncounterTracker encounter={encounter} onUpdate={handleUpdate} />
    </div>
  );
}
```

- [x] **Step 5: Verify master area**

```bash
npm run dev
```

Navigate to `/master` — should prompt for PIN. Create PIN → see dashboard. Create campaign → navigate → add NPC, encounter, session, notes.

- [x] **Step 6: Commit**

```bash
git add app/master/
git commit -m "feat: add DM dashboard pages with PIN auth

Campaign CRUD, tabbed campaign view (NPCs, Encounters, Sessions, Notes),
encounter tracker page, and TipTap rich text notes with auto-save."
```

---

