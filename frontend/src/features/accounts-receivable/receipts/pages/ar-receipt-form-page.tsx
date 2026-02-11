import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Trash2, ArrowLeft, Save, Loader2, Wand2 } from "lucide-react"

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
import { Checkbox } from "@/components/ui/checkbox"

import {
  useArReceipt,
  useCreateArReceipt,
  useUpdateArReceipt,
  useArAutoAllocate,
} from "../hooks"
import {
  ArReceiptStatus,
  ReceiptMethod,
  receiptMethodLabels,
} from "../types"
import { useCustomerLookup } from "../../customers/hooks"
import { useUnpaidArInvoices } from "../../invoices/hooks"
import { useAccountLookup } from "@/features/general-ledger/accounts/hooks"
import { formatCurrency } from "@/lib/utils"
import type { UnpaidArInvoiceDto } from "../../invoices/types"

// Line item schema
const lineSchema = z.object({
  id: z.string().optional(),
  arInvoiceId: z.string().min(1, "Invoice is required"),
  invoiceNumber: z.string().optional(),
  dueDate: z.string().optional(),
  invoiceBalance: z.number().optional(),
  amountAllocated: z.number().min(0, "Amount must be >= 0"),
  discountAmount: z.number().min(0, "Discount must be >= 0"),
  whtAmount: z.number().min(0, "WHT must be >= 0"),
  notes: z.string().optional(),
})

// Form schema
const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  receiptDate: z.string().min(1, "Receipt date is required"),
  receiptMethod: z.number().min(1, "Receipt method is required"),
  checkNumber: z.string().optional(),
  checkDate: z.string().optional(),
  bankReference: z.string().optional(),
  currencyCode: z.string().min(1, "Currency is required"),
  exchangeRate: z.number().min(0.0001, "Exchange rate must be > 0"),
  totalAmount: z.number().min(0.01, "Total amount must be > 0"),
  bankAccountId: z.string().min(1, "Bank account is required"),
  description: z.string().optional(),
  reference: z.string().optional(),
  payerName: z.string().optional(),
  fiscalPeriodId: z.string().min(1, "Fiscal period is required"),
  lines: z.array(lineSchema),
})

type FormValues = z.infer<typeof formSchema>

