# Changelog

## 0.1.0 (not released)

The first version. The API may still change before 1.0.

- `settle-rag/client`: Settle rag (`SettledText`, `useSettledRag`,
  `useRagPlan`, `settle` for plain DOM).
- Language is an input: the short words, the linking syllables and the locale
  come in as `language` (`RagLanguage`) in the options. Settle Rag ships none;
  without one, only one-letter words count as short and no hyphen is a joint.
  `skiptingar` has the Icelandic one (`RAG_LANGUAGE`).
- Settle rag can tighten a line: `tighten`, `tightenLetters` and
  `tightenWeight` let a line take a little less word space (and, only when it
  has too few spaces, letter space) to keep a word on it, as a typesetter does
  by hand. It never loosens, and a line uses it or the overhang, not both.
  `splitSettled()` cuts the settled text for drawing.
- An overhang keeps the element's own `letter-spacing`: `Hang` has an optional
  `letterSpacing` (px, the element's spacing included), which `settleRag` sets
  and `applyRag`, `splitSettled` and `splitHangs` pass on. A tracked heading's
  overhang line no longer sets wider than planned. Without it, a hang is drawn
  with `-width` as before.
- `bestBreaks()`: the rag search alone, without a browser.
