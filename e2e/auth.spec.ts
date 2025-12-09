import { test, expect } from '@playwright/test';

// Minimal end-to-end test for magic-link auth flow (mocked in the sense
// that we only verify the client-side flow up to the "email sent" page).

test.describe('Auth - magic link login', () => {
  test('user can request a magic link and see confirmation screen', async ({ page }) => {
    // This flow depends on a correctly configured Supabase project and email
    // auth. In local/dev environments without that configuration we skip the
    // assertion on the redirect and only verify that the form is usable.
    const shouldAssertRedirect = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

    await page.goto('/login');

    const emailInput = page.getByTestId('auth-email-input');
    await emailInput.fill('test@example.com');

    const sendButton = page.getByTestId('auth-magic-link-button');
    await sendButton.click();

    if (shouldAssertRedirect) {
      // In a fully configured environment we expect redirect to /email-sent.
      await expect(page).toHaveURL(/email-sent/);
      await expect(page.getByText(/check your email/i)).toBeVisible();
    } else {
      // In a minimal local setup we just assert that the page did not crash.
      await expect(page.getByTestId('auth-email-input')).toBeVisible();
    }
  });
});
