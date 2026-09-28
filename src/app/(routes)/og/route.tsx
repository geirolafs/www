import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getNotesPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/config/site";
import { tokens } from "@/lib/design-tokens";
import { logger } from "@/lib/logger";
import {
  fetchOgImage,
  OG_CACHE_CONTROL,
  OG_DESCRIPTION_MAX_CHARS,
  OG_TITLE_MAX_CHARS,
  truncateOgText,
} from "@/lib/og-image";

/**
 * Dynamic OG Image Generation
 *
 * Satori cannot read woff2, so this uses a static TTF instanced from the
 * Same Univers variable font at wght=600. Regenerate after a font re-export,
 * from `src/app/styles/local-fonts/`:
 *
 *   uvx --from fonttools --with brotli python -c "
 *   from fontTools.ttLib import TTFont
 *   from fontTools.varLib import instancer
 *   f = TTFont('SameUnivers-beta_IP4VF.woff2'); f.flavor = None
 *   instancer.instantiateVariableFont(f, {'wght': 600}).save('SameUnivers-600.ttf')"
 */
export async function GET(request: Request) {
  // Cards are keyed by slug and filled from the post's own frontmatter, never
  // from the query string — otherwise anyone could render arbitrary text
  // under the site's name. No slug is the plain site card; an unknown slug is
  // a cheap 404 rather than a render.
  const slug = new URL(request.url).searchParams.get("slug");
  const post = slug ? getNotesPosts().find(candidate => candidate.slug === slug) : null;
  if (slug && !post) {
    return new Response("Not found", { status: 404 });
  }

  const title = truncateOgText(
    post?.metadata.title || siteConfig.name,
    OG_TITLE_MAX_CHARS
  );
  const description = truncateOgText(
    post?.metadata.summary || "",
    OG_DESCRIPTION_MAX_CHARS
  );
  const imageParam = post?.image;

  // Parallelize image fetch and font read (both are independent)
  const [image, fontData] = await Promise.all([
    imageParam ? fetchOgImage(imageParam) : Promise.resolve(null),
    readFile(join(process.cwd(), "src/app/styles/local-fonts/SameUnivers-600.ttf")),
  ]);

  try {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: tokens.colors.backgroundDark,
          padding: tokens.spacing.og.padding,
          fontFamily: "Same Univers",
          position: "relative",
        }}
      >
        {/* Background image */}
        {image && (
          /* biome-ignore lint/a11y/useAltText: OG background */
          /* biome-ignore lint/performance/noImgElement: Satori requires native img */
          <img
            src={image}
            width={tokens.og.width}
            height={tokens.og.height}
            style={{
              position: "absolute",
              width: tokens.og.width,
              height: tokens.og.height,
              objectFit: "cover",
            }}
          />
        )}

        {/* Gradient overlay for text legibility */}
        {image && (
          <div
            style={{
              position: "absolute",
              width: tokens.og.width,
              height: tokens.og.height,
              background: tokens.og.gradient,
            }}
          />
        )}

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            marginBottom: tokens.spacing.og.gap,
          }}
        >
          <div
            style={{
              fontSize: tokens.typography.fontSize,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.foreground,
              letterSpacing: tokens.typography.letterSpacing,
              lineHeight: tokens.typography.lineHeight,
              textWrap: "balance",
              textShadow: tokens.og.textShadow,
            }}
          >
            {title}
          </div>
        </div>

        {/* Description - truncated to ~3 lines */}
        {description ? (
          <div
            style={{
              fontSize: tokens.typography.fontSize,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.mutedLight,
              letterSpacing: tokens.typography.letterSpacingTight,
              lineHeight: tokens.typography.lineHeight,
              position: "relative",
              textWrap: "balance",
              maxWidth: "100%",
              marginBottom: tokens.spacing.og.gap,
              textShadow: tokens.og.textShadow,
            }}
          >
            {description}
          </div>
        ) : null}

        {/* Domain */}
        <div
          style={{
            fontSize: tokens.typography.fontSize,
            color: tokens.colors.chart5,
            position: "relative",
            textShadow: tokens.og.textShadowSmall,
          }}
        >
          {siteConfig.domain}
        </div>
      </div>,
      {
        width: tokens.og.width,
        height: tokens.og.height,
        headers: { "Cache-Control": OG_CACHE_CONTROL },
        fonts: [
          {
            name: "Same Univers",
            data: fontData,
            weight: tokens.typography.fontWeight.semibold,
            style: "normal",
          },
        ],
      }
    );
  } catch (error) {
    logger.error("og image generation failed", {
      route: "/og",
      title,
      has_description: Boolean(description),
      has_image: Boolean(image),
      error: error instanceof Error ? error.message : String(error),
    });

    // Return a fallback response with system fonts (no image to avoid double failure)
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: tokens.colors.backgroundDark,
          padding: tokens.spacing.og.padding,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: tokens.spacing.og.gap,
          }}
        >
          <div
            style={{
              fontSize: tokens.typography.fontSize,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.foreground,
              letterSpacing: tokens.typography.letterSpacing,
              lineHeight: tokens.typography.lineHeight,
            }}
          >
            {title}
          </div>
        </div>
        {description ? (
          <div
            style={{
              fontSize: tokens.typography.fontSize,
              color: tokens.colors.mutedLight,
              maxWidth: "100%",
              lineHeight: tokens.typography.lineHeight,
              marginBottom: tokens.spacing.og.gap,
            }}
          >
            {description}
          </div>
        ) : null}
        <div
          style={{
            fontSize: tokens.typography.fontSize,
            color: tokens.colors.chart5,
          }}
        >
          {siteConfig.domain}
        </div>
      </div>,
      {
        width: tokens.og.width,
        height: tokens.og.height,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
