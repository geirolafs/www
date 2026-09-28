"use client";

import type { MotionValue } from "motion/react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * Ported from a previous personal site (card-amber-psi.vercel.app). Every
 * constant below is lifted verbatim from that site's minified bundle, not
 * re-derived, and the angle math is copied structurally too — see the
 * per-line comments for why the two non-obvious choices (the cursor->char
 * angle direction and `sin(2 * angle)` for rotation) are not arbitrary.
 */

/** px influence radius around the cursor before a character feels nothing. */
const RADIUS_MOUSE = 200;
const RADIUS_TOUCH = 300;
/** px max translation at the cursor's exact centre. */
const MAX_SHIFT_MOUSE = 15;
const MAX_SHIFT_TOUCH = 25;
/** deg max rotation at the cursor's exact centre. */
const MAX_ROTATE_MOUSE = 25;
const MAX_ROTATE_TOUCH = 35;

/**
 * `mass: 3` is the signature of the whole effect. A lighter mass reads as a
 * snappy UI micro-interaction settling instantly; this heavy, slow spring is
 * what makes the field read as liquid instead of twitchy. Do not reduce it
 * to make the effect feel more "responsive" — that responsiveness is
 * exactly what the source was avoiding.
 */
const SPRING = {
  type: "spring",
  stiffness: 200,
  damping: 20,
  mass: 3,
  restDelta: 0.01,
} as const;

/**
 * Where the cursor "parks" when there isn't one: before first input, and
 * after a finger lifts or the pointer leaves the viewport. Far enough outside
 * any plausible document that every character's falloff resolves to zero.
 */
const REST_SENTINEL = -9999;

type Center = { x: number; y: number };

type Displacement = { x: number; y: number; rotate: number };

const ZERO_DISPLACEMENT: Displacement = { x: 0, y: 0, rotate: 0 };

/**
 * The field's physics, computed once per character per cursor move and then
 * split into x/y/rotate below. `angle` points FROM the cursor TO the
 * character — that direction, not the reverse, is what makes this a
 * repulsion field rather than an attraction one. `rotate` uses
 * `Math.sin(2 * angle)`, not `angle`: a character sitting diagonal to the
 * cursor twists hardest, one directly above or beside the cursor barely
 * rotates at all, and that unevenness is what reads as a field being pushed
 * rather than a uniform shove.
 */
function computeDisplacement(
  center: Center,
  cursorX: number,
  cursorY: number,
  isTouch: boolean
): Displacement {
  const radius = isTouch ? RADIUS_TOUCH : RADIUS_MOUSE;
  const maxShift = isTouch ? MAX_SHIFT_TOUCH : MAX_SHIFT_MOUSE;
  const maxRotate = isTouch ? MAX_ROTATE_TOUCH : MAX_ROTATE_MOUSE;

  const dist = Math.hypot(center.x - cursorX, center.y - cursorY);
  const strength = Math.max(0, 1 - dist / radius);

  if (strength === 0) {
    return ZERO_DISPLACEMENT;
  }

  const angle = Math.atan2(center.y - cursorY, center.x - cursorX);

  return {
    x: Math.cos(angle) * maxShift * strength,
    y: Math.sin(angle) * maxShift * strength,
    rotate: Math.sin(2 * angle) * maxRotate * strength,
  };
}

type ScatterCharacterProps = {
  char: string;
  charKey: string;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  isTouchRef: React.RefObject<boolean>;
  centersRef: React.RefObject<Map<string, Center>>;
  registerNode: (key: string, el: HTMLSpanElement | null) => void;
};

function ScatterCharacter({
  char,
  charKey,
  cursorX,
  cursorY,
  isTouchRef,
  centersRef,
  registerNode,
}: ScatterCharacterProps) {
  // The one value both re-measured lazily: `centersRef` holds cached
  // rects (populated on mount and on resize, never on pointer move), so
  // this transform only ever reads a plain object lookup per cursor move,
  // not `getBoundingClientRect()`.
  const displacement = useTransform([cursorX, cursorY], () => {
    const center = centersRef.current?.get(charKey);
    if (!center) {
      return ZERO_DISPLACEMENT;
    }
    return computeDisplacement(
      center,
      cursorX.get(),
      cursorY.get(),
      Boolean(isTouchRef.current)
    );
  });

  const x = useSpring(
    useTransform(displacement, d => d.x),
    SPRING
  );
  const y = useSpring(
    useTransform(displacement, d => d.y),
    SPRING
  );
  const rotate = useSpring(
    useTransform(displacement, d => d.rotate),
    SPRING
  );

  return (
    <motion.span
      className="inline-block"
      ref={el => registerNode(charKey, el)}
      style={{ x, y, rotate }}
    >
      {char === " " ? " " : char}
    </motion.span>
  );
}

export type ScatterLine = {
  prefix: string;
  content: string;
};

type ScatterTextProps = {
  lines: ScatterLine[];
  className?: string;
};

/**
 * Repulsion-field text, ported from a previous personal site. Every
 * character is its own `motion.span`; on pointer move each is pushed away
 * from the cursor along the cursor->character vector and twisted with it,
 * with force falling off linearly over a fixed radius. See the module
 * comment above for the exact constants and the spring, neither of which
 * are tunable without breaking the fidelity of the port.
 *
 * Cursor position lives in a `useMotionValue`, not React state, and each
 * character reads it through its own `useTransform` — so a pointer move
 * never enters the React render path, only Motion's own value graph.
 *
 * Deliberately dropped from the source: click-to-copy, the hover colour
 * swap, the pinned-cursor freeze state, and the 8s inactivity timeout. This
 * port is the field effect only.
 */
