import { useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Plus, Trash2, ArrowLeft, Save, Send, Loader2, Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

import {
  useApInvoice,
  useCreateApInvoice,
  useUpdateApInvoice,
  useSubmitInvoiceForApproval,
  useCalculateTax,
} from "../hooks"
import { ApInvoiceStatus } from "../types"
import { useVendorLookup } from "../../vendors/hooks"
import { useAccountLookup } from "@/features/general-ledger/accounts/hooks"
import { useTaxProfiles } from "@/features/configuration/tax-profiles/hooks"
import { TaxType } from "@/features/configuration/tax-profiles/types"
import { formatCurrency } from "@/lib/utils"

// Line item schema
const lineSchema = z.object({
  id: z.string().optional(),
  accountId: z.string().min(1, "Account is required"),
  departmentId: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().min(0.0001, "Quantity must be > 0"),
  unitPrice: z.number().min(0, "Unit price must be >= 0"),
  tax1ProfileId: z.string().optional(),
})

// Form schema
const formSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  vendorInvoiceNumber: z.string().optional(),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currencyCode: z.string().min(1, "Currency is required"),
  exchangeRate: z.number().min(0.0001, "Exchange rate must be > 0"),
  discountAmount: z.number().min(0, "Discount must be >= 0"),
  tax1ProfileId: z.string().optional(),
  tax2ProfileId: z.string().optional(),
  whtProfileId: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
  fiscalPeriodId: z.string().min(1, "Fiscal period is required"),
  lines: z.array(lineSchema).min(1, "At least 1 line is required"),
})

type FormValues = z.infer<typeof formSchema>

