import { uuid } from './common'
import {
  PredefinedReportType,
  OutputFormat,
  DataSourceType,
  ColumnType,
  AggregateFunction,
  SortDirection,
  PageOrientation,
} from '../../features/reports/types'
import type {
  PredefinedReportInfo,
  ReportTemplateListDto,
  ReportTemplateDto,
} from '../../features/reports/types'

// ── Predefined Reports ──────────────────────────────────────

export const mockPredefinedReports: PredefinedReportInfo[] = [
  {
    type: PredefinedReportType.TrialBalance,
    name: 'Trial Balance',
    description: 'Lists all general ledger accounts with their debit and credit balances for a selected period.',
    category: 'General Ledger',
    icon: 'Scale',
  },
  {
    type: PredefinedReportType.BalanceSheet,
    name: 'Balance Sheet',
    description: 'Statement of financial position showing assets, liabilities, and equity as of a specific date.',
    category: 'General Ledger',
    icon: 'Landmark',
  },
  {
    type: PredefinedReportType.IncomeStatement,
    name: 'Income Statement',
    description: 'Profit and loss statement summarising revenues, expenses, and net income for the period.',
    category: 'General Ledger',
    icon: 'TrendingUp',
  },
  {
    type: PredefinedReportType.GeneralLedgerDetail,
    name: 'General Ledger Detail',
    description: 'Detailed transaction listing for selected GL accounts with opening and closing balances.',
    category: 'General Ledger',
    icon: 'BookOpen',
  },
  {
    type: PredefinedReportType.JournalVoucherListing,
    name: 'Journal Voucher Listing',
    description: 'Chronological listing of all posted journal vouchers with line details.',
    category: 'General Ledger',
    icon: 'FileText',
  },
  {
    type: PredefinedReportType.ApAging,
    name: 'AP Aging Report',
    description: 'Accounts payable aging analysis grouped by vendor with current, 30, 60, 90, and 90+ day buckets.',
    category: 'Accounts Payable',
    icon: 'Clock',
  },
  {
    type: PredefinedReportType.ArAging,
    name: 'AR Aging Report',
    description: 'Accounts receivable aging analysis grouped by customer with current, 30, 60, 90, and 90+ day buckets.',
    category: 'Accounts Receivable',
    icon: 'Clock',
  },
  {
    type: PredefinedReportType.AssetRegister,
    name: 'Asset Register',
    description: 'Complete register of all fixed assets with acquisition cost, accumulated depreciation, and net book value.',
    category: 'Asset Management',
    icon: 'Building2',
  },
  {
    type: PredefinedReportType.DepreciationSchedule,
    name: 'Depreciation Schedule',
    description: 'Monthly depreciation schedule for all active assets showing opening value, depreciation, and closing value.',
    category: 'Asset Management',
    icon: 'Calculator',
  },
]

// ── Custom Report Templates ─────────────────────────────────

export const mockReportTemplates: ReportTemplateListDto[] = [
  {
    id: uuid('rtpl', 1),
    name: 'Monthly Department Expense Summary',
    description: 'Expense breakdown by department with month-over-month comparison',
    dataSourceType: DataSourceType.GeneralLedger,
    isPublic: true,
    defaultOutputFormat: OutputFormat.Excel,
    createdAt: '2025-06-15T10:00:00Z',
    createdBy: 'Waraporn Thongchai',
  },
  {
    id: uuid('rtpl', 2),
    name: 'Vendor Payment History',
    description: 'Payment transaction listing by vendor with aging and payment terms compliance',
    dataSourceType: DataSourceType.AccountsPayable,
    isPublic: true,
    defaultOutputFormat: OutputFormat.Pdf,
    createdAt: '2025-08-20T14:30:00Z',
    createdBy: 'Natthapong Suwan',
  },
  {
    id: uuid('rtpl', 3),
    name: 'Asset Depreciation Forecast',
    description: 'Projected depreciation for the next 12 months by asset category',
    dataSourceType: DataSourceType.AssetManagement,
    isPublic: false,
    defaultOutputFormat: OutputFormat.Excel,
    createdAt: '2025-10-05T09:00:00Z',
    createdBy: 'Waraporn Thongchai',
  },
]

// ── Full template detail (for template editor) ──────────────

export const mockReportTemplateDetails: ReportTemplateDto[] = [
  {
    id: uuid('rtpl', 1),
    name: 'Monthly Department Expense Summary',
    description: 'Expense breakdown by department with month-over-month comparison',
    dataSourceType: DataSourceType.GeneralLedger,
    isPublic: true,
    defaultOutputFormat: OutputFormat.Excel,
    pageOrientation: PageOrientation.Landscape,
    columns: [
      {
        id: uuid('rtcl', 1),
        fieldName: 'departmentName',
        displayName: 'Department',
        columnType: ColumnType.Text,
        width: 200,
        order: 1,
        aggregateFunction: AggregateFunction.None,
        sortDirection: SortDirection.Ascending,
        sortOrder: 1,
      },
      {
        id: uuid('rtcl', 2),
        fieldName: 'accountCode',
        displayName: 'Account Code',
        columnType: ColumnType.Text,
        width: 120,
        order: 2,
        aggregateFunction: AggregateFunction.None,
        sortDirection: undefined,
        sortOrder: undefined,
      },
      {
        id: uuid('rtcl', 3),
        fieldName: 'accountName',
        displayName: 'Account Name',
        columnType: ColumnType.Text,
        width: 250,
        order: 3,
        aggregateFunction: AggregateFunction.None,
        sortDirection: undefined,
        sortOrder: undefined,
      },
      {
        id: uuid('rtcl', 4),
        fieldName: 'amount',
        displayName: 'Amount',
        columnType: ColumnType.Currency,
        width: 150,
        order: 4,
        aggregateFunction: AggregateFunction.Sum,
        sortDirection: undefined,
        sortOrder: undefined,
      },
    ],
    filters: [],
    groups: [
      {
        id: uuid('rtgr', 1),
        fieldName: 'departmentName',
        order: 1,
        showSubtotals: true,
        sortDirection: SortDirection.Ascending,
      },
    ],
  },
]
