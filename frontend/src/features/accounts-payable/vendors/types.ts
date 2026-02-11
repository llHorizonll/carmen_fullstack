// Response DTOs
export interface VendorDto {
  id: string
  vendorCode: string
  vendorName: string
  vendorNameLocal?: string
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
  defaultApAccountId?: string
  defaultApAccountCode?: string
  defaultApAccountName?: string
  defaultExpenseAccountId?: string
  defaultExpenseAccountCode?: string
  defaultExpenseAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  bankBranch?: string
  isActive: boolean
  notes?: string
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export interface VendorListDto {
  id: string
  vendorCode: string
  vendorName: string
  vendorNameLocal?: string
  taxId?: string
  phone?: string
  email?: string
  currencyCode: string
  currentBalance: number
  isActive: boolean
  createdAt: string
}

export interface VendorLookupDto {
  id: string
  vendorCode: string
  vendorName: string
  currencyCode: string
  taxId?: string
}

// Request DTOs
export interface CreateVendorRequest {
  vendorCode: string
  vendorName: string
  vendorNameLocal?: string
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
  defaultApAccountId?: string
  defaultExpenseAccountId?: string
  bankName?: string
  bankAccountNumber?: string
  bankBranch?: string
  isActive: boolean
  notes?: string
}

export interface UpdateVendorRequest {
  vendorName: string
  vendorNameLocal?: string
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
  defaultApAccountId?: string
  defaultExpenseAccountId?: string
  bankName?: string
  bankAccountNumber?: string
  bankBranch?: string
  isActive: boolean
  notes?: string
}

// Aging DTOs
export interface VendorAgingDto {
  vendorId: string
  vendorCode: string
  vendorName: string
  asOfDate: string
  current: number
  days1To30: number
  days31To60: number
  days61To90: number
  days90Plus: number
  totalBalance: number
  invoices: VendorAgingInvoiceDto[]
}

export interface VendorAgingInvoiceDto {
  invoiceId: string
  invoiceNumber: string
  vendorInvoiceNumber?: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  balanceAmount: number
  daysOverdue: number
  bucket: string
}

export interface VendorAgingSummaryDto {
  vendorId: string
  vendorCode: string
  vendorName: string
  current: number
  days1To30: number
  days31To60: number
  days61To90: number
  days90Plus: number
  totalBalance: number
}

// Query Parameters
export interface VendorQueryParams {
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
