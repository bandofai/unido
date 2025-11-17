<div align="center">

<img src="docs/logo.png" alt="Unido Logo" width="150" />

# Local Development Guide

</div>

This guide explains how to develop and test `create-unido` and all other packages locally.

## Quick Start

```bash
# Install dependencies and build all packages
pnpm install
pnpm run build

# Start development mode with hot reload for all packages
pnpm run dev
```

## Testing create-unido CLI Locally

### Method 1: Using pnpm link (Recommended)

This creates a global link to your local CLI that updates automatically as you develop:

```bash
# 1. Build the CLI (or run dev mode)
cd packages/cli
pnpm run build  # or pnpm run dev for watch mode

# 2. Create global link
pnpm link --global

# 3. Use it anywhere
cd /tmp
create-unido my-test-app

# 4. Unlink when done
pnpm unlink --global create-unido
```

### Method 2: Direct Execution with Node

Test without installing globally:

```bash
# From repo root
node packages/cli/dist/index.js my-test-app --template basic --skip-git

# Or from anywhere with absolute path
node /Users/tomas.kavka/www/unido/packages/cli/dist/index.js my-test-app
```

### Method 3: Using npm/pnpm exec

Execute from the built dist:

```bash
cd packages/cli
pnpm exec ./dist/index.js my-test-app --template weather
```

## Testing Generated Apps with Local Packages

When you create a test app with `create-unido`, you'll want to test it against your local package changes:

### Option A: Use workspace protocol (built into templates)

The CLI templates already use `workspace:*` dependencies when scaffolded inside the monorepo:

```bash
# Create test app in repo root
node packages/cli/dist/index.js test-my-app --template basic --skip-git
cd test-my-app

# Install with workspace links
pnpm install

# Any changes to packages/core or packages/providers will be reflected immediately
pnpm run dev
```

### Option B: Manual linking for external test apps

If you create a test app outside the monorepo:

```bash
# In your test app directory
cd /tmp/my-test-app

# Link to local packages
pnpm link ../../unido/packages/core
pnpm link ../../unido/packages/providers/openai
pnpm link ../../unido/packages/providers/base
pnpm link ../../unido/packages/components

# Install remaining dependencies
pnpm install --ignore-workspace
```

### Option C: Test playgrounds (as documented in CLAUDE.md)

Use the pre-configured test apps:

```bash
# Generate fresh test apps
rm -rf test-basic-app test-weather-app
node packages/cli/dist/index.js test-basic-app --template basic --skip-git
node packages/cli/dist/index.js test-weather-app --template weather --skip-git

# Inside each app
cd test-basic-app
pnpm install --ignore-workspace
pnpm run dev
```

## Development Workflow

### Watch Mode for All Packages

Run this in the root to rebuild all packages on changes:

```bash
pnpm run dev
```

This runs TypeScript in watch mode for all packages in parallel via Turborepo.

### Individual Package Development

Work on specific packages:

```bash
# Core framework
cd packages/core
pnpm run dev

# OpenAI provider
cd packages/providers/openai
pnpm run dev

# CLI tool
cd packages/cli
pnpm run dev
```

### Testing CLI Changes End-to-End

Complete workflow for testing CLI modifications:

```bash
# Terminal 1: Watch CLI for changes
cd packages/cli
pnpm run dev

# Terminal 2: Watch core packages
cd packages/core
pnpm run dev

# Terminal 3: Test CLI
cd /tmp
create-unido my-test-$(date +%s) --template basic

# Or use direct node execution for faster iteration
node /Users/tomas.kavka/www/unido/packages/cli/dist/index.js test-app-$(date +%s)
```

## Useful Development Scripts

Add these to your shell profile for convenience:

