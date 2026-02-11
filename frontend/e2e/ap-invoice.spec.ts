import { test, expect, type Page } from '@playwright/test';

// Helper to set up mock authentication
async function setupAuth(page: Page) {
  await page.addInitScript(() => {
    const mockAuthState = {
      state: {
        user: {
          id: 'test-user-id',
          email: 'admin@carmen.com',
          name: 'System Administrator',
          tenantId: 'test-tenant-id',
          tenantName: 'Demo Hotel',
          roles: ['Admin'],
        },
        permissions: ['*'],
        isAuthenticated: true,
      },
      version: 0,
    };

    localStorage.setItem('carmen-auth', JSON.stringify(mockAuthState));
    localStorage.setItem('accessToken', 'mock-access-token-for-testing');
  });
}

test.describe('AP Invoice List Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/ap/invoices');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display AP invoice list page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /invoice/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should have create new invoice button', async ({ page }) => {
    const newButton = page
      .getByRole('link', { name: /new/i })
      .or(page.getByRole('button', { name: /new/i }));
    await expect(newButton).toBeVisible({ timeout: 10000 });
  });

  test('should display data table or empty state', async ({ page }) => {
    // Should show either a table or an empty state message
    const table = page.locator('table');
    const emptyState = page.getByText(/no.*invoice|no.*data|no.*record/i);

    await expect(table.or(emptyState).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('AP Invoice Create Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/ap/invoices/new');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display create invoice form', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /new.*invoice|create.*invoice/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should have vendor selection field', async ({ page }) => {
    await expect(page.getByText(/vendor/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have invoice date field', async ({ page }) => {
    await expect(page.getByText(/invoice date/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have currency field', async ({ page }) => {
    await expect(page.getByText(/currency/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have line items section', async ({ page }) => {
    // Should have a section for invoice lines (table or add-line button)
    const linesSection = page
      .getByRole('button', { name: /add.*line/i })
      .or(page.locator('tbody'));
    await expect(linesSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have save and cancel buttons', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /save|submit/i }).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('button', { name: /cancel/i })
    ).toBeVisible();
  });
});
