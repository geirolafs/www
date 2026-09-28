Audit dependencies for security vulnerabilities and available updates.

# Process

1. Run `bun audit` to check for security vulnerabilities
2. Run `bun outdated` to list packages with newer versions
3. Identify packages with major version updates available
4. Report summary of findings and recommendations

# Output

- Plain text only (no TUI elements, markdown, or formatting)
- Security vulnerability count and severity levels
- List of outdated packages with current vs latest versions
- Recommendations for updates and fixes
