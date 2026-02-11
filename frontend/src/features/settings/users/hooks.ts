import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi, userRolesApi } from "./api"
import type { UpdateUserRolesRequest, UserQueryParams } from "./types"
import { toast } from "sonner"

const USERS_QUERY_KEY = "users"
const USER_QUERY_KEY = "user"
const USER_ROLES_QUERY_KEY = "user-roles"

/**
 * Hook for fetching paginated users list
 */
export function useUsers(params: UserQueryParams) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: () => usersApi.getUsers(params),
  })
}

/**
 * Hook for fetching single user by ID
 */
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: [USER_QUERY_KEY, id],
    queryFn: () => usersApi.getUser(id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching user roles
 */
export function useUserRoles(userId: string | undefined) {
  return useQuery({
    queryKey: [USER_ROLES_QUERY_KEY, userId],
    queryFn: () => userRolesApi.getUserRoles(userId!),
    enabled: !!userId,
  })
}

/**
 * Hook for updating user roles
 */
export function useUpdateUserRoles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRolesRequest }) =>
      userRolesApi.updateUserRoles(userId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [USER_ROLES_QUERY_KEY] })
      toast.success(`Roles for "${result.fullName}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user roles")
    },
  })
}
