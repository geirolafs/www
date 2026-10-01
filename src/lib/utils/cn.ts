import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The custom `@theme` scales tailwind-merge cannot infer on its own.
 *
 * Custom *colours* are not listed here on purpose — tailwind-merge validates
 * `--color-*` permissively and accepts any name, so they work untouched. Sizes,
 * weights, leading, spacing and radii are the opposite: unknown names fall
 * through to that same permissive colour validator, so `text-display` gets
 * classed as a colour, lands in the same conflict group as `text-foreground`,
 * and one of the two is silently dropped.
 *
 * Keys are the `@theme` namespace; values are the variable names minus the
 * prefix. `cn.test.ts` fails if this drifts from globals.css.
 *
 * @see https://github.com/dcastil/tailwind-merge/blob/main/docs/configuration.md
 */
export const THEME_SCALES = {
  text: ["display", "body", "prose", "meta", "link", "label"],
  // `medium` and `semibold` are Tailwind defaults, so listing them changes
  // nothing — but it keeps the invariant "everything in @theme appears here"
  // simple enough to assert.
  "font-weight": ["book", "regular", "medium", "semibold"],
  leading: ["prose"],
  spacing: [
    "site",
    "row",
    "footerrow",
    "footerpad",
    "footergap",
    "section",
    "hero",
    "ball",
    "ball-render-w",
    "ball-render-h",
    "2xs",
    "xs",
    "sm",
    "md",
    "xl",
    "group",
    "project",
    "paragraph",
    // /localhost/hyphenation's vertical rhythm.
    "hysection",
    "hyhead",
    "hyblock",
  ],
  radius: ["pill"],
} as const;

/** The page's `hy-*` colours. They share the prefix but are not sizes. */
const HYPHENATION_COLOURS: ReadonlySet<string> = new Set([
  "hy-track",
  "hy-surface",
  "hy-signal",
  "hy-signal-ink",
  "hy-accent",
]);

/**
 * The `hy-*` text sizes belong only to /localhost/hyphenation, so they are one
 * rule here and not ten names in the site-wide `text` scale above.
 */
export const isHyphenationText = (value: string) =>
  value.startsWith("hy-") && !HYPHENATION_COLOURS.has(value);

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      ...THEME_SCALES,
      text: [...THEME_SCALES.text, isHyphenationText],
    },
  },
});

/**
 * Conditional class names with Tailwind conflict resolution — the standard
 * shadcn `cn`, plus the theme config above that this project's custom scales
 * require.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
