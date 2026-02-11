export interface DashboardMetricDto {
  currentValue: number
  previousValue: number
  changePercent: number
  currencyCode: string
}

export interface MonthlyTrendDto {
  month: string
  amount: number
}

export interface AgingBucketDto {
  label: string
  amount: number
  count: number
}

export interface TopAccountDto {
  accountCode: string
  accountName: string
  amount: number
}

export interface DashboardSummaryDto {
  totalRevenue: DashboardMetricDto
  apOutstanding: DashboardMetricDto
  arOutstanding: DashboardMetricDto
  totalAssets: DashboardMetricDto
  revenueTrend: MonthlyTrendDto[]
  expenseTrend: MonthlyTrendDto[]
  apAgingSummary: AgingBucketDto[]
  arAgingSummary: AgingBucketDto[]
  topExpenseAccounts: TopAccountDto[]
}
