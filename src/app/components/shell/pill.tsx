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
 * Border and text colour are left to the caller: `Pill` and `PillAction` set
 * the label's outline, `PillButton` switches between two. The class list is a
 * single static string so Tailwind can see every class.
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

type PillButtonProps = {
  /** Whether the toggle is on. Sets `aria-pressed` and the outline. */
  pressed: boolean;
  onClick: () => void;
  children: string;
  /** Layout only — position, margin, transforms. The metrics are `PILL_CLASS`. */
  className?: string;
};

/**
 * A toggle in the pill shape. Pressed, it takes the foreground as its outline;
 * otherwise a light outline and muted text. The outline changes as well as the
 * text, so the state never rests on colour alone.
 *
 * It takes a click handler, so it belongs under a client component.
 */
export function PillButton({ pressed, onClick, children, className }: PillButtonProps) {
  return (
    <button
      aria-pressed={pressed}
      className={cn(
        PILL_CLASS,
        FOCUS_CLASS,
        pressed ? "border-foreground text-foreground" : "border-border text-muted",
        className
      )}
      onClick={onClick}
      type="button"
    >
      <PillText>{children}</PillText>
    </button>
  );
}

type PillActionProps = Omit<ComponentPropsWithRef<"button">, "children" | "type"> & {
  children: string;
};

/**
 * A one-off action in the pill shape — open, close, reset — with the label's
 * outline and no pressed state. Other button attributes (`ref`,
 * `aria-expanded`, `aria-controls`) go straight to the element. Like
 * `PillButton`, it belongs under a client component.
 */
export function PillAction({ className, children, ...props }: PillActionProps) {
  return (
    <button
      className={cn(
        PILL_CLASS,
        FOCUS_CLASS,
        "border-border-strong text-foreground",
        className
      )}
      type="button"
      {...props}
    >
      <PillText>{children}</PillText>
    </button>
  );
}
