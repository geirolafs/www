import type { ComponentPropsWithRef } from "react";
import { CONTROL_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { cn } from "@/lib/utils";

type ControlButtonProps = Omit<ComponentPropsWithRef<"button">, "type"> & {
  children: string;
};

/**
 * The playground's own button, for a one-off action such as Copy. Picking one
 * of a few values is a radio group instead (see `ChoiceGroup`). It takes a
 * click handler, so it belongs under a client component.
 */
export function ControlButton({ className, children, ...props }: ControlButtonProps) {
  return (
    <button
      className={cn(
        CONTROL_CLASS,
        "border-hy-track bg-hy-surface text-foreground hover:border-border",
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
