import type { CSSProperties } from "react";
import { TextLink } from "@/app/components/home/text-link";
import type { Description, Entry } from "@/lib/content/home";

function DescriptionText({ description }: { description: Description }) {
  if (typeof description === "string") {
    return <>{description}</>;
  }

  return (
    <>
      {description.map(segment => {
        if (segment.kind === "link") {
          return (
            <TextLink external={segment.external} href={segment.href} key={segment.href}>
              {segment.label}
            </TextLink>
          );
        }
        return <span key={segment.value}>{segment.value}</span>;
      })}
    </>
  );
}

/**
 * The repeated year / title / subtitle / description row shared by Selected
 * work, Experience and Awards. Desktop: the year on columns 4–5 and the
 * details on 6–11, both inherited from the page grid via subgrid. Mobile:
 * year sits on its own row above the details; title and subtitle stack.
 *
 * The title row is a fixed `--spacing-row` (36) box against a 27.52 line, and
 * the description follows it with no gap — that is how the frame builds it,
 * and it keeps short desktop rows 36 tall before the section's row gap.
 *
 * `index` is only used to stagger the scroll reveal — see `data-reveal-item`
 * in `globals.css` — and has no bearing on layout.
 */
export function EntryRow({
  year,
  title,
  subtitle,
  description,
  index,
}: Entry & { index: number }) {
  const hasArrow = year.display.includes("▸");

  return (
    // The column gap has to stay at the page gutter. `gap-0` here does not
    // just close the space — a subgrid with its own gap re-lays the inherited
    // tracks, which slides the details column off column 6 entirely.
    //
    // `--entry-year-gap` is the space between the year and the details on
    // mobile, where they stack. Sections keep that gap smaller than the gap
    // between entries, so each date belongs clearly to its own title.
    // Desktop shares the first text baseline across the two type sizes.
    <li
      className="grid grid-cols-1 gap-[var(--entry-year-gap,var(--spacing-sm))] lg:col-span-8 lg:grid lg:grid-cols-subgrid lg:items-baseline lg:gap-x-md lg:gap-y-0"
      data-reveal-item
      style={{ "--index": index } as CSSProperties}
    >
      {/* The year's box is 22 in the mobile frame against a 20 line — that
          extra 2 lands once per entry, and there are 17 of them.

          `tabular-nums` because Same Univers ships a narrow `1` — 7.59px
          against 12.6px tabular at 20px. Every year here starts "20", so a
          row reading 2011 pulls its ▸ three pixels left of a row reading
          2015, and the arrows down the column come out ragged. Tabular pins
          all ten digits to one advance and the column resolves to a single
          x. The font has no oldstyle figures to guard against — `lnum` and
          `onum` both measure identical to the default. */}
      <p className="min-h-[var(--year-box)] font-regular text-foreground text-label tabular-nums lg:col-span-2 lg:min-h-0">
        {hasArrow ? (
          <>
            <span aria-hidden="true">{year.display}</span>
            <span className="sr-only">{year.accessible}</span>
          </>
        ) : (
          year.display
        )}
      </p>
      <div className="flex flex-col lg:col-span-6">
        {/* Mobile stacks title over subtitle with no gap — the frame runs them
            as consecutive 28px lines, so any gap here shows up multiplied
            across every entry on the page.

            Desktop puts them side by side. `flex-wrap` + a 36 box on the
            subtitle is the Awards long row: when the pair no longer fits on one
            line the subtitle drops whole to the next, and the row measures
            27.52 + 36 — the frame's 64 — instead of two shrink-wrapped
            columns. */}
        <div className="flex flex-col lg:min-h-row lg:flex-row lg:flex-wrap lg:items-baseline lg:gap-x-2xs lg:gap-y-0">
          <p className="text-balance font-medium text-body text-foreground">{title}</p>
          {subtitle ? (
            <p className="text-balance font-regular text-body text-muted lg:min-h-row">
              {subtitle}
            </p>
          ) : null}
        </div>
        {description ? (
          <p className="mt-sm text-pretty font-book text-body text-muted lg:mt-0">
            <DescriptionText description={description} />
          </p>
        ) : null}
      </div>
    </li>
  );
}
