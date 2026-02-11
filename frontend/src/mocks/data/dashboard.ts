import type {
  DashboardSummaryDto,
  DashboardMetricDto,
  MonthlyTrendDto,
  AgingBucketDto,
  TopAccountDto,
} from '../../features/dashboard/types'

// ── Metric cards ────────────────────────────────────────────

const totalRevenue: DashboardMetricDto = {
  currentValue: 2450000,
  previousValue: 2180000,
  changePercent: 12.4,
  currencyCode: 'USD',
}

const apOutstanding: DashboardMetricDto = {
  currentValue: 385000,
  previousValue: 420000,
  changePercent: -8.3,
  currencyCode: 'USD',
}

const arOutstanding: DashboardMetricDto = {
  currentValue: 520000,
  previousValue: 475000,
  changePercent: 9.5,
  currencyCode: 'USD',
}

const totalAssets: DashboardMetricDto = {
  currentValue: 5850000,
  previousValue: 5900000,
  changePercent: -0.8,
  currencyCode: 'USD',
}

// ── Revenue trend (12 months) ───────────────────────────────
// Seasonal hotel pattern: high Dec-Mar (peak season), dip May-Jun, moderate rest
const revenueTrend: MonthlyTrendDto[] = [
  { month: '2025-01', amount: 280000 },
  { month: '2025-02', amount: 265000 },
  { month: '2025-03', amount: 245000 },
  { month: '2025-04', amount: 195000 },
  { month: '2025-05', amount: 155000 },
  { month: '2025-06', amount: 140000 },
  { month: '2025-07', amount: 168000 },
  { month: '2025-08', amount: 172000 },
  { month: '2025-09', amount: 160000 },
  { month: '2025-10', amount: 190000 },
  { month: '2025-11', amount: 220000 },
  { month: '2025-12', amount: 260000 },
]

// ── Expense trend (12 months) ───────────────────────────────
// Relatively stable with slight increase during peak season
const expenseTrend: MonthlyTrendDto[] = [
  { month: '2025-01', amount: 195000 },
  { month: '2025-02', amount: 188000 },
  { month: '2025-03', amount: 182000 },
  { month: '2025-04', amount: 165000 },
  { month: '2025-05', amount: 148000 },
  { month: '2025-06', amount: 142000 },
  { month: '2025-07', amount: 150000 },
  { month: '2025-08', amount: 153000 },
  { month: '2025-09', amount: 147000 },
  { month: '2025-10', amount: 162000 },
  { month: '2025-11', amount: 175000 },
  { month: '2025-12', amount: 192000 },
]

// ── AP Aging Summary ────────────────────────────────────────
const apAgingSummary: AgingBucketDto[] = [
  { label: 'Current',  amount: 185000, count: 24 },
  { label: '1-30',     amount: 95000,  count: 12 },
  { label: '31-60',    amount: 55000,  count: 7 },
  { label: '61-90',    amount: 32000,  count: 4 },
  { label: '90+',      amount: 18000,  count: 2 },
]

// ── AR Aging Summary ────────────────────────────────────────
const arAgingSummary: AgingBucketDto[] = [
  { label: 'Current',  amount: 240000, count: 18 },
  { label: '1-30',     amount: 135000, count: 10 },
  { label: '31-60',    amount: 82000,  count: 6 },
  { label: '61-90',    amount: 40000,  count: 3 },
  { label: '90+',      amount: 23000,  count: 2 },
]

// ── Top Expense Accounts ────────────────────────────────────
const topExpenseAccounts: TopAccountDto[] = [
  { accountCode: '5100-001', accountName: 'Food & Beverage Cost',     amount: 420000 },
  { accountCode: '5200-001', accountName: 'Salaries & Wages',         amount: 380000 },
  { accountCode: '5300-001', accountName: 'Utilities',                amount: 185000 },
  { accountCode: '5400-001', accountName: 'Sales & Marketing',        amount: 125000 },
  { accountCode: '5500-001', accountName: 'Repairs & Maintenance',    amount: 98000 },
]

// ── Full Summary Export ─────────────────────────────────────
export const mockDashboardSummary: DashboardSummaryDto = {
  totalRevenue,
  apOutstanding,
  arOutstanding,
  totalAssets,
  revenueTrend,
  expenseTrend,
  apAgingSummary,
  arAgingSummary,
  topExpenseAccounts,
}
