import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ExperimentPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

/**
 * The neutral shell for pages under /localhost/*: a plain title and
 * description, then the experiment. No site header, footer or way back — each
 * experiment stands alone. `children` is placed as-is inside `page-grid` and
 * positions itself — some demos want the full width, some a single column.
 */
export function ExperimentPage({ title, description, children }: ExperimentPageProps) {
  return (
    <div className="min-h-dvh bg-background py-xl text-foreground">
      <header className="page-grid">
        <div className="lg:col-span-7 lg:col-start-2">
          <h1 className="text-balance font-regular text-display text-foreground">
            {title}
          </h1>
          <p className="mt-xs text-pretty font-book text-body text-muted">
            {description}
          </p>
        </div>
      </header>
      <div className="page-grid mt-xl">{children}</div>
    </div>
  );
}

/**
 * Palettes for `CustomExperimentPage`. Both redefine the site's own colour
 * tokens on the wrapper, so anything inside using `text-foreground`,
 * `text-muted` or `bg-background` — or reading the tokens with
 * `getComputedStyle` — follows the theme without knowing it is in one.
 *
 * `dark` is v1's `.dark` block, converted from oklch: 0.145 → #0a0a0a,
 * 0.985 → #fafafa, 0.708 → #a1a1a1. `light` is the site's own palette, so it
 * sets nothing.
 */
const THEME_CLASS = {
  dark: "[--color-background:#0a0a0a] [--color-border:#454545] [--color-foreground:#fafafa] [--color-muted:#a1a1a1]",
  light: "",
} as const;

type CustomExperimentPageProps = {
  title: string;
  theme: keyof typeof THEME_CLASS;
  className?: string;
  children: ReactNode;
};

/**
 * The custom shell, for experiments that keep v1's /dev look instead of the
 * site's: full-bleed, v1's padding, and v1's `same-size-typography` — one
 * size for everything, weight 650, 1.45 leading. v1 set that on Hallovetica;
 * Same Univers stands in, since the font stays out of this public repo. v1's
 * letter-spacing clamp had its min above its max, so it always resolved to
 * the min, 0.02em.
 *
 * Padding is v1's `--site-padding-x` and its /dev layout's `pt-24`.
 */
export function CustomExperimentPage({
  title,
  theme,
  className,
  children,
}: CustomExperimentPageProps) {
  return (
    <div
      className={cn(
        THEME_CLASS[theme],
        "flex min-h-dvh flex-col bg-background text-foreground",
        "px-[clamp(1rem,1rem+0.1563svw,4rem)] pt-24 pb-24",
        "text-balance font-[650] text-[clamp(1.8rem,2.2svw,2.25rem)] leading-[1.45] tracking-[0.02em]",
        className
      )}
    >
      <h1 className="sr-only">{title}</h1>
      {children}
    </div>
  );
}
