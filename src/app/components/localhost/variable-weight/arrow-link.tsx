"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { cn } from "@/lib/utils";
import { BOUNCY_SPRING, VARIABLE_WEIGHT_CLASSES, variableWeightVars } from "./config";

type ArrowLinkProps = {
  href: string;
  children: string;
  newTabLabel: string;
  className?: string;
};

/**
 * v1's `ArrowLink`: variable-weight text plus a ↗ that hops up-right and
 * tilts on a bouncy spring when the link is hovered. v1 drew the arrow in
 * its orange `--chart-5`; this palette has no accent, so it takes the link's
 * own colour. It stays at v1's 0.7 of the running type size.
 *
 * Reduced motion swaps the hop for v1's standard hover fallback, a dip to
 * 0.75 opacity.
 */
export function ArrowLink({ href, children, newTabLabel, className }: ArrowLinkProps) {
  const reducedMotion = useLiveReducedMotion();

  return (
    <Link
      className={cn(
        "group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      href={href}
      rel="noopener"
      target="_blank"
    >
      {/* The inset pseudo-element fills the gap between text and arrow, so
          the hover doesn't flicker off crossing it. */}
      <motion.span
        className="relative inline-flex items-center after:absolute after:-inset-1 after:content-['']"
        initial="rest"
        whileHover="hover"
      >
        <span
          className={cn(
            VARIABLE_WEIGHT_CLASSES,
            "decoration-[0.05em] underline-offset-[0.1em] group-hover:[--vwt-weight:var(--vwt-weight-hover)] group-focus-visible:[--vwt-weight:var(--vwt-weight-hover)]"
          )}
          data-text={children}
          style={variableWeightVars({ reducedMotion })}
        >
          {children}
        </span>
        <motion.span
          aria-hidden="true"
          className="relative -top-[0.12em] -mr-[0.3em] ml-[0.35em] size-[1.1em] font-medium text-[0.7em]"
          transition={BOUNCY_SPRING}
          variants={{
            rest: { y: 0, x: 0, rotate: 0, scale: 1 },
            hover: reducedMotion
              ? { opacity: 0.75 }
              : { y: -4, x: 2, rotate: -8, scale: 1, opacity: 1 },
          }}
        >
          ↗
        </motion.span>
        <span className="sr-only">{newTabLabel}</span>
      </motion.span>
    </Link>
  );
}
