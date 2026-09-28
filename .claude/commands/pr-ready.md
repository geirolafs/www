Stage changes, create commit, push to remote, and create pull request.

# Process

1. Check git status for changes
2. Stage all changes with `git add -A`
3. Generate conventional commit message based on changes
4. Create commit with generated message
5. Push current branch to origin
6. Create pull request using GitHub CLI with template
7. Display PR URL for review

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- Commit SHA and message created
- Push confirmation to remote branch
- Pull request URL
- Summary of files changed and additions/deletions
