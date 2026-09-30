import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from "react";
import { type PillCasing, PillText } from "@/app/components/shell/pill-text";
import { cn } from "@/lib/utils";

/**
 * The metrics every pill shares: radius, border width, padding, type.
 * `--pill-*` live in `globals.css`.
 *
 * Figma strokes a pill inside its frame, so a pill's size there already
 * includes the border. A CSS border is always outside the content box, so the
 * padding gives the border width back — otherwise the pill renders 2.5px
 * larger in both axes than the frame.
 *
 * Border and text colour are left to the caller: `Pill` and an unpressed
 * `PillButton` set the label's outline, a toggle switches between two. The
 * class list is a single static string so Tailwind can see every class.
 */
export const PILL_CLASS =
  "rounded-pill border-[length:var(--pill-border-width)] px-[calc(var(--pill-padding-x)-var(--pill-border-width))] py-[calc(var(--pill-padding-y)-var(--pill-border-width))] font-regular text-label";

/** A pill's own outline doesn't show focus, so a button gets a ring outside it. */
const FOCUS_CLASS =
  "focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2";

type PillProps = Omit<HTMLAttributes<HTMLElement>, "className" | "children"> & {
  /** The element to render. `h2` is for a pill that labels a section. */
  as?: "span" | "h2";
  /**
   * Set it when the rendered casing differs from the source — see
   * `PillText`. Otherwise it is read from a string child.
   */
  casing?: PillCasing;
  /** Layout only — position, margin, transforms. The metrics are `PILL_CLASS`. */
  className?: string;
  children: ReactNode;
};

/**
 * The static pill: a full outline round its text, which `PillText` drops by the
 * offset for its casing so it reads centred. It renders as an inline `span`
 * unless `as` says otherwise; `id`, `style` and `data-*` go to the element.
 */
export function Pill({
  as: Tag = "span",
  casing,
  className,
  children,
  ...props
}: PillProps) {
  return (
    <Tag
      className={cn(PILL_CLASS, "border-border-strong text-foreground", className)}
      {...props}
    >
      <PillText casing={casing}>{children}</PillText>
    </Tag>
  );
}

type PillButtonProps = Omit<ComponentPropsWithRef<"button">, "children" | "type"> & {
  /**
   * Whether a toggle is on. Sets `aria-pressed` and the outline. Left out, the
   * button is a one-off action — open, close, reset — with the label's outline.
   */
  pressed?: boolean;
  children: string;
};

/**
 * A button in the pill shape. As a toggle (`pressed` set), it takes the
 * foreground as its outline when on; otherwise a light outline and muted text.
 * The outline changes as well as the text, so the state never rests on colour
 * alone. Without `pressed` it is an action with the label's outline. Other
 * button attributes (`ref`, `onClick`, `aria-expanded`, `aria-controls`) go
 * straight to the element.
 *
 * It takes a click handler, so it belongs under a client component.
 */
export function PillButton({ pressed, className, children, ...props }: PillButtonProps) {
  return (
    <button
      aria-pressed={pressed}
      className={cn(
        PILL_CLASS,
        FOCUS_CLASS,
        pressed === undefined && "border-border-strong text-foreground",
        pressed === true && "border-foreground text-foreground",
        pressed === false && "border-border text-muted",
        className
      )}
      type="button"
      {...props}
    >
      <PillText>{children}</PillText>
    </button>
  );
}
