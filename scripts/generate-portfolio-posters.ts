#!/usr/bin/env bun
/**
 * Generates a full-size poster still for every video in the carousel:
 * `public/portfolio-posters/<key>.webp`, plus `src/data/portfolio-posters.json`
 * mapping UploadThing key -> the public path of that file.
 *
 * The poster is the video's very first frame, which is what makes it work.
 * A video card paints its poster through the same `<Image>` path an image
 * card uses, so while the file is still downloading the card is
 * indistinguishable from an image card beside it. When the clip starts
 * playing, its first frame is pixel-for-pixel the poster, so the only thing
 * the viewer sees change is that the picture begins to move. Seeking any
 * further in for a "nicer" frame would break that: the poster would show one
 * moment and the clip would begin from another.
 *
 * Like `generate-portfolio-blur.ts`, this is an author-time script. `ffmpeg`
 * reads each remote URL directly and decodes only the first frame, so the
 * files are never downloaded in full. `ffmpeg` is not a dependency of `next
 * build`, CI, or Vercel; the outputs are committed. Unlike the blur script,
 * a missing `ffmpeg` is a hard error here — this script does nothing else,
 * so there is nothing useful to do without it.
 *
 * Re-run this (`bun run generate:posters`) whenever
 * `src/data/random-portfolio.json` is replaced — new videos get a poster,
 * posters for keys no longer present are deleted, and keys that already have
 * a file on disk are skipped. Pass `--force` to regenerate every poster.
 */

import { readdir, unlink } from "node:fs/promises";
import { write } from "bun";
import sharp from "sharp";
import portfolioAssets from "../src/data/random-portfolio.json";
import { VIDEO_EXTENSION } from "../src/lib/utils/video-extension";
import { grabVideoFrame, mapWithConcurrency } from "./lib";

const POSTER_DIR = new URL("../public/portfolio-posters/", import.meta.url);
const MANIFEST_PATH = new URL("../src/data/portfolio-posters.json", import.meta.url);

/** The URL path the files are served from, as `next/image` will see it. */
const PUBLIC_PREFIX = "/portfolio-posters/";

/** How many ffmpeg processes run at once. */
const CONCURRENCY = 4;

/**
 * Width, in pixels, of the stored poster. The card is 304px wide, so 960
 * covers a 3× display without upscaling — the same bucket `next/image`
 * would pick for that card from `IMAGE_SIZES`. The optimizer derives every
 * smaller variant from this one file at request time.
 */
const POSTER_WIDTH = 960;

const POSTER_WEBP_QUALITY = 85;

const isForce = process.argv.includes("--force");

type ManifestEntry = (typeof portfolioAssets)[number];

function posterFileName(key: string): string {
  return `${key}.webp`;
}

/** Exactly frame zero: no seek, so no near-miss frame. */
async function extractFirstFrame(url: string): Promise<Buffer> {
  const frame = await grabVideoFrame(url);
  if (!frame.ok) {
    throw new Error(frame.stderr);
  }
  return frame.buffer;
}

async function generatePoster(entry: ManifestEntry): Promise<void> {
  const frame = await extractFirstFrame(entry.url);
  const encoded = await sharp(frame)
    .resize({ width: POSTER_WIDTH, withoutEnlargement: true })
    .webp({ quality: POSTER_WEBP_QUALITY })
    .toBuffer();
  await write(new URL(posterFileName(entry.key), POSTER_DIR), encoded);
}

async function listExistingPosters(): Promise<Set<string>> {
  try {
    const names = await readdir(POSTER_DIR);
    return new Set(names.filter(name => name.endsWith(".webp")));
  } catch {
    return new Set();
  }
}

async function main() {
  if (!Bun.which("ffmpeg")) {
    console.error("ffmpeg not found — install it and re-run.");
    process.exit(1);
  }

  const videoEntries = portfolioAssets.filter(asset => VIDEO_EXTENSION.test(asset.name));
  const wantedFiles = new Set(videoEntries.map(entry => posterFileName(entry.key)));
  const existingFiles = await listExistingPosters();

  const toGenerate = videoEntries.filter(
    entry => isForce || !existingFiles.has(posterFileName(entry.key))
  );

  const failedKeys: string[] = [];
  await mapWithConcurrency(toGenerate, CONCURRENCY, async entry => {
    try {
      await generatePoster(entry);
    } catch (error) {
      failedKeys.push(entry.key);
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `Failed to generate poster for ${entry.key} (${entry.name}): ${message}`
      );
    }
  });

  if (failedKeys.length > 0) {
    console.error(
      `\n${failedKeys.length} poster(s) failed: ${failedKeys.join(", ")}. Not writing the manifest — fix the failures and re-run.`
    );
    process.exit(1);
  }

  const stale = [...existingFiles].filter(name => !wantedFiles.has(name));
  await Promise.all(stale.map(name => unlink(new URL(name, POSTER_DIR))));

  const manifest: Record<string, string> = {};
  for (const key of videoEntries.map(entry => entry.key).sort()) {
    manifest[key] = `${PUBLIC_PREFIX}${posterFileName(key)}`;
  }
  await write(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `Video posters: ${toGenerate.length} generated, ${videoEntries.length - toGenerate.length} kept, ${stale.length} pruned.`
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
