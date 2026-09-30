import type { Metadata } from "next";
import {
  Availability,
  Awards,
  Experience,
  HowIWork,
  Introduction,
  MetalBall,
  NameRole,
  PortfolioCarousel,
  RevealObserver,
  SelectedWork,
} from "@/app/components/home";
import { AmbientStripeLab } from "@/app/components/localhost/ambient-stripe/ambient-stripe-lab";
import { StripePage } from "@/app/components/shell/stripe-page";
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
 * The home page's body, minus the site's header bar and footer, with
 * `SiteStripe` swapped for the lab — the glow only means anything against the
 * real page's gutter, text and images. The sections and the wrapper around
 * them mirror `HomeSections`; keep the two in step.
 */
export default function Page() {
  return (
    <StripePage stripe={<AmbientStripeLab />}>
      <RevealObserver />
      <MetalBall />
      <NameRole />
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
      </div>
    </StripePage>
  );
}