```bash
# Quick test CLI locally
alias test-unido='node /Users/tomas.kavka/www/unido/packages/cli/dist/index.js'

# Create throwaway test app
alias test-unido-tmp='cd /tmp && node /Users/tomas.kavka/www/unido/packages/cli/dist/index.js test-$(date +%s)'

# Clean and rebuild everything
alias unido-rebuild='cd /Users/tomas.kavka/www/unido && pnpm run clean && pnpm install && pnpm run build'
```

## Testing with MCP Inspector

Once you have a test app running, use the MCP Inspector to verify tools and resources:

```bash
# In your test app directory
pnpm run dev  # Start the server on http://localhost:3000

# In another terminal, install inspector (once per app)
pnpm add -D @modelcontextprotocol/inspector

# Run inspector
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method tools/list
node node_modules/@modelcontextprotocol/inspector/bin/cli.js http://localhost:3000/sse --transport sse --method resources/list
```

## Smoke Testing with MCP SDK

For automated verification:

```bash
# Start your test app
cd test-basic-app
pnpm run dev &
SERVER_PID=$!

# Run smoke test
node --import tsx <<'NODE'
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const client = new Client({ name: 'smoke-test', version: '0.0.0' });
const transport = new SSEClientTransport(new URL('http://localhost:3000/sse'));
await client.connect(transport);

console.log('Tools:', await client.listTools());
console.log('Resources:', await client.listResources());

await transport.close();
NODE

# Clean up
kill $SERVER_PID
```

## Package Linking Reference

| Package | Import Path | Local Path |
|---------|------------|------------|
| Core | `@bandofai/unido-core` | `packages/core` |
| Provider Base | `@bandofai/unido-provider-base` | `packages/providers/base` |
| OpenAI Provider | `@bandofai/unido-provider-openai` | `packages/providers/openai` |
| Components | `@bandofai/unido-components` | `packages/components` |
| CLI | `create-unido` | `packages/cli` |

## Troubleshooting

### CLI not updating after changes

```bash
# Rebuild CLI
cd packages/cli
pnpm run build

# Or ensure dev mode is running
pnpm run dev
```

### "Module not found" in test app

```bash
# Ensure all dependencies are built
cd /Users/tomas.kavka/www/unido
pnpm run build

# Re-link if using pnpm link
cd packages/core && pnpm link --global
cd ../providers/openai && pnpm link --global
```

### TypeScript errors in generated app

```bash
# Check that templates are up to date
git status packages/cli/src/templates/

# Rebuild and test
pnpm run build
node packages/cli/dist/index.js test-fresh --template basic
cd test-fresh && pnpm install && pnpm run type-check
```

### Changes not reflected in running app

```bash
# Kill and restart dev server
pkill -f "node.*unido"

# Ensure packages are built
cd /Users/tomas.kavka/www/unido
pnpm run build

# Restart your app
cd test-app && pnpm run dev
```

## Recommended Development Setup

**3-Terminal Setup:**

1. **Terminal 1 - Build Watch**: `cd /Users/tomas.kavka/www/unido && pnpm run dev`
2. **Terminal 2 - Test App Server**: `cd test-basic-app && pnpm run dev`
3. **Terminal 3 - Testing/CLI**: For running commands, inspector, etc.

This setup ensures:
- All packages rebuild automatically on changes
- Test app server stays running
- You have a free terminal for experiments

## Version Management

When bumping versions for release:

```bash
# Update package versions
cd packages/cli
npm version patch  # or minor/major

# Update version in CLI code to match
# Edit packages/cli/src/index.ts line 19

# Rebuild
pnpm run build

# Test before publishing
create-unido test-release --template basic
```

## Publishing Workflow

```bash
# 1. Ensure everything builds
pnpm run build
pnpm run type-check
pnpm run lint

# 2. Test CLI locally
node packages/cli/dist/index.js test-final --template weather
cd test-final && pnpm install && pnpm run dev

# 3. Publish (from individual package directories)
cd packages/core && npm publish
cd packages/providers/base && npm publish
cd packages/providers/openai && npm publish
cd packages/components && npm publish
cd packages/cli && npm publish
```
