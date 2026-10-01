import {
  ITEM_TITLE_CLASS,
  LABEL_CLASS,
  NOTE_CLASS,
} from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";

const { cost } = localhostHyphenationContent.install;

/** One scale for every group, so the bars compare across jobs too. */
const MAX_KB = Math.max(
  ...cost.groups.flatMap(group => group.items.map(item => item.kB))
);

const format = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

/**
 * What each setup downloads, as an emphasis bar chart: Skiptingar's rows in
 * the accent, the alternatives in grey, one kB scale for all. Every row is
 * text first (name, how it sets the result, what it covers, value), so it
 * reads as a list without the bars, which are decoration (`aria-hidden`).
 * The shaded row is the hover state. Bars end square, like every
 * box on the page; a setup that downloads nothing gets a hairline at zero.
 */
export function CostChart() {
  return (
    <div className="flex flex-col gap-xl">
      {cost.groups.map(group => (
        <section
          aria-labelledby={`${cost.id}-${group.id}`}
          className="flex flex-col gap-sm"
          key={group.id}
        >
          <h4 className={LABEL_CLASS} id={`${cost.id}-${group.id}`}>
            {group.label}
          </h4>
          <ul className="flex flex-col">
            {group.items.map(item => (
              <li
                className="flex flex-col gap-xs border-border border-t py-sm transition-colors duration-150 hover:bg-hy-surface md:grid md:grid-cols-3 md:items-center md:gap-x-md"
                key={item.id}
              >
                <div className="flex flex-col">
                  <span className={cn(ITEM_TITLE_CLASS, !item.own && "font-book")}>
                    {item.label}
                  </span>
                  {/* How it sets the result, in one phrase pattern per job, so
                      the rows can be compared by method as well as by size. */}
                  <span className="font-book text-foreground text-hy-note">
                    {item.method}
                  </span>
                  <span className={NOTE_CLASS}>{item.note}</span>
                </div>
                {/* The value sits at the bar's tip. The bar's share of the
                    scale leaves room for the longest value after it. */}
                <div className="flex items-center gap-xs md:col-span-2">
                  <div
                    aria-hidden="true"
                    className={cn(
                      "h-4 shrink-0",
                      item.own ? "bg-hy-signal" : "bg-border",
                      item.kB === 0 && "w-0.5"
                    )}
                    // A share of the scale, from the data, not a design token.
                    style={
                      item.kB === 0
                        ? undefined
                        : { width: `calc((100% - 4.5rem) * ${item.kB / MAX_KB})` }
                    }
                  />
                  <span className="shrink-0 font-medium text-foreground text-hy-note tabular-nums">
                    {format.format(item.kB)}
                    {"\u00a0"}
                    {cost.unit}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className={cn(NOTE_CLASS, "max-w-measure")}>{cost.note}</p>
    </div>
  );
}
