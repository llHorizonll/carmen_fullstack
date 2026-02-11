import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/auth-store"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ReportParameterForm } from "../components/report-parameter-form"
import { ReportViewer } from "../components/report-viewer"
import { ExportButtons } from "../components/export-buttons"
import { useReportParameters, useReportPreview, useGenerateReport } from "../hooks"
import type { PredefinedReportType, OutputFormat, ReportDataSet } from "../types"

export function ReportViewerPage() {
  const { t } = useTranslation()
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()
  const canGenerate = hasPermission("Reports.Generate")
  const reportType = type as PredefinedReportType

  const { data: parameters, isLoading: parametersLoading } = useReportParameters(reportType)
  const previewMutation = useReportPreview(reportType)
  const generateMutation = useGenerateReport(reportType)

  const [previewData, setPreviewData] = useState<ReportDataSet | undefined>()
  const [currentParams, setCurrentParams] = useState<Record<string, string>>({})

  const handlePreview = async (params: Record<string, string>) => {
    setCurrentParams(params)
    const data = await previewMutation.mutateAsync(params)
    setPreviewData(data)
  }

  const handleExport = (format: OutputFormat) => {
    generateMutation.mutate({ outputFormat: format, parameters: currentParams })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/reports")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {previewData?.reportTitle ?? t("reports.reportViewer")}
          </h1>
          {previewData?.reportSubtitle && (
            <p className="text-muted-foreground">{previewData.reportSubtitle}</p>
          )}
        </div>
      </div>

      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("reports.parameters")}</CardTitle>
        </CardHeader>
        <CardContent>
          {parametersLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : parameters ? (
            <ReportParameterForm
              parameters={parameters}
              onSubmit={handlePreview}
              isLoading={previewMutation.isPending}
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Export */}
      {previewData && canGenerate && (
        <div className="flex justify-end">
          <ExportButtons
            onExport={handleExport}
            isExporting={generateMutation.isPending}
          />
        </div>
      )}

      {/* Report Data */}
      <Card>
        <CardContent className="pt-6">
          {previewMutation.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : previewData ? (
            <ReportViewer dataSet={previewData} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t("reports.setParametersToPreview")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
