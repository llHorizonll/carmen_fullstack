import { useEffect, useMemo, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Plus, Trash2, ArrowLeft, Save, Send, Loader2 } from "lucide-react"

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

import {
  useJournalVoucher,
  useCreateJournalVoucher,
  useUpdateJournalVoucher,
  useSubmitForApproval,
  useNextVoucherNumber,
} from "../hooks"
import { VoucherType, voucherTypeLabels, DocumentStatus } from "../types"
import { useAccountLookup } from "../../accounts/hooks"
import { formatCurrency } from "@/lib/utils"
import {
  EntryModeToggle,
  SpreadsheetEntryMode,
  type EntryMode,
  type SpreadsheetLine,
} from "../components"

// Line item schema
const lineSchema = z.object({
  id: z.string().optional(),
  accountId: z.string().min(1, "Account is required"),
  debitAmount: z.number().min(0, "Must be >= 0"),
  creditAmount: z.number().min(0, "Must be >= 0"),
  description: z.string().optional(),
  reference: z.string().optional(),
  departmentId: z.string().optional(),
})

// Form schema
const formSchema = z.object({
  voucherDate: z.string().min(1, "Voucher date is required"),
  postingDate: z.string().min(1, "Posting date is required"),
  voucherType: z.number(),
  description: z.string().optional(),
  reference: z.string().optional(),
  currencyCode: z.string().min(1, "Currency is required"),
  exchangeRate: z.number().min(0.0001, "Exchange rate must be > 0"),
  fiscalPeriodId: z.string().min(1, "Fiscal period is required"),
  lines: z.array(lineSchema).min(2, "At least 2 lines are required"),
}).refine(
  (data) => {
    const totalDebit = data.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0)
    const totalCredit = data.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0)
    return Math.abs(totalDebit - totalCredit) < 0.01
  },
  {
    message: "Total debits must equal total credits",
    path: ["lines"],
  }
)

type FormValues = z.infer<typeof formSchema>

