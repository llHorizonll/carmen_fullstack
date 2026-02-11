import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reportsApi } from "./api"
import { useTenantId } from "@/hooks/useTenantId"
import type {
  PredefinedReportType,
  OutputFormat,
  DataSourceType,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest,
} from "./types"
import { toast } from "sonner"

const REPORTS_QUERY_KEY = "reports"

// ─── Predefined Reports ──────────────────────────────────────

export function usePredefinedReports() {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "predefined", tenantId],
    queryFn: () => reportsApi.getPredefinedReports(tenantId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useReportParameters(reportType: PredefinedReportType) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "parameters", tenantId, reportType],
    queryFn: () => reportsApi.getReportParameters(tenantId, reportType),
    staleTime: 10 * 60 * 1000,
  })
}

export function useReportPreview(reportType: PredefinedReportType) {
  const tenantId = useTenantId()

  return useMutation({
    mutationFn: (parameters: Record<string, string>) =>
      reportsApi.previewReport(tenantId, reportType, parameters),
  })
}

export function useGenerateReport(reportType: PredefinedReportType) {
  const tenantId = useTenantId()

  return useMutation({
    mutationFn: ({
      outputFormat,
      parameters,
    }: {
      outputFormat: OutputFormat
      parameters: Record<string, string>
    }) =>
      reportsApi.generateReport(tenantId, reportType, {
        reportType,
        outputFormat,
        parameters,
      }),
    onSuccess: (blob, variables) => {
      const extension = variables.outputFormat === 0 ? "pdf" : "xlsx"
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${reportType}_${new Date().toISOString().slice(0, 10)}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}

// ─── Data Sources ────────────────────────────────────────────

export function useDataSources() {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "datasources", tenantId],
    queryFn: () => reportsApi.getDataSources(tenantId),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useDataSourceFields(dataSource: DataSourceType | null) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "fields", tenantId, dataSource],
    queryFn: () => reportsApi.getDataSourceFields(tenantId, dataSource!),
    enabled: dataSource !== null,
    staleTime: 30 * 60 * 1000,
  })
}

// ─── Report Templates ────────────────────────────────────────

export function useReportTemplates() {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "templates", tenantId],
    queryFn: () => reportsApi.getTemplates(tenantId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useReportTemplate(id: string | null) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, "templates", tenantId, id],
    queryFn: () => reportsApi.getTemplate(tenantId, id!),
    enabled: !!id,
  })
}

export function useCreateTemplate() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateReportTemplateRequest) =>
      reportsApi.createTemplate(tenantId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTS_QUERY_KEY, "templates"] })
      toast.success("Report template created successfully")
    },
    onError: () => {
      toast.error("Failed to create report template")
    },
  })
}

export function useUpdateTemplate() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateReportTemplateRequest }) =>
      reportsApi.updateTemplate(tenantId, id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTS_QUERY_KEY, "templates"] })
      toast.success("Report template updated successfully")
    },
    onError: () => {
      toast.error("Failed to update report template")
    },
  })
}

export function useDeleteTemplate() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reportsApi.deleteTemplate(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTS_QUERY_KEY, "templates"] })
      toast.success("Report template deleted")
    },
    onError: () => {
      toast.error("Failed to delete report template")
    },
  })
}

// ─── Custom Report Execution ─────────────────────────────────

export function useCustomReportPreview() {
  const tenantId = useTenantId()

  return useMutation({
    mutationFn: ({
      templateId,
      runtimeFilters,
    }: {
      templateId: string
      runtimeFilters?: Record<string, string>
    }) => reportsApi.previewCustomReport(tenantId, templateId, runtimeFilters),
  })
}

export function useGenerateCustomReport() {
  const tenantId = useTenantId()

  return useMutation({
    mutationFn: ({
      templateId,
      outputFormat,
    }: {
      templateId: string
      outputFormat: OutputFormat
    }) =>
      reportsApi.generateCustomReport(tenantId, templateId, { outputFormat }),
    onSuccess: (blob, variables) => {
      const extension = variables.outputFormat === 0 ? "pdf" : "xlsx"
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `CustomReport_${new Date().toISOString().slice(0, 10)}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}
