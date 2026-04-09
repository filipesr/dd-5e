"use client";

import { I18nProvider } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

interface ProvidersProps {
  children: React.ReactNode;
  forcedLocale?: Locale;
}

export function Providers({ children, forcedLocale }: ProvidersProps) {
  return <I18nProvider forcedLocale={forcedLocale}>{children}</I18nProvider>;
}
