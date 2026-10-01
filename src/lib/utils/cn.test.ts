import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cn, isHyphenationText, THEME_SCALES } from "./cn";

/**
 * tailwind-merge only knows Tailwind's default scales. Every custom scale in
 * the `@theme` block of globals.css has to be repeated in `THEME_SCALES`, and
 * forgetting one does not throw — it silently drops a class at runtime and the
 * element renders at a browser default.
 *
 * These tests exist to make that failure loud. The first pins the behaviour
 * that broke; the second catches the drift that would reintroduce it.
 */

/** Namespaces that must be declared. `color` is omitted deliberately —
 *  tailwind-merge accepts any `--color-*` name via a permissive validator. */
const SYNCED_NAMESPACES = [
  "text",
  "font-weight",
  "leading",
  "spacing",
  "radius",
] as const;

function themeKeysFromCss() {
  const css = readFileSync(join(import.meta.dir, "../../app/globals.css"), "utf8");

  const block = css.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1];
  if (!block) throw new Error("No @theme block found in globals.css");

  const found: Record<string, string[]> = {};

  for (const [, name] of block.matchAll(/^\s*--([a-z0-9-]+):/gm)) {
    // `--text-display--line-height` is a modifier on an existing scale entry,
    // not a scale of its own.
    if (name.includes("--")) continue;

    // Longest namespace first, so `font-weight` wins over `font`.
    const ns = [...SYNCED_NAMESPACES]
      .sort((a, b) => b.length - a.length)
      .find(n => name.startsWith(`${n}-`));
    if (!ns) continue;

    found[ns] ??= [];
    found[ns].push(name.slice(ns.length + 1));
  }

  return found;
}

describe("cn", () => {
  test("keeps a custom size and a custom colour together", () => {
    // The regression: without THEME_SCALES this returns "text-foreground"
    // alone, and the text renders at the browser default size.
    expect(cn("text-display text-foreground")).toBe("text-display text-foreground");
    expect(cn("text-label text-muted")).toBe("text-label text-muted");
  });

  test("keeps the text-wrap utilities alongside a size and a colour", () => {
    // `text-balance` and `text-pretty` are `text-*` but belong to the wrap
    // group, not the colour one. Getting that wrong drops the wrap silently
    // and the only symptom is a ragged heading — the same shape of failure
    // that made `cap-trim` need its non-`text-` name.
    expect(cn("text-balance text-display text-foreground")).toBe(
      "text-balance text-display text-foreground"
    );
    expect(cn("text-pretty text-body text-muted")).toBe(
      "text-pretty text-body text-muted"
    );
    // …while still being a group of their own.
    expect(cn("text-balance", "text-pretty")).toBe("text-pretty");
  });

  test("still resolves genuine conflicts, last one winning", () => {
    expect(cn("text-body", "text-display")).toBe("text-display");
    expect(cn("font-book", "font-medium")).toBe("font-medium");
    // `prose` is the only custom leading left, so the pair is custom + default.
    expect(cn("leading-prose", "leading-tight")).toBe("leading-tight");
    expect(cn("gap-md", "gap-2xs")).toBe("gap-2xs");
    expect(cn("p-site", "p-4")).toBe("p-4");
    expect(cn("rounded-pill", "rounded-md")).toBe("rounded-md");
    expect(cn("text-muted", "text-foreground")).toBe("text-foreground");
  });

  test("the page-only hy-* sizes keep a colour and replace each other", () => {
    expect(cn("text-hy-title", "text-foreground")).toBe("text-hy-title text-foreground");
    expect(cn("text-hy-title", "text-hy-body")).toBe("text-hy-body");
    expect(cn("text-hy-control text-muted")).toBe("text-hy-control text-muted");
    expect(cn("text-hy-title text-hy-track")).toBe("text-hy-title text-hy-track");
  });

  test("no hy-* colour in globals.css is read as a text size", () => {
    const css = readFileSync(join(import.meta.dir, "../../app/globals.css"), "utf8");
    const colours = [...css.matchAll(/--color-(hy-[\w-]+):/g)].map(
      match => match[1] ?? ""
    );
    expect(colours.length).toBeGreaterThan(0);
    expect(colours.filter(isHyphenationText)).toEqual([]);
  });

  test("leaves different breakpoints alone", () => {
    expect(cn("gap-sm lg:gap-md")).toBe("gap-sm lg:gap-md");
  });

  test("THEME_SCALES covers every custom scale in globals.css", () => {
    const declared = THEME_SCALES as unknown as Record<string, readonly string[]>;

    for (const [namespace, names] of Object.entries(themeKeysFromCss())) {
      // The page-only `hy-*` text sizes are covered by a validator, not a name.
      const missing = names.filter(
        n =>
          !declared[namespace]?.includes(n) &&
          !(namespace === "text" && isHyphenationText(n))
      );

      expect(
        missing,
        `globals.css declares --${namespace}-${missing.join(`, --${namespace}-`)} ` +
          "but THEME_SCALES in cn.ts does not. Add it, or cn() will silently " +
          "drop the class at runtime."
      ).toEqual([]);
    }
  });

  test("THEME_SCALES lists nothing that globals.css no longer declares", () => {
    const inCss = themeKeysFromCss();

    for (const [namespace, names] of Object.entries(THEME_SCALES)) {
      const stale = names.filter(n => !inCss[namespace]?.includes(n));

      expect(
        stale,
        `THEME_SCALES in cn.ts lists ${namespace}: ${stale.join(", ")}, which ` +
          "globals.css no longer declares. Remove it."
      ).toEqual([]);
    }
  });
});
