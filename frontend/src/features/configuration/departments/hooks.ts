import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { departmentsApi } from "./api"
import type {
  DepartmentQueryParams,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const DEPARTMENTS_QUERY_KEY = "departments"

/**
 * Hook for fetching paginated departments list
 */
export function useDepartments(params?: DepartmentQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPARTMENTS_QUERY_KEY, tenantId, params],
    queryFn: () => departmentsApi.getDepartments(tenantId, params),
  })
}

/**
 * Hook for fetching a single department by ID
 */
export function useDepartment(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPARTMENTS_QUERY_KEY, tenantId, id],
    queryFn: () => departmentsApi.getDepartment(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching a department by code
 */
export function useDepartmentByCode(code: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPARTMENTS_QUERY_KEY, tenantId, "code", code],
    queryFn: () => departmentsApi.getDepartmentByCode(tenantId, code!),
    enabled: !!code,
  })
}

/**
 * Hook for fetching departments for lookup (dropdown)
 */
export function useDepartmentLookup(isActive?: boolean, excludeId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPARTMENTS_QUERY_KEY, tenantId, "lookup", isActive, excludeId],
    queryFn: () => departmentsApi.getDepartmentLookup(tenantId, isActive, excludeId),
  })
}

/**
 * Hook for fetching department tree
 */
export function useDepartmentTree(isActive?: boolean) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPARTMENTS_QUERY_KEY, tenantId, "tree", isActive],
    queryFn: () => departmentsApi.getDepartmentTree(tenantId, isActive),
  })
}

/**
 * Hook for creating a new department
 */
export function useCreateDepartment() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) =>
      departmentsApi.createDepartment(tenantId, data),
    onSuccess: (department) => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY, tenantId] })
      toast.success(`Department "${department.departmentCode}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create department")
    },
  })
}

/**
 * Hook for updating a department
 */
export function useUpdateDepartment() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
      departmentsApi.updateDepartment(tenantId, id, data),
    onSuccess: (department) => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY, tenantId] })
      toast.success(`Department "${department.departmentCode}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update department")
    },
  })
}

/**
 * Hook for deleting a department
 */
export function useDeleteDepartment() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => departmentsApi.deleteDepartment(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY, tenantId] })
      toast.success("Department deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete department")
    },
  })
}

/**
 * Hook for checking if department code exists
 */
export function useCheckDepartmentCode(code: string | undefined, excludeId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPARTMENTS_QUERY_KEY, tenantId, "check-code", code, excludeId],
    queryFn: () => departmentsApi.checkDepartmentCode(tenantId, code!, excludeId),
    enabled: !!code && code.length > 0,
  })
}

/**
 * Hook for checking if department has references
 */
export function useCheckDepartmentHasReferences(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPARTMENTS_QUERY_KEY, tenantId, id, "has-references"],
    queryFn: () => departmentsApi.checkHasReferences(tenantId, id!),
    enabled: !!id,
  })
}
