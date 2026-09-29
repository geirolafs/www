import type { MetadataRoute } from "next";
import { getNotesPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Pages without a date of their own carry the build date. File mtimes
  // would say the same thing on Vercel, where every checkout is fresh.
  const built = new Date().toISOString().split("T")[0];
  const posts = getNotesPosts();
  const tags = new Set(
    posts.flatMap(post => post.metadata.tags ?? []).map(tag => tag.toLowerCase())
  );

  return [
    { url: siteConfig.url, lastModified: built, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteConfig.url}/notes`,
      lastModified: built,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...(["about", "contact", "privacy"] as const).map(slug => ({
      url: `${siteConfig.url}/${slug}`,
      lastModified: built,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...posts.map(post => ({
      url: `${siteConfig.url}/notes/${post.slug}`,
      lastModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...[...tags].map(tag => ({
      url: `${siteConfig.url}/notes/tag/${encodeURIComponent(tag)}`,
      lastModified: built,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
