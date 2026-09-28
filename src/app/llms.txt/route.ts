import { llmsTxtMarkdown } from "@/lib/markdown";

/**
 * `/llms.txt` — the llmstxt.org map of this site for AI agents: a summary,
 * when-to-use guidance, and links to every page including the markdown
 * renditions. Assembled in `src/lib/markdown.ts` from the same content
 * modules the pages render.
 */
export function GET() {
  return new Response(llmsTxtMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
