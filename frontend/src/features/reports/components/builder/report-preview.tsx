import { Button } from "@/components/ui/button"
import { Loader2, Eye } from "lucide-react"
import { useReportBuilderStore } from "@/stores/report-builder-store"
import { ReportViewer } from "../report-viewer"

interface ReportPreviewProps {
  onPreview: () => void
}

export function ReportPreview({ onPreview }: ReportPreviewProps) {
  const { previewData, isPreviewLoading, columns } = useReportBuilderStore()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Preview</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          disabled={columns.length === 0 || isPreviewLoading}
        >
          {isPreviewLoading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Eye className="h-3 w-3 mr-1" />
          )}
          Preview
        </Button>
      </div>

      {previewData ? (
        <div className="border rounded-md overflow-auto max-h-[400px]">
          <ReportViewer dataSet={previewData} />
        </div>
      ) : (
        <div className="border border-dashed rounded-md p-8 text-center text-sm text-muted-foreground">
          {columns.length === 0
            ? "Add columns to preview report data"
            : "Click Preview to see report data"}
        </div>
      )}
    </div>
  )
}
