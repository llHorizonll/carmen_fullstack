import type { JournalVoucherListDto, JournalVoucherDto, JournalVoucherLineDto } from '@/features/general-ledger/journal-vouchers/types'
import { DocumentStatus, VoucherType } from '@/features/general-ledger/journal-vouchers/types'
import { uuid } from './common'

// ---------------------------------------------------------------------------
// Helper to build a full JV with balanced lines
// ---------------------------------------------------------------------------

function line(
  lineNumber: number,
  accountCode: string,
  accountName: string,
  debit: number,
  credit: number,
  description?: string,
): JournalVoucherLineDto {
  const accountIndex = parseInt(accountCode.charAt(1) + accountCode.charAt(2) + accountCode.charAt(3), 10)
  // Map account codes to their mock account IDs based on the accounts.ts ordering
  const accountIdMap: Record<string, number> = {
    '1100': 2, '1110': 3, '1120': 4, '1130': 5, '1200': 6, '1300': 7, '1310': 8,
    '1400': 9, '1410': 10, '1500': 11, '1510': 12,
    '2100': 14, '2200': 15, '2300': 16, '2400': 17, '2500': 18, '2510': 19,
    '3100': 21, '3200': 22,
    '4100': 24, '4200': 25, '4300': 26, '4400': 27, '4900': 28,
    '5100': 30, '5110': 31, '5120': 32, '5200': 33, '5300': 34, '5310': 35,
    '5400': 36, '5500': 37, '5600': 38, '5700': 39, '5800': 40, '5900': 41,
  }
  const acctIdx = accountIdMap[accountCode] ?? accountIndex
  return {
    id: uuid('jvln', lineNumber + Math.random() * 10000),
    lineNumber,
    accountId: uuid('acct', acctIdx),
    accountCode,
    accountName,
    debitAmount: debit,
    creditAmount: credit,
    debitAmountBase: debit,
    creditAmountBase: credit,
    description,
  }
}

// ---------------------------------------------------------------------------
// ~12 Journal Vouchers (mix of General/Recurring, Draft/Posted/Approved)
// ---------------------------------------------------------------------------

