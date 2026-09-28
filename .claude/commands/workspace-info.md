Display comprehensive information about all workspaces in the monorepo.

# Process

1. Parse package.json to identify all workspaces
2. For each workspace, show package name, version, and location
3. Display workspace dependencies and their relationships
4. Check build status and last build time for each workspace
5. Show disk usage for each workspace's build artifacts
6. Identify any workspace dependency conflicts or issues

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- List of all workspaces with name, version, location
- Dependency tree showing relationships between workspaces
- Build status and artifact sizes
- Any detected issues or conflicts
