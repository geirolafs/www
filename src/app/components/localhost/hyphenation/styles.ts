/**
 * Class strings the playground's components share. Each is one static string,
 * so Tailwind sees every class.
 */

/**
 * A small all-caps label; the tracking comes with `text-label`. Geist has no
 * `case` feature, so none is asked for.
 */
export const LABEL_CLASS = "font-medium text-label text-muted uppercase";

/*
 * The type levels under a section's header, largest first. The header itself
 * (letter, serif title, description) is set in `Section`.
 */

/** A part inside a section, such as "CSS it pairs with": the serif, a step down from the title. */
export const SUBTITLE_CLASS = "font-hy-title font-bold text-foreground text-hy-lede";

/** The name of one item in a list: a step, a CSS property, a note, a link. */
export const ITEM_TITLE_CLASS = "font-medium text-foreground text-hy-body";

/** The explanation under an item, at the description's size. */
export const BODY_CLASS = "text-pretty font-book text-hy-body text-muted";

/** Small running text: hints under a specimen, notes, captions, credits. */
export const NOTE_CLASS = "text-pretty font-book text-hy-note text-muted";

/** The name of a group of controls, such as Mode or Options. */
export const GROUP_LABEL_CLASS = "font-medium text-foreground text-hy-control";

/**
 * Code and exception lines, in Geist Mono: every character has its own width
 * and look, so an `l`, an `I` and a `1` cannot be mistaken for one another.
 */
export const CODE_CLASS = "font-hy-mono";

/**
 * A title in Bespoke Serif, at Bold (700). The face is `--font-hy-title`;
 * the titles are set at one weight on purpose.
 */
export const TITLE_CLASS = "font-hy-title font-bold";

/**
 * The text the playground lets you edit, and the box that shows the result in
 * body mode: the serif face at Regular (400).
 */
export const EDITOR_CLASS = "font-hy-title font-book text-foreground text-hy-editor";

/** A visible focus ring for a control that is not a native input. */
export const FOCUS_CLASS =
  "focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2";

/**
 * A control with a rounded outline, for buttons and for links that look like
 * them: 32px tall at least, 66px wide at least, text centred. The colours are
 * added by the caller (see `ControlButton`).
 */
export const CONTROL_CLASS = `inline-flex min-h-8 min-w-16.5 items-center justify-center rounded-pill border px-2.5 text-center font-medium text-hy-control ${FOCUS_CLASS}`;
