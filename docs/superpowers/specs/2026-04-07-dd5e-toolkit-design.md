# D&D 5e Toolkit — Design Spec

## Contexto

Ferramenta web para jogadores e mestres de D&D 5e com tema medieval. Três módulos: Ficha de Personagem, Compêndio de regras/dados, e Área do Mestre. Deploy na Vercel, persistência local (localStorage), sem autenticação no MVP.

## Decisões de Escopo

- **MVP:** 3 módulos funcionais com features core; funcionalidades avançadas (PDF, Modo Sessão, Mapas, Tesouros) ficam para Fase 2
- **Dados:** Híbrido — JSON estáticos para raças/classes/condições/regras + Open5e API para magias/monstros/itens
- **Persistência:** localStorage via Zustand persist middleware; arquitetura pronta para migrar para Supabase
- **Idioma:** PT-BR com termos D&D em inglês (HP, AC, Saving Throws, Skills)
- **Arquitetura:** Monolito client-side Next.js 14 App Router

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript strict |
| Estilo | TailwindCSS (tema medieval customizado) |
| Fontes | Cinzel (títulos) + Crimson Text (corpo) via next/font/google |
| Estado | Zustand + persist middleware (localStorage) |
| Editor rich text | TipTap |
| Ícones | lucide-react |
| Animações | framer-motion |
| API externa | Open5e (api.open5e.com) para magias, monstros, itens |

---

## Estrutura de Pastas

```
dd-5e/
├── app/
│   ├── layout.tsx                    # Root: fontes, tema, navegação
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Tailwind + estilos globais
│   ├── character/
│   │   ├── page.tsx                  # Lista de personagens
│   │   └── [id]/
│   │       └── page.tsx              # Ficha do personagem
│   ├── compendium/
│   │   ├── page.tsx                  # Hub do compêndio
│   │   └── [category]/
│   │       ├── page.tsx              # Lista filtrada
│   │       └── [slug]/
│   │           └── page.tsx          # Detalhe da entrada
│   └── master/
│       ├── page.tsx                  # Dashboard do mestre
│       ├── campaign/[id]/
│       │   └── page.tsx              # Campanha específica
│       └── encounter/[id]/
│           └── page.tsx              # Encounter tracker
├── components/
│   ├── ui/                           # Button, Card, Modal, Input, ScrollSection, SectionHeader, DiceRoller
│   ├── character/                    # StatBox, SkillRow, SpellSlotTracker, ConditionBadge, AttackRow, InventoryRow
│   ├── compendium/                   # CompendiumCard, SearchBar, FilterPanel, CategoryHub
│   ├── master/                       # NpcCard, EncounterTracker, InitiativeList, CampaignCard
│   └── layout/                       # Navbar, Sidebar, Footer
├── data/
│   ├── races.json                    # 9 raças SRD
│   ├── classes.json                  # 12 classes com progressão nível 1-20
│   ├── conditions.json               # 12 condições
│   ├── rules.json                    # Regras rápidas (combate, descanso, viagem)
│   └── skills.json                   # 18 perícias com atributo base
├── lib/
│   ├── dnd5e.ts                      # Cálculos: modificador, proficiência, XP thresholds, encounter difficulty
│   ├── dice.ts                       # Rolador de dados (NdM + bônus)
│   ├── open5e.ts                     # Wrapper para Open5e API com cache
│   └── utils.ts                      # cn(), formatters, helpers
├── store/
│   ├── characterStore.ts             # Zustand: CRUD personagens
│   └── campaignStore.ts              # Zustand: campanhas, NPCs, encontros, notas
├── types/
│   └── dnd5e.ts                      # Todos os tipos do domínio D&D 5e
└── tailwind.config.ts                # Tema medieval customizado
```

---

## Tema Visual

### Paleta de Cores (Tailwind custom)

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
- **Mobile-first:** grid adaptativo, seções colapsáveis na ficha

