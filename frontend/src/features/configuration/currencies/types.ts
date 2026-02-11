// Currency DTOs
export interface CurrencyDto {
  id: string
  currencyCode: string
  currencyName: string
  currencyNameLocal?: string
  symbol: string
  decimalPlaces: number
  exchangeRate: number
  exchangeRateDate?: string
  isBaseCurrency: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface CurrencyListDto {
  id: string
  currencyCode: string
  currencyName: string
  symbol: string
  decimalPlaces: number
  exchangeRate: number
  isBaseCurrency: boolean
  isActive: boolean
}

export interface CurrencyLookupDto {
  id: string
  currencyCode: string
  currencyName: string
  symbol: string
  decimalPlaces: number
}

// Request DTOs
export interface CreateCurrencyRequest {
  currencyCode: string
  currencyName: string
  currencyNameLocal?: string
  symbol: string
  decimalPlaces: number
  exchangeRate: number
  isBaseCurrency: boolean
  sortOrder?: number
}

export interface UpdateCurrencyRequest {
  currencyName: string
  currencyNameLocal?: string
  symbol: string
  decimalPlaces: number
  exchangeRate: number
  exchangeRateDate?: string
  isBaseCurrency: boolean
  sortOrder: number
  isActive: boolean
}

// Query Parameters
export interface CurrencyQueryParams {
  search?: string
  isActive?: boolean
  isBaseCurrency?: boolean
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
