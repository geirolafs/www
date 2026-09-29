import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
// The /next entry reads useParams(), which Next 16.3 refuses to prerender on
// the dynamic notes shells. /react matches Analytics; data groups by path.
import { SpeedInsights } from "@vercel/speed-insights/react";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Providers } from "@/components/providers/providers";
import { siteConfig } from "@/lib/config/site";
import { jsonLd } from "@/lib/utils";
import { SameUnivers } from "./styles/fonts";

const { name, url, title, description, socialDescription, ogImage } = siteConfig;
const fullTitle = `${name} — ${title}`;
// Vercel sets VERCEL_URL in *every* environment, production included, and it
// always holds the ephemeral `*.vercel.app` deployment host — never the custom
// domain. Keying off it alone pointed og:image and metadataBase at the
// deployment hash in production. Gate on VERCEL_ENV so only previews get the
// deployment host and production keeps the canonical domain.
const baseUrl =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : url;
const ogImageUrl = `${baseUrl}${ogImage.path}`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: fullTitle, template: `%s | ${name}` },
  description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title: fullTitle,
    description,
    url,
    siteName: name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: ogImage.width,
        height: ogImage.height,
        alt: ogImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: fullTitle,
    description: socialDescription,
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * The shift+G layout grid, development only.
 *
 * The gate has to be on the *import*, not on the element. A plain
 * `{process.env.NODE_ENV === "development" && <GridOverlay />}` reads like it
 * would tree-shake and does not: importing a `"use client"` module from a
 * Server Component registers a client reference, and that reference puts the
 * chunk in the client manifest whether or not the element is ever rendered.
 * Measured — it shipped a 13k chunk referenced from every built page.
 *
 * Behind a conditional `dynamic()` the whole expression constant-folds to
 * `() => null` once `NODE_ENV` is inlined at build time, so the `import()`
 * disappears with the dead branch and no chunk is emitted. Verified by
 * grepping `.next/static` after a production build; if you touch this, grep
 * again rather than assuming.
 *
 * The *JS* is what this strips. Tailwind scans source files for class strings
 * independently of the module graph, so the overlay's two marker-colour
 * utilities (`bg-[#ff2d55]/10`, `text-[#ff2d55]`) are still emitted into the
 * production stylesheet — about 150 bytes of rules nothing references. Left
 * alone deliberately: the alternatives are inline styles or fighting the
 * content scan, and neither is worth 150 bytes.
 */
const GridOverlay =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@/components/dev/grid-overlay").then(m => m.GridOverlay))
    : () => null;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={SameUnivers.variable}
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* Pre-paint failsafe for the scroll reveal in `reveal-observer.tsx`.
            `data-reveal-boot="armed"` is what `globals.css` reads to hide
            `[data-reveal]` content before first paint, so an in-view section
            never flashes visible-then-hidden while the client bundle loads.
            The `setTimeout` is the whole point of this script: if the bundle
            never boots (404, blocked, throws before mount), the attribute
            flips to "off" on its own after 2s and every section falls back
            to its rendered, visible default — nothing is ever stranded. A
            marker with no failsafe was tried and rejected for exactly this
            case, because the JS that would clear the marker is the same JS
            that failed to run.

            The script has a second, unrelated job: pre-revealing the stripe
            on a restored scroll position.

            `globals.css` hides the stripe whenever boot is armed/ready and
            `data-stripe="revealed"` is absent, and only `stripe.tsx` ever
            sets that attribute — from an effect, so not until hydration.
            Reload half-way down the page and the stripe is therefore missing
            on the first frame and grows in 900ms later, on a page that was
            already scrolled past its threshold. The obvious fix — have this
            script check `scrollY` — does not work: it runs during head parse,
            before `<body>` exists and long before the browser restores the
            position, so it always reads 0.

            So `stripe.tsx` mirrors the revealed state into `sessionStorage`
            and this script reads it back before first paint. Gated on the
            navigation type, because a stored "revealed" only describes where
            the page will land when the browser is *restoring* a position: on
            a reload or a back/forward. (`stripe.tsx` clears it whenever the
            page is back within the threshold of the top, so a reload from up
            there starts hidden.) Arriving by an ordinary link starts at the
            top and should get the hidden stripe regardless of what the last
            visit stored. Anything unexpected — no navigation entry,
            storage throwing in a locked-down context — falls through to the
            hidden stripe, which is the behaviour without this block at all.
            Wrapped in `try` for that reason, and placed last so a throw here
            cannot cost us the reveal marker or its failsafe above. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: blocking pre-paint boot marker must run before hydration, cannot be an external/deferred script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.setAttribute('data-reveal-boot','armed');setTimeout(function(){if(document.documentElement.getAttribute('data-reveal-boot')==='armed'){document.documentElement.setAttribute('data-reveal-boot','off')}},2000);try{var n=performance.getEntriesByType('navigation')[0];if(n&&(n.type==='reload'||n.type==='back_forward')&&sessionStorage.getItem('stripe:revealed')==='1'){document.documentElement.setAttribute('data-stripe','revealed')}}catch(e){}",
          }}
        />
        {process.env.NODE_ENV === "development" && (
          <>
            {/* Pinned to the react-grab that @react-grab/mcp@0.1.37 depends on
                in bun.lock — the browser client and the local MCP server speak
                a private protocol, so they must not drift apart. Bump all
                three together. */}
            <Script
              src="//unpkg.com/react-grab@0.1.37/dist/index.global.js"
              data-options='{"theme":{"toolbar":{"enabled":false}}}'
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
            <Script
              src="//unpkg.com/@react-grab/mcp@0.1.37/dist/client.global.js"
              crossOrigin="anonymous"
              strategy="lazyOnload"
            />
          </>
        )}
      </head>
      <body className="bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD schema requires dangerouslySetInnerHTML
          dangerouslySetInnerHTML={{
            __html: jsonLd([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: siteConfig.name,
                url: siteConfig.url,
                email: `mailto:${siteConfig.email}`,
                jobTitle: siteConfig.title,
                description: siteConfig.description,
                sameAs: [
                  siteConfig.social.twitter,
                  siteConfig.social.github,
                  siteConfig.social.linkedin,
                  siteConfig.social["are.na"],
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: siteConfig.name,
                url: siteConfig.url,
                description: siteConfig.description,
              },
            ]),
          }}
        />
        <Providers>
          <main className="flex flex-auto flex-col">{children}</main>
          <Analytics />
          <SpeedInsights />
        </Providers>
        {/* shift+G, as in Figma. In production this is the `() => null` stub
            defined above, not a dropped element — see the note there. */}
        <GridOverlay />
      </body>
    </html>
  );
}
