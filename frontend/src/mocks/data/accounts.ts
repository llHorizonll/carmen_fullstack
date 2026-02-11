import type { AccountListDto, AccountLookupDto, AccountBalanceDto, TrialBalanceDto } from '@/features/general-ledger/accounts/types'
import { AccountType } from '@/features/general-ledger/accounts/types'
import { uuid } from './common'

// ---------------------------------------------------------------------------
// Chart of Accounts for a Thai Hotel
// ---------------------------------------------------------------------------

export const mockAccounts: AccountListDto[] = [
  // ── Assets (1xxx) ──────────────────────────────────────────────────────
  { id: uuid('acct', 1),  accountCode: '1000', accountName: 'Assets',                  accountType: AccountType.Asset,     level: 0, isHeader: true,  isActive: true, allowPosting: false },
  { id: uuid('acct', 2),  accountCode: '1100', accountName: 'Cash on Hand',            accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 3),  accountCode: '1110', accountName: 'Bank - Kasikorn',         accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 4),  accountCode: '1120', accountName: 'Bank - Bangkok Bank',     accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 5),  accountCode: '1130', accountName: 'Petty Cash',              accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 6),  accountCode: '1200', accountName: 'Accounts Receivable',     accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 7),  accountCode: '1300', accountName: 'Prepaid Expenses',        accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 8),  accountCode: '1310', accountName: 'Prepaid Insurance',       accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 9),  accountCode: '1400', accountName: 'Inventory - F&B',         accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 10), accountCode: '1410', accountName: 'Inventory - Supplies',    accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 11), accountCode: '1500', accountName: 'Fixed Assets',            accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 12), accountCode: '1510', accountName: 'Accumulated Depreciation',accountType: AccountType.Asset,     level: 1, isHeader: false, isActive: true, allowPosting: true },

  // ── Liabilities (2xxx) ─────────────────────────────────────────────────
  { id: uuid('acct', 13), accountCode: '2000', accountName: 'Liabilities',             accountType: AccountType.Liability, level: 0, isHeader: true,  isActive: true, allowPosting: false },
  { id: uuid('acct', 14), accountCode: '2100', accountName: 'Accounts Payable',        accountType: AccountType.Liability, level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 15), accountCode: '2200', accountName: 'Accrued Expenses',        accountType: AccountType.Liability, level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 16), accountCode: '2300', accountName: 'Unearned Revenue',        accountType: AccountType.Liability, level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 17), accountCode: '2400', accountName: 'Wages Payable',           accountType: AccountType.Liability, level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 18), accountCode: '2500', accountName: 'VAT Payable',             accountType: AccountType.Liability, level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 19), accountCode: '2510', accountName: 'WHT Payable',             accountType: AccountType.Liability, level: 1, isHeader: false, isActive: true, allowPosting: true },

  // ── Equity (3xxx) ──────────────────────────────────────────────────────
  { id: uuid('acct', 20), accountCode: '3000', accountName: 'Equity',                  accountType: AccountType.Equity,    level: 0, isHeader: true,  isActive: true, allowPosting: false },
  { id: uuid('acct', 21), accountCode: '3100', accountName: 'Share Capital',           accountType: AccountType.Equity,    level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 22), accountCode: '3200', accountName: 'Retained Earnings',       accountType: AccountType.Equity,    level: 1, isHeader: false, isActive: true, allowPosting: true },

  // ── Revenue (4xxx) ─────────────────────────────────────────────────────
  { id: uuid('acct', 23), accountCode: '4000', accountName: 'Revenue',                 accountType: AccountType.Revenue,   level: 0, isHeader: true,  isActive: true, allowPosting: false },
  { id: uuid('acct', 24), accountCode: '4100', accountName: 'Room Revenue',            accountType: AccountType.Revenue,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 25), accountCode: '4200', accountName: 'F&B Revenue',             accountType: AccountType.Revenue,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 26), accountCode: '4300', accountName: 'Banquet Revenue',         accountType: AccountType.Revenue,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 27), accountCode: '4400', accountName: 'Spa & Wellness Revenue',  accountType: AccountType.Revenue,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 28), accountCode: '4900', accountName: 'Other Revenue',           accountType: AccountType.Revenue,   level: 1, isHeader: false, isActive: true, allowPosting: true },

  // ── Expenses (5xxx) ────────────────────────────────────────────────────
  { id: uuid('acct', 29), accountCode: '5000', accountName: 'Expenses',                accountType: AccountType.Expense,   level: 0, isHeader: true,  isActive: true, allowPosting: false },
  { id: uuid('acct', 30), accountCode: '5100', accountName: 'Salaries - Front Office', accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 31), accountCode: '5110', accountName: 'Salaries - F&B',          accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 32), accountCode: '5120', accountName: 'Salaries - Housekeeping', accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 33), accountCode: '5200', accountName: 'Room Supplies',           accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 34), accountCode: '5300', accountName: 'Food Cost',               accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 35), accountCode: '5310', accountName: 'Beverage Cost',           accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 36), accountCode: '5400', accountName: 'Utilities',               accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 37), accountCode: '5500', accountName: 'Depreciation Expense',    accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 38), accountCode: '5600', accountName: 'Marketing & Advertising', accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 39), accountCode: '5700', accountName: 'Repairs & Maintenance',   accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 40), accountCode: '5800', accountName: 'Insurance Expense',       accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
  { id: uuid('acct', 41), accountCode: '5900', accountName: 'Office Supplies',         accountType: AccountType.Expense,   level: 1, isHeader: false, isActive: true, allowPosting: true },
]

