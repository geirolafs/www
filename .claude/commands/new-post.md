Create a new MDX blog post with proper frontmatter template.

# Input

- Post title (required)
- Optional: slug (auto-generated from title if not provided)
- Optional: summary/description

# Process

1. Generate slug from title if not provided (lowercase, hyphenated)
2. Create new .mdx file in src/app/(routes)/notes/posts/ directory
3. Add frontmatter with title, publishedAt (today), and summary
4. Include basic MDX template with example content
5. Open the new file for editing

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- File path of created post
- Confirmation of successful creation
