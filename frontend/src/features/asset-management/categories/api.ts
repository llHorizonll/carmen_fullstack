import { apiClient } from "@/lib/api-client"
import type {
  AssetCategoryDto,
  AssetCategoryListDto,
  AssetCategoryLookupDto,
  AssetCategoryQueryParams,
  CreateAssetCategoryRequest,
  UpdateAssetCategoryRequest,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/asset-categories`

export const assetCategoriesApi = {
  /**
   * Get paginated list of asset categories
   */
  getCategories: async (
    tenantId: string,
    params?: AssetCategoryQueryParams
  ): Promise<PaginatedResult<AssetCategoryListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.isActive !== undefined) searchParams.set("isActive", String(params.isActive))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined) searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<AssetCategoryListDto>>(url)
    return response.data
  },

  /**
   * Get category by ID
   */
  getCategory: async (tenantId: string, id: string): Promise<AssetCategoryDto> => {
    const response = await apiClient.getRaw<AssetCategoryDto>(`${getBaseUrl(tenantId)}/${id}`)
    return response.data
  },

  /**
   * Get category by code
   */
  getCategoryByCode: async (tenantId: string, categoryCode: string): Promise<AssetCategoryDto> => {
    const response = await apiClient.getRaw<AssetCategoryDto>(
      `${getBaseUrl(tenantId)}/by-code/${categoryCode}`
    )
    return response.data
  },

  /**
   * Create a new category
   */
  createCategory: async (
    tenantId: string,
    data: CreateAssetCategoryRequest
  ): Promise<AssetCategoryDto> => {
    const response = await apiClient.postRaw<AssetCategoryDto>(getBaseUrl(tenantId), data)
    return response.data
  },

  /**
   * Update an existing category
   */
  updateCategory: async (
    tenantId: string,
    id: string,
    data: UpdateAssetCategoryRequest
  ): Promise<AssetCategoryDto> => {
    const response = await apiClient.putRaw<AssetCategoryDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete a category
   */
  deleteCategory: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Get category lookup list for dropdowns
   */
  getCategoryLookup: async (
    tenantId: string,
    search?: string
  ): Promise<AssetCategoryLookupDto[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : ""
    const response = await apiClient.getRaw<AssetCategoryLookupDto[]>(
      `${getBaseUrl(tenantId)}/lookup${params}`
    )
    return response.data
  },

  /**
   * Check if category code is unique
   */
  isCategoryCodeUnique: async (
    tenantId: string,
    categoryCode: string,
    excludeId?: string
  ): Promise<boolean> => {
    const params = excludeId ? `?excludeId=${excludeId}` : ""
    const response = await apiClient.getRaw<{ isUnique: boolean }>(
      `${getBaseUrl(tenantId)}/check-code/${categoryCode}${params}`
    )
    return response.data.isUnique
  },

  /**
   * Generate next asset code for a category
   */
  generateAssetCode: async (tenantId: string, categoryId: string): Promise<string> => {
    const response = await apiClient.getRaw<{ assetCode: string }>(
      `${getBaseUrl(tenantId)}/${categoryId}/next-asset-code`
    )
    return response.data.assetCode
  },
}
