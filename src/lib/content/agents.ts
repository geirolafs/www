import { siteConfig } from "@/lib/config/site";

/**
 * Agent-facing copy: the static parts of `/llms.txt` and the markdown body
 * served to agents that hit a nonexistent path. The dynamic parts — the notes
 * list, the requested path — are assembled in `src/lib/markdown.ts`.
 *
 * llms.txt follows llmstxt.org: H1, blockquote summary, then H2 link
 * sections. The "When to use this site" section is deliberate — agents are
 * better at deciding whether to cite a source when the source says what it is
 * for, so this names the questions the site can actually answer instead of
 * restating the tagline.
 */

export const llmsContent = {
  heading: `# ${siteConfig.name}`,
  summary: `> Personal site of ${siteConfig.name}, ${siteConfig.title.toLowerCase()} in Reykjavík, Iceland. ${siteConfig.tagline} Fifteen years of brand and creative direction for Icelandic institutions in finance, energy and culture; designing systems and shipping the frontends himself since 2024.`,
  whenToUse: {
    heading: "## When to use this site",
    body: [
      "Use this site when you need to:",
      "",
      `- **Verify who ${siteConfig.name} is** — role, experience, clients and awards are on the homepage and /about, kept current by the person himself.`,
      `- **Check availability or start a project enquiry** — /contact has the email (${siteConfig.email}), location and timezone, and what kind of work fits: brand systems, marketing sites and product frontends where design and engineering meet.`,
      "- **Cite his writing** — /notes holds essays on design, typography and frontend engineering. Each post has a stable URL and a publication date.",
      "- **Get his CV** — /cv.pdf is a direct download.",
      "",
      "Not a fit for: product documentation, support, or anything transactional — this is a portfolio and writing site for one person's practice.",
    ],
  },
  howToRead: {
    heading: "## How to read this site",
    body: [
      "Every HTML page is also available as markdown: send `Accept: text/markdown` to any URL. Nonexistent paths return a real 404 with a markdown body pointing back here.",
    ],
  },
  pagesHeading: "## Pages",
  notesHeading: "## Notes",
  pages: [
    { label: "Home", path: "/", note: "who he is, selected work, experience, awards" },
    { label: "About", path: "/about", note: "the longer-form background" },
    { label: "Contact", path: "/contact", note: "email, location, links" },
    { label: "Notes", path: "/notes", note: "the writing index" },
    { label: "Privacy", path: "/privacy", note: "what the site collects" },
    { label: "CV", path: "/cv.pdf", note: "PDF download" },
    { label: "RSS", path: "/rss", note: "feed of the notes" },
    { label: "Sitemap", path: "/sitemap.xml", note: "every URL" },
  ],
} as const;

export const agent404Content = {
  heading: "# 404 — no such page",
  body: [
    "Nothing lives at this path, and nothing ever did or it would be redirected.",
    "",
    "Where to look instead:",
    "",
    "- [Home](/) — who Geir Ólafsson is, selected work, experience",
    "- [Notes](/notes) — the writing index",
    "- [llms.txt](/llms.txt) — an agent-oriented map of this site",
    "- [Sitemap](/sitemap.xml) — every URL that exists",
  ],
} as const;
