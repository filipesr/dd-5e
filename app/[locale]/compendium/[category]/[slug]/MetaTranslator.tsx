"use client";

/**
 * Client component that translates D&D metadata values based on the active
 * locale. Renders a simple key/value row list for spell/monster/item details.
 */

import { useI18n } from "@/lib/i18n";
import {
  SCHOOLS,
  TYPES,
  SIZES,
  RARITIES,
  COMMON_TERMS,
  translateTerm,
  translateLevel,
} from "@/lib/open5eTranslations";

interface SpellMeta {
  level: string;
  school: string;
  casting_time: string;
  range: string;
  components: string;
  duration: string;
  concentration: string;
  dnd_class: string;
}

interface MonsterMeta {
  type: string;
  size: string;
}

interface ItemMeta {
  type: string;
  rarity: string;
  requires_attunement: string;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-semibold text-ink/70 min-w-[140px]">{label}:</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

export function SpellMetaRows(props: SpellMeta) {
  const { locale, t } = useI18n();
  const d = t.compendium.detail;

  const school = translateTerm(props.school, SCHOOLS[locale]);
  const level = translateLevel(props.level, locale);
  const casting_time = translateTerm(props.casting_time, COMMON_TERMS[locale]);
  const range = translateTerm(props.range, COMMON_TERMS[locale]);
  const duration = translateTerm(props.duration, COMMON_TERMS[locale]);
  const concentration = translateTerm(
    props.concentration,
    COMMON_TERMS[locale]
  );

  return (
    <div className="space-y-2">
      <DetailRow label={t.common.level} value={level} />
      <DetailRow label={d.school} value={school} />
      <DetailRow label={d.castingTime} value={casting_time} />
      <DetailRow label={d.range} value={range} />
      <DetailRow label={d.components} value={props.components} />
      <DetailRow label={d.duration} value={duration} />
      <DetailRow label={d.concentration} value={concentration} />
      <DetailRow label={d.classes} value={props.dnd_class} />
    </div>
  );
}

export function MonsterMetaRows(props: MonsterMeta) {
  const { locale } = useI18n();

  const type = translateTerm(props.type, TYPES[locale]);
  const size = translateTerm(props.size, SIZES[locale]);

  return (
    <p className="text-sm italic text-ink/60">
      {size} {type}
    </p>
  );
}

export function ItemMetaRows(props: ItemMeta) {
  const { locale, t } = useI18n();
  const d = t.compendium.detail;

  const rarity = translateTerm(props.rarity, RARITIES[locale]);

  return (
    <div className="space-y-2">
      <DetailRow label={d.rarity} value={rarity} />
      <DetailRow label={t.common.type} value={props.type} />
      <DetailRow label={d.attunement} value={props.requires_attunement || t.common.no} />
    </div>
  );
}
