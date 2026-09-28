import { afterEach, beforeAll, describe, expect, spyOn, test } from "bun:test";
import sharp from "sharp";
import { REMOTE_IMAGE_HOSTS } from "@/lib/config/image";
import { tokens } from "@/lib/design-tokens";
import {
  fetchOgImage,
  OG_FETCH_TIMEOUT_MS,
  OG_MAX_IMAGE_BYTES,
  OG_TITLE_MAX_CHARS,
  truncateOgText,
} from "./og-image";

const URL = `https://${REMOTE_IMAGE_HOSTS[0]}/f/example.png`;
let png: Buffer;
// Bun adds fetch.preconnect; only the callable surface is mocked here.
const fetchHost: { fetch: (...args: Parameters<typeof fetch>) => Promise<Response> } =
  globalThis;
let fetchMock: ReturnType<typeof spyOn<typeof fetchHost, "fetch">>;

beforeAll(async () => {
  png = await sharp({
    create: { width: 8, height: 8, channels: 3, background: "red" },
  })
    .png()
    .toBuffer();
});

afterEach(() => fetchMock?.mockRestore());

function imageResponse(body: BodyInit = new Uint8Array(png), headers = {}) {
  return new Response(body, { headers: { "content-type": "image/png", ...headers } });
}

function interceptFetch() {
  fetchMock = spyOn(fetchHost, "fetch").mockImplementation(() =>
    Promise.resolve(imageResponse())
  );
  return fetchMock;
}

describe("OG image boundary", () => {
  test("rejects untrusted URLs before making any request", async () => {
    interceptFetch();
    for (const value of [
      "invalid",
      "/f/local.png",
      "http://127.0.0.1/f/image",
      "https://[::1]/f/image",
      "http://169.254.169.254/latest/meta-data/",
      "file:///etc/passwd",
      "data:image/png;base64,AAAA",
      `http://${REMOTE_IMAGE_HOSTS[0]}/f/image`,
      `https://${REMOTE_IMAGE_HOSTS[0]}.example.com/f/image`,
      `https://${REMOTE_IMAGE_HOSTS[0]}@example.com/f/image`,
      `https://user:secret@${REMOTE_IMAGE_HOSTS[0]}/f/image`,
      `https://${REMOTE_IMAGE_HOSTS[0]}:8443/f/image`,
      `https://${REMOTE_IMAGE_HOSTS[0]}/admin`,
      `https://${REMOTE_IMAGE_HOSTS[0]}/f/../admin`,
      `https://${REMOTE_IMAGE_HOSTS[0]}/f/%2e%2e/admin`,
      `https://${REMOTE_IMAGE_HOSTS[0]}/f/id%2fadmin`,
      `https://${REMOTE_IMAGE_HOSTS[0]}/f/nested/image`,
    ]) {
      expect(await fetchOgImage(value)).toBeNull();
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("both existing hosts produce a valid, correctly sized PNG", async () => {
    interceptFetch();
    for (const host of REMOTE_IMAGE_HOSTS) {
      const result = await fetchOgImage(`https://${host}/f/example.png`);
      expect(result).toStartWith("data:image/png;base64,");
      const output = Buffer.from(result?.split(",")[1] ?? "", "base64");
      const metadata = await sharp(output).metadata();
      expect(metadata.width).toBe(tokens.og.width);
      expect(metadata.height).toBe(tokens.og.height);
    }
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      redirect: "error",
      cache: "no-store",
    });
  });

  test("rejects redirects and cancels the request without a second fetch", async () => {
    interceptFetch().mockResolvedValue(
      new Response(null, { status: 302, headers: { location: "http://127.0.0.1" } })
    );
    expect(await fetchOgImage(URL)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  test("rejects oversized declared bodies before reading them", async () => {
    let read = false;
    const body = new ReadableStream(
      {
        pull(controller) {
          read = true;
          controller.close();
        },
      },
      { highWaterMark: 0 }
    );
    interceptFetch().mockResolvedValue(
      imageResponse(body, { "content-length": String(OG_MAX_IMAGE_BYTES + 1) })
    );
    expect(await fetchOgImage(URL)).toBeNull();
    expect(read).toBe(false);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  test("enforces actual streamed bytes with missing or dishonest lengths", async () => {
    interceptFetch();
    for (const headers of [{}, { "content-length": "1" }]) {
      let chunksRead = 0;
      const body = new ReadableStream(
        {
          pull(controller) {
            chunksRead += 1;
            controller.enqueue(new Uint8Array(1024 * 1024));
          },
        },
        { highWaterMark: 0 }
      );
      fetchMock.mockResolvedValueOnce(imageResponse(body, headers));
      expect(await fetchOgImage(URL)).toBeNull();
      expect(chunksRead).toBe(6);
      expect(fetchMock.mock.lastCall?.[1]?.signal?.aborted).toBe(true);
    }
  });

  test("rejects unsupported types, disguised SVG and corrupt raster files", async () => {
    interceptFetch();
    for (const response of [
      imageResponse(new Uint8Array(png), { "content-type": "text/html" }),
      imageResponse('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"/>'),
      imageResponse("not an image"),
      new Response(null, { status: 404 }),
    ]) {
      fetchMock.mockResolvedValueOnce(response);
      expect(await fetchOgImage(URL)).toBeNull();
    }
  });

  test("rejects images with excessive decoded pixels even when downloads are small", async () => {
    const large = await sharp({
      create: { width: 5000, height: 5000, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    expect(large.length).toBeLessThan(OG_MAX_IMAGE_BYTES);
    interceptFetch().mockResolvedValue(imageResponse(new Uint8Array(large)));
    expect(await fetchOgImage(URL)).toBeNull();
  });

  test(
    "times out stalled response headers and stalled response bodies",
    async () => {
      interceptFetch();
      fetchMock.mockImplementationOnce(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            options?.signal?.addEventListener(
              "abort",
              () => reject(new Error("aborted")),
              { once: true }
            );
          })
      );
      expect(await fetchOgImage(URL)).toBeNull();

      fetchMock.mockImplementationOnce((_url, options) =>
        Promise.resolve(
          imageResponse(
            new ReadableStream({
              start(controller) {
                controller.enqueue(new Uint8Array(png));
                options?.signal?.addEventListener(
                  "abort",
                  () => controller.error(new Error("aborted")),
                  { once: true }
                );
              },
            })
          )
        )
      );
      expect(await fetchOgImage(URL)).toBeNull();
    },
    OG_FETCH_TIMEOUT_MS * 2 + 2000
  );
});

test("caps text including the ellipsis and preserves normal titles", () => {
  expect(truncateOgText("A normal title", OG_TITLE_MAX_CHARS)).toBe("A normal title");
  expect(truncateOgText("x".repeat(5000), OG_TITLE_MAX_CHARS)).toHaveLength(
    OG_TITLE_MAX_CHARS
  );
  expect(truncateOgText("hello world again", 12)).toBe("hello…");
});
