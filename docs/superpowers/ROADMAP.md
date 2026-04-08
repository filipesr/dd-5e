# D&D 5e Toolkit — Roadmap

Sumario central do projeto. Cada etapa aponta para seu arquivo de spec e plano detalhado.

---

## Visao Geral

| Item | Valor |
|------|-------|
| **Projeto** | Ferramenta web D&D 5e (ficha, compendio, area do mestre) |
| **Stack** | Next.js 14 App Router, TypeScript strict, TailwindCSS, Zustand, TipTap, framer-motion |
| **Deploy** | Vercel |
| **Persistencia** | localStorage (MVP) → Supabase (Fase 2) |
| **Idioma UI** | PT-BR com termos D&D em ingles |
| **Spec completa** | [`specs/2026-04-07-dd5e-toolkit-design.md`](specs/2026-04-07-dd5e-toolkit-design.md) |
| **Plano completo** | [`plans/2026-04-07-dd5e-toolkit.md`](plans/2026-04-07-dd5e-toolkit.md) |

---

## Fase 1 — MVP (atual)

### Etapa 0: Fundacao

| # | Descricao | Status | Spec | Plano | Arquivos-chave |
|---|-----------|--------|------|-------|----------------|
| T1 | Scaffold Next.js + Tailwind + fontes | ✅ | [spec](specs/modules/00-foundation.md) | [plano](plans/phases/00-scaffold.md) | `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css` |

### Etapa 1: Dominio e Dados

| # | Descricao | Status | Spec | Plano | Arquivos-chave |
|---|-----------|--------|------|-------|----------------|
| T2 | Tipos TypeScript do dominio D&D 5e | ✅ | [spec](specs/modules/01-domain.md) | [plano](plans/phases/01-domain-data.md) | `types/dnd5e.ts` |
| T3 | Dados estaticos SRD (JSON) | ✅ | [spec](specs/modules/01-domain.md) | [plano](plans/phases/01-domain-data.md) | `data/*.json` |
| T4 | Biblioteca de calculos D&D (TDD) | ✅ | [spec](specs/modules/01-domain.md) | [plano](plans/phases/01-domain-data.md) | `lib/dnd5e.ts`, `lib/__tests__/dnd5e.test.ts` |
| T5 | Rolador de dados (TDD) | ✅ | [spec](specs/modules/01-domain.md) | [plano](plans/phases/01-domain-data.md) | `lib/dice.ts`, `lib/__tests__/dice.test.ts` |

### Etapa 2: Camada de Dados e UI Base

| # | Descricao | Status | Spec | Plano | Arquivos-chave |
|---|-----------|--------|------|-------|----------------|
| T6 | Client Open5e API | ✅ | [spec](specs/modules/02-compendium.md) | [plano](plans/phases/02-data-layer-ui.md) | `lib/open5e.ts` |
| T7 | Character Store (Zustand) | ✅ | [spec](specs/modules/01-domain.md) | [plano](plans/phases/02-data-layer-ui.md) | `store/characterStore.ts` |
| T8 | Campaign Store (Zustand) | ✅ | [spec](specs/modules/03-master.md) | [plano](plans/phases/02-data-layer-ui.md) | `store/campaignStore.ts` |
| T9 | Componentes UI compartilhados | ✅ | [spec](specs/modules/00-foundation.md) | [plano](plans/phases/02-data-layer-ui.md) | `components/ui/*.tsx` |
| T10 | Navbar e Layout | ✅ | [spec](specs/modules/00-foundation.md) | [plano](plans/phases/02-data-layer-ui.md) | `components/layout/Navbar.tsx` |

### Etapa 3: Componentes de Cada Modulo

| # | Descricao | Status | Spec | Plano | Arquivos-chave |
|---|-----------|--------|------|-------|----------------|
| T11 | Componentes da Ficha | ✅ | [spec](specs/modules/01-domain.md) | [plano](plans/phases/03-feature-components.md) | `components/character/*.tsx` (9 arquivos) |
| T12 | Componentes do Compendio | ✅ | [spec](specs/modules/02-compendium.md) | [plano](plans/phases/03-feature-components.md) | `components/compendium/*.tsx` (4 arquivos) |
| T13 | Componentes do Mestre | ✅ | [spec](specs/modules/03-master.md) | [plano](plans/phases/03-feature-components.md) | `components/master/*.tsx` (6 arquivos) |

### Etapa 4: Paginas (Rotas)

