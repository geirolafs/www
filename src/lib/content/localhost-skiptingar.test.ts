import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The page's install and usage snippets name things from the published
 * package. This checks that every non-type name they import from `skiptingar`,
 * `skiptingar/react` or `skiptingar/client` is exported by that entry in the
 * installed version, so a rename in the package fails here and not on the page.
 */

const source = readFileSync(join(import.meta.dir, "localhost-skiptingar.ts"), "utf8");

const entries: Record<string, () => Promise<Record<string, unknown>>> = {
  skiptingar: () => import("skiptingar"),
  "skiptingar/react": () => import("skiptingar/react"),
  "skiptingar/client": () => import("skiptingar/client"),
};

/** Non-type names imported from each package entry in the content file. */
function importedNames(): Map<string, Set<string>> {
  const found = new Map<string, Set<string>>();
  for (const [, clause, specifier] of source.matchAll(
    /import\s*\{([^}]*)\}\s*from\s*"(skiptingar(?:\/[a-z]+)?)"/g
  )) {
    const names = found.get(specifier) ?? new Set<string>();
    for (const part of (clause ?? "").split(",")) {
      const name = part.trim();
      if (name && !name.startsWith("type ")) {
        names.add(name.split(/\s+as\s+/)[0] ?? name);
      }
    }
    found.set(specifier, names);
  }
  return found;
}

describe("skiptingar names used in the page copy", () => {
  const imported = importedNames();

  test("the content file imports something from the package", () => {
    expect(imported.size).toBeGreaterThan(0);
  });

  for (const [specifier, names] of imported) {
    test(`${specifier} exports ${[...names].join(", ")}`, async () => {
      const load = entries[specifier];
      expect(load, `no entry loader for ${specifier}`).toBeDefined();
      const exported = await (load as () => Promise<Record<string, unknown>>)();
      for (const name of names) {
        expect(exported[name], `${specifier} does not export ${name}`).toBeDefined();
      }
    });
  }
});
