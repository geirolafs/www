"use client";

import Image from "next/image";
import { useRef } from "react";
import { portfolioPreviewContent } from "@/lib/content/localhost-portfolio-preview";
import { formatBytes, isVideo, type PortfolioFile } from "./portfolio-file";

/**
 * One file on the contact sheet. The media box keeps the carousel's treatment
 * — square corners, the portfolio's 1080 × 1527 ratio, `object-cover` — on
 * the footer surface as a placeholder while it loads.
 *
 * The site's only hover response is an underline, so that is the card's too:
 * the filename takes `TextLink`'s underline on hover, in place of v1's lift
 * and shadow. Videos still play on hover and rewind on leave, as in v1.
 *
 * An `<a>` where v1 had a `<button>` calling `window.open`: the same on click,
 * plus middle-click, copy-link and a real link role.
 */
export function MediaCard({ file }: { file: PortfolioFile }) {
  const video = isVideo(file.name);
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => {
    // A leave before the play promise settles rejects it with AbortError,
    // which is expected and harmless.
    videoRef.current?.play().catch(() => undefined);
  };

  const reset = () => {
    const node = videoRef.current;
    if (node) {
      node.pause();
      node.currentTime = 0;
    }
  };

  return (
    <a
      className="group flex flex-col gap-xs"
      href={file.url}
      onMouseEnter={video ? play : undefined}
      onMouseLeave={video ? reset : undefined}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="relative aspect-[1080/1527] overflow-hidden bg-surface-footer">
        {video ? (
          <video
            className="size-full object-cover"
            loop
            muted
            playsInline
            preload="metadata"
            ref={videoRef}
            src={file.url}
          />
        ) : (
          <Image
            alt={file.name}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw"
            src={file.url}
          />
        )}
      </div>
      <div className="flex flex-col gap-2xs">
        <span className="break-all font-regular text-foreground text-label underline decoration-transparent transition-[text-decoration-color] duration-[var(--duration-feedback)] ease-out [text-decoration-thickness:var(--underline-thickness)] [text-underline-position:from-font] group-hover:decoration-foreground motion-reduce:transition-none">
          {file.name}
        </span>
        <span className="flex items-center gap-2xs font-regular text-label text-muted tabular-nums">
          <span className="border border-border px-2xs uppercase">
            {video
              ? portfolioPreviewContent.badge.video
              : portfolioPreviewContent.badge.image}
          </span>
          {formatBytes(file.size)}
        </span>
      </div>
    </a>
  );
}
