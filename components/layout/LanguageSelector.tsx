"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react";

const LOCALE_PATTERN = /^\/(pt-BR|en|es)/;

export function LanguageSelector() {
  const { locale, locales } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    const newPath = pathname.replace(LOCALE_PATTERN, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1">
      <Globe size={14} className="text-parchment-light/40" />
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
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
