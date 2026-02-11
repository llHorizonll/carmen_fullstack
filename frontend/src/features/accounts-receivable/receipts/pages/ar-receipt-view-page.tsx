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
  useArReceipt,
  useApproveArReceipt,
  usePostArReceipt,
  useVoidArReceipt,
} from "../hooks"
import {
  ArReceiptStatus,
  arReceiptStatusLabels,
  receiptMethodLabels,
} from "../types"
import { formatCurrency } from "@/lib/utils"

export function ArReceiptViewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [voidReason, setVoidReason] = useState("")

  const { data: receipt, isLoading } = useArReceipt(id)
  const approveReceipt = useApproveArReceipt()
  const postReceipt = usePostArReceipt()
  const voidReceipt = useVoidArReceipt()

  const handleVoid = async () => {
    if (!id || !voidReason.trim()) return
    await voidReceipt.mutateAsync({ id, data: { reason: voidReason } })
    setVoidDialogOpen(false)
    setVoidReason("")
  }

  const getStatusVariant = (status: ArReceiptStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case ArReceiptStatus.Draft:
        return "outline"
      case ArReceiptStatus.Pending:
        return "secondary"
      case ArReceiptStatus.Approved:
        return "default"
      case ArReceiptStatus.Posted:
        return "default"
      case ArReceiptStatus.Void:
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

  if (!receipt) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t("ar.receipts.view.notFound")}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{t("ar.receipts.view.notFoundDesc")}</p>
            <Button className="mt-4" onClick={() => navigate("/ar/receipts")}>
              {t("common.backToList")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isDraft = receipt.status === ArReceiptStatus.Draft
  const isPending = receipt.status === ArReceiptStatus.Pending
  const isApproved = receipt.status === ArReceiptStatus.Approved
  const isPosted = receipt.status === ArReceiptStatus.Posted
  const canVoid = isApproved || isPosted

  // Calculate totals
  const totalAllocated = receipt.lines.reduce((sum, l) => sum + l.amountAllocated, 0)
  const totalDiscount = receipt.lines.reduce((sum, l) => sum + l.discountAmount, 0)
  const totalWht = receipt.lines.reduce((sum, l) => sum + l.whtAmount, 0)
  const totalExchangeGainLoss = receipt.lines.reduce((sum, l) => sum + l.exchangeGainLoss, 0)

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
                {receipt.receiptNumber}
              </h1>
              <Badge variant={getStatusVariant(receipt.status)}>
                {arReceiptStatusLabels[receipt.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {receipt.customerCode} - {receipt.customerName}
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
                onClick={() => navigate(`/ar/receipts/${id}/edit`)}
              >
                <Pencil className="mr-2 size-4" />
                {t("common.edit")}
              </Button>
              <Button
                size="sm"
                onClick={() => id && approveReceipt.mutate({ id, data: {} })}
                disabled={approveReceipt.isPending}
              >
                <Check className="mr-2 size-4" />
                {t("ar.receipts.actions.approve")}
              </Button>
            </>
          )}

          {isPending && (
            <Button
              size="sm"
              onClick={() => id && approveReceipt.mutate({ id, data: {} })}
              disabled={approveReceipt.isPending}
            >
              <Check className="mr-2 size-4" />
              {t("ar.receipts.actions.approve")}
            </Button>
          )}

          {isApproved && (
            <Button
              size="sm"
              onClick={() => id && postReceipt.mutate({ id, data: {} })}
              disabled={postReceipt.isPending}
            >
              <FileCheck className="mr-2 size-4" />
              {t("ar.receipts.actions.post")}
            </Button>
          )}

          {canVoid && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setVoidDialogOpen(true)}
            >
              <Ban className="mr-2 size-4" />
              {t("ar.receipts.actions.void")}
            </Button>
          )}
        </div>
      </div>

      {/* Receipt Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("ar.receipts.view.receiptDetails")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label className="text-muted-foreground">{t("ar.receipts.view.receiptDate")}</Label>
                <p>{format(new Date(receipt.receiptDate), "dd MMM yyyy")}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ar.receipts.view.receiptMethod")}</Label>
                <p>{receiptMethodLabels[receipt.receiptMethod]}</p>
              </div>
              {receipt.checkNumber && (
                <div>
                  <Label className="text-muted-foreground">{t("ar.receipts.view.checkNumber")}</Label>
                  <p className="font-mono">{receipt.checkNumber}</p>
                </div>
              )}
              {receipt.checkDate && (
                <div>
                  <Label className="text-muted-foreground">{t("ar.receipts.view.checkDate")}</Label>
                  <p>{format(new Date(receipt.checkDate), "dd MMM yyyy")}</p>
                </div>
              )}
              {receipt.bankReference && (
                <div>
                  <Label className="text-muted-foreground">{t("ar.receipts.view.bankReference")}</Label>
                  <p className="font-mono">{receipt.bankReference}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">{t("ar.receipts.view.bankAccount")}</Label>
                <p>
                  <span className="font-mono">{receipt.bankAccountCode}</span>
                  <span className="ml-2 text-muted-foreground">{receipt.bankAccountName}</span>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ar.receipts.view.currency")}</Label>
                <p>{receipt.currencyCode}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ar.receipts.view.exchangeRate")}</Label>
                <p className="font-mono">{receipt.exchangeRate}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("ar.receipts.view.fiscalPeriod")}</Label>
                <p>{receipt.fiscalPeriodName || "-"}</p>
              </div>
              {receipt.payerName && (
                <div>
                  <Label className="text-muted-foreground">{t("ar.receipts.view.receivedFrom")}</Label>
                  <p>{receipt.payerName}</p>
                </div>
              )}
              {receipt.reference && (
                <div>
                  <Label className="text-muted-foreground">{t("ar.receipts.view.reference")}</Label>
                  <p>{receipt.reference}</p>
                </div>
              )}
              {receipt.description && (
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground">{t("common.description")}</Label>
                  <p>{receipt.description}</p>
                </div>
              )}
            </div>

            {/* Status Information */}
            {(receipt.approvedAt || receipt.postedAt || receipt.voidReason) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  {receipt.approvedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-green-600" />
                      <span>{t("ar.receipts.view.approvedBy")}: {receipt.approvedBy}</span>
                      <span className="text-muted-foreground">
                        ({format(new Date(receipt.approvedAt), "dd MMM yyyy HH:mm")})
                      </span>
                    </div>
                  )}
                  {receipt.postedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileCheck className="size-4 text-blue-600" />
                      <span>{t("ar.receipts.view.postedBy")}: {receipt.postedBy}</span>
                      <span className="text-muted-foreground">
                        ({format(new Date(receipt.postedAt), "dd MMM yyyy HH:mm")})
                      </span>
                    </div>
                  )}
                  {receipt.voidReason && (
                    <div className="rounded-md bg-destructive/10 p-3">
                      <p className="text-sm font-medium text-destructive">{t("ar.receipts.view.voidReason")}:</p>
                      <p className="text-sm">{receipt.voidReason}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Journal Voucher Link */}
            {receipt.journalVoucherId && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t("ar.receipts.view.journalVoucher")}:</span>
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => navigate(`/gl/journal-vouchers/${receipt.journalVoucherId}`)}
                  >
                    {t("ar.receipts.view.viewJournalVoucher")}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Amounts Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t("ar.receipts.view.amounts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>{t("ar.receipts.view.totalAmount")}</span>
                <span className="font-mono text-primary">{formatCurrency(receipt.totalAmount, receipt.currencyCode)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("ar.receipts.view.allocated")}</span>
                <span className="font-mono">{formatCurrency(receipt.allocatedAmount, receipt.currencyCode)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("ar.receipts.view.unallocated")}</span>
                <span className={`font-mono ${receipt.unallocatedAmount > 0 ? "text-destructive" : ""}`}>
                  {formatCurrency(receipt.unallocatedAmount, receipt.currencyCode)}
                </span>
              </div>
              <Separator />
              {totalDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("ar.receipts.view.totalDiscount")}</span>
                  <span className="font-mono text-green-600">{formatCurrency(totalDiscount, receipt.currencyCode)}</span>
                </div>
              )}
              {totalWht > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("ar.receipts.view.totalWht")}</span>
                  <span className="font-mono">{formatCurrency(totalWht, receipt.currencyCode)}</span>
                </div>
              )}
              {totalExchangeGainLoss !== 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("ar.receipts.view.exchangeGainLoss")}</span>
                  <span className={`font-mono ${totalExchangeGainLoss > 0 ? "text-green-600" : "text-destructive"}`}>
                    {formatCurrency(totalExchangeGainLoss, receipt.currencyCode)}
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
          <CardTitle>{t("ar.receipts.view.allocations")} ({receipt.lines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{t("ar.receipts.view.invoice")}</TableHead>
                  <TableHead>{t("ar.receipts.view.dueDate")}</TableHead>
                  <TableHead className="text-right">{t("ar.receipts.view.invoiceAmount")}</TableHead>
                  <TableHead className="text-right">{t("ar.receipts.view.balanceBefore")}</TableHead>
                  <TableHead className="text-right">{t("ar.receipts.view.amountAllocated")}</TableHead>
                  <TableHead className="text-right">{t("ar.receipts.view.discount")}</TableHead>
                  <TableHead className="text-right">{t("ar.receipts.view.wht")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipt.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="text-muted-foreground">{line.lineNumber}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-mono font-medium">{line.invoiceNumber}</span>
                        {line.customerReference && (
                          <span className="ml-2 text-xs text-muted-foreground">({line.customerReference})</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(line.dueDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(line.invoiceTotalAmount, receipt.currencyCode)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(line.invoiceBalanceBefore, receipt.currencyCode)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(line.amountAllocated, receipt.currencyCode)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {line.discountAmount > 0 ? formatCurrency(line.discountAmount, receipt.currencyCode) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {line.whtAmount > 0 ? formatCurrency(line.whtAmount, receipt.currencyCode) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-semibold">
                    {t("ar.receipts.view.totals")}:
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(totalAllocated, receipt.currencyCode)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(totalDiscount, receipt.currencyCode)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(totalWht, receipt.currencyCode)}
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
              {t("common.createdBy")}: {receipt.createdBy} - {format(new Date(receipt.createdAt), "dd MMM yyyy HH:mm")}
            </span>
            {receipt.updatedAt && (
              <span>
                {t("common.lastUpdated")}: {format(new Date(receipt.updatedAt), "dd MMM yyyy HH:mm")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ar.receipts.void.title")}</DialogTitle>
            <DialogDescription>
              {t("ar.receipts.void.description", { receiptNumber: receipt.receiptNumber })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="voidReason">{t("ar.receipts.void.reason")}</Label>
            <Textarea
              id="voidReason"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder={t("ar.receipts.void.reasonPlaceholder")}
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
              disabled={voidReceipt.isPending || !voidReason.trim()}
            >
              {voidReceipt.isPending ? t("common.processing") : t("ar.receipts.actions.void")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
