import { AvailabilityLine } from "@/app/components/home/availability-line";
import { SectionWrapper } from "@/app/components/home/section-wrapper";

/**
 * The introduction's closing sentence: it sits on the same columns (6–11) so
 * the eye carries down one measure, answering "is there room?" right after
 * "working independently since 2024".
 *
 * `mt-group` (72), not the section rhythm (192–288), which would leave it
 * floating between two bands belonging to neither. It takes the scroll-gated
 * reveal like the bands below; only the introduction, which holds the LCP
 * element, is exempt.
 */
export function Availability() {
  return (
    <SectionWrapper className="mt-group" gapVariant="none" reveal="section">
      <AvailabilityLine className="cap-trim text-pretty font-regular text-meta text-muted lg:col-span-6 lg:col-start-6" />
    </SectionWrapper>
  );
}
