/**
 * The settings the live editor sets for the whole page. A plain module, not a
 * client one, so the server can read the defaults for its first render.
 */
import { localhostSkiptingarClientContent } from "@/lib/content/localhost-skiptingar-client";

const { liveEditor: content } = localhostSkiptingarClientContent;

export type Settings = {
  /**
   * The typographic rules: which breaks to keep (`rules: "typographic"`), as
   * against the official Ritreglur minimums alone. New and under development.
   * Not the same as `typeset`, which is about spaces, quotes and dashes.
   */
  typographic: boolean;
  typeset: boolean;
  showBreaks: boolean;
  /** `text-pretty` for body text and `text-balance` for titles; off wraps greedily. */
  pretty: boolean;
};

/** What the page renders on the server, before anyone changes a setting. */
export const DEFAULT_SETTINGS: Settings = {
  ...content.initial,
  showBreaks: false,
  pretty: true,
};

/** The `rules` option of `hyphenate()` that the Better breaks setting asks for. */
export function rulesFor(
  settings: Pick<Settings, "typographic">
): "typographic" | "ritreglur" {
  return settings.typographic ? "typographic" : "ritreglur";
}

/**
 * The rules the Locale details setting turns on: the defaults plus en dashes,
 * so "1990-2010" in an example is set as Ritreglur §26.2.1 asks, and a
 * no-break space after a one-letter word, so "í" never ends a line.
 */
export const PAGE_TYPESET = { dashes: true, singleLetter: true } as const;

/**
 * The `text-wrap` class the settings ask for, for a title or for body text:
 * `text-balance` for a title and `text-pretty` for body text when the page asks
 * for it, plain greedy wrapping when it does not.
 */
export function wrapClass(settings: Pick<Settings, "pretty">, title: boolean): string {
  if (!settings.pretty) {
    return "text-wrap";
  }
  return title ? "text-balance" : "text-pretty";
}
