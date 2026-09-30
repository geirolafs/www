import type { Metadata } from "next";
import { HomeSections } from "@/app/components/home";
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
 * The home page, verbatim, with `SiteStripe` swapped for the lab — the glow
 * only means anything against the real page's gutter, text and images.
 */
export default function Page() {
  return (
    <StripePage stripe={<AmbientStripeLab />}>
      <HomeSections />
    </StripePage>
  );
}
