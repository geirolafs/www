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
 * The home page, verbatim, with `SiteStripe` swapped for the lab — the glow
 * only means anything against the real page's gutter, text and images. The
 * glow runs the full page, top to bottom, so it sits in a wrapper around
 * everything, as it does on the site. That wrapper
 * is `isolate` so the glow's `-z-10` stays in front of the page background,
 * under all the text. The carousel alone drops to `-z-20`, under the glow, so
 * the glow is the one thing laid over the images; see `ambient-stripe.tsx`.
 */
export default function Page() {
  return (
    <div className="relative isolate">
      <AmbientStripeLab />
      <RevealObserver />
      <HeaderBar />
      <MetalBall />
      <NameRole />
      {/* The carousel below sits at `-z-20`, and a negative layer loses hit
          tests to the in-flow boxes between it and the isolated wrapper, this
          one included. So this box takes no pointer events of its own and
          hands them back to its sections, and the carousel stays
          scrollable. */}
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
