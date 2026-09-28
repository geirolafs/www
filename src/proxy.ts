import { type NextRequest, NextResponse } from "next/server";

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
 * internals, the PostHog `/ingest` rewrites, `/api`, the `/og`, `/rss` and
 * `/md` routes themselves, and any path with a dot (llms.txt, sitemap.xml,
 * cv.pdf, favicons).
 */
export default function proxy(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";

  if (accept.includes("text/markdown")) {
    const url = request.nextUrl.clone();
    url.pathname =
      request.nextUrl.pathname === "/" ? "/md" : `/md${request.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|ingest/|api/|og$|og/|rss$|rss/|md$|md/|.*\\..*).*)"],
};
