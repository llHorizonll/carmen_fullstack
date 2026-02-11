// Payment Term DTOs
export interface PaymentTermDto {
  id: string
  termCode: string
  termName: string
  termNameLocal?: string
  dueDays: number
  discountPercent?: number
  discountDays?: number
  description?: string
  isDefault: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface PaymentTermListDto {
  id: string
  termCode: string
  termName: string
  termNameLocal?: string
  dueDays: number
  discountPercent?: number
  isDefault: boolean
  isActive: boolean
}

export interface PaymentTermLookupDto {
  id: string
  termCode: string
  termName: string
  dueDays: number
}

// Request DTOs
export interface CreatePaymentTermRequest {
  termCode: string
  termName: string
  termNameLocal?: string
  dueDays: number
  discountPercent?: number
  discountDays?: number
  description?: string
  isDefault: boolean
  sortOrder?: number
}

export interface UpdatePaymentTermRequest {
  termName: string
  termNameLocal?: string
  dueDays: number
  discountPercent?: number
  discountDays?: number
  description?: string
  isDefault: boolean
  sortOrder: number
  isActive: boolean
}

// Query Parameters
export interface PaymentTermQueryParams {
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
