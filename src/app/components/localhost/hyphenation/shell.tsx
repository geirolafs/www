import type { ReactNode } from "react";
import { RichText } from "@/app/components/localhost/hyphenation/rich-text";
import { SectionNav } from "@/app/components/localhost/hyphenation/section-nav";
import { FOCUS_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { BespokeSerif, GeistMono, GeistSans } from "@/app/styles/fonts-licensed";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";

const { shell, sections, colophon, hero } = localhostHyphenationContent;

/**
 * The frame of the playground, which is a page of its own and shares nothing
 * with the rest of the site but its grid: every band is a `page-grid`, so the
 * columns are the site's. The outermost element carries the three fonts and sets
 * Geist; titles opt in to Bespoke Serif. The root layout already renders the
 * `main`, so this is a plain `div`.
 */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        BespokeSerif.variable,
        "hy-shell flex min-h-dvh flex-col bg-background font-book font-hy-text text-foreground"
      )}
      // The page name in the top bar links here.
      id="top"
    >
      {/* A white bar, one `group` (72px) tall, that stays at the top; the
          sections clear it with `project` (the bar plus 24px). The page name
          sits in columns 1–4 and only shows once the hero title has scrolled
          under the bar (`hy-logo`, in globals.css). The links run over
          columns 5–12, the content column of every section. On a phone the
          name takes 3 of the 8 columns and the letters 5: eight 24px targets
          from 360px up, 20px below that (`SectionNav`). */}
      <header className="page-grid sticky top-0 z-20 h-group items-end bg-background pb-sm">
        <a
          className={cn(
            "hy-logo col-span-3 lg:col-span-4",
            "font-hy-text font-semibold text-foreground text-hy-logo [font-feature-settings:'ss01']",
            FOCUS_CLASS
          )}
          href="#top"
          lang="is"
        >
          <span className="sr-only">{hero.name}</span>
          <span aria-hidden="true">{hero.title}</span>
        </a>
        <SectionNav
          label={shell.navLabel}
          sections={Object.values(sections).map(({ id, number, nav }) => ({
            id,
            number,
            nav,
          }))}
        />
      </header>

      {children}

      <footer className="page-grid">
        <div className="col-span-full flex flex-col gap-2xs border-border border-t py-xl font-book text-hy-note text-muted">
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
