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
  useTaxProfile,
  useCreateTaxProfile,
  useUpdateTaxProfile,
} from "../hooks"
import {
  TaxType,
  TaxCalculationMethod,
  taxTypeLabels,
  taxCalculationMethodLabels,
} from "../types"

// Form validation schema
const taxProfileFormSchema = z.object({
  taxCode: z
    .string()
    .min(1, "Tax code is required")
    .max(20, "Tax code must be 20 characters or less")
    .regex(
      /^[A-Z0-9_-]+$/i,
      "Tax code must contain only letters, numbers, hyphens, and underscores"
    ),
  taxName: z
    .string()
    .min(1, "Tax name is required")
    .max(100, "Tax name must be 100 characters or less"),
  taxNameLocal: z.string().max(100).optional(),
  taxType: z.nativeEnum(TaxType),
  calculationMethod: z.nativeEnum(TaxCalculationMethod),
  taxRate: z
    .number()
    .min(0, "Tax rate must be 0 or greater")
    .max(100, "Tax rate must be 100 or less"),
  description: z.string().max(500).optional(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  taxPayableAccountId: z.string().optional(),
  taxReceivableAccountId: z.string().optional(),
  sortOrder: z.number().int().min(0),
})

type TaxProfileFormValues = z.infer<typeof taxProfileFormSchema>

export function TaxProfileFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const { data: taxProfile, isLoading: isLoadingTaxProfile } = useTaxProfile(id)
  const createTaxProfile = useCreateTaxProfile()
  const updateTaxProfile = useUpdateTaxProfile()

  const form = useForm<TaxProfileFormValues>({
    resolver: zodResolver(taxProfileFormSchema),
    defaultValues: {
      taxCode: "",
      taxName: "",
      taxNameLocal: "",
      taxType: TaxType.VAT,
      calculationMethod: TaxCalculationMethod.Percentage,
      taxRate: 0,
      description: "",
      isActive: true,
      isDefault: false,
      taxPayableAccountId: "",
      taxReceivableAccountId: "",
      sortOrder: 0,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (taxProfile && isEdit) {
      form.reset({
        taxCode: taxProfile.taxCode,
        taxName: taxProfile.taxName,
        taxNameLocal: taxProfile.taxNameLocal ?? "",
        taxType: taxProfile.taxType,
        calculationMethod: taxProfile.calculationMethod,
        taxRate: taxProfile.taxRate,
        description: taxProfile.description ?? "",
        isActive: taxProfile.isActive,
        isDefault: taxProfile.isDefault,
        taxPayableAccountId: taxProfile.taxPayableAccountId ?? "",
        taxReceivableAccountId: taxProfile.taxReceivableAccountId ?? "",
        sortOrder: taxProfile.sortOrder,
      })
    }
  }, [taxProfile, isEdit, form])

  const onSubmit = async (data: TaxProfileFormValues) => {
    try {
      if (isEdit && id) {
        await updateTaxProfile.mutateAsync({
          id,
          data: {
            taxName: data.taxName,
            taxNameLocal: data.taxNameLocal || undefined,
            taxType: data.taxType,
            calculationMethod: data.calculationMethod,
            taxRate: data.taxRate,
            description: data.description || undefined,
            isActive: data.isActive,
            isDefault: data.isDefault,
            taxPayableAccountId: data.taxPayableAccountId || undefined,
            taxReceivableAccountId: data.taxReceivableAccountId || undefined,
            sortOrder: data.sortOrder,
          },
        })
      } else {
        await createTaxProfile.mutateAsync({
          taxCode: data.taxCode,
          taxName: data.taxName,
          taxNameLocal: data.taxNameLocal || undefined,
          taxType: data.taxType,
          calculationMethod: data.calculationMethod,
          taxRate: data.taxRate,
          description: data.description || undefined,
          isDefault: data.isDefault,
          taxPayableAccountId: data.taxPayableAccountId || undefined,
          taxReceivableAccountId: data.taxReceivableAccountId || undefined,
          sortOrder: data.sortOrder,
        })
      }
      navigate("/configuration/tax-profiles")
    } catch {
      // Error handling is done in the mutation hooks
    }
  }

  const isSubmitting = createTaxProfile.isPending || updateTaxProfile.isPending

  if (isEdit && isLoadingTaxProfile) {
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
            {isEdit ? "Edit Tax Profile" : "New Tax Profile"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update tax profile information"
              : "Create a new tax profile for invoices and transactions"}
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
                Define the tax code, name, type, and rate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="taxCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., VAT7"
                          {...field}
                          disabled={isEdit}
                          className="uppercase"
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this tax profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Type *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(taxTypeLabels).map(([value, label]) => (
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
              </div>

              <FormField
                control={form.control}
                name="taxName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Value Added Tax 7%" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxNameLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tax name in local language"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional name in the local language
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="calculationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calculation Method *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(taxCalculationMethodLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="e.g., 7.00"
                            value={field.value}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            %
                          </span>
                        </div>
                      </FormControl>
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
                        placeholder="Optional description for this tax profile"
                        {...field}
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
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure display order and default settings
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

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Default Tax Profile</FormLabel>
                        <FormDescription>
                          Use this tax profile as the default for new transactions.
                          Setting this will clear the default from other profiles.
                        </FormDescription>
                      </div>
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
                            Inactive tax profiles will not appear in lookups
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Update Tax Profile" : "Create Tax Profile"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
