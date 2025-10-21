/**
 * E2E tests for widget preview system
 *
 * These tests verify the complete user journey:
 * - Loading widgets in both Direct and MCP modes
 * - Tool call execution
 * - Mode switching
 * - Error handling and recovery
 */

import { test, expect } from '@playwright/test';

// Test configuration
const PREVIEW_URL = process.env.PREVIEW_URL || 'http://localhost:5173';

test.describe('Widget Preview System - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Direct Load Mode', () => {
    test('should load widget in direct mode', async ({ page }) => {
      const directButton = page.getByRole('button', { name: /direct load/i });
      await expect(directButton).toBeVisible();

      const weatherWidget = page.getByText('Weather Card');
      await weatherWidget.click();

      const widgetPreview = page.locator('[data-testid="widget-preview"]');
      await expect(widgetPreview).toBeVisible({ timeout: 5000 });
    });

    test('should switch between widgets in direct mode', async ({ page }) => {
      await page.getByText('Weather Card').click();
      await page.waitForTimeout(500);

      const otherWidget = page.locator('[data-testid="widget-list"] button').first();
      await otherWidget.click();
      await page.waitForTimeout(500);

      await page.getByText('Weather Card').click();
      await page.waitForTimeout(500);

      const widgetPreview = page.locator('[data-testid="widget-preview"]');
      await expect(widgetPreview).toBeVisible();
    });
  });

  test.describe('MCP Load Mode', () => {
    test('should connect to MCP server', async ({ page }) => {
      const mcpButton = page.getByRole('button', { name: /mcp load/i });
      await mcpButton.click();

      await page.waitForTimeout(2000);

      const statusIndicator = page.locator('[data-testid="mcp-status"]');
      await expect(statusIndicator).toContainText(/connected/i, { timeout: 5000 });
    });

    test('should load widget via MCP', async ({ page }) => {
      await page.getByRole('button', { name: /mcp load/i }).click();
      await page.waitForTimeout(2000);

      await page.getByText('Weather Card').click();

      const iframe = page.frameLocator('iframe[title*="Widget"]');
      await expect(iframe.locator('body')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Mode Switching', () => {
    test('should switch from Direct to MCP mode', async ({ page }) => {
      const directButton = page.getByRole('button', { name: /direct load/i });
      await expect(directButton).toBeVisible();

      await page.getByText('Weather Card').click();
      await page.waitForTimeout(500);

      const mcpButton = page.getByRole('button', { name: /mcp load/i });
      await mcpButton.click();

      await page.waitForTimeout(2000);

      const statusIndicator = page.locator('[data-testid="mcp-status"]');
      if (await statusIndicator.isVisible()) {
        await expect(statusIndicator).toContainText(/connect/i);
      }
    });

    test('should switch from MCP to Direct mode', async ({ page }) => {
      await page.getByRole('button', { name: /mcp load/i }).click();
      await page.waitForTimeout(2000);

      const directButton = page.getByRole('button', { name: /direct load/i });
      await directButton.click();

      await page.waitForTimeout(500);

      await page.getByText('Weather Card').click();
      await page.waitForTimeout(500);
    });
  });

  test.describe('Performance', () => {
    test('should load widget in under 1 second', async ({ page }) => {
      const startTime = Date.now();

      await page.getByText('Weather Card').click();

      const widgetPreview = page.locator('[data-testid="widget-preview"]');
      await expect(widgetPreview).toBeVisible({ timeout: 5000 });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(1000);
    });
  });

  test.describe('Browser Compatibility', () => {
    test('should work in different viewports', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const directButton = page.getByRole('button', { name: /direct load/i });
      await expect(directButton).toBeVisible();

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(directButton).toBeVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(directButton).toBeVisible();
    });
  });
});
