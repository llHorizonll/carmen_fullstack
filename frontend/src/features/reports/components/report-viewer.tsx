import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { ReportDataSet } from "../types"

type ReportViewerProps = {
  dataSet?: ReportDataSet
  isLoading?: boolean
}

// ColumnType enum values from backend
const COLUMN_TYPE_CURRENCY = 2
const COLUMN_TYPE_NUMBER = 1
const COLUMN_TYPE_DATE = 3
const COLUMN_TYPE_PERCENTAGE = 5

export function ReportViewer({ dataSet, isLoading }: ReportViewerProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (!dataSet) return null

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{dataSet.reportTitle}</h3>
        {dataSet.reportSubtitle && (
          <p className="text-sm text-muted-foreground">{dataSet.reportSubtitle}</p>
        )}
      </div>

      <div className="rounded-md border overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              {dataSet.columns.map((col) => (
                <TableHead
                  key={col.fieldName}
                  className={isNumericColumn(col.columnType) ? "text-right" : ""}
                >
                  {col.displayName}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataSet.rows.map((row, i) => (
              <TableRow key={i}>
                {dataSet.columns.map((col) => (
                  <TableCell
                    key={col.fieldName}
                    className={isNumericColumn(col.columnType) ? "text-right font-mono" : ""}
                  >
                    {formatCellValue(row[col.fieldName], col.columnType)}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Grand totals row */}
            {dataSet.grandTotals && (
              <TableRow className="font-bold border-t-2 bg-muted/50">
                {dataSet.columns.map((col, i) => {
                  const totalValue = dataSet.grandTotals?.[col.fieldName]
                  return (
                    <TableCell
                      key={col.fieldName}
                      className={isNumericColumn(col.columnType) ? "text-right font-mono" : ""}
                    >
                      {totalValue != null
                        ? formatCellValue(totalValue, col.columnType)
                        : i === 0
                          ? "Grand Total"
                          : ""}
                    </TableCell>
                  )
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {dataSet.rows.length} rows | Generated: {new Date(dataSet.generatedAt).toLocaleString()}
      </p>
    </div>
  )
}

function isNumericColumn(columnType: number): boolean {
  return columnType === COLUMN_TYPE_CURRENCY
    || columnType === COLUMN_TYPE_NUMBER
    || columnType === COLUMN_TYPE_PERCENTAGE
}

function formatCellValue(value: unknown, columnType: number): string {
  if (value == null) return ""

  switch (columnType) {
    case COLUMN_TYPE_CURRENCY:
      return typeof value === "number"
        ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
        : String(value)
    case COLUMN_TYPE_NUMBER:
      return typeof value === "number"
        ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
        : String(value)
    case COLUMN_TYPE_DATE:
      return typeof value === "string"
        ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : String(value)
    case COLUMN_TYPE_PERCENTAGE:
      return typeof value === "number" ? `${value.toFixed(2)}%` : String(value)
    default:
      return String(value)
  }
}
