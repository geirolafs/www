# geir.is

The code behind [www.geir.is](https://www.geir.is). Built with Next.js 16, React 19, Tailwind 4, Motion and Bun. Linted by Biome,
hosted on Vercel.

## Run it

```bash
bun install
bun dev
```

Before calling anything done:

```bash
bun run typecheck && bun run lint && bun test && bun run build
```

## Write a note

Add an `.mdx` file in `src/app/(routes)/notes/posts/`:

```mdx
---
title: "Post title"
publishedAt: "2026-01-01"
summary: "One sentence."
tags: design, process
---

Words go here.
```

## Where things live

```
src/
├── app/            # routes, components, styles
├── lib/content/    # every word on the site
├── lib/            # config, hooks, utilities
└── proxy.ts        # the markdown-for-robots bit
scripts/            # renders the ball, video posters and blur placeholders
```

## License

The code is MIT, so take what helps. The typeface, CV, portfolio work and
writing are mine (or my clients'), so please don't. Details in
[LICENSE](./LICENSE).
