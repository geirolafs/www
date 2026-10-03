import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { packageReadme } from "@/lib/package-readme";

/**
 * The package pages answer `Accept: text/markdown` with their README. The
 * skiptingar one must be the installed copy, not a second copy in this repo.
 */

const installed = readFileSync(
  join(import.meta.dir, "../../node_modules/skiptingar/README.md"),
  "utf8"
);

describe("packageReadme", () => {
  test("skiptingar is the installed README", async () => {
    const readme = await packageReadme("skiptingar");
    expect(readme).toBe(installed);
    expect(readme?.startsWith("# skiptingar")).toBe(true);
    expect(readme).toContain("localeDetails");
  });

  test("settle-rag is the README in this repo", async () => {
    const readme = await packageReadme("settle-rag");
    expect(readme?.startsWith("# settle-rag")).toBe(true);
    expect(readme).toBe(
      readFileSync(join(import.meta.dir, "../packages/settle-rag/README.md"), "utf8")
    );
  });

  test("anything else has none", async () => {
    expect(await packageReadme("ambient-stripe")).toBeUndefined();
    expect(await packageReadme("constructor")).toBeUndefined();
    expect(await packageReadme("../../package")).toBeUndefined();
  });
});
