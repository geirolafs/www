# AGENTS.md

Guidance for coding agents (Claude Code, Codex, Cursor, Zed). `CLAUDE.md` only
points here, so add guidance to this file.

Personal portfolio and notes. Next.js 16, React 19, Tailwind 4, Bun.

This repo is public. Planning notes and decision logs go in `.private/`
(gitignored), never in tracked files. Several absences are deliberate — check
there before re-proposing something that looks missing.

## Done means

```bash
bun run typecheck && bun run lint && bun test && bun run build
```

All exit 0, or it isn't finished. Say so plainly if they don't.

## Where things live

| Thing                    | Where                                         |
| ------------------------ | --------------------------------------------- |
| Design tokens            | `@theme` in `src/app/globals.css`             |
| The grid                 | `@utility page-grid` in `src/app/globals.css` |
| Font and weights         | `src/app/styles/fonts.ts`                     |
| Every string on the site | `src/lib/content/`                            |

## Always

- **Tokens, never raw values.** Colours, sizes and spacing come from `@theme`
  as Tailwind utilities. No token? Add one.
- **`cn()` from `@/lib/utils`** for class names, not bare `clsx`.
- **Copy lives in `src/lib/content/`.** No literal strings in components.
- **Pick the right regular weight.** Book (400) for paragraphs, Regular (430)
  for a word, a line or a lone sentence. Set the token; never rely on
  `font-weight: normal`. Nothing below 400 — muted text is colour, not weight.
- **Type styles come from Figma.** If a value isn't there, ask.
- **Server components by default.** `"use client"` only when it needs the
  browser.
- **`import type`** for type-only imports.

## Never

- Add a dependency without asking.
- Re-introduce `three`, `@react-three/*` or `@paper-design/shaders-react`.
- Use `<head>` in a component — use the Metadata API.
- Add italic. Emphasis is weight or colour.
- Use CSS Modules.

## Motion

The site is meant to be nearly still. That's a decision, not an unfinished
state.

- Animate `transform` and `opacity` only. The hero moves, it doesn't fade — its
  first paragraph is the LCP element. The one exception is the page tint, which
  moves `--color-background` with the scroll (`usePageTint` in
  `components/home/ambient-stripe/tint.ts`).
- Respect reduced motion with `useLiveReducedMotion()` for anything JS-driven,
  `motion-reduce:` for pure CSS.
- The stripe is the ambient glow (`SiteStripe`, tuned as preset 1 on
  /localhost/ambient-stripe; change it there and in `SITE_STRIPE`). It
  breathes, stirs with scroll _speed_ (never position), and warms towards the
  cursor near the left edge. The page tint is the one scroll-_linked_ effect,
  deliberately: the background leans a few percent towards the stripe's colour
  in view. Nothing else is scroll-linked.
- The hero ball and the stripe's lantern are the only things that react to the
  cursor. After changing the ball's shaders, run `bun run generate:ball`.
- `--ease-out` shadows Tailwind's built-in on purpose. Don't "fix" it.

## Conventions

- Aliases: `@/components/*`, `@/lib/*`, `@/app/*`, `@/data/*`
- kebab-case files, PascalCase components, camelCase functions
- A new remote image host needs a `remotePatterns` entry in `next.config.ts`
- Biome + Ultracite (`biome.json`) enforce the rest. Use `biome-ignore`
  sparingly, with a real reason.
