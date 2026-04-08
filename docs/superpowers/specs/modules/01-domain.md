# Spec: Modulo 1 — Ficha de Personagem + Dominio

**Status:** ✅ Implementado (T2, T3, T4, T5, T7, T11, T14)

---

## Rotas

- `GET /character` — Lista de personagens salvos com opcao de criar novo
- `GET /character/[id]` — Ficha completa do personagem (client component)

## Modelo de Dados (types/dnd5e.ts)

```typescript
interface Character {
  id: string;
  name: string;
  race: Race;              // 9 racas SRD
  class: CharacterClass;   // 12 classes SRD
  level: number;           // 1-20
  background: string;
  alignment: Alignment;    // 9 alinhamentos
  xp: number;
  attributes: Record<Attribute, number>;  // STR, DEX, CON, INT, WIS, CHA
  hp: { max: number; current: number; temporary: number };
  ac: number;
  initiative: number;
  speed: number;
  skillProficiencies: Partial<Record<Skill, 'proficient' | 'expertise'>>;
  savingThrowProficiencies: Attribute[];
  attacks: Attack[];
  spellSlots: Record<number, { max: number; used: number }>;
  spells: Record<number, SpellReference[]>;
  spellcastingAbility: Attribute | null;
  conditions: Condition[];
  hitDice: { dieType: number; total: number; used: number };
  deathSaves: { successes: number; failures: number };
  inventory: InventoryItem[];
  coins: Record<CoinType, number>;
  traits: { personality: string; ideals: string; bonds: string; flaws: string };
  notes: { appearance: string; backstory: string; allies: string; freeNotes: string };
  createdAt: string;
  updatedAt: string;
}
```

## Calculos Automaticos (lib/dnd5e.ts)

| Funcao | Formula | Testado |
|--------|---------|---------|
| `getModifier(score)` | `Math.floor((score - 10) / 2)` | ✅ 7 testes |
| `getProficiencyBonus(level)` | `Math.ceil(level / 4) + 1` | ✅ 5 testes |
| `getSkillValue(attr, prof, type)` | `mod + profBonus * multiplier` | ✅ 3 testes |
| `getCarryCapacity(str)` | `str * 7.5` | ✅ 3 testes |
| `getXpForNextLevel(level)` | Tabela oficial DMG | ✅ 4 testes |
| `getXpMultiplier(count)` | Tabela DMG (1/1.5/2/2.5/3/4) | ✅ 6 testes |
| `getEncounterDifficulty(...)` | Thresholds DMG * partySize | ✅ 4 testes |
| `getPointBuyCost(score)` | Tabela PHB (0-9 pts) | ✅ 4 testes |
| `getStandardArray()` | `[15, 14, 13, 12, 10, 8]` | ✅ 1 teste |

## Rolador de Dados (lib/dice.ts)

| Funcao | Descricao | Testado |
|--------|-----------|---------|
| `rollDice(count, sides)` | Rola N dados de M lados | ✅ 3 testes |
| `parseNotation(str)` | Parseia "2d6+3" | ✅ 4 testes |
| `rollNotation(str)` | Rola a partir de notacao | ✅ 1 teste |
| `roll4d6DropLowest()` | 4d6 descarta menor | ✅ 3 testes |

## Dados Estaticos (data/)

| Arquivo | Conteudo | Tipo |
|---------|----------|------|
| `races.json` | 9 racas SRD com traits, bonus, velocidade, idiomas | RaceData[] |
| `classes.json` | 12 classes com hit die, saves, proficiencias, features, spell slots | ClassData[] |
| `skills.json` | 18 pericias com atributo base e descricao PT-BR | SkillData[] |
| `conditions.json` | 12 condicoes com descricao SRD PT-BR | ConditionData[] |
| `rules.json` | Regras rapidas (combate, descanso, viagem, CD) | RuleData[] |

## Geracao de Atributos

1. **4d6 drop lowest** — rola 4d6, descarta o menor, soma os 3 restantes (6 vezes)
2. **Point buy (27 pts)** — atributos iniciam em 8, custo variavel (8-13 = 1pt, 14 = 2pts, 15 = 2pts)
3. **Standard array** — 15, 14, 13, 12, 10, 8

## Layout da Ficha (10 secoes colapsaveis)

1. **Identidade** — nome, raca, classe, nivel, background, alinhamento, XP
2. **Atributos** — 6 stat boxes (3x2 mobile, 6x1 desktop) com valor e modificador
3. **Combate** — HP tracker, AC, Iniciativa, Speed, Death Saves, Hit Dice
4. **Saving Throws** — 6 checkboxes de proficiencia com valor calculado
5. **Pericias** — 18 skills: checkbox proficiencia/expertise, valor auto-calculado
6. **Ataques** — lista editavel (nome, bonus, dano, tipo)
7. **Magias** — spell slots com contadores visuais por nivel
8. **Condicoes** — grid de badges toggle (12 condicoes)
9. **Inventario** — tabela editavel + moedas + peso total/capacidade
10. **Tracos & Notas** — textareas para personalidade, ideais, vinculos, fraquezas, notas livres

## Componentes da Ficha (components/character/)

| Componente | Descricao |
|------------|-----------|
| StatBox | Valor do atributo + modificador, input editavel |
| SkillRow | Pericia com proficiencia toggle (none/prof/expertise), valor auto |
| HpTracker | Barra HP + dano/cura rapido + AC + Temp HP |
| SpellSlotTracker | Circulos preencheis por nivel de magia |
| ConditionBadge | Badge toggle para cada condicao |
| DeathSaves | 3 sucessos + 3 falhas (circulos) |
| AttackRow | Linha editavel para ataques |
| InventoryRow | Linha editavel para itens |
| AttributeGeneration | Modal com 3 metodos de geracao |

## Store (store/characterStore.ts)

- Zustand + immer + persist (localStorage, key: `dd5e-characters`)
- Acoes: `createCharacter`, `updateCharacter`, `deleteCharacter`, `getCharacter`
- Hydration guard: `isHydrated` flag com `onRehydrateStorage`
- Default character template incluso
