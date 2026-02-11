import { apiClient } from "@/lib/api-client"
import type {
  CurrencyDto,
  CurrencyListDto,
  CurrencyLookupDto,
  CurrencyQueryParams,
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/currencies`

export const currenciesApi = {
  /**
   * Get paginated list of currencies
   */
  getCurrencies: async (
    tenantId: string,
    params?: CurrencyQueryParams
  ): Promise<PaginatedResult<CurrencyListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.isActive !== undefined)
      searchParams.set("isActive", String(params.isActive))
    if (params?.isBaseCurrency !== undefined)
      searchParams.set("isBaseCurrency", String(params.isBaseCurrency))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined)
      searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<CurrencyListDto>>(url)
    return response.data
  },

  /**
   * Get currency by ID
   */
  getCurrency: async (tenantId: string, id: string): Promise<CurrencyDto> => {
    const response = await apiClient.getRaw<CurrencyDto>(
      `${getBaseUrl(tenantId)}/${id}`
    )
    return response.data
  },

  /**
   * Get currency by code
   */
  getCurrencyByCode: async (
    tenantId: string,
    code: string
  ): Promise<CurrencyDto> => {
    const response = await apiClient.getRaw<CurrencyDto>(
      `${getBaseUrl(tenantId)}/by-code/${code}`
    )
    return response.data
  },

  /**
   * Get currencies for lookup (dropdown/select)
   */
  getCurrencyLookup: async (
    tenantId: string,
    isActive?: boolean
  ): Promise<CurrencyLookupDto[]> => {
    const searchParams = new URLSearchParams()
    if (isActive !== undefined)
      searchParams.set("isActive", String(isActive))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/lookup${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<CurrencyLookupDto[]>(url)
    return response.data
  },

  /**
   * Create a new currency
   */
  createCurrency: async (
    tenantId: string,
    data: CreateCurrencyRequest
  ): Promise<CurrencyDto> => {
    const response = await apiClient.postRaw<CurrencyDto>(
      getBaseUrl(tenantId),
      data
    )
    return response.data
  },

  /**
   * Update an existing currency
   */
  updateCurrency: async (
    tenantId: string,
    id: string,
    data: UpdateCurrencyRequest
  ): Promise<CurrencyDto> => {
    const response = await apiClient.putRaw<CurrencyDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete a currency (soft delete)
   */
  deleteCurrency: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Check if currency code exists
   */
  checkCurrencyCode: async (
    tenantId: string,
    code: string,
    excludeId?: string
  ): Promise<{ exists: boolean }> => {
    const url = excludeId
      ? `${getBaseUrl(tenantId)}/check-code/${code}?excludeId=${excludeId}`
      : `${getBaseUrl(tenantId)}/check-code/${code}`

    const response = await apiClient.getRaw<{ exists: boolean }>(url)
    return response.data
  },

  /**
   * Check if currency has transactions
   */
  checkHasTransactions: async (
    tenantId: string,
    id: string
  ): Promise<{ hasTransactions: boolean }> => {
    const response = await apiClient.getRaw<{ hasTransactions: boolean }>(
      `${getBaseUrl(tenantId)}/${id}/has-transactions`
    )
    return response.data
  },

  /**
   * Update exchange rate for a currency
   */
  updateExchangeRate: async (
    tenantId: string,
    id: string,
    exchangeRate: number
  ): Promise<void> => {
    await apiClient.putRaw(`${getBaseUrl(tenantId)}/${id}/exchange-rate`, {
      exchangeRate,
    })
  },
}
