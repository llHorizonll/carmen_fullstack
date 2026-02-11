// Department DTOs
export interface DepartmentDto {
  id: string
  departmentCode: string
  departmentName: string
  departmentNameLocal?: string
  parentDepartmentId?: string
  parentDepartmentName?: string
  level: number
  description?: string
  costCenterCode?: string
  managerName?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface DepartmentListDto {
  id: string
  departmentCode: string
  departmentName: string
  parentDepartmentName?: string
  level: number
  costCenterCode?: string
  isActive: boolean
}

export interface DepartmentLookupDto {
  id: string
  departmentCode: string
  departmentName: string
  level: number
}

export interface DepartmentTreeDto {
  id: string
  departmentCode: string
  departmentName: string
  level: number
  isActive: boolean
  children: DepartmentTreeDto[]
}

// Request DTOs
export interface CreateDepartmentRequest {
  departmentCode: string
  departmentName: string
  departmentNameLocal?: string
  parentDepartmentId?: string
  description?: string
  costCenterCode?: string
  managerName?: string
  sortOrder?: number
}

export interface UpdateDepartmentRequest {
  departmentName: string
  departmentNameLocal?: string
  parentDepartmentId?: string
  description?: string
  costCenterCode?: string
  managerName?: string
  sortOrder: number
  isActive: boolean
}

// Query Parameters
export interface DepartmentQueryParams {
  search?: string
  isActive?: boolean
  parentDepartmentId?: string
  level?: number
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
