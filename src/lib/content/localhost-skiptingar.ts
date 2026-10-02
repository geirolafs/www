/**
 * Copy for /localhost/skiptingar: the page for Icelandic hyphenation and
 * typography. It is a skeleton built from the page outline: the sections have
 * their headings and one line each, and the specimens come later. The install
 * command is left out on purpose, as the npm package is a placeholder with no
 * code yet.
 */

export const localhostSkiptingarContent = {
  page: {
    title: "Skiptingar — Icelandic text, set well",
    description: "Correct Icelandic hyphenation and typographic rules for the web.",
  },

  hero: {
    /** The name as a screen reader gets it, without the typed hyphens. */
    name: "Skiptingar",
    title: "Skipt-ing-ar",
    tagline: "Icelandic text, set well.",
    lede: "Correct Icelandic hyphenation and typographic rules for the web.",
  },

  shell: {
    navLabel: "Sections",
  },

  /** Shown in each section until its specimen is built. */
  placeholder: "Not built yet.",

  colophon: {
    label: "Colophon",
    lines: [
      [
        { text: "Set in " },
        { text: "Geist and Geist Mono", href: "https://vercel.com/font" },
        { text: " by Vercel (SIL Open Font License) and " },
        { text: "Bespoke Serif", href: "https://www.fontshare.com/fonts/bespoke-serif" },
        { text: " by Indian Type Foundry (ITF Free Font License)." },
      ],
      [
        { text: "Hyphenation patterns © 2020 Kristján Rúnarsson, " },
        {
          text: "Árni Magnússon Institute for Icelandic Studies",
          href: "https://github.com/icelandic-lt/hyphenation-is",
        },
        { text: ", built on version 1 (1985) by Baldur Jónsson and Magnús Gíslason. " },
        { text: "CC BY 4.0", href: "https://creativecommons.org/licenses/by/4.0/" },
        { text: "." },
      ],
    ],
  },

  sections: {
    tryIt: {
      id: "try-it",
      number: "A",
      nav: "Try it",
      label: "Try it",
      explanation:
        "Write your own text, change the measure and the rules, and see where it breaks.",
    },
    breaks: {
      id: "breaks",
      number: "B",
      nav: "Breaks",
      label: "Where Icelandic breaks",
      explanation:
        "Long compound words break at their joints. Patterns come first, then compound knowledge, then exceptions.",
    },
    noBreaks: {
      id: "no-breaks",
      number: "C",
      nav: "No breaks",
      label: "Where Icelandic doesn’t break",
      explanation: "Good line breaking also means knowing where not to break.",
    },
    punctuation: {
      id: "punctuation",
      number: "D",
      nav: "Punctuation",
      label: "Icelandic punctuation",
      explanation:
        "Quotes, dashes and the other Icelandic conventions, shown before and after.",
    },
    interfaces: {
      id: "interfaces",
      number: "E",
      nav: "Interfaces",
      label: "Real interfaces",
      explanation:
        "Actual interface problems, such as a heading at phone width, rather than isolated linguistic examples.",
    },
    browsers: {
      id: "browsers",
      number: "F",
      nav: "Browsers",
      label: "Same text, every browser",
      explanation:
        "Skiptingar determines where text may break. The browser determines whether it needs to.",
    },
    howItWorks: {
      id: "how-it-works",
      number: "G",
      nav: "How",
      label: "How it works",
      explanation:
        "A word goes through patterns and rules, and comes out as HTML with soft hyphens in it. The browser sets the line.",
    },
    install: {
      id: "install",
      number: "H",
      nav: "Install",
      label: "Install",
      explanation:
        "Three entry points: the JavaScript API, the React components and the client-side API.",
    },
    reference: {
      id: "reference",
      number: "I",
      nav: "Reference",
      label: "Reference",
      explanation:
        "Pattern sources, licences, browser support, bundle sizes and methodology.",
    },
  },
} as const;
