import { http, HttpResponse } from 'msw'
import { mockCustomers, mockCustomerLookup, mockCustomerAgingSummary } from '../data/customers'
import { mockArInvoices, mockUnpaidArInvoices } from '../data/ar-invoices'
import { mockArReceipts } from '../data/ar-receipts'
import { paginate } from '../data/common'

export const arHandlers = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Customers
  // ═══════════════════════════════════════════════════════════════════════════

  // Customer lookup
  http.get('*/v1/tenants/:tenantId/customers/lookup', () => {
    return HttpResponse.json(mockCustomerLookup)
  }),

  // Aging report
  http.get('*/v1/tenants/:tenantId/customers/aging-report', () => {
    return HttpResponse.json(mockCustomerAgingSummary)
  }),

  // Check customer code
  http.get('*/v1/tenants/:tenantId/customers/check-code', () => {
    return HttpResponse.json({ isUnique: true })
  }),

  // Get customer by code
  http.get('*/v1/tenants/:tenantId/customers/by-code/:customerCode', ({ params }) => {
    const found = mockCustomers.find((c) => c.customerCode === params.customerCode)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // List customers
  http.get('*/v1/tenants/:tenantId/customers', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockCustomers]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (c) =>
          c.customerCode.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q),
      )
    }

    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  // Customer aging detail
  http.get('*/v1/tenants/:tenantId/customers/:customerId/aging', ({ params }) => {
    const summary = mockCustomerAgingSummary.find((a) => a.customerId === params.customerId)
    return HttpResponse.json(
      summary ?? {
        customerId: params.customerId,
        customerCode: 'C-001',
        customerName: 'Unknown Customer',
        current: 0,
        days1To30: 0,
        days31To60: 0,
        days61To90: 0,
        days90Plus: 0,
        totalBalance: 0,
      },
    )
  }),

  // Get customer by ID
  http.get('*/v1/tenants/:tenantId/customers/:id', ({ params }) => {
    const found = mockCustomers.find((c) => c.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create customer
  http.post('*/v1/tenants/:tenantId/customers', () => {
    return HttpResponse.json(mockCustomers[0], { status: 201 })
  }),

  // Update customer
  http.put('*/v1/tenants/:tenantId/customers/:id', ({ params }) => {
    const found = mockCustomers.find((c) => c.id === params.id)
    return HttpResponse.json(found ?? mockCustomers[0])
  }),

  // Delete customer
  http.delete('*/v1/tenants/:tenantId/customers/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // AR Invoices
  // ═══════════════════════════════════════════════════════════════════════════

  // Next invoice number
  http.get('*/v1/tenants/:tenantId/ar/invoices/next-number', () => {
    return HttpResponse.json({ invoiceNumber: 'AR-2025-0013' })
  }),

  // Calculate tax
  http.post('*/v1/tenants/:tenantId/ar/invoices/calculate-tax', () => {
    return HttpResponse.json({
      subtotal: 10000,
      vatAmount: 700,
      whtAmount: 0,
      totalAmount: 10700,
      lines: [
        {
          lineNumber: 1,
          netAmount: 10000,
          vatRate: 7,
          vatAmount: 700,
          whtRate: 0,
          whtAmount: 0,
        },
      ],
    })
  }),

  // Unpaid invoices
  http.get('*/v1/tenants/:tenantId/ar/invoices/unpaid', () => {
    return HttpResponse.json(mockUnpaidArInvoices)
  }),

  // Get invoice by number
  http.get('*/v1/tenants/:tenantId/ar/invoices/by-number/:invoiceNumber', ({ params }) => {
    const found = mockArInvoices.find((inv) => inv.invoiceNumber === params.invoiceNumber)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // List AR invoices
  http.get('*/v1/tenants/:tenantId/ar/invoices', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockArInvoices]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q),
      )
    }

    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  // Get AR invoice by ID
  http.get('*/v1/tenants/:tenantId/ar/invoices/:id', ({ params }) => {
    const found = mockArInvoices.find((inv) => inv.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create AR invoice
  http.post('*/v1/tenants/:tenantId/ar/invoices', () => {
    return HttpResponse.json(mockArInvoices[0], { status: 201 })
  }),

  // Update AR invoice
  http.put('*/v1/tenants/:tenantId/ar/invoices/:id', ({ params }) => {
    const found = mockArInvoices.find((inv) => inv.id === params.id)
    return HttpResponse.json(found ?? mockArInvoices[0])
  }),

  // Delete AR invoice
  http.delete('*/v1/tenants/:tenantId/ar/invoices/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Submit AR invoice
  http.post('*/v1/tenants/:tenantId/ar/invoices/:id/submit', ({ params }) => {
    const found = mockArInvoices.find((inv) => inv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockArInvoices[0]), status: 1 })
  }),

  // Approve AR invoice
  http.post('*/v1/tenants/:tenantId/ar/invoices/:id/approve', ({ params }) => {
    const found = mockArInvoices.find((inv) => inv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockArInvoices[0]), status: 2 })
  }),

  // Reject AR invoice
  http.post('*/v1/tenants/:tenantId/ar/invoices/:id/reject', ({ params }) => {
    const found = mockArInvoices.find((inv) => inv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockArInvoices[0]), status: 5 })
  }),

  // Void AR invoice
  http.post('*/v1/tenants/:tenantId/ar/invoices/:id/void', ({ params }) => {
    const found = mockArInvoices.find((inv) => inv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockArInvoices[0]), status: 6 })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // AR Receipts
  // ═══════════════════════════════════════════════════════════════════════════

  // Next receipt number
  http.get('*/v1/tenants/:tenantId/ar/receipts/next-number', () => {
    return HttpResponse.json({ receiptNumber: 'RC-2025-0007' })
  }),

  // Auto-allocate
  http.post('*/v1/tenants/:tenantId/ar/receipts/auto-allocate', () => {
    return HttpResponse.json({
      allocations: mockUnpaidArInvoices.map((inv) => ({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        allocationAmount: inv.balanceAmount,
      })),
      totalAllocated: mockUnpaidArInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0),
      unallocatedAmount: 0,
    })
  }),

  // Exchange gain/loss
  http.get('*/v1/tenants/:tenantId/ar/receipts/calculate-exchange-gain-loss', () => {
    return HttpResponse.json({ exchangeGainLoss: 0 })
  }),

  // Get receipt by number
  http.get('*/v1/tenants/:tenantId/ar/receipts/by-number/:receiptNumber', ({ params }) => {
    const found = mockArReceipts.find((r) => r.receiptNumber === params.receiptNumber)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // List AR receipts
  http.get('*/v1/tenants/:tenantId/ar/receipts', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockArReceipts]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (r) =>
          r.receiptNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q),
      )
    }

    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  // Get AR receipt by ID
  http.get('*/v1/tenants/:tenantId/ar/receipts/:id', ({ params }) => {
    const found = mockArReceipts.find((r) => r.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create AR receipt
  http.post('*/v1/tenants/:tenantId/ar/receipts', () => {
    return HttpResponse.json(mockArReceipts[0], { status: 201 })
  }),

  // Update AR receipt
  http.put('*/v1/tenants/:tenantId/ar/receipts/:id', ({ params }) => {
    const found = mockArReceipts.find((r) => r.id === params.id)
    return HttpResponse.json(found ?? mockArReceipts[0])
  }),

  // Delete AR receipt
  http.delete('*/v1/tenants/:tenantId/ar/receipts/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Approve AR receipt
  http.post('*/v1/tenants/:tenantId/ar/receipts/:id/approve', ({ params }) => {
    const found = mockArReceipts.find((r) => r.id === params.id)
    return HttpResponse.json({ ...(found ?? mockArReceipts[0]), status: 2 })
  }),

  // Post AR receipt
  http.post('*/v1/tenants/:tenantId/ar/receipts/:id/post', ({ params }) => {
    const found = mockArReceipts.find((r) => r.id === params.id)
    return HttpResponse.json({ ...(found ?? mockArReceipts[0]), status: 3 })
  }),

  // Void AR receipt
  http.post('*/v1/tenants/:tenantId/ar/receipts/:id/void', ({ params }) => {
    const found = mockArReceipts.find((r) => r.id === params.id)
    return HttpResponse.json({ ...(found ?? mockArReceipts[0]), status: 4 })
  }),
]
