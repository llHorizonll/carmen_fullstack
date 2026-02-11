// Account Types
export enum AccountType {
  Asset = 1,
  Liability = 2,
  Equity = 3,
  Revenue = 4,
  Expense = 5,
}

export const accountTypeLabels: Record<AccountType, string> = {
  [AccountType.Asset]: "Asset",
  [AccountType.Liability]: "Liability",
  [AccountType.Equity]: "Equity",
  [AccountType.Revenue]: "Revenue",
  [AccountType.Expense]: "Expense",
}

// Account DTOs
export interface AccountDto {
  id: string
  accountCode: string
  accountName: string
  accountNameLocal?: string
  accountType: AccountType
  parentAccountId?: string
  parentAccountCode?: string
  parentAccountName?: string
  level: number
  isHeader: boolean
  isActive: boolean
  description?: string
  currencyCode: string
  allowPosting: boolean
  createdAt: string
  updatedAt?: string
}

export interface AccountListDto {
  id: string
  accountCode: string
  accountName: string
  accountType: AccountType
  level: number
  isHeader: boolean
  isActive: boolean
  allowPosting: boolean
}

export interface AccountTreeDto {
  id: string
  accountCode: string
  accountName: string
  accountType: AccountType
  level: number
  isHeader: boolean
  isActive: boolean
  allowPosting: boolean
  children: AccountTreeDto[]
}

export interface AccountLookupDto {
  id: string
  accountCode: string
  accountName: string
  accountType: AccountType
}

// Request DTOs
export interface CreateAccountRequest {
  accountCode: string
  accountName: string
  accountNameLocal?: string
  accountType: AccountType
  parentAccountId?: string
  isHeader: boolean
  description?: string
  currencyCode: string
  allowPosting: boolean
}

export interface UpdateAccountRequest {
  accountName: string
  accountNameLocal?: string
  parentAccountId?: string
  isHeader: boolean
  description?: string
  currencyCode: string
  allowPosting: boolean
  isActive: boolean
}

// Query Parameters
export interface AccountQueryParams {
  search?: string
  accountType?: AccountType
  isActive?: boolean
  isHeader?: boolean
  parentAccountId?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDescending?: boolean
}

// Paginated Response
export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// Account Summary DTOs
export interface AccountSummaryDto {
  id: string
  accountCode: string
  accountName: string
  accountType: AccountType
  openingBalance: number
  totalDebit: number
  totalCredit: number
  closingBalance: number
  asOfDate: string
}

export interface AccountBalanceDto {
  id: string
  accountCode: string
  accountName: string
  accountType: AccountType
  level: number
  isHeader: boolean
  debit: number
  credit: number
  balance: number
}

export interface AccountLedgerDto {
  accountId: string
  accountCode: string
  accountName: string
  accountType: AccountType
  fromDate: string
  toDate: string
  openingBalance: number
  transactions: AccountLedgerLineDto[]
  closingBalance: number
}

export interface AccountLedgerLineDto {
  date: string
  voucherNumber: string
  voucherId: string
  description?: string
  debit: number
  credit: number
  runningBalance: number
}

export interface TrialBalanceDto {
  asOfDate: string
  fiscalPeriodId?: string
  fiscalPeriodName?: string
  accounts: AccountBalanceDto[]
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
}
