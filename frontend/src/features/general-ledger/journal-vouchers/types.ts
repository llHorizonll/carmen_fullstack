// Enums
export enum DocumentStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Posted = 4,
  Void = 5,
}

export enum VoucherType {
  General = 1,
  Recurring = 2,
  Template = 3,
  Amortization = 4,
  Allocation = 5,
  Reversal = 6,
}

export const documentStatusLabels: Record<DocumentStatus, string> = {
  [DocumentStatus.Draft]: "Draft",
  [DocumentStatus.Pending]: "Pending Approval",
  [DocumentStatus.Approved]: "Approved",
  [DocumentStatus.Rejected]: "Rejected",
  [DocumentStatus.Posted]: "Posted",
  [DocumentStatus.Void]: "Void",
}

export const voucherTypeLabels: Record<VoucherType, string> = {
  [VoucherType.General]: "General",
  [VoucherType.Recurring]: "Recurring",
  [VoucherType.Template]: "Template",
  [VoucherType.Amortization]: "Amortization",
  [VoucherType.Allocation]: "Allocation",
  [VoucherType.Reversal]: "Reversal",
}

// Response DTOs
export interface JournalVoucherDto {
  id: string
  voucherNumber: string
  voucherDate: string
  postingDate: string
  voucherType: VoucherType
  status: DocumentStatus
  description?: string
  reference?: string
  currencyCode: string
  exchangeRate: number
  totalDebit: number
  totalCredit: number
  fiscalPeriodId: string
  fiscalPeriodName?: string
  approvedAt?: string
  approvedBy?: string
  postedAt?: string
  postedBy?: string
  reversalOfId?: string
  reversedById?: string
  lines: JournalVoucherLineDto[]
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export interface JournalVoucherListDto {
  id: string
  voucherNumber: string
  voucherDate: string
  postingDate: string
  voucherType: VoucherType
  status: DocumentStatus
  description?: string
  currencyCode: string
  totalDebit: number
  totalCredit: number
  lineCount: number
  createdAt: string
  createdBy: string
}

export interface JournalVoucherLineDto {
  id: string
  lineNumber: number
  accountId: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  debitAmountBase: number
  creditAmountBase: number
  description?: string
  reference?: string
  departmentId?: string
  departmentName?: string
}

// Request DTOs
export interface CreateJournalVoucherRequest {
  voucherDate: string
  postingDate: string
  voucherType: VoucherType
  description?: string
  reference?: string
  currencyCode: string
  exchangeRate: number
  fiscalPeriodId: string
  lines: CreateJournalVoucherLineRequest[]
}

export interface CreateJournalVoucherLineRequest {
  accountId: string
  debitAmount: number
  creditAmount: number
  description?: string
  reference?: string
  departmentId?: string
}

export interface UpdateJournalVoucherRequest {
  voucherDate: string
  postingDate: string
  description?: string
  reference?: string
  currencyCode: string
  exchangeRate: number
  fiscalPeriodId: string
  lines: UpdateJournalVoucherLineRequest[]
}

export interface UpdateJournalVoucherLineRequest {
  id?: string
  accountId: string
  debitAmount: number
  creditAmount: number
  description?: string
  reference?: string
  departmentId?: string
}

// Action Requests
export interface SubmitForApprovalRequest {
  comment?: string
}

export interface ApproveVoucherRequest {
  comment?: string
}

export interface RejectVoucherRequest {
  reason: string
}

export interface PostVoucherRequest {
  postingDate?: string
}

export interface ReverseVoucherRequest {
  reversalDate: string
  description?: string
}

// Query Parameters
export interface JournalVoucherQueryParams {
  search?: string
  status?: DocumentStatus
  voucherType?: VoucherType
  dateFrom?: string
  dateTo?: string
  fiscalPeriodId?: string
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
