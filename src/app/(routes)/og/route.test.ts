import { expect, test } from "bun:test";
import sharp from "sharp";
import { OG_CACHE_CONTROL } from "@/lib/og-image";
import { GET } from "./route";

test("no slug renders the cached plain site card", async () => {
  const response = await GET(new Request("https://www.geir.is/og"));
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe(OG_CACHE_CONTROL);
  expect(response.headers.get("content-type")).toBe("image/png");
  const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
  expect(metadata.width).toBe(1200);
  expect(metadata.height).toBe(630);
});

test("query text and images are ignored, so the card cannot be spoofed", async () => {
  const plain = await GET(new Request("https://www.geir.is/og"));
  const spoofed = await GET(
    new Request(
      "https://www.geir.is/og?title=Fake&description=Fake&image=http://127.0.0.1/private"
    )
  );
  const plainBytes = Buffer.from(await plain.arrayBuffer());
  const spoofedBytes = Buffer.from(await spoofed.arrayBuffer());
  expect(spoofedBytes.equals(plainBytes)).toBe(true);
});

test("an unknown slug is a 404, not a render", async () => {
  const response = await GET(new Request("https://www.geir.is/og?slug=not-a-post"));
  expect(response.status).toBe(404);
});
