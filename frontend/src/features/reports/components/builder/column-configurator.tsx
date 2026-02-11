import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { X, GripVertical, ArrowUp, ArrowDown } from "lucide-react"
import { useReportBuilderStore } from "@/stores/report-builder-store"
import { AggregateFunction, SortDirection, ColumnType } from "../../types"

export function ColumnConfigurator() {
  const { columns, removeColumn, updateColumn, reorderColumns } = useReportBuilderStore()

  if (columns.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-md">
        Add fields from the left panel to configure columns
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {columns.map((col, index) => (
        <div
          key={`${col.fieldName}-${index}`}
          className="flex items-center gap-2 p-2 border rounded-md bg-background"
        >
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              disabled={index === 0}
              onClick={() => reorderColumns(index, index - 1)}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              disabled={index === columns.length - 1}
              onClick={() => reorderColumns(index, index + 1)}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex-1 grid grid-cols-4 gap-2 items-center">
            <Input
              value={col.displayName}
              onChange={(e) => updateColumn(index, { displayName: e.target.value })}
              className="h-8 text-sm"
              placeholder="Display Name"
            />

            <Input
              type="number"
              value={col.width}
              onChange={(e) => updateColumn(index, { width: Number(e.target.value) })}
              className="h-8 text-sm"
              placeholder="Width"
              min={40}
              max={500}
            />

            {(col.columnType === ColumnType.Currency || col.columnType === ColumnType.Number) && (
              <Select
                value={String(col.aggregateFunction)}
                onValueChange={(val) =>
                  updateColumn(index, { aggregateFunction: Number(val) as AggregateFunction })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(AggregateFunction.None)}>None</SelectItem>
                  <SelectItem value={String(AggregateFunction.Sum)}>Sum</SelectItem>
                  <SelectItem value={String(AggregateFunction.Count)}>Count</SelectItem>
                  <SelectItem value={String(AggregateFunction.Average)}>Average</SelectItem>
                  <SelectItem value={String(AggregateFunction.Min)}>Min</SelectItem>
                  <SelectItem value={String(AggregateFunction.Max)}>Max</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select
              value={col.sortDirection !== undefined ? String(col.sortDirection) : "none"}
              onValueChange={(val) =>
                updateColumn(index, {
                  sortDirection: val === "none" ? undefined : (Number(val) as SortDirection),
                  sortOrder: val === "none" ? undefined : index,
                })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Sort</SelectItem>
                <SelectItem value={String(SortDirection.Ascending)}>Asc</SelectItem>
                <SelectItem value={String(SortDirection.Descending)}>Desc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive shrink-0"
            onClick={() => removeColumn(index)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}
