/**
 * Copy for /localhost/skiptingar: the page for Icelandic hyphenation and
 * typography. The Icelandic texts are the samples; the English strings are the
 * page's own labels. The copy that client components read (the Try it editor,
 * the width slider, the break editor) is defined in
 * `localhost-skiptingar-client.ts`. The exception line in `breakEditor` there
 * is the format of `src/packages/skiptingar/data/exceptions.txt`. The install
 * command is left out on purpose, as the npm package is a placeholder with no
 * code yet.
 */

import { localhostSkiptingarClientContent } from "@/lib/content/localhost-skiptingar-client";
import sizes from "@/packages/skiptingar/sizes.json";

/** A size from `bun run size` (sizes.json), in kB brotli, unit kept with the number. */
const kB = (setup: keyof typeof sizes) => `${sizes[setup].brotli}\u00a0kB`;

const njallSample =
  "Mörður hét maður er kallaður var gígja. Hann var sonur Sighvats hins rauða. Hann bjó á Velli á Rangárvöllum. Hann var ríkur höfðingi og málafylgjumaður mikill og svo mikill lögmaður að engir þóttu löglegir dómar dæmdir nema hann væri við. Hann átti dóttur eina er Unnur hét. Hún var væn kona og kurteis og vel að sér og þótti sá bestur kostur á Rangárvöllum.";

const samples = {
  jonas:
    "Ísland, farsældafrón og hagsælda, hrímhvíta móðir! Hvar er þín fornaldarfrægð, frelsið og manndáðin best?",
  njall: njallSample,
  constitution: {
    first: "Ísland er lýðveldi með þingbundinni stjórn.",
    second:
      "Alþingi og forseti Íslands fara saman með löggjafarvaldið. Forseti og önnur stjórnarvöld samkvæmt stjórnarskrá þessari og öðrum landslögum fara með framkvæmdarvaldið. Dómendur fara með dómsvaldið.",
  },
  credits: {
    jonas: "Jónas Hallgrímsson, „Ísland“ (Fjölnir 1835), með nútímastafsetningu",
    njall: "Brennu-Njáls saga, 1. kafli",
    constitution: "Stjórnarskrá lýðveldisins Íslands, 1. og 2. gr.",
  },
} as const;

