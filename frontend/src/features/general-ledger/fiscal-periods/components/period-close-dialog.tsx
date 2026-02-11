import { useState } from "react"
import { useTranslation } from "react-i18next"
import { AlertTriangle, CheckCircle2, XCircle, Loader2, FileWarning } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { usePeriodCloseValidation, useClosePeriod, useBlockingVouchers } from "../hooks"
import type { FiscalPeriodListDto } from "../types"

interface PeriodCloseDialogProps {
  period: FiscalPeriodListDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function PeriodCloseDialog({ period, open, onOpenChange }: PeriodCloseDialogProps) {
  const { t } = useTranslation()
  const [comment, setComment] = useState("")
  const [showBlockingVouchers, setShowBlockingVouchers] = useState(false)

  const { data: validation, isLoading: validationLoading } = usePeriodCloseValidation(
    open ? period?.id : undefined
  )
  const { data: blockingVouchers, isLoading: blockingLoading } = useBlockingVouchers(
    showBlockingVouchers && period?.id ? period.id : undefined
  )
  const closePeriod = useClosePeriod()

  const handleClose = async () => {
    if (!period) return
    await closePeriod.mutateAsync({
      id: period.id,
      data: { comment: comment || undefined },
    })
    onOpenChange(false)
    setComment("")
  }

  const totalBlockingVouchers =
    (validation?.draftVouchersCount ?? 0) +
    (validation?.pendingVouchersCount ?? 0) +
    (validation?.approvedVouchersCount ?? 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("generalLedger.fiscalPeriods.closePeriod")}</DialogTitle>
          <DialogDescription>
            {period?.name} ({period?.startDate} - {period?.endDate})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Validation Loading */}
          {validationLoading && (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {/* Validation Results */}
          {!validationLoading && validation && (
            <>
              {/* Status Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("generalLedger.fiscalPeriods.totalDebit")}
                  </p>
                  <p className="text-2xl font-bold font-mono text-green-600">
                    {formatCurrency(validation.totalDebit)}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("generalLedger.fiscalPeriods.totalCredit")}
                  </p>
                  <p className="text-2xl font-bold font-mono text-red-600">
                    {formatCurrency(validation.totalCredit)}
                  </p>
                </div>
              </div>

              {/* Balance Status */}
              {validation.isBalanced ? (
                <Alert>
                  <CheckCircle2 className="size-4 text-green-600" />
                  <AlertTitle className="text-green-600">
                    {t("generalLedger.fiscalPeriods.balanced")}
                  </AlertTitle>
                  <AlertDescription>
                    {t("generalLedger.fiscalPeriods.balancedDescription")}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="size-4" />
                  <AlertTitle>{t("generalLedger.fiscalPeriods.unbalanced")}</AlertTitle>
                  <AlertDescription>
                    {t("generalLedger.fiscalPeriods.unbalancedDescription")}
                  </AlertDescription>
                </Alert>
              )}

              {/* Blocking Vouchers */}
              {totalBlockingVouchers > 0 && (
                <Alert variant="destructive">
                  <FileWarning className="size-4" />
                  <AlertTitle>{t("generalLedger.fiscalPeriods.blockingVouchers")}</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>{t("generalLedger.fiscalPeriods.blockingVouchersDescription")}</p>
                    <div className="flex gap-2">
                      {validation.draftVouchersCount > 0 && (
                        <Badge variant="outline">
                          {validation.draftVouchersCount} {t("generalLedger.vouchers.status.draft")}
                        </Badge>
                      )}
                      {validation.pendingVouchersCount > 0 && (
                        <Badge variant="secondary">
                          {validation.pendingVouchersCount} {t("generalLedger.vouchers.status.pending")}
                        </Badge>
                      )}
                      {validation.approvedVouchersCount > 0 && (
                        <Badge variant="default">
                          {validation.approvedVouchersCount} {t("generalLedger.vouchers.status.approved")}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => setShowBlockingVouchers(!showBlockingVouchers)}
                    >
                      {showBlockingVouchers
                        ? t("generalLedger.fiscalPeriods.hideDetails")
                        : t("generalLedger.fiscalPeriods.showDetails")}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Blocking Voucher Details */}
              {showBlockingVouchers && blockingVouchers && (
                <div className="rounded-lg border p-4 space-y-3">
                  {blockingLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <>
                      {blockingVouchers.draftVouchers.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            {t("generalLedger.vouchers.status.draft")}
                          </h4>
                          <ul className="text-sm space-y-1">
                            {blockingVouchers.draftVouchers.map((v) => (
                              <li key={v.id} className="font-mono">
                                {v.voucherNumber} - {v.description || t("common.noDescription")}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {blockingVouchers.pendingVouchers.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            {t("generalLedger.vouchers.status.pending")}
                          </h4>
                          <ul className="text-sm space-y-1">
                            {blockingVouchers.pendingVouchers.map((v) => (
                              <li key={v.id} className="font-mono">
                                {v.voucherNumber} - {v.description || t("common.noDescription")}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {blockingVouchers.approvedVouchers.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            {t("generalLedger.vouchers.status.approved")}
                          </h4>
                          <ul className="text-sm space-y-1">
                            {blockingVouchers.approvedVouchers.map((v) => (
                              <li key={v.id} className="font-mono">
                                {v.voucherNumber} - {v.description || t("common.noDescription")}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="size-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-600">
                    {t("generalLedger.fiscalPeriods.warnings")}
                  </AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Errors */}
              {validation.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="size-4" />
                  <AlertTitle>{t("generalLedger.fiscalPeriods.errors")}</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Comment */}
              {validation.canClose && (
                <div className="space-y-2">
                  <Label htmlFor="comment">{t("generalLedger.fiscalPeriods.closeComment")}</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("generalLedger.fiscalPeriods.closeCommentPlaceholder")}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleClose}
            disabled={
              validationLoading ||
              !validation?.canClose ||
              closePeriod.isPending
            }
          >
            {closePeriod.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("generalLedger.fiscalPeriods.closePeriod")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
