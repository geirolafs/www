import Link from "next/link";
import type { ReactNode } from "react";
import { linkContent } from "@/lib/content/links";
import { cn } from "@/lib/utils";

type TextLinkProps = {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
  /**
   * `always` draws the underline at rest; `hover` draws it only on hover,
   * focus and press — the footer's link lists, where the column already says
   * "these are links". `none` draws no underline at all; the weight and the
   * arrow carry the link on their own.
   */
  underline?: "always" | "hover" | "none";
  /**
   * Draws the underline as a bar that wipes away to the right on hover, focus
   * and press, and back in from the right on release. With `underline="hover"`
   * it runs the other way: the bar wipes in. On by default; `false` falls back
   * to a static text underline. Works with every `arrow` variant.
   */
  animateUnderline?: boolean;
  /**
   * The `↗` on an external link. `reveal` hides it until hover; `persist`
   * shows it at rest in the text colour; `none` leaves only the weight change.
   */
  arrow?: "none" | "persist" | "reveal";
  /**
   * Only ever supplied by a client component — this file carries no
   * `"use client"` of its own so that server trees keep rendering it on the
   * server. Passing a handler is what pulls it across the boundary, and only
   * for that consumer.
   */
  onClick?: () => void;
};

/**
 * The underline's hover/press response. The glyphs never change colour:
 * `--color-muted` clears WCAG AA by 0.13 (4.63:1), so dimming muted body copy
 * on hover would push it under. An underline is decoration and answers to the
 * 3:1 non-text threshold instead, which muted clears comfortably.
 *
 * `text-decoration-color` is overridden directly rather than by reassigning
 * `--underline-color`. Transitioning a property whose value arrives through a
 * custom property that changes is browser-dependent; transitioning the
 * concrete property is not.
 *
 * Three steps, lightening: foreground at rest, muted on hover, border on
 * press. The press has to be its own colour rather than a snap back to
 * foreground, or touch gets nothing at all — Tailwind compiles `hover:` to
 * `@media (hover: hover)`, so on a phone the hover step never runs and a tap
 * would move from foreground to foreground. `--color-border` is `#95908c` at
 * 3.08:1, the token this palette already picked for exactly the 3:1 threshold
 * an underline answers to.
 *
 * Press is instant (`duration-0`) and release eases back over the feedback
 * duration. A press should land; letting go can be soft.
 */
const UNDERLINE_CLASSES =
  "[text-decoration-color:var(--underline-color)] [text-decoration-thickness:var(--underline-thickness)] [text-underline-position:from-font] group-hover:[text-decoration-color:var(--color-muted)] group-active:[text-decoration-color:var(--color-border)]";

const UNDERLINE_MODE = {
  always: "underline",
  hover:
    "no-underline group-hover:underline group-focus-visible:underline group-active:underline",
} as const;

/**
 * The animated underline. A text decoration cannot move, so the bar is a
 * `::before` on the label, behind the glyphs, in the text colour at
 * `--underline-bar-opacity` (so it is always lighter than the glyphs). It sits
 * where the font draws its own underline (`--underline-bar-bottom`), raised by
 * `--underline-bar-lift`; all four `--underline-bar-*` tokens live in
 * globals.css. It animates `scale` only, anchored right: it wipes out towards
 * the end of the word and draws back in from there.
 *
 * Under reduced motion the bar stays full width and fades instead.
 */
const BAR_CLASSES =
  "relative isolate before:pointer-events-none before:absolute before:-z-10 before:inset-x-0 before:bottom-[calc(var(--underline-bar-bottom)+var(--underline-bar-lift))] before:h-(--underline-bar-thickness) before:origin-right before:bg-current/(--underline-bar-opacity) before:transition-[scale,opacity] before:duration-[var(--duration-arrow)] before:[transition-timing-function:var(--ease-in-out),var(--ease-out)] before:content-[''] motion-reduce:before:transition-opacity motion-reduce:before:scale-x-100!";

const BAR_MODE = {
  always:
    "group-hover:before:scale-x-0 group-focus-visible:before:scale-x-0 group-active:before:scale-x-0 motion-reduce:group-hover:before:opacity-0 motion-reduce:group-focus-visible:before:opacity-0 motion-reduce:group-active:before:opacity-0",
  hover:
    "before:scale-x-0 group-hover:before:scale-x-100 group-focus-visible:before:scale-x-100 group-active:before:scale-x-100 motion-reduce:before:opacity-0 motion-reduce:group-hover:before:opacity-100 motion-reduce:group-focus-visible:before:opacity-100 motion-reduce:group-active:before:opacity-100",
} as const;

/**
 * The weight response: Semibold (600) at rest, Book (400) on hover, focus and
 * press. The link lightens when you reach for it. The label owns both
 * weights, so every link on the site moves through the same range.
 */
const LABEL_CLASSES =
  "transition-[font-weight,text-decoration-color] duration-[var(--duration-feedback)] ease-out font-semibold motion-reduce:transition-none group-hover:font-book group-focus-visible:font-book group-active:font-book group-active:duration-0";

