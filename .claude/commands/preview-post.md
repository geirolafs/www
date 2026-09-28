Generate preview information for a blog post including metadata and content summary.

# Input

- Post slug (required)

# Process

1. Find the .mdx file in src/app/(routes)/notes/posts/ matching the slug
2. Parse frontmatter to extract metadata
3. Generate word count and reading time estimate
4. Show first paragraph or summary as preview
5. Check if post is published or draft status
6. Display SEO-relevant information

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- Post metadata (title, date, summary)
- Word count and estimated reading time
- Publication status
- File path and last modified date
