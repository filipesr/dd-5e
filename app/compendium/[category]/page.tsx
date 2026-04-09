import { notFound } from "next/navigation";
import { CompendiumListClient } from "./CompendiumListClient";
import racesData from "@/data/races.json";
import classesData from "@/data/classes.json";
import conditionsData from "@/data/conditions.json";
import rulesData from "@/data/rules.json";
import {
  getSpells,
  getMonsters,
  getMagicItems,
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

export function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}

interface PageProps {
  params: { category: string };
}

export default function CategoryPage({ params }: PageProps) {
  const { category } = params;

  if (!VALID_CATEGORIES.includes(category as Category)) {
    notFound();
  }

  const cat = category as Category;
  const label = CATEGORY_LABELS[cat];

  type ListItem = { slug: string; name: string; description: string; meta?: Record<string, string> };
  let items: ListItem[] = [];

  switch (cat) {
    case "races":
      items = racesData.map((r) => ({
        slug: r.slug,
        name: r.name,
        description: r.description,
      }));
      break;

    case "classes":
      items = classesData.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: `d${c.hitDie} · ${c.savingThrows.join(", ")}`,
      }));
      break;

    case "conditions":
      items = conditionsData.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
      }));
      break;

    case "rules":
      items = rulesData.map((r) => ({
        slug: r.slug,
        name: r.name,
        description: r.content.replace(/\*\*/g, "").slice(0, 120) + "…",
      }));
      break;

    case "spells": {
      const spells = getSpells();
      items = spells.map((s) => ({
        slug: s.slug,
        name: s.name,
        description: s.desc.slice(0, 120) + (s.desc.length > 120 ? "…" : ""),
        meta: {
          level: s.level,
          school: s.school,
          class: s.dnd_class,
        },
      }));
      break;
    }

    case "monsters": {
      const monsters = getMonsters();
      items = monsters.map((m) => ({
        slug: m.slug,
        name: m.name,
        description: m.desc
          ? m.desc.slice(0, 120) + (m.desc.length > 120 ? "…" : "")
          : `${m.type} · CA ${m.armor_class} · ${m.hit_points} PV`,
        meta: {
          cr: `CR ${m.challenge_rating}`,
          type: m.type,
          size: m.size,
        },
      }));
      break;
    }

    case "items": {
      const magicItems = getMagicItems();
      items = magicItems.map((i) => ({
        slug: i.slug,
        name: i.name,
        description: i.desc.slice(0, 120) + (i.desc.length > 120 ? "…" : ""),
        meta: {
          rarity: i.rarity,
          type: i.type,
        },
      }));
      break;
    }
  }

  return (
    <CompendiumListClient category={cat} label={label} items={items} />
  );
}
