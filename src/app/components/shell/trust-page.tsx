import { ContactFooter, HeaderBar, RevealObserver, Stripe } from "@/app/components/home";
import { AvailabilityLine } from "@/app/components/home/availability-line";
import { SectionWrapper } from "@/app/components/home/section-wrapper";
import { TextLink } from "@/app/components/home/text-link";
import type { TrustPageContent } from "@/lib/content/trust";

/**
 * Shared shell for /about, /contact and /privacy: the notes index's hero pair
 * on columns 6–12, then the stripe wrapper holding the prose on the
 * introduction's measure (columns 6–11) and the footer. One component because
 * the three pages differ only in copy — see `content/trust.ts`.
 *
 * Body copy is `text-prose` / `font-book` — multi-line paragraphs, so Book is
 * the rule — and the optional link list is `text-link` / `font-regular`,
 * single-line labels.
 */
export function TrustPage({ content }: { content: TrustPageContent }) {
  return (
    <>
      <RevealObserver />
      <HeaderBar />
      <SectionWrapper gapVariant="hero">
        <div className="lg:col-span-7 lg:col-start-6">
          <h1 className="lg:cap-trim text-balance font-regular text-display text-foreground">
            {content.title}
          </h1>
          <p className="lg:cap-trim text-pretty font-book text-display text-muted lg:mt-md">
            {content.description}
          </p>
        </div>
      </SectionWrapper>
      <div className="relative mt-section">
        <Stripe />
        <SectionWrapper gapVariant="none">
          <div className="flex flex-col gap-md lg:col-span-6 lg:col-start-6">
            {content.paragraphs.map(paragraph => (
              <p
                className="text-pretty font-book text-foreground text-prose"
                key={paragraph}
              >
                {paragraph}
              </p>
            ))}
            {content.links ? (
              <ul className="mt-md flex flex-col gap-2xs">
                {content.links.map(link => (
                  <li key={link.href}>
                    <TextLink
                      className="font-regular text-foreground text-link"
                      external={link.external}
                      href={link.href}
                    >
                      {link.label}
                    </TextLink>
                  </li>
                ))}
              </ul>
            ) : null}
            {content.showAvailability ? (
              <AvailabilityLine className="cap-trim mt-md text-pretty font-regular text-meta text-muted" />
            ) : null}
          </div>
        </SectionWrapper>
        <ContactFooter />
      </div>
    </>
  );
}
