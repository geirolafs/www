import { expect, test } from "bun:test";
import sharp from "sharp";
import { OG_CACHE_CONTROL } from "@/lib/og-image";
import { GET } from "./route";

test("invalid image URLs render the same cached plain card", async () => {
  const plain = await GET(new Request("https://www.geir.is/og?title=Example"));
  const rejected = await GET(
    new Request("https://www.geir.is/og?title=Example&image=http://127.0.0.1/private")
  );
  expect(rejected.status).toBe(200);
  expect(rejected.headers.get("cache-control")).toBe(OG_CACHE_CONTROL);
  expect(rejected.headers.get("content-type")).toBe("image/png");
  const plainBytes = Buffer.from(await plain.arrayBuffer());
  const rejectedBytes = Buffer.from(await rejected.arrayBuffer());
  expect(rejectedBytes.equals(plainBytes)).toBe(true);
});

test("oversized copy still renders a valid share card", async () => {
  const params = new URLSearchParams({
    title: "Long title ".repeat(500),
    description: "Long description ".repeat(500),
  });
  const response = await GET(new Request(`https://www.geir.is/og?${params}`));
  const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
  expect(metadata.format).toBe("png");
  expect(metadata.width).toBe(1200);
  expect(metadata.height).toBe(630);
});