export function JournalVoucherFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  // Entry mode state (persisted to localStorage)
  const [entryMode, setEntryMode] = useState<EntryMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("jv-entry-mode") as EntryMode) || "form"
    }
    return "form"
  })

  const handleEntryModeChange = useCallback((mode: EntryMode) => {
    setEntryMode(mode)
    localStorage.setItem("jv-entry-mode", mode)
  }, [])

  // Queries
  const { data: voucher, isLoading: isLoadingVoucher } = useJournalVoucher(id)
  const { data: accounts, isLoading: isLoadingAccounts } = useAccountLookup(undefined, true)
  const { data: nextNumber } = useNextVoucherNumber(VoucherType.General)

  // Mutations
  const createVoucher = useCreateJournalVoucher()
  const updateVoucher = useUpdateJournalVoucher()
  const submitForApproval = useSubmitForApproval()

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voucherDate: format(new Date(), "yyyy-MM-dd"),
      postingDate: format(new Date(), "yyyy-MM-dd"),
      voucherType: VoucherType.General,
      description: "",
      reference: "",
      currencyCode: "USD",
      exchangeRate: 1,
      fiscalPeriodId: "default", // TODO: Get from fiscal period service
      lines: [
        { accountId: "", debitAmount: 0, creditAmount: 0, description: "" },
        { accountId: "", debitAmount: 0, creditAmount: 0, description: "" },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  // Populate form when editing
  useEffect(() => {
    if (isEdit && voucher) {
      form.reset({
        voucherDate: format(new Date(voucher.voucherDate), "yyyy-MM-dd"),
        postingDate: format(new Date(voucher.postingDate), "yyyy-MM-dd"),
        voucherType: voucher.voucherType,
        description: voucher.description || "",
        reference: voucher.reference || "",
        currencyCode: voucher.currencyCode,
        exchangeRate: voucher.exchangeRate,
        fiscalPeriodId: voucher.fiscalPeriodId,
        lines: voucher.lines.map((line) => ({
          id: line.id,
          accountId: line.accountId,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          description: line.description || "",
          reference: line.reference || "",
          departmentId: line.departmentId || "",
        })),
      })
    }
  }, [isEdit, voucher, form])

  // Calculate totals
  const watchedLines = form.watch("lines")
  const totals = useMemo(() => {
    const totalDebit = watchedLines.reduce((sum, line) => sum + (Number(line.debitAmount) || 0), 0)
    const totalCredit = watchedLines.reduce((sum, line) => sum + (Number(line.creditAmount) || 0), 0)
    const difference = totalDebit - totalCredit
    return { totalDebit, totalCredit, difference, isBalanced: Math.abs(difference) < 0.01 }
  }, [watchedLines])

  const currencyCode = form.watch("currencyCode")

  // Handlers
  const handleAddLine = () => {
    append({ accountId: "", debitAmount: 0, creditAmount: 0, description: "" })
  }

  const handleRemoveLine = (index: number) => {
    if (fields.length > 2) {
      remove(index)
    }
  }

  // Handle spreadsheet line changes - sync with form
  const handleSpreadsheetChange = useCallback(
    (newLines: SpreadsheetLine[]) => {
      // Filter out empty lines but keep at least 2
      const validLines = newLines.filter(
        (line, idx) =>
          line.accountId ||
          line.debitAmount > 0 ||
          line.creditAmount > 0 ||
          line.description ||
          idx < 2
      )

      // Ensure minimum 2 lines
      while (validLines.length < 2) {
        validLines.push({ accountId: "", debitAmount: 0, creditAmount: 0, description: "" })
      }

      // Update form field array
      form.setValue(
        "lines",
        validLines.map((line) => ({
          id: line.id,
          accountId: line.accountId,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          description: line.description || "",
          reference: line.reference || "",
          departmentId: line.departmentId || "",
        })),
        { shouldValidate: true }
      )
    },
    [form]
  )

  // Convert form lines to spreadsheet lines
  const spreadsheetLines: SpreadsheetLine[] = useMemo(
    () =>
      watchedLines.map((line) => {
        const account = accounts?.find((a) => a.id === line.accountId)
        return {
          id: line.id,
          accountId: line.accountId,
          accountCode: account?.accountCode,
          accountName: account?.accountName,
          debitAmount: Number(line.debitAmount) || 0,
          creditAmount: Number(line.creditAmount) || 0,
          description: line.description,
          reference: line.reference,
          departmentId: line.departmentId,
        }
      }),
    [watchedLines, accounts]
  )

  const onSubmit = async (data: FormValues, shouldSubmitForApproval: boolean = false) => {
    try {
      if (isEdit) {
        const updated = await updateVoucher.mutateAsync({
          id,
          data: {
            voucherDate: data.voucherDate,
            postingDate: data.postingDate,
            description: data.description,
            reference: data.reference,
            currencyCode: data.currencyCode,
            exchangeRate: data.exchangeRate,
            fiscalPeriodId: data.fiscalPeriodId,
            lines: data.lines.map((line) => ({
              id: line.id,
              accountId: line.accountId,
              debitAmount: line.debitAmount,
              creditAmount: line.creditAmount,
              description: line.description,
              reference: line.reference,
              departmentId: line.departmentId,
            })),
          },
        })

        if (shouldSubmitForApproval) {
          await submitForApproval.mutateAsync({ id: updated.id, data: {} })
        }
      } else {
        const created = await createVoucher.mutateAsync({
          voucherDate: data.voucherDate,
          postingDate: data.postingDate,
          voucherType: data.voucherType,
          description: data.description,
          reference: data.reference,
          currencyCode: data.currencyCode,
          exchangeRate: data.exchangeRate,
          fiscalPeriodId: data.fiscalPeriodId,
          lines: data.lines.map((line) => ({
            accountId: line.accountId,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            description: line.description,
            reference: line.reference,
            departmentId: line.departmentId,
          })),
        })

        if (shouldSubmitForApproval) {
          await submitForApproval.mutateAsync({ id: created.id, data: {} })
        }
      }

      navigate("/gl/journal-vouchers")
    } catch {
      // Error is handled by mutation hooks
    }
  }

  const handleSave = form.handleSubmit((data) => onSubmit(data, false))
  const handleSaveAndSubmit = form.handleSubmit((data) => onSubmit(data, true))

  const isSubmitting = createVoucher.isPending || updateVoucher.isPending || submitForApproval.isPending

  // Check if voucher can be edited
  const canEdit = !isEdit || voucher?.status === DocumentStatus.Draft

  if (isEdit && isLoadingVoucher) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-150" />
      </div>
    )
  }

  if (isEdit && voucher && !canEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t("generalLedger.journalVouchers.form.cannotEdit")}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {t("generalLedger.journalVouchers.form.cannotEditDesc")}
            </p>
            <Button className="mt-4" onClick={() => navigate("/gl/journal-vouchers")}>
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
            {isEdit ? t("generalLedger.journalVouchers.form.editTitle") : t("generalLedger.journalVouchers.form.newTitle")}
          </h1>
          {!isEdit && nextNumber?.voucherNumber && (
            <p className="text-muted-foreground">
              {t("generalLedger.journalVouchers.form.nextVoucherNumber")}: <span className="font-mono">{nextNumber.voucherNumber}</span>
            </p>
          )}
          {isEdit && voucher && (
            <p className="text-muted-foreground">
              {t("generalLedger.journalVouchers.form.voucher")}: <span className="font-mono">{voucher.voucherNumber}</span>
            </p>
          )}
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Header Fields */}
          <Card>
            <CardHeader>
              <CardTitle>{t("generalLedger.journalVouchers.form.voucherDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="voucherDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("generalLedger.journalVouchers.form.voucherDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("generalLedger.journalVouchers.form.postingDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="voucherType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("generalLedger.journalVouchers.form.voucherType")}</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(Number(value))}
                        disabled={isEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(voucherTypeLabels).map(([value, label]) => (
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
                  name="currencyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("generalLedger.journalVouchers.form.currency")}</FormLabel>
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
                      <FormLabel>{t("generalLedger.journalVouchers.form.exchangeRate")}</FormLabel>
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
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("generalLedger.journalVouchers.form.reference")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("generalLedger.journalVouchers.form.referencePlaceholder")} {...field} />
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
                          <Input placeholder={t("generalLedger.journalVouchers.form.descriptionPlaceholder")} {...field} />
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
              <CardTitle>{t("generalLedger.journalVouchers.form.journalLines")}</CardTitle>
              <div className="flex items-center gap-4">
                <EntryModeToggle
                  mode={entryMode}
                  onChange={handleEntryModeChange}
                />
                {entryMode === "form" && (
                  <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                    <Plus className="mr-2 size-4" />
                    {t("generalLedger.journalVouchers.form.addLine")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {entryMode === "spreadsheet" ? (
                <SpreadsheetEntryMode
                  lines={spreadsheetLines}
                  onChange={handleSpreadsheetChange}
                  accounts={accounts || []}
                  currencyCode={currencyCode}
                  disabled={isLoadingAccounts}
                />
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead className="min-w-50">{t("generalLedger.journalVouchers.form.account")}</TableHead>
                          <TableHead className="w-37.5">{t("generalLedger.journalVouchers.columns.debit")}</TableHead>
                          <TableHead className="w-37.5">{t("generalLedger.journalVouchers.columns.credit")}</TableHead>
                          <TableHead>{t("common.description")}</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
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
                                          <SelectValue placeholder={t("generalLedger.journalVouchers.form.selectAccount")} />
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
                                name={`lines.${index}.debitAmount`}
                                render={({ field }) => (
                                  <FormItem className="space-y-0">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="text-right font-mono"
                                        value={field.value}
                                        onChange={(e) => {
                                          const value = parseFloat(e.target.value) || 0
                                          field.onChange(value)
                                          // Auto-clear credit when debit is entered
                                          if (value > 0) {
                                            form.setValue(`lines.${index}.creditAmount`, 0)
                                          }
                                        }}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`lines.${index}.creditAmount`}
                                render={({ field }) => (
                                  <FormItem className="space-y-0">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="text-right font-mono"
                                        value={field.value}
                                        onChange={(e) => {
                                          const value = parseFloat(e.target.value) || 0
                                          field.onChange(value)
                                          // Auto-clear debit when credit is entered
                                          if (value > 0) {
                                            form.setValue(`lines.${index}.debitAmount`, 0)
                                          }
                                        }}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`lines.${index}.description`}
                                render={({ field }) => (
                                  <FormItem className="space-y-0">
                                    <FormControl>
                                      <Input placeholder={t("generalLedger.journalVouchers.form.lineDescriptionPlaceholder")} {...field} />
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
                                disabled={fields.length <= 2}
                              >
                                <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2} className="text-right font-semibold">
                            {t("generalLedger.journalVouchers.form.totals")}:
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(totals.totalDebit, currencyCode)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(totals.totalCredit, currencyCode)}
                          </TableCell>
                          <TableCell colSpan={2}>
                            {!totals.isBalanced && (
                              <span className="text-sm text-destructive">
                                {t("generalLedger.journalVouchers.form.outOfBalance", { amount: formatCurrency(Math.abs(totals.difference), currencyCode) })}
                              </span>
                            )}
                            {totals.isBalanced && totals.totalDebit > 0 && (
                              <span className="text-sm text-green-600">{t("generalLedger.journalVouchers.form.balanced")}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </>
              )}
              {form.formState.errors.lines?.message && (
                <p className="mt-2 text-sm text-destructive">
                  {form.formState.errors.lines.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/gl/journal-vouchers")}
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
              {t("generalLedger.journalVouchers.form.saveAsDraft")}
            </Button>
            <Button
              type="button"
              onClick={handleSaveAndSubmit}
              disabled={isSubmitting || !totals.isBalanced}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              {t("generalLedger.journalVouchers.form.saveAndSubmit")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
