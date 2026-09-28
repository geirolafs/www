# AGENTS.md

Single source of truth for agents in this repo — Claude Code, Codex, Cursor and
Zed all read this file. `CLAUDE.md` only points here. Add guidance to this file,
never to that one.

Rules, not documentation. If the codebase already answers it, it does not
belong here.

## Context

Personal portfolio and blog. Next.js 16, React 19, Tailwind v4, Bun.

The redesign shipped and `master` is live. Open work is in
`.private/REDESIGN-POLISH.md`; the reasoning behind past choices is in `.private/REDESIGN.md`.
**Read the decision log before re-proposing something that looks missing** —
several absences are deliberate and the rejected alternative is recorded.

`.private/` is gitignored and local-only — this repo is public. Planning notes,
decision logs and anything not meant for readers go there, never in tracked files.

## Definition of done

```bash
bun run typecheck && bun run lint && bun run build
```

All three exit 0, or the work is not finished. Say so plainly if they don't.

## Where truth lives

Do not restate these — read them.

| Thing                      | Where                                                                |
| -------------------------- | -------------------------------------------------------------------- |
| Design tokens              | the `@theme` block in `src/app/globals.css`                          |
| The grid, both breakpoints | `@utility page-grid` in `src/app/globals.css` — math inline          |
| Font and the weight rule   | `src/app/styles/fonts.ts`                                            |
| Every string on the site   | `src/lib/content/`                                                   |
| OG-image palette           | `src/lib/design-tokens.ts` — deliberately dark, not the site palette |

## Always

- **Tokens, never raw values.** A colour, size, or spacing value goes in the
  `@theme` block in `globals.css` and comes out as a Tailwind utility. If there
  is no token for it, add one. Never inline it in a component.
- **`cn()` from `@/lib/utils`** for classNames. Not bare `clsx` — that loses
  the tailwind-merge conflict resolution, which a test guards.
- **Copy lives in `src/lib/content/`.** No literal user-facing strings in
  components, ever.
- **Pick the right regular weight.** `Same Univers` ships two and they are not
  interchangeable — this is optical, driven by the _length_ of the text:
  - **Book (400)** — paragraphs. Multi-line body copy that should read regular.
  - **Regular (430)** — a single word, one line, or a lone sentence that should
    read regular. At that length 400 reads too light.

  Never leave it to `font-weight: normal`, which silently resolves to Book.
  Set the token explicitly.

  > **The Figma applies these two the other way round.** This rule wins —
  > resolved 2026-07-31. Where the frames show Regular on a paragraph or Book
  > on a short line, the frames are stale. The built page therefore differs
  > from the Figma on every paragraph and every short link, which is expected,
  > not a bug. Tokens: `--weight-book` / `--weight-regular`.

- **The weight axis floors at 400.** There is no light weight. Muted secondary
  text is colour, not weight — never reach for 300.
- **Type styles come from Figma.** Sizes, weights and leading are derived from
  the Figma text styles, not invented. If a value is not in Figma, ask.
- **`import type`** for type-only imports.
- **Log decisions in `.private/REDESIGN.md` as you make them**, with the alternative you
  rejected and why. A decision without a rejected alternative is not a
  decision.

## Never

- **Add a dependency without asking.** The rebuild deliberately shed weight;
  reach for the platform first.
- **Re-introduce `three`, `@react-three/*`, or `@paper-design/shaders-react`.**
  They were removed on purpose.
- **Hardcode a colour, spacing value, or font size** in a component.
- **`<head>` in a component** — use the Metadata API.
- **Add italic.** Emphasis is carried by weight or colour. Do not add a second
  face for it.
- **AI attribution** in commits or PR descriptions. No `Co-Authored-By`, no
  badges, nothing.

## Motion

The site is deliberately close to still, and that is a decision rather than an
unfinished state. Before adding any animation, read the 2026-08-01 entry in
`.private/REDESIGN.md`: seven things were considered and left static, and three were
built and then taken back out.

