"use client";

import { useState, useCallback } from "react";
import { SearchBar } from "@/components/compendium/SearchBar";
import { CompendiumCard } from "@/components/compendium/CompendiumCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import {
  SCHOOLS,
  TYPES,
  SIZES,
  RARITIES,
  translateTerm,
  translateLevel,
} from "@/lib/open5eTranslations";

interface Item {
  slug: string;
  name: string;
  description: string;
  /**
   * Raw English metadata values. The client translates them based on locale.
   * Keys: "level" | "school" | "class" (spells) | "cr" | "type" | "size"
   *       (monsters) | "rarity" | "type" (items).
   */
  meta?: Record<string, string>;
  /** Which category this item belongs to (drives translation logic). */
  category?: "spell" | "monster" | "item" | "other";
}

interface Props {
  category: string;
  label: string;
  items: Item[];
}

function translateMeta(
  meta: Record<string, string>,
  category: Item["category"],
  locale: ReturnType<typeof useI18n>["locale"]
): Record<string, string> {
  if (locale === "en" || !category || category === "other") return meta;

  const result = { ...meta };

  if (category === "spell") {
    if (result.school !== undefined)
      result.school = translateTerm(result.school, SCHOOLS[locale]);
    if (result.level !== undefined)
      result.level = translateLevel(result.level, locale);
  }

  if (category === "monster") {
    if (result.type !== undefined)
      result.type = translateTerm(result.type, TYPES[locale]);
    if (result.size !== undefined)
      result.size = translateTerm(result.size, SIZES[locale]);
  }

  if (category === "item") {
    if (result.rarity !== undefined)
      result.rarity = translateTerm(result.rarity, RARITIES[locale]);
  }

  return result;
}

export function CompendiumListClient({ category, label, items }: Props) {
  const { locale } = useI18n();
  const [query, setQuery] = useState("");
  const onSearch = useCallback((q: string) => setQuery(q.toLowerCase()), []);
  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
  );

  return (
    <div>
      <Link
        href={`/${locale}/compendium`}
        className="flex items-center gap-1 text-sm text-gold/60 hover:text-gold transition-colors mb-4"
      >
        <ArrowLeft size={16} /> Compêndio
      </Link>
      <SectionHeader title={label} />
      <div className="mb-6">
        <SearchBar
          onSearch={onSearch}
          placeholder={`Buscar em ${label.toLowerCase()}...`}
        />
      </div>
      <p className="text-sm text-parchment-light/40 mb-4">
        {filtered.length} resultados
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => {
          const displayMeta = item.meta
            ? translateMeta(item.meta, item.category, locale)
            : undefined;
          return (
            <CompendiumCard
              key={item.slug}
              href={`/${locale}/compendium/${category}/${item.slug}`}
              name={item.name}
              subtitle={
                displayMeta
                  ? Object.values(displayMeta).join(" · ")
                  : undefined
              }
              description={item.description}
            />
          );
        })}
      </div>
    </div>
  );
}
