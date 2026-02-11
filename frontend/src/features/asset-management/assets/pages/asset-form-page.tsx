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

import { useAsset, useCreateAsset, useUpdateAsset } from "../hooks"
import { useAssetCategoryLookup } from "../../categories/hooks"
import { DepreciationMethod, AssetCondition, depreciationMethodLabels, assetConditionLabels } from "../types"

const formSchema = z.object({
  assetCode: z.string().min(1, "Asset code is required").max(50),
  assetName: z.string().min(1, "Asset name is required").max(200),
  assetNameLocal: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  serialNumber: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  assetCategoryId: z.string().min(1, "Category is required"),
  locationDescription: z.string().max(200).optional(),
  condition: z.nativeEnum(AssetCondition),
  acquisitionDate: z.string().min(1, "Acquisition date is required"),
  acquisitionCost: z.number().min(0.01, "Acquisition cost must be greater than 0"),
  currencyCode: z.string().min(1, "Currency is required").max(3),
  exchangeRate: z.number().min(0.0001),
  depreciationMethod: z.nativeEnum(DepreciationMethod),
  usefulLifeMonths: z.number().min(1).max(600),
  salvageValue: z.number().min(0),
  depreciationStartDate: z.string().min(1, "Depreciation start date is required"),
  notes: z.string().max(1000).optional(),
})

type FormData = z.infer<typeof formSchema>

export function AssetFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { data: asset, isLoading: loadingAsset } = useAsset(id)
  const { data: categories } = useAssetCategoryLookup()
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetCode: "",
      assetName: "",
      assetNameLocal: "",
      description: "",
      serialNumber: "",
      barcode: "",
      assetCategoryId: "",
      locationDescription: "",
      condition: AssetCondition.New,
      acquisitionDate: new Date().toISOString().split("T")[0],
      acquisitionCost: 0,
      currencyCode: "USD",
      exchangeRate: 1,
      depreciationMethod: DepreciationMethod.StraightLine,
      usefulLifeMonths: 60,
      salvageValue: 0,
      depreciationStartDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  })

  useEffect(() => {
    if (asset) {
      form.reset({
        assetCode: asset.assetCode,
        assetName: asset.assetName,
        assetNameLocal: asset.assetNameLocal || "",
        description: asset.description || "",
        serialNumber: asset.serialNumber || "",
        barcode: asset.barcode || "",
        assetCategoryId: asset.assetCategoryId,
        locationDescription: asset.locationDescription || "",
        condition: asset.condition,
        acquisitionDate: asset.acquisitionDate.split("T")[0],
        acquisitionCost: asset.acquisitionCost,
        currencyCode: asset.currencyCode,
        exchangeRate: asset.exchangeRate,
        depreciationMethod: asset.depreciationMethod,
        usefulLifeMonths: asset.usefulLifeMonths,
        salvageValue: asset.salvageValue,
        depreciationStartDate: asset.depreciationStartDate.split("T")[0],
        notes: asset.notes || "",
      })
    }
  }, [asset, form])

  // Update defaults when category is selected
  const selectedCategoryId = form.watch("assetCategoryId")
  useEffect(() => {
    if (!isEditing && selectedCategoryId && categories) {
      const category = categories.find((c) => c.id === selectedCategoryId)
      if (category) {
        form.setValue("depreciationMethod", category.defaultDepreciationMethod)
        form.setValue("usefulLifeMonths", category.defaultUsefulLifeMonths)
        const acquisitionCost = form.getValues("acquisitionCost")
        if (acquisitionCost > 0) {
          form.setValue("salvageValue", acquisitionCost * category.defaultSalvagePercent / 100)
        }
      }
    }
  }, [selectedCategoryId, categories, isEditing, form])

  const onSubmit = async (data: FormData) => {
    if (isEditing) {
      await updateAsset.mutateAsync({
        id,
        data: {
          assetName: data.assetName,
          assetNameLocal: data.assetNameLocal || undefined,
          description: data.description || undefined,
          serialNumber: data.serialNumber || undefined,
          barcode: data.barcode || undefined,
          assetCategoryId: data.assetCategoryId,
          locationDescription: data.locationDescription || undefined,
          condition: data.condition,
          depreciationMethod: data.depreciationMethod,
          usefulLifeMonths: data.usefulLifeMonths,
          salvageValue: data.salvageValue,
          notes: data.notes || undefined,
        },
      })
    } else {
      await createAsset.mutateAsync({
        assetCode: data.assetCode,
        assetName: data.assetName,
        assetNameLocal: data.assetNameLocal || undefined,
        description: data.description || undefined,
        serialNumber: data.serialNumber || undefined,
        barcode: data.barcode || undefined,
        assetCategoryId: data.assetCategoryId,
        locationDescription: data.locationDescription || undefined,
        condition: data.condition,
        acquisitionDate: data.acquisitionDate,
        acquisitionCost: data.acquisitionCost,
        currencyCode: data.currencyCode,
        exchangeRate: data.exchangeRate,
        depreciationMethod: data.depreciationMethod,
        usefulLifeMonths: data.usefulLifeMonths,
        salvageValue: data.salvageValue,
        depreciationStartDate: data.depreciationStartDate,
        notes: data.notes || undefined,
      })
    }
    navigate("/assets/list")
  }

  const isSubmitting = createAsset.isPending || updateAsset.isPending

  if (isEditing && loadingAsset) {
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/assets/list")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Asset" : "New Asset"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? `Editing ${asset?.assetCode}` : "Create a new fixed asset"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Asset identification and classification</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="assetCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Code *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isEditing} placeholder="e.g., FF00001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.categoryCode} - {category.categoryName}
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
                name="assetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Office Desk - Executive" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition *</FormLabel>
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
                        {Object.entries(assetConditionLabels).map(([value, label]) => (
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
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., SN-12345" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 1234567890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locationDescription"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Building A, Floor 2, Room 201" />
                    </FormControl>
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
                      <Textarea {...field} placeholder="Description of the asset" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Acquisition Details</CardTitle>
                <CardDescription>Purchase information and cost</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="acquisitionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acquisition Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acquisitionCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acquisition Cost *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currencyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={3} placeholder="USD" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Depreciation Settings</CardTitle>
              <CardDescription>Configure how this asset will be depreciated</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="depreciationMethod"
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
                name="usefulLifeMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Useful Life (Months) *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} max={600} />
                    </FormControl>
                    <FormDescription>
                      {Math.floor(field.value / 12)} years {field.value % 12} months
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salvageValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salvage Value *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min={0} />
                    </FormControl>
                    <FormDescription>Value at end of useful life</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditing && (
                <FormField
                  control={form.control}
                  name="depreciationStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depreciation Start Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

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
            <Button type="button" variant="outline" onClick={() => navigate("/assets/list")}>
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
