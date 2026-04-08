# Spec: Modo Sessao (Session Mode)

**Status:** ✅ Implementado
**Prioridade:** Alta (Fase 2)
**Dependencias:** Modulo 1 completo (✅)

---

## Objetivo

Toggle "Modo Sessao" na ficha de personagem que habilita controles rapidos para uso em sessao de jogo: contadores de recursos por classe, roll de iniciativa com animacao, e log de rolagens efemero.

## Arquivos a Criar

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `store/sessionStore.ts` | Zustand Store (sem persist) | Estado efemero da sessao |
| `lib/classResources.ts` | Pure function | Retorna recursos por classe/nivel |
| `components/character/SessionPanel.tsx` | Client Component | Panel principal do modo sessao |
| `components/character/ResourceCounter.tsx` | Client Component | Contador visual de recurso |
| `components/character/InitiativeRoller.tsx` | Client Component | Botao de iniciativa com animacao |
| `components/character/RollLog.tsx` | Client Component | Lista de rolagens da sessao |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `app/character/[id]/page.tsx` | Adicionar toggle Modo Sessao + renderizar SessionPanel |

## Session Store (store/sessionStore.ts)

```typescript
interface ResourceCounter {
  key: string;          // ex: "rage", "bardic-inspiration", "ki"
  name: string;         // ex: "Furia", "Inspiracao Bardica", "Ki"
  max: number;          // usos maximos
  used: number;         // usos gastos
  recharge: "short" | "long";  // quando recupera
}

interface RollLogEntry {
  id: string;
  type: "initiative" | "attack" | "damage" | "ability" | "save" | "custom";
  notation: string;     // ex: "1d20+3"
  rolls: number[];      // resultados individuais
  total: number;        // resultado final
  description: string;  // ex: "Iniciativa", "Ataque com Espada Longa"
  timestamp: number;
}

interface SessionState {
  isActive: boolean;
  characterId: string | null;
  resourceCounters: ResourceCounter[];
  rollLog: RollLogEntry[];
  initiativeRoll: number | null;

  // Acoes
  startSession: (characterId: string, counters: ResourceCounter[]) => void;
  endSession: () => void;
  useResource: (key: string) => void;
  restoreResource: (key: string) => void;
  shortRest: () => void;    // recupera recursos com recharge "short"
  longRest: () => void;     // recupera TODOS os recursos
  rollInitiative: (dexMod: number) => void;
  addRoll: (entry: Omit<RollLogEntry, "id" | "timestamp">) => void;
  clearLog: () => void;
}
```

**Sem persist** — dados descartados ao fechar/recarregar pagina.

## Recursos por Classe (lib/classResources.ts)

```typescript
function getClassResources(
  characterClass: CharacterClass,
  level: number,
  attributes: Record<Attribute, number>
): ResourceCounter[]
```

| Classe | Recurso | Max por Nivel | Recharge |
|--------|---------|---------------|----------|
| Barbarian | Furia | 2(1), 3(3), 4(6), 5(12), 6(17), ∞(20) | long |
| Bard | Inspiracao Bardica | CHA mod (min 1) | long |
| Cleric | Canalizar Divindade | 1(2), 2(6), 3(18) | short |
| Fighter | Segundo Folego | 1 | short |
| Fighter | Action Surge | 1(2), 2(17) | short |
| Monk | Ki Points | = nivel | short |
| Paladin | Cura pelas Maos | 5 * nivel (pool HP) | long |
| Paladin | Sentido Divino | 1 + CHA mod | long |
| Sorcerer | Sorcery Points | = nivel | long |
| Warlock | Spell Slots de Pacto | 1(1), 2(2), 3(11), 4(17) | short |

Classes sem recursos especiais (Druid, Ranger, Rogue, Wizard): retornam array vazio. Esses usam spell slots normais (ja rastreados no SpellSlotTracker).

## UI do Session Panel

### Layout

```
+--------------------------------------------------+
| [Toggle: Modo Sessao ON/OFF]                      |
+--------------------------------------------------+
| Quando ativo:                                     |
|                                                   |
| +--- Iniciativa ---+  +--- Recursos ----------+  |
| | [d20] Roll Init  |  | Furia: ●●○○  [usar]  |  |
| | Resultado: 18    |  | Ki:    ●●●●● [usar]  |  |
| +-----------------+  | [Desc. Curto] [Desc. Longo]|
|                      +---------------------------+ |
|                                                   |
| +--- Log de Rolagens ----------------------------+|
| | 14:32 Iniciativa: 1d20+3 = 18                  ||
| | 14:30 Ataque: 1d20+5 = 22                      ||
| | 14:28 Dano: 2d6+3 = 11                         ||
| +------------------------------------------------+|
+--------------------------------------------------+
```

### Componentes

**InitiativeRoller:**
- Botao com icone de d20
- Ao clicar: rola 1d20 + DEX modifier
- Animacao: dado girando (framer-motion rotate + scale) por 500ms
- Exibe resultado com formatacao: "1d20 + {mod} = {total}"
- Adiciona ao rollLog automaticamente

**ResourceCounter:**
- Nome do recurso
- Circulos preenchidos (usado) / vazios (disponivel)
- Botao "Usar" (preenche proximo circulo)
- Clique no circulo para toggle individual
- Cinza quando todos gastos

**RollLog:**
- Lista scrollavel (max-h-48, overflow-y-auto)
- Mais recente no topo
- Cada entrada: hora, descricao, notacao, resultado
- Botao "Limpar Log"

**Descanso:**
- Botao "Descanso Curto": recupera recursos com recharge "short"
- Botao "Descanso Longo": recupera TODOS os recursos + reset spell slots

## Integracao na Ficha

- Toggle button no topo da pagina (proximo ao nome do personagem)
- Quando ativo: SessionPanel aparece entre a secao de Identidade e Atributos
- SessionPanel eh colapsavel (ScrollSection com titulo "Modo Sessao")
- Ao ativar: chama `startSession(charId, getClassResources(class, level, attrs))`
- Ao desativar: chama `endSession()` (limpa tudo)

## Animacoes (framer-motion)

- **Toggle sessao:** slide-down do panel (height 0 → auto, opacity 0 → 1)
- **Roll de iniciativa:** dado d20 rotaciona (rotate 360deg * 3, scale 1 → 1.2 → 1, duracao 500ms)
- **Usar recurso:** circulo pulsa (scale 1 → 0.8 → 1, duracao 200ms)
- **Nova entrada no log:** fade-in + slide-down (opacity 0 → 1, y -10 → 0)

## Verificacao

- Ativar modo sessao em Barbarian nivel 5 → deve mostrar "Furia: 3 usos"
- Ativar em Bard com CHA 16 (+3) → "Inspiracao Bardica: 3 usos"
- Ativar em Fighter nivel 2 → "Segundo Folego: 1 uso" + "Action Surge: 1 uso"
- Ativar em Wizard → sem contadores especiais (panel mostra so iniciativa + log)
- Rolar iniciativa → animacao + resultado no log
- Usar recurso → circulo preenche + log registra
- Descanso curto → recursos "short" recuperam, "long" nao
- Descanso longo → todos recuperam
- Desativar sessao → panel desaparece, dados limpos
- Recarregar pagina com sessao ativa → sessao reseta (store efemero)
