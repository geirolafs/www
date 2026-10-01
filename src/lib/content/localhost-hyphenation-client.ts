/**
 * The copy that client components read: tips, the live editor and the break
 * editor. It lives apart from `localhost-hyphenation.ts` so the page's other
 * copy (the samples, how it works, the credits) stays on the server and out of
 * the client chunk. Keep server-only copy out of this file.
 */

/**
 * The three example texts. Each one holds every problem the package solves:
 * long compounds, a title, numbers with units, dates and ordinals,
 * abbreviations with numbers, a kennitala or phone number, a title before a
 * name, straight quotes, a number range, one-letter words, a web address and
 * an email that must stay whole, an acronym and a patronymic. A line that
 * starts with `# ` is a title.
 */
const examples = [
  {
    id: "news",
    label: "Frétt",
    text: `# Kjörsókn í Vestmannaeyjum aldrei meiri í sveitarstjórnarkosningum

Kjörsókn í sveitarstjórnarkosningunum 16. maí 2026 var sú mesta sem mælst hefur í Vestmannaeyjum. Á árunum 1990-2010 var hún að jafnaði u.þ.b. 62 af hundraði. "Þetta er söguleg niðurstaða," sagði dr. Guðrún Sigurðardóttir, formaður yfirkjörstjórnar, á blaðamannafundi kl. 14.30 í gær.

Fulltrúar ODIHR fylgdust með framkvæmdinni. Í skýrslu þeirra, á bls. 12, kemur fram að kosningaþátttaka ungs fólks hafi aukist mest. Nánari upplýsingar eru á www.kosning.is og fyrirspurnir má senda á kosningar@vestmannaeyjar.is eða í síma 555-1234.`,
  },
  {
    id: "notice",
    label: "Tilkynning",
    text: `# Heilbrigðisþjónusta á landsbyggðinni: nýr afgreiðslutími

Frá og með 1. október 2026 verður heilsugæslustöðin á Egilsstöðum opin kl. 8-16 alla virka daga. Komugjald fyrir fullorðna er 1.000 kr. en 500 kr. fyrir börn og öryrkja. Bókið tíma á www.heilsuvera.is eða í síma 555 1234 og hafið kennitöluna, t.d. 010190-2939, við höndina.

Í "Þjónustuhandbók" heilbrigðisráðuneytisins, sjá bls. 4, er fjallað um réttindi sjúklinga. Bólusetningar barna fylgja viðmiðum UNICEF. Hjúkrunarfræðingar svara fyrirspurnum á 2. hæð og sr. Anna Guðmundsdóttir veitir sálgæslu eftir samkomulagi.`,
  },
  {
    id: "event",
    label: "Viðburður",
    text: `# Íslenskuverðlaun unga fólksins afhent í Eldborgarsal Hörpu

Verðlaunin verða afhent fimmtudaginn 30. sep. 2026 kl. 20.00. Miðaverð er 4.500 kr. og dagskráin tekur um 90 mín. Kynnir kvöldsins er hr. Jón Þór Hafsteinsson og verðlaunin eru veitt í samstarfi við UNESCO.

Sigurtextinn hefst á orðunum "Kæmi ný öxi hér, ykist þjófum nú bæði víl og ádrepa" og sýnir að íslenskan rúmar alla stafi stafrófsins í einni setningu. Miðar fást á www.harpa.is og í miðasölunni, sem er opin kl. 12-18, í síma 555-5555.`,
  },
] as const;

/**
 * Shown in place of the characters that are invisible in normal text. A
 * no-break space and a non-breaking hyphen need no mark: each is shown as
 * itself, on an amber fill.
 */
const marks = {
  softHyphen: "·",
} as const;

export const localhostHyphenationClientContent = {
  marks,
  examples,

  tips: {
    /** The accessible name of an "i" button: what it explains. */
    help: (name: string) => `About ${name}`,
    mark: "i",
    softHyphen:
      "A soft hyphen (U+00AD) is an invisible character. It shows a hyphen only when the line breaks right there.",
    noBreakSpace:
      "A no-break space (U+00A0) looks like a space but keeps the words on both sides of it on one line.",
  },

  liveEditor: {
    textLabel: "Text",
    outputLabel: "Output",
    initialText: examples[0].text,
    composer: {
      exampleLabel: "Example",
      /** The select's first option, shown once the text no longer matches an example. */
      customLabel: "Your text",
      hint: "Start a line with # to make it a title.",
      use: "Use this text on the whole page",
      useShortcut: "Ctrl + Enter",
      used: "The page now uses this text",
      unused: "Not used on the page yet",
      words: (count: number) => `${count} ${count === 1 ? "word" : "words"}`,
    },
    /** What the editor starts with. The page renders the first output from these on the server. */
    initial: { mode: "body", rules: "typographic", typeset: true },
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
      tip: "Draws a red · for every soft hyphen, and puts every no-break space and non-breaking hyphen (U+2011) on an amber fill, so you can see what the components put in.",
    },
    rag: {
      label: "Settle rag",
      tip: "Looks at each line end the way a typesetter does. A short word like og, í or að left at the end, or a word that sticks out and leaves a hole in the edge, is tried on the next line, and the move is kept only if the whole paragraph's edge gets better. It needs the real line breaks, so it runs in the browser. With Show breaks on, each word it moved has an amber space after it.",
    },
    overhang: {
      label: "Overhang",
      tip: "The cheat a typesetter makes by hand: a line's last letter or mark may go a little past the edge, when that keeps a word on its line and makes the paragraph better. Never more than about one letter, less as the type gets bigger, and never at a hyphen. Works with Settle rag. With Show breaks on, the overhanging character is on an amber fill.",
    },
    textWrap: {
      label: "text-wrap",
      tip: "text-pretty (text-wrap: pretty) stops a paragraph ending on one short word and evens out the ragged edge. text-balance (text-wrap: balance) evens out the lines of a heading. Body mode uses pretty and heading mode uses balance. Off wraps each line greedily. How it works shows each one with and without.",
    },
    /** The result box's width slider, in px. */
    width: { min: 120, max: 720, initial: 320 },
    breaks: (count: number) => `${count} ${count === 1 ? "break" : "breaks"}`,
    noBreakSpaces: (count: number) =>
      `${count} no-break ${count === 1 ? "space" : "spaces"}`,
  },

  /** The settings, kept in view once the editor's own controls scroll away. */
  dock: {
    label: "Page settings",
    open: "Edit settings",
    close: "Close settings",
    on: "on",
    off: "off",
  },

  /** The copy button on a code block. */
  copyCode: {
    states: {
      idle: "Copy",
      copied: "Copied",
      failed: "Copy failed",
    },
  },

  /** A width slider over a specimen. */
  measure: {
    label: "Width",
    value: (px: number) => `${px} px`,
  },

  /** A pair that shows a text without the package, then with it. */
  pair: {
    without: "Without",
    withoutCaption: "the browser alone",
    with: "With skiptingar",
    withCaption: "page settings",
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
