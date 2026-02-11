import type { DepreciationMethod } from "../assets/types"

// Response DTOs
export interface AssetCategoryDto {
  id: string
  categoryCode: string
  categoryName: string
  categoryNameLocal?: string
  description?: string
  isActive: boolean
  defaultUsefulLifeMonths: number
  defaultDepreciationMethod: DepreciationMethod
  defaultSalvagePercent: number
  defaultAssetAccountId?: string
  defaultAssetAccountCode?: string
  defaultAssetAccountName?: string
  defaultAccumDepreciationAccountId?: string
  defaultAccumDepreciationAccountCode?: string
  defaultAccumDepreciationAccountName?: string
  defaultDepreciationExpenseAccountId?: string
  defaultDepreciationExpenseAccountCode?: string
  defaultDepreciationExpenseAccountName?: string
  defaultGainLossAccountId?: string
  defaultGainLossAccountCode?: string
  defaultGainLossAccountName?: string
  assetCodePrefix?: string
  notes?: string
  assetCount: number
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export interface AssetCategoryListDto {
  id: string
  categoryCode: string
  categoryName: string
  description?: string
  isActive: boolean
  defaultUsefulLifeMonths: number
  defaultDepreciationMethod: DepreciationMethod
  defaultSalvagePercent: number
  assetCodePrefix?: string
  assetCount: number
  createdAt: string
}

export interface AssetCategoryLookupDto {
  id: string
  categoryCode: string
  categoryName: string
  defaultUsefulLifeMonths: number
  defaultDepreciationMethod: DepreciationMethod
  defaultSalvagePercent: number
  defaultAssetAccountId?: string
  defaultAccumDepreciationAccountId?: string
  defaultDepreciationExpenseAccountId?: string
  defaultGainLossAccountId?: string
  assetCodePrefix?: string
}

// Request DTOs
export interface CreateAssetCategoryRequest {
  categoryCode: string
  categoryName: string
  categoryNameLocal?: string
  description?: string
  defaultUsefulLifeMonths: number
  defaultDepreciationMethod: DepreciationMethod
  defaultSalvagePercent: number
  defaultAssetAccountId?: string
  defaultAccumDepreciationAccountId?: string
  defaultDepreciationExpenseAccountId?: string
  defaultGainLossAccountId?: string
  assetCodePrefix?: string
  notes?: string
}

export interface UpdateAssetCategoryRequest {
  categoryName: string
  categoryNameLocal?: string
  description?: string
  isActive: boolean
  defaultUsefulLifeMonths: number
  defaultDepreciationMethod: DepreciationMethod
  defaultSalvagePercent: number
  defaultAssetAccountId?: string
  defaultAccumDepreciationAccountId?: string
  defaultDepreciationExpenseAccountId?: string
  defaultGainLossAccountId?: string
  assetCodePrefix?: string
  notes?: string
}

// Query Parameters
export interface AssetCategoryQueryParams {
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
