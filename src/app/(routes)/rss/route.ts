import { getNotesPosts, sortPostsByDate } from "@/lib/blog";
import { siteConfig } from "@/lib/config/site";
import { logger } from "@/lib/logger";

// XML escape function to prevent XML injection
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

// Extract first paragraph from MDX content for RSS preview
function getContentPreview(content: string): string {
  // Remove MDX imports and components
  const cleaned = content
    .replace(/^import\s+.*$/gm, "")
    .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, "")
    .replace(/<[A-Z][^>]*\/>/g, "")
    .trim();

  // Find first non-empty paragraph
  const paragraphs = cleaned.split(/\n\n+/);
  for (const p of paragraphs) {
    const text = p.trim();
    if (
      text &&
      !text.startsWith("#") &&
      !text.startsWith("-") &&
      !text.startsWith("```")
    ) {
      // Limit to ~300 chars
      return text.length > 300 ? `${text.slice(0, 297)}...` : text;
    }
  }
  return "";
}

export async function GET() {
  let allBlogs: ReturnType<typeof getNotesPosts> = [];
  try {
    allBlogs = sortPostsByDate(getNotesPosts());
  } catch (error) {
    logger.warn("rss posts load failed", {
      route: "/rss",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const itemsXml = allBlogs
    .map(post => {
      const preview = getContentPreview(post.content);
      const description = preview
        ? `${post.metadata.summary}\n\n${preview}`
        : post.metadata.summary || "";
      return `<item>
          <title>${escapeXml(post.metadata.title)}</title>
          <link>${siteConfig.url}/notes/${post.slug}</link>
          <description>${escapeXml(description)}</description>
          <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
          <guid isPermaLink="true">${siteConfig.url}/notes/${post.slug}</guid>
        </item>`;
    })
    .join("\n");

  const lastBuildDate =
    allBlogs.length > 0
      ? new Date(allBlogs[0].metadata.publishedAt).toUTCString()
      : new Date().toUTCString();

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>${siteConfig.name} - Blog</title>
        <link>${siteConfig.url}</link>
        <description>${siteConfig.description}</description>
        <language>en-us</language>
        <lastBuildDate>${lastBuildDate}</lastBuildDate>
        <generator>Next.js</generator>
        ${itemsXml}
    </channel>
  </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate", // Cache for 24 hours
    },
  });
}
