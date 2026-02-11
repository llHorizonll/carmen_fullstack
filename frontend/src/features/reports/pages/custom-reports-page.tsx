import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Play, FileText } from "lucide-react"
import { useReportTemplates, useDeleteTemplate, useGenerateCustomReport } from "../hooks"
import { DataSourceType, OutputFormat } from "../types"
import { Skeleton } from "@/components/ui/skeleton"

const dataSourceLabels: Record<number, string> = {
  [DataSourceType.GeneralLedger]: "General Ledger",
  [DataSourceType.AccountsPayable]: "Accounts Payable",
  [DataSourceType.AccountsReceivable]: "Accounts Receivable",
  [DataSourceType.AssetManagement]: "Asset Management",
}

export function CustomReportsPage() {
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()
  const { data: templates, isLoading } = useReportTemplates()
  const deleteTemplate = useDeleteTemplate()
  const generateReport = useGenerateCustomReport()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const canCreate = hasPermission("Reports.Create")
  const canEdit = hasPermission("Reports.Edit")
  const canDelete = hasPermission("Reports.Delete")
  const canGenerate = hasPermission("Reports.Generate")

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTemplate.mutateAsync(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Reports</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your custom report templates
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate("/reports/builder")}>
            <Plus className="h-4 w-4 mr-1" />
            New Report
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Saved Templates</CardTitle>
          <CardDescription>
            Your custom report templates. Click to edit or run them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !templates || templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No templates yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first custom report template using the Report Builder.
              </p>
              {canCreate && (
                <Button onClick={() => navigate("/reports/builder")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Report
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Data Source</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {dataSourceLabels[template.dataSourceType] ?? "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.isPublic ? "default" : "secondary"}>
                        {template.isPublic ? "Public" : "Private"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {template.defaultOutputFormat === OutputFormat.Pdf ? "PDF" : "Excel"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canGenerate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              generateReport.mutate({
                                templateId: template.id,
                                outputFormat: template.defaultOutputFormat,
                              })
                            }
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/reports/builder/${template.id}`)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(template.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
