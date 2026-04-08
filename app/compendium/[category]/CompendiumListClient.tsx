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
  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
  );

  return (
    <div>
      <Link
        href="/compendium"
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
        {filtered.map((item) => (
          <CompendiumCard
            key={item.slug}
            href={`/compendium/${category}/${item.slug}`}
            name={item.name}
            subtitle={
              item.meta ? Object.values(item.meta).join(" · ") : undefined
            }
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
}
