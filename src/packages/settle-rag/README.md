# settle-rag

Paragraph rag composition for the web. The browser breaks each line at the
last place that fits. Settle Rag chooses the breaks for the whole paragraph
the way a typesetter would, and keeps the cheapest right edge.

It knows no language. You pass it the words and syllables that matter in
yours (see "Language"). For Icelandic, `skiptingar` ships them as
`RAG_LANGUAGE`.

## Status

Not on npm yet. It lives in a website repo while the API settles; the
`package.json` is marked private so it can't be published by accident. To try
it in another project, build it (`bun run build` in this folder writes `dist/`
with the two entry points and their types) and depend on the folder. It has no
runtime dependencies. React 18 or newer is only needed for the client entry.
`bun run size` prints what the client costs a browser, and `bun run bench` how
fast the search runs.

## Settle the rag

Soft hyphens say where a line may break; the browser still breaks each line
at the last place that fits. Settling the rag chooses the breaks for the whole
paragraph (a Knuth–Plass search with a cost for a ragged edge): lines that are
full enough, no line jutting out past the one above or leaving a hole, short
words such as `og` and `í` kept off line ends when that does not cost more
elsewhere, few hyphens and no 3-letter pieces, and a last line of one word or
the tail of a broken one only when the edge is better for it. It needs the
real line widths, so it runs in the browser. Settle Rag alone (`SettledText`)
is <!-- size:rag -->4.9 kB<!-- /size --> brotli.

The text you give it is already hyphenated: it chooses among the soft hyphens
in it and adds none. Icelandic text from `skiptingar` works as it is.

```tsx
"use client";
import { SettledText } from "settle-rag/client";
import { RAG_LANGUAGE } from "skiptingar";

<SettledText
  as="p"
  text={hyphenatedOnTheServer}
  options={{ language: RAG_LANGUAGE, overhang: 0.5 }}
/>;
```

It forbids the breaks a greedy browser would otherwise take (a space becomes a
no-break space, a soft hyphen is removed) and checks the result in a hidden
copy; if the browser would not set it exactly, it changes nothing. It judges
again when the width changes and when fonts load, and keeps the element on
`text-wrap: wrap` meanwhile, since `pretty` and `balance` would move the breaks
again. Settled text sets its own `text-wrap: wrap` while settled; `pretty` and
`balance` are for text you don't settle.

## Language

Settle Rag ships no language. Without one, only one-letter words count as
short and no hyphen is a compound's joint. A language is an input, in the
options as `language` (`RagLanguage`):

```ts
const language = {
  shortWords: ["og", "en", "eða"], // read badly at a line's end (lower case)
  linkingSyllables: ["ar", "ur", "is", "ir"], // a soft hyphen right after one is a joint
  locale: "is", // BCP 47 tag for case folding
};
```

All three are optional. For Icelandic, import `RAG_LANGUAGE` from
`skiptingar`; it is a plain object with these three keys, so neither package
needs the other.

## Options

`RagOptions`, the same for every entry:

- `language`: see above.
- `balance: true` for titles: as few lines as possible, made even, with short
  words at line ends, stacked hyphens and breaks away from a joint costing
  more.
- `overhang` (in em at 16px, 0.5 is about one letter) lets a line's last
  character go a little past the edge when that helps.
- `tighten` (in em, 0.05 is a good size) lets a line take that much less space
  at each word space, and `tightenLetters` (in em, 0.01) that much less at each
  character on a line with too few spaces for that. `tightenWeight` is what
  tightening costs. Tightening is the typesetter's second cheat: it only
  tightens, never loosens, and a line uses it only when it would not fit
  otherwise and the paragraph is better for it. A line uses the overhang or
  tightening, never both, and the overhang comes first.
- `overhang`, `tighten` and `tightenLetters` are 0 (off) by default. The rest
  are the weights of each fault (`DEFAULT_RAG_OPTIONS`).

## Ways to use it

- `SettledText` renders it. `useSettledRag(ref, text, options)` gives the text,
  its overhangs and its tightened lines (`splitSettled` cuts them out to draw;
  `splitHangs` does it for overhangs alone), and
  `useRagPlan(ref, text, options)` the plan itself, for text split over
  several elements (`applyRag`). Pass `enabled: false` to turn it off.
- A span's `letter-spacing` replaces the one it inherits, so each overhang
  carries the value to set, the element's own tracking included
  (`Hang.letterSpacing`, and `letterSpacing` on its piece from `splitSettled`).
  Draw a hang with `piece.letterSpacing ?? -piece.hang` px. Without it, as from
  `bestBreaks`, that is `-hang`.
- Without React: `const stop = settle(element, text, options)`.
- `bestBreaks(text, metrics, options)` in the core entry (`settle-rag`) is the
  search alone, given where each character starts; it needs no browser.

It measures the text as plain text in the element's own font, so inline
markup with other metrics is not modelled. It changes nothing for justified
or right-to-left text, an indented first line, preserved newlines or
`hyphens: auto`. The first judgement runs after hydration, so a
server-rendered paragraph can move slightly once.

## License

MIT. See `LICENSE`.
