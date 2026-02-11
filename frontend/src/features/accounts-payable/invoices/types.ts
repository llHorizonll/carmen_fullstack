// Enums
export enum ApInvoiceStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  PartiallyPaid = 4,
  Paid = 5,
  Void = 6,
}

export const apInvoiceStatusLabels: Record<ApInvoiceStatus, string> = {
  [ApInvoiceStatus.Draft]: "Draft",
  [ApInvoiceStatus.Pending]: "Pending Approval",
  [ApInvoiceStatus.Approved]: "Approved",
  [ApInvoiceStatus.Rejected]: "Rejected",
  [ApInvoiceStatus.PartiallyPaid]: "Partially Paid",
  [ApInvoiceStatus.Paid]: "Paid",
  [ApInvoiceStatus.Void]: "Void",
}

// Response DTOs
export interface ApInvoiceDto {
  id: string
  invoiceNumber: string
  vendorInvoiceNumber?: string
  invoiceDate: string
  dueDate: string
  status: ApInvoiceStatus
  vendorId: string
  vendorCode: string
  vendorName: string
  currencyCode: string
  exchangeRate: number
  subTotal: number
  discountAmount: number
  tax1ProfileId?: string
  tax1ProfileName?: string
  tax1Rate: number
  tax1Amount: number
  tax2ProfileId?: string
  tax2ProfileName?: string
  tax2Rate: number
  tax2Amount: number
  whtProfileId?: string
  whtProfileName?: string
  whtRate: number
  whtAmount: number
  totalAmount: number
  netAmount: number
  netAmountBase: number
  paidAmount: number
  balanceAmount: number
  description?: string
  reference?: string
  fiscalPeriodId: string
  fiscalPeriodName?: string
  approvedAt?: string
  approvedBy?: string
  rejectionReason?: string
  voidReason?: string
  journalVoucherId?: string
  lines: ApInvoiceLineDto[]
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export interface ApInvoiceListDto {
  id: string
  invoiceNumber: string
  vendorInvoiceNumber?: string
  invoiceDate: string
  dueDate: string
  status: ApInvoiceStatus
  vendorCode: string
  vendorName: string
  currencyCode: string
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  lineCount: number
  createdAt: string
}

export interface ApInvoiceLineDto {
  id: string
  lineNumber: number
  accountId: string
  accountCode: string
  accountName: string
  departmentId?: string
  departmentName?: string
  description?: string
  quantity: number
  unitPrice: number
  amount: number
  amountBase: number
  tax1ProfileId?: string
  tax1ProfileName?: string
  tax1Rate: number
  tax1Amount: number
}

export interface UnpaidInvoiceDto {
  id: string
  invoiceNumber: string
  vendorInvoiceNumber?: string
  invoiceDate: string
  dueDate: string
  currencyCode: string
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  daysOverdue: number
}

// Request DTOs
export interface CreateApInvoiceRequest {
  vendorInvoiceNumber?: string
  invoiceDate: string
  dueDate: string
  vendorId: string
  currencyCode: string
  exchangeRate: number
  discountAmount: number
  tax1ProfileId?: string
  tax2ProfileId?: string
  whtProfileId?: string
  description?: string
  reference?: string
  fiscalPeriodId: string
  lines: CreateApInvoiceLineRequest[]
}

export interface CreateApInvoiceLineRequest {
  accountId: string
  departmentId?: string
  description?: string
  quantity: number
  unitPrice: number
  tax1ProfileId?: string
}

export interface UpdateApInvoiceRequest {
  vendorInvoiceNumber?: string
  invoiceDate: string
  dueDate: string
  currencyCode: string
  exchangeRate: number
  discountAmount: number
  tax1ProfileId?: string
  tax2ProfileId?: string
  whtProfileId?: string
  description?: string
  reference?: string
  fiscalPeriodId: string
  lines: UpdateApInvoiceLineRequest[]
}

export interface UpdateApInvoiceLineRequest {
  id?: string
  accountId: string
  departmentId?: string
  description?: string
  quantity: number
  unitPrice: number
  tax1ProfileId?: string
}

// Action Requests
export interface SubmitApInvoiceRequest {
  comment?: string
}

export interface ApproveApInvoiceRequest {
  comment?: string
}

export interface RejectApInvoiceRequest {
  reason: string
}

export interface VoidApInvoiceRequest {
  reason: string
}

// Tax Calculation
export interface CalculateTaxRequest {
  vendorId: string
  subTotal: number
  discountAmount: number
  tax1ProfileId?: string
  tax2ProfileId?: string
  whtProfileId?: string
  lines: { amount: number; tax1ProfileId?: string }[]
}

export interface TaxCalculationResult {
  subTotal: number
  discountAmount: number
  tax1Amount: number
  tax2Amount: number
  whtAmount: number
  totalAmount: number
  netAmount: number
}

// Credit Limit Check
export interface CreditLimitCheckResult {
  isExceeded: boolean
  creditLimit: number
  currentBalance: number
  invoiceAmount: number
}

// Query Parameters
export interface ApInvoiceQueryParams {
  search?: string
  status?: ApInvoiceStatus
  vendorId?: string
  dateFrom?: string
  dateTo?: string
  dueDateFrom?: string
  dueDateTo?: string
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

// OCR Types
export interface OcrExtractedInvoiceDto {
  vendorName: string | null
  vendorTaxId: string | null
  invoiceNumber: string | null
  invoiceDate: string | null
  dueDate: string | null
  currencyCode: string
  subTotal: number
  taxAmount: number
  totalAmount: number
  lines: OcrExtractedLineDto[]
  rawText: string
  confidence: number
}

export interface OcrExtractedLineDto {
  description: string | null
  quantity: number
  unitPrice: number
  amount: number
  accountCode: string | null
}
