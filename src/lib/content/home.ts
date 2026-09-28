import { siteConfig } from "@/lib/config/site";

/**
 * Homepage copy, harvested verbatim from Figma frames `1912:4822` (desktop,
 * 1440) and `1912:5781` (mobile, 402).
 *
 * Two copy bugs in the frames are fixed here, not carried over:
 *   1. Selected work / Sjóvá description: frame says "it's highest", shipped
 *      as "its highest".
 *   2. The introduction's stray pasted layer ("Gangverk respects your
 *      privacy...") is not content and is omitted entirely.
 */

// ---- Header bar -----------------------------------------------------------

/**
 * The time itself is live — see `LocalClock`. `timezone` is now only the
 * fallback shown until the visitor's own zone is known, and to the visitors who
 * share it; everyone else gets their own time and the gap. See `VisitorTime`.
 */
export interface HeaderBarContent {
  location: string;
  timezone: string;
}

export const headerBarContent: HeaderBarContent = {
  location: "Reykjavík, Iceland",
  timezone: "GMT ( UTC+0 )",
};

// ---- Availability -----------------------------------------------------------

/**
 * The month is deliberately absent. It is not copy — it rolls forward on its
 * own, so `Availability` computes it and completes the sentence as
 * `${lead} ${month}.`
 *
 * A hardcoded month has exactly one failure mode and it is the expensive one:
 * the day it goes stale, the site reads as closed to anyone who lands on it,
 * and nobody writes to ask. The auto-rolling month can only fail the other
 * way — someone enquires about a month that is fuller than the line implies,
 * and that is a reply, not a lost enquiry.
 */
export interface AvailabilityContent {
  lead: string;
  email: string;
}

export const availabilityContent: AvailabilityContent = {
  lead: "Available for select projects from",
  email: siteConfig.email,
};

// ---- Name + role -----------------------------------------------------------

export interface HeroContent {
  name: string;
  role: string;
}

export const heroContent: HeroContent = {
  name: "Geir Ólafsson",
  role: "Design engineer and creative director",
};

// ---- Introduction -----------------------------------------------------------

export interface IntroductionContent {
  paragraphs: readonly string[];
}

export const introductionContent: IntroductionContent = {
  paragraphs: [
    "For fifteen years I’ve worked for Icelandic institutions in finance, energy and culture. One of the country’s largest banks, the national power company and an insurer whose customer satisfaction went from last in its sector to first.",
    "Now I design the system and ship the frontend myself. Working independently since 2024.",
  ],
};

// ---- Shared entry-row shape -------------------------------------------------

/**
 * A year or year range as it appears in the frames. `display` carries the
 * decorative `▸` glyph and is hidden from assistive tech; `accessible` is the
 * plain-text equivalent read out instead.
 */
export interface YearRange {
  display: string;
  accessible: string;
}

export type DescriptionSegment =
  | { kind: "text"; value: string }
  | { kind: "link"; label: string; href: string; external?: boolean };

export type Description = string | readonly DescriptionSegment[];

export interface Entry {
  year: YearRange;
  title: string;
  subtitle?: string;
  description?: Description;
}

// ---- Selected work -----------------------------------------------------------

export interface WorkSectionContent {
  label: string;
  entries: readonly Entry[];
}

export const selectedWorkContent: WorkSectionContent = {
  label: "Selected projects",
  entries: [
    {
      year: { display: "2026 ▸", accessible: "2026 to present" },
      title: "Magni",
      subtitle: "industrial IoT platform, a Héðinn company",
      description: [
        {
          kind: "text",
          value:
            "Brand strategy, marketing site and collateral. Identity system, colour scheme, typography, infographics and copy. ",
        },
        {
          kind: "link",
          label: "magni-app.is",
          href: "https://magni-app.is",
          external: true,
        },
      ],
    },
    {
      year: { display: "2025 ▸", accessible: "2025 to present" },
      title: "Gangverk",
      subtitle: "digital product studio, Reykjavík and New York",
      description: [
        { kind: "text", value: "Design and principal development of " },
        {
          kind: "link",
          label: "gangverk.com",
          href: "https://gangverk.com",
          external: true,
        },
        {
          kind: "text",
          value:
            " Art direction, type system, motion and the production frontend. Next.js, React, TypeScript, WebGL, scroll-driven theming, 28 routes.",
        },
      ],
    },
    {
      // Two separate engagements, seven years apart. The label carries the
      // recent one — `2011 ▸ 23` implied one continuous run and put a 2011 in
      // the middle of the column; the earlier stint lives in the description.
      year: { display: "2021 ▸ 23", accessible: "2021 to 2023" },
      title: "Iceland Symphony Orchestra",
      description:
        "Designer and art director 2011 – 2014, creative director 2021 – 2023. Seasonal visual identities, concert marketing and campaigns across a decade of programming.",
    },
    {
      year: { display: "2019 ▸ 23", accessible: "2019 to 2023" },
      title: "Landsbankinn",
      subtitle: "one of Iceland’s largest banks",
      description:
        "Art director 2019 – 2021, creative director 2021 – 2023. Led creative direction for the bank’s communication and branding, including a full visual identity refresh in 2022 and nationwide campaigns.",
    },
    {
      year: { display: "2015 ▸ 22", accessible: "2015 to 2022" },
      title: "Sjóvá",
      subtitle: "among the three largest Icelandic insurers",
      description:
        "Art director 2015 – 2020, creative director 2020 – 2022. Led the 2015 rebrand. The company moved from the lowest customer satisfaction ratings in its sector in 2015 to the highest by 2017.",
    },
    {
      year: { display: "2014 ▸ 20", accessible: "2014 to 2020" },
      title: "Landsvirkjun",
      subtitle: "Iceland’s national power company",
      description:
        "Art director and communication design. Annual, environmental and sustainability reports in print and digital, corporate communication materials.",
    },
  ],
};

