import type { ComponentPropsWithRef } from "react";
import { CONTROL_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { cn } from "@/lib/utils";

const VARIANT_CLASS = {
  secondary: "border-hy-track bg-hy-surface text-foreground hover:border-border",
  primary: "border-transparent bg-foreground/80 text-background hover:bg-foreground",
} as const;

type ControlButtonProps = Omit<ComponentPropsWithRef<"button">, "type"> & {
  children: string;
  /** Primary is the main action on a screen; secondary is the default. */
  variant?: keyof typeof VARIANT_CLASS;
};

/**
 * The playground's own button, for a one-off action such as Copy. Picking one
 * of a few values is a radio group instead (see `ChoiceGroup`). It takes a
 * click handler, so it belongs under a client component.
 */
export function ControlButton({
  className,
  children,
  variant = "secondary",
  ...props
}: ControlButtonProps) {
  return (
    <button
      className={cn(CONTROL_CLASS, VARIANT_CLASS[variant], className)}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
