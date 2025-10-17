# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for the Unido monorepo.

## Overview

The Unido project uses GitHub Actions for automated quality checks, testing, and build validation. All workflows are defined in the [`.github/workflows/`](../../.github/workflows/) directory.

## Workflows

### 1. Main CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Manual dispatch

**Jobs:**

#### Lint
- Runs Biome linter on all code
- Command: `pnpm run lint`
- Validates code style and detects potential issues
- **Timeout:** 10 minutes

#### Format Check
- Checks code formatting with Biome
- Command: `pnpm run format:check`
- Ensures consistent code formatting
- **Timeout:** 10 minutes

#### Type Check
- Validates TypeScript types across all packages
- Command: `pnpm run type-check`
- Uses `tsc --noEmit` for type validation
- **Timeout:** 10 minutes

#### Test
- Runs unit tests with Vitest
- Command: `pnpm run test`
- Validates package functionality
- **Timeout:** 10 minutes

#### Build
- Builds all packages in the monorepo
- Command: `pnpm run build`
- Validates that all packages compile successfully
- Uploads build artifacts (retention: 7 days)
- **Timeout:** 10 minutes

#### All Checks Passed
- Summary job that verifies all checks succeeded
- Fails if any previous job failed
- Useful for required status checks

**Concurrency:**
- Cancels in-progress runs for the same branch/PR
- Prevents redundant CI runs

**Performance Optimizations:**
- Uses pnpm caching for faster installs
- Parallel job execution (where possible)
- 10-minute timeout per job

### 2. Security Audit Workflow (`security.yml`)

**Triggers:**
- Weekly schedule (Monday at 00:00 UTC)
- Manual dispatch
- Pushes to `main` that modify dependencies

**Jobs:**

#### Dependency Audit
- Runs `pnpm audit` to check for vulnerabilities
- Audit level: `moderate` and above
- Continues on error (informational only)

#### License Check
- Lists all package licenses
- Helps identify licensing issues
- Generates `licenses.json` report

**Note:** Security checks are informational and don't block CI.

### 3. Dependabot (`dependabot.yml`)

**Purpose:** Automated dependency updates

**Configuration:**
- Weekly updates (Monday)
- Groups dependencies by type:
  - Development dependencies (minor + patch)
  - Production dependencies (minor + patch)
- Open PR limit: 10
- Labels: `dependencies`, `automated`
- Commit prefix: `chore` (npm), `ci` (GitHub Actions)

**Update Targets:**
- npm dependencies
- GitHub Actions

## Running Checks Locally

Before pushing code, run these checks locally:

```bash
# Lint code
pnpm run lint

# Check formatting
pnpm run format:check

# Fix linting and formatting issues
pnpm run lint:fix
pnpm run format

# Type check
pnpm run type-check

# Run tests
pnpm run test

# Build packages
pnpm run build

# Run all checks (recommended before commit)
pnpm run lint && pnpm run format:check && pnpm run type-check && pnpm run test && pnpm run build
```

## CI Configuration

### Node.js Version
- **Version:** 20 (LTS)
- All workflows use Node.js 20 for consistency

### Package Manager
- **pnpm:** Version 10
- Uses `pnpm/action-setup@v4`
- Frozen lockfile (`--frozen-lockfile`) ensures reproducibility

### Caching
- pnpm store is cached using `actions/setup-node@v4` with `cache: 'pnpm'`
- Significantly speeds up dependency installation

### Turbo Cache
- Turborepo build cache is local-only (not uploaded to remote)
- Future: Could add remote caching for faster builds

## PR Requirements

For a pull request to be merged, all CI checks must pass:

✅ **Required Checks:**
1. Lint (Biome)
2. Format Check (Biome)
3. Type Check (TypeScript)
4. Unit Tests (Vitest)
5. Build (Turborepo)

❌ **Blocking Failures:**
- Any linting errors
- Formatting violations
- TypeScript errors
- Test failures
- Build failures

## Status Badges

The main README includes a CI status badge:

