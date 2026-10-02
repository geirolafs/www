/**
 * Class strings the playground's components share. Each is one static string,
 * so Tailwind sees every class.
 */

/**
 * A caption in sentence case: Without, With, a column head, a code block's
 * name. Small, but medium weight in the text colour, so it names what follows
 * without capitals or tracking. A quieter caption adds `text-muted`.
 */
export const LABEL_CLASS = "font-medium text-foreground text-hy-caption";

/*
 * The type levels under a section's header, largest first. The header itself
 * (letter, serif title, description) is set in `Section`.
 */

/** A section's title: the serif at Medium, the largest type under the page's own. */
export const SECTION_TITLE_CLASS =
  "text-balance font-hy-title font-medium text-foreground text-hy-section";

/** A part inside a section, such as "CSS it pairs with": the serif, a step below the section title. */
export const SUBTITLE_CLASS =
  "text-balance font-hy-title font-bold text-foreground text-hy-lede";

/**
 * The name of one item in a list: a step, a CSS property, a note, a link. The
 * size of its body, set apart by weight and colour.
 */
export const ITEM_TITLE_CLASS = "text-balance font-medium text-foreground text-hy-copy";

/** The explanation under an item, a step below the section's description. */
export const BODY_CLASS = "text-pretty font-book text-hy-copy text-muted";

/** A part's introduction under its subtitle, at the description's size. */
export const INTRO_CLASS = "text-pretty font-book text-hy-body text-muted";

/** Small running text: hints under a specimen, notes, captions, credits. */
export const NOTE_CLASS = "text-pretty font-book text-hy-note text-muted";

/** The name of a group of controls, such as Mode or Options. */
export const GROUP_LABEL_CLASS = "font-medium text-foreground text-hy-control";

/**
 * Code and exception lines, in the `font-hy-mono` face (ABC Areal with its
 * `MONO` axis at 100 on these pages): every character has its own width and
 * look, so an `l`, an `I` and a `1` cannot be mistaken for one another.
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
 * A control with a square outline, for buttons and for links that look like
 * them: 32px tall at least, 66px wide at least, text centred. The colours are
 * added by the caller (see `ControlButton`).
 */
export const CONTROL_CLASS = `inline-flex min-h-8 min-w-16.5 items-center justify-center border px-2.5 text-center font-medium text-hy-control ${FOCUS_CLASS}`;
