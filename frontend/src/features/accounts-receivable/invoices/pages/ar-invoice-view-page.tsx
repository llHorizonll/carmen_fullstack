import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import {
  ArrowLeft,
  Pencil,
  Send,
  Check,
  X,
  Ban,
  Printer,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  useArInvoice,
  useSubmitArInvoiceForApproval,
  useApproveArInvoice,
  useRejectArInvoice,
  useVoidArInvoice,
} from "../hooks"
import {
  ArInvoiceStatus,
  arInvoiceStatusLabels,
} from "../types"
import { formatCurrency } from "@/lib/utils"

export function ArInvoiceViewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [voidReason, setVoidReason] = useState("")

  const { data: invoice, isLoading } = useArInvoice(id)
  const submitForApproval = useSubmitArInvoiceForApproval()
  const approveInvoice = useApproveArInvoice()
  const rejectInvoice = useRejectArInvoice()
  const voidInvoice = useVoidArInvoice()

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) return
    await rejectInvoice.mutateAsync({ id, data: { reason: rejectReason } })
    setRejectDialogOpen(false)
    setRejectReason("")
  }

  const handleVoid = async () => {
    if (!id || !voidReason.trim()) return
    await voidInvoice.mutateAsync({ id, data: { reason: voidReason } })
    setVoidDialogOpen(false)
    setVoidReason("")
  }

  const getStatusVariant = (status: ArInvoiceStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case ArInvoiceStatus.Draft:
        return "outline"
      case ArInvoiceStatus.Pending:
        return "secondary"
      case ArInvoiceStatus.Approved:
        return "default"
      case ArInvoiceStatus.Rejected:
        return "destructive"
      case ArInvoiceStatus.PartiallyPaid:
        return "secondary"
      case ArInvoiceStatus.Paid:
        return "default"
      case ArInvoiceStatus.Void:
        return "destructive"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t("ar.invoices.view.notFound")}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{t("ar.invoices.view.notFoundDesc")}</p>
            <Button className="mt-4" onClick={() => navigate("/ar/invoices")}>
              {t("common.backToList")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isDraft = invoice.status === ArInvoiceStatus.Draft
  const isPending = invoice.status === ArInvoiceStatus.Pending
  const canVoid = invoice.status === ArInvoiceStatus.Approved && invoice.paidAmount === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">
                {invoice.invoiceNumber}
              </h1>
              <Badge variant={getStatusVariant(invoice.status)}>
                {arInvoiceStatusLabels[invoice.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {invoice.customerCode} - {invoice.customerName}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 size-4" />
            {t("common.print")}
          </Button>

          {isDraft && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/ar/invoices/${id}/edit`)}
              >
                <Pencil className="mr-2 size-4" />
                {t("common.edit")}
              </Button>
              <Button
                size="sm"
                onClick={() => id && submitForApproval.mutate({ id, data: {} })}
                disabled={submitForApproval.isPending}
              >
                <Send className="mr-2 size-4" />
                {t("ar.invoices.actions.submitForApproval")}
              </Button>
            </>
          )}

          {isPending && (
            <>
              <Button
                size="sm"
                onClick={() => id && approveInvoice.mutate({ id, data: {} })}
                disabled={approveInvoice.isPending}
              >
                <Check className="mr-2 size-4" />
                {t("ar.invoices.actions.approve")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRejectDialogOpen(true)}
              >
                <X className="mr-2 size-4" />
                {t("ar.invoices.actions.reject")}
              </Button>
            </>
          )}

          {canVoid && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setVoidDialogOpen(true)}
            >
              <Ban className="mr-2 size-4" />
              {t("ar.invoices.actions.void")}
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("ar.invoices.view.invoiceDetails")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label className="text-muted-foreground">{t("ar.invoices.view.customerInvoice")}</Label>
                <p className="font-mono">{invoice.customerReference || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ar.invoices.view.invoiceDate")}</Label>
                <p>{format(new Date(invoice.invoiceDate), "dd MMM yyyy")}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ar.invoices.view.dueDate")}</Label>
                <p className={new Date(invoice.dueDate) < new Date() && invoice.balanceAmount > 0 ? "text-destructive font-medium" : ""}>
                  {format(new Date(invoice.dueDate), "dd MMM yyyy")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ar.invoices.view.currency")}</Label>
                <p>{invoice.currencyCode}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ar.invoices.view.exchangeRate")}</Label>
                <p className="font-mono">{invoice.exchangeRate}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ar.invoices.view.fiscalPeriod")}</Label>
                <p>{invoice.fiscalPeriodName || "-"}</p>
              </div>
              {invoice.reference && (
                <div>
                  <Label className="text-muted-foreground">{t("ar.invoices.view.reference")}</Label>
                  <p>{invoice.reference}</p>
                </div>
              )}
              {invoice.description && (
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground">{t("common.description")}</Label>
                  <p>{invoice.description}</p>
                </div>
              )}
            </div>

            {/* Status Information */}
            {(invoice.approvedAt || invoice.rejectionReason || invoice.voidReason) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  {invoice.approvedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-green-600" />
                      <span>{t("ar.invoices.view.approvedBy")}: {invoice.approvedBy}</span>
                      <span className="text-muted-foreground">
                        ({format(new Date(invoice.approvedAt), "dd MMM yyyy HH:mm")})
                      </span>
                    </div>
                  )}
                  {invoice.rejectionReason && (
                    <div className="rounded-md bg-destructive/10 p-3">
                      <p className="text-sm font-medium text-destructive">{t("ar.invoices.view.rejectionReason")}:</p>
                      <p className="text-sm">{invoice.rejectionReason}</p>
                    </div>
                  )}
                  {invoice.voidReason && (
                    <div className="rounded-md bg-destructive/10 p-3">
                      <p className="text-sm font-medium text-destructive">{t("ar.invoices.view.voidReason")}:</p>
                      <p className="text-sm">{invoice.voidReason}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Journal Voucher Link */}
            {invoice.journalVoucherId && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t("ar.invoices.view.journalVoucher")}:</span>
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => navigate(`/gl/journal-vouchers/${invoice.journalVoucherId}`)}
                  >
                    {t("ar.invoices.view.viewJournalVoucher")}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Amounts Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t("ar.invoices.view.amounts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("ar.invoices.view.subTotal")}</span>
                <span className="font-mono">{formatCurrency(invoice.subTotal, invoice.currencyCode)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("ar.invoices.view.discount")}</span>
                  <span className="font-mono text-destructive">-{formatCurrency(invoice.discountAmount, invoice.currencyCode)}</span>
                </div>
              )}
              <Separator />
              {invoice.tax1Amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {invoice.tax1ProfileName || t("ar.invoices.view.vat")} ({invoice.tax1Rate}%)
                  </span>
                  <span className="font-mono">{formatCurrency(invoice.tax1Amount, invoice.currencyCode)}</span>
                </div>
              )}
              {invoice.tax2Amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {invoice.tax2ProfileName || t("ar.invoices.view.serviceTax")} ({invoice.tax2Rate}%)
                  </span>
                  <span className="font-mono">{formatCurrency(invoice.tax2Amount, invoice.currencyCode)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>{t("ar.invoices.view.totalAmount")}</span>
                <span className="font-mono">{formatCurrency(invoice.totalAmount, invoice.currencyCode)}</span>
              </div>
              {invoice.whtAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {invoice.whtProfileName || t("ar.invoices.view.wht")} ({invoice.whtRate}%)
                  </span>
                  <span className="font-mono text-destructive">-{formatCurrency(invoice.whtAmount, invoice.currencyCode)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{t("ar.invoices.view.netAmount")}</span>
                <span className="font-mono text-primary">{formatCurrency(invoice.netAmount, invoice.currencyCode)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("ar.invoices.view.paidAmount")}</span>
                <span className="font-mono text-green-600">{formatCurrency(invoice.paidAmount, invoice.currencyCode)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>{t("ar.invoices.view.balanceAmount")}</span>
                <span className={`font-mono ${invoice.balanceAmount > 0 ? "text-destructive" : "text-green-600"}`}>
                  {formatCurrency(invoice.balanceAmount, invoice.currencyCode)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ar.invoices.view.lineItems")} ({invoice.lines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{t("ar.invoices.view.account")}</TableHead>
                  <TableHead>{t("ar.invoices.view.department")}</TableHead>
                  <TableHead>{t("common.description")}</TableHead>
                  <TableHead className="text-right">{t("ar.invoices.view.quantity")}</TableHead>
                  <TableHead className="text-right">{t("ar.invoices.view.unitPrice")}</TableHead>
                  <TableHead className="text-right">{t("ar.invoices.view.amount")}</TableHead>
                  {invoice.lines.some(l => l.tax1Amount > 0) && (
                    <TableHead className="text-right">{t("ar.invoices.view.tax")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="text-muted-foreground">{line.lineNumber}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-mono">{line.accountCode}</span>
                        <span className="ml-2 text-muted-foreground">{line.accountName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{line.departmentName || "-"}</TableCell>
                    <TableCell>{line.description || "-"}</TableCell>
                    <TableCell className="text-right font-mono">{line.quantity}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(line.unitPrice, invoice.currencyCode)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(line.amount, invoice.currencyCode)}
                    </TableCell>
                    {invoice.lines.some(l => l.tax1Amount > 0) && (
                      <TableCell className="text-right font-mono">
                        {line.tax1Amount > 0 ? (
                          <span>
                            {formatCurrency(line.tax1Amount, invoice.currencyCode)}
                            <span className="ml-1 text-xs text-muted-foreground">({line.tax1Rate}%)</span>
                          </span>
                        ) : "-"}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-semibold">
                    {t("ar.invoices.view.total")}:
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(invoice.subTotal, invoice.currencyCode)}
                  </TableCell>
                  {invoice.lines.some(l => l.tax1Amount > 0) && (
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(invoice.lines.reduce((sum, l) => sum + l.tax1Amount, 0), invoice.currencyCode)}
                    </TableCell>
                  )}
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t("common.createdBy")}: {invoice.createdBy} - {format(new Date(invoice.createdAt), "dd MMM yyyy HH:mm")}
            </span>
            {invoice.updatedAt && (
              <span>
                {t("common.lastUpdated")}: {format(new Date(invoice.updatedAt), "dd MMM yyyy HH:mm")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ar.invoices.reject.title")}</DialogTitle>
            <DialogDescription>
              {t("ar.invoices.reject.description", { invoiceNumber: invoice.invoiceNumber })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectReason">{t("ar.invoices.reject.reason")}</Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("ar.invoices.reject.reasonPlaceholder")}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectInvoice.isPending || !rejectReason.trim()}
            >
              {rejectInvoice.isPending ? t("common.processing") : t("ar.invoices.actions.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ar.invoices.void.title")}</DialogTitle>
            <DialogDescription>
              {t("ar.invoices.void.description", { invoiceNumber: invoice.invoiceNumber })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="voidReason">{t("ar.invoices.void.reason")}</Label>
            <Textarea
              id="voidReason"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder={t("ar.invoices.void.reasonPlaceholder")}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleVoid}
              disabled={voidInvoice.isPending || !voidReason.trim()}
            >
              {voidInvoice.isPending ? t("common.processing") : t("ar.invoices.actions.void")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
