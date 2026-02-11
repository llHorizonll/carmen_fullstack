import { create } from "zustand"
import type {
  DataSourceType,
  ReportFieldDefinition,
  ReportTemplateColumnDto,
  ReportTemplateFilterDto,
  ReportTemplateGroupDto,
  ReportDataSet,
  OutputFormat,
  PageOrientation,
} from "@/features/reports/types"
import { AggregateFunction, FilterOperator, SortDirection, ColumnType } from "@/features/reports/types"

interface ReportBuilderState {
  // Data source
  dataSource: DataSourceType | null
  availableFields: ReportFieldDefinition[]

  // Template config
  columns: ReportTemplateColumnDto[]
  filters: ReportTemplateFilterDto[]
  groups: ReportTemplateGroupDto[]

  // Template metadata
  templateName: string
  templateDescription: string
  isPublic: boolean
  defaultOutputFormat: OutputFormat
  pageOrientation: PageOrientation

  // Preview
  previewData: ReportDataSet | null
  isPreviewLoading: boolean

  // Edit mode
  editingTemplateId: string | null

  // Actions
  setDataSource: (ds: DataSourceType) => void
  setAvailableFields: (fields: ReportFieldDefinition[]) => void
  addColumn: (field: ReportFieldDefinition) => void
  removeColumn: (index: number) => void
  updateColumn: (index: number, updates: Partial<ReportTemplateColumnDto>) => void
  reorderColumns: (fromIndex: number, toIndex: number) => void
  addFilter: (fieldName: string) => void
  removeFilter: (index: number) => void
  updateFilter: (index: number, updates: Partial<ReportTemplateFilterDto>) => void
  addGroup: (fieldName: string) => void
  removeGroup: (index: number) => void
  updateGroup: (index: number, updates: Partial<ReportTemplateGroupDto>) => void
  setTemplateName: (name: string) => void
  setTemplateDescription: (desc: string) => void
  setIsPublic: (isPublic: boolean) => void
  setDefaultOutputFormat: (format: OutputFormat) => void
  setPageOrientation: (orientation: PageOrientation) => void
  setPreviewData: (data: ReportDataSet | null) => void
  setIsPreviewLoading: (loading: boolean) => void
  setEditingTemplateId: (id: string | null) => void
  reset: () => void
  loadTemplate: (template: {
    dataSource: DataSourceType
    name: string
    description?: string
    isPublic: boolean
    defaultOutputFormat: OutputFormat
    pageOrientation: PageOrientation
    columns: ReportTemplateColumnDto[]
    filters: ReportTemplateFilterDto[]
    groups: ReportTemplateGroupDto[]
  }) => void
}

const initialState = {
  dataSource: null as DataSourceType | null,
  availableFields: [] as ReportFieldDefinition[],
  columns: [] as ReportTemplateColumnDto[],
  filters: [] as ReportTemplateFilterDto[],
  groups: [] as ReportTemplateGroupDto[],
  templateName: "",
  templateDescription: "",
  isPublic: false,
  defaultOutputFormat: 0 as OutputFormat,
  pageOrientation: 0 as PageOrientation,
  previewData: null as ReportDataSet | null,
  isPreviewLoading: false,
  editingTemplateId: null as string | null,
}

export const useReportBuilderStore = create<ReportBuilderState>((set, get) => ({
  ...initialState,

  setDataSource: (ds) => set({ dataSource: ds, columns: [], filters: [], groups: [], previewData: null }),
  setAvailableFields: (fields) => set({ availableFields: fields }),

  addColumn: (field) => {
    const { columns } = get()
    if (columns.some((c) => c.fieldName === field.fieldName)) return
    set({
      columns: [
        ...columns,
        {
          fieldName: field.fieldName,
          displayName: field.displayName,
          columnType: field.columnType as ColumnType,
          width: field.columnType === ColumnType.Currency ? 120 : 100,
          order: columns.length,
          aggregateFunction: AggregateFunction.None,
        },
      ],
    })
  },

  removeColumn: (index) => {
    const { columns } = get()
    set({
      columns: columns
        .filter((_, i) => i !== index)
        .map((c, i) => ({ ...c, order: i })),
    })
  },

  updateColumn: (index, updates) => {
    const { columns } = get()
    set({
      columns: columns.map((c, i) => (i === index ? { ...c, ...updates } : c)),
    })
  },

  reorderColumns: (fromIndex, toIndex) => {
    const { columns } = get()
    const newColumns = [...columns]
    const [moved] = newColumns.splice(fromIndex, 1)
    newColumns.splice(toIndex, 0, moved)
    set({
      columns: newColumns.map((c, i) => ({ ...c, order: i })),
    })
  },

  addFilter: (fieldName) => {
    const { filters } = get()
    set({
      filters: [
        ...filters,
        { fieldName, operator: FilterOperator.Equals, value: "" },
      ],
    })
  },

  removeFilter: (index) => {
    const { filters } = get()
    set({ filters: filters.filter((_, i) => i !== index) })
  },

  updateFilter: (index, updates) => {
    const { filters } = get()
    set({
      filters: filters.map((f, i) => (i === index ? { ...f, ...updates } : f)),
    })
  },

  addGroup: (fieldName) => {
    const { groups } = get()
    if (groups.some((g) => g.fieldName === fieldName)) return
    set({
      groups: [
        ...groups,
        {
          fieldName,
          order: groups.length,
          showSubtotals: true,
          sortDirection: SortDirection.Ascending,
        },
      ],
    })
  },

  removeGroup: (index) => {
    const { groups } = get()
    set({
      groups: groups
        .filter((_, i) => i !== index)
        .map((g, i) => ({ ...g, order: i })),
    })
  },

  updateGroup: (index, updates) => {
    const { groups } = get()
    set({
      groups: groups.map((g, i) => (i === index ? { ...g, ...updates } : g)),
    })
  },

  setTemplateName: (name) => set({ templateName: name }),
  setTemplateDescription: (desc) => set({ templateDescription: desc }),
  setIsPublic: (isPublic) => set({ isPublic }),
  setDefaultOutputFormat: (format) => set({ defaultOutputFormat: format }),
  setPageOrientation: (orientation) => set({ pageOrientation: orientation }),
  setPreviewData: (data) => set({ previewData: data }),
  setIsPreviewLoading: (loading) => set({ isPreviewLoading: loading }),
  setEditingTemplateId: (id) => set({ editingTemplateId: id }),

  reset: () => set(initialState),

  loadTemplate: (template) =>
    set({
      dataSource: template.dataSource,
      templateName: template.name,
      templateDescription: template.description ?? "",
      isPublic: template.isPublic,
      defaultOutputFormat: template.defaultOutputFormat,
      pageOrientation: template.pageOrientation,
      columns: template.columns,
      filters: template.filters,
      groups: template.groups,
      previewData: null,
      availableFields: [],
    }),
}))
