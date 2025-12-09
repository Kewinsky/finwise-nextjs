## Testing Overview

This document summarizes the testing strategy for the Finwise Next.js
application and explains how to run the different test layers.

### 1. Unit Tests (Vitest)

Location (examples):

- `src/lib/utils/currency.test.ts`
  - Tests numeric helpers and currency formatting (`formatCurrency`,
    `calculatePercentageChange`, `formatPercentageChange`).
- `src/lib/utils/date.test.ts`
  - Tests date formatting for display (`formatDisplayDate`).
- `src/validation/finance.transactions.test.ts`
  - Tests Zod validation for transactions:
    - Valid income transaction with destination account.
    - Rejection of invalid combinations (e.g. transfer with same accounts,
      income without destination account).
    - Behaviour of `transactionFormSchema` and `updateTransactionSchema`.
- `src/services/ai.service.test.ts`
  - Tests **AI business logic** (without real OpenAI):
    - `analyzeFinancialData` – rule-based insights from aggregated data.
    - `generateMockResponse` – basic parsing of user questions into intents
      (spending, savings/budget, balance).

Run:

```bash
pnpm test        # run all vitest tests once
pnpm test:watch  # watch mode
pnpm test:coverage
```

### 2. Integration Tests (Vitest)

Location:

- `integration/stripe/stripe-webhook.test.ts`
  - Tests the Stripe webhook handler (`handleWebhookEvent`):
    - Mocks Stripe client and subscription sync functions.
    - Verifies correct parsing of `invoice.payment_succeeded` and that
      `syncSubscriptionToDatabase` is called with the parsed subscription.
- `integration/ai/openai-service.test.ts`
  - Tests `callOpenAI` error handling:
    - Mocks the OpenAI SDK so that API calls fail with a rate-limit error.
    - Asserts that the function returns a user-friendly error message and
      does not crash the application.
- `integration/supabase/transactions-integration.test.ts`
  - Optional, **requires real Supabase test environment**:
    - Uses `createServiceClient` to insert a profile, account and transaction
      for a temporary user.
    - Verifies that the inserted transaction matches the expected user and
      amount.
    - The suite is skipped automatically if the necessary env vars are not set.

Run (integration only):

```bash
pnpm test --run --dir integration
```

_(Vitest does not have a built-in "by folder" filter, so you can also use
file patterns, e.g. `pnpm test integration/stripe/stripe-webhook.test.ts`.)_

### 3. End-to-End Tests (Playwright)

Location:

- `e2e/landing.spec.ts`
  - Existing test for the public landing page hero section.
- `e2e/auth.spec.ts`
  - Magic-link login flow (client side):
    - Fills the email field.
    - Clicks "Send Magic Link".
    - Asserts redirect to `/email-sent` and presence of the confirmation text.
- `e2e/transactions.spec.ts`
  - Dashboard → add transaction → verify in UI:
    - Opens `/dashboard`.
    - Clicks quick action `quick-action-expense`.
    - Fills minimal fields in the `TransactionForm` (amount, description).
    - Saves and expects the new description to appear in the
      `RecentActivityCard`.
- `e2e/ai-assistant.spec.ts`
  - AI assistant sidebar (rule-based / mocked OpenAI path):
    - Opens `/dashboard`.
    - Uses `ai-chat-input` and `ai-chat-send-button` to ask a question.
    - Expects an assistant reply containing typical financial wording
      (spending / expenses / savings).

All E2E tests use stable `data-testid` attributes added to:

- Auth form (`auth-email-input`, `auth-magic-link-button`).
- Quick actions (`quick-action-income`, `quick-action-expense`, `quick-action-transfer`,
  `quick-action-manage-accounts`).
- Transaction form (`transaction-form`, `transaction-amount-input`,
  `transaction-description-input`, `transaction-save-button`).
- Recent activity rows (`recent-transaction-row`).
- AI assistant (`ai-chat-interface`, `ai-chat-input`, `ai-chat-send-button`).

Run:

```bash
# start app in one terminal
pnpm dev

# run e2e tests in another
pnpm test:e2e
```

> **Note:** For full end-to-end coverage you should run the app against a
> Supabase project seeded with the provided SQL files in `database/` and
> configure the required environment variables.

### Summary

The test suite deliberately focuses on a **small but representative subset** of
Finwise functionality:

- **Unit tests** for pure business logic and validation.
- **Integration tests** for key external integrations (Stripe, OpenAI, Supabase).
- **E2E tests** that cover the main flows described in the thesis: auth,
  transactions, and AI assistant.
