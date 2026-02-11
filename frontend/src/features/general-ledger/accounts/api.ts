import { apiClient } from "@/lib/api-client"
import type {
  AccountDto,
  AccountListDto,
  AccountLookupDto,
  AccountQueryParams,
  AccountTreeDto,
  AccountSummaryDto,
  AccountLedgerDto,
  TrialBalanceDto,
  CreateAccountRequest,
  PaginatedResult,
  UpdateAccountRequest,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/accounts`

export const accountsApi = {
  /**
   * Get paginated list of accounts
   */
  getAccounts: async (
    tenantId: string,
    params?: AccountQueryParams
  ): Promise<PaginatedResult<AccountListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.accountType !== undefined)
      searchParams.set("accountType", String(params.accountType))
    if (params?.isActive !== undefined)
      searchParams.set("isActive", String(params.isActive))
    if (params?.isHeader !== undefined)
      searchParams.set("isHeader", String(params.isHeader))
    if (params?.parentAccountId)
      searchParams.set("parentAccountId", params.parentAccountId)
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined)
      searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<AccountListDto>>(url)
    return response.data
  },

  /**
   * Get account by ID
   */
  getAccount: async (tenantId: string, id: string): Promise<AccountDto> => {
    const response = await apiClient.getRaw<AccountDto>(
      `${getBaseUrl(tenantId)}/${id}`
    )
    return response.data
  },

  /**
   * Get account by code
   */
  getAccountByCode: async (
    tenantId: string,
    code: string
  ): Promise<AccountDto> => {
    const response = await apiClient.getRaw<AccountDto>(
      `${getBaseUrl(tenantId)}/by-code/${code}`
    )
    return response.data
  },

  /**
   * Get accounts as tree structure
   */
  getAccountTree: async (
    tenantId: string,
    accountType?: number
  ): Promise<AccountTreeDto[]> => {
    const url = accountType
      ? `${getBaseUrl(tenantId)}/tree?accountType=${accountType}`
      : `${getBaseUrl(tenantId)}/tree`

    const response = await apiClient.getRaw<AccountTreeDto[]>(url)
    return response.data
  },

  /**
   * Get accounts for lookup (dropdown/select)
   */
  getAccountLookup: async (
    tenantId: string,
    accountType?: number,
    allowPosting?: boolean
  ): Promise<AccountLookupDto[]> => {
    const searchParams = new URLSearchParams()
    if (accountType !== undefined)
      searchParams.set("accountType", String(accountType))
    if (allowPosting !== undefined)
      searchParams.set("allowPosting", String(allowPosting))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/lookup${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<AccountLookupDto[]>(url)
    return response.data
  },

  /**
   * Create a new account
   */
  createAccount: async (
    tenantId: string,
    data: CreateAccountRequest
  ): Promise<AccountDto> => {
    const response = await apiClient.postRaw<AccountDto>(
      getBaseUrl(tenantId),
      data
    )
    return response.data
  },

  /**
   * Update an existing account
   */
  updateAccount: async (
    tenantId: string,
    id: string,
    data: UpdateAccountRequest
  ): Promise<AccountDto> => {
    const response = await apiClient.putRaw<AccountDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete an account (soft delete)
   */
  deleteAccount: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Check if account code exists
   */
  checkAccountCode: async (
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
   * Check if account has transactions
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
   * Get account summary with balances
   */
  getAccountSummary: async (
    tenantId: string,
    id: string,
    asOfDate?: string
  ): Promise<AccountSummaryDto> => {
    const url = asOfDate
      ? `${getBaseUrl(tenantId)}/${id}/summary?asOfDate=${asOfDate}`
      : `${getBaseUrl(tenantId)}/${id}/summary`

    const response = await apiClient.getRaw<AccountSummaryDto>(url)
    return response.data
  },

  /**
   * Get account ledger with transaction details
   */
  getAccountLedger: async (
    tenantId: string,
    id: string,
    fromDate?: string,
    toDate?: string
  ): Promise<AccountLedgerDto> => {
    const searchParams = new URLSearchParams()
    if (fromDate) searchParams.set("fromDate", fromDate)
    if (toDate) searchParams.set("toDate", toDate)

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/${id}/ledger${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<AccountLedgerDto>(url)
    return response.data
  },

  /**
   * Get trial balance as of a specific date
   */
  getTrialBalance: async (
    tenantId: string,
    asOfDate?: string,
    fiscalPeriodId?: string
  ): Promise<TrialBalanceDto> => {
    const searchParams = new URLSearchParams()
    if (asOfDate) searchParams.set("asOfDate", asOfDate)
    if (fiscalPeriodId) searchParams.set("fiscalPeriodId", fiscalPeriodId)

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/trial-balance${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<TrialBalanceDto>(url)
    return response.data
  },
}
