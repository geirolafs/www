import type { CSSProperties } from "react";
import { RelativeDate } from "@/components/blog/relative-date";
import { TextLink } from "@/components/home/text-link";
import { notesContent } from "@/lib/content";

type NoteRowProps = {
  slug: string;
  title: string;
  summary?: string;
  publishedAt: string;
  readingTime?: number;
  index: number;
};

/**
 * One note in the list, built on the same anatomy as the homepage's
 * `EntryRow` (`components/home/entry-row.tsx`): a label-sized column on
 * 4–5 and the details on 6–11, both inherited from the page grid via
 * subgrid, stacking on mobile.
 *
 * The mapping is deliberate and one-to-one — the date takes the year
 * column, the title takes the entry title, the reading time takes the
 * muted subtitle beside it, and the summary takes the description
 * beneath. A visitor moving from Selected work to Notes is reading the
 * same row twice, which is the whole point of aligning the two.
 *
 * It is a separate component rather than a prop on `EntryRow` because
 * only this one makes its title a link, and `Entry`'s `description`
 * union has no shape for that. Keeping them apart also keeps `EntryRow`
 * free of a `href?` nobody on the homepage would ever pass.
 *
 * The link wraps the title alone, not the row. A block-level anchor
 * around a title, a reading time and a three-line summary announces all
 * of it as one link name, and the underline — the only hover response
 * this site has — would run under the summary too.
 */
export function NoteRow({
  slug,
  title,
  summary,
  publishedAt,
  readingTime,
  index,
}: NoteRowProps) {
  return (
    // `--entry-year-gap` is not read here: the notes list sets its mobile
    // date-to-title gap directly, since it has only one rhythm to keep.
    <li
      className="grid grid-cols-1 gap-sm lg:col-span-8 lg:grid lg:grid-cols-subgrid lg:items-baseline lg:gap-x-md lg:gap-y-0"
      data-reveal-item
      style={{ "--index": index } as CSSProperties}
    >
      {/* `tabular-nums` comes from `RelativeDate` itself — the SSR date and
          the relative date it hydrates into have to sit on the same digit
          widths, and a stacked "2mo ago" / "11mo ago" column must not
          wobble. Same reasoning as the year column on the homepage. */}
      <RelativeDate
        className="min-h-[var(--year-box)] font-regular text-foreground text-label lg:col-span-2 lg:min-h-0"
        date={publishedAt}
      />
      <div className="flex flex-col lg:col-span-6">
        <div className="flex flex-col lg:min-h-row lg:flex-row lg:flex-wrap lg:items-baseline lg:gap-x-2xs lg:gap-y-0">
          <p className="text-balance font-medium text-body text-foreground">
            <TextLink href={`/notes/${slug}`}>{title}</TextLink>
          </p>
          {readingTime ? (
            <p className="text-balance font-regular text-body text-muted lg:min-h-row">
              {readingTime} {notesContent.post.readingTimeSuffix}
            </p>
          ) : null}
        </div>
        {summary ? (
          <p className="mt-sm text-pretty font-book text-body text-muted lg:mt-0">
            {summary}
          </p>
        ) : null}
      </div>
    </li>
  );
}
