import { formatNextMonth } from "@/lib/availability";
import { getNotesPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/config/site";
import { agent404Content, llmsContent } from "@/lib/content/agents";
import {
  availabilityContent,
  awardsContent,
  contactFooterContent,
  type Description,
  type Entry,
  experienceContent,
  heroContent,
  howIWorkContent,
  introductionContent,
  selectedWorkContent,
} from "@/lib/content/home";
import type { TrustPageContent } from "@/lib/content/trust";

/**
 * Markdown renditions of the site, served to agents via `Accept:
 * text/markdown` content negotiation (see `src/proxy.ts` and
 * `src/app/md/[[...path]]/route.ts`) and assembled from the same content
 * modules the pages render — there is no second copy of anything here, so the
 * markdown can't drift from the HTML.
 */

const MDX_IMPORT_REGEX = /^import\s+.*$/gm;

function descriptionToMarkdown(description: Description): string {
  if (typeof description === "string") {
    return description;
  }
  return description
    .map(segment =>
      segment.kind === "link" ? `[${segment.label}](${segment.href})` : segment.value
    )
    .join("");
}

function entryToMarkdown(entry: Entry): string {
  const title = entry.subtitle ? `${entry.title} — ${entry.subtitle}` : entry.title;
  const description = entry.description
    ? ` ${descriptionToMarkdown(entry.description)}`
    : "";
  return `- **${entry.year.accessible}** · ${title}.${description}`;
}

export function homeMarkdown(): string {
  const posts = getNotesPosts();
  const contactLinks = contactFooterContent.links
    .filter(link => !link.hidden)
    .map(link => `- [${link.label}](${link.href})`);

  return [
    `# ${heroContent.name}`,
    "",
    `**${heroContent.role}** — Reykjavík, Iceland.`,
    "",
    ...introductionContent.paragraphs.flatMap(paragraph => [paragraph, ""]),
    `## ${selectedWorkContent.label}`,
    "",
    ...selectedWorkContent.entries.map(entryToMarkdown),
    "",
    `## ${howIWorkContent.label}`,
    "",
    ...howIWorkContent.paragraphs.flatMap(paragraph => [paragraph, ""]),
    `## ${experienceContent.label}`,
    "",
    ...experienceContent.entries.map(entryToMarkdown),
    "",
    `## ${awardsContent.label}`,
    "",
    ...awardsContent.entries.map(entryToMarkdown),
    "",
    "## Contact",
    "",
    ...contactLinks,
    "",
    `Recent writing is at [/notes](/notes)${posts.length > 0 ? ` — latest: [${posts[0].metadata.title}](/notes/${posts[0].slug})` : ""}. An agent-oriented map of this site is at [/llms.txt](/llms.txt).`,
    "",
  ].join("\n");
}

type Post = ReturnType<typeof getNotesPosts>[number];

function postListLine(post: Post): string {
  return `- [${post.metadata.title}](/notes/${post.slug}) — ${post.metadata.publishedAt}. ${post.metadata.summary}`;
}

export function notesIndexMarkdown(): string {
  const posts = getNotesPosts();
  return [
    "# Notes",
    "",
    `Writing by ${siteConfig.name} on design, typography and frontend engineering.`,
    "",
    ...posts.map(postListLine),
    "",
  ].join("\n");
}

export function notePostMarkdown(slug: string): string | null {
  const post = getNotesPosts().find(candidate => candidate.slug === slug);
  if (!post) {
    return null;
  }
  // The MDX source is markdown plus the occasional import line; strip those
  // and serve the rest as-is. Embedded JSX components stay — they read as
  // labelled tags, which is more honest than silently dropping their content.
  const body = post.content.replace(MDX_IMPORT_REGEX, "").trim();
  return [
    `# ${post.metadata.title}`,
    "",
    `Published ${post.metadata.publishedAt}${post.metadata.updatedAt ? `, updated ${post.metadata.updatedAt}` : ""} by ${siteConfig.name}. Canonical: ${siteConfig.url}/notes/${slug}`,
    "",
    body,
    "",
  ].join("\n");
}

export function tagIndexMarkdown(tag: string): string | null {
  const normalized = tag.toLowerCase();
  const posts = getNotesPosts().filter(post =>
    (post.metadata.tags ?? []).some(candidate => candidate.toLowerCase() === normalized)
  );
  if (posts.length === 0) {
    return null;
  }
  return [
    `# Notes tagged “${normalized}”`,
    "",
    ...posts.map(postListLine),
    "",
    "All writing: [/notes](/notes)",
    "",
  ].join("\n");
}

export function trustPageMarkdown(content: TrustPageContent): string {
  const links = content.links
    ? ["", ...content.links.map(link => `- [${link.label}](${link.href})`)]
    : [];
  // Computed at request time — the /md route is dynamic — with the same
  // helper the homepage's rolling availability line uses, so the two can
  // never name different months.
  const availability = content.showAvailability
    ? ["", `${availabilityContent.lead} ${formatNextMonth(new Date())}.`]
    : [];
  return [
    `# ${content.title}`,
    "",
    ...content.paragraphs.flatMap(paragraph => [paragraph, ""]),
    ...links,
    ...availability,
    "",
  ].join("\n");
}

export function llmsTxtMarkdown(): string {
  const posts = getNotesPosts();
  return [
    llmsContent.heading,
    "",
    llmsContent.summary,
    "",
    llmsContent.whenToUse.heading,
    "",
    ...llmsContent.whenToUse.body,
    "",
    llmsContent.howToRead.heading,
    "",
    ...llmsContent.howToRead.body,
    "",
    llmsContent.pagesHeading,
    "",
    ...llmsContent.pages.map(
      page => `- [${page.label}](${siteConfig.url}${page.path}): ${page.note}`
    ),
    "",
    llmsContent.notesHeading,
    "",
    ...posts.map(
      post =>
        `- [${post.metadata.title}](${siteConfig.url}/notes/${post.slug}): ${post.metadata.summary}`
    ),
    "",
  ].join("\n");
}

export function notFoundMarkdown(pathname: string): string {
  return [
    agent404Content.heading,
    "",
    `Requested path: \`${pathname}\``,
    "",
    ...agent404Content.body,
    "",
  ].join("\n");
}
