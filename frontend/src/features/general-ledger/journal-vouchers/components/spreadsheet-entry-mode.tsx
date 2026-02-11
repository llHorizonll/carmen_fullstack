import { useCallback, useMemo } from "react"
import DataEditor, {
  GridCellKind,
  type GridColumn,
  type EditableGridCell,
  type Item,
  type GridCell,
  type GridSelection,
} from "@glideapps/glide-data-grid"
import "@glideapps/glide-data-grid/dist/index.css"

import { cn, formatCurrency } from "@/lib/utils"
import type { AccountLookupDto } from "../../accounts/types"

// Line item interface matching the form schema
export interface SpreadsheetLine {
  id?: string
  accountId: string
  accountCode?: string
  accountName?: string
  debitAmount: number
  creditAmount: number
  description?: string
  reference?: string
  departmentId?: string
}

interface SpreadsheetEntryModeProps {
  lines: SpreadsheetLine[]
  onChange: (lines: SpreadsheetLine[]) => void
  accounts: AccountLookupDto[]
  currencyCode: string
  disabled?: boolean
}

// Column definitions
const columns: GridColumn[] = [
  { id: "lineNumber", title: "#", width: 50, grow: 0 },
  { id: "accountCode", title: "Account Code", width: 130, grow: 0 },
  { id: "accountName", title: "Account Name", width: 200, grow: 1 },
  { id: "description", title: "Description", width: 200, grow: 1 },
  { id: "debitAmount", title: "Debit", width: 120, grow: 0 },
  { id: "creditAmount", title: "Credit", width: 120, grow: 0 },
]

const MIN_ROWS = 5

