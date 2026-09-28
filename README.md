# geir.is

Personal portfolio and blog.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS 4 + CSS Modules
- **Animation**: Motion, Three.js/R3F
- **UI**: Base UI, OverlayScrollbars
- **Linting**: Biome + Ultracite
- **Content**: MDX via next-mdx-remote

## Features

- MDX blog with syntax highlighting
- Dynamic OG images
- RSS feed, sitemap, robots.txt
- Vercel Analytics + Speed Insights
- Ambilight effects (canvas glow)
- Elastic scroll carousel
- SDF cloud background (WebGL)
- Reduced motion support

## Development

```bash
bun install
bun dev
```

## Scripts

| Command             | Description       |
| ------------------- | ----------------- |
| `bun dev`           | Dev server        |
| `bun run build`     | Production build  |
| `bun start`         | Production server |
| `bun run lint`      | Biome check       |
| `bun run lint:fix`  | Auto-fix          |
| `bun run typecheck` | TypeScript check  |
| `bun run format`    | Format code       |

## Structure

```
src/
├── app/
│   ├── (routes)/          # Nested routes (notes, og, rss)
│   ├── components/        # UI components
│   │   ├── ambient/       # Ambilight effects
│   │   ├── carousel/      # Elastic scroll carousel
│   │   ├── magnetic-logo/ # Animated logo
│   │   ├── motion/        # Animation primitives
│   │   ├── sdf-clouds/    # WebGL background
│   │   └── ui/            # Base components
│   └── styles/            # Fonts + tokens
├── lib/
│   ├── content/           # Centralized copy
│   ├── hooks/             # Custom hooks
│   └── *-config.ts        # Config files
└── types/                 # Type declarations
```

## Blog Posts

Add `.mdx` to `src/app/(routes)/notes/posts/`:

```mdx
---
title: "Post Title"
publishedAt: "2024-01-01"
summary: "Description"
---

Content
```
