import type { Metadata } from "next";
import { Hero } from "@/app/components/localhost/fluid-typography/hero";
import { Section } from "@/app/components/localhost/fluid-typography/section";
import { Shell } from "@/app/components/localhost/fluid-typography/shell";
import { NOTE_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { localhostSkiptingarContent } from "@/lib/content/localhost-skiptingar";

const {
  page: pageContent,
  hero,
  shell,
  sections,
  placeholder,
  colophon,
} = localhostSkiptingarContent;

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
 * The page for the `skiptingar` package: Icelandic hyphenation and typography.
 * A skeleton built from the page outline: the hero and the lettered sections
 * have their headings and one line each, and the specimens come in later
 * sessions. It shares no chrome with the rest of the site.
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
      <Section {...sections.tryIt} hideRule layout="side">
        <p className={NOTE_CLASS}>{placeholder}</p>
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
    </Shell>
  );
}