// ---- Portfolio carousel -------------------------------------------------

/**
 * The carousel carries no copy. Its media comes from the UploadThing manifest
 * — see `content/portfolio.ts` — and its order is drawn per visit in
 * `CarouselStrip`, so there is nothing to declare here.
 */

// ---- How I work -----------------------------------------------------------

/**
 * The second prose band, below the carousel. Same shape as the introduction —
 * paragraphs on the same measure, set the same way — but this one carries a
 * pill label, because by this point in the page the visitor has passed three
 * labelled sections and an unlabelled block would read as a stray one.
 *
 * The third paragraph and the footer's colophon both say the typeface
 * is his and unfinished. That repetition is deliberate: this one is part of
 * the argument about how he works, the footer one is a credit, and they are
 * 500px apart with different readers.
 */
export interface HowIWorkContent {
  label: string;
  paragraphs: readonly string[];
}

export const howIWorkContent: HowIWorkContent = {
  label: "How I work",
  paragraphs: [
    "I work on the whole thing. The strategy, the identity, the typography, the interface, and the code that ships it. That used to be two or three people and a handoff; now it’s one person and a shorter argument.",
    "Most of what I do starts in a text file and ends in a repository. I design in the browser as much as in Figma, because the questions that matter (how something behaves at 13px, on a slow connection, in motion) only have real answers there.",
    "I draw typefaces. This site is set in one of mine, still unfinished.",
  ],
};

// ---- Experience -----------------------------------------------------------

export interface ExperienceSectionContent {
  label: string;
  entries: readonly Entry[];
}

/**
 * Ordered by start year, newest first. The label leads with the start year, so
 * this is the number the eye scans down the column — sorting on anything else
 * leaves it looking unsorted whatever the underlying rule is.
 *
 * Three of these ran concurrently with a full-time role. Sorting on start year
 * drops them into the middle of the list even where they ran on much later,
 * so the "in parallel" subtitle marks them and their end year stays visible in
 * the label.
 */
export const experienceContent: ExperienceSectionContent = {
  label: "Work",
  entries: [
    {
      year: { display: "2024 ▸", accessible: "2024 to present" },
      title: "Independent practice",
      subtitle: "brand, product and code",
    },
    {
      year: { display: "2021 ▸ 24", accessible: "2021 to 2024" },
      title: "Creative director",
      subtitle: "Aton",
    },
    {
      year: { display: "2018 ▸ 19", accessible: "2018 to 2019" },
      title: "Course instructor",
      subtitle: "Iceland Academy of the Arts, in parallel",
    },
    {
      year: { display: "2015 ▸ 21", accessible: "2015 to 2021" },
      title: "Art director",
      subtitle: "Jónsson & Le'macks",
    },
    {
      year: { display: "2013 ▸ 16", accessible: "2013 to 2016" },
      title: "Founding member",
      subtitle: "Børk Design Studio, in parallel",
    },
    {
      year: { display: "2011 ▸ 25", accessible: "2011 to 2025" },
      title: "Design and art direction",
      subtitle: "Gallery Port, in parallel",
    },
    {
      year: { display: "2011 ▸ 15", accessible: "2011 to 2015" },
      title: "Graphic designer",
      subtitle: "Jónsson & Le'macks",
    },
  ],
};

// ---- Awards -----------------------------------------------------------

export interface AwardsSectionContent {
  label: string;
  entries: readonly Entry[];
}

export const awardsContent: AwardsSectionContent = {
  label: "Awards",
  entries: [
    {
      year: { display: "2017", accessible: "2017" },
      title: "Icelandic Web Awards",
      subtitle: "Sjóvá",
    },
    {
      year: { display: "2013", accessible: "2013" },
      title: "Red Dot Design Award",
      subtitle: "communication design, packaging, Katla vodka",
    },
    {
      year: { display: "2012", accessible: "2012" },
      title: "Art Directors Club of Europe",
      subtitle: "Silver, open category",
    },
    {
      year: { display: "2012 ▸ 16", accessible: "2012 to 2016" },
      title: "Various awards from FÍT the Icelandic Design Association",
      subtitle: "branding, information design, posters and book covers",
    },
  ],
};

// ---- Contact + footer -------------------------------------------------

export interface ContactLink {
  label: string;
  href: string;
  external?: boolean;
  weight: "regular" | "medium";
  /**
   * Withheld from the footer while the route behind it is not ready. The entry
   * stays in this list for later publication. Visible links flow together;
   * flip to `false` (or delete the flag) to publish.
   */
  hidden?: boolean;
}

export interface ContactFooterContent {
  name: string;
  copyright: string;
  colophon: string;
  links: readonly ContactLink[];
}

export const contactFooterContent: ContactFooterContent = {
  name: siteConfig.name,
  copyright: "© 2024 - 2026",
  colophon: "The font used on this website is my custom creation and a work in progress",
  links: [
    {
      label: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
      weight: "regular",
    },
    {
      label: "download cv",
      href: siteConfig.cv.path,
      weight: "regular",
    },
    {
      label: "/ notes",
      href: "/notes",
      weight: "regular",
      hidden: true,
    },
    {
      label: "/ localhost",
      href: "/localhost",
      weight: "regular",
      hidden: true,
    },
    {
      label: "linkedin",
      href: siteConfig.social.linkedin,
      external: true,
      weight: "regular",
    },
    {
      label: "github",
      href: siteConfig.social.github,
      external: true,
      weight: "regular",
    },
  ],
};
