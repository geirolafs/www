import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const PACKAGE_ROOT = join(import.meta.dir, "..");
/** The one file that may reach into another package: tests only. */
const TEST_HELPER = "test/hyphenate.ts";

function listTypeScriptFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === "node_modules" || entry.name === "dist") {
      return [];
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listTypeScriptFiles(full);
    }
    return entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? [full] : [];
  });
}

const transpiler = new Bun.Transpiler({ loader: "tsx" });

// scanImports drops imports that are only used as types, and `import type` is
// this repo's convention. Removing the type markers makes those visible too.
const TYPE_ONLY_IMPORT = /\bimport\s+type\b/g;
const TYPE_ONLY_EXPORT = /\bexport\s+type\s*(?=[{*])/g;
const INLINE_TYPE_KEYWORD = /(?<=[{,]\s*)type\s+(?=[\w$])/g;

/** Every module specifier a source file imports, requires or re-exports. */
function specifiersOf(source: string): string[] {
  const visible = source
    .replace(TYPE_ONLY_IMPORT, "import")
    .replace(TYPE_ONLY_EXPORT, "export ")
    .replace(INLINE_TYPE_KEYWORD, "");
  const found = [...transpiler.scanImports(visible), ...transpiler.scan(visible).imports];
  return [...new Set(found.map(entry => entry.path))];
}

function escapesPackage(specifier: string, from: string): boolean {
  if (specifier.startsWith("@/")) {
    return true;
  }
  if (!specifier.startsWith(".")) {
    return false;
  }
  return relative(PACKAGE_ROOT, resolve(dirname(from), specifier)).startsWith("..");
}

describe("package boundary", () => {
  const files = listTypeScriptFiles(PACKAGE_ROOT);

  test("finds the source files it is meant to check", () => {
    expect(files.length).toBeGreaterThan(5);
    expect(files.some(file => file.endsWith("src/rag.ts"))).toBe(true);
  });

  test("nothing imports through the @/ alias or outside the folder, but the test helper", () => {
    for (const file of files) {
      const path = relative(PACKAGE_ROOT, file);
      if (path === TEST_HELPER) {
        continue;
      }
      for (const specifier of specifiersOf(readFileSync(file, "utf8"))) {
        expect(escapesPackage(specifier, file), `${path} imports "${specifier}"`).toBe(
          false
        );
      }
    }
  });

  test("only the test helper imports skiptingar", () => {
    const users = files
      .filter(file =>
        specifiersOf(readFileSync(file, "utf8")).some(specifier =>
          specifier.includes("skiptingar")
        )
      )
      .map(file => relative(PACKAGE_ROOT, file));
    expect(users).toEqual([TEST_HELPER]);
  });

  test("the source has no runtime dependencies beyond React", () => {
    for (const file of files) {
      const path = relative(PACKAGE_ROOT, file);
      if (!path.startsWith("src/")) {
        continue;
      }
      for (const specifier of specifiersOf(readFileSync(file, "utf8"))) {
        const isLocal = specifier.startsWith(".");
        const isReact = /^react(-dom)?(\/|$)/.test(specifier);
        expect(
          isLocal || (isReact && path.startsWith("src/client/")),
          `${path} imports "${specifier}"`
        ).toBe(true);
      }
    }
  });
});

describe("sizes.json", () => {
  test("matches a fresh build, and the README shows the same figures", async () => {
    // Failing here means: run `bun run size` in the package folder and commit the result.
    const { measureSizes, renderReadme, renderSizes, SIZES_PATH } = await import(
      "../scripts/size"
    );
    const sizes = await measureSizes();
    expect(readFileSync(SIZES_PATH, "utf8")).toBe(renderSizes(sizes));
    const readme = readFileSync(join(PACKAGE_ROOT, "README.md"), "utf8");
    expect(readme).toBe(renderReadme(readme, sizes));
  }, 30_000);
});
