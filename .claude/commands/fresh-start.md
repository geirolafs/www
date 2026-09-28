Clean all caches, reinstall dependencies, and rebuild everything from scratch.

# Process

1. Remove `node_modules` and `.next`
2. Clear Bun cache with `bun pm cache rm`
3. Reinstall all dependencies with `bun install`
4. Run full build with `bun run build`
5. Report completion status

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- Show progress of each cleanup step
- Display disk space freed during cleanup
- Confirm successful rebuild
