<div align="center">

<img src="docs/logo.png" alt="Unido Logo" width="150" />

# Unido Development Quick Start

</div>

## Initial Setup (Once)

```bash
# Clone and setup
git clone <repo-url>
cd unido
./scripts/dev-setup.sh
```

This will:
- Install all dependencies
- Build all packages
- Link `create-unido` globally

## Daily Development Workflow

### 1. Start Watch Mode

Open a terminal and keep this running:

```bash
pnpm run dev
```

This rebuilds all packages automatically when you make changes.

### 2. Test Your Changes

#### Quick Test (Recommended)

```bash
# Use the helper script
./scripts/local-test.sh basic my-test

# Or manually
pnpm run test:basic
cd test-basic-app
pnpm run dev
```

#### Test Globally Linked CLI

```bash
# Create anywhere
cd /tmp
create-unido my-app --template weather
cd my-app
pnpm install
pnpm run dev
```

#### Test CLI Directly (No Install)

```bash
# From repo root
node packages/cli/dist/index.js my-app --template basic
```

### 3. Verify with MCP Inspector

```bash
# In test app directory, while server is running
pnpm add -D @modelcontextprotocol/inspector
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method tools/list
```

## Common Tasks

### Edit CLI Templates

```bash
# Edit templates
vim packages/cli/src/templates.ts

# Rebuild CLI
cd packages/cli && pnpm run build

# Test immediately
node dist/index.js test-app --template basic
```

### Edit Core Package

```bash
# Edit core
vim packages/core/src/app.ts

# Watch mode rebuilds automatically if running
# Or rebuild manually
cd packages/core && pnpm run build

# Test in existing test app (uses workspace links)
cd test-basic-app
pnpm run dev  # Changes reflected immediately
```

### Edit OpenAI Provider

```bash
# Edit provider
vim packages/providers/openai/src/adapter.ts

# Watch mode rebuilds automatically
# Test changes
cd test-basic-app && pnpm run dev
```

### Run Tests Before Commit

```bash
# Quick smoke test
./scripts/smoke-test.sh

# Full test suite
pnpm run test
pnpm run type-check
pnpm run lint
```

## Package Structure Quick Reference

```
packages/
├── cli/                    → create-unido CLI
│   └── src/templates.ts   → Template definitions
├── core/                   → @bandofai/unido-core
│   ├── src/app.ts         → Main app API
│   ├── src/types.ts       → Core types
│   └── src/tool.ts        → Tool registration
├── providers/
│   ├── base/              → @bandofai/unido-provider-base
│   └── openai/            → @bandofai/unido-provider-openai
│       └── src/adapter.ts → OpenAI MCP adapter
└── components/            → @bandofai/unido-components
    └── src/               → React components
```

## Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Unido development shortcuts
alias unido-dev='cd ~/www/unido && pnpm run dev'
alias unido-test='cd ~/www/unido && ./scripts/local-test.sh'
alias unido-cli='node ~/www/unido/packages/cli/dist/index.js'
```

## Troubleshooting

### "Module not found" errors

```bash
# Rebuild everything
pnpm run build

# Or just the affected package
cd packages/core && pnpm run build
```

### Changes not reflected in test app

```bash
# Ensure watch mode is running
pnpm run dev

# Kill and restart test app
pkill -f "node.*unido"
cd test-basic-app && pnpm run dev
```

### CLI not updating

```bash
# Rebuild CLI
cd packages/cli && pnpm run build

# Re-link globally
pnpm link --global

# Or use direct execution
node packages/cli/dist/index.js test-app
```

### TypeScript errors

```bash
# Check types across all packages
pnpm run type-check

# Check specific package
cd packages/core && pnpm run type-check
```

## 3-Terminal Recommended Setup

**Terminal 1** - Build Watch:
```bash
cd ~/www/unido
pnpm run dev
```

**Terminal 2** - Test Server:
```bash
cd ~/www/unido/test-basic-app
pnpm run dev
```

**Terminal 3** - Commands:
```bash
# Free for git, testing, etc.
```

## Before Publishing

```bash
# Full validation
pnpm run build
pnpm run type-check
pnpm run lint
./scripts/smoke-test.sh

# Version bump (in each package)
cd packages/cli
npm version patch

# Update CLI version in code
# Edit packages/cli/src/index.ts line 19

# Publish each package
npm publish
```

## Resources

- [DEVELOPMENT.md](DEVELOPMENT.md) - Detailed development guide
- [CLAUDE.md](CLAUDE.md) - Project architecture and conventions
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Current status and TODOs

## Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `pnpm run dev` | Watch all packages for changes |
| `pnpm run build` | Build all packages once |
| `pnpm run test:basic` | Create test-basic-app |
| `pnpm run test:weather` | Create test-weather-app |
| `./scripts/local-test.sh` | Interactive test app creator |
| `./scripts/smoke-test.sh` | Run all smoke tests |
| `pnpm run cli:link` | Link create-unido globally |
| `pnpm run cli:test` | Run CLI directly |
| `pnpm run type-check` | Type check all packages |
| `pnpm run lint` | Lint all packages |

---

**Happy coding!** 🚀
