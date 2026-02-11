// Response DTOs
export interface CustomerDto {
  id: string
  customerCode: string
  customerName: string
  customerNameLocal?: string
  taxId?: string
  contactPerson?: string
  email?: string
  phone?: string
  fax?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  defaultPaymentTermId?: string
  defaultPaymentTermName?: string
  currencyCode: string
  creditLimit: number
  currentBalance: number
  defaultTax1ProfileId?: string
  defaultTax1ProfileName?: string
  defaultTax2ProfileId?: string
  defaultTax2ProfileName?: string
  defaultWhtProfileId?: string
  defaultWhtProfileName?: string
  defaultArAccountId?: string
  defaultArAccountCode?: string
  defaultArAccountName?: string
  defaultRevenueAccountId?: string
  defaultRevenueAccountCode?: string
  defaultRevenueAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  bankBranch?: string
  isActive: boolean
  notes?: string
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export interface CustomerListDto {
  id: string
  customerCode: string
  customerName: string
  customerNameLocal?: string
  taxId?: string
  phone?: string
  email?: string
  currencyCode: string
  currentBalance: number
  isActive: boolean
  createdAt: string
}

export interface CustomerLookupDto {
  id: string
  customerCode: string
  customerName: string
  currencyCode: string
  taxId?: string
}

// Request DTOs
export interface CreateCustomerRequest {
  customerCode: string
  customerName: string
  customerNameLocal?: string
  taxId?: string
  contactPerson?: string
  email?: string
  phone?: string
  fax?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  defaultPaymentTermId?: string
  currencyCode: string
  creditLimit: number
  defaultTax1ProfileId?: string
  defaultTax2ProfileId?: string
  defaultWhtProfileId?: string
  defaultArAccountId?: string
  defaultRevenueAccountId?: string
  bankName?: string
  bankAccountNumber?: string
  bankBranch?: string
  isActive: boolean
  notes?: string
}

export interface UpdateCustomerRequest {
  customerName: string
  customerNameLocal?: string
  taxId?: string
  contactPerson?: string
  email?: string
  phone?: string
  fax?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  defaultPaymentTermId?: string
  currencyCode: string
  creditLimit: number
  defaultTax1ProfileId?: string
  defaultTax2ProfileId?: string
  defaultWhtProfileId?: string
  defaultArAccountId?: string
  defaultRevenueAccountId?: string
  bankName?: string
  bankAccountNumber?: string
  bankBranch?: string
  isActive: boolean
  notes?: string
}

// Aging DTOs
export interface CustomerAgingDto {
  customerId: string
  customerCode: string
  customerName: string
  asOfDate: string
  current: number
  days1To30: number
  days31To60: number
  days61To90: number
  days90Plus: number
  totalBalance: number
  invoices: CustomerAgingInvoiceDto[]
}

export interface CustomerAgingInvoiceDto {
  invoiceId: string
  invoiceNumber: string
  customerReference?: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  balanceAmount: number
  daysOverdue: number
  bucket: string
}

export interface CustomerAgingSummaryDto {
  customerId: string
  customerCode: string
  customerName: string
  current: number
  days1To30: number
  days31To60: number
  days61To90: number
  days90Plus: number
  totalBalance: number
}

// Query Parameters
export interface CustomerQueryParams {
  search?: string
  isActive?: boolean
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
