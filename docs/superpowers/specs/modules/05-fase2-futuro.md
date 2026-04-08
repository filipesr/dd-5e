# Spec: Fase 2 — Funcionalidades Futuras

**Status:** Nao iniciado

---

## Prioridade Alta

### Exportar Ficha como PDF
- Lib: `@react-pdf/renderer`
- Layout fiel a ficha oficial WOTC: duas colunas, caixas de atributo, linha HP/CA/Init, tabela de pericias
- 3 paginas: combate/atributos, magias, historico
- Botao "Exportar Ficha PDF" na pagina do personagem

### Modo Sessao
- Toggle "Modo Sessao" na ficha que habilita controles rapidos:
  - Barra de HP com botoes +/- e campo de dano/cura rapida
  - Roll de iniciativa com animacao de dado
  - Contadores de recursos por classe (Furia, Ki, Feiticos de Pacto, Inspiracao Bardica)
  - Historico de rolagens na sessao (log)
- Persistencia local via localStorage

## Prioridade Media

### Gestao de Mapas
- Upload de imagem (PNG/JPG/WebP) com react-dropzone
- Editor de pinos: clique no mapa abre modal (nome, tipo, descricao, imagem, status revelado/oculto)
- Tipos de pin: Cidade, Masmorra, Encontro, Tesouro, NPC, Ponto de Interesse
- Toggle "Visao do Jogador" (oculta pinos ocultos)
- Export mapa com pinos como PNG via html2canvas

### Gestao de Tesouros
- Criador de saque: moedas por CR (tabela DMG), itens magicos aleatorios por raridade
- Inventario de tesouro da campanha: o que foi dado, quando e para quem
- Gerador de itens magicos aleatorios com seed

### Autenticacao Supabase
- Supabase Auth (Google/Discord OAuth)
- Sync de ficha em tempo real (Supabase Realtime) para sessoes online
- Migrar stores de localStorage para Supabase

### Importar/Exportar fichas JSON
- Formato compativel com D&D Beyond
- Import/export de campanhas completas

## Prioridade Baixa

### Rolador de Dados 3D
- Three.js (d4, d6, d8, d10, d12, d20, d100)
- Animacao fisica de rolagem

### PWA Offline
- Service worker, cache de fichas
- Funcionar sem internet

### Gerador de NPCs com IA
- Via Anthropic API
- Gerar nome, raca, profissao, personalidade, segredos

### Timeline de Sessoes
- Timeline visual de eventos com data ficticia e data real
- Tags: Combate, Social, Exploracao, Revelacao de Plot

### Upload de Avatar NPC
- Upload de imagem ou gerador placeholder com iniciais (placeholder ja existe)

### VTT Basico
- Virtual Tabletop com fog of war no mapa
- Tokens movimentaveis

### Outros
- Gerador de masmorras procedural (BSP tree ou Wave Function Collapse)
- Chat de sessao integrado (texto + rolagem visivel)
- Suporte a outros sistemas (Pathfinder 2e, Call of Cthulhu, Vampire)
- Marketplace de mapas e aventuras
- App mobile nativo (Expo/React Native)
- Integracao com Open5e API para dados oficiais SRD
- Historico de campanhas com estatisticas

## Referencias Tecnicas

- Open5e API: https://api.open5e.com
- D&D 5e SRD: https://www.dndbeyond.com/srd
- @react-pdf/renderer: https://react-pdf.org
- TipTap: https://tiptap.dev
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- Framer Motion: https://www.framer.com/motion
- Zustand: https://zustand-demo.pmnd.rs