### Fontes
- **Cinzel** — títulos, headers, nomes de seções
- **Crimson Text** — corpo de texto, descrições, notas

---

## Módulo 1 — Ficha de Personagem

### Rotas
- `GET /character` — Lista de personagens salvos com opção de criar novo
- `GET /character/[id]` — Ficha completa do personagem (client component)

### Modelo de Dados

```typescript
interface Character {
  id: string;
  name: string;
  race: Race;              // 'human' | 'elf' | 'dwarf' | 'halfling' | 'gnome' | 'half-elf' | 'half-orc' | 'tiefling' | 'dragonborn'
  class: CharacterClass;   // 12 classes SRD
  level: number;           // 1-20
  background: string;
  alignment: Alignment;    // 9 alinhamentos
  xp: number;

  attributes: Record<Attribute, number>;  // STR, DEX, CON, INT, WIS, CHA (3-30)

  hp: { max: number; current: number; temporary: number };
  ac: number;
  initiative: number;      // calculado: DEX modifier
  speed: number;

  skillProficiencies: Partial<Record<Skill, 'proficient' | 'expertise'>>;
  savingThrowProficiencies: Attribute[];

  attacks: Attack[];       // { name, attackBonus, damage, damageType }

  spellSlots: Record<number, { max: number; used: number }>;  // nível 1-9
  spells: Record<number, SpellReference[]>;  // cantrips (0) até 9
  spellcastingAbility?: Attribute;

  conditions: Condition[];   // condições ativas

  hitDice: { dieType: number; total: number; used: number };
  deathSaves: { successes: number; failures: number };  // 0-3 cada

  inventory: InventoryItem[];  // { name, quantity, weight, valuePO, description }
  coins: { cp: number; sp: number; ep: number; gp: number; pp: number };

  traits: {
    personality: string;
    ideals: string;
    bonds: string;
    flaws: string;
  };

  notes: {
    appearance: string;
    backstory: string;
    allies: string;
    freeNotes: string;
  };

  createdAt: string;
  updatedAt: string;
}
```

### Cálculos Automáticos (lib/dnd5e.ts)

- **Modificador de atributo:** `Math.floor((value - 10) / 2)`
- **Bônus de proficiência:** `Math.ceil(level / 4) + 1`  → +2 (nv1-4), +3 (nv5-8), +4 (nv9-12), +5 (nv13-16), +6 (nv17-20)
- **Valor de perícia:** `attrMod + (proficient ? profBonus * (expertise ? 2 : 1) : 0)`
- **Iniciativa:** DEX modifier
- **Capacidade de carga:** `STR * 7.5` (kg)
- **XP para próximo nível:** tabela de thresholds oficial

### Geração de Atributos

1. **4d6 drop lowest:** rolar 4d6, descartar o menor, somar os 3 restantes (6 vezes)
2. **Point buy (27 pts):** atributos iniciam em 8, custo variável (8→13 = 1pt cada, 14 = 2pts, 15 = 2pts)
3. **Standard array:** 15, 14, 13, 12, 10, 8

### Layout da Ficha

Página única com seções colapsáveis (accordion):
1. **Identidade** — nome, raça, classe, nível, background, alinhamento, XP
2. **Atributos** — 6 stat boxes em grid (2x3 mobile, 6x1 desktop) com valor e modificador
3. **Combate** — HP (slider + input), HP temp, AC, Iniciativa, Speed, Death Saves, Hit Dice
4. **Saving Throws** — 6 checkboxes de proficiência com valor calculado
5. **Perícias** — 18 skills em lista: checkbox proficiência, checkbox expertise, valor auto
6. **Ataques** — lista editável (nome, bônus, dano, tipo)
7. **Magias** — spell slots com contadores visuais + lista de magias por nível
8. **Condições** — grid de badges toggle (12 condições)
9. **Inventário** — tabela editável + moedas + peso total/capacidade
10. **Traços & Notas** — textareas para personality/ideals/bonds/flaws + notas livres

### Componentes Chave

