# Contributing to Unido

Thank you for your interest in contributing to Unido! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Documentation](#documentation)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/bandofai/unido.git
cd unido

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test
```

For detailed setup instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Follow the [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed

### 3. Run Quality Checks

Before committing, ensure all checks pass:

```bash
# Lint and format
pnpm run lint
pnpm run format

# Type check
pnpm run type-check

# Run tests
pnpm run test

# Build
pnpm run build
```

### 4. Commit Your Changes

We use conventional commits:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in component"
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Pull Request Process

### Before Submitting

- ✅ All CI checks pass locally
- ✅ Tests are written and passing
- ✅ Code is linted and formatted
- ✅ Documentation is updated
- ✅ Commit messages follow conventional commits

### PR Description

Include in your PR description:

1. **What:** Brief description of changes
2. **Why:** Motivation for the changes
3. **How:** Implementation approach
4. **Testing:** How you tested the changes
5. **Screenshots:** If applicable (UI changes)

### Review Process

1. Automated CI checks run on your PR
2. Maintainers review your code
3. Address any feedback
4. Once approved and CI passes, your PR will be merged

### After Merge

Your changes will be included in the next release. Thank you for contributing!

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Avoid `any` types (use `unknown` instead)
- Use explicit return types for functions

### Code Style

We use Biome for linting and formatting:

```bash
# Check code style
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format
```

**Configuration:** [biome.json](biome.json)

### Naming Conventions

- **Files:** camelCase for source files, kebab-case for config files
- **Types/Interfaces:** PascalCase
- **Functions/Variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE (for truly constant values)

### Import Organization

- Use path aliases (e.g., `@bandofai/unido-core`)
- Organize imports: external packages, internal packages, types
- Always use `.js` extensions in imports (even for `.ts` files)

### Comments

- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up-to-date

## Testing

### Writing Tests

- Place tests next to source files (`*.test.ts`)
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Mock external dependencies

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

### Test Coverage

- Aim for >80% coverage for new code
- All new features should have tests
- Bug fixes should include regression tests

## CI/CD

Our CI/CD pipeline runs automatically on all PRs and commits to `main`.

### CI Checks

All PRs must pass:

1. **Lint** - Biome linting
2. **Format Check** - Code formatting
3. **Type Check** - TypeScript compilation
4. **Tests** - Unit tests
5. **Build** - Package builds

### Running CI Checks Locally

```bash
# Run all checks (same as CI)
pnpm run lint && \
pnpm run format:check && \
pnpm run type-check && \
pnpm run test && \
pnpm run build
```

### CI Documentation

For detailed CI/CD information, see [docs/contributing/CI_CD.md](docs/contributing/CI_CD.md).

## Documentation

### When to Update Docs

- Adding new features
- Changing APIs
- Fixing bugs that affect usage
- Improving examples

### Documentation Locations

- **README.md** - Project overview and quick start
- **DEVELOPMENT.md** - Development guide
- **CLAUDE.md** - AI assistant context
- **docs/** - Detailed documentation
- **examples/** - Working examples

### Writing Good Documentation

- Use clear, concise language
- Include code examples
- Add TypeScript types
- Test all examples
- Update relevant docs together

## Project Structure

```
unido/
├── .github/          # GitHub Actions workflows
├── docs/             # Documentation
├── examples/         # Example applications
├── packages/         # Monorepo packages
│   ├── core/         # Core framework
│   ├── components/   # UI components
│   ├── providers/    # Provider adapters
│   ├── cli/          # CLI tool
│   └── dev/          # Dev utilities
├── scripts/          # Build and utility scripts
└── *.md              # Root documentation
```

## Getting Help

- **Documentation:** Check [docs/](docs/) directory
- **Issues:** Search existing [GitHub Issues](https://github.com/bandofai/unido/issues)
- **Discussions:** Use [GitHub Discussions](https://github.com/bandofai/unido/discussions)
- **Questions:** Open a new issue with the `question` label

## Common Tasks

### Adding a New Package

1. Create package directory in `packages/`
2. Add `package.json` with `workspace:*` dependencies
3. Update `pnpm-workspace.yaml` if needed
4. Add to `turbo.json` if needed
5. Document in README

### Adding a New Provider

See [Architecture Patterns](docs/contributing/architecture.md) for provider implementation guide.

### Releasing

Releases are managed by maintainers. See [RELEASING.md](docs/contributing/RELEASING.md) for the release process.

## Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes (when applicable)
- Project documentation (for significant contributions)

Thank you for contributing to Unido! 🎉