| # | Descricao | Status | Spec | Plano | Arquivos-chave |
|---|-----------|--------|------|-------|----------------|
| T14 | Paginas de Personagem | ✅ | [spec](specs/modules/01-domain.md#layout-da-ficha) | [plano](plans/phases/04-pages.md) | `app/character/page.tsx`, `app/character/[id]/page.tsx` |
| T15 | Paginas do Compendio | ✅ | [spec](specs/modules/02-compendium.md#ui-do-compendio) | [plano](plans/phases/04-pages.md) | `app/compendium/**/*.tsx` (4 arquivos) |
| T16 | Paginas do Mestre | ✅ | [spec](specs/modules/03-master.md) | [plano](plans/phases/04-pages.md) | `app/master/**/*.tsx` (4 arquivos) |

### Etapa 5: Polimento e Deploy

| # | Descricao | Status | Spec | Plano | Arquivos-chave |
|---|-----------|--------|------|-------|----------------|
| T17 | Polish visual e responsividade | ⏳ Pendente | [spec](specs/modules/04-polish-deploy.md) | [plano](plans/phases/05-polish-deploy.md) | CSS, animacoes framer-motion |
| T18 | Build, verificacao e deploy Vercel | ⏳ Parcial | [spec](specs/modules/04-polish-deploy.md) | [plano](plans/phases/05-polish-deploy.md) | `vercel --prod` |

### Problemas Conhecidos (MVP)

- `master/campaign/[id]`: First Load JS = 270kB (bundle TipTap) — considerar dynamic import
- `data/classes.json`: Half-elf abilityBonuses usa placeholders para bonus a escolha do jogador
- Filtros avancados do compendio (por escola de magia, CR, raridade) nao implementados ainda

### Bugfixes aplicados pos-MVP

- [x] Hydration mismatch em `/character/[id]` — adicionado `isHydrated` guard (`748d6d5`)
- [x] "Rendered more hooks" em `/character/[id]` — `useSessionStore` movido antes dos early returns (`257e971`)
- [x] TipTap SSR error em `RichTextEditor` — adicionado `immediatelyRender: false` (`7ee7b74`)

---

## Fase 2 — Prioridade Alta (completa)

### Etapa 6: PDF Export + Modo Sessao

| # | Descricao | Status | Spec | Plano | Arquivos-chave |
|---|-----------|--------|------|-------|----------------|
| T19 | PDF Export da ficha (3 paginas WOTC) | ✅ | [spec](specs/modules/06-pdf-export.md) | [plano](plans/phases/06-pdf-export.md) | `lib/pdfExport.tsx`, `components/character/PdfExportButton.tsx` |
| T20 | Modo Sessao (contadores, iniciativa, log) | ✅ | [spec](specs/modules/07-session-mode.md) | [plano](plans/phases/07-session-mode.md) | `store/sessionStore.ts`, `lib/classResources.ts`, `components/character/SessionPanel.tsx` |

---

## Fase 2 — Prioridade Media (completa)

### Etapa 7: Tesouros, Mapas e Import/Export JSON

| # | Descricao | Status | Spec | Plano | Arquivos-chave |
|---|-----------|--------|------|-------|----------------|
| T21 | Gestao de Tesouros (loot por CR, inventario) | ✅ | [spec](specs/modules/08-treasure-management.md) | [plano](plans/phases/08-treasure-management.md) | `lib/lootTables.ts`, `components/master/Treasure*.tsx` |
| T22 | Gestao de Mapas (upload base64, pinos, export PNG) | ✅ | [spec](specs/modules/09-map-management.md) | [plano](plans/phases/09-map-management.md) | `components/master/Map*.tsx`, `react-dropzone`, `html2canvas` |
| T23 | Import/Export fichas JSON | ✅ | [spec](specs/modules/10-json-import-export.md) | [plano](plans/phases/10-json-import-export.md) | `lib/jsonImportExport.ts`, `components/character/Json*.tsx` |

---

## Fase 2 — Futuro (prioridade baixa / adiado)

Funcionalidades adiadas. Spec geral: [`specs/modules/05-fase2-futuro.md`](specs/modules/05-fase2-futuro.md)

| Feature | Prioridade | Notas |
|---------|------------|-------|
| Autenticacao Supabase + sync realtime | Adiado | Ultima etapa (decisao do usuario) |
| Upload de avatar de NPC | Adiado | Junto com Supabase (cloud persistence) |
| Timeline de eventos de sessao | Baixa | — |
| Rolador de dados 3D (Three.js) | Baixa | — |
| PWA offline | Baixa | — |
| Gerador de NPCs com IA (Anthropic API) | Baixa | — |
| VTT basico com fog of war | Baixa | — |