export function ArReceiptFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())

  // Queries
  const { data: receipt, isLoading: isLoadingReceipt } = useArReceipt(id)
  const { data: customers, isLoading: isLoadingCustomers } = useCustomerLookup()
  const { data: bankAccounts, isLoading: isLoadingBankAccounts } = useAccountLookup(undefined, true)

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      receiptDate: format(new Date(), "yyyy-MM-dd"),
      receiptMethod: ReceiptMethod.BankTransfer,
      checkNumber: "",
      checkDate: "",
      bankReference: "",
      currencyCode: "USD",
      exchangeRate: 1,
      totalAmount: 0,
      bankAccountId: "",
      description: "",
      reference: "",
      payerName: "",
      fiscalPeriodId: "default", // TODO: Get from fiscal period service
      lines: [],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const watchedCustomerId = form.watch("customerId")
  const watchedReceiptMethod = form.watch("receiptMethod")
  const watchedLines = form.watch("lines")
  const currencyCode = form.watch("currencyCode")

  // Get unpaid invoices for selected customer
  const { data: unpaidInvoices } = useUnpaidArInvoices(watchedCustomerId)

  // Mutations
  const createReceipt = useCreateArReceipt()
  const updateReceipt = useUpdateArReceipt()
  const autoAllocate = useArAutoAllocate()

  // Populate form when editing
  useEffect(() => {
    if (isEdit && receipt) {
      form.reset({
        customerId: receipt.customerId,
        receiptDate: format(new Date(receipt.receiptDate), "yyyy-MM-dd"),
        receiptMethod: receipt.receiptMethod,
        checkNumber: receipt.checkNumber || "",
        checkDate: receipt.checkDate ? format(new Date(receipt.checkDate), "yyyy-MM-dd") : "",
        bankReference: receipt.bankReference || "",
        currencyCode: receipt.currencyCode,
        exchangeRate: receipt.exchangeRate,
        totalAmount: receipt.totalAmount,
        bankAccountId: receipt.bankAccountId,
        description: receipt.description || "",
        reference: receipt.reference || "",
        payerName: receipt.payerName || "",
        fiscalPeriodId: receipt.fiscalPeriodId,
        lines: receipt.lines.map((line) => ({
          id: line.id,
          arInvoiceId: line.arInvoiceId,
          invoiceNumber: line.invoiceNumber,
          dueDate: line.dueDate,
          invoiceBalance: line.invoiceBalanceBefore,
          amountAllocated: line.amountAllocated,
          discountAmount: line.discountAmount,
          whtAmount: line.whtAmount,
          notes: line.notes || "",
        })),
      })
      // Set selected invoices
      const invoiceIds = new Set(receipt.lines.map(l => l.arInvoiceId))
      setSelectedInvoices(invoiceIds)
    }
  }, [isEdit, receipt, form])

  // Calculate totals
  const totals = useMemo(() => {
    const totalAllocated = watchedLines.reduce((sum, line) => sum + (Number(line.amountAllocated) || 0), 0)
    const totalDiscount = watchedLines.reduce((sum, line) => sum + (Number(line.discountAmount) || 0), 0)
    const totalWht = watchedLines.reduce((sum, line) => sum + (Number(line.whtAmount) || 0), 0)
    const receiptTotal = form.watch("totalAmount") || 0
    const unallocated = receiptTotal - totalAllocated

    return {
      totalAllocated,
      totalDiscount,
      totalWht,
      receiptTotal,
      unallocated,
    }
  }, [watchedLines, form])

  // Handle customer change - clear lines
  const handleCustomerChange = (customerId: string) => {
    form.setValue("customerId", customerId)
    replace([])
    setSelectedInvoices(new Set())

    // Set received from name from customer
    const customer = customers?.find(c => c.id === customerId)
    if (customer) {
      form.setValue("payerName", customer.customerName)
    }
  }

  // Handle invoice selection
  const handleInvoiceToggle = (invoice: UnpaidArInvoiceDto, checked: boolean) => {
    const newSelected = new Set(selectedInvoices)
    if (checked) {
      newSelected.add(invoice.id)
      // Add line for this invoice
      append({
        arInvoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate,
        invoiceBalance: invoice.balanceAmount,
        amountAllocated: 0,
        discountAmount: 0,
        whtAmount: 0,
        notes: "",
      })
    } else {
      newSelected.delete(invoice.id)
      // Remove line for this invoice
      const lineIndex = fields.findIndex(f => f.arInvoiceId === invoice.id)
      if (lineIndex !== -1) {
        remove(lineIndex)
      }
    }
    setSelectedInvoices(newSelected)
  }

  // Auto-allocate FIFO
  const handleAutoAllocate = async () => {
    const customerId = form.getValues("customerId")
    const totalAmount = form.getValues("totalAmount")
    const currency = form.getValues("currencyCode")

    if (!customerId || !totalAmount) return

    const result = await autoAllocate.mutateAsync({
      customerId,
      totalAmount,
      currencyCode: currency,
    })

    // Update lines with suggested allocations
    const newLines = result.allocations.map(alloc => ({
      arInvoiceId: alloc.invoiceId,
      invoiceNumber: alloc.invoiceNumber,
      dueDate: alloc.dueDate,
      invoiceBalance: alloc.invoiceBalance,
      amountAllocated: alloc.suggestedAmount,
      discountAmount: 0,
      whtAmount: alloc.whtAmount,
      notes: "",
    }))

    replace(newLines)
    setSelectedInvoices(new Set(result.allocations.map(a => a.invoiceId)))
  }

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        await updateReceipt.mutateAsync({
          id,
          data: {
            receiptDate: data.receiptDate,
            receiptMethod: data.receiptMethod,
            checkNumber: data.checkNumber || undefined,
            checkDate: data.checkDate || undefined,
            bankReference: data.bankReference || undefined,
            currencyCode: data.currencyCode,
            exchangeRate: data.exchangeRate,
            totalAmount: data.totalAmount,
            bankAccountId: data.bankAccountId,
            description: data.description || undefined,
            reference: data.reference || undefined,
            payerName: data.payerName || undefined,
            fiscalPeriodId: data.fiscalPeriodId,
            lines: data.lines.map((line) => ({
              id: line.id,
              arInvoiceId: line.arInvoiceId,
              amountAllocated: line.amountAllocated,
              discountAmount: line.discountAmount,
              whtAmount: line.whtAmount,
              notes: line.notes || undefined,
            })),
          },
        })
      } else {
        await createReceipt.mutateAsync({
          receiptDate: data.receiptDate,
          customerId: data.customerId,
          receiptMethod: data.receiptMethod,
          checkNumber: data.checkNumber || undefined,
          checkDate: data.checkDate || undefined,
          bankReference: data.bankReference || undefined,
          currencyCode: data.currencyCode,
          exchangeRate: data.exchangeRate,
          totalAmount: data.totalAmount,
          bankAccountId: data.bankAccountId,
          description: data.description || undefined,
          reference: data.reference || undefined,
          payerName: data.payerName || undefined,
          fiscalPeriodId: data.fiscalPeriodId,
          lines: data.lines.map((line) => ({
            arInvoiceId: line.arInvoiceId,
            amountAllocated: line.amountAllocated,
            discountAmount: line.discountAmount,
            whtAmount: line.whtAmount,
            notes: line.notes || undefined,
          })),
        })
      }

      navigate("/ar/receipts")
    } catch {
      // Error is handled by mutation hooks
    }
  }

  const handleSave = form.handleSubmit(onSubmit)
  const isSubmitting = createReceipt.isPending || updateReceipt.isPending

  // Check if receipt can be edited
  const canEdit = !isEdit || receipt?.status === ArReceiptStatus.Draft

  // Filter bank accounts (typically asset accounts used for receipts)
  const bankAccountOptions = bankAccounts?.filter(a =>
    a.accountCode.startsWith("1") // Asset accounts - adjust as needed
  ) || []

  if (isEdit && isLoadingReceipt) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-150" />
      </div>
    )
  }

  if (isEdit && receipt && !canEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t("ar.receipts.form.cannotEdit")}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {t("ar.receipts.form.cannotEditDesc")}
            </p>
            <Button className="mt-4" onClick={() => navigate("/ar/receipts")}>
              {t("common.backToList")}
            </Button>
          </CardContent>
        </Card>
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? t("ar.receipts.form.editTitle") : t("ar.receipts.form.newTitle")}
          </h1>
          {isEdit && receipt && (
            <p className="text-muted-foreground">
              {t("ar.receipts.form.receipt")}: <span className="font-mono">{receipt.receiptNumber}</span>
            </p>
          )}
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Header Fields */}
          <Card>
            <CardHeader>
              <CardTitle>{t("ar.receipts.form.receiptDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.receipts.form.customer")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={handleCustomerChange}
                        disabled={isEdit || isLoadingCustomers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("ar.receipts.form.selectCustomer")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <span className="font-mono">{customer.customerCode}</span>
                              <span className="ml-2 text-muted-foreground">{customer.customerName}</span>
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
                  name="receiptDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.receipts.form.receiptDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiptMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.receipts.form.receiptMethod")}</FormLabel>
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
                          {Object.entries(receiptMethodLabels).map(([value, label]) => (
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

                {watchedReceiptMethod === ReceiptMethod.Check && (
                  <>
                    <FormField
                      control={form.control}
                      name="checkNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ar.receipts.form.checkNumber")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ar.receipts.form.checkDate")}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {watchedReceiptMethod === ReceiptMethod.BankTransfer && (
                  <FormField
                    control={form.control}
                    name="bankReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("ar.receipts.form.bankReference")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="bankAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.receipts.form.bankAccount")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoadingBankAccounts}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("ar.receipts.form.selectBankAccount")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bankAccountOptions.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <span className="font-mono">{account.accountCode}</span>
                              <span className="ml-2 text-muted-foreground">{account.accountName}</span>
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
                  name="currencyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.receipts.form.currency")}</FormLabel>
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
                      <FormLabel>{t("ar.receipts.form.exchangeRate")}</FormLabel>
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

                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.receipts.form.totalAmount")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
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
                  name="payerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("ar.receipts.form.payerName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>{t("ar.receipts.form.reference")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-3">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("common.description")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("ar.receipts.form.descriptionPlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Selection and Allocation */}
          {watchedCustomerId && (
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{t("ar.receipts.form.invoiceAllocation")}</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoAllocate}
                  disabled={autoAllocate.isPending || !form.watch("totalAmount")}
                >
                  <Wand2 className="mr-2 size-4" />
                  {t("ar.receipts.form.autoAllocate")}
                </Button>
              </CardHeader>
              <CardContent>
                {/* Unpaid Invoices Selection */}
                {unpaidInvoices && unpaidInvoices.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3">{t("ar.receipts.form.selectInvoices")}</h4>
                    <div className="rounded-md border max-h-48 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>{t("ar.receipts.form.invoiceNumber")}</TableHead>
                            <TableHead>{t("ar.receipts.form.dueDate")}</TableHead>
                            <TableHead className="text-right">{t("ar.receipts.form.balance")}</TableHead>
                            <TableHead className="text-right">{t("ar.receipts.form.daysOverdue")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {unpaidInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedInvoices.has(invoice.id)}
                                  onCheckedChange={(checked) =>
                                    handleInvoiceToggle(invoice, checked as boolean)
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                              <TableCell>{format(new Date(invoice.dueDate), "dd MMM yyyy")}</TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(invoice.balanceAmount, currencyCode)}
                              </TableCell>
                              <TableCell className={`text-right ${invoice.daysOverdue > 0 ? "text-destructive" : ""}`}>
                                {invoice.daysOverdue > 0 ? invoice.daysOverdue : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Allocation Lines */}
                <h4 className="text-sm font-medium mb-3">{t("ar.receipts.form.allocationDetails")}</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>{t("ar.receipts.form.invoice")}</TableHead>
                        <TableHead>{t("ar.receipts.form.dueDate")}</TableHead>
                        <TableHead className="text-right">{t("ar.receipts.form.invoiceBalance")}</TableHead>
                        <TableHead className="text-right w-32">{t("ar.receipts.form.allocated")}</TableHead>
                        <TableHead className="text-right w-28">{t("ar.receipts.form.discount")}</TableHead>
                        <TableHead className="text-right w-28">{t("ar.receipts.form.wht")}</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            {t("ar.receipts.form.noInvoicesSelected")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        fields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="font-mono">{field.invoiceNumber}</TableCell>
                            <TableCell>
                              {field.dueDate ? format(new Date(field.dueDate), "dd MMM yyyy") : "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(field.invoiceBalance || 0, currencyCode)}
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`lines.${index}.amountAllocated`}
                                render={({ field: allocField }) => (
                                  <FormItem className="space-y-0">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="text-right font-mono"
                                        value={allocField.value}
                                        onChange={(e) => allocField.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`lines.${index}.discountAmount`}
                                render={({ field: discField }) => (
                                  <FormItem className="space-y-0">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="text-right font-mono"
                                        value={discField.value}
                                        onChange={(e) => discField.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`lines.${index}.whtAmount`}
                                render={({ field: whtField }) => (
                                  <FormItem className="space-y-0">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="text-right font-mono"
                                        value={whtField.value}
                                        onChange={(e) => whtField.onChange(parseFloat(e.target.value) || 0)}
                                      />
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
                                onClick={() => {
                                  const invoiceId = field.arInvoiceId
                                  setSelectedInvoices(prev => {
                                    const newSet = new Set(prev)
                                    newSet.delete(invoiceId)
                                    return newSet
                                  })
                                  remove(index)
                                }}
                              >
                                <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-semibold">
                          {t("ar.receipts.form.totals")}:
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(totals.totalAllocated, currencyCode)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(totals.totalDiscount, currencyCode)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(totals.totalWht, currencyCode)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>

                {/* Summary */}
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("ar.receipts.form.receiptAmount")}</span>
                      <span className="font-mono font-medium">{formatCurrency(totals.receiptTotal, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("ar.receipts.form.totalAllocated")}</span>
                      <span className="font-mono">{formatCurrency(totals.totalAllocated, currencyCode)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>{t("ar.receipts.form.unallocated")}</span>
                      <span className={`font-mono ${totals.unallocated !== 0 ? "text-destructive" : "text-green-600"}`}>
                        {formatCurrency(totals.unallocated, currencyCode)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/ar/receipts")}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              {t("ar.receipts.form.save")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
