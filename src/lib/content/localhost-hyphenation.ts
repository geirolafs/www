/**
 * Copy for /localhost/hyphenation: the playground for the `skiptingar` package.
 * The Icelandic texts are the samples; the English strings are the page's own
 * labels. The exception line in `breakEditor` is the format of
 * `src/packages/skiptingar/data/exceptions.txt`.
 */

const samples = {
  jonas:
    "Ísland! farsældafrón og hagsælda hrímhvíta móðir! Hvar er þín fornaldarfrægð, frelsið og manndáðin best?",
  njall:
    "Mörður hét maður er kallaður var gígja. Hann var sonur Sighvats hins rauða. Hann bjó á Velli á Rangárvöllum. Hann var ríkur höfðingi og málafylgjumaður mikill og svo mikill lögmaður að engir þóttu löglegir dómar dæmdir nema hann væri við. Hann átti dóttur eina er Unnur hét. Hún var væn kona og kurteis og vel að sér og þótti sá bestur kostur á Rangárvöllum.",
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

/** Shown in place of the characters that are invisible in normal text. */
const marks = {
  softHyphen: "·",
  noBreakSpace: "⍽",
  nonBreakingHyphen: "‑",
} as const;

export const localhostHyphenationContent = {
  samples,
  marks,

  page: {
    title: "skiptingar — Icelandic hyphenation",
    description:
      "skiptingar hyphenates Icelandic text on the server. Try it in the live editor, compare the patterns and report a wrong break.",
  },

  tips: {
    /** The accessible name of an "i" button: what it explains. */
    help: (name: string) => `About ${name}`,
    mark: "i",
    softHyphen:
      "A soft hyphen (U+00AD) is an invisible character. It shows a hyphen only when the line breaks right there.",
    noBreakSpace:
      "A no-break space (U+00A0) looks like a space but keeps the words on both sides of it on one line.",
  },

  shell: {
    navLabel: "Sections",
  },

  hero: {
    /** The name a screen reader says. The visible title has its hyphens typed in. */
    name: "Skiptingar",
    title: "Skipt-ing-ar",
    lede: "Skiptingar adds soft hyphens into Icelandic text on the server, so long compounds break where they should.",
    stats: [
      {
        // The number itself is read from the package, on the server.
        count: "patterns",
        label: "Patterns",
        tip: "Short letter patterns from the 2020 Árni Magnússon data. They say where an Icelandic word may break. This is Liang's method, the one TeX uses.",
      },
      {
        count: "exceptions",
        label: "Exceptions",
        tip: "Words checked by hand. Each one overrides the patterns where they get the word wrong.",
      },
      {
        value: "0 kB",
        label: "On the server path",
        tip: "A page that only uses <Hyphenate> ships no hyphenation code: the server inserts the soft hyphens. This page's live editor and break editor load the engine on purpose, about 70 kB compressed.",
      },
      {
        value: "2020",
        label: "Data",
        tip: "The 2020 Icelandic hyphenation list from the Árni Magnússon Institute. It fixes compound joints that the older TeX patterns get wrong.",
      },
    ],
  },

  colophon: {
    label: "Colophon",
    lines: [
      [
        { text: "Set in " },
        { text: "Geist", href: "https://vercel.com/font" },
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
      number: "01",
      nav: "Live editor",
      label: "Live editor",
      explanation:
        "Edit the text and change the settings. The box below it shows what the components would render, at the width you choose.",
    },
    sizes: {
      id: "sizes",
      number: "02",
      nav: "Sizes",
      label: "Sizes",
      explanation:
        "One paragraph at three sizes, in the same measure. The breaks land in different places.",
    },
    compare: {
      id: "compare",
      number: "03",
      nav: "Compare",
      label: "Compare",
      explanation:
        "The same paragraph three ways, in a box that is narrow on purpose. Then the old TeX patterns against the 2020 ones.",
    },
    howItWorks: {
      id: "how-it-works",
      number: "04",
      nav: "How it works",
      label: "How it works",
      explanation:
        "Seven steps from a list of patterns to a line that breaks well. The server does the work, so a normal page downloads nothing extra.",
    },
    samples: {
      id: "samples",
      number: "05",
      nav: "Samples",
      label: "Samples",
      explanation: "Icelandic text in the places it turns up on a page.",
    },
    typography: {
      id: "typography",
      number: "06",
      nav: "Typography",
      label: "Typography",
      explanation: `Each rule swaps a plain space or quote for a better one. Off shows the text as written. On shows the typeset text, with ${marks.noBreakSpace} for every no-break space and a dotted ${marks.nonBreakingHyphen} for every non-breaking hyphen.`,
    },
    breakEditor: {
      id: "break-editor",
      number: "07",
      nav: "Break editor",
      label: "Report a wrong break",
      explanation: "Fix the breaks, copy the line, add it to data/exceptions.txt.",
    },
  },

  liveEditor: {
    textLabel: "Text",
    outputLabel: "Output",
    initialText: samples.njall,
    mode: {
      label: "Mode",
      tip: "Body breaks a word at every allowed spot. Heading is stricter: only long words break, with more letters kept on each side of a break, and a word on the exception list breaks only at its compound joints.",
      options: [
        { value: "body", label: "Body" },
        { value: "heading", label: "Heading" },
      ],
    },
    rules: {
      label: "Rules",
      tip: "Typographic keeps only breaks that look good: in body text, words of 6 or more letters with 2 letters before and 3 after the break (in a heading 12, 3 and 4). Ritreglur allows every break the official spelling rules allow: 1 letter before, 2 after. Words of 4+ letters (skiptingar's own limit).",
      options: [
        { value: "typographic", label: "Typographic" },
        { value: "ritreglur", label: "Ritreglur" },
      ],
    },
    options: {
      label: "Options",
    },
    typeset: {
      label: "Typeset",
      tip: "Swaps some spaces for no-break spaces, in 1.000 kr. and 30. september for example, and straight quotes for Icelandic quotes. It never changes the length of the text.",
    },
    showBreaks: {
      label: "Show breaks",
      tip: "Draws · for every soft hyphen, ⍽ for every no-break space and a dotted ‑ for every non-breaking hyphen (U+2011), so you can see what the components put in.",
    },
    textWrap: {
      label: "text-wrap",
      tip: "text-pretty (text-wrap: pretty) stops a paragraph ending on one short word and evens out the ragged edge. text-balance (text-wrap: balance) evens out the lines of a heading. Body mode uses pretty and heading mode uses balance. Off wraps each line greedily. How it works shows each one with and without.",
    },
    width: {
      label: "Width",
      tip: "Drag to resize the box below. The breaks move with its edge.",
      min: 120,
      max: 720,
      step: 10,
      initial: 320,
      value: (px: number) => `${px} px`,
    },
    breaks: (count: number) => `${count} ${count === 1 ? "break" : "breaks"}`,
    noBreakSpaces: (count: number) =>
      `${count} no-break ${count === 1 ? "space" : "spaces"}`,
  },

  sizes: {
    text: samples.njall,
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
    pipelineLabel: "The pipeline",
    pipelineArrow: "→",
    pipeline: [
      "Icelandic text",
      "Patterns and exceptions",
      "Soft hyphens, on the server",
      "Plain HTML, the browser breaks the line",
    ],
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
          { text: "þjóð-fé-lags-um-ræða", code: true },
          { text: ", where the older TeX patterns gave " },
          { text: "þjóð-fé-lagsum-ræða", code: true },
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
          { text: "ó-lán", code: true },
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
          { text: "1.000 kr.", code: true },
          { text: ", " },
          { text: "30. september", code: true },
          { text: ", " },
          { text: "bls. 12", code: true },
          { text: " and " },
          { text: "dr. Jón", code: true },
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
          { text: "Sigurðar-dóttir", code: true },
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
        "skiptingar only decides where a word may break. These properties decide how the browser uses those breaks. Each pair shows the same text at the same width, without and with the property.",
      without: "Without",
      with: "With",
      usedLabel: "Used here",
      supportLabel: "Support",
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
              text: "The hero, the section titles, the heading samples and the pangram.",
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
        {
          id: "numeric",
          property: "font-variant-numeric: tabular-nums",
          what: "Gives every digit the same width, so numbers line up in a column. The example is set in Geist, the page's own text face.",
          used: [
            {
              text: "The figures at the top of the page, the section numbers, the price table in Samples and the width readout.",
            },
          ],
          withoutCaption: "font-variant-numeric: normal",
          withCaption: "font-variant-numeric: tabular-nums",
          numbers: ["1.111 kr.", "12.990 kr.", "4.500 kr.", "111.111 kr."],
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
            { text: "til Jóns", code: true },
            { text: " and " },
            { text: "Jóni", code: true },
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
            { text: "555-1234", code: true },
            { text: " and " },
            { text: "555 1234", code: true },
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
        { text: "text-balance", code: true },
        { text: " evens out the lines, so a heading does not end on one word. " },
        { text: "Why, with and without", href: "#css-pairs" },
      ],
      headings: [
        "Vaðlaheiðarvegavinnuverkfærageymsluskúr",
        "Hraðbrautarframkvæmdir á landsbyggðinni",
      ],
    },
    short: {
      label: "Short paragraph",
      hint: [
        { text: "text-pretty", code: true },
        { text: " stops the last line being one short word. " },
        { text: "Why, with and without", href: "#css-pairs" },
      ],
      text: samples.jonas,
      credit: samples.credits.jonas,
    },
    long: {
      label: "Long paragraph",
      hint: [
        { text: "text-pretty", code: true },
        { text: " stops the last line being one short word. " },
        { text: "Why, with and without", href: "#css-pairs" },
      ],
      text: samples.njall,
      credit: samples.credits.njall,
    },
    law: {
      label: "Law text",
      hint: [
        { text: "text-pretty", code: true },
        { text: " stops the last line being one short word. " },
        { text: "Why, with and without", href: "#css-pairs" },
      ],
      articles: [
        { number: "1. gr.", text: samples.constitution.first },
        { number: "2. gr.", text: samples.constitution.second },
      ],
      credit: samples.credits.constitution,
    },
    cards: {
      label: "Card grid",
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
    navigation: {
      label: "Buttons and navigation",
      navLabel: "Sample navigation",
      href: "/localhost/hyphenation",
      links: ["Upplýsingatækniþjónusta", "Þjónustuver", "Fyrirspurnir"],
      button: "Skráðu þig á póstlistann",
    },
    table: {
      label: "Table cell",
      headers: ["Vara", "Verð", "Afhending"],
      rows: [
        ["Leturgerðarþjónusta", "12.990 kr.", "30. september"],
        ["Umbrotshugbúnaður", "4.500 kr.", "1. október"],
        ["Vefhönnunarráðgjöf", "25.000 kr.", "15. nóvember"],
      ],
    },
    names: {
      label: "Names and places",
      hint: [
        {
          text: "Heading mode, typographic rules. Each · is the one place the name may break: the joint before its ending, such as ",
        },
        { text: "-dóttir", code: true },
        { text: " or " },
        { text: "-eyjar", code: true },
        { text: ". Names under 12 letters, like " },
        { text: "Akureyri", code: true },
        { text: ", stay whole here. With " },
        { text: 'rules: "ritreglur"', code: true },
        { text: " they break too: " },
        { text: "Akur·eyri", code: true },
        { text: "." },
      ],
      names: [
        "Sigurðardóttir",
        "Vestmannaeyjar",
        "Guðmundsdóttir",
        "Stykkishólmur",
        "Seyðisfjörður",
        "Hafnarfjörður",
      ],
    },
    mixed: {
      label: "Mixed languages",
      hint: [
        { text: "The two English phrases sit in " },
        { text: '<span lang="en">', code: true },
        {
          text: ". Text under another language is left alone: no Icelandic hyphenation and no Icelandic quotes. The Icelandic words around it break as usual.",
        },
      ],
      before: "Enska orðið ",
      word: "internationalization",
      middle: " og tilvitnunin ",
      quote: '"straight quotes"',
      after: " haldast óbreytt, en íslensku orðin brotna þar sem þau eiga að brotna.",
    },
    acronyms: {
      label: "Acronyms",
      hint: [
        { text: "All-caps words of 4 to 8 letters never break. Longer ones still do." },
      ],
      text: "UNESCO og NATO haldast heil, en KEFLAVÍKURFLUGVÖLLUR brotnar.",
    },
    pangram: {
      label: "Pangram",
      hint: [
        { text: "Every Icelandic letter, at five weights. " },
        { text: "text-balance", code: true },
        { text: " evens out the lines. " },
        { text: "Why, with and without", href: "#css-pairs" },
      ],
      text: "Kæmi ný öxi hér ykist þjófum nú bæði víl og ádrepa",
    },
  },

  typography: {
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

  breakEditor: {
    wordLabel: "Word",
    initialWord: "þjóðfélagsumræða",
    lineLabel: "Exception line",
    gapsLabel: "Breaks between letters",
    keyLabel: "Key",
    states: {
      none: {
        name: "none",
        mark: "·",
        tip: "No break here. The word stays whole at this spot.",
      },
      break: {
        name: "break",
        mark: "-",
        tip: "A line may break here. It becomes a soft hyphen.",
      },
      joint: {
        name: "compound joint",
        mark: "=",
        tip: "The seam between two parts of a compound. In heading mode, a word on the exception list breaks only at these.",
      },
    },
    gapLabel: (letter: string, state: string) => `Gap after ${letter}: ${state}`,
    copy: {
      idle: "Copy line",
      copied: "Copied",
      failed: "Copy failed",
    },
  },
} as const;
