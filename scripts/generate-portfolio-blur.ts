#!/usr/bin/env bun
/**
 * Generates `src/data/portfolio-blur.json`, a map of UploadThing key ->
 * inlined 12px WebP data URI, used as a blurred placeholder behind each
 * carousel card while the full-size file loads.
 *
 * This exists because the carousel's media is remote
 * (`https://ve7o52t8ra.ufs.sh/f/<key>`), and Next.js can only derive a
 * `blurDataURL` automatically for statically imported local images. For a
 * remote source it has nothing to sample, so the placeholder has to be
 * generated at author time and committed instead of computed at request
 * time.
 *
 * Images sample straight from the fetched bytes. Videos have no still to
 * sample, so their placeholder comes from a frame extracted with `ffmpeg`
 * (`extractVideoFrame` below) before it goes through the same resize/encode
 * step. That extraction only ever runs here, at author time, when this
 * script is invoked by hand — `ffmpeg` is not a dependency of `next build`,
 * CI, or Vercel. If `ffmpeg` is not installed, video placeholders are simply
 * skipped rather than failing the run: an optional author-time tool being
 * absent should not block regenerating the image placeholders.
 *
 * Re-run this (`bun run generate:blur`) whenever
 * `src/data/random-portfolio.json` is replaced — new keys get their blur
 * generated, keys no longer present get pruned, and unchanged keys are
 * reused from the existing `portfolio-blur.json` rather than re-fetched.
 * Pass `--force` to regenerate every key regardless of cache.
 */

import { write } from "bun";
import sharp from "sharp";
import portfolioAssets from "../src/data/random-portfolio.json";
import { VIDEO_EXTENSION } from "../src/lib/utils/video-extension";
import { grabVideoFrame, mapWithConcurrency } from "./lib";

const OUTPUT_PATH = new URL("../src/data/portfolio-blur.json", import.meta.url);

/** How many fetch/extract+resize pairs run at once. Kept low and deliberate
 * rather than firing all 41 requests at the bucket (and, for videos,
 * spawning that many ffmpeg processes) simultaneously. */
const FETCH_CONCURRENCY = 6;

/** Width, in pixels, of the placeholder. Wide enough to carry the image's
 * dominant colours and shapes once blurred, narrow enough that the base64
 * string stays a few hundred bytes rather than kilobytes. */
const BLUR_WIDTH = 12;

const BLUR_WEBP_QUALITY = 40;

const isForce = process.argv.includes("--force");

type ManifestEntry = (typeof portfolioAssets)[number];
type MediaKind = "image" | "video";
interface QueuedEntry {
  entry: ManifestEntry;
  kind: MediaKind;
}

async function loadExistingBlurMap(): Promise<Record<string, string>> {
  const file = Bun.file(OUTPUT_PATH);
  if (!(await file.exists())) {
    return {};
  }
  return (await file.json()) as Record<string, string>;
}

/**
 * Shared tail end of both the image and video paths: shrink to
 * `BLUR_WIDTH`, encode as WebP, inline as a data URI. Kept as one function
 * so the two kinds produce identically-shaped placeholders rather than two
 * copies that could drift apart.
 */
async function toBlurDataUrl(buffer: Buffer): Promise<string> {
  const resized = await sharp(buffer)
    .resize({ width: BLUR_WIDTH })
    .webp({ quality: BLUR_WEBP_QUALITY })
    .toBuffer();
  return `data:image/webp;base64,${resized.toString("base64")}`;
}

