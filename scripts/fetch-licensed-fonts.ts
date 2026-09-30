#!/usr/bin/env bun
/**
 * Puts the licensed font of /localhost/hyphenation in place before a build.
 *
 * Bespoke Serif is a Fontshare font under the ITF Free Font License. It
 * allows self-hosting on our own site but forbids distributing the file
 * through a public repository, so it is gitignored
 * (`src/app/styles/local-fonts/licensed/`) and lives in a private repo
 * instead. Geist is not here: `next/font/google` fetches it at build.
 * Locally, drop the file into that folder by hand. In CI, set
 * `FONTS_TOKEN_SKIPTIR` (a fine-grained token with read-only Contents access
 * to the fonts repo) and this script downloads whatever is missing.
 *
 * Optional environment variables: `FONTS_REPO` (default `geirolafs/fonts`),
 * `FONTS_REF` (default: the repo's default branch) and `FONTS_PATH_PREFIX` (a
 * folder in the repo; the files sit at its root by default).
 *
 * The file is written exactly as it is served: the license forbids
 * subsetting, converting or editing them. The token is never printed.
 */

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const FONT_DIR = join(import.meta.dir, "../src/app/styles/local-fonts/licensed");
const FILES = ["BespokeSerif-Variable.woff2"] as const;
/** Every WOFF2 file starts with these four bytes. */
const WOFF2_SIGNATURE = "wOF2";

const token = process.env.FONTS_TOKEN_SKIPTIR;
const repo = process.env.FONTS_REPO ?? "geirolafs/fonts";
/** Unset means the repo's default branch, whatever it is called. */
const ref = process.env.FONTS_REF;
const prefix = (process.env.FONTS_PATH_PREFIX ?? "").replace(/^\/+|\/+$/g, "");

async function download(file: string, authToken: string): Promise<void> {
  const path = prefix ? `${prefix}/${file}` : file;
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const url = `https://api.github.com/repos/${repo}/contents/${path}${query}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/vnd.github.raw",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`${file}: ${repo}/${path} answered ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 4)) !== WOFF2_SIGNATURE) {
    throw new Error(`${file}: the download is not a WOFF2 file`);
  }
  await Bun.write(join(FONT_DIR, file), bytes);
  console.log(`fonts: downloaded ${file}`);
}

async function main(): Promise<void> {
  const missing = FILES.filter(file => !existsSync(join(FONT_DIR, file)));
  if (missing.length === 0) {
    console.log("fonts: licensed fonts are in place");
    return;
  }

  if (!token) {
    console.error(
      [
        `fonts: missing ${missing.join(", ")}`,
        "",
        "These Fontshare fonts may not live in the public repo (ITF Free Font License).",
        `Locally: copy them into ${FONT_DIR}`,
        "In CI: set FONTS_TOKEN_SKIPTIR, a fine-grained token with read-only Contents",
        "access to the private fonts repo, so they can be downloaded here.",
      ].join("\n")
    );
    process.exit(1);
  }

  await mkdir(FONT_DIR, { recursive: true });
  for (const file of missing) {
    await download(file, token);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "fonts: download failed");
  process.exit(1);
});