[![CI](https://github.com/bandofai/unido/workflows/CI/badge.svg)](https://github.com/bandofai/unido/actions/workflows/ci.yml)

This badge shows the current status of the `main` branch.

## Troubleshooting

### Lint Failures

**Problem:** Linting errors in CI

**Solution:**
```bash
# Locally run and fix
pnpm run lint:fix

# Review changes and commit
git add .
git commit -m "fix: resolve linting issues"
```

### Format Failures

**Problem:** Code formatting violations

**Solution:**
```bash
# Auto-format all code
pnpm run format

# Commit formatted code
git add .
git commit -m "style: format code"
```

### Type Check Failures

**Problem:** TypeScript compilation errors

**Solution:**
```bash
# Run type check locally
pnpm run type-check

# Fix type errors in your IDE
# Then commit fixes
git add .
git commit -m "fix: resolve type errors"
```

### Test Failures

**Problem:** Unit tests failing

**Solution:**
```bash
# Run tests locally
pnpm run test

# Fix failing tests
# Then commit fixes
git add .
git commit -m "fix: resolve failing tests"
```

### Build Failures

**Problem:** Build errors

**Solution:**
```bash
# Clean and rebuild
pnpm run clean
pnpm install
pnpm run build

# Fix build errors
# Then commit fixes
git add .
git commit -m "fix: resolve build errors"
```

### CI Timeout

**Problem:** CI job times out (> 10 minutes)

**Possible Causes:**
- Network issues downloading dependencies
- Infinite loops in tests
- Extremely slow builds

**Solution:**
1. Check job logs for where it hangs
2. Optimize slow operations
3. If legitimate timeout, increase timeout in workflow file

### Dependency Conflicts

**Problem:** `pnpm install --frozen-lockfile` fails

**Solution:**
1. Update lockfile locally: `pnpm install`
2. Commit updated `pnpm-lock.yaml`
3. Push changes

## Future Enhancements

### Potential Additions

1. **Smoke Tests**
   - Currently commented out in `ci.yml`
   - Enable when smoke test script is stable
   - Tests CLI scaffolding end-to-end

2. **Code Coverage**
   - Integrate with Codecov or Coveralls
   - Track test coverage over time
   - Add coverage badge to README

3. **Performance Benchmarks**
   - Automated performance testing
   - Detect performance regressions
   - Compare against baseline

4. **Release Automation**
   - Automated npm publishing on version tags
   - Changelog generation
   - GitHub release creation

5. **Matrix Testing**
   - Test on multiple Node.js versions (18, 20, 22)
   - Test on multiple OS (Ubuntu, macOS, Windows)

6. **Remote Turborepo Cache**
   - Cache build artifacts remotely
   - Speed up CI builds significantly
   - Share cache across PRs

## Best Practices

### Writing CI-Friendly Code

1. **Fast Tests:** Keep unit tests quick (< 5 seconds each)
2. **Deterministic:** Tests should pass consistently
3. **No Flaky Tests:** Fix or skip flaky tests
4. **Type Safety:** Leverage TypeScript for early error detection
5. **Incremental Builds:** Use Turborepo's incremental builds

### PR Workflow

1. **Create feature branch** from `main`
2. **Make changes** and commit
3. **Run checks locally** before pushing
4. **Push to GitHub** and create PR
5. **Wait for CI** to complete
6. **Fix any failures** and push again
7. **Request review** once CI passes
8. **Merge** when approved and CI passes

### Debugging CI Failures

1. **Check the logs:** Click on failed job in GitHub Actions
2. **Reproduce locally:** Run the same command that failed
3. **Fix the issue:** Make changes and test locally
4. **Push fix:** Commit and push to trigger CI again

## Configuration Files

### Workflow Files
- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) - Main CI workflow
- [`.github/workflows/security.yml`](../../.github/workflows/security.yml) - Security audits
- [`.github/dependabot.yml`](../../.github/dependabot.yml) - Dependabot config

### Tool Configurations
- [`biome.json`](../../biome.json) - Linter and formatter config
- [`turbo.json`](../../turbo.json) - Turborepo build config
- [`vitest.config.ts`](../../vitest.config.ts) - Test configuration

## Contact

For questions or issues with CI/CD:
1. Check this documentation
2. Review [GitHub Actions logs](https://github.com/bandofai/unido/actions)
3. Open an issue on GitHub
4. Ask in project discussions

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm CI Guide](https://pnpm.io/continuous-integration)
- [Turborepo CI Guide](https://turbo.build/repo/docs/ci/github-actions)
- [Biome Documentation](https://biomejs.dev/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
