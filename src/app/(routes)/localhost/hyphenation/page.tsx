import type { Metadata } from "next";
import { parseBlocks } from "@/app/components/localhost/hyphenation/blocks";
import { BreakEditor } from "@/app/components/localhost/hyphenation/break-editor";
import { Compare } from "@/app/components/localhost/hyphenation/compare";
import { Hero } from "@/app/components/localhost/hyphenation/hero";
import { HowItWorks } from "@/app/components/localhost/hyphenation/how-it-works";
import { initialOutput } from "@/app/components/localhost/hyphenation/initial-output";
import { Install } from "@/app/components/localhost/hyphenation/install";
import { LiveEditor } from "@/app/components/localhost/hyphenation/live-editor";
import { PlaygroundProvider } from "@/app/components/localhost/hyphenation/playground";
import { Related } from "@/app/components/localhost/hyphenation/related";
import { RichText } from "@/app/components/localhost/hyphenation/rich-text";
import {
  Acronyms,
  CardGrid,
  HeadingSample,
  LawText,
  LongParagraph,
  MixedLanguages,
  Names,
  ShortParagraph,
} from "@/app/components/localhost/hyphenation/samples";
import { Section, Specimen } from "@/app/components/localhost/hyphenation/section";
import { SettingsDock } from "@/app/components/localhost/hyphenation/settings-dock";
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
 * It is a standalone type-specimen page: a hero that says what the package is
 * for, then lettered sections that each pair a title with a specimen. It
 * shares no chrome with the rest of the site.
 *
 * The live editor's settings and text belong to the whole page
 * (`PlaygroundProvider`): the specimens that set Icelandic text follow them,
 * and the dock keeps the settings in reach further down. The comparisons
 * that show one CSS property or one typeset rule keep their own fixed
 * settings, since changing them would hide what they show.
 */
export default function Page() {
  const { sections, samplesSection: samples, liveEditor } = localhostHyphenationContent;
  // The editor's first output, block by block, with its initial settings, so
  // the server HTML already holds the processed text. A title is set in
  // heading mode.
  const initialOutputs = parseBlocks(liveEditor.initialText).map(block =>
    initialOutput(block.text, block.kind === "title" ? { mode: "heading" } : {})
  );

  return (
    <Shell hero={<Hero />}>
      {/* Copying hyphenated text puts clean text on the clipboard. */}
      <CleanCopy />

      <PlaygroundProvider>
        <Section {...sections.liveEditor} hideRule layout="free">
          <LiveEditor initialOutputs={initialOutputs} />
        </Section>

        <Section {...sections.samples} layout="side">
          <Specimen
            hint={<RichText parts={samples.sizes.hint} />}
            label={samples.sizes.label}
          >
            <Sizes />
          </Specimen>
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
          <Specimen
            hint={<RichText parts={samples.law.hint} />}
            label={samples.law.label}
          >
            <LawText />
          </Specimen>
          <Specimen
            hint={<RichText parts={samples.cards.hint} />}
            label={samples.cards.label}
          >
            <CardGrid />
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
        </Section>

        <Section {...sections.typography} layout="wide">
          <Typography />
        </Section>

        <Section {...sections.compare} layout="wide">
          <Compare />
        </Section>

        <Section {...sections.howItWorks} layout="wide">
          <HowItWorks />
        </Section>

        <Section {...sections.install} layout="side">
          <Install />
        </Section>

        <Section {...sections.breakEditor} layout="side">
          <BreakEditor />
        </Section>

        <Section {...sections.related} layout="side">
          <Related />
        </Section>

        <SettingsDock />
      </PlaygroundProvider>
    </Shell>
  );
}
