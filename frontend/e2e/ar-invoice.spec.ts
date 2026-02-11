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

test.describe('AR Invoice List Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/ar/invoices');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display AR invoice list page', async ({ page }) => {
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
    const table = page.locator('table');
    const emptyState = page.getByText(/no.*invoice|no.*data|no.*record/i);

    await expect(table.or(emptyState).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('AR Invoice Create Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/ar/invoices/new');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display create invoice form', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /new.*invoice|create.*invoice/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should have customer selection field', async ({ page }) => {
    await expect(page.getByText(/customer/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have invoice date field', async ({ page }) => {
    await expect(page.getByText(/invoice date/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have line items section', async ({ page }) => {
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