/**
 * The width guard: an `inline-grid` with one cell holding two layers. The
 * visible label and arrow sit on top of an invisible copy of the label set at
 * the rest weight, so the box keeps its rest width as the glyphs narrow. The
 * arrow lives in the visible layer, right after the label, so it follows the
 * glyphs and the gap between them stays the same.
 *
 * The copy's text comes from `content: attr(data-text)`, so find-in-page and
 * selection never see it twice. A grid takes its baseline from its first item,
 * so the label still sits on the line. The cost is that a label cannot break
 * across lines — fine for every link on the site today, all of them one or two
 * words.
 */
const GUARD_CLASSES = "inline-grid *:[grid-area:1/1]";

/**
 * `justify-self-start` shrinks the visible layer to its glyphs instead of
 * stretching to the rest width, so the arrow's `left-full` lands right after
 * the last glyph at every weight and the gap stays the same.
 */
const VISIBLE_LAYER_CLASSES = "relative justify-self-start";

const GUARD_COPY_CLASSES = "invisible select-none";

const GUARD_LABEL_CLASSES =
  "font-semibold after:content-[attr(data-text)] after:[speak:never]";

/**
 * The `↗` on external links, in one of three variants.
 *
 * `reveal`: on a device that can hover it takes no space. It is positioned
 * just past the label's last glyph, waits hidden, turned an eighth clockwise
 * (`→`), tucked against the label and sitting low; on hover or focus it fades
 * in, slides out and up, and turns anticlockwise into `↗`, in `link-arrow` red, drawn over
 * whatever follows the link. Nothing around it moves. It ignores the pointer,
 * so the hidden arrow never widens the link's hover area. Touch has no hover,
 * so there the arrow sits in the line and simply shows.
 *
 * `persist`: the arrow sits in the line at rest, in the text colour. On hover
 * or focus it turns anticlockwise into `↑` and goes red. The guard copy holds
 * an arrow too, so the box keeps its rest width.
 *
 * Both stay Semibold while the label lightens. Under reduced motion the turn
 * and slide go; the fade and the colour stay.
 */
const ARROW_CLASSES = {
  reveal:
    "pointer-events-none whitespace-pre font-semibold text-link-arrow [@media(hover:hover)]:absolute [@media(hover:hover)]:left-full",
  persist: "whitespace-pre font-semibold",
} as const;

const ARROW_GLYPH_CLASSES = {
  reveal:
    "inline-block transition-[opacity,translate,rotate] duration-[var(--duration-arrow)] [transition-timing-function:var(--ease-out),var(--ease-spring),var(--ease-spring)] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-x-(--arrow-reveal-x) [@media(hover:hover)]:translate-y-(--arrow-reveal-y) [@media(hover:hover)]:rotate-(--arrow-reveal-rotate) group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:rotate-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:rotate-0 motion-reduce:transition-opacity motion-reduce:translate-x-0! motion-reduce:translate-y-0! motion-reduce:rotate-0!",
  persist:
    "inline-block transition-[rotate,color] duration-[var(--duration-arrow)] [transition-timing-function:var(--ease-spring),ease] group-hover:-rotate-45 group-hover:text-link-arrow group-focus-visible:-rotate-45 group-focus-visible:text-link-arrow group-active:text-link-arrow motion-reduce:transition-colors motion-reduce:rotate-0!",
} as const;

/**
 * Shared link styling. External links get the `↗`, hidden from assistive
 * tech, a spoken "(opens in new tab)" in its place, plus `target="_blank"` +
 * `rel="noopener noreferrer"`.
 */
export function TextLink({
  href,
  external,
  className,
  children,
  underline = "always",
  animateUnderline = true,
  arrow = "reveal",
  onClick,
}: TextLinkProps) {
  const anchorClasses = cn("group", className);
  const arrowVariant = external && arrow !== "none" ? arrow : null;
  const arrowNode = arrowVariant ? (
    <span aria-hidden="true" className={ARROW_CLASSES[arrowVariant]}>
      {" "}
      <span className={ARROW_GLYPH_CLASSES[arrowVariant]}>↗</span>
    </span>
  ) : null;
  const content = (
    <>
      <span className={GUARD_CLASSES}>
        <span className={VISIBLE_LAYER_CLASSES}>
          <span
            className={cn(
              LABEL_CLASSES,
              underline !== "none" &&
                (animateUnderline
                  ? [BAR_CLASSES, BAR_MODE[underline]]
                  : [UNDERLINE_CLASSES, UNDERLINE_MODE[underline]])
            )}
          >
            {children}
          </span>
          {arrowNode}
        </span>
        {typeof children === "string" ? (
          <span aria-hidden="true" className={GUARD_COPY_CLASSES}>
            <span className={GUARD_LABEL_CLASSES} data-text={children} />
            {arrowVariant ? (
              <span className={ARROW_CLASSES[arrowVariant]}> ↗</span>
            ) : null}
          </span>
        ) : null}
      </span>
      {external ? <span className="sr-only"> {linkContent.newTab}</span> : null}
    </>
  );

  // Next's <Link> is for in-site navigation; external and mailto: stay <a>.
  if (external || href.startsWith("mailto:")) {
    return (
      <a
        className={anchorClasses}
        href={href}
        onClick={onClick}
        rel={external ? "noopener noreferrer" : undefined}
        target={external ? "_blank" : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Link className={anchorClasses} href={href} onClick={onClick}>
      {content}
    </Link>
  );
}
