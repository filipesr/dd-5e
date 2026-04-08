# Spec: Ferramentas de Sessao do Mestre (Etapa 9)

**Status:** Pendente
**Prioridade:** Importante
**Dependencias:** Modulo 3 completo (✅)

---

## Objetivo

Ferramentas para o mestre usar durante uma sessao de jogo: relogios de tensao (progress clocks), gerador de eventos aleatorios, sistema de inspiracao, e gerador rapido de NPC.

## Funcionalidades

### 1. Progress Clocks (Relogios de Tensao)

Relogios visuais circulares divididos em segmentos (4, 6, ou 8). Cada segmento pode ser preenchido para representar progresso de ameacas, objetivos ou contagens.

Exemplos de uso:
- "Guardas se aproximando" (6 segmentos, cada falha preenche 1)
- "Ritual sendo completado" (8 segmentos)
- "Confianca do NPC" (4 segmentos)

Interface:
- Criar clock: nome + numero de segmentos (4/6/8)
- Clicar segmento para preencher/esvaziar
- Visual: circulo dividido em fatias (tipo relogio, estilo Blades in the Dark)
- Lista de clocks ativos na aba de notas ou em painel dedicado
- Persistido no store da campanha

### 2. Gerador de Eventos Aleatorios

Tabelas aleatorias para improvisacao do mestre:

**Tabelas:**
- Encontros de viagem (20 opcoes por terreno: floresta, montanha, pantano, deserto, cidade)
- Clima (10 opcoes)
- Complicacoes de masmorra (15 opcoes)
- Eventos sociais (15 opcoes)
- Twist de plot (10 opcoes)

Interface:
- Selecionar categoria
- Botao "Sortear" → mostra resultado aleatorio
- Opcao de re-sortear
- Resultados em PT-BR

### 3. Inspiracao

Sistema para o mestre dar/remover inspiracao dos PJs vinculados a campanha.

- Toggle por PJ: tem/nao tem inspiracao
- Visivel na lista de PJs da campanha
- Inspiracao permite um reroll ou vantagem em uma rolagem (regra SRD)
- Persistido no character store (campo `inspiration: boolean`)

### 4. Gerador Rapido de NPC

Gerador aleatorio que cria um NPC basico em 1 clique:

Gera:
- Nome (pool de ~50 nomes fantasticos PT-BR)
- Raca (aleatorio das 9)
- Profissao (pool de ~30 profissoes: ferreiro, taberneiro, mercador, guarda, sacerdote, etc.)
- Motivacao (pool de ~20: vinganca, riqueza, proteger familia, encontrar artefato, etc.)
- Segredo (pool de ~20: eh um espiao, tem divida com demonio, esconde identidade real, etc.)
- Traco de personalidade (pool de ~20)

Interface:
- Botao "Gerar NPC Rapido" na aba de NPCs
- Mostra resultado em card
- Botao "Adicionar a Campanha" que salva como NPC real

## Arquivos a Criar

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `lib/randomTables.ts` | Pure data + functions | Tabelas aleatorias + funcoes de sorteio |
| `lib/npcGenerator.ts` | Pure function | Gera NPC aleatorio a partir de pools |
| `components/master/ProgressClock.tsx` | Client Component | Relogio visual circular |
| `components/master/ProgressClockManager.tsx` | Client Component | Lista de clocks + criar novo |
| `components/master/RandomEventGenerator.tsx` | Client Component | UI de sorteio de eventos |
| `components/master/QuickNpcGenerator.tsx` | Client Component | Gera NPC em 1 clique |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `types/dnd5e.ts` | Adicionar ProgressClock interface; `inspiration: boolean` no Character |
| `store/campaignStore.ts` | Adicionar clocks[] na Campaign + CRUD |
| `store/characterStore.ts` | Adicionar toggleInspiration action |
| `app/master/campaign/[id]/page.tsx` | Adicionar clocks no painel de notas, NPC generator na aba NPCs |

## Tipos Novos

```typescript
export interface ProgressClock {
  id: string;
  name: string;
  segments: number;    // 4, 6, ou 8
  filled: number;      // 0 ate segments
}
```

Adicionar `clocks: ProgressClock[]` na Campaign.
Adicionar `inspiration: boolean` no Character (default false).

## Verificacao

- Criar clock de 6 segmentos → clicar segmentos → preenche/esvazia
- Sortear evento de floresta → texto aleatorio em PT-BR
- Gerar NPC rapido → nome, raca, profissao, motivacao, segredo
- Adicionar NPC gerado a campanha → aparece na lista de NPCs
- Dar inspiracao a PJ → toggle visivel
