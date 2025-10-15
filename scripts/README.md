# Development Scripts

Helper scripts for Unido development and testing.

## Available Scripts

### `dev-setup.sh`

Initial development environment setup. Run this once after cloning the repo.

```bash
./scripts/dev-setup.sh
```

**What it does:**
- Installs all dependencies
- Builds all packages
- Attempts to link `create-unido` globally (optional)
- Displays helpful development commands

### `local-test.sh`

Quick testing helper for creating test applications.

```bash
# Interactive usage
./scripts/local-test.sh

# With template and name
./scripts/local-test.sh basic my-test-app
./scripts/local-test.sh weather weather-demo
```

**What it does:**
- Builds the CLI
- Creates a test app in the repo root
- Installs dependencies with workspace links
- Shows next steps and cleanup commands

**Templates:** `basic`, `weather`, `custom` (interactive prompt)

### `smoke-test.sh`

Automated smoke tests for CI/CD or pre-publish validation.

```bash
./scripts/smoke-test.sh
```

**What it does:**
- Builds all packages
- Creates test apps from both templates
- Verifies TypeScript compilation
- Tests server startup
- Cleans up test artifacts

**Use this before:**
- Creating a PR
- Publishing packages
- Major refactoring

## Usage Examples

### Initial Setup

```bash
# Clone repo
git clone <repo-url>
cd unido

# Run setup
./scripts/dev-setup.sh
```

### Daily Development

```bash
# Terminal 1: Watch builds
pnpm run dev

# Terminal 2: Create and test
./scripts/local-test.sh basic my-test
cd my-test
pnpm run dev

# Terminal 3: Testing/commands
# ... your work ...
```

### Before Committing

```bash
# Run smoke tests
./scripts/smoke-test.sh

# If passed, commit
git add .
git commit -m "feat: your feature"
```

### Testing CLI Changes

```bash
# Edit CLI
vim packages/cli/src/templates.ts

# Quick test
./scripts/local-test.sh basic test-cli-change
cd test-cli-change
pnpm run dev

# Clean up
cd .. && rm -rf test-cli-change
```

## Script Options

All scripts support common bash options:

```bash
# Verbose mode
bash -x ./scripts/dev-setup.sh

# Stop on first error
bash -e ./scripts/local-test.sh
```

## Environment Variables

Scripts respect standard environment variables:

```bash
# Use different node version
NODE_VERSION=20 ./scripts/smoke-test.sh

# Custom pnpm settings
PNPM_HOME=/custom/path ./scripts/dev-setup.sh
```

## Exit Codes

All scripts follow standard exit code conventions:

- `0` - Success
- `1` - General error
- `2` - Usage error

## Troubleshooting

### Script not executable

```bash
chmod +x ./scripts/*.sh
```

### "No such file or directory"

```bash
# Run from repo root
cd /Users/tomas.kavka/www/unido
./scripts/dev-setup.sh
```

### Build failures

```bash
# Clean and rebuild
pnpm run clean
pnpm install
./scripts/dev-setup.sh
```

## Adding New Scripts

When creating new scripts:

1. Use the same error handling pattern:
   ```bash
   #!/usr/bin/env bash
   set -e  # Exit on error
   ```

2. Add color output for better UX:
   ```bash
   GREEN='\033[0;32m'
   RED='\033[0;31m'
   NC='\033[0m'
   ```

3. Make executable:
   ```bash
   chmod +x scripts/new-script.sh
   ```

4. Document in this README

5. Test with both bash and zsh:
   ```bash
   bash scripts/new-script.sh
   zsh scripts/new-script.sh
   ```

## See Also

- [QUICKSTART.md](../QUICKSTART.md) - Quick reference guide
- [DEVELOPMENT.md](../DEVELOPMENT.md) - Detailed development guide
- [CLAUDE.md](../CLAUDE.md) - Project architecture and conventions
