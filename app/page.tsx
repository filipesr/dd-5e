"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="font-cinzel text-5xl text-gold mb-4">D&D 5e Toolkit</h1>
      <p className="text-parchment-light/70 text-lg mb-12 text-center max-w-md">
        {t.landing.subtitle}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <Link href="/character" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">{t.landing.characters.title}</h2>
          <p className="text-sm text-parchment-light/60">{t.landing.characters.desc}</p>
        </Link>
        <Link href="/compendium" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">{t.landing.compendium.title}</h2>
          <p className="text-sm text-parchment-light/60">{t.landing.compendium.desc}</p>
        </Link>
        <Link href="/master" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">{t.landing.master.title}</h2>
          <p className="text-sm text-parchment-light/60">{t.landing.master.desc}</p>
        </Link>
      </div>
    </main>
  );
}
