/**
 * The copy that client components read: tips, the live editor and the break
 * editor. It lives apart from `localhost-hyphenation.ts` so the page's other
 * copy (the samples, how it works, the credits) stays on the server and out of
 * the client chunk. Keep server-only copy out of this file.
 */

/** The Njáls saga sample: the live editor starts with it, and the server samples reuse it. */
export const njallSample =
  "Mörður hét maður er kallaður var gígja. Hann var sonur Sighvats hins rauða. Hann bjó á Velli á Rangárvöllum. Hann var ríkur höfðingi og málafylgjumaður mikill og svo mikill lögmaður að engir þóttu löglegir dómar dæmdir nema hann væri við. Hann átti dóttur eina er Unnur hét. Hún var væn kona og kurteis og vel að sér og þótti sá bestur kostur á Rangárvöllum.";

/** Shown in place of the characters that are invisible in normal text. */
const marks = {
  softHyphen: "·",
  noBreakSpace: "⍽",
  nonBreakingHyphen: "\u2011",
} as const;

export const localhostHyphenationClientContent = {
  marks,

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
    initialText: njallSample,
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
      tip: "Draws · for every soft hyphen, ⍽ for every no-break space and a dotted \u2011 for every non-breaking hyphen (U+2011), so you can see what the components put in.",
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
