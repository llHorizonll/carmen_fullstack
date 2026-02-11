import type { ArReceiptListDto } from '@/features/accounts-receivable/receipts/types'
import { ArReceiptStatus, ReceiptMethod } from '@/features/accounts-receivable/receipts/types'
import { uuid } from './common'

// ---------------------------------------------------------------------------
// ~6 AR Receipts  (mix of BankTransfer, Check, CreditCard; various statuses)
// ---------------------------------------------------------------------------

export const mockArReceipts: ArReceiptListDto[] = [
  // ── Draft ──────────────────────────────────────────────────────────────
  {
    id: uuid('arrc', 1),
    receiptNumber: 'RC-2025-0001',
    receiptDate: '2025-11-09',
    status: ArReceiptStatus.Draft,
    customerCode: 'C-003',
    customerName: 'Agoda Company Pte. Ltd.',
    receiptMethod: ReceiptMethod.BankTransfer,
    currencyCode: 'THB',
    totalAmount: 98500,
    bankAccountCode: '1110',
    allocationCount: 1,
    createdAt: '2025-11-09T10:00:00Z',
  },

  // ── Pending ────────────────────────────────────────────────────────────
  {
    id: uuid('arrc', 2),
    receiptNumber: 'RC-2025-0002',
    receiptDate: '2025-11-05',
    status: ArReceiptStatus.Pending,
    customerCode: 'C-006',
    customerName: 'Ministry of Tourism and Sports',
    receiptMethod: ReceiptMethod.Check,
    checkNumber: 'GOV-CHK-88120',
    currencyCode: 'THB',
    totalAmount: 150000,
    bankAccountCode: '1120',
    allocationCount: 1,
    createdAt: '2025-11-05T14:15:00Z',
  },

  // ── Posted ─────────────────────────────────────────────────────────────
  {
    id: uuid('arrc', 3),
    receiptNumber: 'RC-2025-0003',
    receiptDate: '2025-10-15',
    status: ArReceiptStatus.Posted,
    customerCode: 'C-002',
    customerName: 'Toyota Motor Thailand Co., Ltd.',
    receiptMethod: ReceiptMethod.BankTransfer,
    currencyCode: 'THB',
    totalAmount: 100000,
    bankAccountCode: '1110',
    allocationCount: 1,
    createdAt: '2025-10-15T09:30:00Z',
  },
  {
    id: uuid('arrc', 4),
    receiptNumber: 'RC-2025-0004',
    receiptDate: '2025-09-20',
    status: ArReceiptStatus.Posted,
    customerCode: 'C-007',
    customerName: 'Kasikorn Bank Public Co., Ltd.',
    receiptMethod: ReceiptMethod.BankTransfer,
    currencyCode: 'THB',
    totalAmount: 85000,
    bankAccountCode: '1110',
    allocationCount: 1,
    createdAt: '2025-09-20T11:00:00Z',
  },
  {
    id: uuid('arrc', 5),
    receiptNumber: 'RC-2025-0005',
    receiptDate: '2025-09-05',
    status: ArReceiptStatus.Posted,
    customerCode: 'C-008',
    customerName: 'PTT Exploration and Production',
    receiptMethod: ReceiptMethod.CreditCard,
    currencyCode: 'THB',
    totalAmount: 68000,
    bankAccountCode: '1110',
    allocationCount: 1,
    createdAt: '2025-09-05T08:45:00Z',
  },

  // ── Void ───────────────────────────────────────────────────────────────
  {
    id: uuid('arrc', 6),
    receiptNumber: 'RC-2025-0006',
    receiptDate: '2025-09-22',
    status: ArReceiptStatus.Void,
    customerCode: 'C-004',
    customerName: 'Booking.com B.V.',
    receiptMethod: ReceiptMethod.BankTransfer,
    currencyCode: 'THB',
    totalAmount: 30000,
    bankAccountCode: '1110',
    allocationCount: 1,
    createdAt: '2025-09-22T16:00:00Z',
  },
]
