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
  Stripe,
} from "@/app/components/home";

/**
 * Header reveals on load; content sections wait for scroll or the idle fallback.
 * The hero stays visible. The stripe owns its separate scroll threshold.
 */
export default function Page() {
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
          Introduction: the stripe spans the wrapper, and the frame starts it
          at the top of the introduction — not 172px above it. */}
      <div className="relative mt-section">
        <Stripe />
        <Introduction />
        <Availability />
        <SelectedWork />
        <PortfolioCarousel />
        <HowIWork />
        <Experience />
        <Awards />
        <ContactFooter />
      </div>
    </>
  );
}
