"use client";

import { useI18n } from "@/lib/i18n";

interface LocaleContentProps {
  /** Pre-loaded data per locale: { en: {...}, "pt-BR": {...}, es: {...} } */
  localeData: Record<string, {
    desc?: string;
    higher_level?: string;
    actions?: { name: string; desc: string }[];
    special_abilities?: { name: string; desc: string }[];
    reactions?: { name: string; desc: string }[];
    legendary_actions?: { name: string; desc: string }[];
  }>;
  category: "spells" | "monsters" | "items";
}

export function LocaleContent({ localeData, category }: LocaleContentProps) {
  const { locale, t } = useI18n();
  const data = localeData[locale] || localeData["en"] || {};

  const renderActionBlock = (title: string, items?: { name: string; desc: string }[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div>
        <h3 className="font-cinzel font-bold text-ink mb-2">{title}</h3>
        {items.map((a, i) => (
          <div key={i} className="mb-2 border-l-2 border-gold/30 pl-3">
            <span className="font-bold text-sm text-ink">{a.name}.</span>{" "}
            <span className="text-sm text-ink/80">{a.desc}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {data.desc && (
        <div>
          <h3 className="font-cinzel font-bold text-ink mb-2">{t.common.description}</h3>
          <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{data.desc}</p>
        </div>
      )}

      {category === "spells" && data.higher_level && (
        <div>
          <h3 className="font-cinzel font-bold text-ink mb-2">{t.compendium.detail.higherLevels}</h3>
          <p className="text-sm text-ink/80 leading-relaxed">{data.higher_level}</p>
        </div>
      )}

      {category === "monsters" && (
        <>
          {renderActionBlock(t.compendium.detail.specialAbilities, data.special_abilities)}
          {renderActionBlock(t.compendium.detail.actions, data.actions)}
          {renderActionBlock(t.compendium.detail.reactions, data.reactions)}
          {renderActionBlock(t.compendium.detail.legendaryActions, data.legendary_actions)}
        </>
      )}
    </>
  );
}
