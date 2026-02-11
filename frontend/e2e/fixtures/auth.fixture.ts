import { test as base, expect } from '@playwright/test';

type AuthFixture = {
  loginAs: (email: string, password: string) => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  loginAsHOD: () => Promise<void>;
  loginAsBeachManager: () => Promise<void>;
};

export const test = base.extend<AuthFixture>({
  loginAs: async ({ page }, use) => {
    const login = async (email: string, password: string) => {
      await page.goto('/login');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    };
    await use(login);
  },

  loginAsAdmin: async ({ page }, use) => {
    const login = async () => {
      await page.goto('/login');
      await page.getByLabel('Email').fill('admin@carmen.com');
      await page.getByLabel('Password').fill('Admin@123');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    };
    await use(login);
  },

  loginAsHOD: async ({ page }, use) => {
    const login = async () => {
      await page.goto('/login');
      await page.getByLabel('Email').fill('hod@carmen.com');
      await page.getByLabel('Password').fill('HOD@123');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    };
    await use(login);
  },

  loginAsBeachManager: async ({ page }, use) => {
    const login = async () => {
      await page.goto('/login');
      await page.getByLabel('Email').fill('manager@beachresort.com');
      await page.getByLabel('Password').fill('Beach@123');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    };
    await use(login);
  },
});

export { expect };
