# Plano: Etapa 3 — Componentes de Cada Modulo (T11-T13)

**Status:** ✅ Completo
**Specs:** `01-domain.md`, `02-compendium.md`, `03-master.md`

---

### Task 11: Character Sheet Components

**Files:**
- Create all files in `components/character/`

- [x] **Step 1: Create StatBox component**

Create `components/character/StatBox.tsx`:

```tsx
"use client";

import { getModifier } from "@/lib/dnd5e";
import { formatModifier } from "@/lib/utils";
import type { Attribute } from "@/types/dnd5e";

const ATTR_LABELS: Record<Attribute, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

interface StatBoxProps {
  attribute: Attribute;
  value: number;
  onChange: (value: number) => void;
}

export function StatBox({ attribute, value, onChange }: StatBoxProps) {
  const mod = getModifier(value);

  return (
    <div className="flex flex-col items-center bg-ink-light border border-gold/30 rounded-lg p-3 min-w-[80px]">
      <span className="font-cinzel text-xs text-gold/70 tracking-wider">{ATTR_LABELS[attribute]}</span>
      <span className="font-cinzel text-2xl text-parchment-light font-bold">{formatModifier(mod)}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
        className="w-12 text-center bg-parchment/10 border border-gold/20 rounded text-sm text-parchment-light mt-1 py-0.5 focus:outline-none focus:border-gold"
      />
    </div>
  );
}
```

- [x] **Step 2: Create SkillRow component**

Create `components/character/SkillRow.tsx`:

```tsx
"use client";

import { getModifier, getProficiencyBonus, getSkillValue } from "@/lib/dnd5e";
import { formatModifier } from "@/lib/utils";
import type { Skill, Attribute } from "@/types/dnd5e";
import { SKILL_ATTRIBUTE_MAP } from "@/types/dnd5e";

interface SkillRowProps {
  skill: Skill;
  skillName: string;
  attributeScore: number;
  level: number;
  proficiency: "none" | "proficient" | "expertise";
  onToggle: () => void;
}

const CYCLE: ("none" | "proficient" | "expertise")[] = ["none", "proficient", "expertise"];

const ATTR_SHORT: Record<Attribute, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

export function SkillRow({ skill, skillName, attributeScore, level, proficiency, onToggle }: SkillRowProps) {
  const attr = SKILL_ATTRIBUTE_MAP[skill];
  const profBonus = getProficiencyBonus(level);
  const value = getSkillValue(attributeScore, profBonus, proficiency);

  return (
    <div className="flex items-center gap-2 py-1 text-sm">
      <button
        onClick={onToggle}
        className="w-4 h-4 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0"
        title={`Proficiência: ${proficiency}`}
      >
        {proficiency === "proficient" && <div className="w-2 h-2 rounded-full bg-gold" />}
        {proficiency === "expertise" && <div className="w-3 h-3 rounded-full bg-gold" />}
      </button>
      <span className="font-cinzel text-gold/50 text-xs w-8">{ATTR_SHORT[attr]}</span>
      <span className="flex-1 text-parchment-light/80">{skillName}</span>
      <span className="font-cinzel text-parchment-light w-8 text-right">{formatModifier(value)}</span>
    </div>
  );
}
```

- [x] **Step 3: Create HpTracker component**

