"use client";

import Image from "next/image";
import type { CSSProperties, FocusEvent, MouseEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { localhostContent } from "@/lib/content/localhost";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { cn } from "@/lib/utils";

const { experiments } = localhostContent;

type Experiment = (typeof experiments)[number];

const isExternal = (experiment: Experiment) =>
  "external" in experiment && Boolean(experiment.external);

/**
 * The longest title, "Portfolio preview", measures ~7.44em, so 10.75vw makes
 * it ~80% of the viewport. Below `lg` the number column leaves less room, so
 * 10vw. A longer title means re-deriving these.
 */
const TITLE_CLASS =
  "col-span-7 whitespace-nowrap font-regular text-[clamp(2rem,10vw,14rem)] leading-[0.9] tracking-[-0.02em] lg:col-span-11 lg:text-[clamp(2.5rem,10.75vw,14rem)]";

/** Active full; upcoming and the one just passed faint; older ones fade out. */
function titleOpacity(index: number, active: number) {
  const distance = active - index;
  if (distance === 0) {
    return "opacity-100";
  }
  if (distance < 0 || distance === 1) {
    return "opacity-20";
  }
  if (distance === 2) {
    return "opacity-10";
  }
  return "opacity-0";
}

/**
 * The /localhost list as a pinned reel: a full-screen stage stays pinned while
 * the track scrolls past it, one `--step` per experiment. The active
 * experiment's screenshot fills the stage and the titles roll past a fixed
 * line.
 *
 * Scroll picks the active step, via sentinels and an IntersectionObserver on
 * the viewport's middle line. Clicking an inactive title scrolls to it; a
 * second click opens it.
 */
export function ExperimentReel() {
  const reducedMotion = useLiveReducedMotion();
  const [scrolled, setScrolled] = useState(0);
  const [offset, setOffset] = useState(0);
  const sentinelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rowsRef = useRef<(HTMLLIElement | null)[]>([]);
  /** The step a click is scrolling to, while that scroll is under way. */
  const targetRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const active = scrolled;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          const step = Number((entry.target as HTMLElement).dataset.step);
          // During a click's scroll, ignore every step but its target.
          if (targetRef.current !== null) {
            if (step === targetRef.current) {
              targetRef.current = null;
            }
            continue;
          }
          setScrolled(step);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    for (const sentinel of sentinelsRef.current) {
      if (sentinel) {
        observer.observe(sentinel);
      }
    }

    // Any input from the visitor, or the scroll landing, ends the lock.
    const release = () => {
      targetRef.current = null;
    };
    const options = { passive: true } as const;
    window.addEventListener("wheel", release, options);
    window.addEventListener("touchstart", release, options);
    window.addEventListener("keydown", release, options);
    window.addEventListener("scrollend", release, options);

    // Hover styles need `data-hover`: set by real pointer movement, cleared by
    // scrolling, so titles don't light up drifting under a still cursor.
    const section = sectionRef.current;
    const onPointerMove = (event: PointerEvent) => {
      if (event.movementX !== 0 || event.movementY !== 0) {
        section?.setAttribute("data-hover", "");
      }
    };
    const onScroll = () => section?.removeAttribute("data-hover");
    window.addEventListener("pointermove", onPointerMove, options);
    window.addEventListener("scroll", onScroll, options);

    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", release);
      window.removeEventListener("scrollend", release);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Roll the list by the height of the rows above the active one.
  useLayoutEffect(() => {
    const measure = () => {
      let total = 0;
      for (const [index, row] of rowsRef.current.entries()) {
        if (row && index < scrolled) {
          total += row.offsetHeight;
        }
      }
      setOffset(total);
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [scrolled]);

  /** Activates `index` immediately, then scrolls the track to match. */
  const scrollToStep = (index: number) => {
    const sentinel = sentinelsRef.current[index];
    if (!sentinel) {
      return;
    }
    targetRef.current = index;
    setScrolled(index);
    // Land the middle-of-viewport line one pixel inside this step.
    const top =
      sentinel.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + 1;
    window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const onFocus = (event: FocusEvent<HTMLAnchorElement>, index: number) => {
    if (event.currentTarget.matches(":focus-visible")) {
      scrollToStep(index);
    }
  };

  const onClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    const modified =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;
    if (index === active || modified) {
      return;
    }
    event.preventDefault();
    scrollToStep(index);
  };

  const fade = "transition-[opacity,color] duration-500 motion-reduce:transition-none";

  return (
    <section
      ref={sectionRef}
      aria-label={localhostContent.listLabel}
      className="reel group/reel relative h-[calc(100lvh+var(--count)*var(--step))] [--reel-inset:var(--spacing-sm)] lg:[--reel-inset:var(--grid-margin)]"
      style={{ "--count": experiments.length, "--step": "15rem" } as CSSProperties}
    >
      {/* One sentinel per step, offset half a screen so step 0 is active on pin. */}
      {experiments.map((experiment, index) => (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 h-[var(--step)] w-px"
          data-step={index}
          key={experiment.href}
          ref={el => {
            sentinelsRef.current[index] = el;
          }}
          style={{ top: `calc(50lvh + ${index} * var(--step))` }}
        />
      ))}

      {/* `lvh` so the stage doesn't resize as mobile toolbars move. */}
      <div className="sticky top-0 h-lvh overflow-hidden">
        {/* Passed screenshots stay opaque underneath, so skipping never gaps. */}
        <div
          aria-hidden="true"
          className="reel-media absolute inset-0 bg-foreground after:absolute after:inset-0 after:bg-foreground/30"
        >
          {experiments.map((experiment, index) => (
            <Image
              alt=""
              className={cn(
                "object-cover grayscale",
                "transition-opacity ease-linear motion-reduce:transition-none",
                index < active && "opacity-100 duration-0",
                index === active && "opacity-100 duration-500",
                index > active && "opacity-0 duration-500"
              )}
              fill
              key={experiment.href}
              priority={index === 0}
              sizes="100vw"
              src={experiment.preview}
            />
          ))}
          {/* Duotone: grayscale screenshots, multiplied by the highlight. */}
          <div className="absolute inset-0 bg-highlight mix-blend-multiply" />
        </div>

        <div className="page-grid absolute inset-x-0 top-[20lvh] text-background">
          <ul
            className="col-span-full grid grid-cols-subgrid transition-transform duration-300 motion-reduce:transition-none"
            style={{ transform: `translateY(-${offset}px)` }}
          >
            {experiments.map((experiment, index) => (
              <li
                className={cn(
                  "col-span-full grid grid-cols-subgrid items-baseline",
                  fade,
                  titleOpacity(index, active),
                  index === active && "text-highlight",
                  "group",
                  index !== active &&
                    "group-data-hover/reel:pointer-fine:hover:opacity-40group-data-hover/reel:pointer-fine:hover:duration-[var(--duration-feedback)]",
                  // Not `focus-within`: mouse focus would pin a clicked title.
                  "has-focus-visible:opacity-100"
                )}
                key={experiment.href}
                ref={el => {
                  rowsRef.current[index] = el;
                }}
              >
                <p
                  className={cn(
                    "col-span-1 font-regular text-label tabular-nums",
                    "transition-opacity duration-[var(--duration-feedback)] motion-reduce:transition-none",
                    index !== active &&
                      "opacity-0 group-has-focus-visible:opacity-100 group-data-hover/reel:pointer-fine:group-hover:opacity-100"
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className={TITLE_CLASS}>
                  <a
                    className="outline-offset-4"
                    href={experiment.href}
                    onClick={event => onClick(event, index)}
                    onFocus={event => onFocus(event, index)}
                    {...(isExternal(experiment)
                      ? { rel: "noopener noreferrer", target: "_blank" }
                      : {})}
                  >
                    {experiment.title}
                    {isExternal(experiment) ? <span aria-hidden="true"> ↗</span> : null}
                    <span className="sr-only">. {experiment.description}</span>
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
