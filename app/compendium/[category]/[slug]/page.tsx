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
  getSpells,
  getSpellBySlug,
  getMonsters,
  getMonsterBySlug,
  getMagicItems,
  getMagicItemBySlug,
} from "@/lib/open5e";
import {
  SpellMetaRows,
  MonsterMetaRows,
  ItemMetaRows,
} from "./MetaTranslator";
import { LocaleContent } from "./LocaleContent";

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

export function generateStaticParams() {
  const params: { category: string; slug: string }[] = [];

  // Static categories
  for (const r of racesData) params.push({ category: "races", slug: r.slug });
  for (const c of classesData) params.push({ category: "classes", slug: c.slug });
  for (const c of conditionsData) params.push({ category: "conditions", slug: c.slug });
  for (const r of rulesData) params.push({ category: "rules", slug: r.slug });

  // Open5e cached data
  for (const s of getSpells()) params.push({ category: "spells", slug: s.slug });
  for (const m of getMonsters()) params.push({ category: "monsters", slug: m.slug });
  for (const i of getMagicItems()) params.push({ category: "items", slug: i.slug });

  return params;
}

export default function SlugPage({ params }: PageProps) {
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
    const spell = getSpellBySlug(slug);
    if (!spell) notFound();

    const spellPt = getSpellBySlug(slug, "pt-BR");
    const spellEs = getSpellBySlug(slug, "es");
    const localeData = {
      en: { desc: spell.desc, higher_level: spell.higher_level },
      "pt-BR": { desc: spellPt?.desc || spell.desc, higher_level: spellPt?.higher_level || spell.higher_level },
      es: { desc: spellEs?.desc || spell.desc, higher_level: spellEs?.higher_level || spell.higher_level },
    };

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
          <SpellMetaRows
            level={spell.level}
            school={spell.school}
            casting_time={spell.casting_time}
            range={spell.range}
            components={spell.components}
            duration={spell.duration}
            concentration={spell.concentration}
            dnd_class={spell.dnd_class}
          />
          <LocaleContent localeData={localeData} category="spells" />
        </Card>
      </div>
    );
  }

  // ── Monsters ─────────────────────────────────────────────────────────────────
  if (cat === "monsters") {
    const monster = getMonsterBySlug(slug);
    if (!monster) notFound();

    const monPt = getMonsterBySlug(slug, "pt-BR");
    const monEs = getMonsterBySlug(slug, "es");
    const localeData = {
      en: { desc: monster.desc, actions: monster.actions, special_abilities: monster.special_abilities, reactions: monster.reactions, legendary_actions: monster.legendary_actions },
      "pt-BR": { desc: monPt?.desc || monster.desc, actions: monPt?.actions || monster.actions, special_abilities: monPt?.special_abilities || monster.special_abilities, reactions: monPt?.reactions || monster.reactions, legendary_actions: monPt?.legendary_actions || monster.legendary_actions },
      es: { desc: monEs?.desc || monster.desc, actions: monEs?.actions || monster.actions, special_abilities: monEs?.special_abilities || monster.special_abilities, reactions: monEs?.reactions || monster.reactions, legendary_actions: monEs?.legendary_actions || monster.legendary_actions },
    };

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
          <MonsterMetaRows type={monster.type} size={monster.size} />
          <div className="space-y-2">
            <DetailRow label="AC" value={monster.armor_class} />
            <DetailRow label="HP" value={monster.hit_points} />
            <DetailRow label="CR" value={monster.challenge_rating} />
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
          <LocaleContent localeData={localeData} category="monsters" />
        </Card>
      </div>
    );
  }

  // ── Magic Items ──────────────────────────────────────────────────────────────
  if (cat === "items") {
    const item = getMagicItemBySlug(slug);
    if (!item) notFound();

    const itemPt = getMagicItemBySlug(slug, "pt-BR");
    const itemEs = getMagicItemBySlug(slug, "es");
    const localeData = {
      en: { desc: item.desc },
      "pt-BR": { desc: itemPt?.desc || item.desc },
      es: { desc: itemEs?.desc || item.desc },
    };

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
          <ItemMetaRows
            type={item.type}
            rarity={item.rarity}
            requires_attunement={item.requires_attunement || ""}
          />
          <LocaleContent localeData={localeData} category="items" />
        </Card>
      </div>
    );
  }

  notFound();
}
