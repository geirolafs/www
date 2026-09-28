import { CarouselStrip } from "@/app/components/home/carousel-strip";
import { SectionWrapper } from "@/app/components/home/section-wrapper";

/**
 * The portfolio strip: full-bleed to the right edge, starting at the gutter.
 *
 * The section stays a server component so the wrapper and the page grid render
 * on the server as every other band does. Only the strip itself is client-side,
 * because the order is drawn per visit — see `CarouselStrip`.
 */
export function PortfolioCarousel() {
  return (
    <SectionWrapper>
      <CarouselStrip />
    </SectionWrapper>
  );
}
