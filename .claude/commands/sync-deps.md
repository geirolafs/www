Update shared dependencies across workspaces to maintain consistency.

# Process

1. Analyze package.json files across all workspaces
2. Identify shared dependencies with version mismatches
3. Determine the appropriate version to standardize on (latest stable)
4. Update package.json files to use consistent versions
5. Run `bun install` to update lock files
6. Verify all workspaces still build successfully after sync

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- List of dependencies that were synchronized
- Version changes made (from -> to)
- Build verification results for each workspace
- Any conflicts or issues that require manual resolution
