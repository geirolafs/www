import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

describe("SettledText", () => {
  test("renders the text as given on the server, in the element asked for", async () => {
    const { SettledText } = await import("../src/client");
    const html = renderToStaticMarkup(
      <SettledText as="h2" className="t" text={`Orð${"­"}a`} />
    );
    expect(html).toBe(`<h2 class="t">Orð${"­"}a</h2>`);
  });
});