async function generateImageBlurDataUrl(entry: ManifestEntry): Promise<string> {
  const response = await fetch(entry.url);
  if (!response.ok) {
    throw new Error(`fetch failed with status ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return toBlurDataUrl(Buffer.from(arrayBuffer));
}

async function extractVideoFrame(url: string): Promise<Buffer> {
  // Seek to 0.5s rather than 0. Several of these clips fade in from black,
  // and a frame grabbed at t=0 would encode as a solid black placeholder —
  // worse than no placeholder at all, since it looks like a loading bug
  // rather than a loading state. If the 0.5s seek fails outright (a clip
  // shorter than 0.5s, or a seek offset its container does not support),
  // retry once at t=0 before giving up — a possibly-black frame still beats
  // a hard failure.
  const primary = await grabVideoFrame(url, 0.5);
  if (primary.ok) {
    return primary.buffer;
  }
  const fallback = await grabVideoFrame(url, 0);
  if (fallback.ok) {
    return fallback.buffer;
  }
  throw new Error(
    `ffmpeg failed at 0.5s (${primary.stderr}) and at 0s (${fallback.stderr})`
  );
}

async function generateVideoBlurDataUrl(entry: ManifestEntry): Promise<string> {
  const frame = await extractVideoFrame(entry.url);
  return toBlurDataUrl(frame);
}

async function main() {
  const ffmpegPath = Bun.which("ffmpeg");

  const videoEntries = portfolioAssets.filter(asset => VIDEO_EXTENSION.test(asset.name));
  const imageEntries = portfolioAssets.filter(asset => !VIDEO_EXTENSION.test(asset.name));
  const allKeys = new Set(portfolioAssets.map(asset => asset.key));

  if (!ffmpegPath) {
    console.warn(
      `ffmpeg not found — skipping ${videoEntries.length} video placeholder(s); install ffmpeg and re-run to generate them.`
    );
  }

  const existingBlurMap = await loadExistingBlurMap();

  let generatedImageCount = 0;
  let generatedVideoCount = 0;
  const failedKeys: string[] = [];

  const imagesToGenerate = imageEntries.filter(
    entry => isForce || !(entry.key in existingBlurMap)
  );
  // With no ffmpeg, video entries needing generation are left out entirely
  // rather than attempted and failed — already-cached video keys are still
  // reused below, same as any other unchanged key.
  const videosToGenerate = ffmpegPath
    ? videoEntries.filter(entry => isForce || !(entry.key in existingBlurMap))
    : [];

  const entriesToGenerate: QueuedEntry[] = [
    ...imagesToGenerate.map(entry => ({ entry, kind: "image" as const })),
    ...videosToGenerate.map(entry => ({ entry, kind: "video" as const })),
  ];

  const generatedPairs = await mapWithConcurrency(
    entriesToGenerate,
    FETCH_CONCURRENCY,
    async ({ entry, kind }): Promise<readonly [string, string] | null> => {
      try {
        const dataUrl =
          kind === "image"
            ? await generateImageBlurDataUrl(entry)
            : await generateVideoBlurDataUrl(entry);
        if (kind === "image") {
          generatedImageCount += 1;
        } else {
          generatedVideoCount += 1;
        }
        return [entry.key, dataUrl] as const;
      } catch (error) {
        failedKeys.push(entry.key);
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `Failed to generate blur for ${entry.key} (${entry.name}): ${message}`
        );
        return null;
      }
    }
  );

  const nextBlurMap: Record<string, string> = {};
  let reusedCount = 0;
  for (const key of allKeys) {
    const generated = generatedPairs.find(pair => pair?.[0] === key);
    if (generated) {
      nextBlurMap[key] = generated[1];
      continue;
    }
    const existing = existingBlurMap[key];
    if (existing) {
      nextBlurMap[key] = existing;
      reusedCount += 1;
    }
  }

  const prunedCount = Object.keys(existingBlurMap).filter(
    key => !allKeys.has(key)
  ).length;

  if (failedKeys.length > 0) {
    console.error(
      `\n${failedKeys.length} key(s) failed to generate: ${failedKeys.join(", ")}. Not writing a partial file — fix the failures and re-run.`
    );
    process.exit(1);
  }

  const sortedKeys = Object.keys(nextBlurMap).sort();
  const sortedMap: Record<string, string> = {};
  for (const key of sortedKeys) {
    sortedMap[key] = nextBlurMap[key];
  }

  await write(OUTPUT_PATH, `${JSON.stringify(sortedMap, null, 2)}\n`);

  const generatedCount = generatedImageCount + generatedVideoCount;
  console.log(
    `Blur placeholders: ${generatedCount} generated (${generatedImageCount} image, ${generatedVideoCount} video), ${reusedCount} reused from cache, ${prunedCount} pruned.`
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
