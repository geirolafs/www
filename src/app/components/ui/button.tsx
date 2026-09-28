import { Button as BaseButton } from "@base-ui-components/react/button";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<typeof BaseButton>;

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <BaseButton
      className={cn(
        // Base transition
        "transition-opacity duration-150 ease-out",
        // Hover state
        "hover:opacity-80",
        // Active/pressed state
        "active:opacity-70",
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
