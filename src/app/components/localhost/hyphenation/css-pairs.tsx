import type { ReactNode } from "react";
import { CodeBlock, InlineCode } from "@/app/components/localhost/hyphenation/code";
import { Measure } from "@/app/components/localhost/hyphenation/measure";
import { RichText } from "@/app/components/localhost/hyphenation/rich-text";
import {
  BODY_CLASS,
  ITEM_TITLE_CLASS,
  LABEL_CLASS,
  NOTE_CLASS,
  SUBTITLE_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { Hyphenate } from "@/packages/skiptingar/src/react";

const { howItWorks, compare } = localhostHyphenationContent;
const { css } = howItWorks;

/**
 * The box both sides of a pair share: the slider's width, dashed so the edge
 * the lines wrap against is visible. The text is the static `text-link` size,
 * so a width breaks the same way on every screen.
 */
const DEMO_BOX = "w-(--measure) max-w-full border border-border border-dashed p-2xs";

/**
 * Where each pair's slider starts: a width at which the two sides differ, so
 * the property's effect shows before anyone drags. Found by sweeping the
 * widths in Chrome: `pretty` only changes this text at some widths (170–240
 * and 400–430px), which is why a fixed box can hide it.
 */
const START_WIDTH = { pretty: 220, balance: 360, hyphens: 230 } as const;

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
    <figure className="flex min-w-0 flex-1 flex-col gap-2xs overflow-x-clip">
      <figcaption className="flex flex-col items-start gap-2xs">
        <span className={cn(LABEL_CLASS, "text-foreground")}>{label}</span>
        <InlineCode className="text-label">{caption}</InlineCode>
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

  const pair = (without: ReactNode, withProperty: ReactNode) => (
    <div className="flex flex-col gap-md md:flex-row">
      <Side caption={row.withoutCaption} label={css.without}>
        {without}
      </Side>
      <Side caption={row.withCaption} label={css.with}>
        {withProperty}
      </Side>
    </div>
  );
  const paragraph = cn(DEMO_BOX, "font-book text-link");
  const heading = cn(DEMO_BOX, TITLE_CLASS, "text-hy-title");

  switch (row.id) {
    case "pretty":
      return (
        <Measure initial={START_WIDTH.pretty} max={480} min={160}>
          {pair(
            <Hyphenate>
              <p className={cn(paragraph, "hyphens-manual text-wrap")} lang="is">
                {compare.text}
              </p>
            </Hyphenate>,
            <Hyphenate>
              <p className={cn(paragraph, "hyphens-manual text-pretty")} lang="is">
                {compare.text}
              </p>
            </Hyphenate>
          )}
        </Measure>
      );
    case "balance":
      return (
        <Measure initial={START_WIDTH.balance} max={560} min={160}>
          {pair(
            <p className={cn(heading, "text-wrap")} lang="is">
              {css.balanceHeading}
            </p>,
            <p className={cn(heading, "text-balance")} lang="is">
              {css.balanceHeading}
            </p>
          )}
        </Measure>
      );
    case "hyphens":
      return (
        <Measure initial={START_WIDTH.hyphens} max={480} min={160}>
          {pair(
            // No soft hyphens here: `auto` leaves the choice to the browser.
            <p className={cn(paragraph, "hyphens-auto text-pretty")} lang="is">
              {compare.text}
            </p>,
            <Hyphenate>
              <p className={cn(paragraph, "hyphens-manual text-pretty")} lang="is">
                {compare.text}
              </p>
            </Hyphenate>
          )}
        </Measure>
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
        <h3 className={cn(SUBTITLE_CLASS, "scroll-mt-project")} id={css.id}>
          {css.title}
        </h3>
        <p className={cn(BODY_CLASS, "max-w-3xl")}>{css.intro}</p>
      </div>

      <div className="flex flex-col">
        {css.rows.map(row => (
          <section
            aria-labelledby={`${css.id}-${row.id}`}
            className="flex flex-col gap-sm border-border border-t py-sm"
            key={row.id}
          >
            <h4 className={ITEM_TITLE_CLASS} id={`${css.id}-${row.id}`}>
              <InlineCode>{row.property}</InlineCode>
            </h4>
            <p className={cn(BODY_CLASS, "max-w-3xl")}>{row.what}</p>
            <p className={cn(NOTE_CLASS, "max-w-3xl")}>
              <span className={LABEL_CLASS}>{css.usedLabel}</span>{" "}
              <RichText parts={row.used} />
            </p>
            {"support" in row ? (
              <p className={cn(NOTE_CLASS, "max-w-3xl")}>
                <span className={LABEL_CLASS}>{css.supportLabel}</span>{" "}
                <RichText parts={row.support} />
              </p>
            ) : null}
            {"snippet" in row ? (
              <CodeBlock code={row.snippet} label={css.snippetLabel} />
            ) : null}
            <Pair row={row} />
          </section>
        ))}
      </div>
    </div>
  );
}
