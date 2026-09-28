import { AvailabilityLine } from "@/app/components/home/availability-line";
import { SectionWrapper } from "@/app/components/home/section-wrapper";

/**
 * The availability line, sitting on the introduction's own columns (6–11) so
 * it reads as that block's closing sentence rather than as a band of its own.
 *
 * That placement is the whole point. The introduction ends on "Working
 * independently since 2024", which states the arrangement but not whether
 * there is room in it; this answers that, and it only answers it if the eye
 * carries down the same measure instead of jumping to a new column.
 *
 * `mt-group` (72) rather than the `--spacing-section` rhythm every other band
 * takes. The section rhythm is 192–288 and would park this equidistant
 * between the introduction and Selected projects, where it reads as an
 * orphaned third thing belonging to neither. 72 is close enough to stay
 * attached to the paragraph above it and far enough not to look like a third
 * paragraph — the copy steps down from `--text-display` to `--text-meta`
 * across that gap, and the size change carries the separation the space does
 * not have to.
 *
 * `reveal="section"` puts it on the same scroll-gated fade as Selected
 * projects and everything below. The introduction above it is deliberately
 * excluded — it holds the LCP element — but this line is neither an LCP
 * candidate nor above the fold at any width, so it takes the same treatment
 * as the bands it sits among rather than the exception the paragraph above
 * it needs.
 */
export function Availability() {
  return (
    <SectionWrapper className="mt-group" gapVariant="none" reveal="section">
      <AvailabilityLine className="cap-trim text-pretty font-regular text-meta text-muted lg:col-span-6 lg:col-start-6" />
    </SectionWrapper>
  );
}
