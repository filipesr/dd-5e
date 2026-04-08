# Spec: Gestao de Tesouros

**Status:** ✅ Implementado
**Prioridade:** Media (Fase 2)
**Dependencias:** Modulo 3 completo (✅)

---

## Objetivo

Gerador de loot por Challenge Rating (tabelas DMG), inventario de tesouros da campanha, e gerador de itens magicos aleatorios.

## Arquivos a Criar

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `lib/lootTables.ts` | Pure functions | Tabelas DMG de moedas por CR + gerador de itens magicos |
| `components/master/TreasureGenerator.tsx` | Client Component | UI para gerar loot por CR |
| `components/master/TreasureInventory.tsx` | Client Component | Lista de tesouros da campanha |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `types/dnd5e.ts` | Adicionar TreasureRecord, LootResult interfaces |
| `store/campaignStore.ts` | Adicionar treasures[] na Campaign + CRUD |
| `app/master/campaign/[id]/page.tsx` | Adicionar aba "Tesouros" |

## Tipos Novos (types/dnd5e.ts)

```typescript
export interface TreasureRecord {
  id: string;
  date: string;
  description: string;
  givenTo: string;         // nome do PJ ou "grupo"
  coins: Record<CoinType, number>;
  items: { name: string; rarity: string; description: string }[];
  notes: string;
}
```

Adicionar `treasures: TreasureRecord[]` na interface Campaign.

## Tabelas de Loot (lib/lootTables.ts)

### Moedas por CR (baseado DMG p.137)

| CR | CP | SP | EP | GP | PP |
|----|----|----|----|----|-----|
| 0-4 | 6d6 x100 | 3d6 x100 | 0 | 2d6 x10 | 0 |
| 5-10 | 2d6 x100 | 2d6 x1000 | 0 | 6d6 x100 | 3d6 x10 |
| 11-16 | 0 | 0 | 0 | 4d6 x1000 | 5d6 x100 |
| 17+ | 0 | 0 | 0 | 12d6 x1000 | 8d6 x1000 |

### Itens Magicos Aleatorios por Raridade

Pool de itens por raridade (Common, Uncommon, Rare, Very Rare, Legendary) com nome e descricao curta. Seed-based usando o id do personagem/campanha para reprodutibilidade.

Funcoes exportadas:
- `generateLootByCR(cr: number): LootResult` — rola moedas + seleciona itens
- `getRandomMagicItem(rarity: string): { name, rarity, description }`
- `MAGIC_ITEMS: Record<string, { name, description }[]>` — pool de itens por raridade

## UI

### TreasureGenerator
- Select de CR range (0-4, 5-10, 11-16, 17+)
- Botao "Gerar Tesouro" → mostra resultado (moedas + itens)
- Checkbox para incluir itens magicos (selecionar raridade)
- Botao "Adicionar ao Inventario" → salva no store

### TreasureInventory
- Lista de TreasureRecord da campanha
- Cada entrada: data, descricao, dado para quem, moedas, itens
- Botao excluir
- Totais acumulados de moedas

### Aba na Campaign Page
- Nova aba "Tesouros" (icone: Gem do lucide-react)
- Contém TreasureGenerator no topo + TreasureInventory abaixo

## Verificacao

- Gerar loot CR 0-4 → moedas dentro da faixa esperada
- Gerar loot com itens magicos → item aleatorio da raridade correta
- Adicionar ao inventario → persiste no localStorage
- Excluir registro → remove do inventario
