# cursor-rules-to-claude

> Let Claude Code use your Cursor rules.

Convert Cursor IDE rules (.md/.mdc files) to CLAUDE.md format. Perfect for using in GitHub Actions before running Claude Code.

## Why is this useful?

Many dev teams use Cursor IDE and build up a large collection of Cursor rules about their codebase. However, Claude Code uses CLAUDE.md files not Cursor rules natively.

The killer use is Cursor rules with Claude Code directly inside GitHub. If you haven't tried it yet, you're missing out. See the docs [here](https://docs.anthropic.com/en/docs/claude-code/github-actions)

## Installation

```bash
npm install -g cursor-rules-to-claude
```

Or use directly with npx:

```bash
npx cursor-rules-to-claude
```

This will:

- Look for `.md` and `.mdc` files in `.cursor/rules/` directory
- Generate/update `CLAUDE.md` file
- Append rules to existing CLAUDE.md (won't overwrite)

### Options

```bash
npx cursor-rules-to-claude [options]

Options:
  --overwrite        Overwrite CLAUDE.md instead of appending (default: false)
  --rules-dir <dir>  Cursor rules directory (default: ".cursor/rules")
  --output <file>    Output file (default: "CLAUDE.md")
  --help             Display help
  --version          Display version
```

### Examples

```bash
# Use custom rules directory
npx cursor-rules-to-claude --rules-dir ./my-rules

# Overwrite existing CLAUDE.md
npx cursor-rules-to-claude --overwrite

# Custom output file
npx cursor-rules-to-claude --output MY_CLAUDE.md
```

## Cursor Rule Format

Cursor rules should have YAML frontmatter:

```yaml
---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: true
---
# Your rule content here

Rule description and guidelines...
```

### Rule Processing

The tool organizes rules into three categories:

- **alwaysApply: true**: Rule content is fully included in CLAUDE.md under "Auto attached rules"
- **alwaysApply: false** (with description): Rule is listed as a conditional rule with a link to the full content
- **No frontmatter**: Rule content is included by default for compatibility

## Output Format

The generated CLAUDE.md file includes:

- HTML comments marking the generated sections
- Auto attached rules (fully included content)
- Conditional rules (descriptions with links to full rules)
- Rules without frontmatter (included by default)

## GitHub Action

Use as a GitHub Action to automatically update CLAUDE.md:

```yaml
name: Update Claude Rules
on: [push]
jobs:
  update-claude:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Cursor Rules to CLAUDE.md
        uses: StackOneHQ/cursor-rules-to-claude@latest

      - name: Run Claude Code
        id: claude
        uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Development

```bash
# Install dependencies
bun install

# Run in development
bun run dev

# Build
bun run build

# Test
bun test
```

## License

MIT
