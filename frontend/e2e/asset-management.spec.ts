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

test.describe('Asset List Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/assets/list');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display asset list page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /asset/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should have create new asset button', async ({ page }) => {
    const newButton = page
      .getByRole('link', { name: /new|add|create/i })
      .or(page.getByRole('button', { name: /new|add|create/i }));
    await expect(newButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display data table or empty state', async ({ page }) => {
    const table = page.locator('table');
    const emptyState = page.getByText(/no.*asset|no.*data|no.*record/i);

    await expect(table.or(emptyState).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Asset Create Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/assets/new');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display create asset form', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /new.*asset|create.*asset|add.*asset/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should have asset name field', async ({ page }) => {
    await expect(page.getByText(/asset.*name|name/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should have category selection field', async ({ page }) => {
    await expect(page.getByText(/category/i)).toBeVisible({ timeout: 10000 });
  });

  test('should have acquisition cost field', async ({ page }) => {
    await expect(
      page.getByText(/cost|acquisition|value/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should have save and cancel buttons', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /save|submit|create/i }).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('button', { name: /cancel/i })
    ).toBeVisible();
  });
});

test.describe('Asset Categories Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/assets/categories');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display asset categories page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /categor/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should have create category button', async ({ page }) => {
    const newButton = page
      .getByRole('link', { name: /new|add|create/i })
      .or(page.getByRole('button', { name: /new|add|create/i }));
    await expect(newButton.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Depreciation Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/assets/depreciation');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display depreciation page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /depreciation/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display schedule table or empty state', async ({ page }) => {
    const table = page.locator('table');
    const emptyState = page.getByText(/no.*depreciation|no.*data|no.*record|no.*schedule/i);

    await expect(table.or(emptyState).first()).toBeVisible({ timeout: 10000 });
  });
});
