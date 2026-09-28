# geir.is

Source for [www.geir.is](https://www.geir.is), the portfolio and notes of Geir
Ólafsson, a design engineer and creative director in Reykjavík.

## Stack

- **Framework**: Next.js 16 (App Router, Cache Components), React 19
- **Runtime**: Bun
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS 4, tokens in `src/app/globals.css`
- **Animation**: Motion, plus a hand-written WebGL shader for the hero ball
- **Content**: MDX via next-mdx-remote, syntax highlighting by sugar-high
- **Analytics**: PostHog (proxied through `/ingest`), Vercel Analytics
- **Linting**: Biome + Ultracite
- **Hosting**: Vercel

## Features

- **Metal ball hero.** Server-rendered rest pose, swapped for a live WebGL
  shader on first pointer input. `scripts/render-metal-ball.ts` ports the
  shaders to the CPU so the static image and the live render match pixel for
  pixel.
- **Notes.** MDX posts with tags, reading time, RSS and a sitemap.
- **OG images.** Generated per post at `/og?slug=…` from the post's own
  frontmatter.
- **Agent-readable.** `/llms.txt`, and every page answers
  `Accept: text/markdown` with a markdown rendition of itself (`src/proxy.ts`).
- **Reduced motion.** Respected everywhere, including live changes to the
  setting.

## Development

```bash
bun install
bun dev
```

Analytics stay off unless `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is set, so
nothing else is needed to run it locally.

## Scripts

| Command                    | Description                              |
| -------------------------- | ---------------------------------------- |
| `bun dev`                  | Dev server                               |
| `bun run build`            | Production build                         |
| `bun run lint`             | Biome check                              |
| `bun run lint:fix`         | Biome check with fixes                   |
| `bun run typecheck`        | TypeScript check                         |
| `bun test`                 | Tests                                    |
| `bun run generate:ball`    | Re-render the hero ball's static images  |
| `bun run generate:posters` | First-frame posters for portfolio videos |
| `bun run generate:blur`    | Blur placeholders for portfolio media    |

## Structure

```
src/
├── app/
│   ├── (routes)/       # about, contact, privacy, notes, og, rss
│   ├── components/     # blog, dev, home, providers, shell, ui
│   ├── md/             # markdown renditions for agents
│   ├── llms.txt/
│   └── styles/         # font loading, reset, typography
├── data/               # portfolio media manifests
├── lib/
│   ├── content/        # every string on the site
│   ├── config/         # site and image config
│   ├── hooks/
│   └── utils/
└── proxy.ts            # markdown content negotiation
scripts/                # asset generation
```

## Writing a note

Add an `.mdx` file to `src/app/(routes)/notes/posts/`:

```mdx
---
title: "Post title"
publishedAt: "2026-01-01"
summary: "One sentence."
tags: design, process
---

Content
```

## License

The code is MIT licensed. The typeface, CV, portfolio work and writing are
not. See [LICENSE](./LICENSE).
