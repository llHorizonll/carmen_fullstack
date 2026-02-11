import { FileDown, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OutputFormat } from "../types"

type ExportButtonsProps = {
  onExport: (format: OutputFormat) => void
  isExporting?: boolean
  disabled?: boolean
}

export function ExportButtons({ onExport, isExporting, disabled }: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExport(OutputFormat.Pdf)}
        disabled={disabled || isExporting}
      >
        <FileDown className="size-4 mr-2" />
        Export PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExport(OutputFormat.Excel)}
        disabled={disabled || isExporting}
      >
        <FileSpreadsheet className="size-4 mr-2" />
        Export Excel
      </Button>
    </div>
  )
}
