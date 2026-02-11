import type {
  FiscalYearDto,
  FiscalYearListDto,
  FiscalPeriodDto,
  FiscalPeriodListDto,
  FiscalPeriodLookupDto,
} from '@/features/general-ledger/fiscal-periods/types'
import { PeriodStatus } from '@/features/general-ledger/fiscal-periods/types'
import { uuid } from './common'

// ---------------------------------------------------------------------------
// Fiscal Year 2025
// ---------------------------------------------------------------------------

const FY_ID = uuid('fyr0', 1)

const periodNames = [
  'January 2025',
  'February 2025',
  'March 2025',
  'April 2025',
  'May 2025',
  'June 2025',
  'July 2025',
  'August 2025',
  'September 2025',
  'October 2025',
  'November 2025',
  'December 2025',
]

function periodStartDate(month: number): string {
  return `2025-${String(month).padStart(2, '0')}-01`
}

function periodEndDate(month: number): string {
  const lastDay = new Date(2025, month, 0).getDate()
  return `2025-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

// Jan-Oct closed, Nov-Dec open
function periodStatus(month: number): PeriodStatus {
  return month <= 10 ? PeriodStatus.Closed : PeriodStatus.Open
}

export const mockFiscalPeriods: FiscalPeriodDto[] = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1
  const status = periodStatus(month)
  return {
    id: uuid('fprd', month),
    fiscalYearId: FY_ID,
    fiscalYearName: 'FY2025',
    name: periodNames[i],
    periodNumber: month,
    startDate: periodStartDate(month),
    endDate: periodEndDate(month),
    status,
    closedAt: status === PeriodStatus.Closed ? `2025-${String(month + 1).padStart(2, '0')}-05T10:00:00Z` : undefined,
    closedBy: status === PeriodStatus.Closed ? 'admin@carmen.hotel' : undefined,
    closedByName: status === PeriodStatus.Closed ? 'System Admin' : undefined,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: status === PeriodStatus.Closed ? `2025-${String(month + 1).padStart(2, '0')}-05T10:00:00Z` : undefined,
  }
})

export const mockFiscalYears: FiscalYearDto[] = [
  {
    id: FY_ID,
    name: 'FY2025',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isActive: true,
    isClosed: false,
    periods: mockFiscalPeriods,
    createdAt: '2024-12-15T08:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

export const mockFiscalYearList: FiscalYearListDto[] = mockFiscalYears.map((fy) => ({
  id: fy.id,
  name: fy.name,
  startDate: fy.startDate,
  endDate: fy.endDate,
  isActive: fy.isActive,
  isClosed: fy.isClosed,
  periodCount: fy.periods.length,
}))

export const mockFiscalPeriodList: FiscalPeriodListDto[] = mockFiscalPeriods.map((p) => ({
  id: p.id,
  fiscalYearId: p.fiscalYearId,
  fiscalYearName: p.fiscalYearName,
  name: p.name,
  periodNumber: p.periodNumber,
  startDate: p.startDate,
  endDate: p.endDate,
  status: p.status,
}))

export const mockFiscalPeriodLookup: FiscalPeriodLookupDto[] = mockFiscalPeriods.map((p) => ({
  id: p.id,
  name: p.name,
  startDate: p.startDate,
  endDate: p.endDate,
  status: p.status,
}))
