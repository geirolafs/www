"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { cn } from "@/lib/utils";
import { SLIDE_TRANSITION, VARIABLE_WEIGHT_CLASSES, variableWeightVars } from "./config";

const COPY_FEEDBACK_MS = 2000;
const COPY_WIDTH_CH = 6;
const COPIED_WIDTH_CH = 12;

/** v1's `FloatingIcon` hover loop: a 0.9s sway, snapping back on leave. */
const FLOAT_VARIANTS: Variants = {
  rest: { x: 0, rotate: 0, transition: { duration: 0.9, ease: "easeOut" } },
  hover: {
    x: [0, 4, 0],
    rotate: [0, 6, 0],
    transition: {
      duration: 0.9,
      ease: [0.6, -0.05, 0.01, 0.99],
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
    },
  },
};

type CopyEmailBtnProps = {
  email: string;
  labels: { button: string; title: string; copied: string };
  className?: string;
};

/**
 * v1's `CopyEmailBtn`: shows the address's local part with a swaying @, and
 * on click copies the full address and slides a "copied" message in from the
 * right as the button widens from 6ch to 12ch. Resets after two seconds.
 *
 * Dropped from v1: the PostHog `email_copied` capture, and the
 * visibility-aware timer (v1 paused the reset while the tab was hidden; a
 * plain timeout is enough for a demo).
 */
export function CopyEmailBtn({ email, labels, className }: CopyEmailBtnProps) {
  const emailPrefix = email.split("@")[0];
  const [copied, setCopied] = useState(false);
  const reducedMotion = useLiveReducedMotion();

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // No feedback on failure, as in v1.
    }
  };

  return (
    <motion.button
      animate={{ width: copied ? `${COPIED_WIDTH_CH}ch` : `${COPY_WIDTH_CH}ch` }}
      aria-label={labels.button}
      className={cn(
        "group relative inline-block min-h-[1.2em] cursor-pointer overflow-hidden text-left",
        className
      )}
      data-copied={copied}
      initial={{ width: `${COPY_WIDTH_CH}ch` }}
      onClick={handleCopy}
      title={copied ? undefined : labels.title}
      transition={SLIDE_TRANSITION}
      type="button"
    >
      <motion.div
        animate={{ x: copied ? `-${COPY_WIDTH_CH}ch` : "0" }}
        className="flex will-change-transform"
        initial={{ x: 0 }}
        style={{ width: `${COPY_WIDTH_CH + COPIED_WIDTH_CH}ch` }}
        transition={SLIDE_TRANSITION}
      >
        <motion.span
          animate={copied ? { opacity: 0 } : "rest"}
          className={cn(
            VARIABLE_WEIGHT_CLASSES,
            "shrink-0 whitespace-nowrap hover:[--vwt-weight:var(--vwt-weight-hover)] focus-visible:[--vwt-weight:var(--vwt-weight-hover)]"
          )}
          data-text={emailPrefix}
          style={{
            width: `${COPY_WIDTH_CH}ch`,
            ...variableWeightVars({ reducedMotion }),
          }}
          whileHover="hover"
        >
          {emailPrefix}
          <motion.span
            aria-hidden="true"
            className="inline-block translate-x-1 font-medium text-foreground duration-200"
            variants={
              reducedMotion
                ? { rest: { opacity: 1 }, hover: { opacity: 0.75 } }
                : FLOAT_VARIANTS
            }
          >
            @
          </motion.span>
        </motion.span>
        <motion.span
          animate={{ opacity: copied ? 1 : 0 }}
          aria-atomic="true"
          aria-live="polite"
          className="inline-block shrink-0 whitespace-nowrap"
          initial={{ opacity: 0 }}
          style={{ width: `${COPIED_WIDTH_CH}ch` }}
          transition={SLIDE_TRANSITION}
        >
          {copied ? labels.copied : null}
        </motion.span>
      </motion.div>
    </motion.button>
  );
}
