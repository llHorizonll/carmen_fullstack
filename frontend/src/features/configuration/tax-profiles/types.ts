// Tax Types
export enum TaxType {
  VAT = 1,
  GST = 2,
  SalesTax = 3,
  ServiceTax = 4,
  WithholdingTax = 5,
  Other = 99,
}

export const taxTypeLabels: Record<TaxType, string> = {
  [TaxType.VAT]: "VAT",
  [TaxType.GST]: "GST",
  [TaxType.SalesTax]: "Sales Tax",
  [TaxType.ServiceTax]: "Service Tax",
  [TaxType.WithholdingTax]: "Withholding Tax",
  [TaxType.Other]: "Other",
}

export enum TaxCalculationMethod {
  Percentage = 1,
  FixedAmount = 2,
}

export const taxCalculationMethodLabels: Record<TaxCalculationMethod, string> = {
  [TaxCalculationMethod.Percentage]: "Percentage",
  [TaxCalculationMethod.FixedAmount]: "Fixed Amount",
}

// Tax Profile DTOs
export interface TaxProfileDto {
  id: string
  taxCode: string
  taxName: string
  taxNameLocal?: string
  taxType: TaxType
  calculationMethod: TaxCalculationMethod
  taxRate: number
  description?: string
  isActive: boolean
  isDefault: boolean
  taxPayableAccountId?: string
  taxPayableAccountCode?: string
  taxPayableAccountName?: string
  taxReceivableAccountId?: string
  taxReceivableAccountCode?: string
  taxReceivableAccountName?: string
  sortOrder: number
  createdAt: string
  updatedAt?: string
}

export interface TaxProfileListDto {
  id: string
  taxCode: string
  taxName: string
  taxType: TaxType
  taxRate: number
  isActive: boolean
  isDefault: boolean
}

export interface TaxProfileLookupDto {
  id: string
  taxCode: string
  taxName: string
  taxRate: number
}

// Request DTOs
export interface CreateTaxProfileRequest {
  taxCode: string
  taxName: string
  taxNameLocal?: string
  taxType: TaxType
  calculationMethod: TaxCalculationMethod
  taxRate: number
  description?: string
  isDefault: boolean
  taxPayableAccountId?: string
  taxReceivableAccountId?: string
  sortOrder?: number
}

export interface UpdateTaxProfileRequest {
  taxName: string
  taxNameLocal?: string
  taxType: TaxType
  calculationMethod: TaxCalculationMethod
  taxRate: number
  description?: string
  isActive: boolean
  isDefault: boolean
  taxPayableAccountId?: string
  taxReceivableAccountId?: string
  sortOrder: number
}

// Query Parameters
export interface TaxProfileQueryParams {
  search?: string
  taxType?: TaxType
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
