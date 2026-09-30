import type { Metadata } from "next";
import { BreakEditor } from "@/app/components/localhost/hyphenation/break-editor";
import { Compare } from "@/app/components/localhost/hyphenation/compare";
import { Hero } from "@/app/components/localhost/hyphenation/hero";
import { HowItWorks } from "@/app/components/localhost/hyphenation/how-it-works";
import { LiveEditor } from "@/app/components/localhost/hyphenation/live-editor";
import { RichText } from "@/app/components/localhost/hyphenation/rich-text";
import {
  Acronyms,
  CardGrid,
  HeadingSample,
  LawText,
  LongParagraph,
  MixedLanguages,
  Names,
  NavigationSample,
  Pangram,
  ShortParagraph,
  TableSample,
} from "@/app/components/localhost/hyphenation/samples";
import { Section, Specimen } from "@/app/components/localhost/hyphenation/section";
import { Shell } from "@/app/components/localhost/hyphenation/shell";
import { Sizes } from "@/app/components/localhost/hyphenation/sizes";
import { Typography } from "@/app/components/localhost/hyphenation/typography";
import { localhostHyphenationContent } from "@/lib/content/localhost-hyphenation";
import { CleanCopy } from "@/packages/skiptingar/src/client";

const { page: pageContent } = localhostHyphenationContent;

export const metadata: Metadata = {
  // `absolute` drops the site's title suffix: this page stands on its own.
  title: { absolute: pageContent.title },
  description: pageContent.description,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * The playground for the `skiptingar` package, and its one real consumer page.
 * It is a standalone type-specimen page: a hero
 * that shows the product, then numbered sections that each pair a title with a
 * specimen. It shares no chrome with the rest of the site.
 */
export default function Page() {
  const { sections, samplesSection: samples } = localhostHyphenationContent;

  return (
    <Shell>
      {/* Copying hyphenated text puts clean text on the clipboard. */}
      <CleanCopy />
      <Hero />

      <Section
        explanation={sections.liveEditor.explanation}
        id={sections.liveEditor.id}
        label={sections.liveEditor.label}
        number={sections.liveEditor.number}
      >
        <LiveEditor />
      </Section>

      <Section
        explanation={sections.sizes.explanation}
        id={sections.sizes.id}
        label={sections.sizes.label}
        number={sections.sizes.number}
      >
        <Sizes />
      </Section>

      <Section
        explanation={sections.compare.explanation}
        id={sections.compare.id}
        label={sections.compare.label}
        number={sections.compare.number}
      >
        <Compare />
      </Section>

      <Section
        explanation={sections.howItWorks.explanation}
        id={sections.howItWorks.id}
        label={sections.howItWorks.label}
        number={sections.howItWorks.number}
      >
        <HowItWorks />
      </Section>

      <Section
        explanation={sections.samples.explanation}
        id={sections.samples.id}
        label={sections.samples.label}
        number={sections.samples.number}
      >
        <Specimen
          hint={<RichText parts={samples.heading.hint} />}
          label={samples.heading.label}
        >
          <HeadingSample />
        </Specimen>
        <Specimen
          hint={<RichText parts={samples.short.hint} />}
          label={samples.short.label}
        >
          <ShortParagraph />
        </Specimen>
        <Specimen
          hint={<RichText parts={samples.long.hint} />}
          label={samples.long.label}
        >
          <LongParagraph />
        </Specimen>
        <Specimen hint={<RichText parts={samples.law.hint} />} label={samples.law.label}>
          <LawText />
        </Specimen>
        <Specimen label={samples.cards.label}>
          <CardGrid />
        </Specimen>
        <Specimen label={samples.navigation.label}>
          <NavigationSample />
        </Specimen>
        <Specimen label={samples.table.label}>
          <TableSample />
        </Specimen>
        <Specimen
          hint={<RichText parts={samples.names.hint} />}
          label={samples.names.label}
        >
          <Names />
        </Specimen>
        <Specimen
          hint={<RichText parts={samples.mixed.hint} />}
          label={samples.mixed.label}
        >
          <MixedLanguages />
        </Specimen>
        <Specimen
          hint={<RichText parts={samples.acronyms.hint} />}
          label={samples.acronyms.label}
        >
          <Acronyms />
        </Specimen>
        <Specimen
          hint={<RichText parts={samples.pangram.hint} />}
          label={samples.pangram.label}
        >
          <Pangram />
        </Specimen>
      </Section>

      <Section
        explanation={sections.typography.explanation}
        id={sections.typography.id}
        label={sections.typography.label}
        number={sections.typography.number}
      >
        <Typography />
      </Section>

      <Section
        explanation={sections.breakEditor.explanation}
        id={sections.breakEditor.id}
        label={sections.breakEditor.label}
        number={sections.breakEditor.number}
      >
        <BreakEditor />
      </Section>
    </Shell>
  );
}