export function ScatterText({ lines, className }: ScatterTextProps) {
  const prefersReducedMotion = useLiveReducedMotion();

  // Off-screen sentinel rather than (0, 0): a real (0, 0) cursor position
  // could sit inside a character's radius at the top-left of the page, and
  // would visibly nudge it before any pointer input ever happened.
  const cursorX = useMotionValue(REST_SENTINEL);
  const cursorY = useMotionValue(REST_SENTINEL);

  const isTouchRef = useRef(false);
  const nodesRef = useRef<Map<string, HTMLSpanElement>>(new Map());
  const centersRef = useRef<Map<string, Center>>(new Map());

  const linesKey = lines.map(line => `${line.prefix}:${line.content}`).join("|");

  const registerNode = (key: string, el: HTMLSpanElement | null) => {
    if (el) {
      nodesRef.current.set(key, el);
    } else {
      nodesRef.current.delete(key);
    }
  };

  /* Biome reads `linesKey` in the dependency array below as extraneous, because
     the effect body never names it. The dependency is real but indirect: the
     effect measures and observes `nodesRef.current`, which the ref callbacks
     populate from whatever `lines` rendered. Accepting Biome's fix would leave
     changed lines permanently unmeasured, and the field would go on pushing at
     where the old characters used to be. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: linesKey reaches this effect through DOM refs, which static analysis cannot follow
  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    /* Centres are cached in *document* space, not viewport space, which is why
       the scroll offset is added here and again to the cursor below.
       `getBoundingClientRect()` is viewport-relative, and scrolling changes a
       glyph's viewport position without firing `resize` or `ResizeObserver` —
       so a viewport-space cache silently drifts by the scroll distance and the
       field ends up pushing at empty space. Document space is invalidated only
       by layout changes, which are exactly the events already handled. */
    const measure = () => {
      for (const [key, node] of nodesRef.current) {
        const rect = node.getBoundingClientRect();
        centersRef.current.set(key, {
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + rect.height / 2 + window.scrollY,
        });
      }
    };

    // Cached once here and on resize — never inside the pointer-move
    // handler below, which only ever reads the cache.
    measure();

    const resizeObserver = new ResizeObserver(measure);
    for (const node of nodesRef.current.values()) {
      resizeObserver.observe(node);
    }
    window.addEventListener("resize", measure, { passive: true });

    const onPointerMove = (event: PointerEvent) => {
      isTouchRef.current = event.pointerType === "touch";
      cursorX.set(event.clientX + window.scrollX);
      cursorY.set(event.clientY + window.scrollY);
    };

    /* A finger that lifts sends no further pointer events, so without this the
       characters it was pushing stay displaced for good. A mouse is the
       opposite case — the cursor is still sitting there after a click, and
       relaxing the field on `pointerup` would be wrong — hence the touch
       gate rather than an unconditional reset. */
    const onPointerRelease = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        cursorX.set(REST_SENTINEL);
        cursorY.set(REST_SENTINEL);
      }
    };
    window.addEventListener("pointerup", onPointerRelease, { passive: true });
    window.addEventListener("pointercancel", onPointerRelease, {
      passive: true,
    });

    // A global listener, not one scoped to the text's own tight bounding
    // box: the radius falloff already limits which characters actually
    // move, so listening broadly is what lets the field start responding
    // before the cursor is literally over a glyph, exactly as the source's
    // wider hit region did.
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Leaving the browser viewport entirely would otherwise strand nearby
    // characters mid-displacement with no further pointer event ever
    // arriving to relax them back to rest.
    const onWindowMouseOut = (event: MouseEvent) => {
      if (event.relatedTarget === null) {
        cursorX.set(REST_SENTINEL);
        cursorY.set(REST_SENTINEL);
      }
    };
    window.addEventListener("mouseout", onWindowMouseOut, { passive: true });

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mouseout", onWindowMouseOut);
      window.removeEventListener("pointerup", onPointerRelease);
      window.removeEventListener("pointercancel", onPointerRelease);
      resizeObserver.disconnect();
    };
    /* `linesKey` rather than `lines`: the measure pass and the ResizeObserver
       subscriptions are both built from the character nodes present when this
       effect runs, so new characters would otherwise never be measured or
       observed. Keying on the rendered string means a caller passing a fresh
       array of identical lines does not needlessly re-measure. */
  }, [prefersReducedMotion, cursorX, cursorY, linesKey]);

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {lines.map(line => (
          <p key={line.prefix}>
            <span className="mr-[0.5rem] text-muted">{line.prefix}</span>
            <span className="text-foreground tabular-nums">{line.content}</span>
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      {lines.map(line => (
        <p key={line.prefix}>
          <span className="mr-[0.5rem] text-muted">
            {[...line.prefix].map((char, charIndex) => (
              <ScatterCharacter
                centersRef={centersRef}
                char={char}
                charKey={`${line.prefix}-prefix-${charIndex}`}
                cursorX={cursorX}
                cursorY={cursorY}
                isTouchRef={isTouchRef}
                // biome-ignore lint/suspicious/noArrayIndexKey: static reference string, characters never reorder and may repeat
                key={`${line.prefix}-prefix-${charIndex}`}
                registerNode={registerNode}
              />
            ))}
          </span>
          <span className="text-foreground tabular-nums">
            {[...line.content].map((char, charIndex) => (
              <ScatterCharacter
                centersRef={centersRef}
                char={char}
                charKey={`${line.prefix}-content-${charIndex}`}
                cursorX={cursorX}
                cursorY={cursorY}
                isTouchRef={isTouchRef}
                // biome-ignore lint/suspicious/noArrayIndexKey: static reference string, characters never reorder and may repeat
                key={`${line.prefix}-content-${charIndex}`}
                registerNode={registerNode}
              />
            ))}
          </span>
        </p>
      ))}
    </div>
  );
}
