import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The README of each package that has a page under `/localhost`, served as
 * that page's markdown rendition (see `src/app/md/[[...path]]/route.ts`).
 * `skiptingar` is read from the installed copy, so the text always matches
 * the version the page documents. `settle-rag` is not on npm and lives in
 * this repo.
 *
 * Both files are listed in `outputFileTracingIncludes` in `next.config.ts`,
 * because a read from a built path is not something the file tracer sees.
 * Keep the two in step. The paths start at the project root on purpose:
 * Turbopack turns `require.resolve` into a module id, not a file path.
 */

const readmeDirs: Record<string, string> = {
  skiptingar: "node_modules/skiptingar",
  "settle-rag": "src/packages/settle-rag",
};

/** The README for a `/localhost/<name>` page, or `undefined` if there is none. */
export async function packageReadme(name: string): Promise<string | undefined> {
  const dir = Object.hasOwn(readmeDirs, name) ? readmeDirs[name] : undefined;
  if (!dir) {
    return undefined;
  }
  try {
    return await readFile(join(process.cwd(), dir, "README.md"), "utf8");
  } catch {
    return undefined;
  }
}
