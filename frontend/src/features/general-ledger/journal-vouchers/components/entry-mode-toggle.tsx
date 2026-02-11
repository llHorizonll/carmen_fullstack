import { Table2, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type EntryMode = "form" | "spreadsheet"

interface EntryModeToggleProps {
  mode: EntryMode
  onChange: (mode: EntryMode) => void
  disabled?: boolean
}

export function EntryModeToggle({ mode, onChange, disabled }: EntryModeToggleProps) {
  return (
    <div className="inline-flex rounded-md border bg-muted p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 gap-2 rounded-sm px-3 text-sm",
          mode === "form" && "bg-background shadow-sm"
        )}
        onClick={() => onChange("form")}
        disabled={disabled}
      >
        <Table2 className="size-4" />
        Form
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 gap-2 rounded-sm px-3 text-sm",
          mode === "spreadsheet" && "bg-background shadow-sm"
        )}
        onClick={() => onChange("spreadsheet")}
        disabled={disabled}
      >
        <Grid3X3 className="size-4" />
        Spreadsheet
      </Button>
    </div>
  )
}
