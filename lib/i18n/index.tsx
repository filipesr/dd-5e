"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Locale, Dictionary } from "./types";
import { ptBR } from "./pt-BR";
import { en } from "./en";
import { es } from "./es";

const dictionaries: Record<Locale, Dictionary> = { "pt-BR": ptBR, en, es };

interface I18nContextType {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  locales: { value: Locale; label: string }[];
}

const I18nContext = createContext<I18nContextType | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  forcedLocale?: Locale;
}

export function I18nProvider({ children, forcedLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(forcedLocale || "pt-BR");

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const value: I18nContextType = {
    locale,
    t: dictionaries[locale],
    setLocale,
    locales: [
      { value: "pt-BR", label: "PT" },
      { value: "en", label: "EN" },
      { value: "es", label: "ES" },
    ],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export type { Locale, Dictionary };
