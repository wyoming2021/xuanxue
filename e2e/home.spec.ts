import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  // Expect the page to contain some visible content (adjust selector as needed)
  await expect(page.locator('body')).toBeVisible();
});
