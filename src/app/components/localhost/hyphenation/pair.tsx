import type { ReactNode } from "react";
import { Measure } from "@/app/components/localhost/hyphenation/measure";
import { LABEL_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { cn } from "@/lib/utils";

const { pair } = localhostHyphenationContent;

/**
 * The box both sides share: the slider's width, dashed so the edge the lines
 * wrap against is visible. `border-box`, so the readout is the box's width.
 */
export const PAIR_BOX =
  "w-(--measure) max-w-full border border-border border-dashed p-sm";

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
    // Clipped at its own edge: text that runs out of the box without the
    // package shows past the dashed line, but never widens the page.
    <figure className="flex min-w-0 flex-1 flex-col gap-xs overflow-x-clip">
      <figcaption className="flex flex-wrap items-baseline gap-x-xs">
        <span className={LABEL_CLASS}>{label}</span>
        <span className="font-book text-hy-note text-muted">{caption}</span>
      </figcaption>
      {children}
    </figure>
  );
}

type PairProps = {
  /** The starting width in px: one where the difference shows at once. */
  initial: number;
  /** The specimen's name, for the slider's accessible name. */
  name?: string;
  min?: number;
  max?: number;
  /**
   * One above the other instead of side by side. For text that overflows its
   * box without the package, so the overflow does not run into the other side.
   */
  stack?: boolean;
  /** The text as the browser sets it alone. */
  without: ReactNode;
  /** The same text with skiptingar and the page settings. */
  with: ReactNode;
};

/**
 * One text twice under one width slider: as the browser sets it alone, then
 * with skiptingar. Drag the width and both sides move together, so the
 * difference is seen happening, not claimed.
 */
export function Pair({
  initial,
  name,
  min,
  max,
  stack,
  without,
  with: withPackage,
}: PairProps) {
  return (
    <Measure initial={initial} max={max} min={min} name={name}>
      <div
        className={cn(
          "flex flex-col gap-xl md:gap-md",
          !stack && "md:flex-row",
          stack && "md:gap-xl"
        )}
      >
        <Side caption={pair.withoutCaption} label={pair.without}>
          {without}
        </Side>
        <Side caption={pair.withCaption} label={pair.with}>
          {withPackage}
        </Side>
      </div>
    </Measure>
  );
}
