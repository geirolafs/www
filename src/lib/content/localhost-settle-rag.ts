/**
 * Copy for /localhost/settle-rag: the page for paragraph rag composition. It
 * is a skeleton built from the page outline: the sections have their headings
 * and one line each, and the specimens come later. The outline's sixteen
 * headings are grouped into nine sections to fit the top bar. The install
 * command is left out on purpose, as the npm package is a placeholder with no
 * code yet.
 */

export const localhostSettleRagContent = {
  page: {
    title: "Settle Rag — A preference, not a rule",
    description: "A preference, not a rule: the whole paragraph decides.",
  },

  hero: {
    name: "Settle Rag",
    title: "Settle Rag",
    tagline: "A preference, not a rule: the whole paragraph decides.",
    lede: "Settle Rag treats a ragged text block as one form. It chooses among the break opportunities it is given, and knows no language.",
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
        { text: "ABC Areal", href: "https://abcdinamo.com/typefaces/areal" },
        { text: " by Dinamo and " },
        { text: "Bespoke Serif", href: "https://www.fontshare.com/fonts/bespoke-serif" },
        { text: " by Indian Type Foundry (ITF Free Font License)." },
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
        "Write your own paragraph, change the measure and the font size, and turn Settle on and off.",
    },
    shape: {
      id: "shape",
      number: "B",
      nav: "The shape",
      label: "The rag is a shape",
      explanation:
        "Look at the negative shape formed by all the line endings together. A rag has no ideal shape in isolation, and the common rules are instincts, not laws.",
    },
    paragraph: {
      id: "paragraph",
      number: "C",
      nav: "Paragraph",
      label: "The whole paragraph decides",
      explanation:
        "Every break changes the possibilities for everything that follows. Judge the paragraph, not the line.",
    },
    overhangTighten: {
      id: "overhang-tighten",
      number: "D",
      nav: "Overhang",
      label: "Overhang and tighten",
      explanation:
        "The two cheats a typesetter makes by hand: let a line’s last character hang past the measure, or close a line up a little so a word stays on it.",
    },
    howItWorks: {
      id: "how-it-works",
      number: "E",
      nav: "How",
      label: "How it works",
      explanation:
        "Settle Rag doesn’t determine where words may break. It determines which available breaks to use.",
    },
    browserWrapping: {
      id: "browser-wrapping",
      number: "F",
      nav: "Browsers",
      label: "Browser wrapping",
      explanation:
        "The same text under normal wrapping, text-wrap: pretty, text-wrap: balance and Settle Rag.",
    },
    install: {
      id: "install",
      number: "G",
      nav: "Install",
      label: "Install",
      explanation:
        "A simple high-level API, a React component and lower-level functions, with a small footprint and no dictionary.",
    },
    limitations: {
      id: "limitations",
      number: "H",
      nav: "Limits",
      label: "Limitations",
      explanation:
        "What it cannot do yet, such as links inside the paragraph or justified text, and what is planned.",
    },
    reference: {
      id: "reference",
      number: "I",
      nav: "Reference",
      label: "Reference",
      explanation:
        "The algorithm, the preference model, browser support, tests, benchmarks and related work.",
    },
  },
} as const;
