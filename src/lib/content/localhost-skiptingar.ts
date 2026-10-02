/**
 * Copy for /localhost/skiptingar: the page for Icelandic hyphenation and
 * typography. The Icelandic texts are the samples; the English strings are the
 * page's own labels. The copy that client components read (the Try it editor,
 * the width slider) is defined in `localhost-skiptingar-client.ts`. The install
 * command is left out on purpose, as the npm package is a placeholder with no
 * code yet.
 *
 * The page presents version 1 as three layers, all on the server and on by
 * default: letter patterns (the 2020 patterns and the Ritreglur minimums, put
 * in as soft hyphens), better breaks (the experimental `rules: "typographic"`
 * preset, which decides which breaks to keep) and locale details (no-break
 * spaces, Icelandic quotes and dashes; `typeset()` in the API). CSS text-wrap
 * (pretty for body text, balance for titles) is not a layer: it is the
 * reader's own CSS, which the page recommends pairing with the layers. Better
 * breaks, locale details and the CSS can be turned off. Keep the names apart:
 * "better breaks" decides breaks, "locale details" swaps characters. Copy must
 * not claim more than that. The later, more
 * opinionated layer is named in one place only: the "More opinionated breaks"
 * roadmap item.
 */

import { localhostSkiptingarClientContent } from "@/lib/content/localhost-skiptingar-client";
import sizes from "@/packages/skiptingar/sizes.json";

/** A size from `bun run size` (sizes.json), in kB brotli, unit kept with the number. */
const kB = (setup: keyof typeof sizes) => `${sizes[setup].brotli}\u00a0kB`;

/** The text the browser comparison (section F) and the CSS pairs set. */
const compareText =
  "Alþingi og forseti Íslands fara saman með löggjafarvaldið. Forseti og önnur stjórnarvöld samkvæmt stjórnarskrá þessari og öðrum landslögum fara með framkvæmdarvaldið. Dómendur fara með dómsvaldið.";

