import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import {
  ArrowLeft,
  Pencil,
  Send,
  Check,
  X,
  FileCheck,
  RotateCcw,
  Trash2,
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

import {
  useJournalVoucher,
  useDeleteJournalVoucher,
  useSubmitForApproval,
  useApproveVoucher,
  useRejectVoucher,
  usePostVoucher,
} from "../hooks"
import {
  DocumentStatus,
  documentStatusLabels,
  voucherTypeLabels,
} from "../types"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function JournalVoucherViewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const { data: voucher, isLoading } = useJournalVoucher(id)
  const deleteVoucher = useDeleteJournalVoucher()
  const submitForApproval = useSubmitForApproval()
  const approveVoucher = useApproveVoucher()
  const rejectVoucher = useRejectVoucher()
  const postVoucher = usePostVoucher()

  const getStatusVariant = (status: DocumentStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case DocumentStatus.Draft:
        return "outline"
      case DocumentStatus.Pending:
        return "secondary"
      case DocumentStatus.Approved:
        return "default"
      case DocumentStatus.Posted:
        return "default"
      case DocumentStatus.Rejected:
        return "destructive"
      case DocumentStatus.Void:
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleDelete = async () => {
    if (!id) return
    await deleteVoucher.mutateAsync(id)
    setDeleteDialogOpen(false)
    navigate("/gl/journal-vouchers")
  }

  const handleSubmitForApproval = async () => {
    if (!id) return
    await submitForApproval.mutateAsync({ id, data: {} })
  }

  const handleApprove = async () => {
    if (!id) return
    await approveVoucher.mutateAsync({ id, data: {} })
  }

  const handleReject = async () => {
    if (!id || !rejectReason) return
    await rejectVoucher.mutateAsync({ id, data: { reason: rejectReason } })
    setRejectDialogOpen(false)
    setRejectReason("")
  }

  const handlePost = async () => {
    if (!id) return
    await postVoucher.mutateAsync({ id, data: {} })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-50" />
        <Skeleton className="h-100" />
      </div>
    )
  }

  if (!voucher) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t("generalLedger.journalVouchers.view.notFound")}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {t("generalLedger.journalVouchers.view.notFoundDesc")}
            </p>
            <Button className="mt-4" onClick={() => navigate("/gl/journal-vouchers")}>
              {t("common.backToList")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isDraft = voucher.status === DocumentStatus.Draft
  const isPending = voucher.status === DocumentStatus.Pending
  const isApproved = voucher.status === DocumentStatus.Approved
  const isPosted = voucher.status === DocumentStatus.Posted

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
                {voucher.voucherNumber}
              </h1>
              <Badge variant={getStatusVariant(voucher.status)}>
                {documentStatusLabels[voucher.status]}
              </Badge>
              <Badge variant="outline">
                {voucherTypeLabels[voucher.voucherType]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{voucher.description || "No description"}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isDraft && (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/gl/journal-vouchers/${id}/edit`)}
              >
                <Pencil className="mr-2 size-4" />
                {t("common.edit")}
              </Button>
              <Button onClick={handleSubmitForApproval} disabled={submitForApproval.isPending}>
                <Send className="mr-2 size-4" />
                {t("generalLedger.journalVouchers.actions.submitForApproval")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 size-4" />
                {t("common.delete")}
              </Button>
            </>
          )}

          {isPending && (
            <>
              <Button onClick={handleApprove} disabled={approveVoucher.isPending}>
                <Check className="mr-2 size-4" />
                {t("generalLedger.journalVouchers.actions.approve")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
              >
                <X className="mr-2 size-4" />
                {t("generalLedger.journalVouchers.actions.reject")}
              </Button>
            </>
          )}

          {isApproved && (
            <Button onClick={handlePost} disabled={postVoucher.isPending}>
              <FileCheck className="mr-2 size-4" />
              {t("generalLedger.journalVouchers.actions.post")}
            </Button>
          )}

          {isPosted && (
            <Button variant="outline" onClick={() => navigate(`/gl/journal-vouchers/${id}/reverse`)}>
              <RotateCcw className="mr-2 size-4" />
              {t("generalLedger.journalVouchers.actions.reverse")}
            </Button>
          )}
        </div>
      </div>

      {/* Voucher Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("generalLedger.journalVouchers.view.voucherDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-muted-foreground">{t("generalLedger.journalVouchers.view.voucherDate")}</Label>
              <p className="font-medium">{format(new Date(voucher.voucherDate), "dd MMM yyyy")}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("generalLedger.journalVouchers.view.postingDate")}</Label>
              <p className="font-medium">{format(new Date(voucher.postingDate), "dd MMM yyyy")}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("generalLedger.journalVouchers.view.fiscalPeriod")}</Label>
              <p className="font-medium">{voucher.fiscalPeriodName || voucher.fiscalPeriodId}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("generalLedger.journalVouchers.view.currency")}</Label>
              <p className="font-medium">{voucher.currencyCode}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("generalLedger.journalVouchers.view.exchangeRate")}</Label>
              <p className="font-medium">{voucher.exchangeRate}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("generalLedger.journalVouchers.view.reference")}</Label>
              <p className="font-medium">{voucher.reference || "-"}</p>
            </div>
          </div>

          {(voucher.approvedBy || voucher.postedBy) && (
            <>
              <Separator className="my-4" />
              <div className="grid gap-4 md:grid-cols-3">
                {voucher.approvedBy && (
                  <div>
                    <Label className="text-muted-foreground">{t("generalLedger.journalVouchers.view.approvedBy")}</Label>
                    <p className="font-medium">{voucher.approvedBy}</p>
                    {voucher.approvedAt && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(voucher.approvedAt), "dd MMM yyyy HH:mm")}
                      </p>
                    )}
                  </div>
                )}
                {voucher.postedBy && (
                  <div>
                    <Label className="text-muted-foreground">{t("generalLedger.journalVouchers.view.postedBy")}</Label>
                    <p className="font-medium">{voucher.postedBy}</p>
                    {voucher.postedAt && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(voucher.postedAt), "dd MMM yyyy HH:mm")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Journal Lines */}
      <Card>
        <CardHeader>
          <CardTitle>{t("generalLedger.journalVouchers.view.journalLines")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-30">{t("generalLedger.journalVouchers.view.accountCode")}</TableHead>
                  <TableHead>{t("generalLedger.journalVouchers.view.accountName")}</TableHead>
                  <TableHead className="w-37.5 text-right">{t("generalLedger.journalVouchers.columns.debit")}</TableHead>
                  <TableHead className="w-37.5 text-right">{t("generalLedger.journalVouchers.columns.credit")}</TableHead>
                  <TableHead>{t("common.description")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucher.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="text-muted-foreground">
                      {line.lineNumber}
                    </TableCell>
                    <TableCell className="font-mono">
                      {line.accountCode}
                    </TableCell>
                    <TableCell>{line.accountName}</TableCell>
                    <TableCell className="text-right font-mono">
                      {line.debitAmount > 0
                        ? formatCurrency(line.debitAmount, voucher.currencyCode)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {line.creditAmount > 0
                        ? formatCurrency(line.creditAmount, voucher.currencyCode)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {line.description || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-semibold">
                    {t("generalLedger.journalVouchers.form.totals")}:
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(voucher.totalDebit, voucher.currencyCode)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(voucher.totalCredit, voucher.currencyCode)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("generalLedger.journalVouchers.view.auditInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-muted-foreground">{t("generalLedger.journalVouchers.view.createdBy")}</Label>
              <p className="font-medium">{voucher.createdBy}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(voucher.createdAt), "dd MMM yyyy HH:mm")}
              </p>
            </div>
            {voucher.updatedAt && (
              <div>
                <Label className="text-muted-foreground">{t("generalLedger.journalVouchers.view.lastUpdated")}</Label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(voucher.updatedAt), "dd MMM yyyy HH:mm")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("generalLedger.journalVouchers.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("generalLedger.journalVouchers.delete.confirm", { voucherNumber: voucher.voucherNumber })}{" "}
              {t("generalLedger.journalVouchers.delete.cannotUndo")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteVoucher.isPending}
            >
              {deleteVoucher.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("generalLedger.journalVouchers.reject.title")}</DialogTitle>
            <DialogDescription>
              {t("generalLedger.journalVouchers.reject.description", { voucherNumber: voucher.voucherNumber })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectReason">{t("generalLedger.journalVouchers.reject.reasonLabel")}</Label>
            <Input
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("generalLedger.journalVouchers.reject.reasonPlaceholder")}
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
              disabled={rejectVoucher.isPending || !rejectReason}
            >
              {rejectVoucher.isPending ? t("common.rejecting") : t("generalLedger.journalVouchers.actions.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
