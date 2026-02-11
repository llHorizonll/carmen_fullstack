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
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
} from "../hooks"

// Form validation schema
const customerFormSchema = z.object({
  customerCode: z
    .string()
    .min(1, "Customer code is required")
    .max(50, "Customer code must be 50 characters or less"),
  customerName: z
    .string()
    .min(1, "Customer name is required")
    .max(200, "Customer name must be 200 characters or less"),
  customerNameLocal: z.string().optional(),
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

type CustomerFormValues = z.infer<typeof customerFormSchema>

export function CustomerFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const { data: customer, isLoading: isLoadingCustomer } = useCustomer(id)
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerCode: "",
      customerName: "",
      customerNameLocal: "",
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
    if (customer && isEdit) {
      form.reset({
        customerCode: customer.customerCode,
        customerName: customer.customerName,
        customerNameLocal: customer.customerNameLocal ?? "",
        taxId: customer.taxId ?? "",
        contactPerson: customer.contactPerson ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        fax: customer.fax ?? "",
        address: customer.address ?? "",
        city: customer.city ?? "",
        state: customer.state ?? "",
        postalCode: customer.postalCode ?? "",
        country: customer.country ?? "",
        currencyCode: customer.currencyCode,
        creditLimit: customer.creditLimit,
        bankName: customer.bankName ?? "",
        bankAccountNumber: customer.bankAccountNumber ?? "",
        bankBranch: customer.bankBranch ?? "",
        notes: customer.notes ?? "",
        isActive: customer.isActive,
      })
    }
  }, [customer, isEdit, form])

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (isEdit && id) {
        await updateCustomer.mutateAsync({
          id,
          data: {
            customerName: data.customerName,
            customerNameLocal: data.customerNameLocal || undefined,
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
        await createCustomer.mutateAsync({
          customerCode: data.customerCode,
          customerName: data.customerName,
          customerNameLocal: data.customerNameLocal || undefined,
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
      navigate("/ar/customers")
    } catch {
      // Error handling is done in the mutation hooks
    }
  }

  const isSubmitting = createCustomer.isPending || updateCustomer.isPending

  if (isEdit && isLoadingCustomer) {
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
            {isEdit ? t("ar.customers.editCustomer") : t("ar.customers.newCustomer")}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? t("ar.customers.editSubtitle")
              : t("ar.customers.newSubtitle")}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ar.customers.form.basicInfo")}</CardTitle>
              <CardDescription>{t("ar.customers.form.basicInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.customers.form.customerCode")} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("ar.customers.form.customerCodePlaceholder")}
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
                      <FormLabel>{t("ar.customers.form.taxId")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("ar.customers.form.taxIdPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ar.customers.form.customerName")} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t("ar.customers.form.customerNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerNameLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ar.customers.form.localName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("ar.customers.form.localNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormDescription>{t("ar.customers.form.localNameDesc")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ar.customers.form.contactInfo")}</CardTitle>
              <CardDescription>{t("ar.customers.form.contactInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.customers.form.contactPerson")}</FormLabel>
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
                      <FormLabel>{t("ar.customers.form.email")}</FormLabel>
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
                      <FormLabel>{t("ar.customers.form.phone")}</FormLabel>
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
                      <FormLabel>{t("ar.customers.form.fax")}</FormLabel>
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
                    <FormLabel>{t("ar.customers.form.address")}</FormLabel>
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
                      <FormLabel>{t("ar.customers.form.city")}</FormLabel>
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
                      <FormLabel>{t("ar.customers.form.state")}</FormLabel>
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
                      <FormLabel>{t("ar.customers.form.postalCode")}</FormLabel>
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
                      <FormLabel>{t("ar.customers.form.country")}</FormLabel>
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
              <CardTitle>{t("ar.customers.form.financialInfo")}</CardTitle>
              <CardDescription>{t("ar.customers.form.financialInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="currencyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.customers.form.currency")} *</FormLabel>
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
                      <FormLabel>{t("ar.customers.form.creditLimit")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>{t("ar.customers.form.creditLimitDesc")}</FormDescription>
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
              <CardTitle>{t("ar.customers.form.bankInfo")}</CardTitle>
              <CardDescription>{t("ar.customers.form.bankInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.customers.form.bankName")}</FormLabel>
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
                      <FormLabel>{t("ar.customers.form.bankAccountNumber")}</FormLabel>
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
                      <FormLabel>{t("ar.customers.form.bankBranch")}</FormLabel>
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
              <CardTitle>{t("ar.customers.form.additionalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ar.customers.form.notes")}</FormLabel>
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
                        <FormDescription>{t("ar.customers.form.activeDesc")}</FormDescription>
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
              {isEdit ? t("ar.customers.form.updateCustomer") : t("ar.customers.form.createCustomer")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
