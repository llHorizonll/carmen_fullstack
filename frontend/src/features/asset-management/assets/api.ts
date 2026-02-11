import { apiClient } from "@/lib/api-client"
import type {
  AssetDto,
  AssetListDto,
  AssetLookupDto,
  AssetQueryParams,
  CreateAssetRequest,
  UpdateAssetRequest,
  DisposeAssetRequest,
  TransferAssetRequest,
  AssetRegisterDto,
  AssetStatus,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/assets`

export const assetsApi = {
  /**
   * Get paginated list of assets
   */
  getAssets: async (
    tenantId: string,
    params?: AssetQueryParams
  ): Promise<PaginatedResult<AssetListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId)
    if (params?.status !== undefined) searchParams.set("status", String(params.status))
    if (params?.departmentId) searchParams.set("departmentId", params.departmentId)
    if (params?.acquisitionDateFrom) searchParams.set("acquisitionDateFrom", params.acquisitionDateFrom)
    if (params?.acquisitionDateTo) searchParams.set("acquisitionDateTo", params.acquisitionDateTo)
    if (params?.isFullyDepreciated !== undefined) searchParams.set("isFullyDepreciated", String(params.isFullyDepreciated))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined) searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<AssetListDto>>(url)
    return response.data
  },

  /**
   * Get asset by ID
   */
  getAsset: async (tenantId: string, id: string): Promise<AssetDto> => {
    const response = await apiClient.getRaw<AssetDto>(`${getBaseUrl(tenantId)}/${id}`)
    return response.data
  },

  /**
   * Get asset by code
   */
  getAssetByCode: async (tenantId: string, assetCode: string): Promise<AssetDto> => {
    const response = await apiClient.getRaw<AssetDto>(
      `${getBaseUrl(tenantId)}/by-code/${assetCode}`
    )
    return response.data
  },

  /**
   * Create a new asset
   */
  createAsset: async (
    tenantId: string,
    data: CreateAssetRequest
  ): Promise<AssetDto> => {
    const response = await apiClient.postRaw<AssetDto>(getBaseUrl(tenantId), data)
    return response.data
  },

  /**
   * Update an existing asset
   */
  updateAsset: async (
    tenantId: string,
    id: string,
    data: UpdateAssetRequest
  ): Promise<AssetDto> => {
    const response = await apiClient.putRaw<AssetDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete an asset
   */
  deleteAsset: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Get asset lookup list for dropdowns
   */
  getAssetLookup: async (
    tenantId: string,
    search?: string,
    status?: AssetStatus
  ): Promise<AssetLookupDto[]> => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (status !== undefined) params.set("status", String(status))
    const queryString = params.toString()
    const response = await apiClient.getRaw<AssetLookupDto[]>(
      `${getBaseUrl(tenantId)}/lookup${queryString ? `?${queryString}` : ""}`
    )
    return response.data
  },

  /**
   * Dispose an asset
   */
  disposeAsset: async (
    tenantId: string,
    id: string,
    data: DisposeAssetRequest
  ): Promise<AssetDto> => {
    const response = await apiClient.postRaw<AssetDto>(
      `${getBaseUrl(tenantId)}/${id}/dispose`,
      data
    )
    return response.data
  },

  /**
   * Transfer an asset
   */
  transferAsset: async (
    tenantId: string,
    id: string,
    data: TransferAssetRequest
  ): Promise<AssetDto> => {
    const response = await apiClient.postRaw<AssetDto>(
      `${getBaseUrl(tenantId)}/${id}/transfer`,
      data
    )
    return response.data
  },

  /**
   * Post asset disposal to GL
   */
  postDisposal: async (tenantId: string, id: string): Promise<AssetDto> => {
    const response = await apiClient.postRaw<AssetDto>(
      `${getBaseUrl(tenantId)}/${id}/post-disposal`,
      {}
    )
    return response.data
  },

  /**
   * Recalculate asset value
   */
  recalculateAssetValue: async (tenantId: string, id: string): Promise<AssetDto> => {
    const response = await apiClient.postRaw<AssetDto>(
      `${getBaseUrl(tenantId)}/${id}/recalculate`,
      {}
    )
    return response.data
  },

  /**
   * Check if asset code is unique
   */
  isAssetCodeUnique: async (
    tenantId: string,
    assetCode: string,
    excludeId?: string
  ): Promise<boolean> => {
    const params = excludeId ? `?excludeId=${excludeId}` : ""
    const response = await apiClient.getRaw<{ isUnique: boolean }>(
      `${getBaseUrl(tenantId)}/check-code/${assetCode}${params}`
    )
    return response.data.isUnique
  },

  /**
   * Generate next asset code for a category
   */
  generateAssetCode: async (tenantId: string, categoryId: string): Promise<string> => {
    const response = await apiClient.getRaw<{ assetCode: string }>(
      `${getBaseUrl(tenantId)}/next-code/${categoryId}`
    )
    return response.data.assetCode
  },

  /**
   * Get asset register report
   */
  getAssetRegister: async (
    tenantId: string,
    categoryId?: string,
    departmentId?: string,
    status?: AssetStatus,
    asOfDate?: string
  ): Promise<AssetRegisterDto[]> => {
    const params = new URLSearchParams()
    if (categoryId) params.set("categoryId", categoryId)
    if (departmentId) params.set("departmentId", departmentId)
    if (status !== undefined) params.set("status", String(status))
    if (asOfDate) params.set("asOfDate", asOfDate)
    const queryString = params.toString()
    const response = await apiClient.getRaw<AssetRegisterDto[]>(
      `${getBaseUrl(tenantId)}/register${queryString ? `?${queryString}` : ""}`
    )
    return response.data
  },
}
