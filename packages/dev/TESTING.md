# Testing Guide

Comprehensive testing guide for the Unido Dev package (`@bandofai/unido-dev`).

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [E2E Tests](#e2e-tests)
- [Code Coverage](#code-coverage)
- [CI/CD Integration](#cicd-integration)
- [Writing New Tests](#writing-new-tests)
- [Troubleshooting](#troubleshooting)

---

## Overview

The test suite includes:

- **Unit Tests**: Testing individual components and functions in isolation
- **Integration Tests**: Testing interactions between components
- **E2E Tests**: Testing complete user workflows in a browser

**Technologies:**
- **Vitest**: Unit and integration test runner
- **Testing Library**: React component testing
- **Playwright**: E2E browser testing
- **Happy DOM**: Lightweight DOM implementation for unit tests

**Current Status:**
- ✅ Test infrastructure complete
- ✅ Unit tests for MCP client
- ✅ Unit tests for UI components
- ✅ Integration tests for widget loading
- ✅ E2E test framework setup
- ✅ CI/CD workflows configured

---

## Test Structure

```
packages/dev/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts                      # Test setup and globals
│   │   ├── mcp-client.test.ts            # MCP client unit tests
│   │   ├── window-openai-emulator.test.ts # Emulator unit tests
│   │   ├── components/
│   │   │   ├── McpStatus.test.tsx        # McpStatus component tests
│   │   │   ├── LogPanel.test.tsx         # LogPanel component tests
│   │   │   └── ToolCallPanel.test.tsx    # ToolCallPanel component tests
│   │   ├── integration/
│   │   │   └── widget-loading.test.ts    # Integration tests
│   │   └── e2e/
│   │       └── widget-preview.spec.ts    # E2E tests
│   ├── mcp-client.ts
│   ├── window-openai-emulator.ts
│   └── components/
├── vitest.config.ts                       # Vitest configuration
├── playwright.config.ts                   # Playwright configuration
└── package.json
```

---

## Running Tests

### All Tests

```bash
# Run all unit and integration tests
pnpm run test

# Run with watch mode
pnpm run test:watch

# Run with UI
pnpm run test:ui

# Run with coverage
pnpm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
pnpm run test:e2e

# Run with UI mode
pnpm run test:e2e:ui

# Run in debug mode
pnpm run test:e2e:debug

# Run specific browser
pnpm run test:e2e --project=chromium
pnpm run test:e2e --project=firefox
pnpm run test:e2e --project=webkit
```

### From Root

```bash
# Run tests for all packages
pnpm run test

# Run tests for dev package only
pnpm --filter @bandofai/unido-dev test
```

---

## Unit Tests

Unit tests verify individual components and functions work correctly in isolation.

### MCP Client Tests

**File**: `src/__tests__/mcp-client.test.ts`

**Coverage:**
- Constructor and initialization
- Connection lifecycle (connect/disconnect)
- Widget operations (list, load, cache)
- Tool operations (list, call)
- Error handling
- Reconnection logic
- State management

**Example:**
```typescript
describe('McpWidgetClient', () => {
  it('should connect successfully', async () => {
    const client = new McpWidgetClient({
      serverUrl: 'http://localhost:3000'
    });

    await client.connect();
    expect(client.isConnected()).toBe(true);
  });
});
```

### WindowOpenAI Emulator Tests

**File**: `src/__tests__/window-openai-emulator.test.ts`

**Coverage:**
- API creation and initialization
- Tool call execution
- Display mode management
- External link handling
- Widget state management
- Event emission
- Window injection

### Component Tests

**Files:**
- `src/__tests__/components/McpStatus.test.tsx`
- `src/__tests__/components/LogPanel.test.tsx`
- `src/__tests__/components/ToolCallPanel.test.tsx`

**Coverage:**
- Component rendering
- User interactions
- Props handling
- State management
- Custom styling
- Error states

**Example:**
```typescript
describe('McpStatus', () => {
  it('should render disconnected state', () => {
    render(<McpStatus client={mockClient} />);
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });
});
```

---

## Integration Tests

Integration tests verify components work together correctly.

**File**: `src/__tests__/integration/widget-loading.test.ts`

**Test Scenarios:**
1. **Direct Load Mode**: Widget loading without MCP server
2. **MCP Load Mode**: Complete widget load flow through MCP
3. **Mode Switching**: Switching between Direct and MCP modes
4. **Error Scenarios**: Server offline, widget not found, tool failures
5. **State Persistence**: localStorage integration
6. **Performance**: Caching, concurrent loads
7. **Cleanup**: Resource cleanup on disconnect

**Example:**
```typescript
describe('Widget Loading Integration', () => {
  it('should complete full widget load flow', async () => {
    await client.connect();
    const widgets = await client.listWidgets();
    const html = await client.loadWidget(widgets[0].type);
    expect(html).toBeDefined();
  });
});
```

---

## E2E Tests

End-to-end tests verify the complete application works as expected in a real browser.

**File**: `src/__tests__/e2e/widget-preview.spec.ts`

**Test Suites:**

### 1. Widget Preview App
- App loading
- Component selector display
- Load mode toggle
- Mode switching
- localStorage persistence

### 2. MCP Mode Features
- Connection status display
- Tool Call Panel functionality
- Log Panel functionality
- Tool execution
- Log filtering

### 3. Direct Mode Features
- Direct widget rendering
- Props editing
- MCP panel hiding

### 4. Error Handling
- Server disconnection
- Invalid JSON handling

### 5. Cross-browser Compatibility
- Chrome, Firefox, Safari testing

### 6. Performance
- Load time verification
- Mode switching performance

**Example:**
```typescript
test('should switch between Direct and MCP modes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /direct load/i }).click();
  // Verify Direct mode active

  await page.getByRole('button', { name: /mcp load/i }).click();
  // Verify MCP mode active
});
```

---

## Code Coverage

### Coverage Targets

- **Lines**: 80%+
- **Functions**: 80%+
- **Branches**: 80%+
- **Statements**: 80%+

### Generate Coverage Report

```bash
pnpm run test:coverage
```

Reports generated in:
- `coverage/index.html` - HTML report (open in browser)
- `coverage/coverage-final.json` - JSON data
- Terminal - Summary output

### View Coverage

```bash
# Open HTML report
open coverage/index.html
```

### Excluded from Coverage

- `node_modules/`
- `dist/`
- `**/*.config.ts`
- `**/*.d.ts`
- `**/types/**`
- `**/__tests__/**`
- `public/**`

---

## CI/CD Integration

Tests run automatically on:
- **Push** to `main` or `develop` branches
- **Pull Requests** to `main` or `develop`

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

**Jobs:**

1. **unit-tests**
   - Runs on Node 18.x and 20.x
   - Type checking
   - Linting
   - Unit & integration tests
   - Coverage report upload

2. **e2e-tests**
   - Runs on Ubuntu latest
   - Installs Playwright browsers
   - Runs E2E tests
   - Uploads test artifacts

3. **build**
   - Verifies all packages build successfully

### Running Locally with CI Environment

```bash
CI=true pnpm run test
CI=true pnpm run test:e2e
```

---

## Writing New Tests

### Unit Test Template

```typescript
/**
 * Tests for MyComponent
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent.js';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render correctly', () => {
      render(<MyComponent />);
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should handle clicks', () => {
      const onClick = vi.fn();
      render(<MyComponent onClick={onClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should perform action', async ({ page }) => {
    // Navigate or interact
    await page.getByRole('button', { name: /click me/i }).click();

    // Assert outcome
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Descriptive Test Names**: Use clear, descriptive test names
   ```typescript
   // Good
   it('should display error when server is offline')

   // Bad
   it('test error')
   ```

2. **Arrange-Act-Assert**: Follow AAA pattern
   ```typescript
   it('should increment counter', () => {
     // Arrange
     const counter = new Counter();

     // Act
     counter.increment();

     // Assert
     expect(counter.value).toBe(1);
   });
   ```

3. **Mock External Dependencies**
   ```typescript
   vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
     Client: vi.fn().mockImplementation(() => ({
       connect: vi.fn().mockResolvedValue(undefined),
     })),
   }));
   ```

4. **Clean Up After Tests**
   ```typescript
   afterEach(async () => {
     if (client && client.isConnected()) {
       await client.disconnect();
     }
     vi.clearAllMocks();
   });
   ```

5. **Test Edge Cases**
   - Empty states
   - Error conditions
   - Boundary values
   - Concurrent operations

---

## Troubleshooting

### Common Issues

#### 1. Tests Failing with "Module not found"

**Solution**: Ensure aliases are configured in `vitest.config.ts`

```typescript
resolve: {
  alias: {
    '@bandofai/unido-core': '../core/src',
    '@bandofai/unido-provider-base': '../providers/base/src',
  },
}
```

#### 2. E2E Tests Timeout

**Solution**: Increase timeout or check if dev server is running

```bash
# Ensure dev server starts properly
pnpm run dev

# Increase timeout in playwright.config.ts
timeout: 120 * 1000
```

#### 3. Coverage Not Generating

**Solution**: Install coverage provider

```bash
pnpm add -D @vitest/coverage-v8
```

#### 4. React Component Tests Failing

**Solution**: Ensure happy-dom is configured

```typescript
// vitest.config.ts
test: {
  environment: 'happy-dom',
  setupFiles: ['./src/__tests__/setup.ts'],
}
```

#### 5. Mocks Not Working

**Solution**: Clear mocks between tests

```typescript
afterEach(() => {
  vi.clearAllMocks();
});
```

### Debug Mode

#### Vitest Debug

```bash
# Run with debug output
pnpm run test --reporter=verbose

# Run specific test file
pnpm run test src/__tests__/mcp-client.test.ts

# Run tests matching pattern
pnpm run test --grep="connection"
```

#### Playwright Debug

```bash
# Run in debug mode with inspector
pnpm run test:e2e:debug

# Run headed (see browser)
pnpm run test:e2e --headed

# Run with trace
pnpm run test:e2e --trace on
```

### Getting Help

- Check test output for specific error messages
- Review [Vitest docs](https://vitest.dev/)
- Review [Playwright docs](https://playwright.dev/)
- Check GitHub Issues: https://github.com/bandofai/unido/issues

---

## Next Steps

### Planned Improvements

1. **Increase Coverage**: Target 90%+ coverage
2. **Visual Regression**: Add visual snapshot testing
3. **Performance Tests**: Benchmark critical paths
4. **Accessibility Tests**: Add a11y testing with axe
5. **Load Tests**: Test with large datasets

### Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure coverage meets targets (80%+)
3. Run full test suite before committing
4. Update this documentation if needed

---

**Last Updated**: October 20, 2025
**Maintainer**: Unido Development Team
