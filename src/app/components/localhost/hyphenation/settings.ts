/**
 * The settings the live editor sets for the whole page. A plain module, not a
 * client one, so the server can read the defaults for its first render.
 */
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";

const { liveEditor: content } = localhostHyphenationClientContent;

export type Mode = (typeof content.mode.options)[number]["value"];
export type Rules = (typeof content.rules.options)[number]["value"];

export type Settings = {
  mode: Mode;
  rules: Rules;
  typeset: boolean;
  showBreaks: boolean;
  /** `text-pretty` for body text and `text-balance` for titles; off wraps greedily. */
  pretty: boolean;
  /**
   * Settle the rag: judge each line end the way a typesetter does, and move a
   * short word ("og", "í") or a word that leaves a hole down to the next line
   * when that makes the paragraph's edge better. Runs in the browser.
   */
  rag: boolean;
  /**
   * Let a line's last character go a little past the edge, when that keeps
   * a word on its line and makes the paragraph better. Only with `rag` on.
   */
  overhang: boolean;
};

/** What the page renders on the server, before anyone changes a setting. */
export const DEFAULT_SETTINGS: Settings = {
  ...content.initial,
  showBreaks: false,
  pretty: true,
  rag: true,
  overhang: true,
};

/**
 * The typeset rules the Typeset setting turns on: the defaults plus en dashes,
 * so "1990-2010" in an example is set as Ritreglur §26.2.1 asks.
 */
export const PAGE_TYPESET = { dashes: true } as const;

/**
 * How heading mode treats compound joints: only them when the browser sets
 * the text alone, and as a preference when Settle rag balances it and can
 * weigh the other breaks.
 */
export function jointsFor(settings: Pick<Settings, "rag">): "only" | "prefer" {
  return settings.rag ? "prefer" : "only";
}

/**
 * How far a line may overhang the edge, in em at 16px text: about one
 * letter. Bigger type gets a smaller share of its size.
 */
const OVERHANG_EM = 0.5;

/**
 * The options the rag judgement takes from the settings. A title is
 * balanced: as few lines as greedy wrapping gives, made as even as possible.
 */
export function ragOptions(
  settings: Pick<Settings, "overhang">,
  title = false
): { overhang: number; balance: boolean } {
  return { overhang: settings.overhang ? OVERHANG_EM : 0, balance: title };
}

/**
 * The `text-wrap` class the settings ask for, for a title or for body text.
 * With Settle rag on it is plain wrapping: the rag judgement has chosen every
 * break already, balancing a title itself (`ragOptions`), and needs the
 * browser to break at the last place that fits (see `settleRag`), which
 * `pretty` and `balance` would second-guess.
 */
export function wrapClass(
  settings: Pick<Settings, "pretty" | "rag">,
  title: boolean
): string {
  if (settings.rag || !settings.pretty) {
    return "text-wrap";
  }
  return title ? "text-balance" : "text-pretty";
}
