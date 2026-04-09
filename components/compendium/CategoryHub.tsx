"use client";

import Link from "next/link";
import { Users, Swords, Sparkles, Skull, Shield, AlertTriangle, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  races: Users,
  classes: Swords,
  spells: Sparkles,
  monsters: Skull,
  items: Shield,
  conditions: AlertTriangle,
  rules: BookOpen,
};

const CATEGORY_SLUGS = ["races", "classes", "spells", "monsters", "items", "conditions", "rules"];

export function CategoryHub() {
  const { t, locale } = useI18n();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CATEGORY_SLUGS.map((slug) => {
        const Icon = CATEGORY_ICONS[slug];
        const category = t.compendium.categories[slug];
        if (!category) return null;
        return (
          <Link key={slug} href={`/${locale}/compendium/${slug}`} className="card-medieval-dark p-5 hover:shadow-tome-hover transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gold/10 rounded group-hover:bg-gold/20 transition-colors">
                <Icon size={24} className="text-gold" />
              </div>
              <h3 className="font-cinzel text-gold text-lg">{category.name}</h3>
            </div>
            <p className="text-sm text-parchment-light/50">{category.desc}</p>
          </Link>
        );
      })}
    </div>
  );
}
