import type { Metadata } from "next";
import { Hero } from "@/app/components/localhost/fluid-typography/hero";
import { RichText } from "@/app/components/localhost/fluid-typography/rich-text";
import { Section, Specimen } from "@/app/components/localhost/fluid-typography/section";
import { Shell } from "@/app/components/localhost/fluid-typography/shell";
import { parseBlocks } from "@/app/components/localhost/skiptingar/blocks";
import { Breaks } from "@/app/components/localhost/skiptingar/breaks";
import { Compare, PatternTable } from "@/app/components/localhost/skiptingar/compare";
import { HeroDemo } from "@/app/components/localhost/skiptingar/hero-demo";
import { HeroStats } from "@/app/components/localhost/skiptingar/hero-stats";
import { HowItWorks } from "@/app/components/localhost/skiptingar/how-it-works";
import { initialOutput } from "@/app/components/localhost/skiptingar/initial-output";
import { Install } from "@/app/components/localhost/skiptingar/install";
import { LiveEditor } from "@/app/components/localhost/skiptingar/live-editor";
import { PlaygroundProvider } from "@/app/components/localhost/skiptingar/playground";
import { Reference } from "@/app/components/localhost/skiptingar/reference";
import { Related } from "@/app/components/localhost/skiptingar/related";
import {
  CardGrid,
  HeadingSample,
  MixedLanguages,
} from "@/app/components/localhost/skiptingar/samples";
import { SettingsDock } from "@/app/components/localhost/skiptingar/settings-dock";
import { Sizes } from "@/app/components/localhost/skiptingar/sizes";
import { Typography } from "@/app/components/localhost/skiptingar/typography";
import { subsites } from "@/lib/config/subsites";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
// deep import: the client barrel re-exports code this page must not load; a slimmer `exports` entry replaces this at publish
import { CleanCopy } from "@/packages/skiptingar/src/client/clean-copy";

const {
  page: pageContent,
  hero,
  shell,
  sections,
  colophon,
  liveEditor,
  samplesSection: samples,
} = localhostSkiptingarContent;

// The editor's first output, block by block, with its initial settings, so the
// server HTML already holds the processed text.
const initialOutputs = parseBlocks(liveEditor.initialText).map(block =>
  initialOutput(block.text)
);

export const metadata: Metadata = {
  // `absolute` drops the site's title suffix: this page stands on its own.
  title: { absolute: pageContent.title },
  description: pageContent.description,
  // The page lives on its own host; without this it inherits the root
  // layout's canonical, which points at the home page.
  alternates: { canonical: subsites.skiptingar.origin },
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * The page for the `skiptingar` package: Icelandic hyphenation and typography.
 * A hero that shows the same text without and with the package, then the
 * lettered sections of the page outline, each a title and its specimens.
 * The editor's settings and text belong to the whole page
 * (`PlaygroundProvider`): the specimens that set Icelandic text follow them,
 * and the dock keeps the settings in reach further down. The comparisons that
 * show one rule keep their own fixed settings. It shares no chrome with the
 * rest of the site.
 */
export default function Page() {
  return (
    <Shell
      colophon={colophon}
      hero={
        <Hero
          demo={<HeroDemo />}
          lang="is"
          lede={hero.lede}
          name={hero.name}
          stats={<HeroStats />}
          tagline={hero.tagline}
          title={hero.title}
          wash
        />
      }
      lang="is"
      name={hero.name}
      navLabel={shell.navLabel}
      sections={Object.values(sections)}
      title={hero.title}
    >
      {/* Copying hyphenated text puts clean text on the clipboard. */}
      <CleanCopy />

      <PlaygroundProvider>
        <Section {...sections.tryIt} hideRule layout="free">
          <LiveEditor initialOutputs={initialOutputs} />
        </Section>

        <Section {...sections.breaks} layout="side">
          <Breaks />
        </Section>

        <Section {...sections.noBreaks} layout="wide">
          <Typography set="noBreak" />
        </Section>

        <Section {...sections.interfaces} layout="side">
          <Specimen
            hint={<RichText parts={samples.heading.hint} />}
            label={samples.heading.label}
          >
            <HeadingSample />
          </Specimen>
          <Specimen
            hint={<RichText parts={samples.cards.hint} />}
            label={samples.cards.label}
          >
            <CardGrid />
          </Specimen>
          <Specimen
            hint={<RichText parts={samples.mixed.hint} />}
            label={samples.mixed.label}
          >
            <MixedLanguages />
          </Specimen>
          <Specimen
            hint={<RichText parts={samples.sizes.hint} />}
            label={samples.sizes.label}
          >
            <Sizes />
          </Specimen>
        </Section>

        <Section {...sections.browsers} layout="wide">
          <Compare />
        </Section>

        <Section {...sections.howItWorks} layout="wide">
          <HowItWorks />
        </Section>

        <Section {...sections.install} layout="side">
          <Install />
        </Section>

        <Section {...sections.reference} layout="side">
          <PatternTable />
          <Related />
          <Reference />
        </Section>

        <SettingsDock />
      </PlaygroundProvider>
    </Shell>
  );
}
