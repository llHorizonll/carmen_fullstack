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

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display dashboard page heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display stat cards', async ({ page }) => {
    // Dashboard should have summary cards (revenue, expenses, etc.)
    const cards = page.locator('[class*="card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display charts section', async ({ page }) => {
    // Look for chart containers (canvas elements from chart libraries or SVG)
    const charts = page.locator('canvas, svg[class*="chart"], [class*="chart"]');
    await expect(charts.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display navigation sidebar', async ({ page }) => {
    // Sidebar should have key navigation items
    await expect(page.getByText(/general ledger/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/accounts payable/i)).toBeVisible();
    await expect(page.getByText(/accounts receivable/i)).toBeVisible();
  });

  test('should navigate to journal vouchers from sidebar', async ({ page }) => {
    // Click on General Ledger menu
    await page.getByText(/general ledger/i).click();
    await page.getByText(/journal voucher/i).first().click();

    await expect(page).toHaveURL(/\/gl\/journal-vouchers/, { timeout: 10000 });
  });
});
