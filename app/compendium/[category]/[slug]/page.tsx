import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import racesData from "@/data/races.json";
import classesData from "@/data/classes.json";
import conditionsData from "@/data/conditions.json";
import rulesData from "@/data/rules.json";
import {
  fetchSpellBySlug,
  fetchMonsterBySlug,
  fetchMagicItemBySlug,
} from "@/lib/open5e";

const VALID_CATEGORIES = [
  "races",
  "classes",
  "conditions",
  "rules",
  "spells",
  "monsters",
  "items",
] as const;
type Category = (typeof VALID_CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  races: "Raças",
  classes: "Classes",
  conditions: "Condições",
  rules: "Regras Rápidas",
  spells: "Magias",
  monsters: "Monstros",
  items: "Itens Mágicos",
};

interface PageProps {
  params: { category: string; slug: string };
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-semibold text-ink/70 min-w-[140px]">{label}:</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function AbilityScore({ label, value }: { label: string; value: number }) {
  const mod = Math.floor((value - 10) / 2);
  return (
    <div className="flex flex-col items-center border border-gold/30 rounded p-2 min-w-[60px]">
      <span className="text-xs font-semibold text-ink/60 uppercase">{label}</span>
      <span className="font-cinzel text-lg font-bold text-ink">{value}</span>
      <span className="text-xs text-ink/60">{mod >= 0 ? `+${mod}` : mod}</span>
    </div>
  );
}

