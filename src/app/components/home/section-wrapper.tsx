import type { ElementType, ReactNode } from "react";
import { SectionLabel } from "@/app/components/home/section-label";
import { cn } from "@/lib/utils";

/**
 * Shared shell for the homepage bands: the 12-column page grid, the vertical
 * rhythm between sections, and — for the 3 sections with a pill label — the
 * label and content placement on that grid.
 *
 * From the frame: the pill sits on columns 2–3 (142 → 354) and the content
 * column on 4–11 (378 → 1298). Sections without a label place their own
 * children, which is how the hero, introduction and carousel each land on
 * their own columns.
 *
 * The rhythm is `--spacing-section` (192 → 288) between every pair of bands
 * and `--spacing-hero` (352 → 416) below the header bar. The footer sets its
 * own top margin rather than going through this wrapper.
 */
const GAP_CLASS = {
  default: "mt-section",
  hero: "mt-hero",
  none: "",
} as const;

type SectionWrapperProps = {
  id?: string;
  label?: string;
  gapVariant?: keyof typeof GAP_CLASS;
  className?: string;
  /**
   * Scroll reveal, see `globals.css`. `"section"` fades the whole band in;
   * `"items"` leaves the band itself visible and defers to its own
   * `[data-reveal-item]` children so the two don't double-fade. Omit for
   * bands that opt out entirely (Introduction, the carousel — see
   * `RevealObserver`'s file comment for why).
   */
  reveal?: "section" | "items";
  children: ReactNode;
};

export function SectionWrapper({
  id,
  label,
  gapVariant = "default",
  className,
  reveal,
  children,
}: SectionWrapperProps) {
  const Tag: ElementType = label ? "section" : "div";

  return (
    <Tag
      aria-labelledby={label ? id : undefined}
      className={cn("page-grid", GAP_CLASS[gapVariant], label && "gap-y-md", className)}
      data-reveal={reveal}
    >
      {label ? (
        <SectionLabel id={id} revealItem={reveal === "items"}>
          {label}
        </SectionLabel>
      ) : null}
      {label ? (
        // `grid-cols-subgrid` hands the page grid's own tracks down, so an
        // entry row's year and details land on columns 4–5 and 6–11 without
        // any component restating a width.
        <div className="min-w-0 lg:col-span-8 lg:col-start-4 lg:grid lg:grid-cols-subgrid">
          {children}
        </div>
      ) : (
        children
      )}
    </Tag>
  );
}
