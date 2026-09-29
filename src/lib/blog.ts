import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  updatedAt?: string;
  tags?: string[];
  readingTime: number;
};

const POSTS_DIR = path.join(process.cwd(), "src", "app", "(routes)", "notes", "posts");
const REQUIRED_FIELDS = ["title", "publishedAt", "summary"] as const;
const FRONTMATTER_REGEX = /---\s*([\s\S]*?)\s*---/;
const QUOTE_REGEX = /^['"](.*)['"]$/;
const WORDS_PER_MINUTE = 200;

/**
 * A deliberately small frontmatter reader: one `key: value` per line, quotes
 * optional, `tags` as a comma list. A post that breaks it fails the build
 * rather than quietly disappearing from the site.
 */
function parseFrontmatter(fileContent: string, file: string) {
  const block = FRONTMATTER_REGEX.exec(fileContent)?.[1];
  if (!block) {
    throw new Error(`No frontmatter in ${file}`);
  }

  const fields: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const separator = line.indexOf(": ");
    if (separator > 0) {
      const value = line.slice(separator + 2).trim();
      fields[line.slice(0, separator).trim()] = value.replace(QUOTE_REGEX, "$1");
    }
  }

  const missing = REQUIRED_FIELDS.filter(field => !fields[field]);
  if (missing.length > 0) {
    throw new Error(`Missing ${missing.join(", ")} in ${file}`);
  }

  return {
    fields,
    content: fileContent.replace(FRONTMATTER_REGEX, "").trim(),
  };
}

function getReadingTime(content: string): number {
  const words = content
    .replace(/<[^>]*>/g, "") // JSX
    .replace(/import\s+.*?from\s+['"][^'"]+['"]/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** Every note, newest first. Cached per request; static pages read it at build. */
export const getNotesPosts = cache(() => {
  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter(file => path.extname(file) === ".mdx")
    .map(file => {
      const { fields, content } = parseFrontmatter(
        fs.readFileSync(path.join(POSTS_DIR, file), "utf-8"),
        file
      );
      const metadata: Metadata = {
        title: fields.title,
        publishedAt: fields.publishedAt,
        summary: fields.summary,
        updatedAt: fields.updatedAt,
        tags: fields.tags
          ?.split(",")
          .map(tag => tag.trim())
          .filter(Boolean),
        readingTime: getReadingTime(content),
      };
      return { metadata, content, slug: path.basename(file, ".mdx") };
    });

  return posts.sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  );
});
