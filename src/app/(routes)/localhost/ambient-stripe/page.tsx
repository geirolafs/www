import type { Metadata } from "next";
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
} from "@/app/components/home";
import { AmbientStripeLab } from "@/app/components/localhost/ambient-stripe/ambient-stripe-lab";
import { localhostContent } from "@/lib/content/localhost";

const experiment = localhostContent.experiments.find(
  e => e.href === "/localhost/ambient-stripe"
);

export const metadata: Metadata = {
  title: experiment?.title,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * The home page, verbatim, with `Stripe` swapped for the ambient one — the
 * glow only means anything against the real page's gutter, text and images.
 * The glow runs the full page, top to bottom, so it sits in a wrapper around
 * everything rather than in the home page's below-the-hero one. That wrapper
 * is `isolate` so the glow's `-z-10` stays in front of the page background;
 * see `ambient-stripe.tsx`.
 */
export default function Page() {
  return (
    <div className="relative isolate">
      <AmbientStripeLab />
      <RevealObserver />
      <HeaderBar />
      <MetalBall />
      <NameRole />
      <div className="relative mt-section">
        <Introduction />
        <Availability />
        <SelectedWork />
        <PortfolioCarousel />
        <HowIWork />
        <Experience />
        <Awards />
        <ContactFooter />
      </div>
    </div>
  );
}
