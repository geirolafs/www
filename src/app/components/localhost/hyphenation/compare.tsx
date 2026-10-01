import type { ReactNode } from "react";
import { firstParagraph } from "@/app/components/localhost/hyphenation/blocks";
import { initialOutput } from "@/app/components/localhost/hyphenation/initial-output";
import {
  LiveBlock,
  PageParagraph,
} from "@/app/components/localhost/hyphenation/live-text";
import { Measure } from "@/app/components/localhost/hyphenation/measure";
import { LABEL_CLASS, NOTE_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { Tip } from "@/app/components/localhost/hyphenation/tip";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";

const { compare, liveEditor } = localhostHyphenationContent;

/**
 * The slider's width, the same for all three columns. The box edge is dashed
 * to show where the lines wrap.
 */
const COLUMN_CLASS =
  "w-(--measure) max-w-full border border-border border-dashed p-2xs font-book text-body text-foreground";

function Column({
  label,
  tip,
  hint,
  children,
}: {
  label: string;
  tip: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    // From `lg` up each figure spans the two rows of a subgrid: the captions
    // share the first row, so the three boxes start on one line even where a
    // hint makes one caption taller.
    // Clipped at its own edge, so a word that runs out of a box without the
    // package never widens the page.
    <figure className="flex min-w-0 flex-col gap-2xs overflow-x-clip lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:items-start">
      <figcaption className="max-w-56">
        <Tip className={cn(LABEL_CLASS, "text-foreground")} tip={tip}>
          {label}
        </Tip>
        {hint ? <span className={cn(NOTE_CLASS, "block")}>{hint}</span> : null}
      </figcaption>
      {children}
    </figure>
  );
}

/**
 * The first paragraph of the editor's text three ways, side by side under one
 * width slider, then the table of pattern differences across the full width.
 * The first two columns show the text as typed; the third follows the page
 * settings.
 */
export function Compare() {
  const { columns, table } = compare;
  const initial = initialOutput(firstParagraph(liveEditor.initialText));

  return (
    <>
      <Measure className="col-span-full" initial={220} max={420} min={140}>
        <div className="flex flex-col gap-y-md lg:grid lg:grid-cols-3 lg:grid-rows-[auto_auto] lg:gap-x-md">
          <Column label={columns.none.label} tip={columns.none.tip}>
            <p className={cn(COLUMN_CLASS, "hyphens-manual text-wrap")} lang="is">
              <PageParagraph />
            </p>
          </Column>
          <Column
            hint={columns.browser.hint}
            label={columns.browser.label}
            tip={columns.browser.tip}
          >
            <p className={cn(COLUMN_CLASS, "hyphens-auto text-wrap")} lang="is">
              <PageParagraph />
            </p>
          </Column>
          <Column label={columns.skiptingar.label} tip={columns.skiptingar.tip}>
            <LiveBlock className={COLUMN_CLASS} initial={initial} />
          </Column>
        </div>
      </Measure>

      {/* `min-w-0`: a grid item is as wide as its content by default, so the
          table would widen the page on a phone instead of scrolling. */}
      <div className="col-span-full flex min-w-0 flex-col gap-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-hy-note">
            <caption className={cn(LABEL_CLASS, "pb-xs text-left text-foreground")}>
              {table.caption}
            </caption>
            <thead>
              <tr>
                <th className={cn(LABEL_CLASS, "py-2xs pr-md")} scope="col">
                  {table.headers.word}
                </th>
                <th className={cn(LABEL_CLASS, "py-2xs pr-md")} scope="col">
                  {table.headers.tex}
                </th>
                <th className={cn(LABEL_CLASS, "py-2xs")} scope="col">
                  {table.headers.current}
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map(row => (
                <tr className="border-border border-t" key={row.word}>
                  <th
                    className="wrap-anywhere py-2xs pr-md align-top font-medium text-foreground"
                    lang="is"
                    scope="row"
                  >
                    {row.word}
                  </th>
                  <td
                    className="wrap-anywhere py-2xs pr-md align-top font-book text-foreground"
                    lang="is"
                  >
                    {row.tex}
                  </td>
                  {/* "(same)" is English, so only a real result gets `lang="is"`. */}
                  <td
                    className="wrap-anywhere py-2xs align-top font-book text-foreground"
                    lang={row.current ? "is" : undefined}
                  >
                    {row.current ?? table.same}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={NOTE_CLASS}>{table.note}</p>
      </div>
    </>
  );
}