- **Motion (the library) is installed.** `useLiveReducedMotion()` from
  `@/lib/hooks/use-live-reduced-motion` wraps Motion’s `useReducedMotion()`
  with live preference updates (the installed Motion hook reads only once).
  Use it for anything JS-driven — the scroll reveal in
  `reveal-observer.tsx` uses it. `motion-reduce:` remains correct for
  pure-CSS hovers (`text-link.tsx`) that have no JS motion to skip. Reveals
  are driven imperatively via `animate()` from `"motion"`, called from the
  single `RevealObserver` client component, specifically so the sections it
  animates (`SelectedWork`, `Experience`, `Awards`, `ContactFooter`) stay
  server components — `motion.div` / `whileInView` would force `"use
client"` onto all four.
- **Animate transform and opacity only.** Chrome does not count an element at
  `opacity: 0` as painted, and the introduction's first paragraph is this
  page's LCP element — so motion on the hero moves, it does not fade. The
  stripe's reveal is the one exception, and a narrow one: a `width`
  transition on an absolutely positioned, childless, `pointer-events: none`
  box lays out nothing but itself — `globals.css` says why not `scaleX`.
- **The stripe is scroll-_triggered_, never scroll-_linked_.** The distinction
  is the whole rule. Linking a property to scroll _offset_ has been built and
  removed three times — measured out on 2026-08-01, a `transform` parallax
  removed on 2026-08-04, a `scroll()` width timeline removed on 2026-08-05 —
  and the reason has not changed: the gradient already traverses 36% of itself
  per screen, so anything driven off offset competes with a shift that is
  already happening, and it leaves half-finished states nobody designed. Read
  all three entries before proposing a fourth.

  What the stripe _does_ do is cross a threshold: it is hidden within
  `REVEAL_THRESHOLD_PX` (100px) of the top, grows from nothing to its frame
  width over a fixed duration once past it, and shrinks away again on the
  way back up. Nothing animates on load. Time-based transition, fixed
  duration, two states — see `stripe.tsx` and the 2026-09-03 entry in
  `.private/REDESIGN.md`.

- **The hero ball is the one thing that answers the cursor.** Two fragment
  shaders on raw WebGL canvases, not `three` — the ball, and the shadow it
  throws on the page from the cursor's lamp: static images of both shaders'
  own rest poses are what the server sends (`bun run generate:ball`
  regenerates both after any shader change; `metal-ball-config.ts` is the
  one scene both read), and the shaders only fade in on the first pointer
  move, then animate only while visible. `IDLE.enabled` keeps the lamp wandering
  while visible; disabling it lets the loop stop when settled. Touch also
  controls the lamp. Reduced motion, no WebGL and no JS keep the renders. `metal-ball-canvas.tsx` carries
  the how; the 2026-09-02 and 2026-09-04 entries in `.private/REDESIGN.md` carry the
  why, including the LCP trade it made. Read them before proposing a second
  cursor-reactive element.
- **`data-reveal="load"` vs plain `data-reveal`.** The header bar takes the
  `"load"` variant and reveals as soon as `RevealObserver` mounts, never
  observed and never gated on scroll. The four content sections take plain
  `data-reveal` (or `data-reveal="items"`) and wait for the visitor's first
  scroll before revealing, even if already in view at mount —
  `IntersectionObserver` reports already-intersecting targets on its first
  callback, so observing alone would have revealed them on load too. See
  `reveal-observer.tsx`'s file comment and the 2026-08-04 entry in
  .private/REDESIGN.md.
- **`--ease-out` deliberately shadows Tailwind's built-in.** That is intended,
  so both existing callers retune at once. Do not "fix" the collision.

## Conventions

- Path aliases: `@/components/*`, `@/lib/*`, `@/app/*`, `@/data/*`
- kebab-case files, PascalCase components, camelCase functions
- **No CSS Modules.** Components style with Tailwind utilities; anything shared
  lives in `globals.css` or `typography.css`.
- Server components by default. Reach for `"use client"` only when something
  genuinely needs the browser.
- MDX posts in `src/app/(routes)/notes/posts/`, frontmatter `title`,
  `publishedAt` (YYYY-MM-DD), `summary` — picked up by RSS and sitemap
  automatically
- A new remote image host needs a `next.config.ts` `remotePatterns` entry

## Commands

```bash
bun dev                  # Dev server, port 3000
bun run build            # Production build
bun run typecheck        # TypeScript
bun run lint             # Biome + Ultracite
bun run lint:fix         # Auto-fix
bun test                 # Unit tests
bun run format:prettier  # CSS and Markdown
```

## Lint

Biome + Ultracite enforce style, accessibility and safety — no `any`, semantic
HTML and ARIA, no `eval` or `debugger`, `for...of` over `forEach`, optional
chaining, `as const`. They error on violation, so they are not restated here.
Full rule set: `.github/copilot-instructions.md`.

Escape hatch, sparingly, with a real reason:

```typescript
// biome-ignore lint/style/noMagicNumbers: pixel value for layout
const value = 100;
```
