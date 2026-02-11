// Types
export type {
  DepartmentDto,
  DepartmentListDto,
  DepartmentLookupDto,
  DepartmentTreeDto,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentQueryParams,
} from "./types"

// API
export { departmentsApi } from "./api"

// Hooks
export {
  useDepartments,
  useDepartment,
  useDepartmentByCode,
  useDepartmentLookup,
  useDepartmentTree,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useCheckDepartmentCode,
  useCheckDepartmentHasReferences,
} from "./hooks"

// Pages
export { DepartmentListPage, DepartmentFormPage } from "./pages"
