"use client";

import type { RefObject } from "react";
import { useEffect, useState } from "react";

interface ElementScrollState {
  /** Element can scroll horizontally */
  isScrollable: boolean;
  /** Scroll position is at or near the start */
  isAtStart: boolean;
  /** Scroll position is at or near the end */
  isAtEnd: boolean;
}

/**
 * Track horizontal scroll state of an element.
 * Updates on scroll and resize events.
 */
export function useElementScrollState(
  ref: RefObject<HTMLElement | null>
): ElementScrollState {
  const [state, setState] = useState<ElementScrollState>({
    isScrollable: false,
    isAtStart: true,
    isAtEnd: true,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const checkScroll = () => {
      const isScrollable = element.scrollWidth > element.clientWidth;
      const isAtStart = element.scrollLeft <= 1;
      const isAtEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;

      setState({ isScrollable, isAtStart, isAtEnd });
    };

    checkScroll();
    element.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      element.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [ref]);

  return state;
}
