# Spec: Modulo 3 — Area do Mestre

**Status:** ✅ Implementado (T8, T13, T16)

---

## Rotas

- `GET /master` — Dashboard (protegido por PIN)
- `GET /master/campaign/[id]` — Campanha com abas (NPCs, Encontros, Sessoes, Notas)
- `GET /master/encounter/[id]` — Encounter tracker em tela cheia

## Protecao por PIN

- PIN de 4-6 digitos armazenado como hash SHA-256 no localStorage
- Primeira visita: tela de criacao de PIN
- Visitas subsequentes: tela de login com PIN
- Sem expiracao de sessao (persiste enquanto localStorage existir)
- Componente: `PinGuard` wrapping `app/master/layout.tsx`

## Gestao de Campanhas

```typescript
interface Campaign {
  id: string;
  name: string;
  description: string;
  world: string;
  playerCharacterIds: string[];
  sessions: Session[];
  npcs: NPC[];
  encounters: Encounter[];
  notes: string;  // TipTap HTML
  createdAt: string;
  updatedAt: string;
}
```

- CRUD completo (criar, editar, excluir)
- Dashboard mostra campanhas como cards com resumo (nome, mundo, PJs, sessoes)
- Modal de criacao com nome, mundo, descricao

## Gestao de NPCs

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
  secrets: string;       // visivel so no DM view
  avatar: string;        // iniciais geradas do nome
  notes: string;
}
```

- Lista por campanha, card com avatar (iniciais), nome, papel (badge colorido)
- Modal de criacao: nome, raca, profissao, alinhamento, papel, notas, segredos
- Modal de detalhe com todas as informacoes + botao excluir

## Gestao de Encontros

```typescript
interface Encounter {
  id: string;
  name: string;
  monsters: EncounterMonster[];
  playerCharacters: { name: string; initiative: number; ac: number }[];
  partyLevel: number;
  partySize: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  totalXP: number;
  adjustedXP: number;
  status: 'planning' | 'active' | 'completed';
  currentTurnIndex: number;
}
```

**Planejamento (EncounterPlanner):**
- Inputs: nivel do grupo, tamanho do grupo
- Adicionar monstros: nome, HP, AC, XP
- Calculo automatico: XP total, multiplicador DMG, XP ajustado, dificuldade
- Badge de dificuldade: Facil (verde), Medio (gold), Dificil (blood), Mortal (roxo)

**Tracker (EncounterTracker — tela cheia):**
- Lista de iniciativa ordenada (PJs + monstros)
- Cada entrada: nome, iniciativa, HP bar, AC
- Rolar iniciativas (1d20 para todos)
- Proximo turno (destaque visual no turno atual)
- Aplicar dano rapido por monstro

## Notas do Mestre

- Editor TipTap (StarterKit + Link + Placeholder)
- Toolbar: bold, italic, h1, h2, listas, links
- Auto-save debounced (3 segundos)
- Vinculado a campanha.notes

## Sessoes

```typescript
interface Session {
  id: string;
  date: string;
  title: string;
  summary: string;
  tags: string[];
  notes: string;
}
```

- Lista por campanha com titulo, data (PT-BR), resumo
- Modal de criacao: titulo, resumo

## Store (store/campaignStore.ts)

- Zustand + immer + persist (localStorage, key: `dd5e-campaigns`)
- PIN: `setPin`, `verifyPin`, `isPinSet` (SHA-256 via crypto.subtle)
- Campanhas: CRUD completo
- NPCs: `addNpc`, `updateNpc`, `deleteNpc` (dentro de campanha)
- Encontros: `addEncounter`, `updateEncounter`, `deleteEncounter`, `recalculateEncounter`
- Sessoes: `addSession`, `updateSession`, `deleteSession`
- Notas: `updateCampaignNotes`
- Hydration guard: `isHydrated` flag

## Componentes (components/master/)

| Componente | Descricao |
|------------|-----------|
| PinGuard | Gate de autenticacao por PIN com SHA-256 |
| CampaignCard | Card com nome, mundo, contagem PJs/sessoes |
| NpcCard | Avatar iniciais, nome, raca-profissao, badge de papel |
| EncounterPlanner | Inputs de grupo + lista de monstros + calculo dificuldade |
| EncounterTracker | Lista de iniciativa com HP bars, dano rapido, controle de turno |
| RichTextEditor | Wrapper TipTap com toolbar e auto-save. Requer `immediatelyRender: false` para SSR. |

## Pendencias (Fase 2)

- Gestao de Mapas (upload + editor de pinos + export PNG via html2canvas)
- Gestao de Tesouros (gerador de loot por CR, inventario de campanha)
- Timeline de eventos de sessao
- Upload de avatar de NPC (so iniciais no MVP)
- Tags em sessoes (campo existe no tipo mas nao tem UI)