export function ApInvoiceFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  // Queries
  const { data: invoice, isLoading: isLoadingInvoice } = useApInvoice(id)
  const { data: vendors, isLoading: isLoadingVendors } = useVendorLookup()
  const { data: accounts, isLoading: isLoadingAccounts } = useAccountLookup(undefined, true)
  const { data: taxProfiles } = useTaxProfiles()

  // Mutations
  const createInvoice = useCreateApInvoice()
  const updateInvoice = useUpdateApInvoice()
  const submitForApproval = useSubmitInvoiceForApproval()
  const calculateTax = useCalculateTax()

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: "",
      vendorInvoiceNumber: "",
      invoiceDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(), "yyyy-MM-dd"),
      currencyCode: "USD",
      exchangeRate: 1,
      discountAmount: 0,
      tax1ProfileId: "",
      tax2ProfileId: "",
      whtProfileId: "",
      description: "",
      reference: "",
      fiscalPeriodId: "default", // TODO: Get from fiscal period service
      lines: [
        { accountId: "", quantity: 1, unitPrice: 0, description: "" },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  // Populate form when editing
  useEffect(() => {
    if (isEdit && invoice) {
      form.reset({
        vendorId: invoice.vendorId,
        vendorInvoiceNumber: invoice.vendorInvoiceNumber || "",
        invoiceDate: format(new Date(invoice.invoiceDate), "yyyy-MM-dd"),
        dueDate: format(new Date(invoice.dueDate), "yyyy-MM-dd"),
        currencyCode: invoice.currencyCode,
        exchangeRate: invoice.exchangeRate,
        discountAmount: invoice.discountAmount,
        tax1ProfileId: invoice.tax1ProfileId || "",
        tax2ProfileId: invoice.tax2ProfileId || "",
        whtProfileId: invoice.whtProfileId || "",
        description: invoice.description || "",
        reference: invoice.reference || "",
        fiscalPeriodId: invoice.fiscalPeriodId,
        lines: invoice.lines.map((line) => ({
          id: line.id,
          accountId: line.accountId,
          departmentId: line.departmentId || "",
          description: line.description || "",
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          tax1ProfileId: line.tax1ProfileId || "",
        })),
      })
    }
  }, [isEdit, invoice, form])

  // Calculate totals
  const watchedLines = form.watch("lines")
  const watchedDiscount = form.watch("discountAmount")
  const watchedTax1ProfileId = form.watch("tax1ProfileId")
  const watchedTax2ProfileId = form.watch("tax2ProfileId")
  const watchedWhtProfileId = form.watch("whtProfileId")
  const watchedVendorId = form.watch("vendorId")
  const currencyCode = form.watch("currencyCode")

  const totals = useMemo(() => {
    const lineAmounts = watchedLines.map(line => ({
      amount: (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0),
      tax1ProfileId: line.tax1ProfileId,
    }))
    const subTotal = lineAmounts.reduce((sum, l) => sum + l.amount, 0)
    const discount = Number(watchedDiscount) || 0
    const taxableAmount = subTotal - discount

    // Get tax rates from profiles
    const tax1Profile = taxProfiles?.items.find(p => p.id === watchedTax1ProfileId)
    const tax2Profile = taxProfiles?.items.find(p => p.id === watchedTax2ProfileId)
    const whtProfile = taxProfiles?.items.find(p => p.id === watchedWhtProfileId)

    const tax1Rate = tax1Profile?.taxRate || 0
    const tax2Rate = tax2Profile?.taxRate || 0
    const whtRate = whtProfile?.taxRate || 0

    const tax1Amount = taxableAmount * (tax1Rate / 100)
    const tax2Amount = taxableAmount * (tax2Rate / 100)
    const totalAmount = taxableAmount + tax1Amount + tax2Amount
    const whtAmount = totalAmount * (whtRate / 100)
    const netAmount = totalAmount - whtAmount

    return {
      subTotal,
      discount,
      taxableAmount,
      tax1Amount,
      tax2Amount,
      totalAmount,
      whtAmount,
      netAmount,
    }
  }, [watchedLines, watchedDiscount, watchedTax1ProfileId, watchedTax2ProfileId, watchedWhtProfileId, taxProfiles])

  // Handlers
  const handleAddLine = () => {
    append({ accountId: "", quantity: 1, unitPrice: 0, description: "" })
  }

  const handleRemoveLine = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const handleCalculateTax = async () => {
    const vendorId = form.getValues("vendorId")
    if (!vendorId) return

    const lines = form.getValues("lines").map(line => ({
      amount: (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0),
      tax1ProfileId: line.tax1ProfileId,
    }))

    await calculateTax.mutateAsync({
      vendorId,
      subTotal: totals.subTotal,
      discountAmount: totals.discount,
      tax1ProfileId: form.getValues("tax1ProfileId") === "none" ? undefined : form.getValues("tax1ProfileId") || undefined,
      tax2ProfileId: form.getValues("tax2ProfileId") === "none" ? undefined : form.getValues("tax2ProfileId") || undefined,
      whtProfileId: form.getValues("whtProfileId") === "none" ? undefined : form.getValues("whtProfileId") || undefined,
      lines,
    })
  }

  const onSubmit = async (data: FormValues, shouldSubmitForApproval: boolean = false) => {
    try {
      if (isEdit) {
        const updated = await updateInvoice.mutateAsync({
          id,
          data: {
            vendorInvoiceNumber: data.vendorInvoiceNumber || undefined,
            invoiceDate: data.invoiceDate,
            dueDate: data.dueDate,
            currencyCode: data.currencyCode,
            exchangeRate: data.exchangeRate,
            discountAmount: data.discountAmount,
            tax1ProfileId: data.tax1ProfileId === "none" ? undefined : data.tax1ProfileId || undefined,
            tax2ProfileId: data.tax2ProfileId === "none" ? undefined : data.tax2ProfileId || undefined,
            whtProfileId: data.whtProfileId === "none" ? undefined : data.whtProfileId || undefined,
            description: data.description || undefined,
            reference: data.reference || undefined,
            fiscalPeriodId: data.fiscalPeriodId,
            lines: data.lines.map((line) => ({
              id: line.id,
              accountId: line.accountId,
              departmentId: line.departmentId || undefined,
              description: line.description || undefined,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              tax1ProfileId: line.tax1ProfileId === "none" ? undefined : line.tax1ProfileId || undefined,
            })),
          },
        })

        if (shouldSubmitForApproval) {
          await submitForApproval.mutateAsync({ id: updated.id, data: {} })
        }
      } else {
        const created = await createInvoice.mutateAsync({
          vendorId: data.vendorId,
          vendorInvoiceNumber: data.vendorInvoiceNumber || undefined,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          currencyCode: data.currencyCode,
          exchangeRate: data.exchangeRate,
          discountAmount: data.discountAmount,
          tax1ProfileId: data.tax1ProfileId === "none" ? undefined : data.tax1ProfileId || undefined,
          tax2ProfileId: data.tax2ProfileId === "none" ? undefined : data.tax2ProfileId || undefined,
          whtProfileId: data.whtProfileId === "none" ? undefined : data.whtProfileId || undefined,
          description: data.description || undefined,
          reference: data.reference || undefined,
          fiscalPeriodId: data.fiscalPeriodId,
          lines: data.lines.map((line) => ({
            accountId: line.accountId,
            departmentId: line.departmentId || undefined,
            description: line.description || undefined,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            tax1ProfileId: line.tax1ProfileId === "none" ? undefined : line.tax1ProfileId || undefined,
          })),
        })

        if (shouldSubmitForApproval) {
          await submitForApproval.mutateAsync({ id: created.id, data: {} })
        }
      }

      navigate("/ap/invoices")
    } catch {
      // Error is handled by mutation hooks
    }
  }

  const handleSave = form.handleSubmit((data) => onSubmit(data, false))
  const handleSaveAndSubmit = form.handleSubmit((data) => onSubmit(data, true))

  const isSubmitting = createInvoice.isPending || updateInvoice.isPending || submitForApproval.isPending

  // Check if invoice can be edited
  const canEdit = !isEdit || invoice?.status === ApInvoiceStatus.Draft

  if (isEdit && isLoadingInvoice) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-150" />
      </div>
    )
  }

  if (isEdit && invoice && !canEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t("ap.invoices.form.cannotEdit")}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {t("ap.invoices.form.cannotEditDesc")}
            </p>
            <Button className="mt-4" onClick={() => navigate("/ap/invoices")}>
              {t("common.backToList")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter tax profiles by type
  const vatProfiles = taxProfiles?.items.filter(p => p.taxType === TaxType.VAT || p.taxType === TaxType.GST || p.taxType === TaxType.SalesTax) || []
  const serviceProfiles = taxProfiles?.items.filter(p => p.taxType === TaxType.ServiceTax) || []
  const whtProfiles = taxProfiles?.items.filter(p => p.taxType === TaxType.WithholdingTax) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? t("ap.invoices.form.editTitle") : t("ap.invoices.form.newTitle")}
          </h1>
          {isEdit && invoice && (
            <p className="text-muted-foreground">
              {t("ap.invoices.form.invoice")}: <span className="font-mono">{invoice.invoiceNumber}</span>
            </p>
          )}
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Header Fields */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ap.invoices.form.invoiceDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.invoices.form.vendor")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isEdit || isLoadingVendors}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("ap.invoices.form.selectVendor")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors?.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              <span className="font-mono">{vendor.vendorCode}</span>
                              <span className="ml-2 text-muted-foreground">{vendor.vendorName}</span>
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
                  name="vendorInvoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.invoices.form.vendorInvoiceNumber")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("ap.invoices.form.vendorInvoicePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.invoices.form.reference")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("ap.invoices.form.referencePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.invoices.form.invoiceDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.invoices.form.dueDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel>{t("ap.invoices.form.currency")}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="THB">THB</SelectItem>
                          <SelectItem value="VND">VND</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exchangeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ap.invoices.form.exchangeRate")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          value={field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("common.description")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("ap.invoices.form.descriptionPlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{t("ap.invoices.form.lineItems")}</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                <Plus className="mr-2 size-4" />
                {t("ap.invoices.form.addLine")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="min-w-50">{t("ap.invoices.form.account")}</TableHead>
                      <TableHead className="w-25">{t("ap.invoices.form.quantity")}</TableHead>
                      <TableHead className="w-32">{t("ap.invoices.form.unitPrice")}</TableHead>
                      <TableHead className="w-32">{t("ap.invoices.form.amount")}</TableHead>
                      <TableHead>{t("common.description")}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const quantity = form.watch(`lines.${index}.quantity`) || 0
                      const unitPrice = form.watch(`lines.${index}.unitPrice`) || 0
                      const lineAmount = quantity * unitPrice

                      return (
                        <TableRow key={field.id}>
                          <TableCell className="text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lines.${index}.accountId`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isLoadingAccounts}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t("ap.invoices.form.selectAccount")} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {accounts?.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                          <span className="font-mono">{account.accountCode}</span>
                                          <span className="ml-2 text-muted-foreground">
                                            {account.accountName}
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lines.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.0001"
                                      min="0.0001"
                                      className="text-right font-mono"
                                      value={field.value}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lines.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="text-right font-mono"
                                      value={field.value}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(lineAmount, currencyCode)}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lines.${index}.description`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input placeholder={t("ap.invoices.form.lineDescriptionPlaceholder")} {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveLine(index)}
                              disabled={fields.length <= 1}
                            >
                              <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-semibold">
                        {t("ap.invoices.form.subTotal")}:
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(totals.subTotal, currencyCode)}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
              {form.formState.errors.lines?.message && (
                <p className="mt-2 text-sm text-destructive">
                  {form.formState.errors.lines.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tax and Totals */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{t("ap.invoices.form.taxesAndTotals")}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCalculateTax}
                disabled={calculateTax.isPending || !watchedVendorId}
              >
                <Calculator className="mr-2 size-4" />
                {t("ap.invoices.form.calculateTax")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Tax Profiles */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="discountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("ap.invoices.form.discount")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="text-right font-mono"
                            value={field.value}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax1ProfileId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("ap.invoices.form.vat")}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("ap.invoices.form.selectTaxProfile")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t("ap.invoices.form.noTax")}</SelectItem>
                            {vatProfiles.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {profile.taxName} ({profile.taxRate}%)
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
                    name="tax2ProfileId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("ap.invoices.form.serviceTax")}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("ap.invoices.form.selectTaxProfile")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t("ap.invoices.form.noTax")}</SelectItem>
                            {serviceProfiles.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {profile.taxName} ({profile.taxRate}%)
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
                    name="whtProfileId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("ap.invoices.form.wht")}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("ap.invoices.form.selectTaxProfile")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t("ap.invoices.form.noTax")}</SelectItem>
                            {whtProfiles.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {profile.taxName} ({profile.taxRate}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Totals Summary */}
                <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("ap.invoices.form.subTotal")}</span>
                    <span className="font-mono">{formatCurrency(totals.subTotal, currencyCode)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("ap.invoices.form.discount")}</span>
                      <span className="font-mono text-destructive">-{formatCurrency(totals.discount, currencyCode)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("ap.invoices.form.taxableAmount")}</span>
                    <span className="font-mono">{formatCurrency(totals.taxableAmount, currencyCode)}</span>
                  </div>
                  <Separator />
                  {totals.tax1Amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("ap.invoices.form.vat")}</span>
                      <span className="font-mono">{formatCurrency(totals.tax1Amount, currencyCode)}</span>
                    </div>
                  )}
                  {totals.tax2Amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("ap.invoices.form.serviceTax")}</span>
                      <span className="font-mono">{formatCurrency(totals.tax2Amount, currencyCode)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>{t("ap.invoices.form.totalAmount")}</span>
                    <span className="font-mono">{formatCurrency(totals.totalAmount, currencyCode)}</span>
                  </div>
                  {totals.whtAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("ap.invoices.form.wht")}</span>
                      <span className="font-mono text-destructive">-{formatCurrency(totals.whtAmount, currencyCode)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("ap.invoices.form.netAmount")}</span>
                    <span className="font-mono text-primary">{formatCurrency(totals.netAmount, currencyCode)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/ap/invoices")}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              {t("ap.invoices.form.saveAsDraft")}
            </Button>
            <Button
              type="button"
              onClick={handleSaveAndSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              {t("ap.invoices.form.saveAndSubmit")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
