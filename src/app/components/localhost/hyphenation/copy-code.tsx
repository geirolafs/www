"use client";

import { useEffect, useRef, useState } from "react";
import { FOCUS_CLASS } from "@/app/components/localhost/hyphenation/styles";
import { localhostHyphenationClientContent } from "@/lib/content/localhost-hyphenation-client";
import { cn } from "@/lib/utils";

const { copyCode: content } = localhostHyphenationClientContent;

type State = keyof typeof content.states;

const RESET_MS = 1500;

/**
 * Copies a code block's source. The label says what happened for a moment.
 * It sits on the code block, so it takes the code's greys.
 */
export function CopyCode({ code }: { code: string }) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  const copy = async () => {
    let next: State = "copied";
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      next = "failed";
    }
    setState(next);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setState("idle"), RESET_MS);
  };

  return (
    <button
      className={cn(
        "h-7 cursor-pointer px-2xs font-medium text-(--sh-sign) text-hy-control hover:bg-hy-track hover:text-(--sh-keyword)",
        FOCUS_CLASS
      )}
      onClick={copy}
      type="button"
    >
      <span aria-live="polite">{content.states[state]}</span>
    </button>
  );
}
