import { test, expect, type Page } from '@playwright/test';

// Use a pre-recorded authenticated session for dashboard tests.
// The file is created with: `npx playwright codegen --save-storage=playwright/.auth/user.json http://127.0.0.1:3000/login`
test.use({ storageState: 'playwright/.auth/user.json' });

// NOTE: This test assumes that the app is running with a logged-in test user
// (e.g. via Supabase magic link or a preconfigured session) and that
// at least one account exists so that the transaction form can be submitted.
//
// Implementing a full login helper (Supabase session seeding, storageState, etc.)
// would add a lot of test infrastructure. For the purposes of the thesis we keep
// this scenario as an optional E2E and skip it by default unless explicitly
// enabled via environment variable.

const DASHBOARD_E2E_ENABLED = process.env.E2E_DASHBOARD_TESTS === 'true';

async function openDashboard(page: Page) {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
}

test.describe('Transactions flow', () => {
  test('user can add an expense and see it in recent activity', async ({ page }) => {
    test.skip(
      !DASHBOARD_E2E_ENABLED,
      'Requires authenticated test user and seeded accounts (E2E_DASHBOARD_TESTS=true)',
    );

    await openDashboard(page);

    // Open expense form via quick actions
    await page.getByTestId('quick-action-expense').click();

    const form = page.getByTestId('transaction-form');
    await expect(form).toBeVisible();

    await page.getByTestId('transaction-amount-input').fill('12.34');
    await page.getByTestId('transaction-description-input').fill('Playwright E2E Coffee');

    // For simplicity we rely on sensible defaults for date/category/accounts
    await page.getByTestId('transaction-save-button').click();

    // After successful save the dialog should close and the transaction
    // should appear in Recent Activity. We look for our description text
    // inside at least one recent transaction row.
    const rows = page.getByTestId('recent-transaction-row');
    await expect(rows.first()).toBeVisible();
    await expect(page.getByText('Playwright E2E Coffee', { exact: false })).toBeVisible();
  });
});
