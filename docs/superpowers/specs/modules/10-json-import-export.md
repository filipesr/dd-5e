# Spec: Import/Export de Fichas em JSON

**Status:** ✅ Implementado
**Prioridade:** Media (Fase 2)
**Dependencias:** Modulo 1 completo (✅)

---

## Objetivo

Exportar e importar fichas de personagem como JSON, permitindo backup, compartilhamento entre usuarios, e compatibilidade basica com formatos D&D Beyond.

## Arquivos a Criar

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `lib/jsonImportExport.ts` | Pure functions | Serialize, deserialize, validate Character JSON |
| `components/character/JsonExportButton.tsx` | Client Component | Botao download JSON |
| `components/character/JsonImportButton.tsx` | Client Component | Botao upload JSON com validacao |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `app/character/page.tsx` | Adicionar botao "Importar Personagem" na lista |
| `app/character/[id]/page.tsx` | Adicionar botao "Exportar JSON" no header |

## Formato JSON

O formato exportado eh o proprio tipo `Character` do projeto, com um wrapper de metadados:

```typescript
interface CharacterExport {
  version: 1;
  exportedAt: string;
  source: "dd5e-toolkit";
  character: Character;
}
```

## Funcoes (lib/jsonImportExport.ts)

```typescript
// Exportar
export function exportCharacterToJSON(character: Character): Blob

// Importar com validacao
export function importCharacterFromJSON(file: File): Promise<Character>

// Validar estrutura do JSON
export function validateCharacterJSON(data: unknown): data is CharacterExport
```

### Validacao na Importacao

- Verificar que `version` === 1
- Verificar que `character` tem todos os campos obrigatorios
- Verificar que `race` esta em RACES
- Verificar que `class` esta em CLASSES
- Verificar que `alignment` esta em ALIGNMENTS
- Verificar que `level` esta entre 1-20
- Verificar que `attributes` tem todas as 6 keys
- Gerar novo `id` (nao usar o id do arquivo importado — evita colisoes)
- Atualizar `createdAt` e `updatedAt` para agora
- Se campo opcional estiver faltando, usar default

### Compatibilidade D&D Beyond (basica)

- Se o JSON importado nao tiver o wrapper `version/source`, tentar parsear como Character direto
- Mapear campos comuns (name, race, class, level, attributes)
- Campos desconhecidos sao ignorados

## UI

### JsonExportButton
- Similar ao PdfExportButton (mesmo pattern)
- Botao "Exportar JSON" com icone Download
- Gera blob → download como `<nome>_ficha.json`

### JsonImportButton
- Botao "Importar Personagem" com icone Upload
- Input file hidden (accept=".json")
- Ao selecionar arquivo: le, valida, cria personagem no store
- Se validacao falhar: mostra erro em toast/alert
- Se sucesso: navega para a ficha do personagem importado

### Integracao

**Na lista de personagens (`/character`):**
- Botao "Importar" ao lado de "Novo Personagem"

**Na ficha (`/character/[id]`):**
- Botao "Exportar JSON" no header, ao lado de "Exportar PDF"

## Verificacao

- Exportar personagem → arquivo JSON valido com todos os campos
- Importar o mesmo arquivo → cria novo personagem com novo id
- Importar JSON invalido → mensagem de erro clara
- Importar JSON sem wrapper (Character direto) → funciona
- Importar JSON com campos faltando → usa defaults
