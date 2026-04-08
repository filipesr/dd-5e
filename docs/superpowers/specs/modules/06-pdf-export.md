# Spec: PDF Export da Ficha de Personagem

**Status:** ✅ Implementado
**Prioridade:** Alta (Fase 2)
**Dependencias:** Modulo 1 completo (✅)

---

## Objetivo

Exportar a ficha de personagem como PDF com layout fiel ao estilo oficial WOTC (3 paginas), usando `@react-pdf/renderer`.

## Dependencia de Pacote

```bash
npm install @react-pdf/renderer
```

## Arquivos a Criar

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `lib/pdfExport.tsx` | React PDF Document | Componente PDF com 3 paginas |
| `components/character/PdfExportButton.tsx` | Client Component | Botao que gera e faz download do PDF |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `app/character/[id]/page.tsx` | Adicionar PdfExportButton no topo da ficha |

## Layout do PDF (3 Paginas)

### Pagina 1: Combate e Atributos

```
+--------------------------------------------------+
|  [Nome]          [Classe/Nivel]  [Raca]           |
|  [Background]    [Alinhamento]   [XP]             |
+--------------------------------------------------+
|  +------+                                         |
|  | FOR  |  Saving Throws    | HP ___/___  Temp ___|
|  | +2   |  ○ FOR +2         | AC ___  Init ___    |
|  | [14]  |  ● DES +5        | Speed ___           |
|  +------+  ○ CON +1         |                     |
|  +------+  ○ INT +0         | Hit Dice: _d_ ___   |
|  | DES  |  ○ SAB +1         |                     |
|  | +3   |  ○ CAR +3         | Death Saves         |
|  | [16]  |                   | Sucesso: ○ ○ ○      |
|  +------+  Pericias          | Falha:   ○ ○ ○      |
|  +------+  ● Acrobacia +5   +---------------------+
|  | CON  |  ○ Adestrar +1    | Ataques             |
|  | +1   |  ○ Arcanismo +0   | Nome  | +Atq | Dano |
|  | [12]  |  ● Atletismo +4  | ------|------|------|
|  +------+  ...18 skills...   |                     |
|  +------+                    | Condicoes Ativas    |
|  | INT  |                    | [badges]            |
|  +------+                    |                     |
|  +------+                    |                     |
|  | SAB  |                    |                     |
|  +------+                    |                     |
|  +------+                    |                     |
|  | CAR  |                    |                     |
|  +------+                    |                     |
+--------------------------------------------------+
```

- Coluna esquerda: 6 caixas de atributo + saving throws + 18 pericias
- Coluna direita: combate (HP, AC, Init, Speed), death saves, hit dice, ataques, condicoes

### Pagina 2: Magias

```
+--------------------------------------------------+
| Classe de Conjuracao: [Classe]                    |
| Habilidade: [Atributo]   CD: [8+prof+mod]        |
| Bonus de Ataque: [+prof+mod]                      |
+--------------------------------------------------+
| Cantrips          | Nivel 1 (○○○○)               |
| - [magia]         | - [magia]                     |
| - [magia]         | - [magia]                     |
|                   |                               |
| Nivel 2 (○○○)    | Nivel 3 (○○○)                |
| - [magia]         | - [magia]                     |
|                   |                               |
| Nivel 4 (○○)     | Nivel 5 (○○)                 |
| ...               | ...                           |
| Nivel 8 (○)      | Nivel 9 (○)                  |
+--------------------------------------------------+
```

- Spellcasting ability, spell save DC, spell attack bonus no topo
- Slots por nivel com circulos (preenchidos = usados)
- Lista de magias por nivel

### Pagina 3: Historico e Notas

```
+--------------------------------------------------+
| Tracos de Personalidade                           |
| [texto]                                           |
+--------------------------------------------------+
| Ideais              | Vinculos                    |
| [texto]             | [texto]                     |
+--------------------------------------------------+
| Fraquezas                                         |
| [texto]                                           |
+--------------------------------------------------+
| Aparencia                                         |
| [texto]                                           |
+--------------------------------------------------+
| Historia Pessoal                                  |
| [texto]                                           |
+--------------------------------------------------+
| Aliados & Organizacoes                            |
| [texto]                                           |
+--------------------------------------------------+
| Inventario                                        |
| Item        | Qtd | Peso | PO                     |
| ------------|-----|------|---                      |
| Moedas: CP__ SP__ EP__ GP__ PP__                  |
| Peso Total: ___/___kg                             |
+--------------------------------------------------+
| Notas Livres                                      |
| [texto]                                           |
+--------------------------------------------------+
```

## Estilo do PDF

- Fundo: parchment claro (#f4e4c1)
- Bordas: gold (#8b6914), 1px
- Titulos: serif bold (substituto de Cinzel — @react-pdf nao suporta Google Fonts diretamente, usar registerFont ou serif generico)
- Corpo: serif regular
- Tamanho: A4 (595 x 842 pts)
- Margens: 20pt

## Calculos Reutilizados (lib/dnd5e.ts)

- `getModifier(score)` — para cada atributo
- `getProficiencyBonus(level)` — para bonus de proficiencia
- `getSkillValue(attrScore, profBonus, proficiency)` — para cada pericia
- `getCarryCapacity(str)` — para capacidade de carga no inventario
- Spell Save DC: `8 + profBonus + spellcastingAbilityMod`
- Spell Attack Bonus: `profBonus + spellcastingAbilityMod`

## Comportamento do Botao

1. Usuario clica "Exportar PDF" na pagina do personagem
2. `@react-pdf/renderer` gera o documento client-side usando `pdf().toBlob()`
3. Cria URL temporaria via `URL.createObjectURL(blob)`
4. Dispara download automatico: `<nome-do-personagem>-ficha.pdf`
5. Revoga URL temporaria

## Verificacao

- Gerar PDF de personagem com todos os campos preenchidos
- Verificar 3 paginas renderizadas corretamente
- Verificar calculos (modificadores, pericias, spell DC)
- Testar com personagem sem magias (pagina 2 mostra "Sem magias")
- Testar com inventario vazio
