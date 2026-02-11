import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { useAssetCategory, useCreateAssetCategory, useUpdateAssetCategory } from "../hooks"
import { DepreciationMethod, depreciationMethodLabels } from "../../assets/types"

const formSchema = z.object({
  categoryCode: z.string().min(1, "Category code is required").max(20),
  categoryName: z.string().min(1, "Category name is required").max(100),
  categoryNameLocal: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  defaultUsefulLifeMonths: z.number().min(1).max(600),
  defaultDepreciationMethod: z.nativeEnum(DepreciationMethod),
  defaultSalvagePercent: z.number().min(0).max(100),
  assetCodePrefix: z.string().max(10).optional(),
  isActive: z.boolean(),
  notes: z.string().max(1000).optional(),
})

type FormData = z.infer<typeof formSchema>

export function AssetCategoryFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { data: category, isLoading: loadingCategory } = useAssetCategory(id)
  const createCategory = useCreateAssetCategory()
  const updateCategory = useUpdateAssetCategory()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryCode: "",
      categoryName: "",
      categoryNameLocal: "",
      description: "",
      defaultUsefulLifeMonths: 60,
      defaultDepreciationMethod: DepreciationMethod.StraightLine,
      defaultSalvagePercent: 5,
      assetCodePrefix: "",
      isActive: true,
      notes: "",
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        categoryCode: category.categoryCode,
        categoryName: category.categoryName,
        categoryNameLocal: category.categoryNameLocal || "",
        description: category.description || "",
        defaultUsefulLifeMonths: category.defaultUsefulLifeMonths,
        defaultDepreciationMethod: category.defaultDepreciationMethod,
        defaultSalvagePercent: category.defaultSalvagePercent,
        assetCodePrefix: category.assetCodePrefix || "",
        isActive: category.isActive,
        notes: category.notes || "",
      })
    }
  }, [category, form])

  const onSubmit = async (data: FormData) => {
    if (isEditing) {
      await updateCategory.mutateAsync({
        id,
        data: {
          categoryName: data.categoryName,
          categoryNameLocal: data.categoryNameLocal || undefined,
          description: data.description || undefined,
          defaultUsefulLifeMonths: data.defaultUsefulLifeMonths,
          defaultDepreciationMethod: data.defaultDepreciationMethod,
          defaultSalvagePercent: data.defaultSalvagePercent,
          assetCodePrefix: data.assetCodePrefix || undefined,
          isActive: data.isActive,
          notes: data.notes || undefined,
        },
      })
    } else {
      await createCategory.mutateAsync({
        categoryCode: data.categoryCode,
        categoryName: data.categoryName,
        categoryNameLocal: data.categoryNameLocal || undefined,
        description: data.description || undefined,
        defaultUsefulLifeMonths: data.defaultUsefulLifeMonths,
        defaultDepreciationMethod: data.defaultDepreciationMethod,
        defaultSalvagePercent: data.defaultSalvagePercent,
        assetCodePrefix: data.assetCodePrefix || undefined,
        notes: data.notes || undefined,
      })
    }
    navigate("/assets/categories")
  }

  const isSubmitting = createCategory.isPending || updateCategory.isPending

  if (isEditing && loadingCategory) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assets/categories")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Category" : "New Asset Category"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? `Editing ${category?.categoryCode}` : "Create a new asset category"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Category identification and description</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="categoryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Code *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isEditing} placeholder="e.g., FF" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Furniture & Fixtures" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryNameLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Name in local language" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetCodePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Code Prefix</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., FF" />
                    </FormControl>
                    <FormDescription>Prefix for auto-generated asset codes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description of the category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Depreciation Settings</CardTitle>
              <CardDescription>Default values applied to assets in this category</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="defaultUsefulLifeMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Useful Life (Months) *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} max={600} />
                    </FormControl>
                    <FormDescription>e.g., 60 months = 5 years</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultDepreciationMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depreciation Method *</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(depreciationMethodLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultSalvagePercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salvage Value % *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={0} max={100} step={0.1} />
                    </FormControl>
                    <FormDescription>Percentage of acquisition cost</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Inactive categories cannot be used for new assets
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes..." rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/assets/categories")}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? t("common.save") : t("common.create")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
