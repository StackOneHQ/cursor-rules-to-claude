# cursor-rules-to-claude

Convert Cursor IDE rules (.mdc files) to Claude.md format for AI code assistance.

## Why is this useful?

Many dev teams use Cursor IDE and build up a large collection of Cursor rules about their codebase. However, Claude Code uses CLAUDE.md files not Cursor rules natively.

The killer usecase of this package is to enable using Cursor rules with Claude Code directly inside GitHub. This allows for next level vibe coding with adequate context.

## Installation

```bash
npm install -g cursor-rules-to-claude
```

Or use directly with npx:

```bash
npx cursor-rules-to-claude
```

## Usage

### Basic Usage

```bash
npx cursor-rules-to-claude
```

This will:

- Look for `.mdc` files in `.cursor/rules/` directory
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

- **alwaysApply: true**: Rule content is copied directly to CLAUDE.md
- **alwaysApply: false**: Rule is listed as available for the `fetch_rules` tool

## GitHub Action

Use as a GitHub Action to automatically update CLAUDE.md:

```yaml
name: Update Claude Rules
on: [push]
jobs:
  update-claude:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ./
        with:
          rules-dir: ".cursor/rules"
          output: "CLAUDE.md"
          overwrite: "false"
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
node dist/index.js --help
```

## License

MIT
