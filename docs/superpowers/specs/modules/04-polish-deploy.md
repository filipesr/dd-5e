# Spec: Polimento Visual e Deploy

**Status:** ⏳ Pendente (T17, T18)

---

## T17 — Polish Visual e Responsividade

### Animacoes (framer-motion)

- **Page transitions:** fade-in + slide-up sutil (opacity 0→1, y 8→0, 200ms)
- **Cards:** hover translateY(-1px) + shadow-tome-hover
- **Accordion (ScrollSection):** height auto animate com AnimatePresence
- **Dice roll:** CSS keyframes spin + bounce (para futuro Modo Sessao)
- **HP changes:** flash de cor ao receber dano/cura

### Responsividade (Mobile-first)

Breakpoints: 375px (mobile), 768px (tablet), 1280px+ (desktop)

| Area | Mobile | Desktop |
|------|--------|---------|
| Ficha: atributos | grid 3x2 | grid 6x1 |
| Ficha: pericias | 1 coluna | 2 colunas |
| Compendio: cards | 1 coluna | 3 colunas |
| Master: tabs | scroll horizontal | inline |
| Master: encounter planner | stack vertical | inline |
| Navbar | hamburger menu | links inline |

### Audit checklist

- [ ] Ficha de personagem: todas as secoes colapsaveis funcionam em mobile
- [ ] Compendio: cards em coluna unica em 375px
- [ ] Master campaign tabs: overflow-x-auto em telas pequenas
- [ ] Encounter tracker: controles empilhados verticalmente em mobile
- [ ] Modal: max-h-[90vh] com scroll interno funciona em todos os tamanhos
- [ ] Navbar: hamburger abre/fecha corretamente

---

## T18 — Build, Verificacao e Deploy

### Checklist pre-deploy

- [x] `npx tsc --noEmit` — zero erros
- [x] `npm test` — 46 testes passando
- [x] `npm run build` — build completo sem erros
- [ ] Testar app local: `npm run start`
- [ ] Verificar localStorage persistence (criar personagem, recarregar)
- [ ] Verificar Open5e integration (compendio de magias/monstros/itens)
- [ ] Verificar encounter difficulty calculation
- [ ] Lighthouse audit: target > 90 para paginas SSG do compendio
- [ ] Deploy: `npx vercel --prod` ou push para repo conectado

### Hydration issues conhecidos

Zustand persist com localStorage causa mismatch SSR/client. Todas as pages que usam stores ja tem hydration guard (`isHydrated` check), mas verificar:

- `app/character/page.tsx` — mostra "Carregando..." ate hydrate
- `app/character/[id]/page.tsx` — mostra "Carregando..." ate hydrate
- `app/master/page.tsx` — PinGuard mostra "Carregando..." ate hydrate

### Performance

- `master/campaign/[id]`: First Load JS = 270kB (TipTap bundle)
  - **Fix sugerido:** `dynamic(() => import('@/components/master/RichTextEditor'), { ssr: false })`
- Compendio SSG pages: devem ter Lighthouse > 90
- Open5e fetch: cache 24h via `revalidate: 86400`
