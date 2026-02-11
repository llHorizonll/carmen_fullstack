import type { DepreciationScheduleDto } from "../assets/types"

export type { DepreciationScheduleDto }

// List DTO for depreciation schedules
export interface DepreciationScheduleListDto {
  id: string
  assetId: string
  assetCode: string
  assetName: string
  categoryName: string
  fiscalPeriodId: string
  fiscalPeriodName: string
  scheduleNumber: number
  scheduleDate: string
  openingValue: number
  depreciationAmount: number
  closingValue: number
  accumulatedDepreciation: number
  currencyCode: string
  isPosted: boolean
  postedAt?: string
}

// Request DTOs
export interface RunDepreciationRequest {
  fiscalPeriodId: string
  autoPost?: boolean
}

// Summary DTOs
export interface DepreciationSummaryDto {
  fiscalPeriodId: string
  fiscalPeriodName: string
  totalAssets: number
  assetsDepreciated: number
  totalDepreciation: number
  totalDepreciationBase: number
  postedAmount: number
  pendingAmount: number
  postedCount: number
  pendingCount: number
  currencyCode: string
}

export interface DepreciationForecastDto {
  month: number
  periodDate: string
  openingValue: number
  depreciationAmount: number
  closingValue: number
  accumulatedDepreciation: number
  isProjected: boolean
}

// Query Parameters
export interface DepreciationQueryParams {
  assetId?: string
  fiscalPeriodId?: string
  isPosted?: boolean
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDescending?: boolean
}