// ---------------------------------------------------------------------------
// Lookup helper (dropdown-friendly subset)
// ---------------------------------------------------------------------------

export const mockAccountLookup: AccountLookupDto[] = mockAccounts
  .filter((a) => a.allowPosting)
  .map((a) => ({
    id: a.id,
    accountCode: a.accountCode,
    accountName: a.accountName,
    accountType: a.accountType,
  }))

// ---------------------------------------------------------------------------
// Trial Balance (as of Oct 2025 closing)
// ---------------------------------------------------------------------------

const trialBalanceAccounts: AccountBalanceDto[] = [
  { id: uuid('acct', 2),  accountCode: '1100', accountName: 'Cash on Hand',             accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 125000,    credit: 0,         balance: 125000 },
  { id: uuid('acct', 3),  accountCode: '1110', accountName: 'Bank - Kasikorn',          accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 3450000,   credit: 0,         balance: 3450000 },
  { id: uuid('acct', 4),  accountCode: '1120', accountName: 'Bank - Bangkok Bank',      accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 1280000,   credit: 0,         balance: 1280000 },
  { id: uuid('acct', 5),  accountCode: '1130', accountName: 'Petty Cash',               accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 15000,     credit: 0,         balance: 15000 },
  { id: uuid('acct', 6),  accountCode: '1200', accountName: 'Accounts Receivable',      accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 890000,    credit: 0,         balance: 890000 },
  { id: uuid('acct', 7),  accountCode: '1300', accountName: 'Prepaid Expenses',         accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 180000,    credit: 0,         balance: 180000 },
  { id: uuid('acct', 8),  accountCode: '1310', accountName: 'Prepaid Insurance',        accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 240000,    credit: 0,         balance: 240000 },
  { id: uuid('acct', 9),  accountCode: '1400', accountName: 'Inventory - F&B',          accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 420000,    credit: 0,         balance: 420000 },
  { id: uuid('acct', 10), accountCode: '1410', accountName: 'Inventory - Supplies',     accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 95000,     credit: 0,         balance: 95000 },
  { id: uuid('acct', 11), accountCode: '1500', accountName: 'Fixed Assets',             accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 15000000,  credit: 0,         balance: 15000000 },
  { id: uuid('acct', 12), accountCode: '1510', accountName: 'Accumulated Depreciation', accountType: AccountType.Asset,     level: 1, isHeader: false, debit: 0,         credit: 3750000,   balance: -3750000 },
  { id: uuid('acct', 14), accountCode: '2100', accountName: 'Accounts Payable',         accountType: AccountType.Liability, level: 1, isHeader: false, debit: 0,         credit: 685000,    balance: -685000 },
  { id: uuid('acct', 15), accountCode: '2200', accountName: 'Accrued Expenses',         accountType: AccountType.Liability, level: 1, isHeader: false, debit: 0,         credit: 320000,    balance: -320000 },
  { id: uuid('acct', 16), accountCode: '2300', accountName: 'Unearned Revenue',         accountType: AccountType.Liability, level: 1, isHeader: false, debit: 0,         credit: 450000,    balance: -450000 },
  { id: uuid('acct', 17), accountCode: '2400', accountName: 'Wages Payable',            accountType: AccountType.Liability, level: 1, isHeader: false, debit: 0,         credit: 280000,    balance: -280000 },
  { id: uuid('acct', 18), accountCode: '2500', accountName: 'VAT Payable',              accountType: AccountType.Liability, level: 1, isHeader: false, debit: 0,         credit: 195000,    balance: -195000 },
  { id: uuid('acct', 19), accountCode: '2510', accountName: 'WHT Payable',              accountType: AccountType.Liability, level: 1, isHeader: false, debit: 0,         credit: 42000,     balance: -42000 },
  { id: uuid('acct', 21), accountCode: '3100', accountName: 'Share Capital',            accountType: AccountType.Equity,    level: 1, isHeader: false, debit: 0,         credit: 10000000,  balance: -10000000 },
  { id: uuid('acct', 22), accountCode: '3200', accountName: 'Retained Earnings',        accountType: AccountType.Equity,    level: 1, isHeader: false, debit: 0,         credit: 2850000,   balance: -2850000 },
  { id: uuid('acct', 24), accountCode: '4100', accountName: 'Room Revenue',             accountType: AccountType.Revenue,   level: 1, isHeader: false, debit: 0,         credit: 8500000,   balance: -8500000 },
  { id: uuid('acct', 25), accountCode: '4200', accountName: 'F&B Revenue',              accountType: AccountType.Revenue,   level: 1, isHeader: false, debit: 0,         credit: 3200000,   balance: -3200000 },
  { id: uuid('acct', 26), accountCode: '4300', accountName: 'Banquet Revenue',          accountType: AccountType.Revenue,   level: 1, isHeader: false, debit: 0,         credit: 1800000,   balance: -1800000 },
  { id: uuid('acct', 27), accountCode: '4400', accountName: 'Spa & Wellness Revenue',   accountType: AccountType.Revenue,   level: 1, isHeader: false, debit: 0,         credit: 650000,    balance: -650000 },
  { id: uuid('acct', 28), accountCode: '4900', accountName: 'Other Revenue',            accountType: AccountType.Revenue,   level: 1, isHeader: false, debit: 0,         credit: 320000,    balance: -320000 },
  { id: uuid('acct', 30), accountCode: '5100', accountName: 'Salaries - Front Office',  accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 2400000,   credit: 0,         balance: 2400000 },
  { id: uuid('acct', 31), accountCode: '5110', accountName: 'Salaries - F&B',           accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 1850000,   credit: 0,         balance: 1850000 },
  { id: uuid('acct', 32), accountCode: '5120', accountName: 'Salaries - Housekeeping',  accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 1200000,   credit: 0,         balance: 1200000 },
  { id: uuid('acct', 33), accountCode: '5200', accountName: 'Room Supplies',            accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 380000,    credit: 0,         balance: 380000 },
  { id: uuid('acct', 34), accountCode: '5300', accountName: 'Food Cost',                accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 1120000,   credit: 0,         balance: 1120000 },
  { id: uuid('acct', 35), accountCode: '5310', accountName: 'Beverage Cost',            accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 480000,    credit: 0,         balance: 480000 },
  { id: uuid('acct', 36), accountCode: '5400', accountName: 'Utilities',                accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 850000,    credit: 0,         balance: 850000 },
  { id: uuid('acct', 37), accountCode: '5500', accountName: 'Depreciation Expense',     accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 750000,    credit: 0,         balance: 750000 },
  { id: uuid('acct', 38), accountCode: '5600', accountName: 'Marketing & Advertising',  accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 620000,    credit: 0,         balance: 620000 },
  { id: uuid('acct', 39), accountCode: '5700', accountName: 'Repairs & Maintenance',    accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 340000,    credit: 0,         balance: 340000 },
  { id: uuid('acct', 40), accountCode: '5800', accountName: 'Insurance Expense',        accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 200000,    credit: 0,         balance: 200000 },
  { id: uuid('acct', 41), accountCode: '5900', accountName: 'Office Supplies',          accountType: AccountType.Expense,   level: 1, isHeader: false, debit: 87000,     credit: 0,         balance: 87000 },
]

const totalDebit = trialBalanceAccounts.reduce((sum, a) => sum + a.debit, 0)
const totalCredit = trialBalanceAccounts.reduce((sum, a) => sum + a.credit, 0)

export const mockTrialBalance: TrialBalanceDto = {
  asOfDate: '2025-10-31',
  fiscalPeriodId: uuid('fprd', 10),
  fiscalPeriodName: 'October 2025',
  accounts: trialBalanceAccounts,
  totalDebit,
  totalCredit,
  isBalanced: totalDebit === totalCredit,
}
