// Enums
export enum AssetStatus {
  Active = 0,
  Disposed = 1,
  Transferred = 2,
  Sold = 3,
  WrittenOff = 4,
}

export enum DepreciationMethod {
  StraightLine = 1,
  DecliningBalance = 2,
  DoubleDecliningBalance = 3,
  SumOfYearsDigits = 4,
  UnitsOfProduction = 5,
}

export enum AssetCondition {
  New = 1,
  Good = 2,
  Fair = 3,
  Poor = 4,
}

export enum DisposalMethod {
  Sale = 1,
  WriteOff = 2,
  Transfer = 3,
  Scrap = 4,
  Donation = 5,
}

export const assetStatusLabels: Record<AssetStatus, string> = {
  [AssetStatus.Active]: "Active",
  [AssetStatus.Disposed]: "Disposed",
  [AssetStatus.Transferred]: "Transferred",
  [AssetStatus.Sold]: "Sold",
  [AssetStatus.WrittenOff]: "Written Off",
}

export const depreciationMethodLabels: Record<DepreciationMethod, string> = {
  [DepreciationMethod.StraightLine]: "Straight Line",
  [DepreciationMethod.DecliningBalance]: "Declining Balance",
  [DepreciationMethod.DoubleDecliningBalance]: "Double Declining Balance",
  [DepreciationMethod.SumOfYearsDigits]: "Sum of Years' Digits",
  [DepreciationMethod.UnitsOfProduction]: "Units of Production",
}

export const assetConditionLabels: Record<AssetCondition, string> = {
  [AssetCondition.New]: "New",
  [AssetCondition.Good]: "Good",
  [AssetCondition.Fair]: "Fair",
  [AssetCondition.Poor]: "Poor",
}

export const disposalMethodLabels: Record<DisposalMethod, string> = {
  [DisposalMethod.Sale]: "Sale",
  [DisposalMethod.WriteOff]: "Write Off",
  [DisposalMethod.Transfer]: "Transfer",
  [DisposalMethod.Scrap]: "Scrap",
  [DisposalMethod.Donation]: "Donation",
}

// Response DTOs
export interface AssetDto {
  id: string
  assetCode: string
  assetName: string
  assetNameLocal?: string
  description?: string
  serialNumber?: string
  barcode?: string
  assetCategoryId: string
  categoryCode: string
  categoryName: string
  locationDescription?: string
  departmentId?: string
  departmentName?: string
  condition: AssetCondition
  acquisitionDate: string
  acquisitionCost: number
  currencyCode: string
  exchangeRate: number
  acquisitionCostBase: number
  vendorId?: string
  vendorCode?: string
  vendorName?: string
  apInvoiceId?: string
  apInvoiceNumber?: string
  purchaseReference?: string
  depreciationMethod: DepreciationMethod
  usefulLifeMonths: number
  salvageValue: number
  depreciationStartDate: string
  monthlyDepreciation: number
  status: AssetStatus
  accumulatedDepreciation: number
  currentValue: number
  depreciatedMonths: number
  isFullyDepreciated: boolean
  assetAccountId?: string
  assetAccountCode?: string
  assetAccountName?: string
  accumDepreciationAccountId?: string
  accumDepreciationAccountCode?: string
  accumDepreciationAccountName?: string
  depreciationExpenseAccountId?: string
  depreciationExpenseAccountCode?: string
  depreciationExpenseAccountName?: string
  disposedAt?: string
  disposalValue?: number
  gainLossAmount?: number
  notes?: string
  depreciationSchedules: DepreciationScheduleDto[]
  createdAt: string
  createdBy: string
  updatedAt?: string
}

export interface AssetListDto {
  id: string
  assetCode: string
  assetName: string
  categoryCode: string
  categoryName: string
  locationDescription?: string
  departmentName?: string
  condition: AssetCondition
  acquisitionDate: string
  acquisitionCost: number
  currencyCode: string
  depreciationMethod: DepreciationMethod
  status: AssetStatus
  accumulatedDepreciation: number
  currentValue: number
  isFullyDepreciated: boolean
  createdAt: string
}

export interface AssetLookupDto {
  id: string
  assetCode: string
  assetName: string
  categoryName: string
  status: AssetStatus
  currentValue: number
}

export interface DepreciationScheduleDto {
  id: string
  assetId: string
  assetCode: string
  assetName: string
  fiscalPeriodId: string
  fiscalPeriodName: string
  scheduleNumber: number
  scheduleDate: string
  openingValue: number
  depreciationAmount: number
  depreciationAmountBase: number
  closingValue: number
  accumulatedDepreciation: number
  currencyCode: string
  isPosted: boolean
  journalVoucherId?: string
  journalVoucherNumber?: string
  postedAt?: string
  postedBy?: string
  notes?: string
  createdAt: string
}

export interface AssetRegisterDto {
  id: string
  assetCode: string
  assetName: string
  categoryCode: string
  categoryName: string
  departmentName?: string
  acquisitionDate: string
  acquisitionCost: number
  currencyCode: string
  depreciationMethod: DepreciationMethod
  usefulLifeMonths: number
  salvageValue: number
  monthlyDepreciation: number
  accumulatedDepreciation: number
  currentValue: number
  status: AssetStatus
}

// Request DTOs
export interface CreateAssetRequest {
  assetCode: string
  assetName: string
  assetNameLocal?: string
  description?: string
  serialNumber?: string
  barcode?: string
  assetCategoryId: string
  locationDescription?: string
  departmentId?: string
  condition: AssetCondition
  acquisitionDate: string
  acquisitionCost: number
  currencyCode: string
  exchangeRate: number
  vendorId?: string
  apInvoiceId?: string
  purchaseReference?: string
  depreciationMethod: DepreciationMethod
  usefulLifeMonths: number
  salvageValue: number
  depreciationStartDate: string
  assetAccountId?: string
  accumDepreciationAccountId?: string
  depreciationExpenseAccountId?: string
  notes?: string
}

export interface UpdateAssetRequest {
  assetName: string
  assetNameLocal?: string
  description?: string
  serialNumber?: string
  barcode?: string
  assetCategoryId: string
  locationDescription?: string
  departmentId?: string
  condition: AssetCondition
  depreciationMethod: DepreciationMethod
  usefulLifeMonths: number
  salvageValue: number
  assetAccountId?: string
  accumDepreciationAccountId?: string
  depreciationExpenseAccountId?: string
  notes?: string
}

export interface DisposeAssetRequest {
  disposalDate: string
  disposalMethod: DisposalMethod
  disposalValue: number
  disposalCost: number
  buyerName?: string
  reference?: string
  reason?: string
  notes?: string
}

export interface TransferAssetRequest {
  newDepartmentId: string
  newLocationDescription?: string
  notes?: string
}

// Query Parameters
export interface AssetQueryParams {
  search?: string
  categoryId?: string
  status?: AssetStatus
  departmentId?: string
  acquisitionDateFrom?: string
  acquisitionDateTo?: string
  isFullyDepreciated?: boolean
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
