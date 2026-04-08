# Plano: Etapa 5 — Polimento e Deploy (T17-T18)

**Status:** ⏳ Pendente
**Spec:** `docs/superpowers/specs/modules/04-polish-deploy.md`

---

### Task 17: Visual Polish and Responsiveness

**Files:**
- Modify: various component files, `app/globals.css`

- [ ] **Step 1: Add page transitions with framer-motion**

Create `components/layout/PageTransition.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

Wrap each page's content with `<PageTransition>` in the page files, or add it to the root layout.

- [ ] **Step 2: Add hover effects to cards**

Update `app/globals.css` to add hover scale and glow:

```css
@layer components {
  /* ...existing... */

  .card-medieval {
    @apply bg-parchment border border-gold rounded-lg shadow-tome text-ink transition-all duration-200;
  }

  .card-medieval:hover {
    transform: translateY(-1px);
  }

  .card-medieval-dark {
    @apply bg-ink-light border border-gold/30 rounded-lg shadow-tome text-parchment-light transition-all duration-200;
  }

  .card-medieval-dark:hover {
    transform: translateY(-1px);
  }
}
```

- [ ] **Step 3: Responsive audit fixes**

Review components for mobile (375px):
- Character sheet: ensure grid switches to single column
- Compendium: cards go to single column on mobile
- Master campaign tabs: horizontally scrollable on small screens
- Encounter tracker: stack controls vertically on mobile

Add responsive classes where needed (most are already handled by the `grid-cols-1 md:grid-cols-X` pattern).

For master tabs, add `overflow-x-auto` to the tabs container in `app/master/campaign/[id]/page.tsx`.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add page transitions, hover effects, and responsive fixes"
```

---

### Task 18: Build Verification and Deploy

**Files:**
- Modify: potentially any file that causes build errors

- [ ] **Step 1: Run type check**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 2: Run tests**

```bash
npm test
```

All tests should pass.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Fix any build errors. Common issues:
- **Hydration mismatch:** Ensure all Zustand store consumers check `isHydrated` before rendering store data
- **Server/client boundary:** Verify `'use client'` is present on all components using hooks
- **JSON imports:** May need `resolveJsonModule: true` in tsconfig (Next.js includes this by default)

- [ ] **Step 4: Test the built app locally**

```bash
npm run start
```

Verify all 3 modules work: create character, browse compendium, set PIN and create campaign.

- [ ] **Step 5: Deploy to Vercel**

```bash
npx vercel --prod
```

Or push to GitHub repo connected to Vercel for auto-deploy.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "fix: resolve build issues and verify production build

All type checks pass, tests pass, and build completes successfully."
```
