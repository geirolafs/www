"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import type {
  AmbientStripeVariant,
  LanternStepId,
} from "@/lib/content/localhost-ambient-stripe";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { cn } from "@/lib/utils";
import {
  GLOW_MASK,
  GLOW_OPACITY,
  GLOW_WIDTH_PX,
  GRADIENT,
  LANTERN_HEIGHT_PX,
  LANTERN_REST_TIP_PX,
  LANTERN_STEPS,
  LANTERN_WIDTH_PX,
  lanternMask,
  VARIANTS,
  WAKE_ATTACK_MS,
  WAKE_FULL_SPEED,
  WAKE_RELEASE_MS,
} from "./config";

/** Same threshold as the site stripe; see `stripe.tsx`. */
const REVEAL_THRESHOLD_PX = 100;
/** Below this everything counts as settled and the frame loop sleeps. */
const EPSILON = 0.001;
/** More than this in one frame is a jump, not a scroll. */
const JUMP_PX = 400;

const GLOW_STYLE: CSSProperties = {
  width: GLOW_WIDTH_PX,
  backgroundImage: GRADIENT,
  maskImage: GLOW_MASK,
  opacity: GLOW_OPACITY,
};

/** The hotspot: an ellipse hugging the left edge, fading out to the right. */
const LANTERN_STYLE: CSSProperties = {
  width: LANTERN_WIDTH_PX,
  height: LANTERN_HEIGHT_PX,
  opacity: 0,
};

const FILL_STYLE: CSSProperties = { backgroundImage: GRADIENT };

/** Frame-rate-independent step of `from` towards `to` with time constant `tau`. */
function approach(from: number, to: number, dt: number, tau: number) {
  return to + (from - to) * Math.exp(-dt / tau);
}

type Spring = { value: number; velocity: number };

/** One semi-implicit Euler step of a damped spring towards `to`; `dt` in ms. */
function stepSpring(
  spring: Spring,
  to: number,
  dt: number,
  { stiffness, damping }: { stiffness: number; damping: number }
) {
  const seconds = dt / 1000;
  spring.velocity +=
    (stiffness * (to - spring.value) - damping * spring.velocity) * seconds;
  spring.value += spring.velocity * seconds;
}

type AmbientStripeProps = {
  variant: AmbientStripeVariant;
  /** Multiplies every gain in the variant's tuning; 1 is as tuned. */
  strength: number;
  /** The 10px bar over the glow. Off, the glow stands on its own. */
  showBar: boolean;
  /** Which of the lantern's tuning steps to run; see `LANTERN_STEPS`. */
  lanternStep: LanternStepId;
};

/**
 * A candidate replacement for `Stripe`: a glow in the stripe's gradient, with
 * the 10px bar over it optionally. Spans whatever `relative` wrapper it is
 * placed in — the whole page, on the experiment — which must also be
 * `isolate` — the glow sits at `-z-10` so it lights the
 * page *behind* the text in the gutter rather than tinting it, and without
 * the isolation it would drop behind the page background.
 *
 * Motion is layered so each part owns one transform:
 *
 *   breath   CSS keyframes on the outer glow wrapper, no JS.
 *   wake     scroll *speed* (never position) → the glow widens and a wider
 *            halo fades up, trailing a few px against the scroll, then
 *            settles. Rises in ~90ms, lets go over ~900ms.
 *   lantern  cursor, as a magnet → a hotspot at the cursor's height, drawn out
 *            towards the cursor and thinning as it stretches, on springs
 *            that overshoot a little. It brightens as the
 *            cursor nears the left edge. The hotspot is a window onto a
 *            full-height copy of the gradient, counter-translated, so its
 *            colour is always the colour of the stripe at that height.
 *
 * Only `transform` and `opacity` are written. The frame loop runs only while
 * something is settling and sleeps otherwise, so a still page costs nothing.
 * Reduced motion keeps the static glow and nothing else.
 */