export const localhostSkiptingarContent = {
  // The copy that client components read (`marks`, `tips`, `liveEditor`,
  // `breakEditor`) is defined in its own file; client code imports that file.
  ...localhostSkiptingarClientContent,
  samples,

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

    /**
     * One title and paragraph, as the browser sets it alone and with the
     * package, drawn as a figure: each side's notes sit in its margin, on the
     * line they point at. A note shows only when the layout bears it out.
     */
    demo: {
      label: "The same text in the same narrow column",
      without: {
        label: "The browser alone",
        notes: {
          overflow: "Runs past the edge",
          quotes: "Straight quotes",
        },
      },
      with: {
        label: "With Skiptingar",
        notes: {
          joint: "Breaks at the joint",
          glue: "Kept on one line",
          quotes: "Icelandic quotes",
        },
      },
      /**
       * The start of each compound up to a joint, for the joint note: a word
       * broken right after one of these broke where its parts meet.
       */
      joints: ["Hrafna", "Hrafnafjarðar", "sveitar", "sveitarstjórnar"],
      title: "Kjörsókn í Hrafnafjarðarbyggð aldrei meiri í sveitarstjórnarkosningum",
      text: 'Kjörsókn í sveitarstjórnarkosningunum 16. maí 2026 var sú mesta sem mælst hefur í Hrafnafjarðarbyggð, 91,4%. "Þetta er söguleg niðurstaða," sagði dr. Guðrún Sigurðardóttir, formaður yfirkjörstjórnar, kl. 14.30 daginn eftir.',
    },
    /**
     * Three facts, each a number and the sentence that reads on from it: what
     * it is, and why it matters to someone setting text.
     */
    stats: [
      {
        // The number itself is read from the package, on the server.
        count: "patterns",
        description:
          "letter patterns from the 2020 Árni Magnússon list mark where a word may break. There is no dictionary, so new and rare compounds break well too.",
      },
      {
        count: "exceptions",
        description:
          "words marked by hand: a few the patterns break wrongly or not at all, and compounds whose joints titles should break at. Your own words go in a dictionary option.",
      },
      {
        value: "0 kB",
        description: `of JavaScript to hyphenate. The server puts the soft hyphens in, so every browser gets the same places to break.`,
      },
    ],
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

  install: {
    ...localhostSkiptingarClientContent.install,
    status:
      "Not published yet. The name is reserved on npm at version 0.0.0, which holds no code. This is how installing will work.",
    commandLabel: "Install",
    managers: [
      { id: "bun", label: "bun", command: "bun add skiptingar" },
      { id: "npm", label: "npm", command: "npm install skiptingar" },
      { id: "pnpm", label: "pnpm", command: "pnpm add skiptingar" },
      { id: "yarn", label: "yarn", command: "yarn add skiptingar" },
    ],
    quickStart: {
      id: "first-page",
      title: "A first page",
      intro: [
        { text: "Wrap the text in " },
        { text: "<Hyphenate>", code: true },
        { text: " where the page renders on the server, and add " },
        { text: "<CleanCopy />", code: true },
        { text: " once, so text copied from the page has no soft hyphens in it." },
      ],
      label: "app/page.tsx",
      source: `import { Hyphenate } from "skiptingar/react";
import { CleanCopy } from "skiptingar/client";

export default function Page() {
  return (
    <main lang="is">
      <CleanCopy />
      <Hyphenate>
        <h1>Sveitarstjórnarkosningar á landsbyggðinni</h1>
        <p>Verð 1.000 kr. frá 30. september.</p>
      </Hyphenate>
    </main>
  );
}`,
    },
    entries: {
      id: "entry-points",
      title: "Entry points",
      intro:
        "Import only what the page needs. The first two run on the server and send nothing to the browser.",
      items: [
        {
          id: "core",
          path: "skiptingar",
          where: "Anywhere: Node, the edge, a build step",
          body: [
            { text: "hyphenate()", code: true },
            { text: ", " },
            { text: "typeset()", code: true },
            { text: " and " },
            { text: "processSegments()", code: true },
            { text: ": plain functions on strings." },
          ],
        },
        {
          id: "react",
          path: "skiptingar/react",
          where: "React Server Components",
          body: [
            { text: "<Hyphenate>", code: true },
            { text: " and " },
            { text: "<Typeset>", code: true },
            { text: ", which change only the text in the JSX you give them." },
          ],
        },
        {
          id: "client",
          path: "skiptingar/client",
          where: "The browser",
          body: [
            { text: "useHyphenate()", code: true },
            {
              text: " for text that only exists in the browser (it can ask your server instead of loading the patterns), and ",
            },
            { text: "<CleanCopy />", code: true },
            {
              text: `. The hyphenation core loads on first use, ${kB("patterns")} brotli.`,
            },
          ],
        },
      ],
    },
    cost: {
      id: "cost",
      title: "What it costs a browser",
      intro:
        "What a page downloads for each job, with Skiptingar and with the common alternatives. Most of Skiptingar runs on the server and sends nothing. Text that only exists in the browser can be sent to your server to hyphenate, so the patterns never download; this page does that.",
      unit: "kB",
      groups: [
        {
          id: "hyphenate",
          label: "Hyphenate Icelandic",
          items: [
            {
              id: "sk-server",
              label: "Skiptingar on the server",
              kB: 0,
              own: true,
              method: "soft hyphens in the HTML",
              note: "Hyphenated while the page renders.",
            },
            {
              id: "sk-endpoint",
              label: "Skiptingar via your server",
              kB: sizes.endpoint.brotli,
              own: true,
              method: "soft hyphens from your server",
              note: "useHyphenate with an endpoint: the browser sends the text and gets it back hyphenated.",
            },
            {
              id: "hyphen",
              label: "hyphen/is",
              kB: 12.9,
              own: false,
              method: "soft hyphens added in the browser",
              note: "The old TeX patterns.",
            },
            {
              id: "hyphenopoly",
              label: "Hyphenopoly",
              kB: 14.8,
              own: false,
              method: "soft hyphens added in the browser",
              note: "The old TeX patterns as WebAssembly, loaded where the browser cannot hyphenate.",
            },
            {
              id: "sk-client",
              label: "Skiptingar in the browser",
              kB: sizes.browser.brotli,
              own: true,
              method: "soft hyphens added in the browser",
              note: "The 2020 data, loaded on first use, for a page with no server to ask. Larger than the old patterns because it breaks better.",
            },
          ],
        },
        {
          id: "typeset",
          label: "Typesetting rules",
          items: [
            {
              id: "sk-typeset",
              label: "Skiptingar on the server",
              kB: 0,
              own: true,
              method: "characters swapped in the HTML",
              note: "Icelandic numbers, dates, abbreviations and quotes.",
            },
            {
              id: "typeset-js",
              label: "Typeset.js",
              kB: 29.7,
              own: false,
              method: "rewrites the markup",
              note: "English rules, run in the browser here.",
            },
          ],
        },
      ],
      note: "Measured on 1 October 2026: each package bundled with a minimal use, minified, React left out, brotli. Each row is what that setup downloads for its job alone, so the scope differs: some sizes include hyphenation, some leave it to the server.",
    },
    roadmap: {
      id: "roadmap",
      title: "Planned",
      intro:
        "What comes before the first release and what can wait. Nothing here is promised yet.",
      groups: [
        {
          id: "v1",
          label: "Beta and v1",
          items: [
            {
              id: "publish",
              title: "On npm",
              body: "The three entry points as one ESM package with its types, no runtime dependencies and a changelog.",
            },
            {
              id: "report",
              title: "Report a wrong break",
              body: "A prefilled GitHub issue from the break editor that holds the line to add to the exception list, and the list public, so anyone can see what has been fixed. Until a fix ships, the dictionary option takes your own words.",
            },
            {
              id: "exceptions",
              title: "Fix the remaining bad breaks",
              body: "The linking-syllable rule fixed stjórnar-völd and fornaldar-frægð. Next are the words where the patterns disagree with the word list they were made from.",
            },
            {
              id: "docs",
              title: "This page as the documentation",
              body: "Every option shown live, with the API reference beside it.",
            },
          ],
        },
        {
          id: "later",
          label: "Later",
          items: [
            {
              id: "markdown",
              title: "Markdown and HTML",
              body: "A rehype plugin and a small CLI that hyphenate and typeset, for sites that are not built with React.",
            },
            {
              id: "smaller-patterns",
              title: "Smaller patterns, maybe",
              body: "Train a smaller pattern set from the same 218.000-word list, trading a little accuracy for size, for pages that must hyphenate in the browser without a server. Only if the size turns out to matter.",
            },
          ],
        },
      ],
    },
    requirements:
      "No runtime dependencies. React 19 is needed only for skiptingar/react and skiptingar/client. MIT licence; the exception list is CC0; the hyphenation patterns are CC BY 4.0, so keep their credit.",
  },

  sizes: {
    items: [
      { id: "display", label: "text-display" },
      { id: "prose", label: "text-prose" },
      { id: "meta", label: "text-meta" },
    ],
  },

  compare: {
    text: samples.constitution.second,
    columns: {
      none: {
        label: "None",
        hint: "Breaks only at spaces, so long words stick out or leave gaps.",
      },
      browser: {
        label: "Browser",
        hint: "hyphens: auto, with the browser’s own dictionary. Only Firefox has one for Icelandic, so in Chrome, Edge and Safari this column sets like None. Open the page in Firefox to see it hyphenate.",
      },
      skiptingar: {
        label: "Skiptingar",
        hint: "Soft hyphens from the 2020 patterns, added on the server. Every browser gets the same places to break.",
      },
    },
    table: {
      caption: "TeX patterns vs 2020 patterns",
      /** Shown on a narrow screen, where the table scrolls sideways. */
      scrollHint: "Scroll the table sideways for the 2020 column.",
      headers: {
        word: "Word",
        tex: "TeX hyphen/is",
        current: "2020 Árni Magnússon",
      },
      rows: [
        {
          word: "þjóðfélagsumræða",
          tex: "þjóð-fé-lagsum-ræða",
          current: "þjóð-fé-lags-um-ræða",
        },
        {
          word: "hraðbrautarframkvæmdir",
          tex: "hrað-brautar-fram-kvæmd-ir",
          current: "hrað-braut-ar-fram-kvæmd-ir",
        },
        { word: "ólán", tex: "ólán", current: "ó-lán" },
        {
          word: "íþróttafélagið",
          tex: "íþrótta-fé-lag-ið",
          current: "í-þrótta-fé-lag-ið",
        },
        {
          word: "óhjákvæmilegt",
          tex: "óhjá-kvæmi-legt",
          current: "ó-hjá-kvæmi-legt",
        },
        {
          word: "Vaðlaheiðarvegavinnuverkfærageymsluskúr",
          tex: "Vaðla-heið-ar-vega-vinnu-verk-færa-geymslu-skúr",
          current: null,
        },
      ],
      same: "(same)",
      note: "TeX here uses its usual limit of 2 letters before a break, the 2020 data its own limit of 1, so ó-lán and í-þrótta show only in the 2020 column. The joint in þjóðfélags-umræða is the 2020 data’s own fix. The typographic preset drops one-letter breaks.",
    },
  },

  howItWorks: {
    /** The diagram: one word through every stage, computed on the server. */
    diagram: {
      label: "One word, from the text to the line",
      word: "þjóðfélagsumræða",
      /** The browser stage sets the word in this line, narrow enough that it must break. */
      line: "Ný þjóðfélagsumræða hafin",
      server: "On the server",
      browser: "In the browser",
      stages: {
        word: {
          title: "Word",
          note: "Any Icelandic word. There is no dictionary to look it up in.",
        },
        patterns: {
          title: "Patterns",
          note: "Each slot takes the highest digit of any pattern that covers it. Odd allows a break, even forbids one.",
        },
        rules: {
          title: "Rules",
          note: "The typographic rules keep the breaks with room on both sides and drop the one before a linking syllable. The exception list marks a few words by hand.",
        },
        html: {
          title: "HTML",
          note: "An invisible soft hyphen at each break. The page ships no code to put them there.",
        },
        line: {
          title: "Line",
          note: "The browser picks the break that fits, and draws the hyphen only there.",
        },
      },
      softHyphen: "&shy;",
    },
    /** Each body is a list of parts; `code` parts are set in the code style. */
    steps: [
      {
        id: "patterns",
        title: "Patterns",
        body: [
          {
            text: "This is Franklin Liang’s algorithm from 1983, the one TeX uses. There is no dictionary. {patterns} short letter patterns carry numbers between the letters, like ",
          },
          { text: ".af4lið.", code: true },
          {
            text: " (the dots mark the start and end of the word). An odd number allows a break, an even number forbids one, and the highest number at each spot wins. The patterns are the 2020 Icelandic list from the Árni Magnússon Institute (CC BY 4.0). It gets compound joints right: ",
          },
          { text: "þjóð-fé-lags-um-ræða", sample: true },
          { text: ", where the older TeX patterns gave " },
          { text: "þjóð-fé-lagsum-ræða", sample: true },
          { text: "." },
        ],
      },
      {
        id: "exceptions",
        title: "Exceptions",
        body: [
          { text: "A hand-checked list in " },
          { text: "data/exceptions.txt", code: true },
          {
            text: " (CC0) overrides the patterns for the words on it: a few they break wrongly, and compounds marked for their joints. A ",
          },
          { text: "-", code: true },
          { text: " marks a break and a " },
          { text: "=", code: true },
          {
            text: " marks a compound joint. In heading mode a word breaks only at its joints, when one fits: listed ones, and two rules for the rest. A break before a linking syllable such as ar is dropped, so stjórnar-völd, not stjórn-ar-völd, and the break kept after it is a joint. So is a name ending such as -dóttir.",
          },
        ],
      },
      {
        id: "presets",
        title: "Presets",
        body: [
          { text: "typographic", code: true },
          {
            text: " is the default and keeps only the breaks that look good. ",
          },
          { text: "ritreglur", code: true },
          {
            text: " allows every break the patterns allow, close to what the official spelling rules allow, such as ",
          },
          { text: "ó-lán", sample: true },
          {
            text: ", with 1 letter before and 2 after, in words of 4 or more letters (Skiptingar’s own limit). Typographic keeps only some of those breaks.",
          },
        ],
      },
      {
        id: "server",
        title: "Soft hyphens, on the server",
        body: [
          { text: "hyphenate()", code: true },
          {
            text: " inserts a soft hyphen (U+00AD) at each allowed break while the page renders, in a React Server Component called ",
          },
          { text: "<Hyphenate>", code: true },
          {
            text: ". The browser gets plain HTML, so a page that only uses it ships 0 kB of hyphenation code, and the places to break are the same in every browser. The browser still picks which break to use on each line. CSS ",
          },
          { text: "text-wrap: pretty", code: true },
          { text: " and " },
          { text: "balance", code: true },
          { text: " help it choose well." },
        ],
      },
      {
        id: "typeset",
        title: "Typesetting",
        body: [
          { text: "typeset()", code: true },
          {
            text: " only swaps one character for another. Spaces become no-break spaces in ",
          },
          { text: "1.000 kr.", sample: true },
          { text: ", " },
          { text: "30. september", sample: true },
          { text: ", " },
          { text: "bls. 12", sample: true },
          { text: " and " },
          { text: "dr. Jón", sample: true },
          {
            text: ", and straight quotes become Icelandic „…“. Apart from putting the text in NFC it never changes its length, so it can run across a whole JSX tree at once and pair quotes across inline elements such as ",
          },
          { text: "<strong>", code: true },
          { text: ". One rule, " },
          { text: "lastWords", code: true },
          { text: ", keeps the last line from being a single word. " },
          { text: "text-pretty", code: true },
          { text: " does that better where the browser supports it, so use " },
          { text: "lastWords", code: true },
          {
            text: " only as a fallback for Firefox and Safari before 26, which do not support ",
          },
          { text: "text-pretty", code: true },
          { text: "." },
        ],
      },
      {
        id: "safety",
        title: "Safety",
        body: [
          {
            text: "URLs, email addresses and domains are never touched. Running either function twice gives the same result. ",
          },
          { text: "<CleanCopy />", code: true },
          {
            text: " removes the soft hyphens and no-break spaces from copied text. Text that only exists in the browser can use the lazy client entry, ",
          },
          { text: "useHyphenate", code: true },
          {
            text: `, ${kB("patterns")} brotli, loaded on first use, or none at all when it asks your server.`,
          },
        ],
      },
      {
        id: "care",
        title: "Languages, names and numbers",
        body: [
          { text: "<Hyphenate>", code: true },
          { text: " leaves text inside it under a non-Icelandic " },
          { text: "lang", code: true },
          {
            text: " alone, with no Icelandic hyphenation and no Icelandic quotes, and a nested ",
          },
          { text: 'lang="is"', code: true },
          {
            text: " turns it back on; a page in another language passes its own lang prop. Input is turned into NFC first, so decomposed letters, like those in macOS file names, still hyphenate. All-caps words of 4 to 8 letters, such as UNESCO, never break. In heading mode a capitalised name breaks at its ending’s joint when one fits, as in ",
          },
          { text: "Sigurðar-dóttir", sample: true },
          {
            text: ". Kennitala and phone numbers stay on one line, and CleanCopy puts the normal hyphen back on copy.",
          },
        ],
      },
    ],
    css: {
      id: "css-pairs",
      title: "CSS it pairs with",
      intro:
        "Skiptingar only decides where a word may break. These properties decide how the browser uses those breaks. Each pair sets the same text at the same width, without and with the property. Drag the width: at some widths the two agree, at others they part.",
      without: "Without",
      with: "With",
      usedLabel: "Used here",
      supportLabel: "Support",
      snippetLabel: "HTML",
      rows: [
        {
          id: "pretty",
          property: "text-wrap: pretty",
          what: "Stops a paragraph from ending on one short word. Safari 26 and later also even out the ragged right edge; Chrome only adjusts the last few lines.",
          used: [
            {
              text: "The paragraphs in Real interfaces, the steps on this page and the body text in Try it.",
            },
          ],
          support: [
            {
              text: "Chrome 117+ and Safari 26+ support it. Firefox does not, and falls back to normal wrapping. The typeset rule ",
            },
            { text: "lastWords", code: true },
            {
              text: " does part of the same job, but only for the last two words, so use it as a fallback for Firefox and older Safari.",
            },
          ],
          withoutCaption: "text-wrap: wrap",
          withCaption: "text-wrap: pretty",
        },
        {
          id: "balance",
          property: "text-wrap: balance",
          what: "Evens out the line lengths of a short block, so a heading of two or three lines does not end on one word.",
          used: [
            {
              text: "The section titles, the titles in Try it and the heading samples.",
            },
          ],
          withoutCaption: "text-wrap: wrap",
          withCaption: "text-wrap: balance",
        },
        {
          id: "hyphens",
          property: "hyphens: manual and auto",
          what: "manual, the CSS default, adds a hyphen only where there is a soft hyphen, and those are the ones Skiptingar puts in. auto asks the browser’s own dictionary. Only Firefox ships an Icelandic one; Chrome, Edge and Safari do not. Test it in Same text, every browser.",
          used: [
            {
              text: "Every hyphenated text on this page uses manual. The Browser column in ",
            },
            { text: "Same text, every browser", href: "#browsers" },
            { text: " uses auto on purpose." },
          ],
          withoutCaption: "hyphens: auto",
          withCaption: "hyphens: manual, with Skiptingar",
        },
        {
          id: "lang",
          property: "lang",
          what: "Tells screen readers which language to speak and tells the browser which language rules to use. hyphens: auto needs it.",
          used: [
            {
              text: "Every Icelandic container on this page. The English interface text has none.",
            },
          ],
          snippet: `<p lang="is">Hraðbrautarframkvæmdir</p>`,
        },
      ],
      balanceHeading: "Nýr vegur opnaður á milli bæjanna",
    },
    example: {
      label: "Usage",
      source: `import { Hyphenate } from "skiptingar/react";

<Hyphenate mode="heading">
  <h1>Sveitarstjórnarkosningar á landsbyggðinni</h1>
</Hyphenate>`,
      resultLabel: "Result",
      resultHint: "The real output for the heading above. Each · is a soft hyphen.",
      heading: "Sveitarstjórnarkosningar á landsbyggðinni",
    },
  },

  samplesSection: {
    sizes: {
      label: "Sizes",
      hint: [
        {
          text: "The first paragraph of your text at three sizes, in the same measure. Smaller type fits more letters on a line, so the breaks land in different places.",
        },
      ],
    },
    heading: {
      label: "Heading, phone width",
      hint: [
        {
          text: "Without the package a long compound runs out of the box. With it the word breaks at a joint, and ",
        },
        { text: "text-wrap: balance", code: true },
        { text: " evens out the lines. " },
        { text: "Why, with and without", href: "#css-pairs" },
      ],
      headings: [
        "Vaðlaheiðarvegavinnuverkfærageymsluskúr",
        "Hraðbrautarframkvæmdir á landsbyggðinni",
      ],
    },
    short: {
      label: "Lede",
      hint: [
        {
          text: "Large type puts few words on a line, so every short line shows. Without hyphens the right edge swings; with them it stays even.",
        },
      ],
      text: samples.jonas,
      credit: samples.credits.jonas,
    },
    long: {
      label: "Long paragraph",
      hint: [
        {
          text: "A narrow column of saga prose. Compare the right edges, and the last line. ",
        },
        { text: "text-wrap: pretty", code: true },
        { text: " keeps it from being one word where the browser supports it. " },
        { text: "Why, with and without", href: "#css-pairs" },
      ],
      text: samples.njall,
      credit: samples.credits.njall,
    },
    law: {
      label: "Law text",
      hint: [
        {
          text: "Legal Icelandic is long compounds end to end, like ",
        },
        { text: "framkvæmdarvaldið", sample: true },
        {
          text: ". Without hyphens a whole word drops to the next line and leaves a gap.",
        },
      ],
      articles: [
        { number: "1. gr.", text: samples.constitution.first },
        { number: "2. gr.", text: samples.constitution.second },
      ],
      credit: samples.credits.constitution,
    },
    cards: {
      label: "Card grid",
      hint: [
        {
          text: "Narrow cards with long names. Without the package the names run out of the cards.",
        },
      ],
      items: [
        {
          label: "Heilbrigðisráðuneytið",
          description: "Heilbrigðisþjónusta um allt land.",
        },
        {
          label: "Grunnskólakennarar",
          description: "Kennsla og skólastarf.",
        },
        {
          label: "Náttúruverndarsvæði",
          description: "Friðlönd og þjóðgarðar.",
        },
        {
          label: "Ferðaþjónustufyrirtæki",
          description: "Ferðir og afþreying.",
        },
        {
          label: "Sveitarstjórnarkosningar",
          description: "Kosið var 16. maí 2026.",
        },
        {
          label: "Hæstaréttarlögmaður",
          description: "Málflutningur fyrir dómstólum.",
        },
      ],
    },
    names: {
      label: "Names and places",
      hint: [
        {
          text: "Heading mode, with the page’s rules. Each · is a place the name may break: the joint before its last part, such as ",
        },
        { text: "-dóttir", sample: true },
        { text: " or " },
        { text: "-eyjar", sample: true },
        { text: ". With typographic rules, names under 12 letters, like " },
        { text: "Akureyri", sample: true },
        { text: ", stay whole. Switch Rules to Ritreglur and they break too: " },
        { text: "Akur·eyri", sample: true },
        { text: "." },
      ],
      names: [
        "Sigurðardóttir",
        "Vestmannaeyjar",
        "Guðmundsdóttir",
        "Stykkishólmur",
        "Akureyri",
        "Hafnarfjörður",
      ],
    },
    mixed: {
      label: "Mixed languages",
      hint: [
        { text: "The two English phrases sit in " },
        { text: '<span lang="en">', code: true },
        {
          text: ". The · marks show the result: the Icelandic words get breaks and „…“ quotes, the English ones are left as they are.",
        },
      ],
      before: "Enska orðið ",
      word: "internationalization",
      middle: " og tilvitnunin ",
      quote: '"straight quotes"',
      after:
        ' haldast óbreytt, en íslensku orðunum er skipt milli lína og "gæsalappirnar" verða íslenskar.',
    },
    acronyms: {
      label: "Acronyms",
      hint: [
        {
          text: "All-caps words of 4 to 8 letters never break. Longer ones still do. The · marks show where each word may break.",
        },
      ],
      text: "UNESCO og NATO haldast óskipt, en KEFLAVÍKURFLUGVÖLLUR skiptist.",
    },
  },

  /**
   * Reading and tools that sit next to skiptingar. Not credits: each one is
   * here because it helps set Icelandic text well alongside the package.
   */
  related: {
    platform: {
      id: "platform",
      title: "Icelandic on the platform",
      intro:
        "Some things the browser does for Icelandic and some it does not. These notes say what to use instead of writing it yourself.",
      items: [
        {
          id: "intl",
          term: "Dates and numbers",
          body: [
            {
              text: "Chrome and Edge on the desktop ship no Icelandic Intl data. Tested in Chrome 154 on macOS: dates render in English, and ",
            },
            { text: 'Intl.Collator("is")', code: true },
            {
              text: " sorts æ next to a and ö with o, and á, é and í as plain a, e and i. Node, Bun, Firefox and Safari are fine. Format dates and numbers on the server, and for sorting in the browser use ",
            },
            { text: "cldr-is", href: "https://github.com/gudrodur/cldr-is" },
            { text: " (on GitHub, not on npm yet)." },
          ],
        },
        {
          id: "plurals",
          term: "Plurals",
          body: [
            { text: 'Intl.PluralRules("is")', code: true },
            {
              text: " works everywhere. It treats 21, 31 and 101 as singular, as Icelandic does.",
            },
          ],
        },
        {
          id: "slugs",
          term: "Slugs",
          body: [
            { text: "slugify", href: "https://www.npmjs.com/package/slugify" },
            {
              text: " (the npm package) already maps þ to th, ð to d, æ to ae and ö to o, the ÍST 130 table.",
            },
          ],
        },
        {
          id: "names",
          term: "Names in a sentence",
          body: [
            { text: "Forms like " },
            { text: "til Jóns", sample: true },
            { text: " and " },
            { text: "Jóni", sample: true },
            { text: " need declension. Use " },
            { text: "beygla", href: "https://www.npmjs.com/package/beygla" },
            { text: "." },
          ],
        },
        {
          id: "kennitala",
          term: "Kennitala",
          body: [
            {
              text: "Format it, but do not validate the check digit. Þjóðskrá stopped using it for new numbers on 18 February 2026. See ",
            },
            {
              text: "kennitölur án vartölu",
              href: "https://www.skra.is/folk/eg-i-thjodskra/um-kennitolur/kennitolur-an-vartolu/",
            },
            { text: "." },
          ],
        },
        {
          id: "phone",
          term: "Phone numbers",
          body: [
            { text: "555-1234", sample: true },
            { text: " and " },
            { text: "555 1234", sample: true },
            {
              text: " are kept together by typeset(). Browsers otherwise break after the hyphen.",
            },
          ],
        },
      ],
    },
    groups: [
      {
        id: "reading",
        label: "Reading",
        items: [
          {
            id: "webkit-pretty",
            title: "Better typography with text-wrap: pretty",
            source: "WebKit blog",
            href: "https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/",
            body: [
              {
                text: "What makes a ragged edge look good: no short last line, an even right edge, hyphens where they help. It shows how Safari weighs these, with a live demo that draws the plain text faintly behind the improved one.",
              },
            ],
          },
          {
            id: "chrome-pretty",
            title: "CSS text-wrap: pretty",
            source: "Chrome for Developers",
            href: "https://developer.chrome.com/blog/css-text-wrap-pretty",
            body: [
              {
                text: "Chrome’s take on the same property. It keeps a paragraph from ending on one word, and near the end it adjusts hyphenation and earlier lines to make room. That is why its effect shows at some widths and not at others.",
              },
            ],
          },
          {
            id: "chrome-balance",
            title: "CSS text-wrap: balance",
            source: "Chrome for Developers",
            href: "https://developer.chrome.com/docs/css-ui/css-text-wrap-balance",
            body: [
              {
                text: "When to balance a title, and the catch: browsers only balance blocks of a few lines, so it is for titles and captions, not paragraphs.",
              },
            ],
          },
          {
            id: "butterick",
            title: "Hyphenation",
            source: "Butterick’s Practical Typography",
            href: "https://practicaltypography.com/hyphenation.html",
            body: [
              {
                text: "A counterpoint worth reading: in ragged text hyphenation is optional, and headings are better without it. The typographic rules and heading mode take the same view, breaking less often, and in a title only long words.",
              },
            ],
          },
          {
            id: "liang",
            title: "Word Hy-phen-a-tion by Com-put-er",
            source: "Frank Liang, 1983",
            href: "https://tug.org/docs/liang/",
            body: [
              {
                text: "The thesis behind the patterns Skiptingar runs, and the reason it needs no dictionary.",
              },
            ],
          },
          {
            id: "ritreglur",
            title: "§ 33 Orðskipting",
            source: "Ritreglur, Árnastofnun",
            href: "https://ritreglur.arnastofnun.is/#33.",
            body: [
              {
                text: "The official rules for breaking Icelandic words between lines. The Ritreglur preset follows them through the patterns, which miss a few breaks and allow a few they forbid; the typographic preset is stricter.",
              },
            ],
          },
        ],
      },
      {
        id: "tools",
        label: "Works well with",
        items: [
          {
            id: "hanging-punctuation",
            title: "hanging-punctuation",
            source: "MDN",
            href: "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/hanging-punctuation",
            body: [
              {
                text: "Hangs an opening „ outside the text’s edge, so a line that starts with a quote still lines up. Few browsers support it, and the rest ignore it, so it is safe to add.",
              },
            ],
          },
          {
            id: "typeset",
            title: "Typeset",
            source: "David Merfield",
            href: "https://typeset.lllllllllllllllll.com/",
            body: [
              {
                text: "A server-side HTML pre-processor for hanging punctuation, optical margin alignment and small caps. It has its own quotes and hyphenation: turn off ",
              },
              { text: "quotes", code: true },
              { text: " and " },
              { text: "hyphenate", code: true },
              { text: " and let Skiptingar do those for Icelandic." },
            ],
          },
          {
            id: "hyphenopoly",
            title: "Hyphenopoly",
            source: "Mathias Nater",
            href: "https://mnater.github.io/Hyphenopoly/",
            body: [
              {
                text: "Hyphenation for many languages, in the browser or Node. It has Icelandic too, from the older TeX patterns. Skiptingar leaves text under another ",
              },
              { text: "lang", code: true },
              { text: " alone, so the two can share a page." },
            ],
          },
          {
            id: "ylhyra",
            title: "Icelandic hyphenation",
            source: "Ylhýra",
            href: "https://hyphenation.ylhyra.is/",
            body: [
              {
                text: "A neural model that finds compound joints. A second opinion when you check a break before adding it to the exception list.",
              },
            ],
          },
          {
            id: "greynir",
            title: "GreynirCorrect",
            source: "Miðeind",
            href: "https://github.com/mideind/GreynirCorrect",
            body: [
              {
                text: "Spelling and grammar checking for Icelandic, in Python. Correct the text first, then set it.",
              },
            ],
          },
        ],
      },
    ],
  },

  /**
   * Where Icelandic does not break: each rule glues a plain space with a
   * no-break space (or a hyphen with a non-breaking one). `options` is the
   * `typeset()` option that the row turns on. `measure` is the column width in
   * em where the text as written breaks at a space the rule glues, so the two
   * sides wrap differently (measured in Chrome).
   */
  noBreak: {
    /** The two column captions: the text as written, and typeset. */
    off: "Off",
    on: "On",
    rules: [
      {
        id: "units",
        measure: 9.5,
        label: "Number and unit",
        tag: "units",
        tip: "Puts a no-break space between a number and its unit, so 1.000 kr. and 5 km never split across two lines.",
        input: "Verð 1.000 kr. og 5 km leið í 20 °C hita.",
      },
      {
        id: "dates",
        measure: 9,
        label: "Date",
        tag: "dates",
        tip: "Keeps a month and the year after it together, so sep. 2026 and sept. 2027 never split.",
        input: "Opnað 30. sep. 2026 og lokað í sept. 2027.",
      },
      {
        id: "ordinals",
        measure: 11,
        label: "Ordinal",
        tag: "ordinals",
        tip: "Keeps a number with a full stop, like 1. or 30., on the same line as the lowercase word after it.",
        input: "Hún lenti í 1. sæti í 2. umferð.",
      },
      {
        id: "prefixes",
        measure: 11,
        label: "Abbreviation and number",
        tag: "prefixes",
        tip: "Keeps an abbreviation with the number that follows it, so nr. 5, bls. 12 or kl. 14.30 never split across lines. Standard abbreviations like t.d. and o.s.frv. have no spaces, so they never break.",
        input: "Sjá bls. 12, nr. 5 og kl. 14.30.",
      },
      {
        id: "numbers",
        measure: 9.5,
        label: "Kennitala and phone",
        tag: "numbers",
        tip: "Kennitala and phone numbers never split across lines: the hyphen becomes a non-breaking hyphen (U+2011) and the spaces become no-break spaces. CleanCopy puts a normal hyphen back when you copy.",
        input: "Kennitala 010190-2939, sími 555-1234 eða +354 555 1234.",
      },
      {
        id: "titles",
        measure: 13.25,
        label: "Titles",
        tag: "titles",
        tip: "Keeps dr., sr., próf. and hr. on the same line as the capitalised name after them.",
        input: "Fundur með dr. Jóni og sr. Önnu.",
      },
      {
        id: "single-letter",
        measure: 11,
        label: "One-letter words",
        tag: "singleLetter",
        tip: "Puts a no-break space after a one-letter word, so it never ends a line alone. Off by default, so this row turns it on.",
        input: "Hún á hest og býr í Kópavogi.",
        options: { singleLetter: true },
      },
      {
        id: "last-words",
        measure: 11,
        label: "Last two words",
        tag: "lastWords",
        tip: "Puts a no-break space between the last two words of the text, so the last line is never a single word. Off by default, so this row turns it on. text-pretty does this better where the browser supports it, so use this rule only as a fallback for Firefox and Safari before 26, which do not support it.",
        input: "Þau fóru saman til Akureyrar",
        options: { lastWords: true },
      },
    ],
  },

  /**
   * Icelandic punctuation: the quotes and the dashes. Same shape as
   * `noBreak`; `options` is the `typeset()` option that the row turns on.
   */
  punctuation: {
    off: "Off",
    on: "On",
    rules: [
      {
        id: "quotes",
        label: "Quotes",
        tag: "quotes",
        tip: "Straight double quotes become Icelandic „…“. A paired 'word' becomes ‚word‘, the mark for a word’s meaning (Ritreglur §28.2). A quote inside a quote uses „…“ again: type it that way (§28.1).",
        input: "Hann sagði \"komdu heim\" og orðið fákur merkir 'hestur'.",
      },
      {
        id: "dashes",
        measure: 13.5,
        label: "Dashes",
        tag: "dashes",
        tip: "Swaps the hyphen in a number range, and a spaced hyphen, for an en dash. Off by default, so this row turns it on.",
        input: "Árin 1990-2000 var veturinn - og þá sérstaklega febrúar - óvenju mildur.",
        options: { dashes: true },
      },
    ],
  },
} as const;
