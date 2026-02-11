// Re-export categories module (excluding PaginatedResult to avoid conflicts)
export type {
  AssetCategoryDto,
  AssetCategoryListDto,
  AssetCategoryLookupDto,
  CreateAssetCategoryRequest,
  UpdateAssetCategoryRequest,
  AssetCategoryQueryParams,
} from "./categories/types"
export * from "./categories/api"
export {
  useAssetCategories,
  useAssetCategory,
  useAssetCategoryLookup,
  useCreateAssetCategory,
  useUpdateAssetCategory,
  useDeleteAssetCategory,
  useCheckCategoryCode,
  // Note: useGenerateAssetCode from categories is not exported here to avoid conflict with assets
} from "./categories/hooks"
export * from "./categories/pages"

// Re-export assets module (PaginatedResult is defined here)
export * from "./assets/types"
export * from "./assets/api"
export * from "./assets/hooks"
export * from "./assets/pages"

// Re-export depreciation module (excluding duplicate types)
export type {
  DepreciationScheduleListDto,
  RunDepreciationRequest,
  DepreciationSummaryDto,
  DepreciationForecastDto,
  DepreciationQueryParams,
} from "./depreciation/types"
export * from "./depreciation/api"
export * from "./depreciation/hooks"
export * from "./depreciation/pages"
