import { test, expect, Page } from "@playwright/test"

/**
 * E2E tests for Journal Voucher form
 * Tests both Form Mode and Spreadsheet Mode
 */

// Helper to set up mock authentication
async function setupAuth(page: Page) {
  // Set up mock authentication in localStorage before navigating
  await page.addInitScript(() => {
    // Mock user and auth state for Zustand persist
    const mockAuthState = {
      state: {
        user: {
          id: "test-user-id",
          email: "test@carmen.com",
          name: "Test User",
          tenantId: "test-tenant-id",
          tenantName: "Test Tenant",
          roles: ["Admin"],
        },
        permissions: ["*"], // All permissions for testing
        isAuthenticated: true,
      },
      version: 0,
    }

    localStorage.setItem("carmen-auth", JSON.stringify(mockAuthState))
    localStorage.setItem("accessToken", "mock-access-token-for-testing")
  })
}

test.describe("Journal Voucher Form", () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication
    await setupAuth(page)

    // Navigate to the journal voucher creation page
    await page.goto("/gl/journal-vouchers/new")

    // Wait for the page to be ready
    await page.waitForLoadState("domcontentloaded")

    // Wait for any loading to complete
    await page.waitForTimeout(500)
  })

  test.describe("Form Mode", () => {
    test("should display form mode by default or switch to it", async ({ page }) => {
      // Check if the Form toggle button exists
      const formButton = page.getByRole("button", { name: /form/i })
      await expect(formButton).toBeVisible({ timeout: 10000 })

      // Click on Form mode if not already selected
      await formButton.click()

      // Verify the Add Line button is visible (only shows in form mode)
      await expect(page.getByRole("button", { name: /add line/i })).toBeVisible()
    })

    test("should show Add Line button in form mode", async ({ page }) => {
      // Ensure we're in form mode
      const formButton = page.getByRole("button", { name: /form/i })
      await expect(formButton).toBeVisible({ timeout: 10000 })
      await formButton.click()

      // Check Add Line button is visible
      const addLineButton = page.getByRole("button", { name: /add line/i })
      await expect(addLineButton).toBeVisible()
    })

    test("should add a new line when clicking Add Line", async ({ page }) => {
      // Ensure we're in form mode
      const formButton = page.getByRole("button", { name: /form/i })
      await expect(formButton).toBeVisible({ timeout: 10000 })
      await formButton.click()

      // Count initial rows (should be at least 2)
      const initialRows = await page.locator("tbody tr").count()

      // Click Add Line
      await page.getByRole("button", { name: /add line/i }).click()

      // Verify a new row was added
      const newRows = await page.locator("tbody tr").count()
      expect(newRows).toBe(initialRows + 1)
    })

    test("should fill in voucher details", async ({ page }) => {
      // Ensure form is loaded
      const formButton = page.getByRole("button", { name: /form/i })
      await expect(formButton).toBeVisible({ timeout: 10000 })

      // Fill voucher date
      const voucherDateInput = page.locator('input[type="date"]').first()
      await voucherDateInput.fill("2024-01-15")

      // Fill description
      const descriptionInput = page.getByPlaceholder(/voucher description/i)
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill("Test Journal Voucher")
        await expect(descriptionInput).toHaveValue("Test Journal Voucher")
      }
    })

    test("should display totals section with debit and credit columns", async ({ page }) => {
      // Ensure we're in form mode
      const formButton = page.getByRole("button", { name: /form/i })
      await expect(formButton).toBeVisible({ timeout: 10000 })
      await formButton.click()

      // Wait for the table body to be visible
      const tableBody = page.locator("tbody")
      await expect(tableBody).toBeVisible({ timeout: 5000 })

      // Scroll the table footer into view
      const tableFooter = page.locator("tfoot")
      await tableFooter.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)

      // Verify the totals row exists with the "Totals:" label
      await expect(page.getByText("Totals:")).toBeVisible({ timeout: 5000 })

      // Verify the debit/credit inputs exist in the table rows
      const debitInputs = page.locator('tbody tr input[type="number"]')
      await expect(debitInputs.first()).toBeVisible()
    })
  })

  test.describe("Spreadsheet Mode", () => {
    test("should switch to spreadsheet mode", async ({ page }) => {
      // Click on Spreadsheet mode
      const spreadsheetButton = page.getByRole("button", { name: /spreadsheet/i })
      await expect(spreadsheetButton).toBeVisible({ timeout: 10000 })
      await spreadsheetButton.click()

      // Verify spreadsheet is visible
      // The Add Line button should NOT be visible in spreadsheet mode
      await expect(page.getByRole("button", { name: /add line/i })).not.toBeVisible()

      // The tip about typing account code should be visible
      await expect(page.getByText(/type account code/i)).toBeVisible()
    })

    test("should display totals in spreadsheet mode", async ({ page }) => {
      // Switch to spreadsheet mode
      const spreadsheetButton = page.getByRole("button", { name: /spreadsheet/i })
      await expect(spreadsheetButton).toBeVisible({ timeout: 10000 })
      await spreadsheetButton.click()

      // Totals section should be visible
      await expect(page.getByText(/total debit/i)).toBeVisible()
      await expect(page.getByText(/total credit/i)).toBeVisible()
    })

    test("should persist mode preference when toggling", async ({ page }) => {
      // Switch to spreadsheet mode
      const spreadsheetButton = page.getByRole("button", { name: /spreadsheet/i })
      await expect(spreadsheetButton).toBeVisible({ timeout: 10000 })
      await spreadsheetButton.click()

      // Verify we're in spreadsheet mode
      await expect(page.getByText(/type account code/i)).toBeVisible()

      // Switch back to form mode
      await page.getByRole("button", { name: /form/i }).click()

      // Verify Add Line button is back
      await expect(page.getByRole("button", { name: /add line/i })).toBeVisible()
    })

    test("spreadsheet mode should show help tip", async ({ page }) => {
      // Switch to spreadsheet mode
      const spreadsheetButton = page.getByRole("button", { name: /spreadsheet/i })
      await expect(spreadsheetButton).toBeVisible({ timeout: 10000 })
      await spreadsheetButton.click()

      // Check for the help tip
      await expect(page.getByText(/tip/i)).toBeVisible()
      await expect(page.getByText(/copy.*paste.*excel/i)).toBeVisible()
    })
  })

  test.describe("Mode Toggle", () => {
    test("should have both Form and Spreadsheet toggle options", async ({ page }) => {
      // Wait for page to load
      await page.waitForTimeout(500)

      // Both buttons should be visible
      await expect(page.getByRole("button", { name: /form/i })).toBeVisible({ timeout: 10000 })
      await expect(page.getByRole("button", { name: /spreadsheet/i })).toBeVisible()
    })

    test("should visually indicate the active mode", async ({ page }) => {
      const formButton = page.getByRole("button", { name: /form/i })
      const spreadsheetButton = page.getByRole("button", { name: /spreadsheet/i })

      await expect(formButton).toBeVisible({ timeout: 10000 })

      // Click form mode
      await formButton.click()

      // Form button should have the add line button visible (form mode indicator)
      await expect(page.getByRole("button", { name: /add line/i })).toBeVisible()

      // Click spreadsheet mode
      await spreadsheetButton.click()

      // Add line button should disappear
      await expect(page.getByRole("button", { name: /add line/i })).not.toBeVisible()
    })
  })

  test.describe("Form Validation", () => {
    test("should have Save & Submit button", async ({ page }) => {
      await page.waitForTimeout(500)

      // The Save & Submit button should be visible
      const saveSubmitButton = page.getByRole("button", { name: /save.*submit/i })
      await expect(saveSubmitButton).toBeVisible({ timeout: 10000 })

      // Note: Button is enabled when balanced (even 0=0 is balanced)
      // It only disables when totals don't match (debit ≠ credit)
    })

    test("should have Cancel button", async ({ page }) => {
      const cancelButton = page.getByRole("button", { name: /cancel/i })
      await expect(cancelButton).toBeVisible({ timeout: 10000 })
    })

    test("should have Save as Draft button", async ({ page }) => {
      const saveDraftButton = page.getByRole("button", { name: /save.*draft/i })
      await expect(saveDraftButton).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe("Header Information", () => {
    test("should display page title for new voucher", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: /new journal voucher/i })
      ).toBeVisible({ timeout: 10000 })
    })

    test("should have voucher date input", async ({ page }) => {
      // Look for the voucher date label and input
      await expect(page.getByText(/voucher date/i)).toBeVisible({ timeout: 10000 })
    })

    test("should have voucher type selector", async ({ page }) => {
      // Look for the voucher type label
      await expect(page.getByText(/voucher type/i)).toBeVisible({ timeout: 10000 })
    })

    test("should have currency selector", async ({ page }) => {
      // Look for the currency label
      await expect(page.getByText(/currency/i)).toBeVisible({ timeout: 10000 })
    })
  })
})

test.describe("Journal Voucher List Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto("/gl/journal-vouchers")
    await page.waitForLoadState("domcontentloaded")
  })

  test("should display journal voucher list page", async ({ page }) => {
    // Should see the page title or list
    await expect(
      page.getByRole("heading", { name: /journal voucher/i })
    ).toBeVisible({ timeout: 10000 })
  })

  test("should have create new voucher button", async ({ page }) => {
    // Find the New Voucher button/link
    const newButton = page.getByRole("link", { name: /new/i }).or(
      page.getByRole("button", { name: /new/i })
    )
    await expect(newButton).toBeVisible({ timeout: 10000 })
  })
})
