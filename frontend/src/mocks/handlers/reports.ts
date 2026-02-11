import { http, HttpResponse } from 'msw'
import {
  mockPredefinedReports,
  mockReportTemplates,
  mockReportTemplateDetails,
} from '../data/reports'
import {
  DataSourceType,
  ColumnType,
} from '../../features/reports/types'

// Reports API uses apiClient.get() (wrapped), so handlers must return
// { success: true, data: actualData }

function wrapped<T>(data: T) {
  return HttpResponse.json({ success: true, data })
}

export const reportHandlers = [
  // ── Predefined Reports ──────────────────────────────────────

  // GET predefined reports list
  http.get('*/v1/tenants/:tenantId/reports/predefined', () => {
    return wrapped(mockPredefinedReports)
  }),

  // GET report parameters by type
  http.get('*/v1/tenants/:tenantId/reports/predefined/:type/parameters', () => {
    return wrapped([
      { name: 'fromDate', label: 'From Date', parameterType: 'date', isRequired: true, defaultValue: undefined, options: undefined },
      { name: 'toDate', label: 'To Date', parameterType: 'date', isRequired: true, defaultValue: undefined, options: undefined },
      { name: 'departmentId', label: 'Department', parameterType: 'select', isRequired: false, defaultValue: undefined, options: [{ value: 'all', label: 'All Departments' }] },
    ])
  }),

  // POST preview predefined report
  http.post('*/v1/tenants/:tenantId/reports/predefined/:type/preview', () => {
    return wrapped({
      reportTitle: 'Trial Balance',
      reportSubtitle: 'For the period ending December 2025',
      generatedAt: new Date().toISOString(),
      columns: [
        { fieldName: 'accountCode', displayName: 'Account Code', columnType: ColumnType.Text, width: 120, aggregateFunction: 0 },
        { fieldName: 'accountName', displayName: 'Account Name', columnType: ColumnType.Text, width: 250, aggregateFunction: 0 },
        { fieldName: 'debit', displayName: 'Debit', columnType: ColumnType.Currency, width: 150, aggregateFunction: 1 },
        { fieldName: 'credit', displayName: 'Credit', columnType: ColumnType.Currency, width: 150, aggregateFunction: 1 },
      ],
      rows: [
        { accountCode: '1000-001', accountName: 'Cash in Bank', debit: 125000, credit: 0 },
        { accountCode: '1100-001', accountName: 'Accounts Receivable', debit: 85000, credit: 0 },
        { accountCode: '2000-001', accountName: 'Accounts Payable', debit: 0, credit: 78500 },
        { accountCode: '3000-001', accountName: 'Retained Earnings', debit: 0, credit: 131500 },
      ],
      grandTotals: { debit: 210000, credit: 210000 },
    })
  }),

  // ── Data Sources ────────────────────────────────────────────

  // GET data sources
  http.get('*/v1/tenants/:tenantId/reports/datasources', () => {
    return wrapped([
      { type: DataSourceType.GeneralLedger, name: 'General Ledger' },
      { type: DataSourceType.AccountsPayable, name: 'Accounts Payable' },
      { type: DataSourceType.AccountsReceivable, name: 'Accounts Receivable' },
      { type: DataSourceType.AssetManagement, name: 'Asset Management' },
    ])
  }),

  // GET data source fields
  http.get('*/v1/tenants/:tenantId/reports/datasources/:type/fields', () => {
    return wrapped([
      { fieldName: 'accountCode', displayName: 'Account Code', columnType: ColumnType.Text, isFilterable: true, isGroupable: true, isSortable: true },
      { fieldName: 'accountName', displayName: 'Account Name', columnType: ColumnType.Text, isFilterable: true, isGroupable: true, isSortable: true },
      { fieldName: 'departmentName', displayName: 'Department', columnType: ColumnType.Text, isFilterable: true, isGroupable: true, isSortable: true },
      { fieldName: 'amount', displayName: 'Amount', columnType: ColumnType.Currency, isFilterable: true, isGroupable: false, isSortable: true },
      { fieldName: 'transactionDate', displayName: 'Transaction Date', columnType: ColumnType.Date, isFilterable: true, isGroupable: true, isSortable: true },
    ])
  }),

  // ── Report Templates ────────────────────────────────────────

  // GET templates list
  http.get('*/v1/tenants/:tenantId/reports/templates', () => {
    return wrapped(mockReportTemplates)
  }),

  // GET template by id
  http.get('*/v1/tenants/:tenantId/reports/templates/:id', ({ params }) => {
    const tmpl = mockReportTemplateDetails.find((t) => t.id === params.id)
    if (!tmpl) {
      const listItem = mockReportTemplates.find((t) => t.id === params.id)
      if (!listItem) return new HttpResponse(null, { status: 404 })
      return wrapped(listItem)
    }
    return wrapped(tmpl)
  }),

  // POST create template
  http.post('*/v1/tenants/:tenantId/reports/templates', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return wrapped({ id: 'new-template-id', ...body, createdAt: new Date().toISOString(), createdBy: 'Current User' })
  }),

  // PUT update template
  http.put('*/v1/tenants/:tenantId/reports/templates/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const existing = mockReportTemplateDetails.find((t) => t.id === params.id)
    return wrapped({ ...existing, ...body })
  }),

  // DELETE template
  http.delete('*/v1/tenants/:tenantId/reports/templates/:id', () => {
    return wrapped(null)
  }),

  // ── Custom Report Execution ─────────────────────────────────

  // POST preview custom report
  http.post('*/v1/tenants/:tenantId/reports/custom/:id/preview', () => {
    return wrapped({
      reportTitle: 'Custom Report Preview',
      reportSubtitle: undefined,
      generatedAt: new Date().toISOString(),
      columns: [
        { fieldName: 'departmentName', displayName: 'Department', columnType: ColumnType.Text, width: 200, aggregateFunction: 0 },
        { fieldName: 'amount', displayName: 'Amount', columnType: ColumnType.Currency, width: 150, aggregateFunction: 1 },
      ],
      rows: [
        { departmentName: 'Front Office', amount: 45000 },
        { departmentName: 'Housekeeping', amount: 32000 },
        { departmentName: 'F&B Service', amount: 58000 },
      ],
      grandTotals: { amount: 135000 },
    })
  }),
]
