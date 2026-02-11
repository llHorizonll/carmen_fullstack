import { describe, it, expect, beforeEach } from 'vitest'
import { useReportBuilderStore } from '../report-builder-store'
import {
  DataSourceType,
  ColumnType,
  AggregateFunction,
  FilterOperator,
  SortDirection,
  OutputFormat,
  PageOrientation,
  type ReportFieldDefinition,
} from '@/features/reports/types'

beforeEach(() => {
  useReportBuilderStore.getState().reset()
})

const mockField: ReportFieldDefinition = {
  fieldName: 'accountCode',
  displayName: 'Account Code',
  columnType: ColumnType.Text,
  isFilterable: true,
  isGroupable: true,
  isSortable: true,
}

const mockCurrencyField: ReportFieldDefinition = {
  fieldName: 'amount',
  displayName: 'Amount',
  columnType: ColumnType.Currency,
  isFilterable: true,
  isGroupable: false,
  isSortable: true,
}

describe('report-builder-store', () => {
  describe('setDataSource', () => {
    it('sets data source and resets config', () => {
      // First add some columns
      useReportBuilderStore.getState().addColumn(mockField)
      useReportBuilderStore.getState().addFilter('test')

      // Then switch data source
      useReportBuilderStore.getState().setDataSource(DataSourceType.AccountsPayable)

      const state = useReportBuilderStore.getState()
      expect(state.dataSource).toBe(DataSourceType.AccountsPayable)
      expect(state.columns).toHaveLength(0)
      expect(state.filters).toHaveLength(0)
      expect(state.groups).toHaveLength(0)
      expect(state.previewData).toBeNull()
    })
  })

  describe('addColumn', () => {
    it('adds a column with correct defaults', () => {
      useReportBuilderStore.getState().addColumn(mockField)

      const columns = useReportBuilderStore.getState().columns
      expect(columns).toHaveLength(1)
      expect(columns[0].fieldName).toBe('accountCode')
      expect(columns[0].displayName).toBe('Account Code')
      expect(columns[0].columnType).toBe(ColumnType.Text)
      expect(columns[0].order).toBe(0)
      expect(columns[0].aggregateFunction).toBe(AggregateFunction.None)
    })

    it('sets width 120 for currency columns', () => {
      useReportBuilderStore.getState().addColumn(mockCurrencyField)

      expect(useReportBuilderStore.getState().columns[0].width).toBe(120)
    })

    it('sets width 100 for non-currency columns', () => {
      useReportBuilderStore.getState().addColumn(mockField)

      expect(useReportBuilderStore.getState().columns[0].width).toBe(100)
    })

    it('prevents duplicate columns by fieldName', () => {
      useReportBuilderStore.getState().addColumn(mockField)
      useReportBuilderStore.getState().addColumn(mockField)

      expect(useReportBuilderStore.getState().columns).toHaveLength(1)
    })
  })

  describe('removeColumn', () => {
    it('removes column and reindexes', () => {
      useReportBuilderStore.getState().addColumn(mockField)
      useReportBuilderStore.getState().addColumn(mockCurrencyField)

      useReportBuilderStore.getState().removeColumn(0)

      const columns = useReportBuilderStore.getState().columns
      expect(columns).toHaveLength(1)
      expect(columns[0].fieldName).toBe('amount')
      expect(columns[0].order).toBe(0)
    })
  })

  describe('updateColumn', () => {
    it('updates column properties', () => {
      useReportBuilderStore.getState().addColumn(mockField)

      useReportBuilderStore
        .getState()
        .updateColumn(0, { displayName: 'Updated Name', width: 200 })

      const col = useReportBuilderStore.getState().columns[0]
      expect(col.displayName).toBe('Updated Name')
      expect(col.width).toBe(200)
    })
  })

  describe('reorderColumns', () => {
    it('moves column and updates order indices', () => {
      const field2: ReportFieldDefinition = {
        fieldName: 'name',
        displayName: 'Name',
        columnType: ColumnType.Text,
        isFilterable: true,
        isGroupable: false,
        isSortable: true,
      }

      useReportBuilderStore.getState().addColumn(mockField)
      useReportBuilderStore.getState().addColumn(mockCurrencyField)
      useReportBuilderStore.getState().addColumn(field2)

      // Move first column to last
      useReportBuilderStore.getState().reorderColumns(0, 2)

      const columns = useReportBuilderStore.getState().columns
      expect(columns[0].fieldName).toBe('amount')
      expect(columns[0].order).toBe(0)
      expect(columns[1].fieldName).toBe('name')
      expect(columns[1].order).toBe(1)
      expect(columns[2].fieldName).toBe('accountCode')
      expect(columns[2].order).toBe(2)
    })
  })

  describe('filters', () => {
    it('adds a filter with defaults', () => {
      useReportBuilderStore.getState().addFilter('accountCode')

      const filters = useReportBuilderStore.getState().filters
      expect(filters).toHaveLength(1)
      expect(filters[0].fieldName).toBe('accountCode')
      expect(filters[0].operator).toBe(FilterOperator.Equals)
      expect(filters[0].value).toBe('')
    })

    it('removes a filter', () => {
      useReportBuilderStore.getState().addFilter('accountCode')
      useReportBuilderStore.getState().addFilter('amount')

      useReportBuilderStore.getState().removeFilter(0)

      const filters = useReportBuilderStore.getState().filters
      expect(filters).toHaveLength(1)
      expect(filters[0].fieldName).toBe('amount')
    })

    it('updates a filter', () => {
      useReportBuilderStore.getState().addFilter('accountCode')

      useReportBuilderStore
        .getState()
        .updateFilter(0, { operator: FilterOperator.Contains, value: '100' })

      const f = useReportBuilderStore.getState().filters[0]
      expect(f.operator).toBe(FilterOperator.Contains)
      expect(f.value).toBe('100')
    })
  })

  describe('groups', () => {
    it('adds a group with defaults', () => {
      useReportBuilderStore.getState().addGroup('accountType')

      const groups = useReportBuilderStore.getState().groups
      expect(groups).toHaveLength(1)
      expect(groups[0].fieldName).toBe('accountType')
      expect(groups[0].order).toBe(0)
      expect(groups[0].showSubtotals).toBe(true)
      expect(groups[0].sortDirection).toBe(SortDirection.Ascending)
    })

    it('prevents duplicate groups', () => {
      useReportBuilderStore.getState().addGroup('accountType')
      useReportBuilderStore.getState().addGroup('accountType')

      expect(useReportBuilderStore.getState().groups).toHaveLength(1)
    })

    it('removes group and reindexes', () => {
      useReportBuilderStore.getState().addGroup('accountType')
      useReportBuilderStore.getState().addGroup('department')

      useReportBuilderStore.getState().removeGroup(0)

      const groups = useReportBuilderStore.getState().groups
      expect(groups).toHaveLength(1)
      expect(groups[0].fieldName).toBe('department')
      expect(groups[0].order).toBe(0)
    })

    it('updates a group', () => {
      useReportBuilderStore.getState().addGroup('accountType')

      useReportBuilderStore
        .getState()
        .updateGroup(0, { showSubtotals: false, sortDirection: SortDirection.Descending })

      const g = useReportBuilderStore.getState().groups[0]
      expect(g.showSubtotals).toBe(false)
      expect(g.sortDirection).toBe(SortDirection.Descending)
    })
  })

  describe('reset', () => {
    it('restores initial state', () => {
      useReportBuilderStore.getState().setDataSource(DataSourceType.GeneralLedger)
      useReportBuilderStore.getState().addColumn(mockField)
      useReportBuilderStore.getState().setTemplateName('My Report')

      useReportBuilderStore.getState().reset()

      const state = useReportBuilderStore.getState()
      expect(state.dataSource).toBeNull()
      expect(state.columns).toHaveLength(0)
      expect(state.templateName).toBe('')
    })
  })

  describe('loadTemplate', () => {
    it('populates all template fields', () => {
      useReportBuilderStore.getState().loadTemplate({
        dataSource: DataSourceType.AccountsReceivable,
        name: 'AR Aging Report',
        description: 'Aging analysis',
        isPublic: true,
        defaultOutputFormat: OutputFormat.Excel,
        pageOrientation: PageOrientation.Landscape,
        columns: [
          {
            fieldName: 'customer',
            displayName: 'Customer',
            columnType: ColumnType.Text,
            width: 150,
            order: 0,
            aggregateFunction: AggregateFunction.None,
          },
        ],
        filters: [{ fieldName: 'status', operator: FilterOperator.Equals, value: 'active' }],
        groups: [
          {
            fieldName: 'region',
            order: 0,
            showSubtotals: true,
            sortDirection: SortDirection.Ascending,
          },
        ],
      })

      const state = useReportBuilderStore.getState()
      expect(state.dataSource).toBe(DataSourceType.AccountsReceivable)
      expect(state.templateName).toBe('AR Aging Report')
      expect(state.templateDescription).toBe('Aging analysis')
      expect(state.isPublic).toBe(true)
      expect(state.defaultOutputFormat).toBe(OutputFormat.Excel)
      expect(state.pageOrientation).toBe(PageOrientation.Landscape)
      expect(state.columns).toHaveLength(1)
      expect(state.filters).toHaveLength(1)
      expect(state.groups).toHaveLength(1)
      expect(state.previewData).toBeNull()
    })
  })
})