- `StatBox` — exibe valor do atributo + modificador, input editável
- `SkillRow` — nome da perícia, atributo base, checkboxes prof/expertise, valor calculado
- `SpellSlotTracker` — círculos preenchíveis para slots de cada nível
- `ConditionBadge` — badge toggle com ícone para cada condição
- `AttackRow` — linha editável para ataques
- `InventoryRow` — linha editável para itens

---

## Módulo 2 — Compêndio

### Rotas
- `GET /compendium` — Hub com cards para cada categoria
- `GET /compendium/[category]` — Lista com filtros e busca
- `GET /compendium/[category]/[slug]` — Página de detalhe

### Categorias e Fonte de Dados

| Categoria | Fonte | Rendering |
|-----------|-------|-----------|
| Raças (races) | JSON estático | SSG |
| Classes (classes) | JSON estático | SSG |
| Condições (conditions) | JSON estático | SSG |
| Regras (rules) | JSON estático | SSG |
| Magias (spells) | Open5e API | Server Component + cache |
| Monstros (monsters) | Open5e API | Server Component + cache |
| Itens (items) | Open5e API | Server Component + cache |

### Open5e API Integration (lib/open5e.ts)

```typescript
// Endpoints utilizados:
// GET https://api.open5e.com/v1/spells/?format=json&page=N
// GET https://api.open5e.com/v1/monsters/?format=json&page=N
// GET https://api.open5e.com/v1/magicitems/?format=json&page=N
// GET https://api.open5e.com/v1/weapons/?format=json
// GET https://api.open5e.com/v1/armor/?format=json

// Fetch com Next.js cache:
// fetch(url, { next: { revalidate: 86400 } })  // cache por 24h
```

- Paginação automática para buscar todos os resultados
- Fallback: mensagem amigável se API indisponível
- Filtros client-side sobre dados já fetched

### UI do Compêndio

**Hub (`/compendium`):**
- Grid de cards temáticos: cada categoria com ícone SVG (lucide-react), nome, contagem de entradas
- Busca global no topo com debounce 300ms

**Lista (`/compendium/[category]`):**
- Sidebar de filtros (ou bottom sheet em mobile):
  - Magias: nível (0-9), escola, classe
  - Monstros: CR, tipo, tamanho
  - Itens: raridade, tipo, attunement
- Grid de cards com: nome, tipo/escola, nível/CR, preview de descrição
- Busca por nome dentro da categoria

**Detalhe (`/compendium/[category]/[slug]`):**
- Layout de "página de livro": fundo parchment, bordas decoradas
- Todos os campos da entrada exibidos com formatação adequada
- Botão "Adicionar à ficha" (para magias/itens) que conecta ao characterStore

### Componentes Chave

- `CompendiumCard` — card medieval com nome, tipo, ícone, preview
- `SearchBar` — input com debounce, ícone de lupa, limpar
- `FilterPanel` — sidebar/bottom sheet com filtros por categoria
- `CategoryHub` — grid de cards para o hub principal

---

## Módulo 3 — Área do Mestre

### Rotas
- `GET /master` — Dashboard (protegido por PIN)
- `GET /master/campaign/[id]` — Campanha com abas (NPCs, Encontros, Sessões, Notas)
- `GET /master/encounter/[id]` — Encounter tracker em tela cheia

### Proteção por PIN

- PIN de 4-6 dígitos armazenado como hash (SHA-256) no localStorage
- Primeira visita: tela de criação de PIN
- Visitas subsequentes: tela de login com PIN
- Sem expiração de sessão (persiste enquanto localStorage existir)

### Gestão de Campanhas

```typescript
interface Campaign {
  id: string;
  name: string;
  description: string;
  world: string;
  playerCharacterIds: string[];  // referência a Character.id
  sessions: Session[];
  npcs: NPC[];
  encounters: Encounter[];
  notes: string;  // TipTap HTML
  createdAt: string;
  updatedAt: string;
}
```

