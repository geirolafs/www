import type { ReactNode } from "react";
import { Measure } from "@/app/components/localhost/fluid-typography/measure";
import {
  LABEL_CLASS,
  NOTE_CLASS,
} from "@/app/components/localhost/fluid-typography/styles";
import { firstParagraph } from "@/app/components/localhost/skiptingar/blocks";
import { initialOutput } from "@/app/components/localhost/skiptingar/initial-output";
import {
  LiveBlock,
  PageParagraph,
} from "@/app/components/localhost/skiptingar/live-text";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
import { cn } from "@/lib/utils";

const { compare, liveEditor } = localhostSkiptingarContent;

/**
 * The slider's width, the same for all three columns. The box edge is dashed
 * to show where the lines wrap.
 */
const COLUMN_CLASS =
  "w-(--measure) max-w-full border border-border border-dashed p-2xs font-book text-body text-foreground";

function Column({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    // From `lg` up each figure spans the two rows of a subgrid: the captions
    // share the first row, so the three boxes start on one line even where a
    // hint makes one caption taller.
    // Clipped at its own edge, so a word that runs out of a box without the
    // package never widens the page.
    <figure className="flex min-w-0 flex-col gap-sm overflow-x-clip lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:items-start">
      <figcaption className="flex max-w-64 flex-col gap-1">
        <span className={LABEL_CLASS}>{label}</span>
        <span className={NOTE_CLASS}>{hint}</span>
      </figcaption>
      {children}
    </figure>
  );
}

/**
 * The first paragraph of the editor's text three ways, side by side under one
 * width slider. The first two columns show the text as typed; the third
 * follows the page settings. For the `wide` layout of section E.
 */
export function Compare() {
  const { columns } = compare;
  const initial = initialOutput(firstParagraph(liveEditor.initialText));

  return (
    <Measure className="col-span-full" initial={220} max={420} min={140} name="Compare">
      <div className="flex flex-col gap-y-xl lg:grid lg:grid-cols-3 lg:grid-rows-[auto_auto] lg:gap-x-md">
        <Column hint={columns.none.hint} label={columns.none.label}>
          <p className={cn(COLUMN_CLASS, "hyphens-manual text-wrap")} lang="is">
            <PageParagraph />
          </p>
        </Column>
        <Column hint={columns.browser.hint} label={columns.browser.label}>
          <p className={cn(COLUMN_CLASS, "hyphens-auto text-wrap")} lang="is">
            <PageParagraph />
          </p>
        </Column>
        <Column hint={columns.skiptingar.hint} label={columns.skiptingar.label}>
          <LiveBlock className={COLUMN_CLASS} initial={initial} />
        </Column>
      </div>
    </Measure>
  );
}

/**
 * The table of pattern differences, TeX against the 2020 data. It belongs to
 * the reference (section H), not to the browser comparison above, so it is
 * its own component. On a narrow screen it scrolls sideways.
 */
export function PatternTable() {
  const { table } = compare;

  return (
    // `min-w-0`: a grid item is as wide as its content by default, so the
    // table would widen the page on a phone instead of scrolling.
    <div className="flex min-w-0 flex-col gap-sm">
      <p className={cn(NOTE_CLASS, "md:hidden")}>{table.scrollHint}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-hy-note">
          <caption className={cn(LABEL_CLASS, "pb-sm text-left")}>
            {table.caption}
          </caption>
          <thead>
            <tr>
              <th className={cn(LABEL_CLASS, "py-xs pr-md text-muted")} scope="col">
                {table.headers.word}
              </th>
              <th className={cn(LABEL_CLASS, "py-xs pr-md text-muted")} scope="col">
                {table.headers.tex}
              </th>
              <th className={cn(LABEL_CLASS, "py-xs text-muted")} scope="col">
                {table.headers.current}
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map(row => (
              <tr className="border-border border-t" key={row.word}>
                <th
                  className="wrap-anywhere py-xs pr-md align-top font-medium text-foreground"
                  lang="is"
                  scope="row"
                >
                  {row.word}
                </th>
                <td
                  className="wrap-anywhere py-xs pr-md align-top font-book text-foreground"
                  lang="is"
                >
                  {row.tex}
                </td>
                {/* "(same)" is English, so only a real result gets `lang="is"`. */}
                <td
                  className="wrap-anywhere py-xs align-top font-book text-foreground"
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
  );
}
