import { http, HttpResponse } from 'msw'
import { mockAccounts, mockAccountLookup, mockTrialBalance } from '../data/accounts'
import {
  mockFiscalPeriods,
  mockFiscalYears,
  mockFiscalYearList,
  mockFiscalPeriodList,
  mockFiscalPeriodLookup,
} from '../data/fiscal-periods'
import { mockJournalVouchers, mockJournalVoucherList } from '../data/journal-vouchers'
import { mockRecurringVouchers, mockRecurringVoucherList } from '../data/recurring-vouchers'
import { paginate } from '../data/common'

export const glHandlers = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Journal Vouchers
  // ═══════════════════════════════════════════════════════════════════════════

  // List journal vouchers
  http.get('*/v1/tenants/:tenantId/journal-vouchers', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockJournalVoucherList]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (jv) =>
          jv.voucherNumber.toLowerCase().includes(q) ||
          jv.description.toLowerCase().includes(q),
      )
    }

    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  // Get next voucher number
  http.get('*/v1/tenants/:tenantId/journal-vouchers/next-number', () => {
    return HttpResponse.json({ voucherNumber: 'JV-2025-0013' })
  }),

  // Validate voucher
  http.post('*/v1/tenants/:tenantId/journal-vouchers/validate', () => {
    return HttpResponse.json({ valid: true, errors: [] })
  }),

  // Get journal voucher by number
  http.get('*/v1/tenants/:tenantId/journal-vouchers/by-number/:voucherNumber', ({ params }) => {
    const found = mockJournalVouchers.find((jv) => jv.voucherNumber === params.voucherNumber)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Get journal voucher by ID
  http.get('*/v1/tenants/:tenantId/journal-vouchers/:id', ({ params }) => {
    const found = mockJournalVouchers.find((jv) => jv.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create journal voucher
  http.post('*/v1/tenants/:tenantId/journal-vouchers', () => {
    return HttpResponse.json(mockJournalVouchers[0], { status: 201 })
  }),

  // Update journal voucher
  http.put('*/v1/tenants/:tenantId/journal-vouchers/:id', ({ params }) => {
    const found = mockJournalVouchers.find((jv) => jv.id === params.id)
    return HttpResponse.json(found ?? mockJournalVouchers[0])
  }),

  // Delete journal voucher
  http.delete('*/v1/tenants/:tenantId/journal-vouchers/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Submit for approval
  http.post('*/v1/tenants/:tenantId/journal-vouchers/:id/submit', ({ params }) => {
    const found = mockJournalVouchers.find((jv) => jv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockJournalVouchers[0]), status: 2 })
  }),

  // Approve
  http.post('*/v1/tenants/:tenantId/journal-vouchers/:id/approve', ({ params }) => {
    const found = mockJournalVouchers.find((jv) => jv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockJournalVouchers[0]), status: 3 })
  }),

  // Reject
  http.post('*/v1/tenants/:tenantId/journal-vouchers/:id/reject', ({ params }) => {
    const found = mockJournalVouchers.find((jv) => jv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockJournalVouchers[0]), status: 5 })
  }),

  // Post
  http.post('*/v1/tenants/:tenantId/journal-vouchers/:id/post', ({ params }) => {
    const found = mockJournalVouchers.find((jv) => jv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockJournalVouchers[0]), status: 4 })
  }),

  // Reverse
  http.post('*/v1/tenants/:tenantId/journal-vouchers/:id/reverse', ({ params }) => {
    const found = mockJournalVouchers.find((jv) => jv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockJournalVouchers[0]), status: 6 })
  }),

  // Void
  http.post('*/v1/tenants/:tenantId/journal-vouchers/:id/void', ({ params }) => {
    const found = mockJournalVouchers.find((jv) => jv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockJournalVouchers[0]), status: 7 })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // Accounts
  // ═══════════════════════════════════════════════════════════════════════════

  // Trial balance
  http.get('*/v1/tenants/:tenantId/accounts/trial-balance', () => {
    return HttpResponse.json(mockTrialBalance)
  }),

  // Account tree
  http.get('*/v1/tenants/:tenantId/accounts/tree', () => {
    // Return flat list as a simple tree representation
    const tree = mockAccounts
      .filter((a) => a.isHeader)
      .map((header) => ({
        ...header,
        children: mockAccounts.filter(
          (a) =>
            !a.isHeader &&
            a.accountCode.startsWith(header.accountCode.charAt(0)) &&
            a.accountCode !== header.accountCode,
        ),
      }))
    return HttpResponse.json(tree)
  }),

  // Account lookup
  http.get('*/v1/tenants/:tenantId/accounts/lookup', () => {
    return HttpResponse.json(mockAccountLookup)
  }),

  // Check account code
  http.get('*/v1/tenants/:tenantId/accounts/check-code/:code', () => {
    return HttpResponse.json({ exists: false })
  }),

  // Get account by code
  http.get('*/v1/tenants/:tenantId/accounts/by-code/:code', ({ params }) => {
    const found = mockAccounts.find((a) => a.accountCode === params.code)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // List accounts
  http.get('*/v1/tenants/:tenantId/accounts', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockAccounts]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (a) =>
          a.accountCode.toLowerCase().includes(q) ||
          a.accountName.toLowerCase().includes(q),
      )
    }

    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  // Get account summary
  http.get('*/v1/tenants/:tenantId/accounts/:id/summary', ({ params }) => {
    const found = mockAccounts.find((a) => a.id === params.id)
    return HttpResponse.json({
      ...(found ?? mockAccounts[1]),
      openingBalance: 0,
      totalDebit: 125000,
      totalCredit: 0,
      closingBalance: 125000,
    })
  }),

  // Get account ledger
  http.get('*/v1/tenants/:tenantId/accounts/:id/ledger', ({ params }) => {
    const found = mockAccounts.find((a) => a.id === params.id)
    return HttpResponse.json({
      account: found ?? mockAccounts[1],
      openingBalance: 0,
      closingBalance: 125000,
      transactions: [
        {
          id: '00000000-0000-0000-0000-000000000099',
          date: '2025-10-15',
          voucherNumber: 'JV-2025-0001',
          description: 'Room revenue recognition',
          debit: 125000,
          credit: 0,
          balance: 125000,
        },
      ],
    })
  }),

  // Has transactions
  http.get('*/v1/tenants/:tenantId/accounts/:id/has-transactions', () => {
    return HttpResponse.json({ hasTransactions: true })
  }),

  // Get account by ID
  http.get('*/v1/tenants/:tenantId/accounts/:id', ({ params }) => {
    const found = mockAccounts.find((a) => a.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create account
  http.post('*/v1/tenants/:tenantId/accounts', () => {
    return HttpResponse.json(mockAccounts[1], { status: 201 })
  }),

  // Update account
  http.put('*/v1/tenants/:tenantId/accounts/:id', ({ params }) => {
    const found = mockAccounts.find((a) => a.id === params.id)
    return HttpResponse.json(found ?? mockAccounts[1])
  }),

  // Delete account
  http.delete('*/v1/tenants/:tenantId/accounts/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // Fiscal Periods
  // ═══════════════════════════════════════════════════════════════════════════

  // Get fiscal years
  http.get('*/v1/tenants/:tenantId/fiscal-periods/years', ({ request }) => {
    const url = new URL(request.url)
    // Check if it's a specific year by looking for path after /years/
    if (url.pathname.match(/\/years\/[^/]+$/)) return undefined as never
    return HttpResponse.json(mockFiscalYearList)
  }),

  // Get fiscal year by ID
  http.get('*/v1/tenants/:tenantId/fiscal-periods/years/:id', ({ params }) => {
    const found = mockFiscalYears.find((fy) => fy.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create fiscal year
  http.post('*/v1/tenants/:tenantId/fiscal-periods/years', () => {
    return HttpResponse.json(mockFiscalYears[0], { status: 201 })
  }),

  // Period lookup
  http.get('*/v1/tenants/:tenantId/fiscal-periods/lookup', () => {
    return HttpResponse.json(mockFiscalPeriodLookup)
  }),

  // Current period
  http.get('*/v1/tenants/:tenantId/fiscal-periods/current', () => {
    const current = mockFiscalPeriods.find((p) => p.periodNumber === 11)
    return HttpResponse.json(current ?? mockFiscalPeriods[10])
  }),

  // Period by date
  http.get('*/v1/tenants/:tenantId/fiscal-periods/by-date', ({ request }) => {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    if (date) {
      const month = new Date(date).getMonth() + 1
      const found = mockFiscalPeriods.find((p) => p.periodNumber === month)
      if (found) return HttpResponse.json(found)
    }
    return HttpResponse.json(mockFiscalPeriods[10])
  }),

  // Close validation
  http.get('*/v1/tenants/:tenantId/fiscal-periods/:id/close-validation', () => {
    return HttpResponse.json({
      canClose: true,
      errors: [],
      warnings: [],
      unpostedVoucherCount: 0,
      pendingApprovalCount: 0,
    })
  }),

  // Blocking vouchers
  http.get('*/v1/tenants/:tenantId/fiscal-periods/:id/blocking-vouchers', () => {
    return HttpResponse.json({
      unpostedVouchers: [],
      pendingApprovalVouchers: [],
    })
  }),

  // List fiscal periods
  http.get('*/v1/tenants/:tenantId/fiscal-periods', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')

    return HttpResponse.json(paginate(mockFiscalPeriodList, page, pageSize))
  }),

  // Get fiscal period by ID
  http.get('*/v1/tenants/:tenantId/fiscal-periods/:id', ({ params }) => {
    const found = mockFiscalPeriods.find((p) => p.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Close period
  http.post('*/v1/tenants/:tenantId/fiscal-periods/:id/close', ({ params }) => {
    const found = mockFiscalPeriods.find((p) => p.id === params.id)
    return HttpResponse.json({ ...(found ?? mockFiscalPeriods[0]), status: 1 })
  }),

  // Reopen period
  http.post('*/v1/tenants/:tenantId/fiscal-periods/:id/reopen', ({ params }) => {
    const found = mockFiscalPeriods.find((p) => p.id === params.id)
    return HttpResponse.json({ ...(found ?? mockFiscalPeriods[0]), status: 0 })
  }),

  // Lock period
  http.post('*/v1/tenants/:tenantId/fiscal-periods/:id/lock', ({ params }) => {
    const found = mockFiscalPeriods.find((p) => p.id === params.id)
    return HttpResponse.json({ ...(found ?? mockFiscalPeriods[0]), status: 2 })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // Recurring Vouchers
  // ═══════════════════════════════════════════════════════════════════════════

  // List recurring vouchers
  http.get('*/v1/tenants/:tenantId/gl/recurring-vouchers', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockRecurringVoucherList]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (rv) =>
          rv.name.toLowerCase().includes(q) ||
          (rv.description && rv.description.toLowerCase().includes(q)),
      )
    }

    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  // Get recurring voucher by ID
  http.get('*/v1/tenants/:tenantId/gl/recurring-vouchers/:id', ({ params }) => {
    const found = mockRecurringVouchers.find((rv) => rv.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create recurring voucher
  http.post('*/v1/tenants/:tenantId/gl/recurring-vouchers', () => {
    return HttpResponse.json(mockRecurringVouchers[0], { status: 201 })
  }),

  // Update recurring voucher
  http.put('*/v1/tenants/:tenantId/gl/recurring-vouchers/:id', ({ params }) => {
    const found = mockRecurringVouchers.find((rv) => rv.id === params.id)
    return HttpResponse.json(found ?? mockRecurringVouchers[0])
  }),

  // Delete recurring voucher
  http.delete('*/v1/tenants/:tenantId/gl/recurring-vouchers/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Activate
  http.post('*/v1/tenants/:tenantId/gl/recurring-vouchers/:id/activate', ({ params }) => {
    const found = mockRecurringVouchers.find((rv) => rv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockRecurringVouchers[0]), isActive: true })
  }),

  // Deactivate
  http.post('*/v1/tenants/:tenantId/gl/recurring-vouchers/:id/deactivate', ({ params }) => {
    const found = mockRecurringVouchers.find((rv) => rv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockRecurringVouchers[0]), isActive: false })
  }),
]