Create `components/character/HpTracker.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Heart, Shield, Plus, Minus } from "lucide-react";

interface HpTrackerProps {
  hp: { max: number; current: number; temporary: number };
  ac: number;
  onChange: (hp: { max: number; current: number; temporary: number }) => void;
  onAcChange: (ac: number) => void;
}

export function HpTracker({ hp, ac, onChange, onAcChange }: HpTrackerProps) {
  const [quickValue, setQuickValue] = useState(1);
  const pct = hp.max > 0 ? (hp.current / hp.max) * 100 : 0;
  const barColor = pct > 50 ? "bg-green-600" : pct > 25 ? "bg-yellow-600" : "bg-blood";

  const applyDamage = () => {
    let remaining = quickValue;
    let temp = hp.temporary;
    let current = hp.current;

    if (temp > 0) {
      const absorbedByTemp = Math.min(temp, remaining);
      temp -= absorbedByTemp;
      remaining -= absorbedByTemp;
    }
    current = Math.max(0, current - remaining);
    onChange({ ...hp, current, temporary: temp });
  };

  const applyHeal = () => {
    const current = Math.min(hp.max, hp.current + quickValue);
    onChange({ ...hp, current });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* HP */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} className="text-blood" />
            <span className="font-cinzel text-sm text-gold/70">Hit Points</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={hp.current}
              onChange={(e) => onChange({ ...hp, current: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light focus:outline-none focus:border-gold"
            />
            <span className="text-gold/50">/</span>
            <input
              type="number"
              value={hp.max}
              onChange={(e) => onChange({ ...hp, max: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light focus:outline-none focus:border-gold"
            />
          </div>
          {/* HP bar */}
          <div className="h-2 bg-ink rounded-full mt-2 overflow-hidden">
            <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* AC */}
        <div className="text-center">
          <div className="flex items-center gap-1 mb-1">
            <Shield size={16} className="text-gold" />
            <span className="font-cinzel text-sm text-gold/70">AC</span>
          </div>
          <input
            type="number"
            value={ac}
            onChange={(e) => onAcChange(parseInt(e.target.value) || 10)}
            className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light text-xl font-cinzel focus:outline-none focus:border-gold"
          />
        </div>

        {/* Temp HP */}
        <div className="text-center">
          <span className="font-cinzel text-sm text-gold/70 block mb-1">Temp HP</span>
          <input
            type="number"
            value={hp.temporary}
            onChange={(e) => onChange({ ...hp, temporary: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Quick damage/heal */}
      <div className="flex items-center gap-2">
        <button onClick={applyDamage} className="flex items-center gap-1 px-2 py-1 bg-blood/20 border border-blood/40 rounded text-sm text-red-300 hover:bg-blood/30 transition-colors">
          <Minus size={14} /> Dano
        </button>
        <input
          type="number"
          value={quickValue}
          onChange={(e) => setQuickValue(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 text-center bg-parchment/10 border border-gold/20 rounded py-1 text-parchment-light text-sm focus:outline-none focus:border-gold"
        />
        <button onClick={applyHeal} className="flex items-center gap-1 px-2 py-1 bg-green-900/20 border border-green-700/40 rounded text-sm text-green-300 hover:bg-green-900/30 transition-colors">
          <Plus size={14} /> Cura
        </button>
      </div>
    </div>
  );
}
```

- [x] **Step 4: Create SpellSlotTracker component**

Create `components/character/SpellSlotTracker.tsx`:

```tsx
"use client";

interface SpellSlotTrackerProps {
  level: number;
  max: number;
  used: number;
  onChange: (used: number) => void;
}

export function SpellSlotTracker({ level, max, used, onChange }: SpellSlotTrackerProps) {
  if (max === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="font-cinzel text-xs text-gold/60 w-8">Nv {level}</span>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i < used ? i : i + 1)}
            className={`w-5 h-5 rounded-full border transition-colors ${
              i < used
                ? "bg-gold/20 border-gold/30"
                : "bg-gold border-gold"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-parchment-light/50">{max - used}/{max}</span>
    </div>
  );
}
```

- [x] **Step 5: Create ConditionBadge, DeathSaves, AttackRow, InventoryRow**

Create `components/character/ConditionBadge.tsx`:

```tsx
"use client";

import { Badge } from "@/components/ui/Badge";
import type { Condition } from "@/types/dnd5e";

const CONDITION_LABELS: Record<Condition, string> = {
  blinded: "Cego", charmed: "Enfeitiçado", deafened: "Surdo",
  frightened: "Amedrontado", grappled: "Agarrado", incapacitated: "Incapacitado",
  invisible: "Invisível", paralyzed: "Paralisado", petrified: "Petrificado",
  poisoned: "Envenenado", prone: "Prostrado", stunned: "Atordoado",
};

interface ConditionBadgeProps {
  condition: Condition;
  active: boolean;
  onToggle: () => void;
}

export function ConditionBadge({ condition, active, onToggle }: ConditionBadgeProps) {
  return (
    <Badge
      label={CONDITION_LABELS[condition]}
      active={active}
      onClick={onToggle}
      color="blood"
    />
  );
}
```

Create `components/character/DeathSaves.tsx`:

```tsx
"use client";

