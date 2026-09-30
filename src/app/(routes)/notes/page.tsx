import type { Metadata } from "next";
import {
  ContactFooter,
  HeaderBar,
  RevealObserver,
  SiteStripe,
} from "@/app/components/home";
import { NotesPosts } from "@/components/blog/posts";
import { SectionWrapper } from "@/components/home/section-wrapper";
import { siteConfig } from "@/lib/config/site";
import { notesContent } from "@/lib/content";

export const metadata: Metadata = {
  title: notesContent.hero.heading,
  description: notesContent.hero.description,
  alternates: {
    canonical: `${siteConfig.url}/notes`,
  },
};

/**
 * The notes index on the homepage's shell: header bar, a hero pair on
 * columns 6–12, then the wrapper holding the list and the footer. The whole
 * page sits in a `relative isolate` wrapper so the stripe spans it, top to
 * bottom, under all the text.
 *
 * The list band takes `gapVariant="none"` for the same reason the
 * Introduction does — it is the first band inside the below-hero wrapper, and
 * that wrapper carries the rhythm.
 */
export default function Page() {
  return (
    <div className="relative isolate">
      <SiteStripe />
      <RevealObserver />
      <HeaderBar />
      <SectionWrapper gapVariant="hero">
        <div className="lg:col-span-7 lg:col-start-6">
          <h1 className="lg:cap-trim text-balance font-regular text-display text-foreground">
            {notesContent.hero.heading}
          </h1>
          <p className="lg:cap-trim text-pretty font-book text-display text-muted lg:mt-md">
            {notesContent.hero.description}
          </p>
        </div>
      </SectionWrapper>
      <div className="relative mt-section">
        <NotesPosts gapVariant="none" />
        <ContactFooter />
      </div>
    </div>
  );
}
