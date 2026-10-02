import type { NextConfig } from "next";
import {
  IMAGE_CACHE_TTL,
  IMAGE_QUALITY_ARRAY,
  IMAGE_SIZES,
  REMOTE_IMAGE_HOSTS,
} from "./src/lib/config/image";

const nextConfig: NextConfig = {
  // Enable Cache Components for explicit caching control
  cacheComponents: true,

  // No `X-Powered-By: Next.js` — it tells a scanner what to probe for.
  poweredByHeader: false,

  // Dev only. A phone on the LAN loads the dev server by the Mac's address,
  // and Next refuses the HMR socket from any origin not listed here — which
  // leaves the client bundle waiting on it and the page never hydrates: no
  // errors, no effects, static HTML. Wildcards cover the DHCP range.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],

  // `.wgsl` imports compile to vgpu shader sources (the glass-sculpture lab).
  turbopack: {
    rules: {
      "*.wgsl": {
        loaders: ["@vgpu/wgsl/loader-webpack"],
        as: "*.js",
      },
    },
  },

  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  // Aliases for the paths agents and people guess. Agents walking the site
  // try /work and /contact cold, then fall back to web search when they 404 —
  // a 308 to the right place keeps that visit on-site. Config redirects run before the
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