import { Skull } from "lucide-react";

interface DeathSavesProps {
  successes: number;
  failures: number;
  onChange: (saves: { successes: number; failures: number }) => void;
}

export function DeathSaves({ successes, failures, onChange }: DeathSavesProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-400 font-cinzel">Sucesso</span>
        {[0, 1, 2].map((i) => (
          <button
            key={`s-${i}`}
            onClick={() => onChange({ successes: i < successes ? i : i + 1, failures })}
            className={`w-4 h-4 rounded-full border transition-colors ${
              i < successes ? "bg-green-500 border-green-400" : "border-green-700/50"
            }`}
          />
        ))}
      </div>
      <Skull size={16} className="text-parchment-light/30" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400 font-cinzel">Falha</span>
        {[0, 1, 2].map((i) => (
          <button
            key={`f-${i}`}
            onClick={() => onChange({ successes, failures: i < failures ? i : i + 1 })}
            className={`w-4 h-4 rounded-full border transition-colors ${
              i < failures ? "bg-blood border-blood-light" : "border-blood/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

Create `components/character/AttackRow.tsx`:

```tsx
"use client";

import { Trash2 } from "lucide-react";
import type { Attack, DamageType, DAMAGE_TYPES } from "@/types/dnd5e";

interface AttackRowProps {
  attack: Attack;
  onChange: (attack: Attack) => void;
  onDelete: () => void;
}

export function AttackRow({ attack, onChange, onDelete }: AttackRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input
        value={attack.name}
        onChange={(e) => onChange({ ...attack, name: e.target.value })}
        placeholder="Nome"
        className="flex-1 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold"
      />
      <input
        type="number"
        value={attack.attackBonus}
        onChange={(e) => onChange({ ...attack, attackBonus: parseInt(e.target.value) || 0 })}
        placeholder="+Atq"
        className="w-16 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold"
      />
      <input
        value={attack.damage}
        onChange={(e) => onChange({ ...attack, damage: e.target.value })}
        placeholder="Dano"
        className="w-20 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold"
      />
      <button onClick={onDelete} className="text-blood/60 hover:text-blood transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
```

Create `components/character/InventoryRow.tsx`:

```tsx
"use client";

import { Trash2 } from "lucide-react";
import type { InventoryItem } from "@/types/dnd5e";

interface InventoryRowProps {
  item: InventoryItem;
  onChange: (item: InventoryItem) => void;
  onDelete: () => void;
}

export function InventoryRow({ item, onChange, onDelete }: InventoryRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
        placeholder="Item"
        className="flex-1 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light focus:outline-none focus:border-gold"
      />
      <input
        type="number"
        value={item.quantity}
        onChange={(e) => onChange({ ...item, quantity: Math.max(0, parseInt(e.target.value) || 0) })}
        className="w-12 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold"
      />
      <input
        type="number"
        value={item.weight}
        step={0.1}
        onChange={(e) => onChange({ ...item, weight: parseFloat(e.target.value) || 0 })}
        className="w-16 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold"
        placeholder="Peso"
      />
      <input
        type="number"
        value={item.valuePO}
        onChange={(e) => onChange({ ...item, valuePO: parseFloat(e.target.value) || 0 })}
        className="w-16 bg-parchment/10 border border-gold/20 rounded px-2 py-1 text-sm text-parchment-light text-center focus:outline-none focus:border-gold"
        placeholder="PO"
      />
      <button onClick={onDelete} className="text-blood/60 hover:text-blood transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
```

- [x] **Step 6: Create AttributeGeneration modal component**

Create `components/character/AttributeGeneration.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { roll4d6DropLowest } from "@/lib/dice";
import { getPointBuyCost, getStandardArray } from "@/lib/dnd5e";
import { formatModifier } from "@/lib/utils";
import { getModifier } from "@/lib/dnd5e";
import type { Attribute } from "@/types/dnd5e";
import { ATTRIBUTES } from "@/types/dnd5e";

type Method = "roll" | "pointBuy" | "standard";

const ATTR_LABELS: Record<Attribute, string> = {
  str: "Força", dex: "Destreza", con: "Constituição",
  int: "Inteligência", wis: "Sabedoria", cha: "Carisma",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (attributes: Record<Attribute, number>) => void;
}

export function AttributeGeneration({ isOpen, onClose, onApply }: Props) {
  const [method, setMethod] = useState<Method>("roll");
  const [values, setValues] = useState<Record<Attribute, number>>({
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  });

  const rollAll = () => {
    const newValues = {} as Record<Attribute, number>;
    ATTRIBUTES.forEach((attr) => {
      newValues[attr] = roll4d6DropLowest().total;
    });
    setValues(newValues);
  };

  const applyStandard = () => {
    const arr = getStandardArray();
    const newValues = {} as Record<Attribute, number>;
    ATTRIBUTES.forEach((attr, i) => {
      newValues[attr] = arr[i];
    });
    setValues(newValues);
  };

  const totalPointBuyCost = ATTRIBUTES.reduce((sum, attr) => sum + getPointBuyCost(values[attr]), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerar Atributos" className="max-w-md">
      <div className="space-y-4">
        {/* Method selector */}
        <div className="flex gap-2">
          {([
            ["roll", "4d6 Drop Lowest"],
            ["pointBuy", "Point Buy (27)"],
            ["standard", "Standard Array"],
          ] as [Method, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => {
                setMethod(m);
                if (m === "standard") applyStandard();
              }}
              className={`flex-1 py-2 px-2 text-xs font-cinzel rounded border transition-colors ${
                method === m
                  ? "bg-gold/20 border-gold text-gold"
                  : "border-gold/20 text-parchment-light/50 hover:text-parchment-light"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {method === "roll" && (
          <Button onClick={rollAll} variant="secondary" size="sm" className="w-full">
            Rolar Todos
          </Button>
        )}

        {method === "pointBuy" && (
          <div className="text-center text-sm">
            <span className={totalPointBuyCost > 27 ? "text-blood" : "text-gold"}>
              Pontos: {totalPointBuyCost}/27
            </span>
          </div>
        )}

        {/* Attribute values */}
        <div className="space-y-2">
          {ATTRIBUTES.map((attr) => (
            <div key={attr} className="flex items-center gap-3">
              <span className="font-cinzel text-sm text-gold/70 w-24">{ATTR_LABELS[attr]}</span>
              {method === "pointBuy" ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setValues({ ...values, [attr]: Math.max(8, values[attr] - 1) })}
                    className="w-6 h-6 rounded bg-parchment/10 text-parchment-light hover:bg-parchment/20"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-parchment-light">{values[attr]}</span>
                  <button
                    onClick={() => setValues({ ...values, [attr]: Math.min(15, values[attr] + 1) })}
                    className="w-6 h-6 rounded bg-parchment/10 text-parchment-light hover:bg-parchment/20"
                  >
                    +
                  </button>
                </div>
              ) : (
                <span className="text-parchment-light text-lg">{values[attr]}</span>
              )}
              <span className="text-parchment-light/50 text-sm">({formatModifier(getModifier(values[attr]))})</span>
            </div>
          ))}
        </div>

        <Button onClick={() => { onApply(values); onClose(); }} className="w-full">
          Aplicar
        </Button>
      </div>
    </Modal>
  );
}
```

- [x] **Step 7: Commit**

```bash
git add components/character/
git commit -m "feat: add character sheet components

StatBox, SkillRow, HpTracker, SpellSlotTracker, ConditionBadge,
DeathSaves, AttackRow, InventoryRow, and AttributeGeneration modal."
```

---

### Task 12: Compendium Components

**Files:**
- Create: `components/compendium/SearchBar.tsx`, `components/compendium/FilterPanel.tsx`, `components/compendium/CompendiumCard.tsx`, `components/compendium/CategoryHub.tsx`

- [x] **Step 1: Create SearchBar**

Create `components/compendium/SearchBar.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Buscar..." }: SearchBarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/40" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-parchment/10 border border-gold/30 rounded-lg text-parchment-light placeholder:text-parchment-light/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-light/40 hover:text-parchment-light"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
```

- [x] **Step 2: Create FilterPanel**

Create `components/compendium/FilterPanel.tsx`:

```tsx
"use client";

import { Badge } from "@/components/ui/Badge";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterPanelProps {
  groups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
}

export function FilterPanel({ groups, activeFilters, onFilterChange }: FilterPanelProps) {
  const toggleFilter = (key: string, value: string) => {
    const current = activeFilters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(key, next);
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key}>
          <h4 className="font-cinzel text-xs text-gold/60 mb-2 tracking-wider">{group.label}</h4>
          <div className="flex flex-wrap gap-1">
            {group.options.map((opt) => (
              <Badge
                key={opt.value}
                label={opt.label}
                active={(activeFilters[group.key] || []).includes(opt.value)}
                onClick={() => toggleFilter(group.key, opt.value)}
                color="gold"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [x] **Step 3: Create CompendiumCard**

Create `components/compendium/CompendiumCard.tsx`:

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CompendiumCardProps {
  href: string;
  name: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function CompendiumCard({ href, name, subtitle, description, icon: Icon, className }: CompendiumCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "card-medieval p-4 hover:shadow-tome-hover transition-shadow block",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 bg-gold/10 rounded">
            <Icon size={20} className="text-gold" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-cinzel text-sm font-bold text-ink truncate">{name}</h3>
          {subtitle && <p className="text-xs text-ink/60 mt-0.5">{subtitle}</p>}
          {description && <p className="text-xs text-ink/50 mt-1 line-clamp-2">{description}</p>}
        </div>
      </div>
    </Link>
  );
}
```

- [x] **Step 4: Create CategoryHub**

Create `components/compendium/CategoryHub.tsx`:

```tsx
import Link from "next/link";
import { Users, Swords, Sparkles, Skull, Shield, AlertTriangle, BookOpen } from "lucide-react";

const CATEGORIES = [
  { slug: "races", name: "Raças", icon: Users, description: "9 raças jogáveis do SRD" },
  { slug: "classes", name: "Classes", icon: Swords, description: "12 classes com progressão completa" },
  { slug: "spells", name: "Magias", icon: Sparkles, description: "Magias de todas as classes e níveis" },
  { slug: "monsters", name: "Monstros", icon: Skull, description: "Criaturas por tipo, tamanho e CR" },
  { slug: "items", name: "Itens Mágicos", icon: Shield, description: "Itens por raridade e tipo" },
  { slug: "conditions", name: "Condições", icon: AlertTriangle, description: "12 condições de jogo" },
  { slug: "rules", name: "Regras Rápidas", icon: BookOpen, description: "Referência rápida de combate e exploração" },
];

export function CategoryHub() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/compendium/${cat.slug}`}
          className="card-medieval-dark p-5 hover:shadow-tome-hover transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gold/10 rounded group-hover:bg-gold/20 transition-colors">
              <cat.icon size={24} className="text-gold" />
            </div>
            <h3 className="font-cinzel text-gold text-lg">{cat.name}</h3>
          </div>
          <p className="text-sm text-parchment-light/50">{cat.description}</p>
        </Link>
      ))}
    </div>
  );
}
```

- [x] **Step 5: Commit**

```bash
git add components/compendium/
git commit -m "feat: add compendium components

SearchBar (debounced), FilterPanel (multi-select badges),
CompendiumCard (parchment style), and CategoryHub (7 categories)."
```

---

### Task 13: Master Area Components

**Files:**
- Create: `components/master/PinGuard.tsx`, `components/master/CampaignCard.tsx`, `components/master/NpcCard.tsx`, `components/master/EncounterTracker.tsx`, `components/master/EncounterPlanner.tsx`, `components/master/RichTextEditor.tsx`

- [x] **Step 1: Create PinGuard**

Create `components/master/PinGuard.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useCampaignStore } from "@/store/campaignStore";
import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";

export function PinGuard({ children }: { children: React.ReactNode }) {
  const { pinHash, isPinSet, setPin, verifyPin, isHydrated } = useCampaignStore();
  const [input, setInput] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isHydrated && !isPinSet()) setIsCreating(true);
  }, [isHydrated, isPinSet]);

  if (!isHydrated) {
    return <div className="flex items-center justify-center h-64 text-parchment-light/50">Carregando...</div>;
  }

  if (confirmed) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length < 4) {
      setError("PIN deve ter pelo menos 4 dígitos");
      return;
    }

    if (isCreating) {
      await setPin(input);
      setConfirmed(true);
    } else {
      const valid = await verifyPin(input);
      if (valid) {
        setConfirmed(true);
      } else {
        setError("PIN incorreto");
        setInput("");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <Lock size={48} className="text-gold/60" />
      <h2 className="font-cinzel text-2xl text-gold">
        {isCreating ? "Criar PIN do Mestre" : "Área do Mestre"}
      </h2>
      <p className="text-parchment-light/50 text-center max-w-sm">
        {isCreating
          ? "Crie um PIN de 4-6 dígitos para proteger sua área de mestre."
          : "Digite seu PIN para acessar o dashboard."}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
          placeholder="PIN"
          className="w-40 text-center text-2xl tracking-[0.5em] bg-parchment/10 border border-gold/30 rounded py-2 text-parchment-light focus:outline-none focus:border-gold"
          autoFocus
        />
        {error && <p className="text-blood text-sm">{error}</p>}
        <Button type="submit">{isCreating ? "Criar PIN" : "Entrar"}</Button>
      </form>
    </div>
  );
}
```

- [x] **Step 2: Create CampaignCard and NpcCard**

Create `components/master/CampaignCard.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Users, ScrollText } from "lucide-react";
import type { Campaign } from "@/types/dnd5e";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link href={`/master/campaign/${campaign.id}`}>
      <Card className="p-4 hover:shadow-tome-hover transition-shadow cursor-pointer">
        <h3 className="font-cinzel text-gold text-lg mb-1">{campaign.name}</h3>
        {campaign.world && <p className="text-xs text-parchment-light/40 mb-2">{campaign.world}</p>}
        <p className="text-sm text-parchment-light/60 line-clamp-2 mb-3">{campaign.description}</p>
        <div className="flex items-center gap-4 text-xs text-parchment-light/40">
          <span className="flex items-center gap-1"><Users size={12} /> {campaign.playerCharacterIds.length} PJs</span>
          <span className="flex items-center gap-1"><ScrollText size={12} /> {campaign.sessions.length} sessões</span>
        </div>
      </Card>
    </Link>
  );
}
```

Create `components/master/NpcCard.tsx`:

```tsx
"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { NPC } from "@/types/dnd5e";

