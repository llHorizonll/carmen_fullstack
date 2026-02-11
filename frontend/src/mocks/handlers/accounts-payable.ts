import { http, HttpResponse } from 'msw'
import { mockVendors, mockVendorLookup, mockVendorAgingSummary } from '../data/vendors'
import { mockApInvoices, mockUnpaidApInvoices } from '../data/ap-invoices'
import { mockApPayments } from '../data/ap-payments'
import { paginate } from '../data/common'

export const apHandlers = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Vendors
  // ═══════════════════════════════════════════════════════════════════════════

  // Vendor lookup
  http.get('*/v1/tenants/:tenantId/vendors/lookup', () => {
    return HttpResponse.json(mockVendorLookup)
  }),

  // Aging report
  http.get('*/v1/tenants/:tenantId/vendors/aging-report', () => {
    return HttpResponse.json(mockVendorAgingSummary)
  }),

  // Check vendor code
  http.get('*/v1/tenants/:tenantId/vendors/check-code', () => {
    return HttpResponse.json({ isUnique: true })
  }),

  // Get vendor by code
  http.get('*/v1/tenants/:tenantId/vendors/by-code/:vendorCode', ({ params }) => {
    const found = mockVendors.find((v) => v.vendorCode === params.vendorCode)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // List vendors
  http.get('*/v1/tenants/:tenantId/vendors', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockVendors]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (v) =>
          v.vendorCode.toLowerCase().includes(q) ||
          v.vendorName.toLowerCase().includes(q),
      )
    }

    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  // Vendor aging detail
  http.get('*/v1/tenants/:tenantId/vendors/:vendorId/aging', ({ params }) => {
    const summary = mockVendorAgingSummary.find((a) => a.vendorId === params.vendorId)
    return HttpResponse.json(
      summary ?? {
        vendorId: params.vendorId,
        vendorCode: 'V-001',
        vendorName: 'Unknown Vendor',
        current: 0,
        days1To30: 0,
        days31To60: 0,
        days61To90: 0,
        days90Plus: 0,
        totalBalance: 0,
      },
    )
  }),

  // Get vendor by ID
  http.get('*/v1/tenants/:tenantId/vendors/:id', ({ params }) => {
    const found = mockVendors.find((v) => v.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create vendor
  http.post('*/v1/tenants/:tenantId/vendors', () => {
    return HttpResponse.json(mockVendors[0], { status: 201 })
  }),

  // Update vendor
  http.put('*/v1/tenants/:tenantId/vendors/:id', ({ params }) => {
    const found = mockVendors.find((v) => v.id === params.id)
    return HttpResponse.json(found ?? mockVendors[0])
  }),

  // Delete vendor
  http.delete('*/v1/tenants/:tenantId/vendors/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // AP Invoices
  // ═══════════════════════════════════════════════════════════════════════════

  // Next invoice number
  http.get('*/v1/tenants/:tenantId/ap/invoices/next-number', () => {
    return HttpResponse.json({ invoiceNumber: 'AP-2025-0016' })
  }),

  // Calculate tax
  http.post('*/v1/tenants/:tenantId/ap/invoices/calculate-tax', () => {
    return HttpResponse.json({
      subtotal: 10000,
      vatAmount: 700,
      whtAmount: 300,
      totalAmount: 10400,
      lines: [
        {
          lineNumber: 1,
          netAmount: 10000,
          vatRate: 7,
          vatAmount: 700,
          whtRate: 3,
          whtAmount: 300,
        },
      ],
    })
  }),

  // Validate invoice
  http.post('*/v1/tenants/:tenantId/ap/invoices/validate', () => {
    return HttpResponse.json([])
  }),

  // Check credit limit
  http.get('*/v1/tenants/:tenantId/ap/invoices/check-credit-limit', () => {
    return HttpResponse.json({
      vendorId: '',
      creditLimit: 500000,
      currentOutstanding: 185400,
      invoiceAmount: 0,
      totalAfterInvoice: 185400,
      isWithinLimit: true,
      availableCredit: 314600,
    })
  }),

  // Unpaid invoices
  http.get('*/v1/tenants/:tenantId/ap/invoices/unpaid', () => {
    return HttpResponse.json(mockUnpaidApInvoices)
  }),

  // Get invoice by number
  http.get('*/v1/tenants/:tenantId/ap/invoices/by-number/:invoiceNumber', ({ params }) => {
    const found = mockApInvoices.find((inv) => inv.invoiceNumber === params.invoiceNumber)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // List AP invoices
  http.get('*/v1/tenants/:tenantId/ap/invoices', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockApInvoices]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.vendorName.toLowerCase().includes(q),
      )
    }

    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  // Get AP invoice by ID
  http.get('*/v1/tenants/:tenantId/ap/invoices/:id', ({ params }) => {
    const found = mockApInvoices.find((inv) => inv.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create AP invoice
  http.post('*/v1/tenants/:tenantId/ap/invoices', () => {
    return HttpResponse.json(mockApInvoices[0], { status: 201 })
  }),

  // Update AP invoice
  http.put('*/v1/tenants/:tenantId/ap/invoices/:id', ({ params }) => {
    const found = mockApInvoices.find((inv) => inv.id === params.id)
    return HttpResponse.json(found ?? mockApInvoices[0])
  }),

  // Delete AP invoice
  http.delete('*/v1/tenants/:tenantId/ap/invoices/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Submit AP invoice
  http.post('*/v1/tenants/:tenantId/ap/invoices/:id/submit', ({ params }) => {
    const found = mockApInvoices.find((inv) => inv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockApInvoices[0]), status: 1 })
  }),

  // Approve AP invoice
  http.post('*/v1/tenants/:tenantId/ap/invoices/:id/approve', ({ params }) => {
    const found = mockApInvoices.find((inv) => inv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockApInvoices[0]), status: 2 })
  }),

  // Reject AP invoice
  http.post('*/v1/tenants/:tenantId/ap/invoices/:id/reject', ({ params }) => {
    const found = mockApInvoices.find((inv) => inv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockApInvoices[0]), status: 5 })
  }),

  // Void AP invoice
  http.post('*/v1/tenants/:tenantId/ap/invoices/:id/void', ({ params }) => {
    const found = mockApInvoices.find((inv) => inv.id === params.id)
    return HttpResponse.json({ ...(found ?? mockApInvoices[0]), status: 6 })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // AP Payments
  // ═══════════════════════════════════════════════════════════════════════════

  // Next payment number
  http.get('*/v1/tenants/:tenantId/ap/payments/next-number', () => {
    return HttpResponse.json({ paymentNumber: 'PV-2025-0009' })
  }),

  // Validate payment
  http.post('*/v1/tenants/:tenantId/ap/payments/validate', () => {
    return HttpResponse.json([])
  }),

  // Auto-allocate
  http.post('*/v1/tenants/:tenantId/ap/payments/auto-allocate', () => {
    return HttpResponse.json({
      allocations: mockUnpaidApInvoices.map((inv) => ({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        allocationAmount: inv.balanceAmount,
      })),
      totalAllocated: mockUnpaidApInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0),
      unallocatedAmount: 0,
    })
  }),

  // Exchange gain/loss
  http.get('*/v1/tenants/:tenantId/ap/payments/exchange-gain-loss', () => {
    return HttpResponse.json({ exchangeGainLoss: 0 })
  }),

  // Get payment by number
  http.get('*/v1/tenants/:tenantId/ap/payments/by-number/:paymentNumber', ({ params }) => {
    const found = mockApPayments.find((p) => p.paymentNumber === params.paymentNumber)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // List AP payments
  http.get('*/v1/tenants/:tenantId/ap/payments', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockApPayments]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) =>
          p.paymentNumber.toLowerCase().includes(q) ||
          p.vendorName.toLowerCase().includes(q),
      )
    }

    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  // Get AP payment by ID
  http.get('*/v1/tenants/:tenantId/ap/payments/:id', ({ params }) => {
    const found = mockApPayments.find((p) => p.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create AP payment
  http.post('*/v1/tenants/:tenantId/ap/payments', () => {
    return HttpResponse.json(mockApPayments[0], { status: 201 })
  }),

  // Update AP payment
  http.put('*/v1/tenants/:tenantId/ap/payments/:id', ({ params }) => {
    const found = mockApPayments.find((p) => p.id === params.id)
    return HttpResponse.json(found ?? mockApPayments[0])
  }),

  // Delete AP payment
  http.delete('*/v1/tenants/:tenantId/ap/payments/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Approve AP payment
  http.post('*/v1/tenants/:tenantId/ap/payments/:id/approve', ({ params }) => {
    const found = mockApPayments.find((p) => p.id === params.id)
    return HttpResponse.json({ ...(found ?? mockApPayments[0]), status: 2 })
  }),

  // Post AP payment
  http.post('*/v1/tenants/:tenantId/ap/payments/:id/post', ({ params }) => {
    const found = mockApPayments.find((p) => p.id === params.id)
    return HttpResponse.json({ ...(found ?? mockApPayments[0]), status: 3 })
  }),

  // Void AP payment
  http.post('*/v1/tenants/:tenantId/ap/payments/:id/void', ({ params }) => {
    const found = mockApPayments.find((p) => p.id === params.id)
    return HttpResponse.json({ ...(found ?? mockApPayments[0]), status: 4 })
  }),
]
