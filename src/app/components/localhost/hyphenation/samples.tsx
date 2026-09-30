import { MarkedText } from "@/app/components/localhost/hyphenation/marked-text";
import {
  CONTROL_CLASS,
  LABEL_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { hyphenate } from "@/packages/skiptingar/src";
import { Hyphenate } from "@/packages/skiptingar/src/react";

const { samplesSection: content } = localhostHyphenationContent;

/**
 * The pangram at five weights of Geist: 300, 400, 500, 700 and 900. Written
 * out in full so Tailwind can see every class.
 */
const WEIGHT_RAMP = [
  "font-light",
  "font-book",
  "font-medium",
  "font-bold",
  "font-black",
] as const;

function Credit({ children }: { children: string }) {
  return (
    <p className="mt-2xs font-regular text-label text-muted" lang="is">
      {children}
    </p>
  );
}

/** Phone width on purpose: the headings must break at a real small screen. */
export function HeadingSample() {
  return (
    <Hyphenate mode="heading">
      <div className="flex max-w-[20rem] flex-col gap-md hyphens-manual" lang="is">
        {content.heading.headings.map(heading => (
          <h4
            className={cn(TITLE_CLASS, "text-balance text-foreground text-hy-title")}
            key={heading}
          >
            {heading}
          </h4>
        ))}
      </div>
    </Hyphenate>
  );
}

export function ShortParagraph() {
  return (
    <>
      <Hyphenate>
        {/* Weight 300 is a scoped exception for this route (see AGENTS.md). */}
        <p
          className="hyphens-manual text-pretty font-light text-foreground text-hy-lede"
          lang="is"
        >
          {content.short.text}
        </p>
      </Hyphenate>
      <Credit>{content.short.credit}</Credit>
    </>
  );
}

export function LongParagraph() {
  return (
    <>
      <Hyphenate>
        {/* A narrow column on purpose, so the paragraph needs its breaks. */}
        <p
          className="max-w-[28rem] hyphens-manual text-pretty font-book text-prose"
          lang="is"
        >
          {content.long.text}
        </p>
      </Hyphenate>
      <Credit>{content.long.credit}</Credit>
    </>
  );
}

export function LawText() {
  return (
    <>
      <dl className="flex flex-col gap-sm" lang="is">
        {content.law.articles.map(article => (
          <div className="flex flex-col gap-2xs" key={article.number}>
            <dt className={cn(LABEL_CLASS, "tabular-nums")}>{article.number}</dt>
            <Hyphenate>
              <dd className="hyphens-manual text-pretty font-book text-prose">
                {article.text}
              </dd>
            </Hyphenate>
          </div>
        ))}
      </dl>
      <Credit>{content.law.credit}</Credit>
    </>
  );
}

export function CardGrid() {
  return (
    <ul className="grid grid-cols-2 gap-sm hyphens-manual xl:grid-cols-3" lang="is">
      {content.cards.items.map(item => (
        <li className="border border-border p-sm" key={item.label}>
          {/* One `Hyphenate` per card: joined together, "land." and the next
              label would read as a web address, and the label would be skipped. */}
          <Hyphenate>
            <p className="font-semibold text-body text-foreground">{item.label}</p>
            <p className="font-book text-meta text-muted">{item.description}</p>
          </Hyphenate>
        </li>
      ))}
    </ul>
  );
}

export function NavigationSample() {
  const { navigation } = content;
  return (
    <div className="flex flex-col gap-md">
      <Hyphenate>
        {/* The nav label is English; only the link text is Icelandic. */}
        <nav aria-label={navigation.navLabel} className="flex flex-wrap gap-xs">
          {navigation.links.map(link => (
            <a
              className={cn(
                CONTROL_CLASS,
                "hyphens-manual border-border text-foreground hover:border-foreground"
              )}
              href={navigation.href}
              key={link}
              lang="is"
            >
              {link}
            </a>
          ))}
        </nav>
      </Hyphenate>
      <Hyphenate>
        {/* Narrow on purpose: a call to action that has to wrap. */}
        <div className="max-w-[10rem]">
          <button
            className={cn(
              CONTROL_CLASS,
              "w-full hyphens-manual border-foreground bg-foreground text-background"
            )}
            lang="is"
            type="button"
          >
            {navigation.button}
          </button>
        </div>
      </Hyphenate>
    </div>
  );
}

/** The price column, the second of three, is right-aligned so its figures line up. */
const PRICE_COLUMN = 1;

export function TableSample() {
  const { table } = content;
  return (
    <Hyphenate>
      {/* The reset makes a table a non-wrapping block; this one must wrap. */}
      <table
        className="table w-full max-w-full table-fixed hyphens-manual whitespace-normal text-left"
        lang="is"
      >
        <colgroup>
          <col className="w-1/4" />
          <col className="w-1/4" />
          <col className="w-1/2" />
        </colgroup>
        <thead>
          <tr>
            {table.headers.map((header, index) => (
              <th
                className={cn(
                  LABEL_CLASS,
                  "py-2xs pr-md",
                  index === PRICE_COLUMN && "text-right"
                )}
                key={header}
                scope="col"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map(row => (
            <tr className="border-border border-t" key={row.join("|")}>
              {row.map((cell, index) => (
                // Tabular figures line the digits up in a column.
                <td
                  className={cn(
                    "py-2xs pr-md align-top font-book text-foreground text-meta tabular-nums",
                    index === PRICE_COLUMN && "text-right"
                  )}
                  key={cell}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Hyphenate>
  );
}

/**
 * Names in heading mode, each broken at the joint before its ending. They go
 * through `hyphenate()` and `MarkedText` so the one break is visible as a dot.
 */
export function Names() {
  return (
    <ul className="flex flex-col gap-2xs" lang="is">
      {content.names.names.map(name => (
        <li
          className={cn(
            TITLE_CLASS,
            "wrap-break-word hyphens-manual text-foreground text-hy-title"
          )}
          key={name}
        >
          <MarkedText text={hyphenate(name, { mode: "heading" })} />
        </li>
      ))}
    </ul>
  );
}

/** Icelandic with two English phrases in it, which must come out untouched. */
export function MixedLanguages() {
  const { mixed } = content;
  return (
    <Hyphenate>
      {/* Narrow on purpose, so the Icelandic words have to break. */}
      <p
        className="max-w-[20rem] hyphens-manual text-pretty font-book text-prose"
        lang="is"
      >
        {mixed.before}
        <span lang="en">{mixed.word}</span>
        {mixed.middle}
        <span lang="en">{mixed.quote}</span>
        {mixed.after}
      </p>
    </Hyphenate>
  );
}

export function Acronyms() {
  return (
    <Hyphenate>
      {/* Narrow on purpose, so the long all-caps word has to break. */}
      <p
        className="max-w-[14rem] hyphens-manual text-pretty font-book text-prose"
        lang="is"
      >
        {content.acronyms.text}
      </p>
    </Hyphenate>
  );
}

export function Pangram() {
  return (
    <Hyphenate>
      <div className="flex flex-col gap-2xs hyphens-manual" lang="is">
        {WEIGHT_RAMP.map((weight, index) => (
          // The four repeats are for the eye only, so a screen reader hears the
          // pangram once.
          <p
            aria-hidden={index > 0 ? "true" : undefined}
            className={cn("text-balance text-display", weight)}
            key={weight}
          >
            {content.pangram.text}
          </p>
        ))}
      </div>
    </Hyphenate>
  );
}
