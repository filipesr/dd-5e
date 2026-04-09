import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { Providers } from "@/components/layout/Providers";
import type { Locale } from "@/lib/i18n/types";

const LOCALES: Locale[] = ["pt-BR", "en", "es"];

const LANG_MAP: Record<Locale, string> = {
  "pt-BR": "pt-BR",
  en: "en",
  es: "es",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({ children, params }: Props) {
  const locale = (LOCALES.includes(params.locale as Locale) ? params.locale : "pt-BR") as Locale;

  return (
    <div lang={LANG_MAP[locale]}>
      <Providers forcedLocale={locale}>
        <Navbar locale={locale} />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </Providers>
    </div>
  );
}
