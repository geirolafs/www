import { trustPages } from "@/lib/content/trust";
import {
  homeMarkdown,
  notePostMarkdown,
  notesIndexMarkdown,
  notFoundMarkdown,
  tagIndexMarkdown,
  trustPageMarkdown,
} from "@/lib/markdown";

/**
 * Markdown renditions of the site's pages. Agents reach these transparently:
 * `src/proxy.ts` rewrites any request carrying `Accept: text/markdown` to
 * `/md/<original-path>`, so the agent sees markdown at the page's own URL.
 * Direct hits on `/md/*` work too but are kept out of the index —
 * `robots.ts` disallows the prefix, and every response says `Vary: Accept`
 * so caches keep the two renditions of one URL apart.
 *
 * Unknown paths get a real 404 with a markdown body pointing at the sitemap
 * and llms.txt — an agent that guessed a URL should learn where to look, not
 * just that it lost.
 */

function markdownResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;

  if (path.length === 0) {
    return markdownResponse(homeMarkdown());
  }

  if (path.length === 1) {
    if (path[0] === "notes") {
      return markdownResponse(notesIndexMarkdown());
    }
    const trustPage = trustPages.find(page => page.slug === path[0]);
    if (trustPage) {
      return markdownResponse(trustPageMarkdown(trustPage));
    }
  }

  if (path.length === 2 && path[0] === "notes") {
    const post = notePostMarkdown(path[1]);
    if (post) {
      return markdownResponse(post);
    }
  }

  if (path.length === 3 && path[0] === "notes" && path[1] === "tag") {
    const tagIndex = tagIndexMarkdown(decodeURIComponent(path[2]));
    if (tagIndex) {
      return markdownResponse(tagIndex);
    }
  }

  return markdownResponse(notFoundMarkdown(`/${path.join("/")}`), 404);
}
