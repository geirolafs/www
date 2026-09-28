Run lint, typecheck, and build in sequence, stopping on first failure.

# Process

1. Run `bun run lint` across all packages
2. If lint fails, stop and report the error
3. Run `bun run typecheck` across all packages
4. If typecheck fails, stop and report the error
5. Run `bun run build` to verify everything builds
6. If build fails, stop and report the error
7. If all pass, report success

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- Show which step is running
- Stop immediately on first failure with clear error message
- Show total time taken for successful runs