export default async function SlugPage({ params }: PageProps) {
  const { category, slug } = params;

  if (!VALID_CATEGORIES.includes(category as Category)) {
    notFound();
  }

  const cat = category as Category;
  const label = CATEGORY_LABELS[cat];

  // ── Races ──────────────────────────────────────────────────────────────────
  if (cat === "races") {
    const race = racesData.find((r) => r.slug === slug);
    if (!race) notFound();

    const bonuses = Object.entries(race.abilityBonuses)
      .map(([attr, val]) => `${attr.toUpperCase()} +${val}`)
      .join(", ");

    return (
      <div>
        <Link
          href={`/compendium/${cat}`}
          className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4"
        >
          <ArrowLeft size={16} /> {label}
        </Link>
        <Card variant="parchment" className="p-6 space-y-4">
          <SectionHeader title={race.name} />
          <p className="text-ink/80 leading-relaxed">{race.description}</p>
          <div className="space-y-2">
            <DetailRow label="Velocidade" value={`${race.speed} pés`} />
            <DetailRow label="Darkvision" value={race.darkvision ? "Sim" : "Não"} />
            <DetailRow label="Bônus de Atributo" value={bonuses || "—"} />
            <DetailRow label="Idiomas" value={race.languages.join(", ")} />
          </div>
          {race.traits.length > 0 && (
            <div>
              <h3 className="font-cinzel font-bold text-ink mb-2">Traços Raciais</h3>
              <ul className="list-disc list-inside space-y-1">
                {race.traits.map((t, i) => (
                  <li key={i} className="text-sm text-ink/80">{t}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ── Classes ─────────────────────────────────────────────────────────────────
  if (cat === "classes") {
    const cls = classesData.find((c) => c.slug === slug);
    if (!cls) notFound();

    return (
      <div>
        <Link
          href={`/compendium/${cat}`}
          className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4"
        >
          <ArrowLeft size={16} /> {label}
        </Link>
        <Card variant="parchment" className="p-6 space-y-4">
          <SectionHeader title={cls.name} />
          <div className="space-y-2">
            <DetailRow label="Dado de Vida" value={`d${cls.hitDie}`} />
            <DetailRow label="Saves" value={cls.savingThrows.map((s) => s.toUpperCase()).join(", ")} />
            <DetailRow label="Proficiências em Armadura" value={cls.armorProficiencies.join(", ") || "Nenhuma"} />
            <DetailRow label="Proficiências em Arma" value={cls.weaponProficiencies.join(", ")} />
            <DetailRow label="Conjuração" value={cls.spellcasting ? `Sim (${cls.spellcastingAbility?.toUpperCase()})` : "Não"} />
          </div>
          {cls.features.length > 0 && (
            <div>
              <h3 className="font-cinzel font-bold text-ink mb-3">Habilidades de Classe</h3>
              <div className="space-y-3">
                {cls.features.map((f, i) => (
                  <div key={i} className="border-l-2 border-gold/30 pl-3">
                    <p className="text-sm font-semibold text-ink">
                      Nível {f.level} — {f.name}
                    </p>
                    <p className="text-sm text-ink/70 mt-0.5">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ── Conditions ──────────────────────────────────────────────────────────────
  if (cat === "conditions") {
    const condition = conditionsData.find((c) => c.slug === slug);
    if (!condition) notFound();

    return (
      <div>
        <Link
          href={`/compendium/${cat}`}
          className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4"
        >
          <ArrowLeft size={16} /> {label}
        </Link>
        <Card variant="parchment" className="p-6 space-y-4">
          <SectionHeader title={condition.name} />
          <p className="text-ink/80 leading-relaxed">{condition.description}</p>
        </Card>
      </div>
    );
  }

  // ── Rules ───────────────────────────────────────────────────────────────────
  if (cat === "rules") {
    const rule = rulesData.find((r) => r.slug === slug);
    if (!rule) notFound();

    return (
      <div>
        <Link
          href={`/compendium/${cat}`}
          className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4"
        >
          <ArrowLeft size={16} /> {label}
        </Link>
        <Card variant="parchment" className="p-6 space-y-4">
          <SectionHeader title={rule.name} />
          <p className="text-xs text-ink/50 uppercase tracking-wider">{rule.category}</p>
          <p className="text-ink/80 leading-relaxed whitespace-pre-wrap">{rule.content}</p>
        </Card>
      </div>
    );
  }

  // ── Spells ──────────────────────────────────────────────────────────────────
  if (cat === "spells") {
    const spell = await fetchSpellBySlug(slug);
    if (!spell) notFound();

    return (
      <div>
        <Link
          href={`/compendium/${cat}`}
          className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4"
        >
          <ArrowLeft size={16} /> {label}
        </Link>
        <Card variant="parchment" className="p-6 space-y-4">
          <SectionHeader title={spell.name} />
          <div className="space-y-2">
            <DetailRow label="Nível" value={spell.level} />
            <DetailRow label="Escola" value={spell.school} />
            <DetailRow label="Tempo de Conjuração" value={spell.casting_time} />
            <DetailRow label="Alcance" value={spell.range} />
            <DetailRow label="Componentes" value={spell.components} />
            <DetailRow label="Duração" value={spell.duration} />
            <DetailRow label="Concentração" value={spell.concentration === "yes" ? "Sim" : "Não"} />
            <DetailRow label="Classe(s)" value={spell.dnd_class} />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-ink mb-2">Descrição</h3>
            <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{spell.desc}</p>
          </div>
          {spell.higher_level && (
            <div>
              <h3 className="font-cinzel font-bold text-ink mb-2">Em Níveis Superiores</h3>
              <p className="text-sm text-ink/80 leading-relaxed">{spell.higher_level}</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ── Monsters ─────────────────────────────────────────────────────────────────
  if (cat === "monsters") {
    const monster = await fetchMonsterBySlug(slug);
    if (!monster) notFound();

    return (
      <div>
        <Link
          href={`/compendium/${cat}`}
          className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4"
        >
          <ArrowLeft size={16} /> {label}
        </Link>
        <Card variant="parchment" className="p-6 space-y-4">
          <SectionHeader title={monster.name} />
          <p className="text-sm italic text-ink/60">
            {monster.size} {monster.type}
          </p>
          <div className="space-y-2">
            <DetailRow label="Classe de Armadura" value={monster.armor_class} />
            <DetailRow label="Pontos de Vida" value={monster.hit_points} />
            <DetailRow label="Índice de Desafio" value={monster.challenge_rating} />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-ink mb-3">Atributos</h3>
            <div className="flex flex-wrap gap-2">
              <AbilityScore label="FOR" value={monster.strength} />
              <AbilityScore label="DES" value={monster.dexterity} />
              <AbilityScore label="CON" value={monster.constitution} />
              <AbilityScore label="INT" value={monster.intelligence} />
              <AbilityScore label="SAB" value={monster.wisdom} />
              <AbilityScore label="CAR" value={monster.charisma} />
            </div>
          </div>
          {monster.actions && monster.actions.length > 0 && (
            <div>
              <h3 className="font-cinzel font-bold text-ink mb-3">Ações</h3>
              <div className="space-y-3">
                {monster.actions.map((action, i) => (
                  <div key={i} className="border-l-2 border-gold/30 pl-3">
                    <p className="text-sm font-semibold text-ink">{action.name}</p>
                    <p className="text-sm text-ink/70 mt-0.5">{action.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ── Magic Items ──────────────────────────────────────────────────────────────
  if (cat === "items") {
    const item = await fetchMagicItemBySlug(slug);
    if (!item) notFound();

    return (
      <div>
        <Link
          href={`/compendium/${cat}`}
          className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4"
        >
          <ArrowLeft size={16} /> {label}
        </Link>
        <Card variant="parchment" className="p-6 space-y-4">
          <SectionHeader title={item.name} />
          <div className="space-y-2">
            <DetailRow label="Tipo" value={item.type} />
            <DetailRow label="Raridade" value={item.rarity} />
            <DetailRow label="Requer Sintonia" value={item.requires_attunement || "Não"} />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-ink mb-2">Descrição</h3>
            <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{item.desc}</p>
          </div>
        </Card>
      </div>
    );
  }

  notFound();
}