- CRUD de campanhas
- Dashboard mostra campanhas como cards com resumo
- Campanha ativa definida no store

### Gestão de NPCs

```typescript
interface NPC {
  id: string;
  name: string;
  race: string;
  profession: string;
  alignment: Alignment;
  hp: { max: number; current: number };
  ac: number;
  attributes: Record<Attribute, number>;
  role: 'ally' | 'neutral' | 'antagonist' | 'unknown';
  relationships: string;
  secrets: string;       // visível só no DM view
  avatar: string;        // iniciais geradas
  notes: string;
}
```

- Lista de NPCs por campanha com filtro por role
- Card com avatar (iniciais), nome, papel (badge colorido)
- Modal/drawer de edição

### Gestão de Encontros

```typescript
interface Encounter {
  id: string;
  name: string;
  monsters: EncounterMonster[];  // { name, hp, maxHp, ac, initiative, conditions }
  partyLevel: number;
  partySize: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  totalXP: number;
  adjustedXP: number;
  status: 'planning' | 'active' | 'completed';
}
```

**Planejamento:**
- Selecionar nível e tamanho do grupo → mostra orçamento de XP por dificuldade
- Adicionar monstros (buscar do compêndio ou criar rápido) → calcula XP total e dificuldade
- Multiplicador de XP por quantidade de monstros (tabela DMG)

**Encounter Tracker (tela cheia):**
- Lista de iniciativa ordenada (PJs + monstros)
- Cada entrada: nome, HP bar, AC, condições ativas
- Botões: rolar iniciativa, próximo turno, aplicar dano/cura
- Indicador de turno atual com destaque visual

### Notas do Mestre

- Editor TipTap com toolbar básica (bold, italic, headings, lists, links)
- Auto-save a cada 3 segundos (debounced)
- Tags para categorizar notas: Combate, Social, Exploração, Plot
- Notas vinculadas à sessão (data + resumo)
- Bloco de notas global (não vinculado a sessão)

### Componentes Chave

- `NpcCard` — card com avatar iniciais, nome, papel, HP
- `EncounterTracker` — tela de combat tracker com iniciativa
- `InitiativeList` — lista ordenada com HP bars e condições
- `CampaignCard` — card de campanha com resumo
- `RichTextEditor` — wrapper TipTap configurado

---

## Verificação e Testes

### Como testar o MVP

1. **Build & Deploy:** `npm run build` deve completar sem erros; deploy via `vercel` CLI ou push para repo conectado
2. **Ficha de Personagem:**
   - Criar personagem → preencher todos os campos → verificar cálculos automáticos (modificadores, perícias, proficiência)
   - Testar 3 métodos de geração de atributos
   - Recarregar página → dados persistidos no localStorage
3. **Compêndio:**
   - Navegar pelas categorias → verificar dados carregados (JSON e Open5e)
   - Buscar por nome → resultados filtrados com debounce
   - Aplicar filtros → resultados atualizados
4. **Área do Mestre:**
   - Criar PIN → acessar dashboard → criar campanha
   - Adicionar NPC → verificar campos e segredos
   - Criar encontro → adicionar monstros → verificar cálculo de dificuldade
   - Encounter tracker → rolar iniciativas → simular combate
   - Notas com TipTap → verificar auto-save
5. **Responsividade:** testar em mobile (375px), tablet (768px), desktop (1280px+)
6. **Performance:** Lighthouse score > 90 para compêndio (SSG pages)

---

## Fase 2 (Futuro)

Funcionalidades adiadas para iterações subsequentes:
- Exportar ficha como PDF (@react-pdf/renderer)
- Modo Sessão (barra HP rápida, roll de iniciativa com animação, contadores de classe, log)
- Gestão de Mapas (upload + editor de pinos + export PNG)
- Gestão de Tesouros (gerador de loot por CR)
- Timeline de eventos de sessão
- Upload de avatar de NPC
- Autenticação Supabase + sync realtime
- Rolador de dados 3D (Three.js)
- PWA offline
