/**
 * Copy for /localhost/hyphenation: the playground for the `skiptingar` package.
 * The Icelandic texts are the samples; the English strings are the page's own
 * labels. The exception line in `breakEditor` is the format of
 * `src/packages/skiptingar/data/exceptions.txt`.
 */

import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";

const njallSample =
  "Mörður hét maður er kallaður var gígja. Hann var sonur Sighvats hins rauða. Hann bjó á Velli á Rangárvöllum. Hann var ríkur höfðingi og málafylgjumaður mikill og svo mikill lögmaður að engir þóttu löglegir dómar dæmdir nema hann væri við. Hann átti dóttur eina er Unnur hét. Hún var væn kona og kurteis og vel að sér og þótti sá bestur kostur á Rangárvöllum.";

const samples = {
  jonas:
    "Ísland! farsældafrón og hagsælda hrímhvíta móðir! Hvar er þín fornaldarfrægð, frelsið og manndáðin best?",
  njall: njallSample,
  constitution: {
    first: "Ísland er lýðveldi með þingbundinni stjórn.",
    second:
      "Alþingi og forseti Íslands fara saman með löggjafarvaldið. Forseti og önnur stjórnarvöld samkvæmt stjórnarskrá þessari og öðrum landslögum fara með framkvæmdarvaldið. Dómendur fara með dómsvaldið.",
  },
  credits: {
    jonas: "Jónas Hallgrímsson, Ísland (Fjölnir 1835; texti eftir Ljóðmæli 1847)",
    njall: "Brennu-Njáls saga, 1. kafli",
    constitution: "Stjórnarskrá lýðveldisins Íslands, 1. og 2. gr.",
  },
} as const;

