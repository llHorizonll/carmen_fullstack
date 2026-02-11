export enum PredefinedReportType {
  TrialBalance = "TrialBalance",
  BalanceSheet = "BalanceSheet",
  IncomeStatement = "IncomeStatement",
  GeneralLedgerDetail = "GeneralLedgerDetail",
  JournalVoucherListing = "JournalVoucherListing",
  ApAging = "ApAging",
  ArAging = "ArAging",
  AssetRegister = "AssetRegister",
  DepreciationSchedule = "DepreciationSchedule",
}

export enum OutputFormat {
  Pdf = 0,
  Excel = 1,
}

export interface PredefinedReportInfo {
  type: PredefinedReportType
  name: string
  description: string
  category: string
  icon: string
}

export interface ReportParameterDefinition {
  name: string
  label: string
  parameterType: string
  isRequired: boolean
  defaultValue?: string
  options?: ReportParameterOption[]
}

export interface ReportParameterOption {
  value: string
  label: string
}

export interface ReportColumnDefinition {
  fieldName: string
  displayName: string
  columnType: number
  width: number
  aggregateFunction: number
}

export interface ReportGroupDefinition {
  fieldName: string
  displayName: string
  showSubtotals: boolean
}

export interface ReportDataSet {
  reportTitle: string
  reportSubtitle?: string
  generatedAt: string
  columns: ReportColumnDefinition[]
  rows: Record<string, unknown>[]
  groups?: ReportGroupDefinition[]
  grandTotals?: Record<string, unknown>
}

export interface GenerateReportRequest {
  reportType: PredefinedReportType
  outputFormat: OutputFormat
  parameters: Record<string, string>
}

// ─── Data Sources ────────────────────────────────────────────

export enum DataSourceType {
  GeneralLedger = 0,
  AccountsPayable = 1,
  AccountsReceivable = 2,
  AssetManagement = 3,
}

export interface DataSourceInfo {
  type: DataSourceType
  name: string
}

export interface ReportFieldDefinition {
  fieldName: string
  displayName: string
  columnType: number
  isFilterable: boolean
  isGroupable: boolean
  isSortable: boolean
}

// ─── Column Type / Aggregate / Filter enums ──────────────────

export enum ColumnType {
  Text = 0,
  Number = 1,
  Currency = 2,
  Date = 3,
  Boolean = 4,
  Percentage = 5,
}

export enum AggregateFunction {
  None = 0,
  Sum = 1,
  Count = 2,
  Average = 3,
  Min = 4,
  Max = 5,
}

export enum FilterOperator {
  Equals = 0,
  NotEquals = 1,
  Contains = 2,
  StartsWith = 3,
  EndsWith = 4,
  GreaterThan = 5,
  GreaterThanOrEqual = 6,
  LessThan = 7,
  LessThanOrEqual = 8,
  Between = 9,
  In = 10,
  IsNull = 11,
  IsNotNull = 12,
}

export enum SortDirection {
  Ascending = 0,
  Descending = 1,
}

export enum PageOrientation {
  Portrait = 0,
  Landscape = 1,
}

// ─── Report Templates ────────────────────────────────────────

export interface ReportTemplateListDto {
  id: string
  name: string
  description?: string
  dataSourceType: DataSourceType
  isPublic: boolean
  defaultOutputFormat: OutputFormat
  createdAt: string
  createdBy: string
}

export interface ReportTemplateDto {
  id: string
  name: string
  description?: string
  dataSourceType: DataSourceType
  isPublic: boolean
  defaultOutputFormat: OutputFormat
  pageOrientation: PageOrientation
  columns: ReportTemplateColumnDto[]
  filters: ReportTemplateFilterDto[]
  groups: ReportTemplateGroupDto[]
}

export interface ReportTemplateColumnDto {
  id?: string
  fieldName: string
  displayName: string
  columnType: ColumnType
  width: number
  order: number
  aggregateFunction: AggregateFunction
  sortDirection?: SortDirection
  sortOrder?: number
}

export interface ReportTemplateFilterDto {
  id?: string
  fieldName: string
  operator: FilterOperator
  value?: string
  value2?: string
}

export interface ReportTemplateGroupDto {
  id?: string
  fieldName: string
  order: number
  showSubtotals: boolean
  sortDirection: SortDirection
}

export interface CreateReportTemplateRequest {
  name: string
  description?: string
  dataSourceType: DataSourceType
  isPublic: boolean
  defaultOutputFormat: OutputFormat
  pageOrientation: PageOrientation
  columns: ReportTemplateColumnDto[]
  filters?: ReportTemplateFilterDto[]
  groups?: ReportTemplateGroupDto[]
}

export interface UpdateReportTemplateRequest {
  name: string
  description?: string
  isPublic: boolean
  defaultOutputFormat: OutputFormat
  pageOrientation: PageOrientation
  columns: ReportTemplateColumnDto[]
  filters?: ReportTemplateFilterDto[]
  groups?: ReportTemplateGroupDto[]
}

export interface CustomReportGenerateRequest {
  outputFormat: OutputFormat
  runtimeFilters?: Record<string, string>
}
