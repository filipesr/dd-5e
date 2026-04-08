# Spec: Gestao de Mapas

**Status:** ✅ Implementado
**Prioridade:** Media (Fase 2)
**Dependencias:** Modulo 3 completo (✅)

---

## Objetivo

Upload de imagem de mapa (em memoria como base64), editor de pinos clicaveis, toggle de visao do jogador (oculta pinos secretos), e export como PNG via html2canvas.

## Dependencias Novas

```bash
npm install react-dropzone html2canvas
```

## Arquivos a Criar

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `components/master/MapViewer.tsx` | Client Component | Exibe mapa com pinos sobrepostos |
| `components/master/MapUploader.tsx` | Client Component | Dropzone para upload de imagem |
| `components/master/PinEditor.tsx` | Client Component | Modal para criar/editar pino |
| `components/master/MapExporter.tsx` | Client Component | Botao export PNG via html2canvas |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `types/dnd5e.ts` | Adicionar MapData, MapPin interfaces |
| `store/campaignStore.ts` | Adicionar maps[] na Campaign + CRUD de mapas e pinos |
| `app/master/campaign/[id]/page.tsx` | Adicionar aba "Mapas" |

## Tipos Novos (types/dnd5e.ts)

```typescript
export const PIN_TYPES = [
  "city", "dungeon", "encounter", "treasure", "npc", "poi",
] as const;
export type PinType = (typeof PIN_TYPES)[number];

export interface MapPin {
  id: string;
  x: number;           // porcentagem (0-100) da posicao horizontal
  y: number;           // porcentagem (0-100) da posicao vertical
  type: PinType;
  name: string;
  description: string;
  revealed: boolean;   // visivel na "visao do jogador"
}

export interface MapData {
  id: string;
  name: string;
  imageBase64: string;  // imagem convertida para base64 (sem cloud)
  pins: MapPin[];
  createdAt: string;
}
```

Adicionar `maps: MapData[]` na interface Campaign.

## Persistencia de Imagem

- Upload via react-dropzone (aceita PNG, JPG, WebP)
- Converter para base64 via FileReader.readAsDataURL()
- Salvar no Zustand/localStorage como string base64
- **Limite:** ~5MB por imagem (localStorage tem ~10MB total)
- Aviso visual se imagem for muito grande (> 2MB)
- Sem persistencia cloud — fica pro fase Supabase

## UI

### MapUploader (react-dropzone)
- Dropzone com borda pontilhada medieval (gold)
- Aceita: image/png, image/jpeg, image/webp
- Ao dropar: converte para base64, chama store.addMap()
- Preview da imagem antes de confirmar
- Input de nome do mapa
- Aviso se > 2MB: "Imagem grande pode impactar performance"

### MapViewer
- Container relativo com imagem como background (100% width)
- Pinos sobrepostos como position absolute (% based)
- Pinos: w-9 h-9, icones brancos 18px, fundo 90% opaco por cor de tipo, borda clara, glow 12px colorido
- Clique no mapa → abre PinEditor no ponto clicado
- Clique em pino existente → abre PinEditor para edicao
- Toggle "Visao do Jogador" → oculta pinos com revealed=false
- Lista de pins abaixo do mapa: nome, tipo (Badge), indicador de visibilidade, clicavel para editar
- Zoom basico: botoes +/- que alteram scale via CSS transform

### PinEditor (Modal)
- Campos: nome, tipo (Select dos 6 tipos), descricao (Textarea)
- Toggle "Revelado" (visivel para jogadores)
- Botao salvar / excluir
- Icones por tipo de pino:
  - city → Building2
  - dungeon → Castle
  - encounter → Swords
  - treasure → Gem
  - npc → User
  - poi → MapPin (lucide)

### MapExporter
- Botao "Exportar como PNG"
- Usa html2canvas no container do MapViewer
- Download automatico: `<nome-do-mapa>.png`

### Aba na Campaign Page
- Nova aba "Mapas" (icone: Map do lucide-react)
- Lista de mapas da campanha (cards com thumbnail)
- Clique em mapa → abre MapViewer fullscreen-ish
- Botao "Novo Mapa" → abre MapUploader

## Verificacao

- Upload PNG → converte para base64 → exibe corretamente
- Clicar no mapa → pino aparece na posicao correta
- Criar pino com nome/tipo/descricao → salva no store
- Toggle "Visao do Jogador" → pinos ocultos somem
- Export PNG → download com pinos visiveis incluidos
- Recarregar pagina → mapa e pinos persistidos
