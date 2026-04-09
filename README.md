# D&D 5e Toolkit

Ferramenta web completa para jogadores e mestres de Dungeons & Dragons 5a Edicao.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript (strict)
- **Estilo:** TailwindCSS (tema medieval customizado)
- **Estado:** Zustand + localStorage
- **Fontes:** Cinzel (titulos) + Crimson Text (corpo)
- **Editor:** TipTap (notas rich text)
- **Icones:** lucide-react
- **Animacoes:** framer-motion
- **PDF:** @react-pdf/renderer
- **Mapas:** react-dropzone + html2canvas
- **API:** Open5e (api.open5e.com)

## Funcionalidades

### Modulo 1 — Ficha de Personagem (`/character`)
- Criacao e edicao completa de personagens D&D 5e
- 6 atributos com calculo automatico de modificadores
- 3 metodos de geracao: 4d6 drop lowest, point buy (27pts), standard array
- 18 pericias com proficiencia/expertise e calculo automatico
- HP tracker com dano/cura rapida e HP temporario
- Spell slots visuais por nivel (1-9)
- 12 condicoes toggle (Cego, Enfeiticado, etc.)
- Inventario com peso e capacidade de carga
- Death saves e hit dice
- Exportar ficha como PDF (3 paginas estilo WOTC)
- Exportar/importar ficha como JSON
- **Modo Sessao:** rolagem interativa de skills/saves/ataques, vantagem/desvantagem, contadores de recursos por classe, log de rolagens

### Modulo 2 — Compendio (`/compendium`)
- Racas (9 SRD), Classes (12 com progressao completa)
- Magias, Monstros, Itens Magicos (via Open5e API com cache 24h)
- Condicoes e Regras Rapidas
- Busca com debounce e filtros por categoria

### Modulo 3 — Area do Mestre (`/master`)
- Protecao por PIN (SHA-256)
- Gestao de campanhas (CRUD completo)
- NPCs com avatar (iniciais), papel (Aliado/Neutro/Antagonista), segredos
- Encontros: orcamento de XP por CR, tracker de iniciativa com HP
- Sessoes: registro com editar/excluir
- Notas rich text (TipTap) com auto-save
- Tesouros: gerador de loot por CR (tabelas DMG), itens magicos aleatorios
- Mapas: upload de imagem (base64), editor de pinos (6 tipos), visao do jogador, export PNG
- Progress Clocks (relogios de tensao 4/6/8 segmentos)
- Gerador de eventos aleatorios (7 categorias PT-BR)
- Gerador rapido de NPC (nome, raca, profissao, motivacao, segredo)

## Inicio Rapido

```bash
# Instalar dependencias
npm install

# Rodar em desenvolvimento
npm run dev

# Abrir no navegador
open http://localhost:3000

# Rodar testes
npm test

# Build de producao
npm run build

# Deploy na Vercel
npx vercel --prod
```

## Variaveis de Ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Para o MVP, nenhuma variavel eh obrigatoria. O app funciona 100% client-side com localStorage.

Variaveis opcionais:
| Variavel | Descricao | Obrigatoria |
|----------|-----------|-------------|
| `NEXT_PUBLIC_OPEN5E_BASE_URL` | URL da Open5e API | Nao (usa padrao) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Nao (Fase 2) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anonima Supabase | Nao (Fase 2) |
| `ANTHROPIC_API_KEY` | API key Anthropic | Nao (Fase 2) |

## Estrutura do Projeto

```
dd-5e/
├── app/                          # Rotas Next.js (App Router)
│   ├── character/                # Ficha de personagem
│   ├── compendium/               # Compendio SRD + Open5e
│   └── master/                   # Dashboard do mestre
├── components/
│   ├── ui/                       # Componentes base (Button, Card, Modal...)
│   ├── character/                # Componentes da ficha
│   ├── compendium/               # Cards, busca, filtros
│   ├── master/                   # NPCs, encontros, mapas, tesouros
│   └── layout/                   # Navbar, PageTransition
├── data/                         # JSONs estaticos SRD (racas, classes, etc.)
├── lib/                          # Calculos, dice, API, utils
├── store/                        # Zustand stores
├── types/                        # Tipos TypeScript
└── docs/superpowers/             # Specs, planos, roadmap
```

## Testes

```bash
npm test              # Rodar todos os testes
npm test -- --verbose # Modo verbose
```

Cobertura de testes:
- `lib/dnd5e.ts` — modificadores, proficiencia, XP, encounter difficulty
- `lib/dice.ts` — rolagem, notacao, 4d6 drop lowest
- `lib/classResources.ts` — recursos por classe
- `lib/rollWithAdvantage.ts` — vantagem/desvantagem
- `lib/lootTables.ts` — geracao de loot por CR
- `lib/jsonImportExport.ts` — validacao de import/export

## Documentacao

- **Roadmap:** `docs/superpowers/ROADMAP.md`
- **Specs por modulo:** `docs/superpowers/specs/modules/`
- **Planos de implementacao:** `docs/superpowers/plans/phases/`

## Fase 2 (Futuro)

- [ ] Autenticacao Supabase (Google/Discord OAuth)
- [ ] Sync realtime de fichas entre jogadores
- [ ] Upload de avatar de NPC para cloud
- [ ] Rolador de dados 3D (Three.js)
- [ ] PWA offline
- [ ] Gerador de NPCs com IA (Anthropic API)
- [ ] VTT basico com fog of war
- [ ] Timeline visual de sessoes

## Licenca

MIT
