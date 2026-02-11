import { test, expect, type Page } from '@playwright/test';

// Test user credentials
const TEST_USERS = {
  admin: { email: 'admin@carmen.com', password: 'Admin@123', tenantName: 'Demo Hotel' },
  beachManager: { email: 'manager@beachresort.com', password: 'Beach@123', tenantName: 'Beach Resort Hotel' },
  hod: { email: 'hod@carmen.com', password: 'HOD@123', tenantName: 'Demo Hotel' },
};

// Helper to clear auth state
async function clearAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

test.describe('Multi-Tenant Login System', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/login');
  });

  test.describe('Single-Tenant User Login', () => {
    test('admin user logs in successfully', async ({ page }) => {
      await page.getByLabel('Email').fill(TEST_USERS.admin.email);
      await page.getByLabel('Password').fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Should show user name in header
      await expect(page.getByText('System Administrator')).toBeVisible({ timeout: 5000 });
    });

    test('beach manager logs in to their tenant', async ({ page }) => {
      await page.getByLabel('Email').fill(TEST_USERS.beachManager.email);
      await page.getByLabel('Password').fill(TEST_USERS.beachManager.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
      await expect(page.getByText('Beach Manager')).toBeVisible({ timeout: 5000 });

      // Should NOT see tenant switcher (single tenant only)
      await expect(page.getByRole('button', { name: /Beach Resort Hotel/i })).not.toBeVisible();
    });

    test('invalid password shows error', async ({ page }) => {
      await page.getByLabel('Email').fill(TEST_USERS.admin.email);
      await page.getByLabel('Password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.getByText(/Login failed|Invalid/i)).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveURL(/\/login/);
    });

    test('invalid email shows error', async ({ page }) => {
      await page.getByLabel('Email').fill('nonexistent@carmen.com');
      await page.getByLabel('Password').fill('anypassword');
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.getByText(/Login failed|Invalid/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Multi-Tenant User (Head of Department)', () => {
    test('HOD logs in and sees tenant switcher', async ({ page }) => {
      await page.getByLabel('Email').fill(TEST_USERS.hod.email);
      await page.getByLabel('Password').fill(TEST_USERS.hod.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Should see tenant switcher button with current tenant
      const tenantSwitcher = page.getByRole('button', { name: /Demo Hotel/i });
      await expect(tenantSwitcher).toBeVisible({ timeout: 5000 });
    });

    test('HOD can see accessible tenants in dropdown', async ({ page }) => {
      await page.getByLabel('Email').fill(TEST_USERS.hod.email);
      await page.getByLabel('Password').fill(TEST_USERS.hod.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Click tenant switcher
      await page.getByRole('button', { name: /Demo Hotel/i }).click();

      // Should see both tenants in dropdown
      await expect(page.getByText('Demo Hotel')).toBeVisible();
      await expect(page.getByText('Beach Resort Hotel')).toBeVisible();
      await expect(page.getByText('DEMO')).toBeVisible();
      await expect(page.getByText('BEACH')).toBeVisible();
    });

    test('HOD can switch to another tenant', async ({ page }) => {
      await page.getByLabel('Email').fill(TEST_USERS.hod.email);
      await page.getByLabel('Password').fill(TEST_USERS.hod.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Click tenant switcher and select Beach Resort
      await page.getByRole('button', { name: /Demo Hotel/i }).click();
      await page.getByRole('menuitem', { name: /Beach Resort Hotel/i }).click();

      // Tenant switcher should now show Beach Resort
      await expect(page.getByRole('button', { name: /Beach Resort Hotel/i })).toBeVisible({ timeout: 5000 });
    });

    test('tenant context persists after page reload', async ({ page }) => {
      await page.getByLabel('Email').fill(TEST_USERS.hod.email);
      await page.getByLabel('Password').fill(TEST_USERS.hod.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Switch to Beach Resort
      await page.getByRole('button', { name: /Demo Hotel/i }).click();
      await page.getByRole('menuitem', { name: /Beach Resort Hotel/i }).click();

      // Wait for switch to complete
      await expect(page.getByRole('button', { name: /Beach Resort Hotel/i })).toBeVisible({ timeout: 5000 });

      // Reload page
      await page.reload();

      // Should still be on Beach Resort tenant
      await expect(page.getByRole('button', { name: /Beach Resort Hotel/i })).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Logout Flow', () => {
    test('user can logout and is redirected to login', async ({ page }) => {
      // Login first
      await page.getByLabel('Email').fill(TEST_USERS.admin.email);
      await page.getByLabel('Password').fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Click user avatar/menu
      await page.getByRole('button', { name: /SA|System/i }).click();

      // Click logout
      await page.getByRole('menuitem', { name: /Log out/i }).click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('protected routes redirect to login after logout', async ({ page }) => {
      // Login
      await page.getByLabel('Email').fill(TEST_USERS.admin.email);
      await page.getByLabel('Password').fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Logout
      await page.getByRole('button', { name: /SA|System/i }).click();
      await page.getByRole('menuitem', { name: /Log out/i }).click();
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

      // Try to access protected route
      await page.goto('/gl/accounts');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
  });

  test.describe('Protected Routes', () => {
    test('unauthenticated user is redirected to login', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('unauthenticated user trying GL routes is redirected', async ({ page }) => {
      await page.goto('/gl/journal-vouchers');
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
  });
});
