// Enums
export enum ApPaymentStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Posted = 3,
  Void = 4,
}

export enum PaymentMethod {
  Cash = 1,
  Check = 2,
  BankTransfer = 3,
  CreditCard = 4,
  Other = 5,
}

export const apPaymentStatusLabels: Record<ApPaymentStatus, string> = {
  [ApPaymentStatus.Draft]: "Draft",
  [ApPaymentStatus.Pending]: "Pending Approval",
  [ApPaymentStatus.Approved]: "Approved",
  [ApPaymentStatus.Posted]: "Posted",
  [ApPaymentStatus.Void]: "Void",
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: "Cash",
  [PaymentMethod.Check]: "Check",
  [PaymentMethod.BankTransfer]: "Bank Transfer",
  [PaymentMethod.CreditCard]: "Credit Card",
  [PaymentMethod.Other]: "Other",
}

// Response DTOs
export interface ApPaymentDto {
  id: string
  paymentNumber: string
  paymentDate: string
  status: ApPaymentStatus
  vendorId: string
  vendorCode: string
  vendorName: string
  paymentMethod: PaymentMethod
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
  payeeName?: string
  fiscalPeriodId: string
  fiscalPeriodName?: string
  approvedAt?: string
  approvedBy?: string
  postedAt?: string
  postedBy?: string
  voidReason?: string
  journalVoucherId?: string
  lines: ApPaymentLineDto[]
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export interface ApPaymentListDto {
  id: string
  paymentNumber: string
  paymentDate: string
  status: ApPaymentStatus
  vendorCode: string
  vendorName: string
  paymentMethod: PaymentMethod
  checkNumber?: string
  currencyCode: string
  totalAmount: number
  bankAccountCode: string
  allocationCount: number
  createdAt: string
}

export interface ApPaymentLineDto {
  id: string
  lineNumber: number
  apInvoiceId: string
  invoiceNumber: string
  vendorInvoiceNumber?: string
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
export interface CreateApPaymentRequest {
  paymentDate: string
  vendorId: string
  paymentMethod: PaymentMethod
  checkNumber?: string
  checkDate?: string
  bankReference?: string
  currencyCode: string
  exchangeRate: number
  totalAmount: number
  bankAccountId: string
  description?: string
  reference?: string
  payeeName?: string
  fiscalPeriodId: string
  lines: CreateApPaymentLineRequest[]
}

export interface CreateApPaymentLineRequest {
  apInvoiceId: string
  amountAllocated: number
  discountAmount: number
  whtAmount: number
  notes?: string
}

export interface UpdateApPaymentRequest {
  paymentDate: string
  paymentMethod: PaymentMethod
  checkNumber?: string
  checkDate?: string
  bankReference?: string
  currencyCode: string
  exchangeRate: number
  totalAmount: number
  bankAccountId: string
  description?: string
  reference?: string
  payeeName?: string
  fiscalPeriodId: string
  lines: UpdateApPaymentLineRequest[]
}

export interface UpdateApPaymentLineRequest {
  id?: string
  apInvoiceId: string
  amountAllocated: number
  discountAmount: number
  whtAmount: number
  notes?: string
}

// Action Requests
export interface ApproveApPaymentRequest {
  comment?: string
}

export interface PostApPaymentRequest {
  postingDate?: string
}

export interface VoidApPaymentRequest {
  reason: string
}

// Auto-allocation
export interface AutoAllocateRequest {
  vendorId: string
  totalAmount: number
  currencyCode: string
}

export interface AutoAllocateResult {
  totalAllocated: number
  remaining: number
  allocations: AllocationSuggestion[]
}

export interface AllocationSuggestion {
  invoiceId: string
  invoiceNumber: string
  dueDate: string
  invoiceBalance: number
  suggestedAmount: number
  whtAmount: number
}

// Query Parameters
export interface ApPaymentQueryParams {
  search?: string
  status?: ApPaymentStatus
  vendorId?: string
  paymentMethod?: PaymentMethod
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
