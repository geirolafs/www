"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IMAGE_QUALITIES } from "@/lib/config/image";
import type { PortfolioMedia } from "@/lib/content/portfolio";
import { useLiveReducedMotion } from "@/lib/hooks/use-live-reduced-motion";
import { cn } from "@/lib/utils";

/** Image cards fade from an inline blur; videos play over a first-frame poster. */

/** The card is a fixed width at every breakpoint, so this never varies. */
const CARD_SIZES = "304px";

/**
 * Start fetching a card's media roughly a screen before it arrives. Only the
 * inline axis matters — the strip scrolls horizontally — so the block margins
 * stay at 0 and vertical scrolling does not warm up the whole row.
 */
const PRELOAD_MARGIN = "0px 100% 0px 100%";

// Position media above the blur even after opacity reaches 1 and its
// temporary stacking context disappears. Image fill also sets this inline.
const FADE_CLASS =
  "absolute inset-0 size-full object-cover transition-opacity duration-500";

// Overscale the blur so its transparent edges stay outside the clipped card.
function BlurLayer({ dataUrl }: { dataUrl: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 scale-110 bg-center bg-cover blur-xl"
      style={{ backgroundImage: `url("${dataUrl}")` }}
    />
  );
}

function CarouselImage({ blurDataUrl, url }: { blurDataUrl?: string; url: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {blurDataUrl && <BlurLayer dataUrl={blurDataUrl} />}
      <Image
        alt=""
        className={cn(FADE_CLASS, isLoaded ? "opacity-100" : "opacity-0")}
        draggable={false}
        fill
        onLoad={() => setIsLoaded(true)}
        quality={IMAGE_QUALITIES.medium}
        sizes={CARD_SIZES}
        src={url}
      />
    </>
  );
}

/**
 * With a poster underneath there is no need to make the browser decode a
 * frame ahead of playback — the poster is that frame. Without one, the `#t=`
 * media fragment makes the browser seek and decode frame one rather than
 * stopping at metadata, so a card that is never played still has something
 * to show: every video card under `prefers-reduced-motion`, where `play()`
 * is deliberately not called.
 */
function videoSource(url: string, hasEntered: boolean, hasPoster: boolean) {
  if (!hasEntered) {
    return;
  }
  return hasPoster ? url : `${url}#t=0.001`;
}

function CarouselVideo({
  blurDataUrl,
  posterUrl,
  url,
}: {
  blurDataUrl?: string;
  posterUrl?: string;
  url: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useLiveReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  // Once a card has been on screen its source stays mounted. Unsetting it
  // would re-download the file every time the card cycles back around.
  const [hasEntered, setHasEntered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries.at(-1);
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          setHasEntered(true);
        }
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: PRELOAD_MARGIN }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return;
    }

    if (isVisible && !prefersReducedMotion) {
      // Autoplay can still be refused (low-power mode, a browser policy we do
      // not control). The poster (or, without one, the first frame) stands
      // in, so there is nothing to do.
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
    return () => video.pause();
  }, [isVisible, prefersReducedMotion]);

  const reveal = () => setIsLoaded(true);

  return (
    <>
      {posterUrl ? (
        <CarouselImage blurDataUrl={blurDataUrl} url={posterUrl} />
      ) : (
        blurDataUrl && <BlurLayer dataUrl={blurDataUrl} />
      )}
      {/* Decorative, without controls or a tab stop. Reveal on playing so
          autoplay refusal leaves the poster visible. */}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: no `controls`, so not focusable */}
      <video
        aria-hidden="true"
        className={cn(
          FADE_CLASS,
          posterUrl && "duration-200",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        disablePictureInPicture
        draggable={false}
        loop
        muted
        onLoadedData={posterUrl ? undefined : reveal}
        onPlaying={reveal}
        playsInline
        preload={hasEntered ? "metadata" : "none"}
        ref={ref}
        src={videoSource(
          url,
          hasEntered && !(prefersReducedMotion && posterUrl),
          Boolean(posterUrl)
        )}
      />
    </>
  );
}

export function CarouselCard({ media }: { media: PortfolioMedia }) {
  return media.kind === "video" ? (
    <CarouselVideo
      blurDataUrl={media.blurDataUrl}
      posterUrl={media.posterUrl}
      url={media.url}
    />
  ) : (
    <CarouselImage blurDataUrl={media.blurDataUrl} url={media.url} />
  );
}
