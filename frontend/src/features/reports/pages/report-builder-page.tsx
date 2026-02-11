import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useReportBuilderStore } from "@/stores/report-builder-store"
import { useCreateTemplate, useUpdateTemplate, useReportTemplate, useDataSourceFields } from "../hooks"
import { reportsApi } from "../api"
import { useTenantId } from "@/hooks/useTenantId"
import { DataSourceSelector } from "../components/builder/data-source-selector"
import { FieldSelector } from "../components/builder/field-selector"
import { ColumnConfigurator } from "../components/builder/column-configurator"
import { FilterBuilder } from "../components/builder/filter-builder"
import { GroupingConfigurator } from "../components/builder/grouping-configurator"
import { ReportPreview } from "../components/builder/report-preview"
import { TemplateSaveDialog } from "../components/builder/template-save-dialog"
import { ExportButtons } from "../components/export-buttons"

export function ReportBuilderPage() {
  const navigate = useNavigate()
  const { id: templateId } = useParams<{ id: string }>()
  const tenantId = useTenantId()
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const { hasPermission } = useAuthStore()
  const canGenerate = hasPermission("Reports.Generate")

  const store = useReportBuilderStore()
  const { data: templateData } = useReportTemplate(templateId ?? null)
  const { data: fields } = useDataSourceFields(store.dataSource)
  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()

  // Load template data when editing
  useEffect(() => {
    if (templateId && templateData) {
      store.setEditingTemplateId(templateId)
      store.loadTemplate({
        dataSource: templateData.dataSourceType,
        name: templateData.name,
        description: templateData.description,
        isPublic: templateData.isPublic,
        defaultOutputFormat: templateData.defaultOutputFormat,
        pageOrientation: templateData.pageOrientation,
        columns: templateData.columns,
        filters: templateData.filters,
        groups: templateData.groups,
      })
    }
  }, [templateId, templateData])

  // Update available fields when data source changes
  useEffect(() => {
    if (fields) {
      store.setAvailableFields(fields)
    }
  }, [fields])

  // Reset on unmount
  useEffect(() => {
    return () => {
      store.reset()
    }
  }, [])

  const handlePreview = async () => {
    if (store.columns.length === 0 || store.dataSource === null) return

    store.setIsPreviewLoading(true)
    try {
      // If we have a saved template, use its preview
      if (store.editingTemplateId) {
        const data = await reportsApi.previewCustomReport(tenantId, store.editingTemplateId)
        store.setPreviewData(data)
      } else {
        // For unsaved templates, we need to save first then preview
        // Or we can create a temp template. For now, show a message
        const tempRequest = {
          name: store.templateName || "Temp Preview",
          dataSourceType: store.dataSource,
          isPublic: false,
          defaultOutputFormat: store.defaultOutputFormat,
          pageOrientation: store.pageOrientation,
          columns: store.columns,
          filters: store.filters.length > 0 ? store.filters : undefined,
          groups: store.groups.length > 0 ? store.groups : undefined,
        }
        const template = await reportsApi.createTemplate(tenantId, tempRequest)
        store.setEditingTemplateId(template.id)
        const data = await reportsApi.previewCustomReport(tenantId, template.id)
        store.setPreviewData(data)
      }
    } catch {
      // Error handled by API client
    } finally {
      store.setIsPreviewLoading(false)
    }
  }

  const handleSave = async () => {
    if (store.editingTemplateId) {
      await updateTemplate.mutateAsync({
        id: store.editingTemplateId,
        request: {
          name: store.templateName,
          description: store.templateDescription || undefined,
          isPublic: store.isPublic,
          defaultOutputFormat: store.defaultOutputFormat,
          pageOrientation: store.pageOrientation,
          columns: store.columns,
          filters: store.filters.length > 0 ? store.filters : undefined,
          groups: store.groups.length > 0 ? store.groups : undefined,
        },
      })
    } else {
      const created = await createTemplate.mutateAsync({
        name: store.templateName,
        description: store.templateDescription || undefined,
        dataSourceType: store.dataSource!,
        isPublic: store.isPublic,
        defaultOutputFormat: store.defaultOutputFormat,
        pageOrientation: store.pageOrientation,
        columns: store.columns,
        filters: store.filters.length > 0 ? store.filters : undefined,
        groups: store.groups.length > 0 ? store.groups : undefined,
      })
      store.setEditingTemplateId(created.id)
    }
    setShowSaveDialog(false)
  }

  const handleExport = async (format: number) => {
    if (!store.editingTemplateId) return
    const blob = await reportsApi.generateCustomReport(tenantId, store.editingTemplateId, {
      outputFormat: format,
    })
    const extension = format === 0 ? "pdf" : "xlsx"
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${store.templateName || "Report"}_${new Date().toISOString().slice(0, 10)}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/reports/custom")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {templateId ? "Edit Report" : "Report Builder"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Design your custom report by selecting fields, filters, and groupings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {store.editingTemplateId && store.previewData && canGenerate && (
            <ExportButtons onExport={handleExport} />
          )}
          <Button onClick={() => setShowSaveDialog(true)} disabled={store.columns.length === 0}>
            <Save className="h-4 w-4 mr-1" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Data Source & Fields */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Data Source</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DataSourceSelector />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Available Fields</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-2">
              <FieldSelector />
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Configuration */}
        <div className="col-span-9 space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">
                Columns ({store.columns.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ColumnConfigurator />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">
                Filters ({store.filters.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <FilterBuilder />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">
                Grouping ({store.groups.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <GroupingConfigurator />
            </CardContent>
          </Card>

          <Separator />

          <ReportPreview onPreview={handlePreview} />
        </div>
      </div>

      <TemplateSaveDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSave}
        isSaving={createTemplate.isPending || updateTemplate.isPending}
      />
    </div>
  )
}
