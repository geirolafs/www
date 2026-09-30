import type { ReactNode } from "react";
import { RichText } from "@/app/components/localhost/hyphenation/rich-text";
import { FOCUS_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { BespokeSerif, GeistSans } from "@/app/styles/fonts-licensed";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";

const { shell, sections, colophon } = localhostHyphenationContent;

/**
 * The frame of the playground, which is a page of its own and shares nothing
 * with the rest of the site. The outermost element carries the fonts and sets
 * Geist, so the top bar, the specimens, both editors and the colophon are
 * Geist; titles opt in to Bespoke Serif. The root layout already renders
 * the `main`, so this is a plain `div`.
 */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        GeistSans.variable,
        BespokeSerif.variable,
        "flex min-h-dvh flex-col bg-background font-book font-hy-text text-foreground"
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-site">
        {/* On a wide screen the nav sits over the content column of every
            Section (the same 12 columns), so the links line up with the text.
            It stays at the top on a white bar, one `group` (72px) tall; the
            sections clear it with `project` (the bar plus 24px). It runs into
            the page padding so text never shows beside it. */}
        <header className="sticky top-0 z-20 -mx-site grid h-group items-center gap-x-md bg-background px-site lg:grid-cols-12">
          <nav
            aria-label={shell.navLabel}
            className="-mx-site overflow-x-auto px-site lg:col-span-8 lg:col-start-5 lg:mx-0 lg:overflow-visible lg:px-0"
          >
            <ul className="flex gap-md whitespace-nowrap lg:justify-between">
              {Object.values(sections).map(section => (
                <li key={section.id}>
                  <a
                    className={cn(
                      "inline-block py-2xs font-medium text-foreground text-hy-nav hover:text-muted",
                      FOCUS_CLASS
                    )}
                    href={`#${section.id}`}
                  >
                    {/* The same number as the section title, muted and
                        tabular like it, set above the label: on one line the
                        seven links are wider than the content column.
                        Hidden from screen readers, as on the title. */}
                    <span aria-hidden="true" className="block text-muted tabular-nums">
                      {section.number}
                    </span>
                    {section.nav}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {children}

        <footer className="flex flex-col gap-2xs border-border border-t py-xl text-meta text-muted">
          <h2 className="sr-only">{colophon.label}</h2>
          {colophon.lines.map(parts => (
            <p key={parts.map(part => part.text).join("")}>
              <RichText parts={parts} />
            </p>
          ))}
        </footer>
      </div>
    </div>
  );
}
