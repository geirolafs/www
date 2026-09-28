import { expect, test } from "bun:test";
import { jsonLd } from "./json-ld";

test("jsonLd cannot close its script tag and still parses back", () => {
  const data = { headline: "</script><script>alert(1)</script>" };
  const out = jsonLd(data);
  expect(out).not.toContain("<");
  expect(JSON.parse(out)).toEqual(data);
});
