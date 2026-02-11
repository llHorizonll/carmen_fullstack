import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
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
  useVendor,
  useCreateVendor,
  useUpdateVendor,
} from "../hooks"

// Form validation schema
const vendorFormSchema = z.object({
  vendorCode: z
    .string()
    .min(1, "Vendor code is required")
    .max(50, "Vendor code must be 50 characters or less"),
  vendorName: z
    .string()
    .min(1, "Vendor name is required")
    .max(200, "Vendor name must be 200 characters or less"),
  vendorNameLocal: z.string().optional(),
  taxId: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  fax: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  currencyCode: z.string().min(1, "Currency is required"),
  creditLimit: z.number().min(0, "Credit limit must be non-negative"),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankBranch: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
})

type VendorFormValues = z.infer<typeof vendorFormSchema>

export function VendorFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const { data: vendor, isLoading: isLoadingVendor } = useVendor(id)
  const createVendor = useCreateVendor()
  const updateVendor = useUpdateVendor()

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      vendorCode: "",
      vendorName: "",
      vendorNameLocal: "",
      taxId: "",
      contactPerson: "",
      email: "",
      phone: "",
      fax: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      currencyCode: "USD",
      creditLimit: 0,
      bankName: "",
      bankAccountNumber: "",
      bankBranch: "",
      notes: "",
      isActive: true,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (vendor && isEdit) {
      form.reset({
        vendorCode: vendor.vendorCode,
        vendorName: vendor.vendorName,
        vendorNameLocal: vendor.vendorNameLocal ?? "",
        taxId: vendor.taxId ?? "",
        contactPerson: vendor.contactPerson ?? "",
        email: vendor.email ?? "",
        phone: vendor.phone ?? "",
        fax: vendor.fax ?? "",
        address: vendor.address ?? "",
        city: vendor.city ?? "",
        state: vendor.state ?? "",
        postalCode: vendor.postalCode ?? "",
        country: vendor.country ?? "",
        currencyCode: vendor.currencyCode,
        creditLimit: vendor.creditLimit,
        bankName: vendor.bankName ?? "",
        bankAccountNumber: vendor.bankAccountNumber ?? "",
        bankBranch: vendor.bankBranch ?? "",
        notes: vendor.notes ?? "",
        isActive: vendor.isActive,
      })
    }
  }, [vendor, isEdit, form])

  const onSubmit = async (data: VendorFormValues) => {
    try {
      if (isEdit && id) {
        await updateVendor.mutateAsync({
          id,
          data: {
            vendorName: data.vendorName,
            vendorNameLocal: data.vendorNameLocal || undefined,
            taxId: data.taxId || undefined,
            contactPerson: data.contactPerson || undefined,
            email: data.email || undefined,
            phone: data.phone || undefined,
            fax: data.fax || undefined,
            address: data.address || undefined,
            city: data.city || undefined,
            state: data.state || undefined,
            postalCode: data.postalCode || undefined,
            country: data.country || undefined,
            currencyCode: data.currencyCode,
            creditLimit: data.creditLimit,
            bankName: data.bankName || undefined,
            bankAccountNumber: data.bankAccountNumber || undefined,
            bankBranch: data.bankBranch || undefined,
            notes: data.notes || undefined,
            isActive: data.isActive,
          },
        })
      } else {
        await createVendor.mutateAsync({
          vendorCode: data.vendorCode,
          vendorName: data.vendorName,
          vendorNameLocal: data.vendorNameLocal || undefined,
          taxId: data.taxId || undefined,
          contactPerson: data.contactPerson || undefined,
          email: data.email || undefined,
          phone: data.phone || undefined,
          fax: data.fax || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          postalCode: data.postalCode || undefined,
          country: data.country || undefined,
          currencyCode: data.currencyCode,
          creditLimit: data.creditLimit,
          bankName: data.bankName || undefined,
          bankAccountNumber: data.bankAccountNumber || undefined,
          bankBranch: data.bankBranch || undefined,
          notes: data.notes || undefined,
          isActive: true,
        })
      }
      navigate("/ap/vendors")
    } catch {
      // Error handling is done in the mutation hooks
    }
  }

  const isSubmitting = createVendor.isPending || updateVendor.isPending

  if (isEdit && isLoadingVendor) {
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
            {isEdit ? t("ap.vendors.editVendor") : t("ap.vendors.newVendor")}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? t("ap.vendors.editSubtitle")
              : t("ap.vendors.newSubtitle")}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ap.vendors.form.basicInfo")}</CardTitle>
              <CardDescription>{t("ap.vendors.form.basicInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vendorCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.vendorCode")} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("ap.vendors.form.vendorCodePlaceholder")}
                          {...field}
                          disabled={isEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.taxId")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("ap.vendors.form.taxIdPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ap.vendors.form.vendorName")} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t("ap.vendors.form.vendorNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendorNameLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ap.vendors.form.localName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("ap.vendors.form.localNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormDescription>{t("ap.vendors.form.localNameDesc")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ap.vendors.form.contactInfo")}</CardTitle>
              <CardDescription>{t("ap.vendors.form.contactInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.contactPerson")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.email")}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.phone")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.fax")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ap.vendors.form.address")}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.city")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.state")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.postalCode")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.country")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ap.vendors.form.financialInfo")}</CardTitle>
              <CardDescription>{t("ap.vendors.form.financialInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="currencyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.currency")} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="THB">THB - Thai Baht</SelectItem>
                          <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.creditLimit")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>{t("ap.vendors.form.creditLimitDesc")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ap.vendors.form.bankInfo")}</CardTitle>
              <CardDescription>{t("ap.vendors.form.bankInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.bankName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.bankAccountNumber")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankBranch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.vendors.form.bankBranch")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes & Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ap.vendors.form.additionalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ap.vendors.form.notes")}</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
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
                        <FormLabel>{t("common.active")}</FormLabel>
                        <FormDescription>{t("ap.vendors.form.activeDesc")}</FormDescription>
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
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? t("ap.vendors.form.updateVendor") : t("ap.vendors.form.createVendor")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
