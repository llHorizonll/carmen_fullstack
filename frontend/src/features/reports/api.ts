import { apiClient } from "@/lib/api-client"
import type {
  PredefinedReportInfo,
  ReportParameterDefinition,
  ReportDataSet,
  GenerateReportRequest,
  PredefinedReportType,
  DataSourceInfo,
  ReportFieldDefinition,
  ReportTemplateListDto,
  ReportTemplateDto,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest,
  CustomReportGenerateRequest,
  DataSourceType,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/reports`

export const reportsApi = {
  // ─── Predefined Reports ──────────────────────────────────────

  getPredefinedReports: async (tenantId: string): Promise<PredefinedReportInfo[]> => {
    return apiClient.get<PredefinedReportInfo[]>(`${getBaseUrl(tenantId)}/predefined`)
  },

  getReportParameters: async (
    tenantId: string,
    reportType: PredefinedReportType
  ): Promise<ReportParameterDefinition[]> => {
    return apiClient.get<ReportParameterDefinition[]>(
      `${getBaseUrl(tenantId)}/predefined/${reportType}/parameters`
    )
  },

  previewReport: async (
    tenantId: string,
    reportType: PredefinedReportType,
    parameters: Record<string, string>
  ): Promise<ReportDataSet> => {
    return apiClient.post<ReportDataSet>(
      `${getBaseUrl(tenantId)}/predefined/${reportType}/preview`,
      parameters
    )
  },

  generateReport: async (
    tenantId: string,
    reportType: PredefinedReportType,
    request: GenerateReportRequest
  ): Promise<Blob> => {
    const response = await apiClient.postRaw<Blob>(
      `${getBaseUrl(tenantId)}/predefined/${reportType}/generate`,
      request,
      { responseType: "blob" }
    )
    return response.data
  },

  // ─── Data Sources ────────────────────────────────────────────

  getDataSources: async (tenantId: string): Promise<DataSourceInfo[]> => {
    return apiClient.get<DataSourceInfo[]>(`${getBaseUrl(tenantId)}/datasources`)
  },

  getDataSourceFields: async (
    tenantId: string,
    dataSource: DataSourceType
  ): Promise<ReportFieldDefinition[]> => {
    return apiClient.get<ReportFieldDefinition[]>(
      `${getBaseUrl(tenantId)}/datasources/${dataSource}/fields`
    )
  },

  // ─── Report Templates ────────────────────────────────────────

  getTemplates: async (tenantId: string): Promise<ReportTemplateListDto[]> => {
    return apiClient.get<ReportTemplateListDto[]>(`${getBaseUrl(tenantId)}/templates`)
  },

  getTemplate: async (tenantId: string, id: string): Promise<ReportTemplateDto> => {
    return apiClient.get<ReportTemplateDto>(`${getBaseUrl(tenantId)}/templates/${id}`)
  },

  createTemplate: async (
    tenantId: string,
    request: CreateReportTemplateRequest
  ): Promise<ReportTemplateDto> => {
    return apiClient.post<ReportTemplateDto>(`${getBaseUrl(tenantId)}/templates`, request)
  },

  updateTemplate: async (
    tenantId: string,
    id: string,
    request: UpdateReportTemplateRequest
  ): Promise<ReportTemplateDto> => {
    return apiClient.put<ReportTemplateDto>(`${getBaseUrl(tenantId)}/templates/${id}`, request)
  },

  deleteTemplate: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.delete(`${getBaseUrl(tenantId)}/templates/${id}`)
  },

  // ─── Custom Report Execution ─────────────────────────────────

  previewCustomReport: async (
    tenantId: string,
    templateId: string,
    runtimeFilters?: Record<string, string>
  ): Promise<ReportDataSet> => {
    return apiClient.post<ReportDataSet>(
      `${getBaseUrl(tenantId)}/custom/${templateId}/preview`,
      runtimeFilters ?? {}
    )
  },

  generateCustomReport: async (
    tenantId: string,
    templateId: string,
    request: CustomReportGenerateRequest
  ): Promise<Blob> => {
    const response = await apiClient.postRaw<Blob>(
      `${getBaseUrl(tenantId)}/custom/${templateId}/generate`,
      request,
      { responseType: "blob" }
    )
    return response.data
  },
}
