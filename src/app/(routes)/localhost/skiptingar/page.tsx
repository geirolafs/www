import type { Metadata } from "next";
import { Hero } from "@/app/components/localhost/fluid-typography/hero";
import { Section } from "@/app/components/localhost/fluid-typography/section";
import { Shell } from "@/app/components/localhost/fluid-typography/shell";
import { NOTE_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { parseBlocks } from "@/app/components/localhost/skiptingar/blocks";
import { initialOutput } from "@/app/components/localhost/skiptingar/initial-output";
import { LiveEditor } from "@/app/components/localhost/skiptingar/live-editor";
import { PlaygroundProvider } from "@/app/components/localhost/skiptingar/playground";
import { SettingsDock } from "@/app/components/localhost/skiptingar/settings-dock";
import { subsites } from "@/lib/config/subsites";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";
// deep import: the client barrel re-exports code this page must not load; a slimmer `exports` entry replaces this at publish
import { CleanCopy } from "@/packages/skiptingar/src/client/clean-copy";

const {
  page: pageContent,
  hero,
  shell,
  sections,
  placeholder,
  colophon,
  liveEditor,
} = localhostSkiptingarContent;

// The editor's first output, block by block, with its initial settings, so the
// server HTML already holds the processed text. A title is set in heading mode.
const initialOutputs = parseBlocks(liveEditor.initialText).map(block =>
  initialOutput(block.text, block.kind === "title" ? { mode: "heading" } : {})
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
 * Built from the page outline: the hero and the lettered sections have their
 * headings and one line each, and the specimens come in a section at a time.
 * Try it is live. The editor's settings and text belong to the whole page
 * (`PlaygroundProvider`), and the dock keeps the settings in reach further
 * down. It shares no chrome with the rest of the site.
 */
export default function Page() {
  return (
    <Shell
      colophon={colophon}
      hero={
        <Hero
          lang="is"
          lede={hero.lede}
          name={hero.name}
          tagline={hero.tagline}
          title={hero.title}
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
          <p className={NOTE_CLASS}>{placeholder}</p>
        </Section>

        <Section {...sections.noBreaks} layout="side">
          <p className={NOTE_CLASS}>{placeholder}</p>
        </Section>

        <Section {...sections.punctuation} layout="side">
          <p className={NOTE_CLASS}>{placeholder}</p>
        </Section>

        <Section {...sections.interfaces} layout="side">
          <p className={NOTE_CLASS}>{placeholder}</p>
        </Section>

        <Section {...sections.browsers} layout="side">
          <p className={NOTE_CLASS}>{placeholder}</p>
        </Section>

        <Section {...sections.howItWorks} layout="side">
          <p className={NOTE_CLASS}>{placeholder}</p>
        </Section>

        <Section {...sections.install} layout="side">
          <p className={NOTE_CLASS}>{placeholder}</p>
        </Section>

        <Section {...sections.reference} layout="side">
          <p className={NOTE_CLASS}>{placeholder}</p>
        </Section>

        <SettingsDock />
      </PlaygroundProvider>
    </Shell>
  );
}
