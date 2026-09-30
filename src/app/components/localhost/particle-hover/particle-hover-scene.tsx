"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { ParticleReveal } from "@/app/components/localhost/particle-hover/particle-reveal";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

type ParticleHoverSceneProps = {
  src: string;
  label: string;
};

/** v1's `SPRING_PHYSICS.soft`, which its `Parallax` smoothed the scroll with. */
const PARALLAX_SPRING = { stiffness: 100, damping: 30, restDelta: 0.001 };
/** v1 swapped the page's range for this one below its `md` breakpoint. */
const MOBILE_QUERY = "(max-width: 767px)";

/**
 * v1's /dev/particle-hover page body: `Parallax range={["0%", "-20%"]}
 * offset={["start start", "end start"]}` around a full-height centred
 * `Section`. The parallax is v1's `useParallax` inlined — scroll progress
 * mapped to a translateY range and smoothed by a soft spring — including its
 * mobile swap to 0% → 6%. Under reduced motion it holds still (v1 only
 * shrank the range).
 *
 * The particle box keeps v1's classes. v1's `h-fill` was never a utility and
 * is dropped; its `w-full` against a shrink-to-fit parent resolved to the
 * `min-w-75` floor, so the canvas is a 300px square at every width, as v1's
 * was.
 */
export function ParticleHoverScene({ src, label }: ParticleHoverSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useLiveReducedMotion();
  const isMobile = useMediaQuery(MOBILE_QUERY);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const range = isMobile ? ["0%", "6%"] : ["0%", "-20%"];
  const y = useSpring(useTransform(scrollYProgress, [0, 1], range), PARALLAX_SPRING);

  return (
    <div ref={ref}>
      <motion.div
        className="flex min-h-dvh w-full items-center justify-center gap-10"
        style={reducedMotion ? undefined : { y }}
      >
        <div>
          <ParticleReveal
            className="aspect-square w-full min-w-75 max-w-95 sm:min-w-75 md:max-w-107.5"
            hoverParticleColor="rgb(251, 72, 72)"
            initialParticleSize={2}
            label={label}
            particleColor="rgba(242, 241, 237, 0.7)"
            repelRadius={350}
            src={src}
          />
        </div>
      </motion.div>
    </div>
  );
}
