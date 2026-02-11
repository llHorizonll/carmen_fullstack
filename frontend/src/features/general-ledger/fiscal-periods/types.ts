// Fiscal Period Types
export enum PeriodStatus {
  Open = 1,
  Closed = 2,
  Locked = 3,
}

export const periodStatusLabels: Record<PeriodStatus, string> = {
  [PeriodStatus.Open]: "Open",
  [PeriodStatus.Closed]: "Closed",
  [PeriodStatus.Locked]: "Locked",
}

export const periodStatusColors: Record<PeriodStatus, string> = {
  [PeriodStatus.Open]: "bg-green-100 text-green-800",
  [PeriodStatus.Closed]: "bg-yellow-100 text-yellow-800",
  [PeriodStatus.Locked]: "bg-red-100 text-red-800",
}

// Fiscal Year DTOs
export interface FiscalYearDto {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  isClosed: boolean
  periods: FiscalPeriodDto[]
  createdAt: string
  updatedAt?: string
}

export interface FiscalYearListDto {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  isClosed: boolean
  periodCount: number
}

export interface CreateFiscalYearRequest {
  name: string
  startDate: string
  endDate: string
  generatePeriods: boolean
  periodType?: "Monthly" | "Quarterly"
}

// Fiscal Period DTOs
export interface FiscalPeriodDto {
  id: string
  fiscalYearId: string
  fiscalYearName: string
  name: string
  periodNumber: number
  startDate: string
  endDate: string
  status: PeriodStatus
  closedAt?: string
  closedBy?: string
  closedByName?: string
  lockedAt?: string
  lockedBy?: string
  lockedByName?: string
  createdAt: string
  updatedAt?: string
}

export interface FiscalPeriodListDto {
  id: string
  fiscalYearId: string
  fiscalYearName: string
  name: string
  periodNumber: number
  startDate: string
  endDate: string
  status: PeriodStatus
}

export interface FiscalPeriodLookupDto {
  id: string
  name: string
  startDate: string
  endDate: string
  status: PeriodStatus
}

// Period Query Parameters
export interface FiscalPeriodQueryParams {
  fiscalYearId?: string
  status?: PeriodStatus
  page?: number
  pageSize?: number
}

// Period Closing DTOs
export interface ClosePeriodRequest {
  comment?: string
}

export interface ReopenPeriodRequest {
  reason: string
}

export interface PeriodCloseValidationResult {
  canClose: boolean
  warnings: string[]
  errors: string[]
  pendingVouchersCount: number
  draftVouchersCount: number
  approvedVouchersCount: number
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
}

export interface PeriodBlockingVouchersDto {
  periodId: string
  periodName: string
  draftVouchers: BlockingVoucherDto[]
  pendingVouchers: BlockingVoucherDto[]
  approvedVouchers: BlockingVoucherDto[]
}

export interface BlockingVoucherDto {
  id: string
  voucherNumber: string
  voucherDate: string
  description?: string
  status: string
  totalAmount: number
}

// Paginated Response
export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
