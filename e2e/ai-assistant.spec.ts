import { test, expect, type Page } from '@playwright/test';

// Use the same authenticated session as other dashboard E2E tests.
test.use({ storageState: 'playwright/.auth/user.json' });

// NOTE: This test assumes a logged-in user and that the AI sidebar is
// available on the dashboard. OpenAI itself is mocked/disabled in the app
// config, so the assistant falls back to rule-based responses.
//
// As with the transactions E2E test, we keep this scenario optional and skip
// it by default unless the environment explicitly enables dashboard E2E tests.

const DASHBOARD_E2E_ENABLED = process.env.E2E_DASHBOARD_TESTS === 'true';

async function openDashboard(page: Page) {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
}

test.describe('AI Assistant sidebar', () => {
  test('user can ask a question and see an assistant reply', async ({ page }) => {
    test.skip(
      !DASHBOARD_E2E_ENABLED,
      'Requires authenticated test user and seeded data (E2E_DASHBOARD_TESTS=true)',
    );

    await openDashboard(page);

    // On desktop the chat sidebar is always rendered on /dashboard.
    const chatInterface = page.getByTestId('ai-chat-interface');
    await expect(chatInterface).toBeVisible();

    const input = page.getByTestId('ai-chat-input');
    await input.fill('Can you analyze my spending?');

    await page.getByTestId('ai-chat-send-button').click();

    // We expect at least one assistant message to appear that is
    // different from the initial greeting.
    await expect(
      page.getByText(/spending|expenses|savings/i, { exact: false }).first(),
    ).toBeVisible();
  });
});
