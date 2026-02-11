import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import { useReportBuilderStore } from "@/stores/report-builder-store"
import { SortDirection } from "../../types"

export function GroupingConfigurator() {
  const { groups, availableFields, addGroup, removeGroup, updateGroup } =
    useReportBuilderStore()

  const groupableFields = availableFields.filter((f) => f.isGroupable)
  const selectedGroupFieldNames = new Set(groups.map((g) => g.fieldName))
  const availableGroupFields = groupableFields.filter(
    (f) => !selectedGroupFieldNames.has(f.fieldName)
  )

  return (
    <div className="space-y-3">
      {groups.map((group, index) => {
        const field = availableFields.find((f) => f.fieldName === group.fieldName)
        return (
          <div key={index} className="flex items-center gap-3 p-2 border rounded-md bg-background">
            <span className="text-sm font-medium min-w-[120px] truncate">
              {field?.displayName ?? group.fieldName}
            </span>

            <Select
              value={String(group.sortDirection)}
              onValueChange={(val) =>
                updateGroup(index, { sortDirection: Number(val) as SortDirection })
              }
            >
              <SelectTrigger className="h-8 text-sm w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(SortDirection.Ascending)}>Asc</SelectItem>
                <SelectItem value={String(SortDirection.Descending)}>Desc</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5">
              <Switch
                id={`subtotals-${index}`}
                checked={group.showSubtotals}
                onCheckedChange={(checked) => updateGroup(index, { showSubtotals: checked })}
              />
              <Label htmlFor={`subtotals-${index}`} className="text-xs">
                Subtotals
              </Label>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive shrink-0 ml-auto"
              onClick={() => removeGroup(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )
      })}

      {availableGroupFields.length > 0 && (
        <Select onValueChange={(val) => addGroup(val)}>
          <SelectTrigger className="h-8 text-sm">
            <div className="flex items-center gap-1">
              <Plus className="h-3 w-3" />
              <span>Add Group</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableGroupFields.map((f) => (
              <SelectItem key={f.fieldName} value={f.fieldName}>
                {f.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
