import { http, HttpResponse } from 'msw'
import { paginate } from '../data/common'
import { mockTaxProfiles, mockTaxProfileLookup } from '../data/tax-profiles'
import { mockCurrencies, mockCurrencyLookup } from '../data/currencies'
import { mockPaymentTerms, mockPaymentTermLookup } from '../data/payment-terms'
import { mockDepartments, mockDepartmentLookup, mockDepartmentTree } from '../data/departments'

export const configHandlers = [
  // ── Tax Profiles ────────────────────────────────────────────

  // GET list (paginated)
  http.get('*/v1/tenants/:tenantId/tax-profiles', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    return HttpResponse.json(paginate(mockTaxProfiles, page, pageSize))
  }),

  // GET lookup
  http.get('*/v1/tenants/:tenantId/tax-profiles/lookup', () => {
    return HttpResponse.json(mockTaxProfileLookup)
  }),

  // GET check-code
  http.get('*/v1/tenants/:tenantId/tax-profiles/check-code/:code', () => {
    return HttpResponse.json({ exists: false })
  }),

  // GET by-code
  http.get('*/v1/tenants/:tenantId/tax-profiles/by-code/:code', ({ params }) => {
    const item = mockTaxProfiles.find((t) => t.taxCode === params.code)
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(item)
  }),

  // GET has-transactions
  http.get('*/v1/tenants/:tenantId/tax-profiles/:id/has-transactions', () => {
    return HttpResponse.json({ hasTransactions: false })
  }),

  // GET by id
  http.get('*/v1/tenants/:tenantId/tax-profiles/:id', ({ params }) => {
    const item = mockTaxProfiles.find((t) => t.id === params.id)
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(item)
  }),

  // POST create
  http.post('*/v1/tenants/:tenantId/tax-profiles', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ id: 'new-tax-profile-id', ...body, createdAt: new Date().toISOString() }, { status: 201 })
  }),

  // PUT update
  http.put('*/v1/tenants/:tenantId/tax-profiles/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const existing = mockTaxProfiles.find((t) => t.id === params.id)
    return HttpResponse.json({ ...existing, ...body, updatedAt: new Date().toISOString() })
  }),

  // DELETE
  http.delete('*/v1/tenants/:tenantId/tax-profiles/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ── Currencies ──────────────────────────────────────────────

  // GET list (paginated)
  http.get('*/v1/tenants/:tenantId/currencies', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    return HttpResponse.json(paginate(mockCurrencies, page, pageSize))
  }),

  // GET lookup
  http.get('*/v1/tenants/:tenantId/currencies/lookup', () => {
    return HttpResponse.json(mockCurrencyLookup)
  }),

  // GET check-code
  http.get('*/v1/tenants/:tenantId/currencies/check-code/:code', () => {
    return HttpResponse.json({ exists: false })
  }),

  // GET by-code
  http.get('*/v1/tenants/:tenantId/currencies/by-code/:code', ({ params }) => {
    const item = mockCurrencies.find((c) => c.currencyCode === params.code)
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(item)
  }),

  // GET has-transactions
  http.get('*/v1/tenants/:tenantId/currencies/:id/has-transactions', () => {
    return HttpResponse.json({ hasTransactions: false })
  }),

  // PUT exchange-rate
  http.put('*/v1/tenants/:tenantId/currencies/:id/exchange-rate', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // GET by id
  http.get('*/v1/tenants/:tenantId/currencies/:id', ({ params }) => {
    const item = mockCurrencies.find((c) => c.id === params.id)
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(item)
  }),

  // POST create
  http.post('*/v1/tenants/:tenantId/currencies', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ id: 'new-currency-id', ...body, createdAt: new Date().toISOString() }, { status: 201 })
  }),

  // PUT update
  http.put('*/v1/tenants/:tenantId/currencies/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const existing = mockCurrencies.find((c) => c.id === params.id)
    return HttpResponse.json({ ...existing, ...body, updatedAt: new Date().toISOString() })
  }),

  // DELETE
  http.delete('*/v1/tenants/:tenantId/currencies/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ── Payment Terms ───────────────────────────────────────────

  // GET list (paginated)
  http.get('*/v1/tenants/:tenantId/payment-terms', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    return HttpResponse.json(paginate(mockPaymentTerms, page, pageSize))
  }),

  // GET lookup
  http.get('*/v1/tenants/:tenantId/payment-terms/lookup', () => {
    return HttpResponse.json(mockPaymentTermLookup)
  }),

  // GET check-code
  http.get('*/v1/tenants/:tenantId/payment-terms/check-code/:code', () => {
    return HttpResponse.json({ exists: false })
  }),

  // GET by-code
  http.get('*/v1/tenants/:tenantId/payment-terms/by-code/:code', ({ params }) => {
    const item = mockPaymentTerms.find((p) => p.termCode === params.code)
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(item)
  }),

  // GET has-transactions
  http.get('*/v1/tenants/:tenantId/payment-terms/:id/has-transactions', () => {
    return HttpResponse.json({ hasTransactions: false })
  }),

  // GET by id
  http.get('*/v1/tenants/:tenantId/payment-terms/:id', ({ params }) => {
    const item = mockPaymentTerms.find((p) => p.id === params.id)
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(item)
  }),

  // POST create
  http.post('*/v1/tenants/:tenantId/payment-terms', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ id: 'new-payment-term-id', ...body, createdAt: new Date().toISOString() }, { status: 201 })
  }),

  // PUT update
  http.put('*/v1/tenants/:tenantId/payment-terms/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const existing = mockPaymentTerms.find((p) => p.id === params.id)
    return HttpResponse.json({ ...existing, ...body, updatedAt: new Date().toISOString() })
  }),

  // DELETE
  http.delete('*/v1/tenants/:tenantId/payment-terms/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ── Departments ─────────────────────────────────────────────

  // GET list (paginated)
  http.get('*/v1/tenants/:tenantId/departments', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    return HttpResponse.json(paginate(mockDepartments, page, pageSize))
  }),

  // GET lookup
  http.get('*/v1/tenants/:tenantId/departments/lookup', () => {
    return HttpResponse.json(mockDepartmentLookup)
  }),

  // GET tree
  http.get('*/v1/tenants/:tenantId/departments/tree', () => {
    return HttpResponse.json(mockDepartmentTree)
  }),

  // GET check-code
  http.get('*/v1/tenants/:tenantId/departments/check-code/:code', () => {
    return HttpResponse.json({ exists: false })
  }),

  // GET by-code
  http.get('*/v1/tenants/:tenantId/departments/by-code/:code', ({ params }) => {
    const item = mockDepartments.find((d) => d.departmentCode === params.code)
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(item)
  }),

  // GET has-references
  http.get('*/v1/tenants/:tenantId/departments/:id/has-references', () => {
    return HttpResponse.json({ hasReferences: false })
  }),

  // GET by id
  http.get('*/v1/tenants/:tenantId/departments/:id', ({ params }) => {
    const item = mockDepartments.find((d) => d.id === params.id)
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(item)
  }),

  // POST create
  http.post('*/v1/tenants/:tenantId/departments', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ id: 'new-department-id', ...body, createdAt: new Date().toISOString() }, { status: 201 })
  }),

  // PUT update
  http.put('*/v1/tenants/:tenantId/departments/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const existing = mockDepartments.find((d) => d.id === params.id)
    return HttpResponse.json({ ...existing, ...body, updatedAt: new Date().toISOString() })
  }),

  // DELETE
  http.delete('*/v1/tenants/:tenantId/departments/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
