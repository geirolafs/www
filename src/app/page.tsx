import {
  Availability,
  Awards,
  ContactFooter,
  Experience,
  HeaderBar,
  HowIWork,
  Introduction,
  MetalBall,
  NameRole,
  PortfolioCarousel,
  RevealObserver,
  SelectedWork,
  SiteStripe,
} from "@/app/components/home";

/**
 * Header reveals on load; content sections wait for scroll or the idle fallback.
 * The hero stays visible. The stripe runs the full page, top to bottom, so it
 * sits in a `relative isolate` wrapper around everything: its `-z-10` glow
 * stays in front of the page background, under all the text. The carousel
 * alone drops to `-z-20`, under the glow, so the glow is the one thing laid
 * over the images; see `ambient-stripe.tsx`.
 */
export default function Page() {
  return (
    <div className="relative isolate">
      <SiteStripe />
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
    </div>
  );
}
