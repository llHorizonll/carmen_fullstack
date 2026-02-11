import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import {
  ArrowLeft,
  Pencil,
  Check,
  FileCheck,
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
  useApPayment,
  useApprovePayment,
  usePostPayment,
  useVoidPayment,
} from "../hooks"
import {
  ApPaymentStatus,
  apPaymentStatusLabels,
  paymentMethodLabels,
} from "../types"
import { formatCurrency } from "@/lib/utils"

export function ApPaymentViewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [voidReason, setVoidReason] = useState("")

  const { data: payment, isLoading } = useApPayment(id)
  const approvePayment = useApprovePayment()
  const postPayment = usePostPayment()
  const voidPayment = useVoidPayment()

  const handleVoid = async () => {
    if (!id || !voidReason.trim()) return
    await voidPayment.mutateAsync({ id, data: { reason: voidReason } })
    setVoidDialogOpen(false)
    setVoidReason("")
  }

  const getStatusVariant = (status: ApPaymentStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case ApPaymentStatus.Draft:
        return "outline"
      case ApPaymentStatus.Pending:
        return "secondary"
      case ApPaymentStatus.Approved:
        return "default"
      case ApPaymentStatus.Posted:
        return "default"
      case ApPaymentStatus.Void:
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

  if (!payment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t("ap.payments.view.notFound")}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{t("ap.payments.view.notFoundDesc")}</p>
            <Button className="mt-4" onClick={() => navigate("/ap/payments")}>
              {t("common.backToList")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isDraft = payment.status === ApPaymentStatus.Draft
  const isPending = payment.status === ApPaymentStatus.Pending
  const isApproved = payment.status === ApPaymentStatus.Approved
  const isPosted = payment.status === ApPaymentStatus.Posted
  const canVoid = isApproved || isPosted

  // Calculate totals
  const totalAllocated = payment.lines.reduce((sum, l) => sum + l.amountAllocated, 0)
  const totalDiscount = payment.lines.reduce((sum, l) => sum + l.discountAmount, 0)
  const totalWht = payment.lines.reduce((sum, l) => sum + l.whtAmount, 0)
  const totalExchangeGainLoss = payment.lines.reduce((sum, l) => sum + l.exchangeGainLoss, 0)

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
                {payment.paymentNumber}
              </h1>
              <Badge variant={getStatusVariant(payment.status)}>
                {apPaymentStatusLabels[payment.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {payment.vendorCode} - {payment.vendorName}
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
                onClick={() => navigate(`/ap/payments/${id}/edit`)}
              >
                <Pencil className="mr-2 size-4" />
                {t("common.edit")}
              </Button>
              <Button
                size="sm"
                onClick={() => id && approvePayment.mutate({ id, data: {} })}
                disabled={approvePayment.isPending}
              >
                <Check className="mr-2 size-4" />
                {t("ap.payments.actions.approve")}
              </Button>
            </>
          )}

          {isPending && (
            <Button
              size="sm"
              onClick={() => id && approvePayment.mutate({ id, data: {} })}
              disabled={approvePayment.isPending}
            >
              <Check className="mr-2 size-4" />
              {t("ap.payments.actions.approve")}
            </Button>
          )}

          {isApproved && (
            <Button
              size="sm"
              onClick={() => id && postPayment.mutate({ id, data: {} })}
              disabled={postPayment.isPending}
            >
              <FileCheck className="mr-2 size-4" />
              {t("ap.payments.actions.post")}
            </Button>
          )}

          {canVoid && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setVoidDialogOpen(true)}
            >
              <Ban className="mr-2 size-4" />
              {t("ap.payments.actions.void")}
            </Button>
          )}
        </div>
      </div>

      {/* Payment Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("ap.payments.view.paymentDetails")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label className="text-muted-foreground">{t("ap.payments.view.paymentDate")}</Label>
                <p>{format(new Date(payment.paymentDate), "dd MMM yyyy")}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ap.payments.view.paymentMethod")}</Label>
                <p>{paymentMethodLabels[payment.paymentMethod]}</p>
              </div>
              {payment.checkNumber && (
                <div>
                  <Label className="text-muted-foreground">{t("ap.payments.view.checkNumber")}</Label>
                  <p className="font-mono">{payment.checkNumber}</p>
                </div>
              )}
              {payment.checkDate && (
                <div>
                  <Label className="text-muted-foreground">{t("ap.payments.view.checkDate")}</Label>
                  <p>{format(new Date(payment.checkDate), "dd MMM yyyy")}</p>
                </div>
              )}
              {payment.bankReference && (
                <div>
                  <Label className="text-muted-foreground">{t("ap.payments.view.bankReference")}</Label>
                  <p className="font-mono">{payment.bankReference}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">{t("ap.payments.view.bankAccount")}</Label>
                <p>
                  <span className="font-mono">{payment.bankAccountCode}</span>
                  <span className="ml-2 text-muted-foreground">{payment.bankAccountName}</span>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ap.payments.view.currency")}</Label>
                <p>{payment.currencyCode}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ap.payments.view.exchangeRate")}</Label>
                <p className="font-mono">{payment.exchangeRate}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ap.payments.view.fiscalPeriod")}</Label>
                <p>{payment.fiscalPeriodName || "-"}</p>
              </div>
              {payment.payeeName && (
                <div>
                  <Label className="text-muted-foreground">{t("ap.payments.view.payeeName")}</Label>
                  <p>{payment.payeeName}</p>
                </div>
              )}
              {payment.reference && (
                <div>
                  <Label className="text-muted-foreground">{t("ap.payments.view.reference")}</Label>
                  <p>{payment.reference}</p>
                </div>
              )}
              {payment.description && (
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground">{t("common.description")}</Label>
                  <p>{payment.description}</p>
                </div>
              )}
            </div>

            {/* Status Information */}
            {(payment.approvedAt || payment.postedAt || payment.voidReason) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  {payment.approvedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-green-600" />
                      <span>{t("ap.payments.view.approvedBy")}: {payment.approvedBy}</span>
                      <span className="text-muted-foreground">
                        ({format(new Date(payment.approvedAt), "dd MMM yyyy HH:mm")})
                      </span>
                    </div>
                  )}
                  {payment.postedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileCheck className="size-4 text-blue-600" />
                      <span>{t("ap.payments.view.postedBy")}: {payment.postedBy}</span>
                      <span className="text-muted-foreground">
                        ({format(new Date(payment.postedAt), "dd MMM yyyy HH:mm")})
                      </span>
                    </div>
                  )}
                  {payment.voidReason && (
                    <div className="rounded-md bg-destructive/10 p-3">
                      <p className="text-sm font-medium text-destructive">{t("ap.payments.view.voidReason")}:</p>
                      <p className="text-sm">{payment.voidReason}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Journal Voucher Link */}
            {payment.journalVoucherId && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t("ap.payments.view.journalVoucher")}:</span>
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => navigate(`/gl/journal-vouchers/${payment.journalVoucherId}`)}
                  >
                    {t("ap.payments.view.viewJournalVoucher")}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Amounts Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t("ap.payments.view.amounts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>{t("ap.payments.view.totalAmount")}</span>
                <span className="font-mono text-primary">{formatCurrency(payment.totalAmount, payment.currencyCode)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("ap.payments.view.allocated")}</span>
                <span className="font-mono">{formatCurrency(payment.allocatedAmount, payment.currencyCode)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("ap.payments.view.unallocated")}</span>
                <span className={`font-mono ${payment.unallocatedAmount > 0 ? "text-destructive" : ""}`}>
                  {formatCurrency(payment.unallocatedAmount, payment.currencyCode)}
                </span>
              </div>
              <Separator />
              {totalDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("ap.payments.view.totalDiscount")}</span>
                  <span className="font-mono text-green-600">{formatCurrency(totalDiscount, payment.currencyCode)}</span>
                </div>
              )}
              {totalWht > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("ap.payments.view.totalWht")}</span>
                  <span className="font-mono">{formatCurrency(totalWht, payment.currencyCode)}</span>
                </div>
              )}
              {totalExchangeGainLoss !== 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("ap.payments.view.exchangeGainLoss")}</span>
                  <span className={`font-mono ${totalExchangeGainLoss > 0 ? "text-green-600" : "text-destructive"}`}>
                    {formatCurrency(totalExchangeGainLoss, payment.currencyCode)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Lines */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ap.payments.view.allocations")} ({payment.lines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{t("ap.payments.view.invoice")}</TableHead>
                  <TableHead>{t("ap.payments.view.dueDate")}</TableHead>
                  <TableHead className="text-right">{t("ap.payments.view.invoiceAmount")}</TableHead>
                  <TableHead className="text-right">{t("ap.payments.view.balanceBefore")}</TableHead>
                  <TableHead className="text-right">{t("ap.payments.view.amountAllocated")}</TableHead>
                  <TableHead className="text-right">{t("ap.payments.view.discount")}</TableHead>
                  <TableHead className="text-right">{t("ap.payments.view.wht")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payment.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="text-muted-foreground">{line.lineNumber}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-mono font-medium">{line.invoiceNumber}</span>
                        {line.vendorInvoiceNumber && (
                          <span className="ml-2 text-xs text-muted-foreground">({line.vendorInvoiceNumber})</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(line.dueDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(line.invoiceTotalAmount, payment.currencyCode)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(line.invoiceBalanceBefore, payment.currencyCode)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(line.amountAllocated, payment.currencyCode)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {line.discountAmount > 0 ? formatCurrency(line.discountAmount, payment.currencyCode) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {line.whtAmount > 0 ? formatCurrency(line.whtAmount, payment.currencyCode) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-semibold">
                    {t("ap.payments.view.totals")}:
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(totalAllocated, payment.currencyCode)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(totalDiscount, payment.currencyCode)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(totalWht, payment.currencyCode)}
                  </TableCell>
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
              {t("common.createdBy")}: {payment.createdBy} - {format(new Date(payment.createdAt), "dd MMM yyyy HH:mm")}
            </span>
            {payment.updatedAt && (
              <span>
                {t("common.lastUpdated")}: {format(new Date(payment.updatedAt), "dd MMM yyyy HH:mm")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ap.payments.void.title")}</DialogTitle>
            <DialogDescription>
              {t("ap.payments.void.description", { paymentNumber: payment.paymentNumber })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="voidReason">{t("ap.payments.void.reason")}</Label>
            <Textarea
              id="voidReason"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder={t("ap.payments.void.reasonPlaceholder")}
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
              disabled={voidPayment.isPending || !voidReason.trim()}
            >
              {voidPayment.isPending ? t("common.processing") : t("ap.payments.actions.void")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
