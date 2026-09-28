import { statSync } from "node:fs";
import { join } from "node:path";
import { getNotesPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/config/site";
import { logger } from "@/lib/logger";

function getFileLastModified(filePath: string): string {
  try {
    const stats = statSync(filePath);
    return stats.mtime.toISOString().split("T")[0];
  } catch (error) {
    logger.warn("sitemap stat failed", {
      route: "/sitemap.xml",
      file_path: filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    return new Date().toISOString().split("T")[0];
  }
}

export default function sitemap() {
  // Static routes with SEO properties
  const routes = [
    {
      url: siteConfig.url,
      lastModified: getFileLastModified(join(process.cwd(), "src/app/page.tsx")),
      changeFrequency: "weekly" as const,
      priority: 1.0, // Highest priority for homepage
    },
    {
      url: `${siteConfig.url}/notes`,
      lastModified: getFileLastModified(
        join(process.cwd(), "src/app/(routes)/notes/page.tsx")
      ),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    // The three trust pages share one copy file, so its mtime dates all three.
    ...(["about", "contact", "privacy"] as const).map(slug => ({
      url: `${siteConfig.url}/${slug}`,
      lastModified: getFileLastModified(join(process.cwd(), "src/lib/content/trust.ts")),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  // Blog posts and tags
  let blogs: Array<{
    url: string;
    lastModified: string;
    changeFrequency: "monthly";
    priority: number;
  }> = [];
  let tagRoutes: Array<{
    url: string;
    lastModified: string;
    changeFrequency: "weekly";
    priority: number;
  }> = [];

  try {
    const posts = getNotesPosts();
    if (posts.length > 0) {
      blogs = posts.map(post => ({
        url: `${siteConfig.url}/notes/${post.slug}`,
        lastModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

      // Collect unique tags
      const tags = new Set<string>();
      for (const post of posts) {
        for (const tag of post.metadata.tags ?? []) {
          tags.add(tag.toLowerCase());
        }
      }

      tagRoutes = [...tags].map(tag => ({
        url: `${siteConfig.url}/notes/tag/${encodeURIComponent(tag)}`,
        lastModified: new Date().toISOString().split("T")[0],
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
    }
  } catch (error) {
    logger.warn("sitemap posts load failed", {
      route: "/sitemap.xml",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return [...routes, ...blogs, ...tagRoutes];
}
