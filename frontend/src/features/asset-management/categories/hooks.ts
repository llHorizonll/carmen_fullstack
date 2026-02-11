import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { assetCategoriesApi } from "./api"
import type {
  AssetCategoryQueryParams,
  CreateAssetCategoryRequest,
  UpdateAssetCategoryRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const ASSET_CATEGORIES_QUERY_KEY = "asset-categories"

/**
 * Hook for fetching paginated asset categories list
 */
export function useAssetCategories(params?: AssetCategoryQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSET_CATEGORIES_QUERY_KEY, tenantId, params],
    queryFn: () => assetCategoriesApi.getCategories(tenantId, params),
  })
}

/**
 * Hook for fetching a single asset category by ID
 */
export function useAssetCategory(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSET_CATEGORIES_QUERY_KEY, tenantId, id],
    queryFn: () => assetCategoriesApi.getCategory(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching asset category lookup list
 */
export function useAssetCategoryLookup(search?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSET_CATEGORIES_QUERY_KEY, tenantId, "lookup", search],
    queryFn: () => assetCategoriesApi.getCategoryLookup(tenantId, search),
  })
}

/**
 * Hook for creating a new asset category
 */
export function useCreateAssetCategory() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAssetCategoryRequest) =>
      assetCategoriesApi.createCategory(tenantId, data),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: [ASSET_CATEGORIES_QUERY_KEY, tenantId] })
      toast.success(`Asset category "${category.categoryCode}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create asset category")
    },
  })
}

/**
 * Hook for updating an asset category
 */
export function useUpdateAssetCategory() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetCategoryRequest }) =>
      assetCategoriesApi.updateCategory(tenantId, id, data),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: [ASSET_CATEGORIES_QUERY_KEY, tenantId] })
      toast.success(`Asset category "${category.categoryCode}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update asset category")
    },
  })
}

/**
 * Hook for deleting an asset category
 */
export function useDeleteAssetCategory() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => assetCategoriesApi.deleteCategory(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSET_CATEGORIES_QUERY_KEY, tenantId] })
      toast.success("Asset category deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete asset category")
    },
  })
}

/**
 * Hook for checking category code uniqueness
 */
export function useCheckCategoryCode(categoryCode: string, excludeId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSET_CATEGORIES_QUERY_KEY, tenantId, "check-code", categoryCode, excludeId],
    queryFn: () => assetCategoriesApi.isCategoryCodeUnique(tenantId, categoryCode, excludeId),
    enabled: categoryCode.length >= 2,
  })
}

/**
 * Hook for generating next asset code
 */
export function useGenerateAssetCode(categoryId: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSET_CATEGORIES_QUERY_KEY, tenantId, categoryId, "next-asset-code"],
    queryFn: () => assetCategoriesApi.generateAssetCode(tenantId, categoryId!),
    enabled: !!categoryId,
  })
}
