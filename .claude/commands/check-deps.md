Audit dependencies for security vulnerabilities and available updates.

# Process

1. Run `bun audit` to check for security vulnerabilities
2. Check for outdated packages across all workspaces
3. Identify packages with major version updates available
4. Check for duplicate dependencies in the monorepo
5. Validate package.json consistency across workspaces
6. Report summary of findings and recommendations

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- Security vulnerability count and severity levels
- List of outdated packages with current vs latest versions
- Duplicate dependency warnings
- Recommendations for updates and fixes
