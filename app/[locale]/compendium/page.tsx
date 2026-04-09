"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryHub } from "@/components/compendium/CategoryHub";
import { useI18n } from "@/lib/i18n";

export default function CompendiumPage() {
  const { t } = useI18n();

  return (
    <div>
      <SectionHeader title={t.compendium.title} />
      <p className="text-parchment-light/50 text-center mb-8">
        {t.compendium.subtitle}
      </p>
      <CategoryHub />
    </div>
  );
}
