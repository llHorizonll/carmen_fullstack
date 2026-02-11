import type { RecurringVoucherListDto, RecurringVoucherDto, RecurringVoucherLineDto } from '@/features/general-ledger/recurring-vouchers/types'
import { uuid } from './common'

// ---------------------------------------------------------------------------
// Helper to build recurring voucher lines
// ---------------------------------------------------------------------------

function rvLine(
  lineNumber: number,
  accountCode: string,
  accountName: string,
  debit: number,
  credit: number,
  description?: string,
): RecurringVoucherLineDto {
  const accountIdMap: Record<string, number> = {
    '1310': 8, '1510': 12, '2200': 15, '2400': 17,
    '5100': 30, '5110': 31, '5120': 32,
    '5400': 36, '5500': 37, '5800': 40, '5900': 41,
  }
  const acctIdx = accountIdMap[accountCode] ?? 1
  return {
    id: uuid('rvln', lineNumber + Math.random() * 10000),
    lineNumber,
    accountId: uuid('acct', acctIdx),
    accountCode,
    accountName,
    debitAmount: debit,
    creditAmount: credit,
    description,
  }
}

// ---------------------------------------------------------------------------
// ~5 Recurring Voucher Templates
// ---------------------------------------------------------------------------

export const mockRecurringVouchers: RecurringVoucherDto[] = [
  // ── 1. Monthly Depreciation ────────────────────────────────────────────
  {
    id: uuid('rcvr', 1),
    name: 'Monthly Depreciation',
    description: 'Fixed asset depreciation posted monthly',
    frequency: 1, // Monthly
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    nextExecutionDate: '2025-11-30',
    lastExecutionDate: '2025-10-31',
    isActive: true,
    currencyCode: 'THB',
    exchangeRate: 1,
    reference: 'RV-DEP-001',
    totalDebit: 75000,
    totalCredit: 75000,
    executionCount: 10,
    lines: [
      rvLine(1, '5500', 'Depreciation Expense', 75000, 0, 'Monthly depreciation'),
      rvLine(2, '1510', 'Accumulated Depreciation', 0, 75000, 'Accum. depreciation'),
    ],
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'admin@carmen.hotel',
    updatedAt: '2025-10-31T18:00:00Z',
  },

  // ── 2. Monthly Insurance Amortization ──────────────────────────────────
  {
    id: uuid('rcvr', 2),
    name: 'Insurance Premium Amortization',
    description: 'Monthly amortization of annual insurance premium',
    frequency: 1, // Monthly
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    nextExecutionDate: '2025-11-30',
    lastExecutionDate: '2025-10-31',
    isActive: true,
    currencyCode: 'THB',
    exchangeRate: 1,
    reference: 'RV-INS-001',
    totalDebit: 20000,
    totalCredit: 20000,
    executionCount: 10,
    lines: [
      rvLine(1, '5800', 'Insurance Expense', 20000, 0, 'Monthly insurance amortization'),
      rvLine(2, '1310', 'Prepaid Insurance', 0, 20000, 'Prepaid insurance drawdown'),
    ],
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'admin@carmen.hotel',
    updatedAt: '2025-10-31T18:15:00Z',
  },

  // ── 3. Monthly Salary Accrual ──────────────────────────────────────────
  {
    id: uuid('rcvr', 3),
    name: 'Monthly Salary Accrual',
    description: 'Accrual of monthly staff salaries across departments',
    frequency: 1, // Monthly
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    nextExecutionDate: '2025-11-30',
    lastExecutionDate: '2025-10-31',
    isActive: true,
    currencyCode: 'THB',
    exchangeRate: 1,
    reference: 'RV-SAL-001',
    totalDebit: 545000,
    totalCredit: 545000,
    executionCount: 10,
    lines: [
      rvLine(1, '5100', 'Salaries - Front Office', 240000, 0, 'FO staff salaries'),
      rvLine(2, '5110', 'Salaries - F&B', 185000, 0, 'F&B staff salaries'),
      rvLine(3, '5120', 'Salaries - Housekeeping', 120000, 0, 'HK staff salaries'),
      rvLine(4, '2400', 'Wages Payable', 0, 545000, 'Total salaries payable'),
    ],
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'admin@carmen.hotel',
    updatedAt: '2025-10-31T16:00:00Z',
  },

  // ── 4. Quarterly Office Supplies Accrual ───────────────────────────────
  {
    id: uuid('rcvr', 4),
    name: 'Quarterly Office Supplies Accrual',
    description: 'Quarterly accrual for general office supplies',
    frequency: 2, // Quarterly
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    nextExecutionDate: '2025-12-31',
    lastExecutionDate: '2025-09-30',
    isActive: true,
    currencyCode: 'THB',
    exchangeRate: 1,
    reference: 'RV-OFC-001',
    totalDebit: 29000,
    totalCredit: 29000,
    executionCount: 3,
    lines: [
      rvLine(1, '5900', 'Office Supplies', 29000, 0, 'Quarterly office supplies'),
      rvLine(2, '2200', 'Accrued Expenses', 0, 29000, 'Office supply accrual'),
    ],
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'admin@carmen.hotel',
    updatedAt: '2025-09-30T17:00:00Z',
  },

  // ── 5. Monthly Utility Accrual (inactive) ──────────────────────────────
  {
    id: uuid('rcvr', 5),
    name: 'Monthly Utility Accrual (Superseded)',
    description: 'Old utility accrual template - replaced by actual invoices',
    frequency: 1, // Monthly
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    nextExecutionDate: '2025-07-31',
    lastExecutionDate: '2025-06-30',
    isActive: false,
    currencyCode: 'THB',
    exchangeRate: 1,
    reference: 'RV-UTL-001',
    totalDebit: 85000,
    totalCredit: 85000,
    executionCount: 6,
    lines: [
      rvLine(1, '5400', 'Utilities', 85000, 0, 'Monthly utility estimate'),
      rvLine(2, '2200', 'Accrued Expenses', 0, 85000, 'Utility accrual'),
    ],
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'admin@carmen.hotel',
    updatedAt: '2025-07-01T10:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// List DTO projection (for table views)
// ---------------------------------------------------------------------------

export const mockRecurringVoucherList: RecurringVoucherListDto[] = mockRecurringVouchers.map((rv) => ({
  id: rv.id,
  name: rv.name,
  description: rv.description,
  frequency: rv.frequency,
  nextExecutionDate: rv.nextExecutionDate,
  lastExecutionDate: rv.lastExecutionDate,
  isActive: rv.isActive,
  currencyCode: rv.currencyCode,
  totalDebit: rv.totalDebit,
  totalCredit: rv.totalCredit,
  executionCount: rv.executionCount,
  lineCount: rv.lines.length,
  createdAt: rv.createdAt,
}))
