# Map Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upload map images (base64 in localStorage), place/edit pins on the map, toggle player view (hide secret pins), and export as PNG.

**Architecture:** react-dropzone for upload, relative-positioned div for pin overlay, html2canvas for PNG export. All data in Zustand campaignStore (localStorage).

**Spec:** `docs/superpowers/specs/modules/09-map-management.md`

**Dependencies:** `npm install react-dropzone html2canvas`

---

## Task 1: Types + Store Extension + Install Dependencies

**Files:**
- Modify: `types/dnd5e.ts`, `store/campaignStore.ts`, `package.json`

### Types to add in types/dnd5e.ts

Add after TreasureRecord (or after Campaign):

```typescript
export const PIN_TYPES = [
  "city", "dungeon", "encounter", "treasure", "npc", "poi",
] as const;
export type PinType = (typeof PIN_TYPES)[number];

export interface MapPin {
  id: string;
  x: number;
  y: number;
  type: PinType;
  name: string;
  description: string;
  revealed: boolean;
}

export interface MapData {
  id: string;
  name: string;
  imageBase64: string;
  pins: MapPin[];
  createdAt: string;
}
```

Add `maps: MapData[]` to Campaign interface.

### Store actions to add

```typescript
// Maps
addMap: (campaignId: string, map: Omit<MapData, "id" | "createdAt">) => void;
deleteMap: (campaignId: string, mapId: string) => void;
addPin: (campaignId: string, mapId: string, pin: Omit<MapPin, "id">) => void;
updatePin: (campaignId: string, mapId: string, pinId: string, updates: Partial<MapPin>) => void;
deletePin: (campaignId: string, mapId: string, pinId: string) => void;
```

### Install dependencies

```bash
npm install react-dropzone html2canvas
npm install -D @types/html2canvas
```

### Commit

```
feat: add map types, store actions, and install react-dropzone + html2canvas
```

---

## Task 2: MapUploader + MapViewer Components

**Files:**
- Create: `components/master/MapUploader.tsx`, `components/master/MapViewer.tsx`

### MapUploader

- Uses react-dropzone (accept image/png, image/jpeg, image/webp)
- Converts dropped file to base64 via FileReader.readAsDataURL
- Input field for map name
- Preview of image before confirming
- Warning if file > 2MB
- On confirm: calls store.addMap()

### MapViewer

- Container div with relative positioning
- Map image as background (object-fit contain, 100% width)
- Pins rendered as absolute-positioned icons (% based x/y)
- Click on empty area → callback with x/y percentages (for adding pin)
- Click on pin → callback with pin data (for editing)
- playerView prop: if true, filter out pins with revealed=false
- Pin icons by type using lucide-react (Building2, Castle, Swords, Gem, User, MapPin)

### Commit

```
feat: add MapUploader and MapViewer components
```

---

## Task 3: PinEditor + MapExporter Components

**Files:**
- Create: `components/master/PinEditor.tsx`, `components/master/MapExporter.tsx`

### PinEditor (Modal)

- Fields: name (Input), type (Select from PIN_TYPES), description (Textarea)
- Toggle "Revelado" (checkbox/switch)
- If editing existing pin: pre-fill fields, show delete button
- If creating new pin: receives x/y from MapViewer click
- On save: calls store.addPin or store.updatePin
- On delete: calls store.deletePin

### MapExporter

- Button "Exportar como PNG"
- Uses html2canvas on the MapViewer container ref
- Generates canvas → toBlob → download as `<map-name>.png`

### Commit

```
feat: add PinEditor modal and MapExporter PNG button
```

---

## Task 4: Wire into Campaign Page

**Files:**
- Modify: `app/master/campaign/[id]/page.tsx`

Add "Mapas" tab (icon: Map from lucide-react) to TABS array.

Tab content:
- List of campaign maps as thumbnail cards
- "Novo Mapa" button → shows MapUploader
- Click map card → opens full MapViewer with pin editing
- MapViewer includes: pin click handlers, "Visao do Jogador" toggle, MapExporter button
- PinEditor modal for create/edit pins

### Commit

```
feat: add Mapas tab to campaign page with full map editor
```
