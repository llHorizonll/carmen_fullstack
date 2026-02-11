import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { useReportBuilderStore } from "@/stores/report-builder-store"
import { useDataSourceFields } from "../../hooks"
import { ColumnType } from "../../types"

const columnTypeLabels: Record<number, string> = {
  [ColumnType.Text]: "Text",
  [ColumnType.Number]: "Number",
  [ColumnType.Currency]: "Currency",
  [ColumnType.Date]: "Date",
  [ColumnType.Boolean]: "Boolean",
  [ColumnType.Percentage]: "%",
}

const columnTypeBadgeVariant: Record<number, string> = {
  [ColumnType.Text]: "secondary",
  [ColumnType.Number]: "default",
  [ColumnType.Currency]: "default",
  [ColumnType.Date]: "outline",
  [ColumnType.Boolean]: "outline",
  [ColumnType.Percentage]: "default",
}

export function FieldSelector() {
  const { dataSource, columns, addColumn } = useReportBuilderStore()
  const { data: fields, isLoading } = useDataSourceFields(dataSource)

  if (dataSource === null) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        Select a data source to see available fields
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground p-4 text-center">Loading fields...</div>
  }

  const selectedFieldNames = new Set(columns.map((c) => c.fieldName))

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-1 p-1">
        {fields?.map((field) => {
          const isSelected = selectedFieldNames.has(field.fieldName)
          return (
            <div
              key={field.fieldName}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                isSelected
                  ? "bg-muted text-muted-foreground"
                  : "hover:bg-accent cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">{field.displayName}</span>
                <Badge
                  variant={columnTypeBadgeVariant[field.columnType] as "default" | "secondary" | "outline"}
                  className="text-[10px] px-1 py-0"
                >
                  {columnTypeLabels[field.columnType]}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                disabled={isSelected}
                onClick={() => addColumn(field)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
