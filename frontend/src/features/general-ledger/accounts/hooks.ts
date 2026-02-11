import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { accountsApi } from "./api"
import type {
  AccountQueryParams,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const ACCOUNTS_QUERY_KEY = "accounts"

/**
 * Hook for fetching paginated accounts list
 */
export function useAccounts(params?: AccountQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, tenantId, params],
    queryFn: () => accountsApi.getAccounts(tenantId, params),
  })
}

/**
 * Hook for fetching a single account by ID
 */
export function useAccount(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, tenantId, id],
    queryFn: () => accountsApi.getAccount(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching accounts tree structure
 */
export function useAccountTree(accountType?: number) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, tenantId, "tree", accountType],
    queryFn: () => accountsApi.getAccountTree(tenantId, accountType),
  })
}

/**
 * Hook for fetching accounts for lookup (dropdown/select)
 */
export function useAccountLookup(accountType?: number, allowPosting?: boolean) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, tenantId, "lookup", accountType, allowPosting],
    queryFn: () => accountsApi.getAccountLookup(tenantId, accountType, allowPosting),
  })
}

/**
 * Hook for creating a new account
 */
export function useCreateAccount() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAccountRequest) =>
      accountsApi.createAccount(tenantId, data),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEY, tenantId] })
      toast.success(`Account "${account.accountCode}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create account")
    },
  })
}

/**
 * Hook for updating an account
 */
export function useUpdateAccount() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountRequest }) =>
      accountsApi.updateAccount(tenantId, id, data),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEY, tenantId] })
      toast.success(`Account "${account.accountCode}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update account")
    },
  })
}

/**
 * Hook for deleting an account
 */
export function useDeleteAccount() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => accountsApi.deleteAccount(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_QUERY_KEY, tenantId] })
      toast.success("Account deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account")
    },
  })
}

/**
 * Hook for checking if account code exists
 */
export function useCheckAccountCode(code: string, excludeId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, tenantId, "check-code", code, excludeId],
    queryFn: () => accountsApi.checkAccountCode(tenantId, code, excludeId),
    enabled: code.length > 0,
  })
}

/**
 * Hook for checking if account has transactions
 */
export function useCheckHasTransactions(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, tenantId, id, "has-transactions"],
    queryFn: () => accountsApi.checkHasTransactions(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching account summary with balances
 */
export function useAccountSummary(id: string | undefined, asOfDate?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, tenantId, id, "summary", asOfDate],
    queryFn: () => accountsApi.getAccountSummary(tenantId, id!, asOfDate),
    enabled: !!id,
  })
}

/**
 * Hook for fetching account ledger with transaction details
 */
export function useAccountLedger(
  id: string | undefined,
  fromDate?: string,
  toDate?: string
) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, tenantId, id, "ledger", fromDate, toDate],
    queryFn: () => accountsApi.getAccountLedger(tenantId, id!, fromDate, toDate),
    enabled: !!id,
  })
}

/**
 * Hook for fetching trial balance
 */
export function useTrialBalance(asOfDate?: string, fiscalPeriodId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, tenantId, "trial-balance", asOfDate, fiscalPeriodId],
    queryFn: () => accountsApi.getTrialBalance(tenantId, asOfDate, fiscalPeriodId),
  })
}
