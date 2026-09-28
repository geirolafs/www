import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { logger } from "@/lib/logger";

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  updatedAt?: string;
  category?: string;
  tags?: string[];
  readingTime?: number; // Pre-calculated at build time
};

// Required fields for blog post validation
const REQUIRED_FIELDS: (keyof Metadata)[] = ["title", "publishedAt", "summary"];

// Top-level regex patterns for better performance
const FRONTMATTER_REGEX = /---\s*([\s\S]*?)\s*---/;
const QUOTE_REGEX = /^['"](.*)['"]$/;
const IMAGE_REGEX = /<Image\s+[^>]*src=["']([^"']+)["']/;

function validateMetadata(metadata: Partial<Metadata>): metadata is Metadata {
  return REQUIRED_FIELDS.every(
    field => metadata[field] && typeof metadata[field] === "string"
  );
}

function parseFrontmatter(fileContent: string, filePath?: string) {
  const match = FRONTMATTER_REGEX.exec(fileContent);
  const frontMatterBlock = match?.[1];
  const content = fileContent.replace(FRONTMATTER_REGEX, "").trim();

  if (!frontMatterBlock) {
    throw new Error(`No frontmatter found in ${filePath || "file"}`);
  }

  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata: Partial<Metadata> = {};

  for (const line of frontMatterLines) {
    const isValidLine = line.trim() && line.includes(": ");

    if (!isValidLine) {
      continue;
    }

    const [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(QUOTE_REGEX, "$1"); // Remove quotes

    const cleanKey = key.trim() as keyof Metadata;
    if (cleanKey) {
      if (cleanKey === "tags") {
        // Parse tags: ["tag1", "tag2"] or "tag1, tag2"
        const trimmed = value.trim();
        if (trimmed.startsWith("[")) {
          try {
            metadata.tags = JSON.parse(trimmed);
          } catch {
            metadata.tags = [];
          }
        } else {
          metadata.tags = trimmed
            .split(",")
            .map(t => t.trim())
            .filter(Boolean);
        }
      } else if (cleanKey !== "readingTime") {
        // Skip readingTime from frontmatter - it's calculated automatically
        metadata[cleanKey] = value as string;
      }
    }
  }

  // Validate required fields
  if (!validateMetadata(metadata)) {
    const missingFields = REQUIRED_FIELDS.filter(field => !metadata[field]);
    throw new Error(
      `Missing required fields in ${filePath || "file"}: ${missingFields.join(", ")}`
    );
  }

  return { metadata, content };
}

function getMDXFiles(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      return [];
    }
    return fs.readdirSync(dir).filter(file => path.extname(file) === ".mdx");
  } catch (error) {
    logger.warn("mdx posts dir read failed", {
      dir,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

function readMDXFile(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const rawContent = fs.readFileSync(filePath, "utf-8");
    return parseFrontmatter(rawContent, filePath);
  } catch (error) {
    throw new Error(
      `Failed to read MDX file ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Calculate reading time from content (moved here to use during build)
function getReadingTime(content: string): number {
  const text = content
    .replace(/<[^>]*>/g, "") // strip HTML/JSX
    .replace(/import\s+.*?from\s+['"][^'"]+['"]/g, "") // strip imports
    .replace(/```[\s\S]*?```/g, "") // strip code blocks
    .trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const WORDS_PER_MINUTE = 200;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);
  const posts: Array<{
    metadata: Metadata;
    slug: string;
    content: string;
    image: string | null;
  }> = [];

  for (const file of mdxFiles) {
    try {
      const filePath = path.join(dir, file);
      const { metadata, content } = readMDXFile(filePath);
      const slug = path.basename(file, path.extname(file));
      const imageMatch = IMAGE_REGEX.exec(content);
      const firstImage = imageMatch?.[1] ?? null;

      // Pre-calculate reading time at build time
      const readingTime = getReadingTime(content);

      posts.push({
        metadata: { ...metadata, readingTime },
        slug,
        content,
        image: firstImage,
      });
    } catch (error) {
      logger.error("mdx post parse failed", {
        file,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return posts;
}

// Per-request deduplication with React.cache
// Caches MDX parsing within a single request (deduplicates multiple calls)
// For static site generation, Next.js already caches at build time
export const getNotesPosts = cache(() =>
  getMDXData(path.join(process.cwd(), "src", "app", "(routes)", "notes", "posts"))
);

type PostWithDate = { metadata: { publishedAt: string } };
export function sortPostsByDate<T extends PostWithDate>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  );
}
