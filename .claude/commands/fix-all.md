Run Biome formatter and auto-fix across entire codebase.

# Process

1. Run `bun run format` across all workspaces to format code
2. Run `bun run lint` with auto-fix flags to resolve fixable issues
3. Show summary of changes made
4. Report any remaining issues that require manual intervention
5. Display files that were modified

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- Count of files processed and modified
- Summary of auto-fixes applied
- List of remaining manual fixes needed
- Total time taken for operation
