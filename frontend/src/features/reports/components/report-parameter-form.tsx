import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ReportParameterDefinition } from "../types"

type ReportParameterFormProps = {
  parameters: ReportParameterDefinition[]
  onSubmit: (values: Record<string, string>) => void
  isLoading?: boolean
}

export function ReportParameterForm({ parameters, onSubmit, isLoading }: ReportParameterFormProps) {
  const { t } = useTranslation()
  const { register, handleSubmit, setValue, watch } = useForm<Record<string, string>>({
    defaultValues: Object.fromEntries(
      parameters.map((p) => [p.name, p.defaultValue ?? ""])
    ),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parameters.map((param) => (
          <div key={param.name} className="space-y-2">
            <Label htmlFor={param.name}>
              {param.label}
              {param.isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            {param.parameterType === "date" && (
              <Input
                id={param.name}
                type="date"
                {...register(param.name)}
              />
            )}
            {param.parameterType === "text" && (
              <Input
                id={param.name}
                type="text"
                {...register(param.name)}
              />
            )}
            {param.parameterType === "select" && param.options && (
              <Select
                value={watch(param.name)}
                onValueChange={(value) => setValue(param.name, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${param.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {param.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {param.parameterType === "accountPicker" && (
              <Input
                id={param.name}
                type="text"
                placeholder="Account ID (optional)"
                {...register(param.name)}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("common.loading") : t("reports.preview")}
        </Button>
      </div>
    </form>
  )
}
