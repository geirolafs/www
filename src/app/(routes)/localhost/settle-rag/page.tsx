import type { Metadata } from "next";
import { Hero } from "@/app/components/localhost/fluid-typography/hero";
import { Section } from "@/app/components/localhost/fluid-typography/section";
import { Shell } from "@/app/components/localhost/fluid-typography/shell";
import { NOTE_CLASS } from "@/app/components/localhost/fluid-typography/styles";
import { subsites } from "@/lib/config/subsites";
import { localhostSettleRagContent } from "@/lib/content/localhost-settle-rag";

const {
  page: pageContent,
  hero,
  shell,
  sections,
  placeholder,
  colophon,
} = localhostSettleRagContent;

export const metadata: Metadata = {
  // `absolute` drops the site's title suffix: this page stands on its own.
  title: { absolute: pageContent.title },
  description: pageContent.description,
  // The page lives on its own host; without this it inherits the root
  // layout's canonical, which points at the home page.
  alternates: { canonical: subsites["settle-rag"].origin },
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * The page for Settle Rag: paragraph rag composition, with no language in it.
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
          // Measured at 1440px so "Settle Rag" fills its box as "Skipt-ing-ar" does (99.5%),
          // then scaled 4.6% for Areal's stylistic sets (`.hy-areal`, globals.css).
          fit={4.575}
          lede={hero.lede}
          name={hero.name}
          tagline={hero.tagline}
          title={hero.title}
        />
      }
      name={hero.name}
      navLabel={shell.navLabel}
      sections={Object.values(sections)}
      title={hero.title}
    >
      <Section {...sections.tryIt} hideRule layout="side">
        <p className={NOTE_CLASS}>{placeholder}</p>
      </Section>

      <Section {...sections.shape} layout="side">
        <p className={NOTE_CLASS}>{placeholder}</p>
      </Section>

      <Section {...sections.paragraph} layout="side">
        <p className={NOTE_CLASS}>{placeholder}</p>
      </Section>

      <Section {...sections.overhangTighten} layout="side">
        <p className={NOTE_CLASS}>{placeholder}</p>
      </Section>

      <Section {...sections.howItWorks} layout="side">
        <p className={NOTE_CLASS}>{placeholder}</p>
      </Section>

      <Section {...sections.browserWrapping} layout="side">
        <p className={NOTE_CLASS}>{placeholder}</p>
      </Section>

      <Section {...sections.install} layout="side">
        <p className={NOTE_CLASS}>{placeholder}</p>
      </Section>

      <Section {...sections.limitations} layout="side">
        <p className={NOTE_CLASS}>{placeholder}</p>
      </Section>

      <Section {...sections.reference} layout="side">
        <p className={NOTE_CLASS}>{placeholder}</p>
      </Section>
    </Shell>
  );
}
