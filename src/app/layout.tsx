import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
// The /next entry reads useParams(), which Next 16.3 refuses to prerender on
// the dynamic notes shells. /react matches Analytics; data groups by path.
import { SpeedInsights } from "@vercel/speed-insights/react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { CssStudio } from "@/components/shell/css-studio";
import { GridOverlayToggle } from "@/components/shell/grid-overlay-toggle";
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
            to its rendered, visible default — nothing is ever stranded,
            because the JS that would clear the marker may be the JS that
            failed to run.

            Second job: on a reload or back/forward to a scrolled position,
            show the stripe's bar from the first frame. `data-stripe` is only
            set after hydration (by `AmbientStripe` now, by the archived
            `stripe.tsx` before it), and this script can't read `scrollY` (it
            runs before the browser restores the position), so the state is
            mirrored into `sessionStorage` and this reads it back. Only the
            archived `stripe.tsx` wrote that mirror; `AmbientStripe` doesn't
            yet, so for now this read finds nothing and changes nothing. Ordinary navigations
            start at the top and ignore it. Wrapped in `try` and placed last,
            so a storage error falls back to the hidden stripe without
            costing the reveal marker above. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: blocking pre-paint boot marker must run before hydration, cannot be an external/deferred script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.setAttribute('data-reveal-boot','armed');setTimeout(function(){if(document.documentElement.getAttribute('data-reveal-boot')==='armed'){document.documentElement.setAttribute('data-reveal-boot','off')}},2000);try{var n=performance.getEntriesByType('navigation')[0];if(n&&(n.type==='reload'||n.type==='back_forward')&&sessionStorage.getItem('stripe:revealed')==='1'){document.documentElement.setAttribute('data-stripe','revealed')}}catch(e){}",
          }}
        />
        {process.env.NODE_ENV === "development" && (
          <>
            {/* react-grab 0.1.37 sizes its overlay layers from the viewport,
                so a 0-wide or 0-tall viewport (DevTools docked over the whole
                page, a hidden tab) gives it empty OffscreenCanvases, and its
                `drawImage` of one throws InvalidStateError into the dev
                overlay. An empty canvas draws nothing anyway, so this skips
                that one case and passes every other call through. react-grab
                0.2.0 no longer draws through OffscreenCanvas, so drop this
                when the pin below moves past 0.1.37. */}
            <script
              // biome-ignore lint/security/noDangerouslySetInnerHtml: dev-only guard that must be in place before react-grab draws, static string
              dangerouslySetInnerHTML={{
                __html:
                  "(function(){if(typeof OffscreenCanvas==='undefined')return;var p=CanvasRenderingContext2D.prototype,d=p.drawImage;p.drawImage=function(s){if(s instanceof OffscreenCanvas&&(s.width===0||s.height===0))return;return d.apply(this,arguments)}})();",
              }}
            />
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
        <main className="flex flex-auto flex-col">{children}</main>
        <Analytics />
        <SpeedInsights />
        {/* shift+G, as in Figma. The columns load on the first press. */}
        <GridOverlayToggle />
        {process.env.NODE_ENV === "development" && <CssStudio />}
      </body>
    </html>
  );
}
