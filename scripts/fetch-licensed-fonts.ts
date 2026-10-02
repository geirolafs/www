#!/usr/bin/env bun
/**
 * Puts the licensed fonts in place before a build: Bespoke Serif
 * (the /localhost package pages and the fluid-typography pages) and ABC Areal by
 * Dinamo (the fluid-typography pages, a commercial licence).
 *
 * Bespoke Serif is a Fontshare font under the ITF Free Font License. It
 * allows self-hosting on our own site but forbids distributing the file
 * through a public repository, and ABC Areal's commercial licence forbids it
 * too, so both are gitignored
 * (`src/app/styles/local-fonts/licensed/`) and live in a private repo
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
 *
 * `--optional` (used by `bun run dev`) warns instead of failing, so the rest
 * of the site still runs without the token. Only the pages that use these
 * fonts then fail to compile. `bun run build` stays strict.
 */

import { closeSync, existsSync, openSync, readSync } from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import { join } from "node:path";

const FONT_DIR = join(import.meta.dir, "../src/app/styles/local-fonts/licensed");
const FILES = [
  "BespokeSerif-Variable.woff2",
  "ABCArealSuperfamilyVariable.woff2",
] as const;
/** Every WOFF2 file starts with these four bytes. */
const WOFF2_SIGNATURE = "wOF2";

const token = process.env.FONTS_TOKEN_SKIPTIR;
const repo = process.env.FONTS_REPO ?? "geirolafs/fonts";
/** Unset means the repo's default branch, whatever it is called. */
const ref = process.env.FONTS_REF;
const prefix = (process.env.FONTS_PATH_PREFIX ?? "").replace(/^\/+|\/+$/g, "");
const optional = process.argv.includes("--optional");

function isWoff2(bytes: Uint8Array): boolean {
  return new TextDecoder().decode(bytes.slice(0, 4)) === WOFF2_SIGNATURE;
}

/** A file is in place only when it exists and starts like a WOFF2 file. */
function isInPlace(file: string): boolean {
  const path = join(FONT_DIR, file);
  if (!existsSync(path)) {
    return false;
  }
  // Only the signature matters, so skip reading the whole font.
  const head = Buffer.alloc(WOFF2_SIGNATURE.length);
  const fd = openSync(path, "r");
  try {
    readSync(fd, head, 0, head.length, 0);
  } finally {
    closeSync(fd);
  }
  return isWoff2(head);
}

/** Ends the script: a warning with `--optional`, an error otherwise. */
function fail(message: string): never {
  if (optional) {
    console.warn(`${message}\n\nfonts: continuing without them (--optional).`);
    process.exit(0);
  }
  console.error(message);
  process.exit(1);
}

async function download(file: string, authToken: string): Promise<void> {
  const path = prefix ? `${prefix}/${file}` : file;
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const url = `https://api.github.com/repos/${repo}/contents/${path}${query}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
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
  if (!isWoff2(bytes)) {
    throw new Error(`${file}: the download is not a WOFF2 file`);
  }
  // Write then rename, so a cut-off download never leaves a broken file.
  const target = join(FONT_DIR, file);
  await Bun.write(`${target}.part`, bytes);
  await rename(`${target}.part`, target);
  console.log(`fonts: downloaded ${file}`);
}

async function main(): Promise<void> {
  const missing = FILES.filter(file => !isInPlace(file));
  if (missing.length === 0) {
    console.log("fonts: licensed fonts are in place");
    return;
  }

  if (!token) {
    fail(
      [
        `fonts: missing ${missing.join(", ")}`,
        "",
        "These fonts may not live in the public repo (ITF Free Font License, Dinamo licence).",
        `Locally: copy them into ${FONT_DIR}`,
        "In CI: set FONTS_TOKEN_SKIPTIR, a fine-grained token with read-only Contents",
        "access to the private fonts repo, so they can be downloaded here.",
      ].join("\n")
    );
  }

  await mkdir(FONT_DIR, { recursive: true });
  await Promise.all(missing.map(file => download(file, token)));
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : "fonts: download failed");
});
