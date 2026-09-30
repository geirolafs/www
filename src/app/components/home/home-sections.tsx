import { Availability } from "./availability";
import { ContactFooter } from "./contact-footer";
import { Awards, Experience, SelectedWork } from "./entry-section";
import { HeaderBar } from "./header-bar";
import { HowIWork } from "./how-i-work";
import { Introduction } from "./introduction";
import { MetalBall } from "./metal-ball";
import { NameRole } from "./name-role";
import { PortfolioCarousel } from "./portfolio-carousel";
import { RevealObserver } from "./reveal-observer";

/**
 * The home page body, without the stripe: the real page renders it under
 * `SiteStripe`, the localhost lab under `AmbientStripeLab`.
 *
 * Header reveals on load; content sections wait for scroll or the idle fallback.
 * The hero stays visible. The carousel alone drops to `-z-20`, under the stripe's
 * `-z-10` glow, so the glow is the one thing laid over the images; see
 * `ambient-stripe.tsx`.
 */
export function HomeSections() {
  return (
    <>
      <RevealObserver />
      <HeaderBar />
      {/* Not a reveal target either: it is a static render until the visitor
          moves a pointer, and hiding it on load would only delay the one
          thing above the fold that never fades. See `metal-ball.tsx`. */}
      <MetalBall />
      <NameRole />
      {/* The rhythm below the hero belongs to this wrapper, not to the
          Introduction. The carousel below sits at `-z-20`, and a negative
          layer loses hit tests to the in-flow boxes between it and the
          isolated wrapper, this one included. So this box takes no pointer
          events of its own and hands them back to its sections, and the
          carousel stays scrollable. */}
      <div className="pointer-events-none relative mt-section [&>*]:pointer-events-auto">
        <Introduction />
        <Availability />
        <SelectedWork />
        <div className="relative -z-20">
          <PortfolioCarousel />
        </div>
        <HowIWork />
        <Experience />
        <Awards />
        <ContactFooter />
      </div>
    </>
  );
}