const ROLE_COLORS: Record<NPC["role"], "green" | "gold" | "blood" | "purple"> = {
  ally: "green",
  neutral: "gold",
  antagonist: "blood",
  unknown: "purple",
};

const ROLE_LABELS: Record<NPC["role"], string> = {
  ally: "Aliado",
  neutral: "Neutro",
  antagonist: "Antagonista",
  unknown: "Desconhecido",
};

interface NpcCardProps {
  npc: NPC;
  onClick?: () => void;
}

export function NpcCard({ npc, onClick }: NpcCardProps) {
  const initials = npc.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Card className="p-3 cursor-pointer hover:shadow-tome-hover transition-shadow" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center font-cinzel text-sm text-gold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-cinzel text-sm text-parchment-light truncate">{npc.name}</h4>
          <p className="text-xs text-parchment-light/40">{npc.race} — {npc.profession}</p>
        </div>
        <Badge label={ROLE_LABELS[npc.role]} color={ROLE_COLORS[npc.role]} />
      </div>
    </Card>
  );
}
```

- [x] **Step 3: Create EncounterPlanner**

Create `components/master/EncounterPlanner.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getXpMultiplier, getEncounterDifficulty } from "@/lib/dnd5e";
import { generateId } from "@/lib/utils";
import type { EncounterMonster } from "@/types/dnd5e";
import { Plus, Trash2 } from "lucide-react";

