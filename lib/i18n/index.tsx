"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Locale, Dictionary } from "./types";
import { ptBR } from "./pt-BR";
import { en } from "./en";
import { es } from "./es";

const dictionaries: Record<Locale, Dictionary> = { "pt-BR": ptBR, en, es };

const STORAGE_KEY = "dd5e-locale";

interface I18nContextType {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  locales: { value: Locale; label: string }[];
}

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in dictionaries) return saved as Locale;
  }
  return "pt-BR";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
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
