import { PAIR_BOX, Pair } from "@/app/components/localhost/hyphenation/pair";
import { RagDiagram as RagDiagramClient } from "@/app/components/localhost/hyphenation/rag-diagram";
import {
  LABEL_CLASS,
  NOTE_CLASS,
  TITLE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { type HyphenateOptions, hyphenate } from "@/packages/skiptingar/src";
import { SettledText } from "@/packages/skiptingar/src/client";

const { ragSection: content } = localhostHyphenationContent;

/**
 * Settle rag against the browser's own `text-wrap`, with nothing else
 * different. Both sides get the same soft hyphens, made on the server; no
 * typesetting, so no glued spaces; and no overhang, which only Settle rag
 * could use. A title is hyphenated at its joints alone (`joints: "only"`),
 * the breaks the browser gets by default, so `balance` is not handed breaks
 * it was never meant to weigh.
 *
 * The texts are fixed, not the editor's, and the settings do not reach them:
 * changing either would hide what the pair shows.
 */

/** Settle rag sets the text greedily (`text-wrap: wrap`), so the plan holds. */
const SETTLED = "hyphens-manual text-wrap";

/** Settle rag with no overhang: the browser has no such cheat. */
const NO_OVERHANG = { overhang: 0 } as const;

const TITLE_HYPHENATION: HyphenateOptions = { mode: "heading", joints: "only" };

function labels(without: string) {
  return {
    without: { label: without, caption: content.browser },
    with: { label: content.settle, caption: content.skiptingar },
  };
}

function Credit({ children }: { children: string }) {
  return (
    <p className={NOTE_CLASS} lang="is">
      {children}
    </p>
  );
}

/** Titles: `text-wrap: balance` against Settle rag balancing them. */
export function RagTitles() {
  const headings = content.titles.headings.map(heading =>
    hyphenate(heading, TITLE_HYPHENATION)
  );
  const headingClass = cn(TITLE_CLASS, "text-foreground text-hy-title");

  return (
    <Pair
      initial={320}
      labels={labels(content.titles.without)}
      max={560}
      min={200}
      name={content.titles.label}
      with={
        <div className={cn(PAIR_BOX, "flex flex-col gap-md")}>
          {headings.map(heading => (
            <SettledText
              as="h4"
              className={cn(headingClass, SETTLED)}
              key={heading}
              lang="is"
              options={{ ...NO_OVERHANG, balance: true }}
              text={heading}
            />
          ))}
        </div>
      }
      without={
        <div className={cn(PAIR_BOX, "flex flex-col gap-md")}>
          {headings.map(heading => (
            <h4
              className={cn(headingClass, "hyphens-manual text-balance")}
              key={heading}
              lang="is"
            >
              {heading}
            </h4>
          ))}
        </div>
      }
    />
  );
}

/** One body paragraph: `text-wrap: pretty` against Settle rag. */
function BodyPair({
  text,
  className,
  initial,
  name,
  without,
}: {
  text: string;
  className: string;
  initial: number;
  name: string;
  without: string;
}) {
  const hyphenated = hyphenate(text);

  return (
    <Pair
      initial={initial}
      labels={labels(without)}
      max={560}
      min={180}
      name={name}
      with={
        <SettledText
          className={cn(PAIR_BOX, SETTLED, className)}
          lang="is"
          options={NO_OVERHANG}
          text={hyphenated}
        />
      }
      without={
        <p className={cn(PAIR_BOX, "hyphens-manual text-pretty", className)} lang="is">
          {hyphenated}
        </p>
      }
    />
  );
}

/** Saga prose at body size: the last line and the short pieces. */
export function RagBody() {
  const { body } = content;
  return (
    <>
      <BodyPair
        className="font-book text-foreground text-prose"
        initial={360}
        name={body.label}
        text={body.text}
        without={body.without}
      />
      <Credit>{body.credit}</Credit>
    </>
  );
}

/** Large type in a narrow column, where the edge outweighs a lone last word. */
export function RagJudgment() {
  const { judgment } = content;
  return (
    <>
      {/* Weight 300 is a scoped exception for this route (see AGENTS.md). */}
      <BodyPair
        className="font-light text-foreground text-hy-lede"
        initial={248}
        name={judgment.label}
        text={judgment.text}
        without={judgment.without}
      />
      <Credit>{judgment.credit}</Credit>
    </>
  );
}

/**
 * How Settle rag works, one paragraph through five stages. The server
 * hyphenates the text and hands it over with the copy, so the client chunk
 * holds neither the patterns nor the page's other copy.
 */
export function RagDiagram() {
  const { text, ...copy } = content.diagram;
  return <RagDiagramClient copy={copy} hyphenated={hyphenate(text)} />;
}

/**
 * Settle rag beside CSS `text-wrap` and two JavaScript line breakers, one row
 * per question a reader asks before picking one. Settle rag's own gaps are
 * rows too. It scrolls sideways on a phone rather than squeezing four columns.
 */
export function RagTable() {
  const { table } = content;
  const own = table.columns.length - 1;

  return (
    <div className="flex min-w-0 flex-col gap-sm">
      {/* `min-w-0` on the column and `overflow-x-auto` here: the table
          scrolls inside its box instead of widening the page. */}
      <div className="overflow-x-auto">
        {/* Fixed columns: the row names a fixed width, the four answers equal
            shares, so one long cell wraps instead of pushing the rest away.
            `table`, `whitespace-normal` and `max-w-none` undo the site's
            global table style, which sets one line per cell in a block. */}
        <table className="table w-full min-w-176 max-w-none table-fixed whitespace-normal text-left text-hy-note">
          <colgroup>
            <col className="w-36" />
            {table.columns.map(column => (
              <col key={column} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <td className="py-xs pr-md" />
              {table.columns.map((column, index) => (
                <th
                  className={cn(
                    LABEL_CLASS,
                    "py-xs pr-md align-bottom",
                    index !== own && "text-muted"
                  )}
                  key={column}
                  scope="col"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map(row => (
              <tr className="border-border border-t" key={row.label}>
                <th
                  className="py-xs pr-md align-top font-medium text-foreground"
                  scope="row"
                >
                  {row.label}
                </th>
                {row.cells.map((cell, index) => (
                  <td
                    className={cn(
                      "py-xs pr-md align-top font-book",
                      index === own ? "text-foreground" : "text-muted"
                    )}
                    // The columns are fixed and in order; a cell's column is its identity.
                    // biome-ignore lint/suspicious/noArrayIndexKey: see above
                    key={index}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