interface EncounterPlannerProps {
  partyLevel: number;
  partySize: number;
  onPartyChange: (level: number, size: number) => void;
  monsters: EncounterMonster[];
  onMonstersChange: (monsters: EncounterMonster[]) => void;
}

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

export function EncounterPlanner({ partyLevel, partySize, onPartyChange, monsters, onMonstersChange }: EncounterPlannerProps) {
  const [newName, setNewName] = useState("");
  const [newHp, setNewHp] = useState(10);
  const [newAc, setNewAc] = useState(10);
  const [newXp, setNewXp] = useState(25);

  const totalXP = monsters.reduce((sum, m) => sum + m.xp, 0);
  const multiplier = getXpMultiplier(monsters.length);
  const adjustedXP = Math.floor(totalXP * multiplier);
  const difficulty = monsters.length > 0 ? getEncounterDifficulty(partyLevel, partySize, adjustedXP) : null;

  const addMonster = () => {
    if (!newName) return;
    onMonstersChange([
      ...monsters,
      { id: generateId(), name: newName, hp: newHp, maxHp: newHp, ac: newAc, initiative: 0, conditions: [], xp: newXp },
    ]);
    setNewName("");
  };

  return (
    <div className="space-y-4">
      {/* Party info */}
      <div className="flex gap-4">
        <Input
          label="Nível do Grupo"
          type="number"
          value={partyLevel}
          onChange={(e) => onPartyChange(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)), partySize)}
        />
        <Input
          label="Tamanho do Grupo"
          type="number"
          value={partySize}
          onChange={(e) => onPartyChange(partyLevel, Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>

      {/* Difficulty display */}
      {difficulty && (
        <div className="flex items-center gap-3 p-3 bg-ink border border-gold/20 rounded">
          <Badge label={DIFFICULTY_LABELS[difficulty]} color={DIFFICULTY_COLORS[difficulty]} active />
          <span className="text-sm text-parchment-light/60">
            XP Total: {totalXP} | Ajustado: {adjustedXP} (x{multiplier})
          </span>
        </div>
      )}

      {/* Monster list */}
      <div className="space-y-1">
        {monsters.map((m, i) => (
          <div key={m.id} className="flex items-center gap-2 py-1 text-sm">
            <span className="flex-1 text-parchment-light">{m.name}</span>
            <span className="text-parchment-light/50">HP:{m.maxHp} AC:{m.ac} XP:{m.xp}</span>
            <button onClick={() => onMonstersChange(monsters.filter((_, j) => j !== i))} className="text-blood/60 hover:text-blood">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add monster */}
      <div className="flex gap-2 items-end">
        <Input label="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Input label="HP" type="number" value={newHp} onChange={(e) => setNewHp(parseInt(e.target.value) || 1)} className="w-20" />
        <Input label="AC" type="number" value={newAc} onChange={(e) => setNewAc(parseInt(e.target.value) || 10)} className="w-20" />
        <Input label="XP" type="number" value={newXp} onChange={(e) => setNewXp(parseInt(e.target.value) || 0)} className="w-20" />
        <Button onClick={addMonster} size="sm"><Plus size={14} /></Button>
      </div>
    </div>
  );
}
```

- [x] **Step 4: Create EncounterTracker**

Create `components/master/EncounterTracker.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConditionBadge } from "@/components/character/ConditionBadge";
import { CONDITIONS } from "@/types/dnd5e";
import type { Encounter, Condition } from "@/types/dnd5e";
import { ChevronRight, Swords, SkipForward } from "lucide-react";
import { rollNotation } from "@/lib/dice";

interface TrackerEntry {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  conditions: Condition[];
  isPlayer: boolean;
}

interface EncounterTrackerProps {
  encounter: Encounter;
  onUpdate: (updates: Partial<Encounter>) => void;
}

export function EncounterTracker({ encounter, onUpdate }: EncounterTrackerProps) {
  const [damageInput, setDamageInput] = useState<Record<string, string>>({});

  // Build combined initiative list
  const entries: TrackerEntry[] = [
    ...encounter.monsters.map((m) => ({
      id: m.id, name: m.name, initiative: m.initiative,
      hp: m.hp, maxHp: m.maxHp, ac: m.ac, conditions: m.conditions, isPlayer: false,
    })),
    ...encounter.playerCharacters.map((pc, i) => ({
      id: `pc-${i}`, name: pc.name, initiative: pc.initiative,
      hp: 0, maxHp: 0, ac: pc.ac, conditions: [] as Condition[], isPlayer: true,
    })),
  ].sort((a, b) => b.initiative - a.initiative);

  const currentEntry = entries[encounter.currentTurnIndex % entries.length];

  const rollAllInitiatives = () => {
    const updatedMonsters = encounter.monsters.map((m) => ({
      ...m, initiative: rollNotation("1d20").total,
    }));
    const updatedPCs = encounter.playerCharacters.map((pc) => ({
      ...pc, initiative: rollNotation("1d20").total,
    }));
    onUpdate({ monsters: updatedMonsters, playerCharacters: updatedPCs, status: "active", currentTurnIndex: 0 });
  };

  const nextTurn = () => {
    onUpdate({ currentTurnIndex: (encounter.currentTurnIndex + 1) % entries.length });
  };

  const applyDamage = (monsterId: string) => {
    const amount = parseInt(damageInput[monsterId] || "0");
    if (!amount) return;
    const updatedMonsters = encounter.monsters.map((m) =>
      m.id === monsterId ? { ...m, hp: Math.max(0, m.hp - amount) } : m
    );
    onUpdate({ monsters: updatedMonsters });
    setDamageInput({ ...damageInput, [monsterId]: "" });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2">
        <Button onClick={rollAllInitiatives} variant="secondary" size="sm">
          <Swords size={14} className="mr-1" /> Rolar Iniciativas
        </Button>
        {encounter.status === "active" && (
          <Button onClick={nextTurn} size="sm">
            <SkipForward size={14} className="mr-1" /> Próximo Turno
          </Button>
        )}
      </div>

      {/* Initiative list */}
      <div className="space-y-1">
        {entries.map((entry) => {
          const isCurrent = currentEntry?.id === entry.id && encounter.status === "active";
          const hpPct = entry.maxHp > 0 ? (entry.hp / entry.maxHp) * 100 : 100;

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-2 rounded transition-colors ${
                isCurrent ? "bg-gold/10 border border-gold/30" : "border border-transparent"
              }`}
            >
              {isCurrent && <ChevronRight size={16} className="text-gold flex-shrink-0" />}
              <span className="font-cinzel text-sm w-8 text-center text-gold/60">{entry.initiative}</span>
              <span className={`flex-1 text-sm ${entry.isPlayer ? "text-blue-300" : "text-parchment-light"}`}>
                {entry.name}
              </span>
              <span className="text-xs text-parchment-light/40">AC {entry.ac}</span>

              {!entry.isPlayer && (
                <>
                  {/* HP bar */}
                  <div className="w-24">
                    <div className="h-2 bg-ink rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${hpPct > 50 ? "bg-green-600" : hpPct > 25 ? "bg-yellow-600" : "bg-blood"}`}
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-parchment-light/40">{entry.hp}/{entry.maxHp}</span>
                  </div>

                  {/* Quick damage */}
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={damageInput[entry.id] || ""}
                      onChange={(e) => setDamageInput({ ...damageInput, [entry.id]: e.target.value })}
                      placeholder="Dano"
                      className="w-14 bg-parchment/10 border border-gold/20 rounded px-1 py-0.5 text-xs text-parchment-light text-center focus:outline-none focus:border-gold"
                    />
                    <button
                      onClick={() => applyDamage(entry.id)}
                      className="text-xs text-blood hover:text-blood-light"
                    >
                      Hit
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [x] **Step 5: Create RichTextEditor (TipTap wrapper)**

Create `components/master/RichTextEditor.tsx`:

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Escreva suas notas..." }: RichTextEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(editor.getHTML());
      }, 3000);
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none p-4 min-h-[200px] focus:outline-none",
      },
    },
  });

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  if (!editor) return null;

  const ToolButton = ({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded transition-colors",
        active ? "bg-gold/20 text-gold" : "text-parchment-light/40 hover:text-parchment-light"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gold/20 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-gold/10 bg-ink">
        <ToolButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolButton>
        <ToolButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolButton>
      </div>
      <EditorContent editor={editor} className="bg-ink-light" />
    </div>
  );
}
```

- [x] **Step 6: Commit**

```bash
git add components/master/
git commit -m "feat: add DM dashboard components

PinGuard (SHA-256 auth), CampaignCard, NpcCard (avatar initials),
EncounterPlanner (XP budget + difficulty), EncounterTracker (initiative),
and RichTextEditor (TipTap with auto-save)."
```

---