export const localhostSkiptingarContent = {
  // The copy that client components read (`marks`, `tips`, `liveEditor`) is
  // defined in its own file; client code imports that file.
  ...localhostSkiptingarClientContent,

  page: {
    title: "Skiptingar: Icelandic text, set well",
    description:
      "Icelandic hyphenation and locale details for the web, made on the server, to pair with CSS text-wrap.",
  },

  hero: {
    /** The name as a screen reader gets it, without the typed hyphens. */
    name: "Skiptingar",
    title: "Skipt-ing-ar",
    tagline: "Icelandic text, set well.",
    lede: "Letter patterns, better breaks and locale details, all on the server. Pair them with CSS text-wrap. The browser runs no code and copied text comes out clean.",

    /**
     * The problems as numbered figures, drawn like a technical manual: each
     * one set twice at the same narrow measure, as the browser sets it alone
     * and with Skiptingar, over ruled lines, with the measure drawn as a
     * dimension above. Red is the fault and blue the fix; a `mark`ed part is
     * coloured on both sides. `measure` is the text the line is as wide as, so
     * the problem shows in any font. `overflow` hatches what runs past the
     * measure. One short caption each. `bare` leaves the measure undrawn
     * (no dimension line, no edge rule) where the problem is not about width.
     */
    demo: {
      title: "What it fixes",
      without: "Browser",
      with: "Skiptingar",
      figureLabel: "Fig.",
      rows: [
        {
          id: "long-words",
          parts: [{ text: "Kjörsókn í Hrafnafjarðarbyggð" }],
          // A little wider than "Kjörsókn í", so "í Hrafna-" fits on the
          // package's second line: "í" stays with the word after it.
          measure: "Kjörsókn í H",
          overflow: true,
          caption: "A long word runs past the measure. Skiptingar breaks it.",
        },
        {
          id: "units",
          parts: [{ text: "Verð " }, { text: "1.000", mark: true }, { text: " kr." }],
          measure: "Verð 1.000 k",
          caption: "The unit drops to a line of its own. Skiptingar keeps it.",
        },
        {
          id: "quotes",
          parts: [
            { text: '"', mark: true },
            { text: "Söguleg niðurstaða" },
            { text: '"', mark: true },
          ],
          // The wider of the two settings, so both fit on one line.
          measure: "„Söguleg niðurstaða“",
          bare: true,
          caption: "Straight quotes stay straight. Skiptingar sets Icelandic ones.",
        },
        {
          // A hyphen does not break before a digit (UAX #14), so the
          // browser's only fault is the glyph. The package's en dash could
          // break, so it adds a word joiner after it.
          id: "ranges",
          parts: [{ text: "Árin 1990" }, { text: "-", mark: true }, { text: "2010" }],
          // The wider of the two settings, so both fit on one line.
          measure: "Árin 1990–2010",
          bare: true,
          caption: "A hyphen stands in for the dash. Skiptingar sets an en dash.",
        },
      ],
    },
    /** The label beside the facts: what the package is built from. */
    statsTitle: "What it is",
    /**
     * Four facts, one for each layer, in the layers' order, set as the
     * figures above are but not numbered: a subtitle naming what is counted,
     * the number on a baseline rule, and a one-line caption.
     */
    stats: [
      {
        // The number itself is read from the package, on the server.
        count: "patterns",
        label: "Letter patterns",
        caption:
          "From the 2020 Árni Magnússon list. No word list, so new compounds break too.",
      },
      {
        // Measured over all 218.308 words of the list the 2020 patterns were
        // trained on (icelandic-lt/hyphenation-is, hyph_is_list.txt): 416.492
        // breaks under `rules: "ritreglur"`, 294.460 under "typographic".
        // Counted per word in the list, not per word in running text.
        value: "29%",
        label: "Fewer breaks",
        caption:
          "Better breaks drop 122.032 of the 416.492 breaks Ritreglur allows in the 2020 list.",
      },
      {
        // The number itself is read from the package, on the server.
        count: "rules",
        label: "Locale rules",
        // The rule names are read from the package too and set under it.
        caption: "Each rule can be turned off on its own.",
      },
      {
        value: "0 kB",
        label: "JavaScript in the browser",
        caption:
          "The server puts in the soft hyphens and no-break spaces. Every browser gets the same breaks.",
      },
    ],
  },

  shell: {
    navLabel: "Sections",
  },

  /**
   * Section I, under the pattern table and the related work. The pattern
   * sources, the licences and the sizes themselves are already shown (the
   * colophon, the install requirements, the cost chart), so this holds the
   * rest. The test line is built from `tests.json` in the component:
   * `testsAllPass` when nothing failed, `testsSomeFail` otherwise, with
   * `{n}` the total and `{pass}` the passing count.
   */
  reference: {
    testsAllPass: "{n} tests.",
    testsSomeFail: "{pass} of {n} tests pass.",
    testsErrorOne: "{n} error outside any test.",
    testsErrorMany: "{n} errors outside any test.",
    groups: [
      {
        id: "data",
        label: "Data and rules",
        items: [
          {
            id: "one-letter",
            term: "One-letter breaks",
            body: [
              { text: "The Ritreglur rules for breaking after one letter, as in " },
              { text: "ó-lán", sample: true },
              { text: ", follow " },
              { text: "skiptir", href: "https://github.com/sveinbjornt/skiptir" },
              { text: ", the Python package." },
            ],
          },
        ],
      },
      {
        id: "support",
        label: "Support",
        items: [
          {
            id: "browsers",
            term: "Browsers and Node",
            body: [
              {
                text: "The locale details use regular expression lookbehind, so a browser needs Safari 16.4 or newer. Chrome 62 and Firefox 78 support it earlier, so Safari sets the limit. The client entry has the same limit. On the server there is no browser limit, and you need Node 18 or newer.",
              },
            ],
          },
          {
            id: "fonts",
            term: "Fonts",
            body: [
              {
                text: "Check that your font has glyphs for U+00A0, the no-break space, and U+2011, the no-break hyphen. ",
              },
              { text: "typeset()", code: true },
              {
                text: " puts U+2011 in kennitala and phone numbers. Many fonts have no U+2011. ABC Areal and Bespoke Serif, the faces on this page, lack it. The browser draws that hyphen from a fallback font.",
              },
            ],
          },
        ],
      },
      {
        id: "checks",
        label: "How it is checked",
        items: [
          {
            id: "tests",
            term: "Tests",
            counts: true,
            body: [
              { text: "Counted from a real run of " },
              { text: "bun test", code: true },
              { text: " on the package folder. " },
              { text: "bun run tests:count", code: true },
              { text: " writes the numbers to " },
              { text: "tests.json", code: true },
              { text: ". This page reads them from there." },
            ],
          },
          {
            id: "sizes",
            term: "Sizes",
            body: [
              { text: "bun run size", code: true },
              {
                text: " builds a small entry for each way to use the package. Like a site’s bundler, it minifies the code, splits it into chunks and leaves React out. It adds up the files that load at once and, for the browser setup, the chunks that load later. It compresses each file on its own with brotli (quality 11) and gzip (level 9), as a browser downloads it, and rounds the sum to 0.1 kB. Shared code counts in every setup that uses it. The sizes on this page come from ",
              },
              { text: "sizes.json", code: true },
              { text: ", which the script writes." },
            ],
          },
          {
            id: "speed",
            term: "Speed",
            body: [
              { text: "bun run bench", code: true },
              {
                text: " times the core with made-up character widths and leaves out the browser’s own measuring. It hyphenates a text of 20.000 words and adds the locale details. Each case repeats for about 300 ms, and the script reports the mean. It prints the results but saves none, so this page shows no speed figures.",
              },
            ],
          },
          {
            id: "source",
            term: "Source",
            body: [
              { text: "The code, the tests and these scripts are in " },
              {
                text: "geirolafs/www on GitHub",
                href: "https://github.com/geirolafs/www/tree/master/src/packages/skiptingar",
              },
              { text: "." },
            ],
          },
        ],
      },
    ],
  },

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
      number: "a",
      nav: "Try it",
      label: "Try it",
      explanation:
        "Write your own text, change the width and the settings, and see where it breaks.",
    },
    breaks: {
      id: "breaks",
      number: "b",
      nav: "Breaks",
      label: "Where Icelandic breaks",
      explanation:
        "The letter patterns say where a word may break, within the Ritreglur minimums. Better breaks then keep only the breaks that read well.",
    },
    noBreaks: {
      id: "no-breaks",
      number: "c",
      nav: "No breaks",
      label: "Where Icelandic doesn’t break",
      explanation:
        "Good line breaking also means knowing where not to break. Locale details keep these words together with no-break spaces.",
    },
    punctuation: {
      id: "punctuation",
      number: "d",
      nav: "Punctuation",
      label: "Icelandic punctuation",
      explanation:
        "Icelandic quotes and dashes, shown before and after. Locale details do these too.",
    },
    interfaces: {
      id: "interfaces",
      number: "e",
      nav: "Interfaces",
      label: "Real interfaces",
      explanation: "Real interface problems, such as a heading at phone width.",
    },
    browsers: {
      id: "browsers",
      number: "f",
      nav: "Browsers",
      label: "Same text, every browser",
      explanation:
        "Skiptingar decides where text may break. The browser decides whether it needs to.",
    },
    howItWorks: {
      id: "how-it-works",
      number: "g",
      nav: "How",
      label: "How it works",
      explanation:
        "Three layers on the server: letter patterns, better breaks and locale details. We recommend pairing them with CSS text-wrap, so the browser sets the lines well.",
    },
    install: {
      id: "install",
      number: "h",
      nav: "Install",
      label: "Install",
      explanation:
        "Three entry points: the JavaScript API, the React components and the browser API.",
    },
    reference: {
      id: "reference",
      number: "i",
      nav: "Reference",
      label: "Reference",
      explanation:
        "Pattern sources, licences, browser support, sizes and how they are measured.",
    },
  },

  install: {
    ...localhostSkiptingarClientContent.install,
    status:
      "Not published yet. The name is reserved on npm at version 0.0.0, which has no code. Installing will work like this.",
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
        {
          text: " where the page renders on the server. It adds all three layers. Pass ",
        },
        { text: "typeset={false}", code: true },
        {
          text: " to leave out the locale details. Pair it with CSS text-wrap: here Tailwind’s text-balance for the title and text-pretty for the paragraph. Add ",
        },
        { text: "<CleanCopy />", code: true },
        { text: " once, so copied text has no soft hyphens." },
      ],
      label: "app/page.tsx",
      source: `import { Hyphenate } from "skiptingar/react";
import { CleanCopy } from "skiptingar/client";

export default function Page() {
  return (
    <main lang="is">
      <CleanCopy />
      <Hyphenate>
        <h1 className="text-balance">Sveitarstjórnarkosningar á landsbyggðinni</h1>
        <p className="text-pretty">Verð 1.000 kr. frá 30. september.</p>
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
            {
              text: ": plain functions on strings. ",
            },
            { text: "hyphenate()", code: true },
            {
              text: ' takes a rules option ("typographic" for better breaks, the default, or "ritreglur" for the official minimums only), options for the limits and the hyphen character, and a dictionary of your own words.',
            },
          ],
        },
        {
          id: "react",
          path: "skiptingar/react",
          where: "React Server Components",
          body: [
            { text: "<Hyphenate>", code: true },
            { text: " (all three layers) and " },
            { text: "<Typeset>", code: true },
            {
              text: " (locale details only). They change only the text in the JSX you give them.",
            },
          ],
        },
        {
          id: "client",
          path: "skiptingar/client",
          where: "The browser",
          body: [
            { text: "useHyphenate()", code: true },
            {
              text: " for text that exists only in the browser. It can ask your server instead of loading the patterns. The entry also holds ",
            },
            { text: "<CleanCopy />", code: true },
            {
              text: `. The hyphenation core loads on first use and is ${kB("patterns")} brotli.`,
            },
          ],
        },
      ],
    },
    cost: {
      id: "cost",
      title: "What it costs a browser",
      intro:
        "What a page downloads for each job, with Skiptingar and with the common alternatives. Your server can hyphenate text that exists only in the browser, so the browser downloads the patterns only if it can’t reach the server. This page does that.",
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
              note: "Hyphens go in while the page renders.",
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
              method: "adds soft hyphens in the browser",
              note: "The old TeX patterns.",
            },
            {
              id: "hyphenopoly",
              label: "Hyphenopoly",
              kB: 14.8,
              own: false,
              method: "adds soft hyphens in the browser",
              note: "The old TeX patterns as WebAssembly. It loads where the browser cannot hyphenate.",
            },
            {
              id: "sk-client",
              label: "Skiptingar in the browser",
              kB: sizes.browser.brotli,
              own: true,
              method: "adds soft hyphens in the browser",
              note: "The 2020 data, for a page with no server to ask. It loads on first use. It is larger than the old patterns because it breaks better.",
            },
          ],
        },
        {
          id: "typeset",
          label: "Locale details",
          items: [
            {
              id: "sk-typeset",
              label: "Skiptingar on the server",
              kB: 0,
              own: true,
              method: "swaps characters in the HTML",
              note: "Icelandic numbers, dates, abbreviations and quotes.",
            },
            {
              id: "typeset-js",
              label: "Typeset.js",
              kB: 29.7,
              own: false,
              method: "rewrites the markup",
              note: "English rules. It runs in the browser here.",
            },
          ],
        },
      ],
      note: "Measured on 1 October 2026: each package bundled with a minimal use, minified, React left out, brotli. Each row shows only what that setup downloads for its job, so the scope differs: some rows include hyphenation, and some leave it to the server.",
    },
    roadmap: {
      id: "roadmap",
      title: "Planned",
      intro:
        "What comes before the first release, and what can wait. Nothing here is promised.",
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
              id: "docs",
              title: "This page as the documentation",
              body: "Every option live, with the API reference beside it.",
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
              id: "opinionated",
              title: "More opinionated breaks",
              body: "The first version follows the official spelling rules and adds better breaks. Later: a list of words with corrected breaks, a skip for all-caps acronyms such as UNESCO, and a heading mode that breaks a title where its compounds join.",
            },
            {
              id: "smaller-patterns",
              title: "Smaller patterns, maybe",
              body: "Train a smaller pattern set from the same 218.000-word list. It gives up a little accuracy for size, for pages that must hyphenate in the browser without a server. Only if size matters.",
            },
          ],
        },
      ],
    },
    requirements:
      "No runtime dependencies. Only skiptingar/react and skiptingar/client need React 18 or newer (tested with React 19). MIT licence. The hyphenation patterns are CC BY 4.0, so keep their credit.",
  },

  sizes: {
    items: [
      { id: "display", label: "text-display" },
      { id: "prose", label: "text-prose" },
      { id: "meta", label: "text-meta" },
    ],
  },

  compare: {
    text: compareText,
    columns: {
      none: {
        label: "None",
        hint: "Breaks only at spaces, so long words stick out or leave gaps.",
      },
      browser: {
        label: "Browser",
        hint: "hyphens: auto, with the browser’s own dictionary. Only Firefox has an Icelandic one, so in Chrome, Edge and Safari this column looks like None. Open the page in Firefox to see it hyphenate.",
      },
      skiptingar: {
        label: "Skiptingar",
        hint: "Soft hyphens from the letter patterns and better breaks, put in on the server. Every browser gets the same breaks.",
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
      note: "TeX here keeps its usual limit of 2 letters before a break. The 2020 data has its own limit of 1, so ó-lán and í-þrótta show only in the 2020 column. The 2020 data also fixes the break after lags in þjóðfélagsumræða.",
    },
  },

  howItWorks: {
    /** The diagram: one word through every stage, computed on the server. */
    diagram: {
      label: "One word, from the text to the line",
      word: "Hrafnafjarðarbyggð",
      /** The browser stage sets the word in this line, narrow enough that it must break. */
      line: "Kjörsókn í Hrafnafjarðarbyggð",
      /** The typeset stage shows its own phrase, since a single word has nothing for it to change. */
      typesetSample: '"Verð 1.000 kr."',
      server: "On the server",
      browser: "In the browser",
      stages: {
        word: {
          title: "Word",
          note: "Any Icelandic word. No word list is needed.",
        },
        patterns: {
          title: "Letter patterns",
          note: "Each gap between letters takes the highest digit of any pattern that covers it.",
        },
        rules: {
          title: "Minimums",
          note: "The Ritreglur minimums need room on both sides: at least 1 letter before a break and 2 after, in words of 4 letters or more.",
        },
        typographic: {
          title: "Better breaks",
          note: "It drops breaks that read badly, here the one inside fjarð-ar.",
        },
        typeset: {
          title: "Locale details",
          note: "Spaces become no-break spaces and straight quotes become Icelandic quotes, here in another phrase.",
        },
        html: {
          title: "HTML",
          note: "An invisible soft hyphen at each break, and the no-break spaces from the locale details.",
        },
        line: {
          title: "Line",
          note: "The browser picks the break that fits and draws the hyphen only there. CSS text-wrap, which we recommend, shapes the choice: pretty for body text, balance for titles.",
        },
      },
      softHyphen: "&shy;",
    },
    /** Each body is a list of parts; `code` parts are set in the code style. */
    steps: [
      {
        id: "patterns",
        title: "Letter patterns",
        body: [
          {
            text: "This is Franklin Liang’s algorithm from 1983, the one TeX uses. It needs no word list. {patterns} short letter patterns carry numbers between the letters, like ",
          },
          { text: ".af4lið.", code: true },
          {
            text: " (the dots mark the start and end of the word). An odd number allows a break and an even number forbids one. The highest number at each spot wins. The 2020 patterns break ",
          },
          { text: "þjóð-fé-lags-um-ræða", sample: true },
          { text: ", where the older TeX patterns gave " },
          { text: "þjóð-fé-lagsum-ræða", sample: true },
          {
            text: ". The official spelling rules (Ritreglur) then ask for room on both sides of a break: at least 1 letter before it and 2 after. Skiptingar adds its own limit: a word needs 4 or more letters. These minimums alone still allow breaks that read badly, such as ",
          },
          { text: "ó-lán", sample: true },
          {
            text: ".",
          },
        ],
      },
      {
        id: "typographic",
        title: "Better breaks (on by default)",
        body: [
          {
            text: "Better breaks keep only some of the legal breaks. Body words need 6 or more letters, with 2 before a break and 3 after, so ",
          },
          { text: "ólán", sample: true },
          {
            text: " stays whole. The break before a linking syllable (ar, ur, is, ir) goes, so ",
          },
          { text: "sveitar-stjórnar-kosn-ingum", sample: true },
          {
            text: " keeps its genitives. A foreign name with c, q or w stays whole.",
          },
        ],
      },
      {
        id: "typeset",
        title: "Locale details (on by default)",
        body: [
          {
            text: "Locale details are on by default in the components and the hooks. Pass ",
          },
          { text: "typeset={false}", code: true },
          {
            text: " to hyphenate only. Hyphenation does not depend on them. Locale details swap characters one for one: spaces become no-break spaces in ",
          },
          { text: "1.000 kr.", sample: true },
          { text: ", " },
          { text: "30. september", sample: true },
          { text: ", " },
          { text: "bls. 12", sample: true },
          { text: " and " },
          { text: "dr. Jón", sample: true },
          {
            text: ", and straight quotes become Icelandic „…“. The optional dashes rule is the one exception: it also adds an invisible word joiner after an en dash in a range. So the locale details can run across a whole JSX tree and pair quotes across inline elements such as ",
          },
          { text: "<strong>", code: true },
          { text: "." },
        ],
      },
      {
        id: "server",
        title: "Soft hyphens, on the server",
        body: [
          { text: "hyphenate()", code: true },
          {
            text: " puts a soft hyphen (U+00AD) at each allowed break while the page renders, in a React Server Component called ",
          },
          { text: "<Hyphenate>", code: true },
          {
            text: ". The browser still picks which break to use on each line.",
          },
        ],
      },
      {
        id: "wrapping",
        title: "CSS text-wrap (recommended)",
        body: [
          {
            text: "Soft hyphens only say where a line may break. We recommend pairing the three layers with CSS ",
          },
          { text: "text-wrap: pretty", code: true },
          { text: " for body text and " },
          { text: "balance", code: true },
          {
            text: " for titles help the browser choose. This is your CSS, not package code. It is on by default on this page, and you can leave it out.",
          },
        ],
      },
      {
        id: "why-server",
        title: "Why on the server",
        body: [
          {
            text: "All three layers run while the page renders, so the browser gets plain HTML. That means 0 kB of JavaScript for any of them on a server-rendered page, the same breaks in every browser, and no flash while text is processed. ",
          },
          { text: "<CleanCopy />", code: true },
          {
            text: " keeps copied text clean: it removes the soft hyphens and turns no-break spaces and no-break hyphens back into normal ones. Icelandic quotes and dashes stay, because they are the right characters.",
          },
        ],
      },
      {
        id: "safety",
        title: "Safety",
        body: [
          {
            text: "The three layers never touch URLs, email addresses or domains. Running any of them twice gives the same result.",
          },
        ],
      },
      {
        id: "care",
        title: "Languages, names and numbers",
        body: [
          { text: "<Hyphenate>", code: true },
          { text: " leaves text alone inside a non-Icelandic " },
          { text: "lang", code: true },
          {
            text: ": no Icelandic hyphenation and no locale details. A nested ",
          },
          { text: 'lang="is"', code: true },
          {
            text: " turns them back on. A page in another language passes its own lang prop. Input becomes NFC first, so decomposed letters, like those in macOS file names, still hyphenate.",
          },
        ],
      },
    ],
    css: {
      id: "css-pairs",
      title: "CSS it pairs with",
      intro:
        "These CSS properties decide how the browser uses the breaks. They are optional. Each pair sets the same text at the same width, without and with the property. Drag the width: at some widths the two agree, at others they differ.",
      without: "Without",
      with: "With",
      usedLabel: "Used here",
      supportLabel: "Support",
      snippetLabel: "HTML",
      rows: [
        {
          id: "pretty",
          property: "text-wrap: pretty",
          what: "Stops a paragraph from ending on one short word. Safari 26 and later also even out the right edge. Chrome adjusts only the last few lines.",
          used: [
            {
              text: "The paragraphs in Real interfaces, the steps on this page and the body text in Try it.",
            },
          ],
          support: [
            {
              text: "Chrome 117+ and Safari 26+ support it. Firefox does not and falls back to normal wrapping. The locale details rule ",
            },
            { text: "lastWords", code: true },
            {
              text: " does part of the same job, for the last two words only. Use it as a fallback for Firefox and older Safari.",
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
          what: "manual, the CSS default, adds a hyphen only at a soft hyphen. Skiptingar puts those in. auto asks the browser’s own dictionary. Only Firefox has an Icelandic one.",
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
          what: "Tells screen readers which language to speak and the browser which language rules to use. hyphens: auto needs it.",
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

<Hyphenate>
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
          text: "The first paragraph of your text at three sizes, in the same width. Smaller type fits more letters on a line, so the breaks change.",
        },
      ],
    },
    heading: {
      label: "Heading, phone width",
      hint: [
        {
          text: "Without the package a long compound runs out of the box. With it the word breaks where the patterns allow, and ",
        },
        { text: "text-wrap: balance", code: true },
        { text: " evens out the lines when the text-wrap switch is on. " },
        { text: "Why, with and without", href: "#css-pairs" },
      ],
      headings: [
        "Vaðlaheiðarvegavinnuverkfærageymsluskúr",
        "Hraðbrautarframkvæmdir á landsbyggðinni",
      ],
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
    mixed: {
      label: "Mixed languages",
      hint: [
        { text: "The two English phrases sit in " },
        { text: '<span lang="en">', code: true },
        {
          text: ". The · marks show the result: the Icelandic words get breaks, and the English words stay whole.",
        },
      ],
      before: "Enska orðið ",
      word: "internationalization",
      middle: " og orðasambandið ",
      phrase: "accessibility guidelines",
      after: " haldast óbreytt, en íslensku orðunum er skipt milli lína.",
    },
  },

  /**
   * Section B, Where Icelandic breaks: the core only. Every rule is checked
   * against `src/packages/skiptingar/src/hyphenate.ts` under its defaults (the
   * 2020 patterns and the Ritreglur minimums). The example words are set by
   * the package when the page renders, so no break position is typed here: an
   * `options` object is passed to `hyphenate()` as it stands.
   */
  breaksSection: {
    order: {
      label: "How a word gets its breaks",
      steps: [
        {
          id: "patterns",
          title: "Letter patterns",
          body: [
            {
              text: "The 2020 letter patterns from the Árni Magnússon Institute mark where a word may break. They work on syllables, not on where a compound’s parts meet, so a break can fall inside a part. The official spelling rules (Ritreglur) then remove breaks with too little room: at least 1 letter before a break and 2 after, in words of 4 letters or more. The 4 is Skiptingar’s own choice.",
            },
          ],
        },
        {
          id: "typographic",
          title: "Better breaks (on by default)",
          body: [
            {
              text: "Better breaks then drop legal breaks that read badly. They are new and under development, so they may change and give odd results. Turn them off in Try it, or with ",
            },
            { text: 'rules: "ritreglur"', code: true },
            {
              text: ", for the official minimums only. Better breaks control which breaks to keep. Locale details are a separate layer for spaces, quotes and dashes.",
            },
          ],
        },
        {
          id: "server",
          title: "Soft hyphens, on the server",
          body: [
            {
              text: "The server puts the remaining breaks in the text as soft hyphens. The browser picks which break each line uses.",
            },
          ],
        },
      ],
    },
    rules: {
      label: "Examples",
      hint: [
        {
          text: "The package sets each example; none is typed by hand. Each shows the same word with better breaks off (Ritreglur only) and on (the default).",
        },
      ],
      items: [
        {
          id: "linking",
          title: "Linking syllable",
          body: [
            {
              text: "The rule drops the break before a linking syllable (ar, ur, is, ir), so a genitive stays with its stem. Without the rule the break falls inside a part, as in ",
            },
            { text: "sveit-ar", sample: true },
            { text: "." },
          ],
          word: "sveitarstjórnarkosningum",
          shown: [
            { label: "Ritreglur", options: { rules: "ritreglur" } },
            { label: "Typographic (default)", options: {} },
          ],
        },
        {
          id: "room",
          title: "Room",
          body: [
            {
              text: "Body words need 6 or more letters, with 2 before a break and 3 after. A break after one letter is legal but reads badly.",
            },
          ],
          word: "ólán",
          shown: [
            { label: "Ritreglur", options: { rules: "ritreglur" } },
            { label: "Typographic (default)", options: {} },
          ],
        },
        {
          id: "foreign",
          title: "Foreign names",
          body: [
            {
              text: "A capitalised name with c, q or w, letters Icelandic spelling does not use, stays whole.",
            },
          ],
          word: "Icelandair",
          shown: [
            { label: "Ritreglur", options: { rules: "ritreglur" } },
            { label: "Typographic (default)", options: {} },
          ],
        },
      ],
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
        "The browser does some things for Icelandic and not others. These notes say what to use instead of writing it yourself.",
      items: [
        {
          id: "intl",
          term: "Dates and numbers",
          body: [
            {
              text: "Chrome and Edge on the desktop have no Icelandic Intl data. In a test on macOS, Chrome 154 showed dates in English, and ",
            },
            { text: 'Intl.Collator("is")', code: true },
            {
              text: " sorted æ next to a and ö with o, and á, é and í as plain a, e and i. Node, Bun, Firefox and Safari work as they should. Format dates and numbers on the server. For sorting in the browser, use ",
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
              text: " (the npm package) already maps þ to th, ð to d, æ to ae and ö to o, as the ÍST 130 table does.",
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
              text: " stay together with the locale details. Browsers otherwise break after the hyphen.",
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
                text: "What makes the uneven right edge of a paragraph look good: no short last line, an even right edge, hyphens where they help. A live demo draws the plain text faintly behind the improved one.",
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
                text: "Chrome’s version. It stops a paragraph from ending on one word. Near the end it adjusts hyphenation and earlier lines, so its effect shows at some widths and not at others.",
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
                text: "When to balance a title. Browsers balance only blocks of a few lines, so use it for titles and captions, not paragraphs.",
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
                text: "A counterpoint: in text with an uneven right edge, hyphenation is optional, and headings are better without it. Skiptingar only offers the places to break. You choose which text gets them.",
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
                text: "The thesis behind the patterns Skiptingar uses. It is why no word list is needed.",
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
                text: "The official rules for breaking Icelandic words between lines. Skiptingar follows them through the patterns, which miss a few breaks and allow a few that the rules forbid.",
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
                text: "Hangs an opening „ outside the text’s edge, so a line that starts with a quote still lines up. Few browsers support it. The rest ignore it, so it is safe to add.",
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
                text: "A server-side HTML pre-processor for hanging punctuation, optical margin alignment and small caps. It has its own quotes and hyphenation. Turn off ",
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
                text: "A neural model that finds where a compound’s parts meet. Use it to check a break.",
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
        tip: "Puts a no-break space between a number and its unit, so 1.000 kr. and 5 km stay on one line.",
        input: "Verð 1.000 kr. og 5 km leið í 20 °C hita.",
      },
      {
        id: "dates",
        measure: 9,
        label: "Date",
        tag: "dates",
        tip: "Keeps a month and the year after it together, so sep. 2026 and sept. 2027 stay on one line.",
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
        tip: "Keeps an abbreviation with the number after it, so nr. 5, bls. 12 and kl. 14.30 stay on one line. Standard abbreviations like t.d. and o.s.frv. have no spaces, so they never break.",
        input: "Sjá bls. 12, nr. 5 og kl. 14.30.",
      },
      {
        id: "numbers",
        measure: 9.5,
        label: "Kennitala and phone",
        tag: "numbers",
        tip: "Kennitala and phone numbers stay on one line. The hyphen becomes a no-break hyphen (U+2011) and the spaces become no-break spaces. CleanCopy puts a normal hyphen back when you copy.",
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
        tip: "Puts a no-break space after a one-letter word, so it never ends a line. This rule is off by default, so this row turns it on.",
        input: "Hún á hest og býr í Kópavogi.",
        options: { singleLetter: true },
      },
      {
        id: "last-words",
        measure: 11,
        label: "Last two words",
        tag: "lastWords",
        tip: "Puts a no-break space between the last two words of the text, so the last line is never a single word. This rule is off by default, so this row turns it on. Prefer text-pretty where the browser supports it.",
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
        tip: "Straight double quotes become Icelandic „…“. A paired 'word' becomes ‚word‘, the mark for a word’s meaning (Ritreglur §28.2). A quote inside a quote uses „…“ again. Type it that way (§28.1).",
        input: "Hann sagði \"komdu heim\" og orðið fákur merkir 'hestur'.",
      },
      {
        id: "dashes",
        measure: 13.5,
        label: "Dashes",
        tag: "dashes",
        tip: "Swaps the hyphen in a number range, and a spaced hyphen, for an en dash. This rule is off by default, so this row turns it on.",
        input: "Árin 1990-2000 var veturinn - og þá sérstaklega febrúar - óvenju mildur.",
        options: { dashes: true },
      },
    ],
  },
} as const;