export function AmbientStripe({
  variant,
  strength,
  showBar,
  lanternStep,
}: AmbientStripeProps) {
  const step = LANTERN_STEPS[lanternStep];
  const reduced = useLiveReducedMotion();
  const tuning = VARIANTS[variant];
  const wake = reduced ? null : tuning.wake;
  const lantern = reduced ? null : tuning.lantern;
  const breath = reduced ? 0 : tuning.breath;

  const layerRef = useRef<HTMLDivElement>(null);
  const spreadRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const lanternRef = useRef<HTMLDivElement>(null);
  const lanternInnerRef = useRef<HTMLDivElement>(null);

  // The bar's reveal, as `Stripe` does it, minus the sessionStorage mirror.
  // The glow does not wait for it: it is there from the first frame.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      if (window.scrollY >= REVEAL_THRESHOLD_PX) {
        root.dataset.stripe = "revealed";
      } else {
        delete root.dataset.stripe;
      }
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      delete root.dataset.stripe;
    };
  }, []);

  useEffect(() => {
    if (!(wake || lantern)) {
      return;
    }

    let frame = 0;
    let lastT = 0;
    let lastY = window.scrollY;
    let energy = 0;
    let trail = 0;

    let pointerX = Number.POSITIVE_INFINITY;
    let pointerY = 0;
    let lanternAmount = 0;
    const lanternY: Spring = { value: 0, velocity: 0 };
    const lanternTip: Spring = { value: LANTERN_REST_TIP_PX, velocity: 0 };
    let innerHeight = 0;

    const tick = (t: number) => {
      const dt = lastT ? Math.min(t - lastT, 64) : 16;
      lastT = t;
      let settled = true;

      if (wake && spreadRef.current && haloRef.current) {
        const y = window.scrollY;
        const delta = y - lastY;
        lastY = y;
        // A jump this size in one frame is an anchor link or a restored
        // position, not a visitor scrolling; it should not flare the glow.
        const v = Math.abs(delta) > JUMP_PX ? 0 : delta / dt;
        const target = Math.min(1, Math.abs(v) / WAKE_FULL_SPEED);
        energy = approach(
          energy,
          target,
          dt,
          target > energy ? WAKE_ATTACK_MS : WAKE_RELEASE_MS
        );
        const trailTarget =
          Math.max(-1, Math.min(1, v / WAKE_FULL_SPEED)) * wake.trail * strength;
        trail = approach(
          trail,
          trailTarget,
          dt,
          Math.abs(trailTarget) > Math.abs(trail)
            ? WAKE_ATTACK_MS * 2
            : WAKE_RELEASE_MS / 2
        );

        spreadRef.current.style.transform = `translate3d(0, ${trail.toFixed(2)}px, 0) scaleX(${(1 + energy * wake.spread * strength).toFixed(4)})`;
        haloRef.current.style.transform = `translate3d(0, ${(trail * 1.6).toFixed(2)}px, 0) scaleX(2.2)`;
        haloRef.current.style.opacity = Math.min(
          1,
          energy * wake.lift * strength
        ).toFixed(4);

        if (target > EPSILON || energy > EPSILON || Math.abs(trail) > 0.05) {
          settled = false;
        }
      }

      if (lantern && layerRef.current && lanternRef.current && lanternInnerRef.current) {
        const rect = layerRef.current.getBoundingClientRect();
        if (rect.height !== innerHeight) {
          innerHeight = rect.height;
          lanternInnerRef.current.style.height = `${innerHeight}px`;
        }
        // Proximity to the left edge, 0 → 1. The brightness follows it to the
        // 0.75, so a cursor anywhere in range lights the glow visibly.
        const proximity = Math.max(0, 1 - pointerX / lantern.reach);
        const target = proximity ** 0.75;
        lanternAmount = approach(lanternAmount, target, dt, step.fadeMs);

        const localY = pointerY - rect.top;
        // Faded out, the hotspot jumps to the cursor rather than sweeping
        // in from wherever it was last left.
        if (lanternAmount < EPSILON) {
          lanternY.value = localY;
          lanternY.velocity = 0;
        } else {
          stepSpring(lanternY, localY, dt, step.follow);
        }

        // The tip is drawn out from where it rests towards the cursor, never
        // past it. The pull holds nearly full across the range and gives out
        // only at its far end — a magnet grips, then lets go — so the glow
        // reaches most of the way to a cursor well out in the page. A cursor
        // inside the resting glow leaves it be.
        // Clamped to the reach: with no cursor `pointerX` is Infinity, and
        // Infinity × a zero grip is NaN, which would poison the spring for
        // good — and a transform with NaN in it is silently dropped.
        const gap = Math.max(0, Math.min(pointerX, lantern.reach) - LANTERN_REST_TIP_PX);
        const grip = Math.min(1, lantern.pull * proximity ** 0.3 * strength);
        const tipTarget = LANTERN_REST_TIP_PX + gap * grip;
        stepSpring(lanternTip, tipTarget, dt, step.stretch);

        // Stretched out, it thins, as if keeping its mass. The inner fill is
        // counter-scaled and -translated so the gradient under it stays
        // mapped to the page: its colour is always the stripe's at that height.
        const sx = Math.max(0.5, lanternTip.value / LANTERN_REST_TIP_PX);
        const sy = Math.max(0.55, 1 / Math.sqrt(sx));
        const top = lanternY.value - LANTERN_HEIGHT_PX / 2;
        const innerOffset = LANTERN_HEIGHT_PX / 2 - (top + LANTERN_HEIGHT_PX / 2) / sy;

        lanternRef.current.style.transform = `translate3d(0, ${top.toFixed(2)}px, 0) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
        lanternInnerRef.current.style.transform = `translate3d(0, ${innerOffset.toFixed(2)}px, 0) scaleY(${(1 / sy).toFixed(4)})`;
        lanternRef.current.style.opacity = Math.min(
          1,
          lanternAmount * lantern.peak * step.peak * strength
        ).toFixed(4);

        if (
          Math.abs(lanternAmount - target) > EPSILON ||
          Math.abs(lanternY.value - localY) > 0.1 ||
          Math.abs(lanternY.velocity) > 1 ||
          Math.abs(lanternTip.value - tipTarget) > 0.1 ||
          Math.abs(lanternTip.velocity) > 1
        ) {
          settled = false;
        }
      }

      if (settled) {
        frame = 0;
        lastT = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }
    };

    const wakeUp = () => {
      // `lastY` is left where the last frame put it, so the first frame
      // after waking measures the scroll that woke it.
      if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        return;
      }
      pointerX = event.clientX;
      pointerY = event.clientY;
      wakeUp();
    };

    // Leaving the window lets the lantern fade rather than hang where it was.
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        pointerX = Number.POSITIVE_INFINITY;
        wakeUp();
      }
    };

    window.addEventListener("scroll", wakeUp, { passive: true });
    if (lantern) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerout", onPointerOut);
    }
    wakeUp();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", wakeUp);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
    };
  }, [wake, lantern, strength, step]);

  return (
    <>
      {/* `overflow-y: clip` holds everything inside — the lantern and the
          wake's trail both move — to the page's bottom. Without it a
          transformed child near the end grows the scrollable area and the
          page scrolls on past its footer. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 -z-10 overflow-y-clip"
        ref={layerRef}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 origin-left",
            breath > 0 && "animate-ambient-breath"
          )}
          style={{ "--breath-strength": breath * strength } as CSSProperties}
        >
          <div
            className="absolute inset-y-0 left-0 origin-left"
            key={variant}
            ref={spreadRef}
          >
            <div className="absolute inset-y-0 left-0" style={GLOW_STYLE} />
          </div>
          {wake && (
            <div
              className="absolute inset-y-0 left-0 origin-left"
              ref={haloRef}
              style={{ ...GLOW_STYLE, opacity: 0 }}
            />
          )}
        </div>
        {lantern && (
          <div
            className="absolute top-0 left-0 origin-left"
            ref={lanternRef}
            style={{
              ...LANTERN_STYLE,
              maskImage: lanternMask(step.falloff),
              mixBlendMode: step.multiply ? "multiply" : "normal",
            }}
          >
            <div
              className="absolute top-0 left-0 w-full origin-top-left"
              ref={lanternInnerRef}
              style={FILL_STYLE}
            />
          </div>
        )}
      </div>
      {showBar && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[10px]"
          style={FILL_STYLE}
          data-stripe-reveal
        />
      )}
    </>
  );
}
