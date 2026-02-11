// Common types used across the application

export type PaginatedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type PaginationParams = {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type SelectOption = {
  value: string
  label: string
}

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// Audit fields for entities
export type AuditFields = {
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

// Base entity with ID
export type BaseEntity = {
  id: string
} & AuditFields

// Status types
export type Status = 'draft' | 'pending' | 'approved' | 'rejected' | 'posted' | 'void'

// Common filter types
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'

export type Filter = {
  field: string
  operator: FilterOperator
  value: unknown
}
