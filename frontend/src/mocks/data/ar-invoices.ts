import type { ArInvoiceListDto, UnpaidArInvoiceDto } from '@/features/accounts-receivable/invoices/types'
import { ArInvoiceStatus } from '@/features/accounts-receivable/invoices/types'
import { uuid } from './common'

// ---------------------------------------------------------------------------
// ~12 AR Invoices  (Draft x2, Pending x1, Approved x2, PartiallyPaid x2, Paid x3, Void x2)
// ---------------------------------------------------------------------------

export const mockArInvoices: ArInvoiceListDto[] = [
  // ── Draft ──────────────────────────────────────────────────────────────
  {
    id: uuid('ariv', 1),
    invoiceNumber: 'AR-2025-0001',
    customerReference: 'PO-ACC-2025-112',
    invoiceDate: '2025-11-05',
    dueDate: '2025-12-05',
    status: ArInvoiceStatus.Draft,
    customerCode: 'C-001',
    customerName: 'Accenture Solutions (Thailand) Ltd.',
    currencyCode: 'THB',
    totalAmount: 125000,
    paidAmount: 0,
    balanceAmount: 125000,
    lineCount: 3,
    createdAt: '2025-11-05T10:00:00Z',
  },
  {
    id: uuid('ariv', 2),
    invoiceNumber: 'AR-2025-0002',
    customerReference: undefined,
    invoiceDate: '2025-11-08',
    dueDate: '2025-12-08',
    status: ArInvoiceStatus.Draft,
    customerCode: 'C-005',
    customerName: 'Grand Events & MICE Co., Ltd.',
    currencyCode: 'THB',
    totalAmount: 85000,
    paidAmount: 0,
    balanceAmount: 85000,
    lineCount: 2,
    createdAt: '2025-11-08T14:30:00Z',
  },

  // ── Pending ────────────────────────────────────────────────────────────
  {
    id: uuid('ariv', 3),
    invoiceNumber: 'AR-2025-0003',
    customerReference: 'TMT-BOOK-NOV',
    invoiceDate: '2025-11-01',
    dueDate: '2025-11-30',
    status: ArInvoiceStatus.Pending,
    customerCode: 'C-002',
    customerName: 'Toyota Motor Thailand Co., Ltd.',
    currencyCode: 'THB',
    totalAmount: 250000,
    paidAmount: 0,
    balanceAmount: 250000,
    lineCount: 5,
    createdAt: '2025-11-01T09:00:00Z',
  },

  // ── Approved ───────────────────────────────────────────────────────────
  {
    id: uuid('ariv', 4),
    invoiceNumber: 'AR-2025-0004',
    customerReference: 'AGD-COMM-2510',
    invoiceDate: '2025-10-15',
    dueDate: '2025-11-14',
    status: ArInvoiceStatus.Approved,
    customerCode: 'C-003',
    customerName: 'Agoda Company Pte. Ltd.',
    currencyCode: 'THB',
    totalAmount: 98500,
    paidAmount: 0,
    balanceAmount: 98500,
    lineCount: 1,
    createdAt: '2025-10-15T08:00:00Z',
  },
  {
    id: uuid('ariv', 5),
    invoiceNumber: 'AR-2025-0005',
    customerReference: 'MOTS-EVT-Q4',
    invoiceDate: '2025-10-20',
    dueDate: '2025-11-19',
    status: ArInvoiceStatus.Approved,
    customerCode: 'C-006',
    customerName: 'Ministry of Tourism and Sports',
    currencyCode: 'THB',
    totalAmount: 150000,
    paidAmount: 0,
    balanceAmount: 150000,
    lineCount: 4,
    createdAt: '2025-10-20T11:30:00Z',
  },

  // ── Partially Paid ─────────────────────────────────────────────────────
  {
    id: uuid('ariv', 6),
    invoiceNumber: 'AR-2025-0006',
    customerReference: 'TMT-CONF-SEP',
    invoiceDate: '2025-09-10',
    dueDate: '2025-10-10',
    status: ArInvoiceStatus.PartiallyPaid,
    customerCode: 'C-002',
    customerName: 'Toyota Motor Thailand Co., Ltd.',
    currencyCode: 'THB',
    totalAmount: 180000,
    paidAmount: 100000,
    balanceAmount: 80000,
    lineCount: 3,
    createdAt: '2025-09-10T09:15:00Z',
  },
  {
    id: uuid('ariv', 7),
    invoiceNumber: 'AR-2025-0007',
    customerReference: 'BKG-COMM-2509',
    invoiceDate: '2025-09-15',
    dueDate: '2025-10-15',
    status: ArInvoiceStatus.PartiallyPaid,
    customerCode: 'C-004',
    customerName: 'Booking.com B.V.',
    currencyCode: 'THB',
    totalAmount: 62000,
    paidAmount: 30000,
    balanceAmount: 32000,
    lineCount: 1,
    createdAt: '2025-09-15T08:00:00Z',
  },

  // ── Paid ───────────────────────────────────────────────────────────────
  {
    id: uuid('ariv', 8),
    invoiceNumber: 'AR-2025-0008',
    customerReference: 'KBANK-SEMINAR-AUG',
    invoiceDate: '2025-08-20',
    dueDate: '2025-09-19',
    status: ArInvoiceStatus.Paid,
    customerCode: 'C-007',
    customerName: 'Kasikorn Bank Public Co., Ltd.',
    currencyCode: 'THB',
    totalAmount: 85000,
    paidAmount: 85000,
    balanceAmount: 0,
    lineCount: 2,
    createdAt: '2025-08-20T10:30:00Z',
  },
  {
    id: uuid('ariv', 9),
    invoiceNumber: 'AR-2025-0009',
    customerReference: 'PTTEP-CORP-AUG',
    invoiceDate: '2025-08-05',
    dueDate: '2025-09-04',
    status: ArInvoiceStatus.Paid,
    customerCode: 'C-008',
    customerName: 'PTT Exploration and Production',
    currencyCode: 'THB',
    totalAmount: 68000,
    paidAmount: 68000,
    balanceAmount: 0,
    lineCount: 2,
    createdAt: '2025-08-05T09:00:00Z',
  },
  {
    id: uuid('ariv', 10),
    invoiceNumber: 'AR-2025-0010',
    customerReference: 'ACC-STAY-JUL',
    invoiceDate: '2025-07-25',
    dueDate: '2025-08-24',
    status: ArInvoiceStatus.Paid,
    customerCode: 'C-001',
    customerName: 'Accenture Solutions (Thailand) Ltd.',
    currencyCode: 'THB',
    totalAmount: 95000,
    paidAmount: 95000,
    balanceAmount: 0,
    lineCount: 3,
    createdAt: '2025-07-25T11:00:00Z',
  },

  // ── Void ───────────────────────────────────────────────────────────────
  {
    id: uuid('ariv', 11),
    invoiceNumber: 'AR-2025-0011',
    customerReference: 'GE-CANCEL-SEP',
    invoiceDate: '2025-09-20',
    dueDate: '2025-10-20',
    status: ArInvoiceStatus.Void,
    customerCode: 'C-005',
    customerName: 'Grand Events & MICE Co., Ltd.',
    currencyCode: 'THB',
    totalAmount: 42000,
    paidAmount: 0,
    balanceAmount: 0,
    lineCount: 1,
    createdAt: '2025-09-20T14:00:00Z',
  },
  {
    id: uuid('ariv', 12),
    invoiceNumber: 'AR-2025-0012',
    customerReference: 'DUP-AGD-0815',
    invoiceDate: '2025-08-15',
    dueDate: '2025-09-14',
    status: ArInvoiceStatus.Void,
    customerCode: 'C-003',
    customerName: 'Agoda Company Pte. Ltd.',
    currencyCode: 'THB',
    totalAmount: 28000,
    paidAmount: 0,
    balanceAmount: 0,
    lineCount: 1,
    createdAt: '2025-08-15T09:30:00Z',
  },
]

// ---------------------------------------------------------------------------
// Unpaid AR Invoices (for receipt allocation screens)
// ---------------------------------------------------------------------------

export const mockUnpaidArInvoices: UnpaidArInvoiceDto[] = mockArInvoices
  .filter((inv) =>
    [ArInvoiceStatus.Approved, ArInvoiceStatus.PartiallyPaid].includes(inv.status),
  )
  .map((inv) => {
    const dueDateMs = new Date(inv.dueDate).getTime()
    const nowMs = new Date('2025-11-10').getTime()
    const daysOverdue = Math.max(0, Math.floor((nowMs - dueDateMs) / 86400000))
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerReference: inv.customerReference,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      currencyCode: inv.currencyCode,
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      balanceAmount: inv.balanceAmount,
      daysOverdue,
    }
  })
