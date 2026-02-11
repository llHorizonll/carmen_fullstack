// Enums
export enum ArInvoiceStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  PartiallyPaid = 4,
  Paid = 5,
  Void = 6,
}

export const arInvoiceStatusLabels: Record<ArInvoiceStatus, string> = {
  [ArInvoiceStatus.Draft]: "Draft",
  [ArInvoiceStatus.Pending]: "Pending Approval",
  [ArInvoiceStatus.Approved]: "Approved",
  [ArInvoiceStatus.Rejected]: "Rejected",
  [ArInvoiceStatus.PartiallyPaid]: "Partially Paid",
  [ArInvoiceStatus.Paid]: "Paid",
  [ArInvoiceStatus.Void]: "Void",
}

// Response DTOs
export interface ArInvoiceDto {
  id: string
  invoiceNumber: string
  customerReference?: string
  invoiceDate: string
  dueDate: string
  status: ArInvoiceStatus
  customerId: string
  customerCode: string
  customerName: string
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
  lines: ArInvoiceLineDto[]
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export interface ArInvoiceListDto {
  id: string
  invoiceNumber: string
  customerReference?: string
  invoiceDate: string
  dueDate: string
  status: ArInvoiceStatus
  customerCode: string
  customerName: string
  currencyCode: string
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  lineCount: number
  createdAt: string
}

export interface ArInvoiceLineDto {
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

export interface UnpaidArInvoiceDto {
  id: string
  invoiceNumber: string
  customerReference?: string
  invoiceDate: string
  dueDate: string
  currencyCode: string
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  daysOverdue: number
}

// Request DTOs
export interface CreateArInvoiceRequest {
  customerReference?: string
  invoiceDate: string
  dueDate: string
  customerId: string
  currencyCode: string
  exchangeRate: number
  discountAmount: number
  tax1ProfileId?: string
  tax2ProfileId?: string
  whtProfileId?: string
  description?: string
  reference?: string
  fiscalPeriodId: string
  lines: CreateArInvoiceLineRequest[]
}

export interface CreateArInvoiceLineRequest {
  accountId: string
  departmentId?: string
  description?: string
  quantity: number
  unitPrice: number
  tax1ProfileId?: string
}

export interface UpdateArInvoiceRequest {
  customerReference?: string
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
  lines: UpdateArInvoiceLineRequest[]
}

export interface UpdateArInvoiceLineRequest {
  id?: string
  accountId: string
  departmentId?: string
  description?: string
  quantity: number
  unitPrice: number
  tax1ProfileId?: string
}

// Action Requests
export interface SubmitArInvoiceRequest {
  comment?: string
}

export interface ApproveArInvoiceRequest {
  comment?: string
}

export interface RejectArInvoiceRequest {
  reason: string
}

export interface VoidArInvoiceRequest {
  reason: string
}

// Tax Calculation
export interface CalculateTaxRequest {
  customerId: string
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

// Query Parameters
export interface ArInvoiceQueryParams {
  search?: string
  status?: ArInvoiceStatus
  customerId?: string
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
