import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"
import { useReportBuilderStore } from "@/stores/report-builder-store"
import { FilterOperator } from "../../types"

const operatorLabels: Record<number, string> = {
  [FilterOperator.Equals]: "Equals",
  [FilterOperator.NotEquals]: "Not Equals",
  [FilterOperator.Contains]: "Contains",
  [FilterOperator.StartsWith]: "Starts With",
  [FilterOperator.EndsWith]: "Ends With",
  [FilterOperator.GreaterThan]: ">",
  [FilterOperator.GreaterThanOrEqual]: ">=",
  [FilterOperator.LessThan]: "<",
  [FilterOperator.LessThanOrEqual]: "<=",
  [FilterOperator.Between]: "Between",
  [FilterOperator.IsNull]: "Is Empty",
  [FilterOperator.IsNotNull]: "Is Not Empty",
}

export function FilterBuilder() {
  const { filters, availableFields, addFilter, removeFilter, updateFilter } =
    useReportBuilderStore()

  const filterableFields = availableFields.filter((f) => f.isFilterable)

  return (
    <div className="space-y-3">
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-background">
          <Select
            value={filter.fieldName}
            onValueChange={(val) => updateFilter(index, { fieldName: val })}
          >
            <SelectTrigger className="h-8 text-sm w-[160px]">
              <SelectValue placeholder="Field" />
            </SelectTrigger>
            <SelectContent>
              {filterableFields.map((f) => (
                <SelectItem key={f.fieldName} value={f.fieldName}>
                  {f.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(filter.operator)}
            onValueChange={(val) => updateFilter(index, { operator: Number(val) as FilterOperator })}
          >
            <SelectTrigger className="h-8 text-sm w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(operatorLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filter.operator !== FilterOperator.IsNull &&
            filter.operator !== FilterOperator.IsNotNull && (
              <Input
                value={filter.value ?? ""}
                onChange={(e) => updateFilter(index, { value: e.target.value })}
                className="h-8 text-sm flex-1"
                placeholder="Value"
              />
            )}

          {filter.operator === FilterOperator.Between && (
            <Input
              value={filter.value2 ?? ""}
              onChange={(e) => updateFilter(index, { value2: e.target.value })}
              className="h-8 text-sm flex-1"
              placeholder="Value 2"
            />
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive shrink-0"
            onClick={() => removeFilter(index)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}

      {filterableFields.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => addFilter(filterableFields[0].fieldName)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Filter
        </Button>
      )}
    </div>
  )
}
