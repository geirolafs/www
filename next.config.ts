import { startMcpServer } from "@react-grab/mcp/server";
import type { NextConfig } from "next";
import {
  IMAGE_CACHE_TTL,
  IMAGE_QUALITY_ARRAY,
  IMAGE_SIZES,
  REMOTE_IMAGE_HOSTS,
} from "./src/lib/config/image";

if (process.env.NODE_ENV === "development") {
  // Dev-only tooling — surface failures but never block `next dev`
  startMcpServer().catch((error: unknown) => {
    console.warn("[react-grab] MCP server failed to start:", error);
  });
}

const nextConfig: NextConfig = {
  // Enable Cache Components for explicit caching control
  cacheComponents: true,

  // Dev only. A phone on the LAN loads the dev server by the Mac's address,
  // and Next refuses the HMR socket from any origin not listed here — which
  // leaves the client bundle waiting on it and the page never hydrates: no
  // errors, no effects, static HTML. Wildcards cover the DHCP range.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],

  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  // Aliases for the paths agents and people guess. Watching a real agent walk
  // the site (ora.ai trace, 2026-08-22) showed it trying /work and /contact
  // cold, then falling back to web search when they 404ed — a 308 to the
  // right place keeps that visit on-site. Config redirects run before the
  // proxy, so an aliased path still content-negotiates markdown after the
  // redirect lands.
  async redirects() {
    const aliases: Array<[sources: string[], destination: string]> = [
      [["/work", "/portfolio", "/projects"], "/"],
      [["/blog", "/writing"], "/notes"],
      [["/cv", "/resume"], "/cv.pdf"],
      [["/services", "/hire", "/pricing"], "/contact"],
    ];
    return aliases.flatMap(([sources, destination]) =>
      sources.map(source => ({ source, destination, permanent: true }))
    );
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },

  // Disable source maps in production for smaller builds
  productionBrowserSourceMaps: false,

  // Optimize output structure
  output: "standalone",

  // Additional performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: IMAGE_CACHE_TTL,
    qualities: IMAGE_QUALITY_ARRAY,
    imageSizes: [...IMAGE_SIZES],
    remotePatterns: REMOTE_IMAGE_HOSTS.map(hostname => ({
      protocol: "https",
      hostname,
      pathname: "/f/*",
    })),
  },
};

export default nextConfig;