export const localhostHyphenationContent = {
  // The copy that client components read (`marks`, `tips`, `liveEditor`,
  // `breakEditor`) is defined in its own file; client code imports that file.
  ...localhostHyphenationClientContent,
  samples,

  page: {
    title: "Skiptingar — Icelandic text, set well",
    description:
      "Skiptingar hyphenates Icelandic text and evens ragged edges. It helps titles break at the right joint, and numbers, dates and names stay together.",
  },

  shell: {
    navLabel: "Sections",
  },

  hero: {
    /** The name a screen reader says. The visible title has its hyphens typed in. */
    name: "Skiptingar",
    title: "Skipt-ing-ar",
    lede: "Skiptingar hyphenates Icelandic text and evens ragged edges. It helps titles break at the right joint, and numbers, dates and names stay together.",
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
          "words checked by hand, where the patterns get it wrong. The list grows with every wrong break someone reports, so the results get better with use.",
      },
      {
        count: "shortWords",
        description:
          "short words like og and í that settling the rag keeps off line ends, judged line by line as a typesetter would, along with holes, jutting lines and short hyphen pieces. The list and the judgement get better with use.",
      },
      {
        value: "0 kB",
        description:
          "of hyphenation code on a normal page. The server puts the soft hyphens in, so every browser breaks the lines in the same places.",
      },
    ],
  },

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
        { text: "Hyphenation patterns © " },
        {
          text: "Árni Magnússon Institute for Icelandic Studies",
          href: "https://github.com/icelandic-lt/hyphenation-is",
        },
        { text: ", CC BY 4.0" },
      ],
      [{ text: "skiptingar: MIT code, CC0 exception list" }],
    ],
  },

  sections: {
    liveEditor: {
      id: "live-editor",
      number: "A",
      nav: "Editor",
      label: "Live editor",
      explanation:
        "Pick an example or write your own, and change the settings. The settings apply to the whole page, and the arrow sends your text to Sizes and Compare.",
    },
    sizes: {
      id: "sizes",
      number: "B",
      nav: "Sizes",
      label: "Sizes",
      explanation:
        "The first paragraph of your text at three sizes, in the same measure. Smaller type fits more letters on a line, so the breaks land in different places.",
    },
    compare: {
      id: "compare",
      number: "C",
      nav: "Compare",
      label: "Compare",
      explanation:
        "The first paragraph of your text three ways, at one width. Drag the width and watch the right edge. Then the old TeX patterns against the 2020 ones.",
    },
    howItWorks: {
      id: "how-it-works",
      number: "D",
      nav: "How it works",
      label: "How it works",
      explanation:
        "From a word to a well-set line. The server does the work, so a normal page downloads nothing extra.",
    },
    samples: {
      id: "samples",
      number: "E",
      nav: "Samples",
      label: "Samples",
      explanation:
        "Icelandic text in the places it turns up on a page, each without the package and with it. The With side follows the page settings.",
    },
    typography: {
      id: "typography",
      number: "F",
      nav: "Typography",
      label: "Typography",
      explanation: `Each rule swaps a plain space or quote for a better one. Off shows the text as written. On shows the typeset text, with every no-break space and non-breaking hyphen on an amber fill.`,
    },
    breakEditor: {
      id: "break-editor",
      number: "G",
      nav: "Report",
      label: "Report a wrong break",
      explanation: "Fix the breaks, copy the line, add it to data/exceptions.txt.",
    },
    related: {
      id: "related",
      number: "H",
      nav: "Related",
      label: "Related",
      explanation:
        "Reading on setting text well, and tools that do the parts skiptingar leaves alone.",
    },
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
        tip: "No hyphenation at all. The browser breaks only at spaces, so long words stick out or leave gaps.",
      },
      browser: {
        label: "Browser",
        tip: "The browser's own hyphenation, from the CSS rule hyphens: auto. It needs a dictionary for the language. Firefox ships an Icelandic hyphenation dictionary. Chrome does not. Safari does not appear to. Test it in this column.",
        hint: "Firefox ships an Icelandic hyphenation dictionary. Chrome does not. Safari does not appear to. Test it in your browser.",
      },
      skiptingar: {
        label: "skiptingar",
        tip: "Soft hyphens added on the server from the 2020 patterns. Every browser breaks in the same places.",
      },
    },
    table: {
      caption: "TeX patterns vs 2020 patterns",
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
      note: "The 2020 data fixes compound joints and adds legal one-letter breaks. The typographic preset drops the one-letter ones.",
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
          note: "The typographic rules keep the breaks with room on both sides. The exception list fixes the words the patterns get wrong.",
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
            text: "This is Franklin Liang's algorithm from 1983, the one TeX uses. There is no dictionary. About {patterns} short letter patterns carry numbers between the letters, like ",
          },
          { text: "af4lið.", code: true },
          {
            text: " (the dot is the end of the word). An odd number allows a break, an even number forbids one, and the highest number at each spot wins. The patterns are the 2020 Icelandic list from the Árni Magnússon Institute (CC BY 4.0). It gets compound joints right: ",
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
            text: " (CC0) overrides the patterns for words they get wrong. A ",
          },
          { text: "-", code: true },
          { text: " marks a break and a " },
          { text: "=", code: true },
          {
            text: " marks a compound joint. In heading mode, a word on the list breaks only at its joints.",
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
          { text: " allows every break the official spelling rules allow, such as " },
          { text: "ó-lán", sample: true },
          {
            text: ", with 1 letter before and 2 after, in words of 4 or more letters (skiptingar's own limit). Typographic never breaks where Ritreglur forbids it.",
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
            text: ". The browser gets plain HTML, so a page that only uses it ships 0 kB of hyphenation code, and the breaks are the same in every browser. The browser still picks which break to use on each line. CSS ",
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
            text: ", and straight quotes become Icelandic „…“. The text never changes length, so it can run across a whole JSX tree at once and pair quotes across inline elements such as ",
          },
          { text: "<strong>", code: true },
          { text: ". One rule, " },
          { text: "lastWords", code: true },
          { text: ", keeps the last line from being a single word. " },
          { text: "text-pretty", code: true },
          { text: " does that better where the browser supports it, so use " },
          { text: "lastWords", code: true },
          { text: " only as a fallback for Firefox, which does not support " },
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
          { text: ", about 70 kB compressed, loaded on first use." },
        ],
      },
      {
        id: "care",
        title: "Languages, names and numbers",
        body: [
          { text: "<Hyphenate>", code: true },
          { text: " leaves text under a non-Icelandic " },
          { text: "lang", code: true },
          {
            text: " alone, with no Icelandic hyphenation and no Icelandic quotes, and a nested ",
          },
          { text: 'lang="is"', code: true },
          {
            text: " turns it back on. Input is turned into NFC first, so decomposed letters, like those in macOS file names, still hyphenate. All-caps words of 4 to 8 letters, such as UNESCO, never break. Place names and patronymics break at their joint in heading mode, as in ",
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
        "skiptingar only decides where a word may break. These properties decide how the browser uses those breaks. Each pair sets the same text at the same width, without and with the property. Drag the width: at some widths the two agree, at others they part.",
      without: "Without",
      with: "With",
      usedLabel: "Used here",
      supportLabel: "Support",
      snippetLabel: "HTML",
      rows: [
        {
          id: "pretty",
          property: "text-wrap: pretty",
          what: "Stops a paragraph from ending on one short word, and evens out the ragged right edge.",
          used: [
            {
              text: "The paragraphs in Samples, the steps on this page and the live editor's body text.",
            },
          ],
          support: [
            {
              text: "Chrome 117+ and Safari 26+ support it. Firefox does not, and falls back to normal wrapping. The typeset rule ",
            },
            { text: "lastWords", code: true },
            {
              text: " does part of the same job, but only for the last two words, so use it as a fallback for Firefox only.",
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
              text: "The section titles, the titles in the live editor and the heading samples.",
            },
          ],
          withoutCaption: "text-wrap: wrap",
          withCaption: "text-wrap: balance",
        },
        {
          id: "hyphens",
          property: "hyphens: manual and auto",
          what: "manual, the CSS default, breaks a word only at a soft hyphen, and those are the ones skiptingar puts in. auto asks the browser's own dictionary. Firefox ships an Icelandic hyphenation dictionary. Chrome does not. Safari does not appear to. Test it in the Compare section.",
          used: [
            {
              text: "Every hyphenated text on this page uses manual. The Browser column in ",
            },
            { text: "Compare", href: "#compare" },
            { text: " uses auto on purpose." },
          ],
          withoutCaption: "hyphens: auto",
          withCaption: "hyphens: manual, with skiptingar",
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
              text: " sorts þ after z. Node, Bun, Firefox and Safari are fine. Format dates and numbers on the server, and for sorting in the browser use ",
            },
            { text: "cldr-is", href: "https://github.com/gudrodur/cldr-is" },
            { text: "." },
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
              text: " are kept together by typeset(). Chrome otherwise breaks after the hyphen (tested in Chrome 154 on macOS).",
            },
          ],
        },
      ],
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
          text: "A narrow column of saga prose. Compare the right edges, and the last line: ",
        },
        { text: "text-wrap: pretty", code: true },
        { text: " keeps it from being one short word. " },
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
          label: "Menntamálaráðuneytið",
          description: "Skólamál og menningarmál.",
        },
        {
          label: "Umhverfisstofnun",
          description: "Náttúruvernd og loftslagsmál.",
        },
        {
          label: "Ferðaþjónustufyrirtæki",
          description: "Ferðir og afþreying.",
        },
        {
          label: "Sveitarstjórnarkosningar",
          description: "Kosið verður 16. maí 2026.",
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
          text: "Heading mode, with the page's rules. Each · is a place the name may break: the joint before its ending, such as ",
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
        ' haldast óbreytt, en íslensku orðin brotna og "gæsalappirnar" verða íslenskar.',
    },
    acronyms: {
      label: "Acronyms",
      hint: [
        {
          text: "All-caps words of 4 to 8 letters never break. Longer ones still do. The · marks show where each word may break.",
        },
      ],
      text: "UNESCO og NATO haldast heil, en KEFLAVÍKURFLUGVÖLLUR brotnar.",
    },
  },

  /**
   * Reading and tools that sit next to skiptingar. Not credits: each one is
   * here because it helps set Icelandic text well alongside the package.
   */
  related: {
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
                text: "Chrome's take on the same property. It keeps a paragraph from ending on one word, and near the end it adjusts hyphenation and earlier lines to make room. That is why its effect shows at some widths and not at others.",
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
            source: "Butterick's Practical Typography",
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
                text: "The thesis behind the patterns skiptingar runs, and the reason it needs no dictionary.",
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
                text: "The official rules for breaking Icelandic words between lines. The Ritreglur preset follows them; the typographic preset is stricter and never breaks where they forbid it.",
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
            href: "https://developer.mozilla.org/en-US/docs/Web/CSS/hanging-punctuation",
            body: [
              {
                text: "Hangs an opening „ outside the text's edge, so a line that starts with a quote still lines up. Few browsers support it, and the rest ignore it, so it is safe to add.",
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
              { text: " and let skiptingar do those for Icelandic." },
            ],
          },
          {
            id: "hyphenopoly",
            title: "Hyphenopoly",
            source: "Mathias Nater",
            href: "https://mnater.github.io/Hyphenopoly/",
            body: [
              {
                text: "Hyphenation for many other languages, in the browser. skiptingar leaves text under another ",
              },
              { text: "lang", code: true },
              { text: " alone, so the two can share a page." },
            ],
          },
          {
            id: "ylhyra",
            title: "Icelandic hyphenation",
            source: "Ylhýra",
            href: "http://hyphenation.ylhyra.is/",
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

  typography: {
    /** The two column captions: the text as written, and typeset. */
    off: "Off",
    on: "On",
    /** `options` is the `typeset()` option that the row turns on. */
    rules: [
      {
        id: "units",
        label: "Number and unit",
        tag: "units",
        tip: "Puts a no-break space between a number and its unit, so 1.000 kr. and 5 km never split across two lines.",
        input: "Verð 1.000 kr. og 5 km leið í 20 °C hita.",
      },
      {
        id: "dates",
        label: "Date",
        tag: "dates",
        tip: "Keeps a month and the year after it together, so sep. 2026 and sept. 2027 never split.",
        input: "Opnað 30. sep. 2026 og lokað í sept. 2027.",
      },
      {
        id: "ordinals",
        label: "Ordinal",
        tag: "ordinals",
        tip: "Keeps a number with a full stop, like 1. or 30., on the same line as the lowercase word after it.",
        input: "Hún lenti í 1. sæti á 2. hæð.",
      },
      {
        id: "prefixes",
        label: "Abbreviation and number",
        tag: "prefixes",
        tip: "Keeps an abbreviation with the number that follows it, so nr. 5, bls. 12 or kl. 14.30 never split across lines. Standard abbreviations like t.d. and o.s.frv. have no spaces, so they never break.",
        input: "Sjá bls. 12, nr. 5 og kl. 14.30.",
      },
      {
        id: "numbers",
        label: "Kennitala and phone",
        tag: "numbers",
        tip: "Kennitala and phone numbers never split across lines: the hyphen becomes a non-breaking hyphen (U+2011) and the spaces become no-break spaces. CleanCopy puts a normal hyphen back when you copy.",
        input: "Kennitala 010190-2939, sími 555-1234 eða +354 555 1234.",
      },
      {
        id: "titles",
        label: "Titles",
        tag: "titles",
        tip: "Keeps dr., sr., próf. and hr. on the same line as the capitalised name after them.",
        input: "Fundur með dr. Jóni og sr. Önnu.",
      },
      {
        id: "quotes",
        label: "Quotes",
        tag: "quotes",
        tip: "Straight double quotes become Icelandic „…“. A paired 'word' becomes ‚word‘, the mark for a word's meaning (Ritreglur §28.2). A quote inside a quote uses „…“ again: type it that way (§28.1).",
        input: "Hann sagði \"komdu heim\" og orðið fákur merkir 'hestur'.",
      },
      {
        id: "dashes",
        label: "Dashes",
        tag: "dashes",
        tip: "Swaps the hyphen in a number range, and a spaced hyphen, for an en dash. Off by default, so this row turns it on.",
        input: "Árin 1990-2000 var fjallið - og lognið - hljótt.",
        options: { dashes: true },
      },
      {
        id: "single-letter",
        label: "One-letter words",
        tag: "singleLetter",
        tip: "Puts a no-break space after a one-letter word, so it never ends a line alone. Off by default, so this row turns it on.",
        input: "Hún á hest og býr í Kópavogi.",
        options: { singleLetter: true },
      },
      {
        id: "last-words",
        label: "Last two words",
        tag: "lastWords",
        tip: "Puts a no-break space between the last two words of the text, so the last line is never a single word. Off by default, so this row turns it on. text-pretty does this better where the browser supports it, so use this rule only as a fallback for Firefox, which does not support it.",
        input: "Þau fóru saman til Akureyrar",
        options: { lastWords: true },
      },
    ],
  },
} as const;
