"use client";

import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";
import { useState } from "react";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { cn } from "@/lib/utils";
import { VARIABLE_WEIGHT_CLASSES, variableWeightVars } from "./config";

type VariableWeightTextProps = {
  children: ReactNode;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "a";
  className?: string;
  weightDefault?: number;
  weightHover?: number;
  /** Transition duration in seconds. */
  duration?: number;
  /** Only read when `as="a"`. */
  href?: string;
  /** Take the hover from the nearest `group` ancestor instead of this element. */
  groupHover?: boolean;
  /** Force the hover weight, for callers that track touch themselves. */
  isActive?: boolean;
};

/**
 * v1's `VariableWeightText`, ported as-is: 650 at rest, 500 on hover, over
 * 0.15s. A touch press holds the hover weight while the finger is down,
 * because a tap on a non-link never matches `:hover` reliably on mobile.
 *
 * The one change is `useLiveReducedMotion()` in place of motion's
 * `useReducedMotion()`, so toggling the OS setting applies without a reload.
 */
export function VariableWeightText({
  children,
  as: Component = "span",
  className,
  weightDefault,
  weightHover,
  duration,
  href,
  groupHover = false,
  isActive = false,
}: VariableWeightTextProps) {
  const [isTouching, setIsTouching] = useState(false);
  const reducedMotion = useLiveReducedMotion();

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === "touch") {
      setIsTouching(true);
    }
  };
  const handlePointerUp = () => setIsTouching(false);

  return (
    <Component
      className={cn(
        VARIABLE_WEIGHT_CLASSES,
        groupHover
          ? "group-hover:[--vwt-weight:var(--vwt-weight-hover)] group-focus-visible:[--vwt-weight:var(--vwt-weight-hover)]"
          : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:[--vwt-weight:var(--vwt-weight-hover)] focus-visible:[--vwt-weight:var(--vwt-weight-hover)]",
        (isActive || isTouching) && "[--vwt-weight:var(--vwt-weight-hover)]",
        className
      )}
      data-text={typeof children === "string" ? children : undefined}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerUp}
      onPointerUp={handlePointerUp}
      style={variableWeightVars({ weightDefault, weightHover, duration, reducedMotion })}
      {...(Component === "a" && href ? { href } : {})}
    >
      {children}
    </Component>
  );
}
