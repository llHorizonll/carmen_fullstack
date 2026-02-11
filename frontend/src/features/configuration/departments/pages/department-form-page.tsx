import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

import {
  useDepartment,
  useDepartmentLookup,
  useCreateDepartment,
  useUpdateDepartment,
} from "../hooks"

// Form validation schema
const departmentFormSchema = z.object({
  departmentCode: z
    .string()
    .min(1, "Department code is required")
    .max(20, "Department code must be 20 characters or less")
    .regex(
      /^[A-Z0-9_-]+$/i,
      "Department code must contain only letters, numbers, underscores, and hyphens"
    ),
  departmentName: z
    .string()
    .min(1, "Department name is required")
    .max(100, "Department name must be 100 characters or less"),
  departmentNameLocal: z.string().max(100).optional().nullable(),
  parentDepartmentId: z.string().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  costCenterCode: z.string().max(50).optional().nullable(),
  managerName: z.string().max(100).optional().nullable(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
})

type DepartmentFormValues = z.infer<typeof departmentFormSchema>

export function DepartmentFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const { data: department, isLoading: isLoadingDepartment } = useDepartment(id)
  const { data: departmentLookup } = useDepartmentLookup(true, id) // Exclude self when editing
  const createDepartment = useCreateDepartment()
  const updateDepartment = useUpdateDepartment()

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      departmentCode: "",
      departmentName: "",
      departmentNameLocal: "",
      parentDepartmentId: null,
      description: "",
      costCenterCode: "",
      managerName: "",
      sortOrder: 0,
      isActive: true,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (department && isEdit) {
      form.reset({
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        departmentNameLocal: department.departmentNameLocal ?? "",
        parentDepartmentId: department.parentDepartmentId ?? null,
        description: department.description ?? "",
        costCenterCode: department.costCenterCode ?? "",
        managerName: department.managerName ?? "",
        sortOrder: department.sortOrder,
        isActive: department.isActive,
      })
    }
  }, [department, isEdit, form])

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      if (isEdit && id) {
        await updateDepartment.mutateAsync({
          id,
          data: {
            departmentName: data.departmentName,
            departmentNameLocal: data.departmentNameLocal || undefined,
            parentDepartmentId: data.parentDepartmentId || undefined,
            description: data.description || undefined,
            costCenterCode: data.costCenterCode || undefined,
            managerName: data.managerName || undefined,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        })
      } else {
        await createDepartment.mutateAsync({
          departmentCode: data.departmentCode.toUpperCase(),
          departmentName: data.departmentName,
          departmentNameLocal: data.departmentNameLocal || undefined,
          parentDepartmentId: data.parentDepartmentId || undefined,
          description: data.description || undefined,
          costCenterCode: data.costCenterCode || undefined,
          managerName: data.managerName || undefined,
          sortOrder: data.sortOrder,
        })
      }
      navigate("/configuration/departments")
    } catch {
      // Error handling is done in the mutation hooks
    }
  }

  const isSubmitting = createDepartment.isPending || updateDepartment.isPending

  if (isEdit && isLoadingDepartment) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? "Edit Department" : "New Department"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update department information"
              : "Create a new organizational department"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Define the department code, name, and hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="departmentCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., FIN"
                          {...field}
                          disabled={isEdit}
                          className="uppercase"
                          maxLength={20}
                        />
                      </FormControl>
                      <FormDescription>
                        Unique code for this department
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentDepartmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Department</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                        value={field.value ?? "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">— None (Top-Level) —</SelectItem>
                          {departmentLookup?.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {"—".repeat(dept.level - 1)} {dept.departmentCode} - {dept.departmentName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a parent for hierarchy, or leave empty for top-level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="departmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Finance Department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentNameLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Department name in local language"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional name in the local language
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description of the department..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Cost center and management details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="costCenterCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Center Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., CC-FIN-001"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        For accounting integration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="managerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Manager</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Manager name"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Head of department
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure display order and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-32"
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first in lists
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEdit && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Inactive departments will not appear in lookups
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Update Department" : "Create Department"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
