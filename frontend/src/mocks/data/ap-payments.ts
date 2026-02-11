import type { ApPaymentListDto } from '@/features/accounts-payable/payments/types'
import { ApPaymentStatus, PaymentMethod } from '@/features/accounts-payable/payments/types'
import { uuid } from './common'

// ---------------------------------------------------------------------------
// ~8 AP Payments  (mix of BankTransfer & Check, various statuses)
// ---------------------------------------------------------------------------

export const mockApPayments: ApPaymentListDto[] = [
  // ── Draft ──────────────────────────────────────────────────────────────
  {
    id: uuid('appm', 1),
    paymentNumber: 'PV-2025-0001',
    paymentDate: '2025-11-08',
    status: ApPaymentStatus.Draft,
    vendorCode: 'V-001',
    vendorName: 'Siam Makro Public Co., Ltd.',
    paymentMethod: PaymentMethod.BankTransfer,
    currencyCode: 'THB',
    totalAmount: 52400,
    bankAccountCode: '1110',
    allocationCount: 1,
    createdAt: '2025-11-08T10:00:00Z',
  },

  // ── Pending ────────────────────────────────────────────────────────────
  {
    id: uuid('appm', 2),
    paymentNumber: 'PV-2025-0002',
    paymentDate: '2025-11-06',
    status: ApPaymentStatus.Pending,
    vendorCode: 'V-006',
    vendorName: 'Metropolitan Electricity Authority',
    paymentMethod: PaymentMethod.BankTransfer,
    currencyCode: 'THB',
    totalAmount: 78300,
    bankAccountCode: '1110',
    allocationCount: 1,
    createdAt: '2025-11-06T09:30:00Z',
  },

  // ── Approved ───────────────────────────────────────────────────────────
  {
    id: uuid('appm', 3),
    paymentNumber: 'PV-2025-0003',
    paymentDate: '2025-10-25',
    status: ApPaymentStatus.Approved,
    vendorCode: 'V-002',
    vendorName: 'CP Foods Public Co., Ltd.',
    paymentMethod: PaymentMethod.Check,
    checkNumber: 'CHK-00451',
    currencyCode: 'THB',
    totalAmount: 35000,
    bankAccountCode: '1120',
    allocationCount: 1,
    createdAt: '2025-10-25T14:00:00Z',
  },

  // ── Posted ─────────────────────────────────────────────────────────────
  {
    id: uuid('appm', 4),
    paymentNumber: 'PV-2025-0004',
    paymentDate: '2025-09-28',
    status: ApPaymentStatus.Posted,
    vendorCode: 'V-003',
    vendorName: 'Thai Cleaning Products Co., Ltd.',
    paymentMethod: PaymentMethod.BankTransfer,
    currencyCode: 'THB',
    totalAmount: 18200,
    bankAccountCode: '1110',
    allocationCount: 1,
    createdAt: '2025-09-28T10:15:00Z',
  },
  {
    id: uuid('appm', 5),
    paymentNumber: 'PV-2025-0005',
    paymentDate: '2025-09-15',
    status: ApPaymentStatus.Posted,
    vendorCode: 'V-001',
    vendorName: 'Siam Makro Public Co., Ltd.',
    paymentMethod: PaymentMethod.BankTransfer,
    currencyCode: 'THB',
    totalAmount: 50000,
    bankAccountCode: '1110',
    allocationCount: 1,
    createdAt: '2025-09-15T08:30:00Z',
  },
  {
    id: uuid('appm', 6),
    paymentNumber: 'PV-2025-0006',
    paymentDate: '2025-08-30',
    status: ApPaymentStatus.Posted,
    vendorCode: 'V-009',
    vendorName: 'AIS (Advanced Info Service)',
    paymentMethod: PaymentMethod.BankTransfer,
    currencyCode: 'THB',
    totalAmount: 8900,
    bankAccountCode: '1110',
    allocationCount: 1,
    createdAt: '2025-08-30T11:00:00Z',
  },
  {
    id: uuid('appm', 7),
    paymentNumber: 'PV-2025-0007',
    paymentDate: '2025-09-18',
    status: ApPaymentStatus.Posted,
    vendorCode: 'V-007',
    vendorName: 'Provincial Waterworks Authority',
    paymentMethod: PaymentMethod.Check,
    checkNumber: 'CHK-00449',
    currencyCode: 'THB',
    totalAmount: 12400,
    bankAccountCode: '1120',
    allocationCount: 1,
    createdAt: '2025-09-18T09:00:00Z',
  },

  // ── Void ───────────────────────────────────────────────────────────────
  {
    id: uuid('appm', 8),
    paymentNumber: 'PV-2025-0008',
    paymentDate: '2025-09-10',
    status: ApPaymentStatus.Void,
    vendorCode: 'V-004',
    vendorName: 'Bangkok Linen Supply Co., Ltd.',
    paymentMethod: PaymentMethod.Check,
    checkNumber: 'CHK-00447',
    currencyCode: 'THB',
    totalAmount: 22000,
    bankAccountCode: '1120',
    allocationCount: 1,
    createdAt: '2025-09-10T15:30:00Z',
  },
]
