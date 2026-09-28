Automatically stage all changes and create a commit with a descriptive message.

# Process

1. Check git status for any changes
2. If no changes exist, return "Working directory is clean - nothing to commit"
3. If unstaged changes exist, automatically stage them with `git add -A`
4. Analyze the staged changes using `git diff --staged`
5. Generate a conventional commit message following the project's style
6. Create the commit with the generated message
7. Show the final commit and its SHA

# Commit Message Format

Follow conventional commits with project-specific formatting:

- Use descriptive prefixes: feat, fix, docs, refactor, style, test, chore
- Include detailed bullet points for complex changes
- Always end with the Claude Code attribution block
- Focus on the "why" rather than just the "what"

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- The commit SHA and message
- Brief summary of what was committed
