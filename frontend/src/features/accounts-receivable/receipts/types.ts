// Enums
export enum ArReceiptStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Posted = 3,
  Void = 4,
}

export enum ReceiptMethod {
  Cash = 1,
  Check = 2,
  BankTransfer = 3,
  CreditCard = 4,
  Other = 99,
}

export const arReceiptStatusLabels: Record<ArReceiptStatus, string> = {
  [ArReceiptStatus.Draft]: "Draft",
  [ArReceiptStatus.Pending]: "Pending Approval",
  [ArReceiptStatus.Approved]: "Approved",
  [ArReceiptStatus.Posted]: "Posted",
  [ArReceiptStatus.Void]: "Void",
}

export const receiptMethodLabels: Record<ReceiptMethod, string> = {
  [ReceiptMethod.Cash]: "Cash",
  [ReceiptMethod.Check]: "Check",
  [ReceiptMethod.BankTransfer]: "Bank Transfer",
  [ReceiptMethod.CreditCard]: "Credit Card",
  [ReceiptMethod.Other]: "Other",
}

// Response DTOs
export interface ArReceiptDto {
  id: string
  receiptNumber: string
  receiptDate: string
  status: ArReceiptStatus
  customerId: string
  customerCode: string
  customerName: string
  receiptMethod: ReceiptMethod
  checkNumber?: string
  checkDate?: string
  bankReference?: string
  currencyCode: string
  exchangeRate: number
  totalAmount: number
  totalAmountBase: number
  allocatedAmount: number
  unallocatedAmount: number
  bankAccountId: string
  bankAccountCode: string
  bankAccountName: string
  description?: string
  reference?: string
  payerName?: string
  fiscalPeriodId: string
  fiscalPeriodName?: string
  approvedAt?: string
  approvedBy?: string
  postedAt?: string
  postedBy?: string
  voidReason?: string
  journalVoucherId?: string
  lines: ArReceiptLineDto[]
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export interface ArReceiptListDto {
  id: string
  receiptNumber: string
  receiptDate: string
  status: ArReceiptStatus
  customerCode: string
  customerName: string
  receiptMethod: ReceiptMethod
  checkNumber?: string
  currencyCode: string
  totalAmount: number
  bankAccountCode: string
  allocationCount: number
  createdAt: string
}

export interface ArReceiptLineDto {
  id: string
  lineNumber: number
  arInvoiceId: string
  invoiceNumber: string
  customerReference?: string
  invoiceDate: string
  dueDate: string
  invoiceTotalAmount: number
  invoiceBalanceBefore: number
  amountAllocated: number
  amountAllocatedBase: number
  discountAmount: number
  whtAmount: number
  exchangeGainLoss: number
  notes?: string
}

// Request DTOs
export interface CreateArReceiptRequest {
  receiptDate: string
  customerId: string
  receiptMethod: ReceiptMethod
  checkNumber?: string
  checkDate?: string
  bankReference?: string
  currencyCode: string
  exchangeRate: number
  totalAmount: number
  bankAccountId: string
  description?: string
  reference?: string
  payerName?: string
  fiscalPeriodId: string
  lines: CreateArReceiptLineRequest[]
}

export interface CreateArReceiptLineRequest {
  arInvoiceId: string
  amountAllocated: number
  discountAmount: number
  whtAmount: number
  notes?: string
}

export interface UpdateArReceiptRequest {
  receiptDate: string
  receiptMethod: ReceiptMethod
  checkNumber?: string
  checkDate?: string
  bankReference?: string
  currencyCode: string
  exchangeRate: number
  totalAmount: number
  bankAccountId: string
  description?: string
  reference?: string
  payerName?: string
  fiscalPeriodId: string
  lines: UpdateArReceiptLineRequest[]
}

export interface UpdateArReceiptLineRequest {
  id?: string
  arInvoiceId: string
  amountAllocated: number
  discountAmount: number
  whtAmount: number
  notes?: string
}

// Action Requests
export interface ApproveArReceiptRequest {
  comment?: string
}

export interface PostArReceiptRequest {
  postingDate?: string
}

export interface VoidArReceiptRequest {
  reason: string
}

// Auto-allocation
export interface ArAutoAllocateRequest {
  customerId: string
  totalAmount: number
  currencyCode: string
}

export interface ArAutoAllocateResult {
  totalAllocated: number
  remaining: number
  allocations: ArAllocationSuggestion[]
}

export interface ArAllocationSuggestion {
  invoiceId: string
  invoiceNumber: string
  dueDate: string
  invoiceBalance: number
  suggestedAmount: number
  whtAmount: number
}

// Query Parameters
export interface ArReceiptQueryParams {
  search?: string
  status?: ArReceiptStatus
  customerId?: string
  receiptMethod?: ReceiptMethod
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
