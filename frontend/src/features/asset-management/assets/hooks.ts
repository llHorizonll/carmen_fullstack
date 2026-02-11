import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { assetsApi } from "./api"
import type {
  AssetQueryParams,
  CreateAssetRequest,
  UpdateAssetRequest,
  DisposeAssetRequest,
  TransferAssetRequest,
  AssetStatus,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const ASSETS_QUERY_KEY = "assets"

/**
 * Hook for fetching paginated assets list
 */
export function useAssets(params?: AssetQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSETS_QUERY_KEY, tenantId, params],
    queryFn: () => assetsApi.getAssets(tenantId, params),
  })
}

/**
 * Hook for fetching a single asset by ID
 */
export function useAsset(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSETS_QUERY_KEY, tenantId, id],
    queryFn: () => assetsApi.getAsset(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching asset lookup list
 */
export function useAssetLookup(search?: string, status?: AssetStatus) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSETS_QUERY_KEY, tenantId, "lookup", search, status],
    queryFn: () => assetsApi.getAssetLookup(tenantId, search, status),
  })
}

/**
 * Hook for creating a new asset
 */
export function useCreateAsset() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAssetRequest) =>
      assetsApi.createAsset(tenantId, data),
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success(`Asset "${asset.assetCode}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create asset")
    },
  })
}

/**
 * Hook for updating an asset
 */
export function useUpdateAsset() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetRequest }) =>
      assetsApi.updateAsset(tenantId, id, data),
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success(`Asset "${asset.assetCode}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update asset")
    },
  })
}

/**
 * Hook for deleting an asset
 */
export function useDeleteAsset() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => assetsApi.deleteAsset(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success("Asset deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete asset")
    },
  })
}

/**
 * Hook for disposing an asset
 */
export function useDisposeAsset() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DisposeAssetRequest }) =>
      assetsApi.disposeAsset(tenantId, id, data),
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success(`Asset "${asset.assetCode}" disposed successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to dispose asset")
    },
  })
}

/**
 * Hook for transferring an asset
 */
export function useTransferAsset() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransferAssetRequest }) =>
      assetsApi.transferAsset(tenantId, id, data),
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success(`Asset "${asset.assetCode}" transferred successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to transfer asset")
    },
  })
}

/**
 * Hook for posting disposal to GL
 */
export function usePostDisposal() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => assetsApi.postDisposal(tenantId, id),
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success(`Disposal for asset "${asset.assetCode}" posted successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to post disposal")
    },
  })
}

/**
 * Hook for recalculating asset value
 */
export function useRecalculateAssetValue() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => assetsApi.recalculateAssetValue(tenantId, id),
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success(`Asset "${asset.assetCode}" value recalculated`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to recalculate asset value")
    },
  })
}

/**
 * Hook for checking asset code uniqueness
 */
export function useCheckAssetCode(assetCode: string, excludeId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSETS_QUERY_KEY, tenantId, "check-code", assetCode, excludeId],
    queryFn: () => assetsApi.isAssetCodeUnique(tenantId, assetCode, excludeId),
    enabled: assetCode.length >= 2,
  })
}

/**
 * Hook for generating next asset code
 */
export function useGenerateAssetCode(categoryId: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSETS_QUERY_KEY, tenantId, categoryId, "next-code"],
    queryFn: () => assetsApi.generateAssetCode(tenantId, categoryId!),
    enabled: !!categoryId,
  })
}

/**
 * Hook for fetching asset register report
 */
export function useAssetRegister(
  categoryId?: string,
  departmentId?: string,
  status?: AssetStatus,
  asOfDate?: string
) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ASSETS_QUERY_KEY, tenantId, "register", categoryId, departmentId, status, asOfDate],
    queryFn: () => assetsApi.getAssetRegister(tenantId, categoryId, departmentId, status, asOfDate),
  })
}
