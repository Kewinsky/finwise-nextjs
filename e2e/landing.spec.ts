import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and shows hero content', async ({ page }) => {
    await page.goto('/');

    // There are two headings with similar text; we assert specifically on the main H1.
    await expect(
      page.getByRole('heading', {
        name: 'Take Control of Your Finances',
        exact: true,
        level: 1,
      }),
    ).toBeVisible();

    await expect(page.getByRole('link', { name: /start tracking free/i })).toBeVisible();
  });
});
