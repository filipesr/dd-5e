# Plano: Etapa 0 — Scaffold do Projeto (T1)

**Status:** ✅ Completo
**Spec:** `docs/superpowers/specs/modules/00-foundation.md`

---

### Task 1: Project Scaffold and Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [x] **Step 1: Create Next.js 14 project**

```bash
cd /Users/fsrezende/Documents/algorithm/dd-5e
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Select defaults. This scaffolds the project with App Router and Tailwind.

- [x] **Step 2: Install all dependencies**

```bash
npm install zustand immer framer-motion lucide-react @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder uuid
npm install -D @types/uuid
```

- [x] **Step 3: Configure Tailwind theme**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: "#f4e4c1",
          DEFAULT: "#ede0b0",
          dark: "#d4c48a",
        },
        ink: {
          light: "#1a0f02",
          DEFAULT: "#0d0600",
          dark: "#000000",
        },
        blood: {
          light: "#a52a2a",
          DEFAULT: "#8b1a1a",
          dark: "#5c1010",
        },
        gold: {
          light: "#b8941e",
          DEFAULT: "#8b6914",
          dark: "#6b4f0e",
        },
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        crimson: ["var(--font-crimson)", "serif"],
      },
      boxShadow: {
        tome: "0 4px 12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(139, 105, 20, 0.3)",
        "tome-hover":
          "0 6px 20px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(139, 105, 20, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [x] **Step 4: Configure root layout with fonts**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "D&D 5e Toolkit",
  description:
    "Ferramenta completa para jogadores e mestres de Dungeons & Dragons 5a Edição",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${crimsonText.variable}`}>
      <body className="bg-ink font-crimson text-parchment-light min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [x] **Step 5: Configure globals.css**

Replace `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background: linear-gradient(180deg, #0d0600 0%, #1a0f02 100%);
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #0d0600;
  }

  ::-webkit-scrollbar-thumb {
    background: #8b6914;
    border-radius: 4px;
  }
}

@layer components {
  .card-medieval {
    @apply bg-parchment border border-gold rounded-lg shadow-tome text-ink;
  }

  .card-medieval-dark {
    @apply bg-ink-light border border-gold/30 rounded-lg shadow-tome text-parchment-light;
  }

  .btn-primary {
    @apply bg-gold hover:bg-gold-light text-ink font-cinzel font-bold px-4 py-2 rounded transition-colors;
  }

  .btn-danger {
    @apply bg-blood hover:bg-blood-light text-parchment-light font-cinzel font-bold px-4 py-2 rounded transition-colors;
  }

  .input-medieval {
    @apply bg-parchment-light border border-gold/50 rounded px-3 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold;
  }
}
```

- [x] **Step 6: Create placeholder landing page**

Replace `app/page.tsx` with:

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="font-cinzel text-5xl text-gold mb-4">D&D 5e Toolkit</h1>
      <p className="text-parchment-light/70 text-lg mb-12 text-center max-w-md">
        Ferramenta completa para jogadores e mestres de Dungeons & Dragons 5a Edição
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <Link href="/character" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">Personagens</h2>
          <p className="text-sm text-parchment-light/60">Crie e gerencie fichas de personagem</p>
        </Link>
        <Link href="/compendium" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">Compêndio</h2>
          <p className="text-sm text-parchment-light/60">Raças, classes, magias, monstros e itens</p>
        </Link>
        <Link href="/master" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">Mestre</h2>
          <p className="text-sm text-parchment-light/60">Dashboard completo para o DM</p>
        </Link>
      </div>
    </main>
  );
}
```

- [x] **Step 7: Create folder structure**

```bash
mkdir -p components/ui components/character components/compendium components/master components/layout
mkdir -p data lib store types
```

- [x] **Step 8: Verify build and commit**

```bash
npm run build
```

Expected: Build succeeds.

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 project with medieval Tailwind theme

Configure Cinzel + Crimson Text fonts, custom color palette (parchment/ink/blood/gold),
base CSS components, and folder structure for all 3 modules."
```

---

