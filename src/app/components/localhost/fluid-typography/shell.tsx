import type { ReactNode } from "react";
import { marked } from "@/app/components/localhost/fluid-typography/hero";
import {
  type Part,
  RichText,
} from "@/app/components/localhost/fluid-typography/rich-text";
import { SectionNav } from "@/app/components/localhost/fluid-typography/section-nav";
import { FOCUS_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { ArealSuperfamily, BespokeSerif } from "@/app/styles/fonts-licensed";
import { cn } from "@/lib/utils";

type ShellProps = {
  /** The page's name for a screen reader, without the typed hyphens. */
  name: string;
  /** The page's name as it shows in the bar; it may hold typed hyphens. */
  title: string;
  /** Accessible name of the section links. */
  navLabel: string;
  sections: readonly { id: string; number: string; nav: string }[];
  colophon: { label: string; lines: readonly (readonly Part[])[] };
  /** The language of the name, when it is not the page's own: `is` for Icelandic. */
  lang?: string;
  hero: ReactNode;
  children: ReactNode;
};

/**
 * The frame of a fluid-typography page, which is a page of its own and shares
 * nothing with the rest of the site but its grid: every band is a `page-grid`,
 * so the columns are the site's. The outermost element carries the two fonts
 * and sets ABC Areal; titles opt in to Bespoke Serif. `hy-areal` points the
 * text and code roles at Areal (code is its `MONO` axis; see `globals.css`),
 * so `font-hy-text` and `font-hy-mono` follow the page. The root layout already
 * renders the `main`, so this is a plain `div`. The copy comes in as props, so
 * one frame serves every page.
 *
 * The hero comes first and the bar after it, so the page opens on the name
 * alone; the bar sticks once it reaches the top. It is a direct child of the
 * shell, so it stays stuck for the rest of the page.
 */
export function Shell({
  name,
  title,
  navLabel,
  sections,
  colophon,
  lang,
  hero,
  children,
}: ShellProps) {
  return (
    <div
      className={cn(
        ArealSuperfamily.variable,
        BespokeSerif.variable,
        "hy-shell hy-areal flex min-h-dvh flex-col bg-background font-book font-hy-text text-foreground"
      )}
      // The page name in the top bar links here.
      id="top"
    >
      {hero}

      {/* A white bar, one `group` (72px) tall, that sticks at the top once
          it reaches it; the sections clear it with `project` (the bar plus
          24px). The page name sits in columns 1–4 and only shows once the bar
          has stuck (`hy-logo`, in globals.css). The links run over columns
          5–12, the content column of every section. On a phone the name
          takes 3 of the 8 columns and the letters 5: nine 24px targets from
          400px up, 20px below that (`SectionNav`). */}
      <header className="page-grid sticky top-0 z-20 h-group items-end bg-background pb-sm">
        {/* The rule under the bar runs across the columns only, like a
            section's. Absolutely placed in the grid, so its box spans the
            columns; with no end row it reaches the bar's bottom edge. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 col-span-full row-start-1 border-border border-b"
        />
        <a
          className={cn(
            "hy-logo col-span-3 lg:col-span-4",
            "font-hy-text font-semibold text-foreground text-hy-logo",
            FOCUS_CLASS
          )}
          href="#top"
          lang={lang}
        >
          <span className="sr-only">{name}</span>
          <span aria-hidden="true">{marked(title)}</span>
        </a>
        <SectionNav
          label={navLabel}
          sections={sections.map(({ id, number, nav }) => ({ id, number, nav }))}
        />
      </header>

      {children}

      <footer className="page-grid">
        <div className="col-span-full flex flex-col gap-2xs text-pretty border-border border-t py-xl font-book text-hy-note text-muted">
          <h2 className="sr-only">{colophon.label}</h2>
          {colophon.lines.map(parts => (
            <p key={parts.map(part => part.text).join("")}>
              <RichText parts={parts} />
            </p>
          ))}
        </div>
      </footer>
    </div>
  );
}
