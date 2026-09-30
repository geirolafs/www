import type { Metadata } from "next";
import {
  ContactFooter,
  HeaderBar,
  RevealObserver,
  SiteStripe,
} from "@/app/components/home";
import { SectionWrapper } from "@/app/components/home/section-wrapper";
import { ExperimentReel } from "@/app/components/localhost/experiment-reel";
import { localhostContent } from "@/lib/content/localhost";

export const metadata: Metadata = {
  title: localhostContent.hero.heading,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Unlisted index of experiments: the notes index's header bar and hero pair,
 * then a full-bleed pinned reel of the experiments (see `ExperimentReel`),
 * then the footer. The stripe spans the whole page.
 *
 * Not linked from the footer, home page, or any nav — `robots: { index: false,
 * follow: false }` above keeps it out of search, and it is deliberately absent
 * from `sitemap.ts`.
 */
export default function Page() {
  const { hero } = localhostContent;

  return (
    <div className="relative isolate">
      <SiteStripe />
      <RevealObserver />
      <HeaderBar />
      <SectionWrapper gapVariant="hero">
        <div className="lg:col-span-7 lg:col-start-6">
          <h1 className="lg:cap-trim text-balance font-regular text-display text-foreground">
            {hero.heading}
          </h1>
          {hero.description ? (
            <p className="lg:cap-trim text-pretty font-book text-display text-muted lg:mt-md">
              {hero.description}
            </p>
          ) : null}
        </div>
      </SectionWrapper>
      <div className="mt-section">
        <ExperimentReel />
      </div>
      <div className="relative">
        <ContactFooter />
      </div>
    </div>
  );
}
