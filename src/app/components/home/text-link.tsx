import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TextLinkProps = {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
  /**
   * Only ever supplied by a client component — this file carries no
   * `"use client"` of its own so that server trees keep rendering it on the
   * server. Passing a handler is what pulls it across the boundary, and only
   * for that consumer.
   */
  onClick?: () => void;
};

/**
 * Both the resting underline and its hover/press response, because the
 * response is *only* ever on the underline. The glyphs never change colour:
 * `--color-muted` clears WCAG AA by 0.04 (4.54:1), so dimming muted body copy
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
 * would move from foreground to foreground. `--color-border` is `#949494` at
 * 3.03:1, the token this palette already picked for exactly the 3:1 threshold
 * an underline answers to.
 *
 * Press is instant (`duration-0`) and release eases back over the feedback
 * duration. A press should land; letting go can be soft.
 */
const UNDERLINE_CLASSES =
  "underline [text-decoration-color:var(--underline-color)] [text-decoration-thickness:var(--underline-thickness)] [text-underline-position:from-font] transition-[text-decoration-color] duration-[var(--duration-feedback)] ease-out motion-reduce:transition-none hover:[text-decoration-color:var(--color-muted)] active:[text-decoration-color:var(--color-border)] active:duration-0";

/**
 * Shared link styling: underline drawn in `--underline-color` (foreground)
 * even when the surrounding text is muted. External links get the `↗`
 * glyph, hidden from assistive tech, plus `target="_blank"` +
 * `rel="noopener noreferrer"`.
 */
export function TextLink({
  href,
  external,
  className,
  children,
  onClick,
}: TextLinkProps) {
  const content = (
    <>
      {children}
      {external ? <span aria-hidden="true"> ↗</span> : null}
    </>
  );

  if (external) {
    return (
      <a
        className={cn(UNDERLINE_CLASSES, className)}
        href={href}
        onClick={onClick}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  if (href.startsWith("mailto:")) {
    return (
      <a className={cn(UNDERLINE_CLASSES, className)} href={href} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <Link className={cn(UNDERLINE_CLASSES, className)} href={href} onClick={onClick}>
      {content}
    </Link>
  );
}