export const mockJournalVouchers: JournalVoucherDto[] = [
  // ── 1. Room Revenue Recognition (Posted) ───────────────────────────────
  {
    id: uuid('jvou', 1),
    voucherNumber: 'JV-2025-0001',
    voucherDate: '2025-10-31',
    postingDate: '2025-10-31',
    voucherType: VoucherType.General,
    status: DocumentStatus.Posted,
    description: 'Room revenue recognition - October 2025',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 850000,
    totalCredit: 850000,
    fiscalPeriodId: uuid('fprd', 10),
    fiscalPeriodName: 'October 2025',
    postedAt: '2025-11-01T08:00:00Z',
    postedBy: 'admin@carmen.hotel',
    lines: [
      line(1, '1200', 'Accounts Receivable', 850000, 0, 'AR from room bookings'),
      line(2, '4100', 'Room Revenue', 0, 850000, 'Room revenue Oct 2025'),
    ],
    createdAt: '2025-10-31T17:00:00Z',
    createdBy: 'admin@carmen.hotel',
  },

  // ── 2. F&B Revenue (Posted) ────────────────────────────────────────────
  {
    id: uuid('jvou', 2),
    voucherNumber: 'JV-2025-0002',
    voucherDate: '2025-10-31',
    postingDate: '2025-10-31',
    voucherType: VoucherType.General,
    status: DocumentStatus.Posted,
    description: 'F&B revenue recognition - October 2025',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 320000,
    totalCredit: 320000,
    fiscalPeriodId: uuid('fprd', 10),
    fiscalPeriodName: 'October 2025',
    postedAt: '2025-11-01T08:15:00Z',
    postedBy: 'admin@carmen.hotel',
    lines: [
      line(1, '1100', 'Cash on Hand', 120000, 0, 'Cash F&B sales'),
      line(2, '1200', 'Accounts Receivable', 200000, 0, 'Charged to room'),
      line(3, '4200', 'F&B Revenue', 0, 320000, 'F&B revenue Oct 2025'),
    ],
    createdAt: '2025-10-31T17:30:00Z',
    createdBy: 'admin@carmen.hotel',
  },

  // ── 3. Depreciation (Recurring, Posted) ────────────────────────────────
  {
    id: uuid('jvou', 3),
    voucherNumber: 'JV-2025-0003',
    voucherDate: '2025-10-31',
    postingDate: '2025-10-31',
    voucherType: VoucherType.Recurring,
    status: DocumentStatus.Posted,
    description: 'Monthly depreciation - October 2025',
    reference: 'RV-DEP-001',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 75000,
    totalCredit: 75000,
    fiscalPeriodId: uuid('fprd', 10),
    fiscalPeriodName: 'October 2025',
    postedAt: '2025-11-01T08:30:00Z',
    postedBy: 'admin@carmen.hotel',
    lines: [
      line(1, '5500', 'Depreciation Expense', 75000, 0, 'Monthly depreciation'),
      line(2, '1510', 'Accumulated Depreciation', 0, 75000, 'Monthly depreciation'),
    ],
    createdAt: '2025-10-31T18:00:00Z',
    createdBy: 'system@carmen.hotel',
  },

  // ── 4. Salary Accrual (Posted) ─────────────────────────────────────────
  {
    id: uuid('jvou', 4),
    voucherNumber: 'JV-2025-0004',
    voucherDate: '2025-10-31',
    postingDate: '2025-10-31',
    voucherType: VoucherType.General,
    status: DocumentStatus.Posted,
    description: 'Salary accrual - October 2025',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 545000,
    totalCredit: 545000,
    fiscalPeriodId: uuid('fprd', 10),
    fiscalPeriodName: 'October 2025',
    postedAt: '2025-11-02T10:00:00Z',
    postedBy: 'admin@carmen.hotel',
    lines: [
      line(1, '5100', 'Salaries - Front Office', 240000, 0, 'FO salaries Oct'),
      line(2, '5110', 'Salaries - F&B', 185000, 0, 'F&B salaries Oct'),
      line(3, '5120', 'Salaries - Housekeeping', 120000, 0, 'HK salaries Oct'),
      line(4, '2400', 'Wages Payable', 0, 545000, 'Salaries payable Oct'),
    ],
    createdAt: '2025-10-31T16:00:00Z',
    createdBy: 'admin@carmen.hotel',
  },

  // ── 5. Utility Expense (Posted) ────────────────────────────────────────
  {
    id: uuid('jvou', 5),
    voucherNumber: 'JV-2025-0005',
    voucherDate: '2025-10-20',
    postingDate: '2025-10-20',
    voucherType: VoucherType.General,
    status: DocumentStatus.Posted,
    description: 'Monthly electricity bill - October 2025',
    reference: 'MEA-BIL-2510',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 78300,
    totalCredit: 78300,
    fiscalPeriodId: uuid('fprd', 10),
    fiscalPeriodName: 'October 2025',
    postedAt: '2025-10-22T09:00:00Z',
    postedBy: 'admin@carmen.hotel',
    lines: [
      line(1, '5400', 'Utilities', 78300, 0, 'Electricity Oct 2025'),
      line(2, '2100', 'Accounts Payable', 0, 78300, 'AP - MEA'),
    ],
    createdAt: '2025-10-20T08:30:00Z',
    createdBy: 'accountant@carmen.hotel',
  },

  // ── 6. Insurance Amortization (Recurring, Posted) ──────────────────────
  {
    id: uuid('jvou', 6),
    voucherNumber: 'JV-2025-0006',
    voucherDate: '2025-10-31',
    postingDate: '2025-10-31',
    voucherType: VoucherType.Recurring,
    status: DocumentStatus.Posted,
    description: 'Monthly insurance amortization - October 2025',
    reference: 'RV-INS-001',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 20000,
    totalCredit: 20000,
    fiscalPeriodId: uuid('fprd', 10),
    fiscalPeriodName: 'October 2025',
    postedAt: '2025-11-01T08:45:00Z',
    postedBy: 'admin@carmen.hotel',
    lines: [
      line(1, '5800', 'Insurance Expense', 20000, 0, 'Monthly insurance'),
      line(2, '1310', 'Prepaid Insurance', 0, 20000, 'Amortization of prepaid'),
    ],
    createdAt: '2025-10-31T18:15:00Z',
    createdBy: 'system@carmen.hotel',
  },

  // ── 7. Banquet Revenue (Approved) ──────────────────────────────────────
  {
    id: uuid('jvou', 7),
    voucherNumber: 'JV-2025-0007',
    voucherDate: '2025-11-05',
    postingDate: '2025-11-05',
    voucherType: VoucherType.General,
    status: DocumentStatus.Approved,
    description: 'Banquet event revenue - Toyota conference',
    reference: 'EVT-2025-042',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 250000,
    totalCredit: 250000,
    fiscalPeriodId: uuid('fprd', 11),
    fiscalPeriodName: 'November 2025',
    approvedAt: '2025-11-06T09:00:00Z',
    approvedBy: 'manager@carmen.hotel',
    lines: [
      line(1, '1200', 'Accounts Receivable', 250000, 0, 'AR - Toyota conference'),
      line(2, '4300', 'Banquet Revenue', 0, 180000, 'Banquet hall rental'),
      line(3, '4200', 'F&B Revenue', 0, 70000, 'Catering for conference'),
    ],
    createdAt: '2025-11-05T15:00:00Z',
    createdBy: 'accountant@carmen.hotel',
  },

  // ── 8. Marketing Expense (Approved) ────────────────────────────────────
  {
    id: uuid('jvou', 8),
    voucherNumber: 'JV-2025-0008',
    voucherDate: '2025-11-03',
    postingDate: '2025-11-03',
    voucherType: VoucherType.General,
    status: DocumentStatus.Approved,
    description: 'Online advertising campaign - Q4 2025',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 62000,
    totalCredit: 62000,
    fiscalPeriodId: uuid('fprd', 11),
    fiscalPeriodName: 'November 2025',
    approvedAt: '2025-11-04T10:30:00Z',
    approvedBy: 'manager@carmen.hotel',
    lines: [
      line(1, '5600', 'Marketing & Advertising', 62000, 0, 'Google/Facebook ads Q4'),
      line(2, '1110', 'Bank - Kasikorn', 0, 62000, 'Payment for ad campaign'),
    ],
    createdAt: '2025-11-03T11:00:00Z',
    createdBy: 'accountant@carmen.hotel',
  },

  // ── 9. Food Cost (Draft) ───────────────────────────────────────────────
  {
    id: uuid('jvou', 9),
    voucherNumber: 'JV-2025-0009',
    voucherDate: '2025-11-08',
    postingDate: '2025-11-08',
    voucherType: VoucherType.General,
    status: DocumentStatus.Draft,
    description: 'Food cost adjustment - November week 1',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 45800,
    totalCredit: 45800,
    fiscalPeriodId: uuid('fprd', 11),
    fiscalPeriodName: 'November 2025',
    lines: [
      line(1, '5300', 'Food Cost', 45800, 0, 'Food cost adjustment'),
      line(2, '1400', 'Inventory - F&B', 0, 45800, 'Inventory consumption'),
    ],
    createdAt: '2025-11-08T09:00:00Z',
    createdBy: 'accountant@carmen.hotel',
  },

  // ── 10. Room Supplies (Draft) ──────────────────────────────────────────
  {
    id: uuid('jvou', 10),
    voucherNumber: 'JV-2025-0010',
    voucherDate: '2025-11-07',
    postingDate: '2025-11-07',
    voucherType: VoucherType.General,
    status: DocumentStatus.Draft,
    description: 'Room supply consumption - November week 1',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 12350,
    totalCredit: 12350,
    fiscalPeriodId: uuid('fprd', 11),
    fiscalPeriodName: 'November 2025',
    lines: [
      line(1, '5200', 'Room Supplies', 12350, 0, 'Guest amenities consumed'),
      line(2, '1410', 'Inventory - Supplies', 0, 12350, 'Supply inventory drawn'),
    ],
    createdAt: '2025-11-07T14:30:00Z',
    createdBy: 'accountant@carmen.hotel',
  },

  // ── 11. Maintenance Repair (Pending) ───────────────────────────────────
  {
    id: uuid('jvou', 11),
    voucherNumber: 'JV-2025-0011',
    voucherDate: '2025-11-06',
    postingDate: '2025-11-06',
    voucherType: VoucherType.General,
    status: DocumentStatus.Pending,
    description: 'Emergency AC repair - 5th floor',
    reference: 'MNT-2025-089',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 48200,
    totalCredit: 48200,
    fiscalPeriodId: uuid('fprd', 11),
    fiscalPeriodName: 'November 2025',
    lines: [
      line(1, '5700', 'Repairs & Maintenance', 48200, 0, 'AC repair 5th floor'),
      line(2, '2100', 'Accounts Payable', 0, 48200, 'AP - SCG'),
    ],
    createdAt: '2025-11-06T16:45:00Z',
    createdBy: 'accountant@carmen.hotel',
  },

  // ── 12. Spa Revenue (Draft) ────────────────────────────────────────────
  {
    id: uuid('jvou', 12),
    voucherNumber: 'JV-2025-0012',
    voucherDate: '2025-11-09',
    postingDate: '2025-11-09',
    voucherType: VoucherType.General,
    status: DocumentStatus.Draft,
    description: 'Spa & wellness revenue - November week 1',
    currencyCode: 'THB',
    exchangeRate: 1,
    totalDebit: 65000,
    totalCredit: 65000,
    fiscalPeriodId: uuid('fprd', 11),
    fiscalPeriodName: 'November 2025',
    lines: [
      line(1, '1100', 'Cash on Hand', 25000, 0, 'Cash spa payments'),
      line(2, '1200', 'Accounts Receivable', 40000, 0, 'Charged to room'),
      line(3, '4400', 'Spa & Wellness Revenue', 0, 65000, 'Spa revenue week 1 Nov'),
    ],
    createdAt: '2025-11-09T18:00:00Z',
    createdBy: 'accountant@carmen.hotel',
  },
]

// ---------------------------------------------------------------------------
// List DTO projection (for table views)
// ---------------------------------------------------------------------------

export const mockJournalVoucherList: JournalVoucherListDto[] = mockJournalVouchers.map((jv) => ({
  id: jv.id,
  voucherNumber: jv.voucherNumber,
  voucherDate: jv.voucherDate,
  postingDate: jv.postingDate,
  voucherType: jv.voucherType,
  status: jv.status,
  description: jv.description,
  currencyCode: jv.currencyCode,
  totalDebit: jv.totalDebit,
  totalCredit: jv.totalCredit,
  lineCount: jv.lines.length,
  createdAt: jv.createdAt,
  createdBy: jv.createdBy,
}))
