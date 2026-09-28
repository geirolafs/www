import sharp from "sharp";
import { REMOTE_IMAGE_HOSTS } from "@/lib/config/image";
import { tokens } from "@/lib/design-tokens";
import { logger } from "@/lib/logger";

export const OG_FETCH_TIMEOUT_MS = 3000;
export const OG_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const OG_MAX_IMAGE_PIXELS = 20_000_000;
export const OG_TITLE_MAX_CHARS = 120;
export const OG_DESCRIPTION_MAX_CHARS = 90;
export const OG_CACHE_CONTROL = "public, max-age=3600, s-maxage=3600";

const IMAGE_PATH = /^\/f\/[a-zA-Z0-9._-]+$/;
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const IMAGE_FORMATS = new Set(["jpeg", "png", "webp", "heif", "gif"]);

function allowedImageUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !REMOTE_IMAGE_HOSTS.some(host => host === url.hostname) ||
      url.port ||
      url.username ||
      url.password ||
      !IMAGE_PATH.test(url.pathname)
    ) {
      return null;
    }
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

async function readLimitedBody(response: Response): Promise<Buffer> {
  const length = Number(response.headers.get("content-length"));
  const type = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (length > OG_MAX_IMAGE_BYTES || !type || !IMAGE_TYPES.has(type)) {
    throw new Error("Unsupported or oversized OG image response");
  }
  if (!response.body) {
    throw new Error("Empty OG image response");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      // Content-Length may be absent, wrong, or describe compressed bytes.
      if (size > OG_MAX_IMAGE_BYTES) {
        throw new Error("OG image download exceeds byte limit");
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks, size);
  } finally {
    reader.releaseLock();
  }
}

/** Invalid or failed images leave the card's plain background in place. */
export async function fetchOgImage(value: string): Promise<string | null> {
  const url = allowedImageUrl(value);
  if (!url) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OG_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: "error",
      signal: controller.signal,
      // Cache the finished card, not an unbounded upstream response that
      // Next would otherwise clone and buffer independently of our reader.
      cache: "no-store",
    });
    if (!response.ok) return null;
    const buffer = await readLimitedBody(response);
    clearTimeout(timeout);

    const image = sharp(buffer, { limitInputPixels: OG_MAX_IMAGE_PIXELS });
    const metadata = await image.metadata();
    if (!metadata.format || !IMAGE_FORMATS.has(metadata.format)) return null;

    const png = await image
      .resize(tokens.og.width, tokens.og.height, { fit: "cover", position: "center" })
      .flatten({ background: tokens.colors.backgroundDark })
      .png()
      .timeout({ seconds: 2 })
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (error) {
    logger.warn("og image fetch failed", {
      route: "/og",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    clearTimeout(timeout);
    // Also stop unread/error bodies and downloads rejected by their headers.
    controller.abort();
  }
}

export function truncateOgText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars - 1).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : undefined)}…`;
}
