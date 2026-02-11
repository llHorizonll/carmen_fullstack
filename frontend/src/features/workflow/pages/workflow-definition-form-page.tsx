import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { GitBranch, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  useWorkflowDefinition,
  useCreateWorkflowDefinition,
  useUpdateWorkflowDefinition,
} from "../hooks"
import { WorkflowEntityTypeLabels } from "../types"
import type { WorkflowEntityType } from "../types"

const stepSchema = z.object({
  stepOrder: z.number().min(1),
  stepName: z.string().min(1, "Step name is required"),
  approverUserId: z.string().optional(),
  approverRoleId: z.string().optional(),
  allowDelegation: z.boolean(),
})

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(500).optional(),
  entityType: z.number().min(1).max(5),
  amountThreshold: z.number().min(0).optional().nullable(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
})

type FormValues = z.infer<typeof formSchema>

export function WorkflowDefinitionFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { data: existing, isLoading: isLoadingExisting } = useWorkflowDefinition(id ?? "")
  const createMutation = useCreateWorkflowDefinition()
  const updateMutation = useUpdateWorkflowDefinition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      entityType: 1,
      amountThreshold: null,
      isDefault: false,
      isActive: true,
      steps: [{ stepOrder: 1, stepName: "", allowDelegation: true }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  })

  React.useEffect(() => {
    if (existing && isEdit) {
      form.reset({
        name: existing.name,
        description: existing.description ?? "",
        entityType: existing.entityType,
        amountThreshold: existing.amountThreshold ?? null,
        isDefault: existing.isDefault,
        isActive: existing.isActive,
        steps: existing.steps.map((s) => ({
          stepOrder: s.stepOrder,
          stepName: s.stepName,
          approverUserId: s.approverUserId ?? undefined,
          approverRoleId: s.approverRoleId ?? undefined,
          allowDelegation: s.allowDelegation,
        })),
      })
    }
  }, [existing, isEdit, form])

  const onSubmit = (values: FormValues) => {
    // Recalculate step orders
    const steps = values.steps.map((s, i) => ({
      ...s,
      stepOrder: i + 1,
      approverUserId: s.approverUserId || undefined,
      approverRoleId: s.approverRoleId || undefined,
    }))

    if (isEdit && id) {
      updateMutation.mutate(
        {
          id,
          request: {
            name: values.name,
            description: values.description,
            amountThreshold: values.amountThreshold ?? undefined,
            isDefault: values.isDefault,
            isActive: values.isActive,
            steps,
          },
        },
        { onSuccess: () => navigate("/settings/workflows") }
      )
    } else {
      createMutation.mutate(
        {
          name: values.name,
          description: values.description,
          entityType: values.entityType as WorkflowEntityType,
          amountThreshold: values.amountThreshold ?? undefined,
          isDefault: values.isDefault,
          steps,
        },
        { onSuccess: () => navigate("/settings/workflows") }
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEdit && isLoadingExisting) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GitBranch className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? t("workflow.definitions.editDefinition") : t("workflow.definitions.newDefinition")}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update workflow definition settings and steps" : "Create a new approval workflow"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Details</CardTitle>
              <CardDescription>Basic information about this workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., AP Invoice Approval" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                        disabled={isEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(WorkflowEntityTypeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isEdit && <FormDescription>Entity type cannot be changed after creation</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="amountThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Threshold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Optional"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormDescription>Triggers for amounts above this threshold</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0 pt-6">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div>
                        <FormLabel>Default Workflow</FormLabel>
                        <FormDescription>Used when no threshold-specific workflow matches</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {isEdit && (
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0 pt-6">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div>
                          <FormLabel>Active</FormLabel>
                          <FormDescription>Inactive workflows won't be used</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Approval Steps</CardTitle>
                  <CardDescription>Define the approval steps in order</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      stepOrder: fields.length + 1,
                      stepName: "",
                      allowDelegation: true,
                    })
                  }
                >
                  <Plus className="size-4 mr-1" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No steps defined. Add at least one approval step.
                </p>
              )}

              {fields.map((field, index) => (
                <div key={field.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0 mt-2">
                      {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`steps.${index}.stepName`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Step Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Manager Approval" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`steps.${index}.approverUserId`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Approver User ID</FormLabel>
                            <FormControl>
                              <Input placeholder="User ID (optional)" {...f} value={f.value ?? ""} />
                            </FormControl>
                            <FormDescription>Specific user or leave empty for role</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`steps.${index}.allowDelegation`}
                        render={({ field: f }) => (
                          <FormItem className="flex items-center gap-3 space-y-0 pt-6">
                            <FormControl>
                              <Switch checked={f.value} onCheckedChange={f.onChange} />
                            </FormControl>
                            <FormLabel>Allow Delegation</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 mt-8"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update Workflow" : "Create Workflow"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/settings/workflows")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
