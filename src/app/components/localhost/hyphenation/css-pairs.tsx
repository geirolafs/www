import type { ReactNode } from "react";
import { RichText } from "@/app/components/localhost/hyphenation/rich-text";
import {
  CODE_CLASS,
  LABEL_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { Hyphenate } from "@/packages/skiptingar/src/react";

const { howItWorks, compare } = localhostHyphenationContent;
const { css } = howItWorks;

/**
 * The demo measure, the same for both sides of every pair. It is a demo
 * constraint, not a design value, so it is not a token. `box-content` makes it
 * the width of the text, not of the dashed box around it. The text is the
 * static `text-link` size, so the same width breaks the same way on every
 * screen; the fluid sizes would move the breaks as the window grows.
 */
const DEMO_BOX = "box-content max-w-[13.5rem] border border-border border-dashed p-2xs";

/**
 * The heading demo's measure is in `em`, not `rem`, so it follows the fluid
 * heading size and the line breaks stay the same at every screen width.
 */
const BALANCE_BOX =
  "box-content max-w-[7em] border border-border border-dashed p-2xs text-hy-title";

/** A column caption: Without or With, and the CSS that the side sets. */
function Side({
  label,
  caption,
  children,
}: {
  label: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="flex flex-col gap-2xs">
      <figcaption className="flex flex-col">
        <span className={cn(LABEL_CLASS, "text-foreground")}>{label}</span>
        <code className={cn(CODE_CLASS, "text-label text-muted")} translate="no">
          {caption}
        </code>
      </figcaption>
      {children}
    </figure>
  );
}

type Row = (typeof css.rows)[number];

/** The live pair for one row: the same text at the same width, twice. */
function Pair({ row }: { row: Row }) {
  if (!("withCaption" in row)) {
    return null;
  }

  switch (row.id) {
    case "pretty":
      return (
        <div className="flex flex-wrap gap-md">
          <Side caption={row.withoutCaption} label={css.without}>
            <Hyphenate>
              <p
                className={cn(DEMO_BOX, "hyphens-manual text-wrap font-book text-link")}
                lang="is"
              >
                {compare.text}
              </p>
            </Hyphenate>
          </Side>
          <Side caption={row.withCaption} label={css.with}>
            <Hyphenate>
              <p
                className={cn(DEMO_BOX, "hyphens-manual text-pretty font-book text-link")}
                lang="is"
              >
                {compare.text}
              </p>
            </Hyphenate>
          </Side>
        </div>
      );
    case "balance":
      return (
        <div className="flex flex-wrap gap-md">
          <Side caption={row.withoutCaption} label={css.without}>
            <p className={cn(BALANCE_BOX, TITLE_CLASS, "text-wrap")} lang="is">
              {css.balanceHeading}
            </p>
          </Side>
          <Side caption={row.withCaption} label={css.with}>
            <p className={cn(BALANCE_BOX, TITLE_CLASS, "text-balance")} lang="is">
              {css.balanceHeading}
            </p>
          </Side>
        </div>
      );
    case "hyphens":
      return (
        <div className="flex flex-wrap gap-md">
          <Side caption={row.withoutCaption} label={css.without}>
            {/* No soft hyphens here: `auto` leaves the choice to the browser. */}
            <p
              className={cn(DEMO_BOX, "hyphens-auto text-pretty font-book text-link")}
              lang="is"
            >
              {compare.text}
            </p>
          </Side>
          <Side caption={row.withCaption} label={css.with}>
            <Hyphenate>
              <p
                className={cn(DEMO_BOX, "hyphens-manual text-pretty font-book text-link")}
                lang="is"
              >
                {compare.text}
              </p>
            </Hyphenate>
          </Side>
        </div>
      );
    case "numeric":
      return (
        <div className="flex flex-wrap gap-md">
          <Side caption={row.withoutCaption} label={css.without}>
            <ul className="flex flex-col items-end font-hy-text font-medium text-body">
              {row.numbers.map(number => (
                <li key={number}>{number}</li>
              ))}
            </ul>
          </Side>
          <Side caption={row.withCaption} label={css.with}>
            <ul className="flex flex-col items-end font-hy-text font-medium text-body tabular-nums">
              {row.numbers.map(number => (
                <li key={number}>{number}</li>
              ))}
            </ul>
          </Side>
        </div>
      );
    default:
      return null;
  }
}

/**
 * The CSS that the package leans on, one row per property: what it does, where
 * this page uses it and, where a picture helps, a live pair of the same text
 * without and with it.
 */
export function CssPairs() {
  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-2xs">
        <h3
          className={cn(TITLE_CLASS, "scroll-mt-project text-foreground text-hy-lede")}
          id={css.id}
        >
          {css.title}
        </h3>
        <p className="max-w-3xl text-pretty font-book text-body text-muted">
          {css.intro}
        </p>
      </div>

      <div className="flex flex-col">
        {css.rows.map(row => (
          <section
            aria-labelledby={`${css.id}-${row.id}`}
            className="flex flex-col gap-sm border-border border-t py-sm"
            key={row.id}
          >
            <h4
              className="font-semibold text-body text-foreground"
              id={`${css.id}-${row.id}`}
            >
              <code className={CODE_CLASS} translate="no">
                {row.property}
              </code>
            </h4>
            <p className="max-w-3xl text-pretty font-book text-body text-muted">
              {row.what}
            </p>
            <p className="max-w-3xl text-pretty font-book text-meta text-muted">
              <span className={LABEL_CLASS}>{css.usedLabel}</span>{" "}
              <RichText parts={row.used} />
            </p>
            {"support" in row ? (
              <p className="max-w-3xl text-pretty font-book text-meta text-muted">
                <span className={LABEL_CLASS}>{css.supportLabel}</span>{" "}
                <RichText parts={row.support} />
              </p>
            ) : null}
            {"snippet" in row ? (
              <pre className="overflow-x-auto border border-border p-sm text-meta">
                <code className={CODE_CLASS} translate="no">
                  {row.snippet}
                </code>
              </pre>
            ) : null}
            <Pair row={row} />
          </section>
        ))}
      </div>
    </div>
  );
}
