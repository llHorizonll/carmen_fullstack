export type RecurringFrequency = 1 | 2 | 3 | 4 | 99

export const RecurringFrequencyLabels: Record<RecurringFrequency, string> = {
  1: "Monthly",
  2: "Quarterly",
  3: "Semi-Annually",
  4: "Annually",
  99: "Custom",
}

export interface RecurringVoucherDto {
  id: string
  name: string
  description?: string
  frequency: RecurringFrequency
  customIntervalDays?: number
  startDate: string
  endDate?: string
  nextExecutionDate: string
  lastExecutionDate?: string
  isActive: boolean
  currencyCode: string
  exchangeRate: number
  reference?: string
  totalDebit: number
  totalCredit: number
  executionCount: number
  lines: RecurringVoucherLineDto[]
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export interface RecurringVoucherListDto {
  id: string
  name: string
  description?: string
  frequency: RecurringFrequency
  nextExecutionDate: string
  lastExecutionDate?: string
  isActive: boolean
  currencyCode: string
  totalDebit: number
  totalCredit: number
  executionCount: number
  lineCount: number
  createdAt: string
}

export interface RecurringVoucherLineDto {
  id: string
  lineNumber: number
  accountId: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  description?: string
  reference?: string
  departmentId?: string
  departmentName?: string
}

export interface CreateRecurringVoucherRequest {
  name: string
  description?: string
  frequency: RecurringFrequency
  customIntervalDays?: number
  startDate: string
  endDate?: string
  currencyCode: string
  exchangeRate: number
  reference?: string
  lines: CreateRecurringVoucherLineRequest[]
}

export interface CreateRecurringVoucherLineRequest {
  accountId: string
  debitAmount: number
  creditAmount: number
  description?: string
  reference?: string
  departmentId?: string
}

export interface UpdateRecurringVoucherRequest {
  name: string
  description?: string
  frequency: RecurringFrequency
  customIntervalDays?: number
  startDate: string
  endDate?: string
  currencyCode: string
  exchangeRate: number
  reference?: string
  lines: UpdateRecurringVoucherLineRequest[]
}

export interface UpdateRecurringVoucherLineRequest {
  id?: string
  accountId: string
  debitAmount: number
  creditAmount: number
  description?: string
  reference?: string
  departmentId?: string
}

export interface RecurringVoucherQueryParams {
  search?: string
  isActive?: boolean
  frequency?: RecurringFrequency
  page?: number
  pageSize?: number
  sortBy?: string
  sortDescending?: boolean
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
