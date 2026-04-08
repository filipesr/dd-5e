# Spec: Fundacao e Tema Visual

**Status:** ✅ Implementado (T1, T9, T10)

---

## Stack Tecnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript strict |
| Estilo | TailwindCSS (tema medieval customizado) |
| Fontes | Cinzel (titulos) + Crimson Text (corpo) via next/font/google |
| Estado | Zustand + persist middleware (localStorage) |
| Editor rich text | TipTap |
| Icones | lucide-react |
| Animacoes | framer-motion |
| API externa | Open5e (api.open5e.com) |

## Paleta de Cores (Tailwind custom)

```
parchment:  { light: '#f4e4c1', DEFAULT: '#ede0b0', dark: '#d4c48a' }
ink:        { light: '#1a0f02', DEFAULT: '#0d0600', dark: '#000000' }
blood:      { light: '#a52a2a', DEFAULT: '#8b1a1a', dark: '#5c1010' }
gold:       { light: '#b8941e', DEFAULT: '#8b6914', dark: '#6b4f0e' }
```

- **Background:** gradiente de `ink.DEFAULT` (#0d0600) a `ink.light` (#1a0f02)
- **Cards:** fundo `parchment`, borda `gold`, box-shadow tipo pergaminho antigo
- **Destaques de combate:** `blood.DEFAULT`
- **Textos:** `parchment.light` sobre fundo escuro, `ink.DEFAULT` sobre parchment
- **Mobile-first:** grid adaptativo, secoes colapsaveis na ficha

## Fontes

- **Cinzel** — titulos, headers, nomes de secoes
- **Crimson Text** — corpo de texto, descricoes, notas

## Componentes UI Base

| Componente | Arquivo | Descricao |
|------------|---------|-----------|
| Button | `components/ui/Button.tsx` | Variantes: primary (gold), danger (blood), ghost, secondary. Tamanhos: sm/md/lg |
| Card | `components/ui/Card.tsx` | Variantes: parchment, dark. Borda gold, shadow-tome |
| Modal | `components/ui/Modal.tsx` | Overlay animado (framer-motion), fecha com Escape/click-fora |
| Input | `components/ui/Input.tsx` | Input, Textarea, Select — com label opcional |
| ScrollSection | `components/ui/ScrollSection.tsx` | Accordion colapsavel com animacao |
| SectionHeader | `components/ui/SectionHeader.tsx` | Titulo com linhas decorativas douradas |
| Badge | `components/ui/Badge.tsx` | Badge toggle, 5 cores: gold/blood/green/blue/purple |

## Layout

| Componente | Arquivo | Descricao |
|------------|---------|-----------|
| Navbar | `components/layout/Navbar.tsx` | Sticky, links (Personagens/Compendio/Mestre), mobile hamburger |
| Root Layout | `app/layout.tsx` | Fontes, Navbar, main wrapper |

## Estrutura de Pastas

```
dd-5e/
├── app/                    # Rotas (App Router)
├── components/
│   ├── ui/                 # Componentes base reutilizaveis
│   ├── character/          # Componentes da ficha
│   ├── compendium/         # Cards, filtros, busca
│   ├── master/             # NPC, encounter, campaign
│   └── layout/             # Navbar
├── data/                   # JSONs estaticos SRD
├── lib/                    # Calculos, dice, API, utils
├── store/                  # Zustand stores
└── types/                  # Tipos TypeScript
```
