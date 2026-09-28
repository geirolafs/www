Clean all caches, reinstall dependencies, and rebuild everything from scratch.

# Process

1. Remove node_modules directories from all workspaces
2. Remove .next build directories
3. Clear Bun cache with `bun pm cache rm`
4. Clear Turbo cache
5. Reinstall all dependencies with `bun install`
6. Run full build with `bun run build`
7. Report completion status

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- Show progress of each cleanup step
- Display disk space freed during cleanup
- Confirm successful rebuild
