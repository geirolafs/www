import { type NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/lib/config/site";
import { subsiteForHost, subsiteForPath } from "@/lib/config/subsites";

/**
 * Markdown content negotiation (acceptmarkdown.com). A request whose Accept
 * header names `text/markdown` is rewritten to `/md/<path>`, where
 * `src/app/md/[[...path]]/route.ts` serves the markdown rendition of the
 * page — the agent sees markdown at the page's own URL. Browsers never send
 * `text/markdown`, so a bare substring check is the whole negotiation.
 *
 * The markdown responses carry `Vary: Accept` themselves — set in the route
 * handler, because Next owns the Vary header on *page* responses (it
 * overwrites whatever this proxy sets with its own rsc/next-router values,
 * verified against 16.2) and only the route handler's survives. The HTML
 * variant therefore answers without `Vary: Accept`, which is safe on this
 * deployment: the proxy runs before Vercel's CDN cache, so a markdown request
 * is re-keyed to `/md/<path>` before any cache lookup and can never be handed
 * the cached HTML variant, or vice versa.
 *
 * The matcher keeps this away from everything that is not a page: Next
 * internals, the PostHog `/ingest` rewrites, `/api`, the `/rss` and
 * `/md` routes themselves, and any path with a dot (llms.txt, sitemap.xml,
 * cv.pdf, favicons). Those paths answer the same on a subsite host, which is
 * what keeps a subsite's own `/_next` assets and fonts loading from its root.
 */
export default function proxy(request: NextRequest) {
  // A malformed escape makes Next throw while decoding route params, which
  // surfaces as a 500. Next 16 runs a second decode over the already-decoded
  // param, so `/notes/tag/%25E0` fails as well as `/notes/tag/%E0` — checked
  // against 16.3. Anything that cannot survive two decodes is the client's
  // mistake: answer 400 before Next gets to it.
  try {
    decodeURIComponent(decodeURIComponent(request.nextUrl.pathname));
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  const { pathname } = request.nextUrl;
  // The Host header, not `nextUrl.hostname`: the dev server builds `nextUrl`
  // from its own hostname, so `skiptingar.localhost:3000` reads as `localhost`
  // there. On Vercel the header is the domain that routed the request here.
  const hostname = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  // A package page reached on the main site moves to its own host, so each
  // page has one URL. Only the production hosts redirect: dev and preview
  // deployments keep the /localhost path working. 307 until the subdomains
  // have settled; a 308 is cached by browsers and hard to take back.
  const onMainSite =
    hostname === siteConfig.domain || hostname === `www.${siteConfig.domain}`;
  const moved = onMainSite ? subsiteForPath(pathname) : undefined;
  if (moved) {
    const target = new URL(moved.rest, moved.subsite.origin);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 307);
  }

  // A subsite host serves its /localhost route at its root:
  // `skiptingar.geir.studio/x` renders `/localhost/skiptingar/x`. Every other
  // path on that host falls under the route too, so the rest of the site is
  // not reachable there. The one exception is the page's endpoint: its client
  // code posts to `/localhost/skiptingar/api`, which must not become
  // `/localhost/skiptingar/localhost/skiptingar/api`. Only that path passes as
  // it is, so each page still has one URL on its host.
  const subsite = subsiteForHost(hostname);
  const isEndpoint = subsite !== undefined && pathname === `${subsite.path}/api`;
  const page =
    subsite && !isEndpoint
      ? `${subsite.path}${pathname === "/" ? "" : pathname}`
      : pathname;

  const accept = request.headers.get("accept") ?? "";

  if (accept.includes("text/markdown")) {
    const url = request.nextUrl.clone();
    url.pathname = page === "/" ? "/md" : `/md${page}`;
    return NextResponse.rewrite(url);
  }

  if (subsite) {
    const url = request.nextUrl.clone();
    url.pathname = page;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|ingest/|api/|rss$|rss/|md$|md/|.*\\..*).*)"],
};
