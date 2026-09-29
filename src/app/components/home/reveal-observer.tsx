"use client";

import { animate } from "motion";
import { useEffect } from "react";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";

// 70ms between rows.
const STAGGER_STEP_SECONDS = 0.07;

// How long a visitor who never scrolls waits before a section that was
// already in view at load reveals anyway. Generous on purpose: nearly
// everyone scrolls well inside it, so it only fires for someone who parks on
// the page — who would otherwise never see that section at all.
const IDLE_REVEAL_MS = 5000;

/**
 * Owns data-reveal-armed until animation settles, then sets data-revealed.
 * The layout boot script covers pre-hydration hiding with a 2s failsafe.
 * Load targets reveal on mount; other targets wait for scroll or the 5s
 * idle fallback. Restored scroll positions bypass that gate. Focus reveals
 * immediately; animation rejection must also leave content visible.
 */
export function RevealObserver() {
  const prefersReducedMotion = useLiveReducedMotion();

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (targets.length === 0) {
      return;
    }

    // Take ownership from the pre-paint boot marker before anything else —
    // this is what stops the inline script's 2s failsafe in `layout.tsx`
    // from ever firing, now that JS has actually booted. Everything below
    // that arms `[data-reveal-armed]` runs in the same synchronous pass, so
    // the two hiding mechanisms (`[data-reveal-boot="armed"]` and
    // `[data-reveal-armed]`) never both apply and never both fail to apply.
    document.documentElement.dataset.revealBoot = "ready";

    // Animations in flight, so an unmount (or a re-run of this effect when
    // `prefersReducedMotion` resolves) does not leave Motion writing to
    // nodes this observer has stopped tracking.
    const running = new Map<HTMLElement, { complete: () => void }[]>();

    const settle = (target: HTMLElement) => {
      const animations = running.get(target) ?? [];
      running.delete(target);
      for (const controls of animations) {
        controls.complete();
      }
      // Finish at the target value: stop() schedules a later write of the
      // interrupted value, which can override even a synchronous style reset.
      for (const item of [
        target,
        ...target.querySelectorAll<HTMLElement>("[data-reveal-item]"),
      ]) {
        item.style.removeProperty("opacity");
        item.style.removeProperty("transform");
      }
      target.dataset.revealed = "";
      delete target.dataset.revealArmed;
    };

    const reveal = (target: HTMLElement) => {
      if (prefersReducedMotion) {
        settle(target);
        return;
      }

      const rows = target.querySelectorAll<HTMLElement>("[data-reveal-item]");
      const animateTargets = rows.length > 0 ? Array.from(rows) : [target];
      const animations: { complete: () => void }[] = [];
      running.set(target, animations);

      let remaining = animateTargets.length;
      const onSettled = () => {
        remaining -= 1;
        if (remaining <= 0) {
          settle(target);
        }
      };

      for (const [position, item] of animateTargets.entries()) {
        const indexProperty = getComputedStyle(item).getPropertyValue("--index").trim();
        const parsedIndex =
          indexProperty === "" ? Number.NaN : Number.parseFloat(indexProperty);
        const index = Number.isNaN(parsedIndex) ? position : parsedIndex;

        const controls = animate(
          item,
          { opacity: 1, y: 0 },
          {
            type: "spring",
            visualDuration: 0.6,
            bounce: 0.12,
            delay: index * STAGGER_STEP_SECONDS,
          }
        );

        animations.push(controls);
        // Settle on rejection too: a failed animation must not strand content hidden.
        controls.then(onSettled, onSettled);
      }
    };

    // Targets already revealed at load (a target that was already in view
    // before the first scroll happened) queue here instead of revealing
    // immediately. Flushed on the first scroll, or by the idle failsafe
    // below if no scroll ever comes.
    let hasScrolled = false;
    const pending = new Set<HTMLElement>();

    const flushPending = () => {
      for (const target of pending) {
        reveal(target);
      }
      pending.clear();
    };

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          const target = entry.target as HTMLElement;
          observer.unobserve(target);

          // Any intersection reported before the first scroll is a target
          // that was already in view at mount — IntersectionObserver fires
          // for those on its first callback regardless of scroll, so this
          // flag is what actually distinguishes "the visitor scrolled here"
          // from "this was on screen the whole time".
          if (hasScrolled) {
            reveal(target);
          } else {
            pending.add(target);
          }
        }
      },
      { rootMargin: "0px 0px -15% 0px" }
    );

    // An armed section is invisible but still in the tab order, so a
    // keyboard visitor can reach a link inside it before it has scrolled
    // into view. Focus must never land on something the visitor cannot
    // see: reveal the section immediately, without waiting for the
    // observer, and drop it from the watch list.
    const onFocusIn = (event: FocusEvent) => {
      const origin = event.target;

      if (!(origin instanceof Element)) {
        return;
      }

      const armed = origin.closest<HTMLElement>("[data-reveal][data-reveal-armed]");

      if (armed) {
        observer.unobserve(armed);
        pending.delete(armed);
        settle(armed);
      }
    };

    document.addEventListener("focusin", onFocusIn);

    // Registered before the arming loop below, so a scroll that lands
    // between the two is never missed.
    const onScroll = () => {
      hasScrolled = true;
      clearTimeout(idleTimer);
      flushPending();
    };

    window.addEventListener("scroll", onScroll, { passive: true, once: true });

    // A visitor who never scrolls would otherwise leave an in-view-at-load
    // section hidden forever.
    const idleTimer = setTimeout(() => {
      if (!hasScrolled) {
        hasScrolled = true;
        flushPending();
      }
    }, IDLE_REVEAL_MS);

    // A reload (or a back/forward navigation) can restore the scroll
    // position mid-page, and the browser is not guaranteed to have done
    // that restore before this effect runs — hence the scroll listener
    // above stays registered regardless of what happens here, to catch a
    // late restore as an ordinary scroll. The `hasScrolled` gate itself
    // exists for exactly one situation: a fresh load at the top of the
    // page, where revealing an in-view section immediately would spend the
    // reveal before the visitor has engaged with the page at all. A
    // restored mid-page position is the opposite situation — the visitor
    // is already deep in the content, there is no "first scroll" moment
    // left to wait for, and deferring those sections until a scroll that
    // may never come (the visitor could already be at the bottom) is
    // exactly the stranding this file exists to prevent. This check is
    // deliberately scoped to `scrollY === 0` — "the page has not been
    // scrolled or restored anywhere" — rather than some other condition;
    // do not widen or remove it without re-reading this paragraph.
    if (window.scrollY > 0) {
      hasScrolled = true;
      clearTimeout(idleTimer);
    }

    for (const target of targets) {
      // Never re-arm something already revealed. This effect re-runs when
      // `prefersReducedMotion` settles, and re-hiding a section the visitor
      // has already watched appear is worse than never animating it.
      if (target.dataset.revealed !== undefined) {
        continue;
      }

      target.dataset.revealArmed = "";

      // Reveal-on-mount, never gated on scroll — the header bar's contract.
      if (target.dataset.reveal === "load") {
        reveal(target);
        continue;
      }

      observer.observe(target);
    }

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idleTimer);
      observer.disconnect();

      for (const target of running.keys()) {
        settle(target);
      }
    };
  }, [prefersReducedMotion]);

  return null;
}