export function SpreadsheetEntryMode({
  lines,
  onChange,
  accounts,
  currencyCode,
  disabled = false,
}: SpreadsheetEntryModeProps) {
  // Ensure minimum rows
  const paddedLines = useMemo(() => {
    const result = [...lines]
    while (result.length < MIN_ROWS) {
      result.push({
        accountId: "",
        debitAmount: 0,
        creditAmount: 0,
        description: "",
      })
    }
    return result
  }, [lines])

  // Calculate totals
  const totals = useMemo(() => {
    const totalDebit = paddedLines.reduce((sum, line) => sum + (line.debitAmount || 0), 0)
    const totalCredit = paddedLines.reduce((sum, line) => sum + (line.creditAmount || 0), 0)
    const difference = totalDebit - totalCredit
    return { totalDebit, totalCredit, difference, isBalanced: Math.abs(difference) < 0.01 }
  }, [paddedLines])

  // Get account by ID
  const getAccountById = useCallback(
    (accountId: string) => accounts.find((a) => a.id === accountId),
    [accounts]
  )

  // Get account by code
  const getAccountByCode = useCallback(
    (code: string) => accounts.find((a) => a.accountCode.toLowerCase() === code.toLowerCase()),
    [accounts]
  )

  // Cell content provider
  const getCellContent = useCallback(
    ([col, row]: Item): GridCell => {
      const line = paddedLines[row]
      if (!line) {
        return { kind: GridCellKind.Text, data: "", displayData: "", allowOverlay: false }
      }

      const account = line.accountId ? getAccountById(line.accountId) : undefined

      switch (columns[col].id) {
        case "lineNumber":
          return {
            kind: GridCellKind.Number,
            data: row + 1,
            displayData: String(row + 1),
            allowOverlay: false,
            readonly: true,
          }

        case "accountCode":
          return {
            kind: GridCellKind.Text,
            data: account?.accountCode || line.accountCode || "",
            displayData: account?.accountCode || line.accountCode || "",
            allowOverlay: !disabled,
            style: !line.accountId && line.accountCode ? "faded" : undefined,
          }

        case "accountName":
          return {
            kind: GridCellKind.Text,
            data: account?.accountName || line.accountName || "",
            displayData: account?.accountName || line.accountName || "",
            allowOverlay: false,
            readonly: true,
            style: "faded",
          }

        case "description":
          return {
            kind: GridCellKind.Text,
            data: line.description || "",
            displayData: line.description || "",
            allowOverlay: !disabled,
          }

        case "debitAmount":
          return {
            kind: GridCellKind.Number,
            data: line.debitAmount || undefined,
            displayData: line.debitAmount ? formatCurrency(line.debitAmount, currencyCode) : "",
            allowOverlay: !disabled,
            contentAlign: "right",
          }

        case "creditAmount":
          return {
            kind: GridCellKind.Number,
            data: line.creditAmount || undefined,
            displayData: line.creditAmount ? formatCurrency(line.creditAmount, currencyCode) : "",
            allowOverlay: !disabled,
            contentAlign: "right",
          }

        default:
          return { kind: GridCellKind.Text, data: "", displayData: "", allowOverlay: false }
      }
    },
    [paddedLines, getAccountById, currencyCode, disabled]
  )

  // Cell edit handler
  const onCellEdited = useCallback(
    ([col, row]: Item, newValue: EditableGridCell) => {
      if (disabled) return

      const newLines = [...paddedLines]
      const line = { ...newLines[row] }

      switch (columns[col].id) {
        case "accountCode":
          if (newValue.kind === GridCellKind.Text) {
            const code = newValue.data
            const account = getAccountByCode(code)
            if (account) {
              line.accountId = account.id
              line.accountCode = account.accountCode
              line.accountName = account.accountName
            } else {
              line.accountCode = code
              line.accountId = ""
              line.accountName = ""
            }
          }
          break

        case "description":
          if (newValue.kind === GridCellKind.Text) {
            line.description = newValue.data
          }
          break

        case "debitAmount":
          if (newValue.kind === GridCellKind.Number) {
            line.debitAmount = newValue.data ?? 0
            // Auto-clear credit when debit is entered
            if (line.debitAmount > 0) {
              line.creditAmount = 0
            }
          }
          break

        case "creditAmount":
          if (newValue.kind === GridCellKind.Number) {
            line.creditAmount = newValue.data ?? 0
            // Auto-clear debit when credit is entered
            if (line.creditAmount > 0) {
              line.debitAmount = 0
            }
          }
          break
      }

      newLines[row] = line

      // Filter out completely empty rows at the end, keeping at least 2
      const nonEmptyLines = newLines.filter(
        (l, idx) =>
          l.accountId ||
          l.debitAmount > 0 ||
          l.creditAmount > 0 ||
          l.description ||
          idx < 2
      )

      onChange(nonEmptyLines)
    },
    [paddedLines, onChange, getAccountByCode, disabled]
  )

  // Handle row append
  const onRowAppended = useCallback(() => {
    if (disabled) return

    const newLines = [
      ...paddedLines,
      { accountId: "", debitAmount: 0, creditAmount: 0, description: "" },
    ]
    onChange(newLines)
  }, [paddedLines, onChange, disabled])

  // Handle paste
  const onPaste = useCallback(
    (target: Item, values: readonly (readonly string[])[]) => {
      if (disabled) return false

      const newLines = [...paddedLines]
      const [startCol, startRow] = target

      for (let rowOffset = 0; rowOffset < values.length; rowOffset++) {
        const row = values[rowOffset]
        const targetRowIdx = startRow + rowOffset

        // Add new rows if needed
        while (newLines.length <= targetRowIdx) {
          newLines.push({ accountId: "", debitAmount: 0, creditAmount: 0, description: "" })
        }

        const line = { ...newLines[targetRowIdx] }

        for (let colOffset = 0; colOffset < row.length; colOffset++) {
          const colIdx = startCol + colOffset
          if (colIdx >= columns.length) continue

          const value = row[colOffset]

          switch (columns[colIdx].id) {
            case "accountCode": {
              const account = getAccountByCode(value)
              if (account) {
                line.accountId = account.id
                line.accountCode = account.accountCode
                line.accountName = account.accountName
              } else {
                line.accountCode = value
                line.accountId = ""
              }
              break
            }

            case "description":
              line.description = value
              break

            case "debitAmount": {
              const num = parseFloat(value.replace(/[^0-9.-]/g, ""))
              line.debitAmount = isNaN(num) ? 0 : num
              if (line.debitAmount > 0) line.creditAmount = 0
              break
            }

            case "creditAmount": {
              const num = parseFloat(value.replace(/[^0-9.-]/g, ""))
              line.creditAmount = isNaN(num) ? 0 : num
              if (line.creditAmount > 0) line.debitAmount = 0
              break
            }
          }
        }

        newLines[targetRowIdx] = line
      }

      onChange(newLines)
      return true
    },
    [paddedLines, onChange, getAccountByCode, disabled]
  )

  // Handle delete
  const onDelete = useCallback(
    (selection: GridSelection) => {
      if (disabled) return false

      const newLines = [...paddedLines]

      // Handle range selection
      if (selection.current !== undefined) {
        const { cell, range, rangeStack } = selection.current

        // Process the current range
        if (range) {
          for (let row = range.y; row < range.y + range.height; row++) {
            if (row >= newLines.length) continue

            const line = { ...newLines[row] }

            for (let col = range.x; col < range.x + range.width; col++) {
              switch (columns[col].id) {
                case "accountCode":
                  line.accountId = ""
                  line.accountCode = ""
                  line.accountName = ""
                  break
                case "description":
                  line.description = ""
                  break
                case "debitAmount":
                  line.debitAmount = 0
                  break
                case "creditAmount":
                  line.creditAmount = 0
                  break
              }
            }

            newLines[row] = line
          }
        } else if (cell) {
          // Single cell selection
          const [col, row] = cell
          if (row < newLines.length) {
            const line = { ...newLines[row] }
            switch (columns[col].id) {
              case "accountCode":
                line.accountId = ""
                line.accountCode = ""
                line.accountName = ""
                break
              case "description":
                line.description = ""
                break
              case "debitAmount":
                line.debitAmount = 0
                break
              case "creditAmount":
                line.creditAmount = 0
                break
            }
            newLines[row] = line
          }
        }

        // Also process any additional ranges in rangeStack
        rangeStack?.forEach((r) => {
          for (let row = r.y; row < r.y + r.height; row++) {
            if (row >= newLines.length) continue

            const line = { ...newLines[row] }

            for (let col = r.x; col < r.x + r.width; col++) {
              switch (columns[col].id) {
                case "accountCode":
                  line.accountId = ""
                  line.accountCode = ""
                  line.accountName = ""
                  break
                case "description":
                  line.description = ""
                  break
                case "debitAmount":
                  line.debitAmount = 0
                  break
                case "creditAmount":
                  line.creditAmount = 0
                  break
              }
            }

            newLines[row] = line
          }
        })
      }

      onChange(newLines)
      return true
    },
    [paddedLines, onChange, disabled]
  )

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-md border",
          !totals.isBalanced && totals.totalDebit > 0 && "border-destructive"
        )}
      >
        <DataEditor
          columns={columns}
          rows={paddedLines.length}
          getCellContent={getCellContent}
          onCellEdited={onCellEdited}
          onRowAppended={onRowAppended}
          onPaste={onPaste}
          onDelete={onDelete}
          rowMarkers="number"
          smoothScrollX
          smoothScrollY
          width="100%"
          height={Math.min(400, 36 + paddedLines.length * 32 + 40)}
          trailingRowOptions={{
            sticky: true,
            tint: true,
            hint: "Add row...",
          }}
          getCellsForSelection={true}
          keybindings={{
            search: true,
            copy: true,
            paste: true,
            cut: true,
            clear: true,
          }}
        />
      </div>

      {/* Totals row */}
      <div
        className={cn(
          "flex items-center justify-end gap-8 rounded-md border px-4 py-2 text-sm",
          !totals.isBalanced && totals.totalDebit > 0
            ? "border-destructive bg-destructive/10"
            : "bg-muted/50"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total Debit:</span>
          <span className="font-mono font-semibold">
            {formatCurrency(totals.totalDebit, currencyCode)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total Credit:</span>
          <span className="font-mono font-semibold">
            {formatCurrency(totals.totalCredit, currencyCode)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totals.isBalanced ? (
            totals.totalDebit > 0 && (
              <span className="font-medium text-green-600">Balanced</span>
            )
          ) : (
            <span className="font-medium text-destructive">
              Out of balance: {formatCurrency(Math.abs(totals.difference), currencyCode)}
            </span>
          )}
        </div>
      </div>

      {/* Account code help */}
      <p className="text-xs text-muted-foreground">
        Tip: Type account code directly and press Tab/Enter to auto-lookup. Copy/paste from Excel
        is supported.
      </p>
    </div>
  )
}
