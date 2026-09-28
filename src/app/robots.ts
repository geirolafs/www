import { siteConfig } from "@/lib/config/site";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // `/md/` is the markdown rendition of every page, reached via content
        // negotiation — indexing it would register each page twice.
        disallow: ["/api/", "/md/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
