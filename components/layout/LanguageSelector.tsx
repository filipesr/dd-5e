"use client";

import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { locale, setLocale, locales } = useI18n();

  return (
    <div className="flex items-center gap-1">
      <Globe size={14} className="text-parchment-light/40" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className="bg-transparent text-xs text-parchment-light/60 border-none focus:outline-none cursor-pointer font-cinzel"
      >
        {locales.map((l) => (
          <option key={l.value} value={l.value} className="bg-ink-light">
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
