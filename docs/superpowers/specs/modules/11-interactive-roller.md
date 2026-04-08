# Spec: Rolador Interativo (Etapa 8)

**Status:** Pendente
**Prioridade:** Critica
**Dependencias:** Session Mode (T20) completo (✅)

---

## Objetivo

Transformar a ficha de personagem de um formulario estatico em uma ferramenta de jogo interativa. O jogador deve poder clicar em qualquer pericia, saving throw ou ataque para rolar os dados automaticamente, com resultado exibido no Roll Log da sessao.

## Funcionalidades

### 1. Rolar Skill Check (1 clique)

Na lista de pericias, cada skill ganha um botao de rolar (icone de dado ou a propria linha eh clicavel).

Ao clicar:
- Rola 1d20 + skill value (ja calculado: mod + proficiency)
- Se vantagem/desvantagem ativo: rola 2d20, pega maior/menor
- Resultado aparece em popup breve (toast) + adiciona ao Roll Log
- Log entry: tipo "ability", descricao "Percepcao", notacao "1d20+4", resultado total

### 2. Rolar Saving Throw (1 clique)

Na secao de Saving Throws, cada atributo ganha botao de rolar.

Ao clicar:
- Rola 1d20 + save value (mod + proficiency se proficiente)
- Vantagem/desvantagem se ativo
- Resultado no toast + Roll Log
- Log entry: tipo "save", descricao "CON Save", notacao "1d20+3"

### 3. Rolar Ataque + Dano (2 cliques)

Na lista de ataques, cada ataque ganha botao "Atacar".

**Clique 1 — Attack Roll:**
- Rola 1d20 + attackBonus
- Se vantagem/desvantagem ativo: 2d20
- Mostra resultado com indicacao visual: Natural 20 = "CRITICO!" (gold/animado), Natural 1 = "Falha Critica" (red)
- Log entry: tipo "attack", descricao "Espada Longa", notacao "1d20+5"

**Clique 2 — Damage Roll** (botao aparece apos hit):
- Rola o dado de dano (campo damage do ataque, ex: "1d8+3")
- Se critico: dobra os dados (2d8+3 em vez de 1d8+3)
- Log entry: tipo "damage", descricao "Espada Longa (dano)", notacao "1d8+3" ou "2d8+3 (crit)"

### 4. Vantagem/Desvantagem (toggle global)

Toggle na SessionPanel (ou no topo da ficha) com 3 estados:
- Normal (padrao)
- Vantagem (rola 2d20, pega maior)
- Desvantagem (rola 2d20, pega menor)

Quando ativo, TODAS as rolagens de d20 (skills, saves, ataques) usam o mecanismo de 2d20. O toggle mostra claramente o estado atual e pode ser mudado a qualquer momento.

### 5. Rolagem Personalizada

Campo de input no SessionPanel onde o jogador pode digitar qualquer notacao (ex: "2d6+3", "1d12", "4d6") e rolar.

## Arquivos a Criar

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `lib/rollWithAdvantage.ts` | Pure function | Rola com vantagem/desvantagem/normal |
| `components/character/RollableSkillRow.tsx` | Client Component | SkillRow clicavel que rola |
| `components/character/RollableSaveRow.tsx` | Client Component | Save row clicavel |
| `components/character/RollableAttackRow.tsx` | Client Component | Ataque com roll de hit + dano |
| `components/character/AdvantageToggle.tsx` | Client Component | Toggle normal/vantagem/desvantagem |
| `components/character/CustomRoller.tsx` | Client Component | Input de notacao livre |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `store/sessionStore.ts` | Adicionar advantageMode state + setAdvantageMode action |
| `components/character/SessionPanel.tsx` | Adicionar AdvantageToggle + CustomRoller |
| `app/character/[id]/page.tsx` | Substituir SkillRow/AttackRow por versoes Rollable quando sessao ativa |

## Tipos Novos

```typescript
// No sessionStore
type AdvantageMode = "normal" | "advantage" | "disadvantage";
```

## Logica de Rolagem (lib/rollWithAdvantage.ts)

```typescript
interface RollResult {
  rolls: number[];        // todos os d20 rolados
  chosen: number;         // o d20 escolhido (maior/menor/unico)
  modifier: number;       // bonus total
  total: number;          // chosen + modifier
  isCritical: boolean;    // natural 20
  isFumble: boolean;      // natural 1
  advantage: AdvantageMode;
}

function rollD20WithAdvantage(modifier: number, mode: AdvantageMode): RollResult
```

## UX

- Rolagens so funcionam quando Modo Sessao esta ativo
- Quando sessao inativa, pericias/saves/ataques funcionam como hoje (display only)
- Toast de resultado aparece por 3 segundos no canto inferior
- Critico (nat 20): toast dourado com animacao de brilho
- Falha critica (nat 1): toast vermelho
- Roll Log mostra detalhes completos (dados individuais, vantagem aplicada)

## Verificacao

- Ativar sessao → clicar em Percepcao → rola 1d20+mod → resultado no log
- Ativar vantagem → clicar em Percepcao → rola 2d20 → pega maior → log mostra ambos
- Clicar "Atacar" em ataque → rola 1d20+bonus → se nat20: mostra CRITICO
- Clicar "Dano" apos critico → dobra dados de dano
- Desativar sessao → clicks em pericias nao rolam (comportamento normal)
- Rolagem personalizada: digitar "3d6+2" → resultado correto
