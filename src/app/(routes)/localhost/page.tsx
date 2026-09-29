import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ContactFooter, HeaderBar, RevealObserver, Stripe } from "@/app/components/home";
import { SectionWrapper } from "@/app/components/home/section-wrapper";
import { TextLink } from "@/app/components/home/text-link";
import { localhostContent } from "@/lib/content/localhost";

export const metadata: Metadata = {
  title: localhostContent.hero.heading,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Unlisted index of experiments, on the notes index's shell: header bar, a
 * hero pair on columns 6–12, then the stripe wrapper holding the list and the
 * footer. Each row is `NoteRow`'s anatomy — a label-sized column on 4–5, the
 * details on 6–11 — with the experiment's number where a note has its date.
 *
 * Not linked from the footer, home page, or any nav — `robots: { index: false,
 * follow: false }` above keeps it out of search, and it is deliberately absent
 * from `sitemap.ts`.
 */
export default function Page() {
  const { hero, listHeading, experiments } = localhostContent;

  return (
    <>
      <RevealObserver />
      <HeaderBar />
      <SectionWrapper gapVariant="hero">
        <div className="lg:col-span-7 lg:col-start-6">
          <h1 className="lg:cap-trim text-balance font-regular text-display text-foreground">
            {hero.heading}
          </h1>
          <p className="lg:cap-trim text-pretty font-book text-display text-muted lg:mt-md">
            {hero.description}
          </p>
        </div>
      </SectionWrapper>
      <div className="relative mt-section">
        <Stripe />
        <SectionWrapper
          gapVariant="none"
          id="experiments-heading"
          label={listHeading}
          reveal="items"
        >
          <ul className="flex flex-col gap-md lg:col-span-8 lg:grid lg:grid-cols-subgrid lg:gap-y-md">
            {experiments.map((experiment, index) => (
              <li
                className="grid grid-cols-1 gap-sm lg:col-span-8 lg:grid lg:grid-cols-subgrid lg:items-baseline lg:gap-x-md lg:gap-y-0"
                data-reveal-item
                key={experiment.href}
                style={{ "--index": index + 1 } as CSSProperties}
              >
                <p className="min-h-[var(--year-box)] font-regular text-foreground text-label tabular-nums lg:col-span-2 lg:min-h-0">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="flex flex-col lg:col-span-6">
                  <p className="text-balance font-medium text-body text-foreground lg:min-h-row">
                    <TextLink external={experiment.external} href={experiment.href}>
                      {experiment.title}
                    </TextLink>
                  </p>
                  <p className="mt-sm text-pretty font-book text-body text-muted lg:mt-0">
                    {experiment.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionWrapper>
        <ContactFooter />
      </div>
    </>
  );
}
