import type { ReactNode } from "react";
import { LABEL_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { Tip } from "@/app/components/localhost/hyphenation/tip";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";
import { Hyphenate } from "@/packages/skiptingar/src/react";

const { compare } = localhostHyphenationContent;

/**
 * Narrow on purpose to force breaks: this is a demo constraint, not a design
 * value, so it is not a token. The box edge is dashed to show where lines wrap.
 */
const COLUMN_CLASS =
  "max-w-[11rem] border border-border border-dashed p-2xs font-book text-body text-foreground";

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
    <figure className="flex flex-col gap-2xs">
      <figcaption className="max-w-[11rem]">
        <Tip className={cn(LABEL_CLASS, "text-foreground")} tip={tip}>
          {label}
        </Tip>
        {hint ? (
          <span className="block font-regular text-label text-muted">{hint}</span>
        ) : null}
      </figcaption>
      {children}
    </figure>
  );
}

/** The same paragraph three ways, then the table of pattern differences. */
export function Compare() {
  const { columns, table, text } = compare;

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-wrap gap-md">
        <Column label={columns.none.label} tip={columns.none.tip}>
          <p className={cn(COLUMN_CLASS, "hyphens-manual")} lang="is">
            {text}
          </p>
        </Column>
        <Column
          hint={columns.browser.hint}
          label={columns.browser.label}
          tip={columns.browser.tip}
        >
          <p className={cn(COLUMN_CLASS, "hyphens-auto")} lang="is">
            {text}
          </p>
        </Column>
        <Column label={columns.skiptingar.label} tip={columns.skiptingar.tip}>
          <Hyphenate>
            <p className={cn(COLUMN_CLASS, "hyphens-manual")} lang="is">
              {text}
            </p>
          </Hyphenate>
        </Column>
      </div>

      <div className="flex flex-col gap-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-meta">
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
                    className="wrap-anywhere py-2xs pr-md align-top font-semibold text-foreground"
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
        <p className="text-pretty font-book text-meta text-muted">{table.note}</p>
      </div>
    </div>
  );
}
