import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Check,
  FileCheck,
  Ban,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  useApPayments,
  useDeleteApPayment,
  useApprovePayment,
  usePostPayment,
  useVoidPayment,
} from "../hooks"
import {
  ApPaymentStatus,
  apPaymentStatusLabels,
  PaymentMethod,
  paymentMethodLabels,
  type ApPaymentListDto,
  type ApPaymentQueryParams,
} from "../types"
import { formatCurrency } from "@/lib/utils"

export function ApPaymentListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useState<ApPaymentQueryParams>({
    page: 1,
    pageSize: 20,
    sortBy: "PaymentDate",
    sortDescending: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<ApPaymentListDto | null>(null)
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [paymentToVoid, setPaymentToVoid] = useState<ApPaymentListDto | null>(null)
  const [voidReason, setVoidReason] = useState("")

  const { data, isLoading } = useApPayments(params)
  const deletePayment = useDeleteApPayment()
  const approvePayment = useApprovePayment()
  const postPayment = usePostPayment()
  const voidPayment = useVoidPayment()

  const handleDelete = async () => {
    if (!paymentToDelete) return
    await deletePayment.mutateAsync(paymentToDelete.id)
    setDeleteDialogOpen(false)
    setPaymentToDelete(null)
  }

  const handleVoid = async () => {
    if (!paymentToVoid || !voidReason.trim()) return
    await voidPayment.mutateAsync({ id: paymentToVoid.id, data: { reason: voidReason } })
    setVoidDialogOpen(false)
    setPaymentToVoid(null)
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

  const columns: ColumnDef<ApPaymentListDto>[] = [
    {
      accessorKey: "paymentNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ap.payments.columns.paymentNumber")} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("paymentNumber")}</span>
      ),
    },
    {
      accessorKey: "paymentDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ap.payments.columns.paymentDate")} />
      ),
      cell: ({ row }) => format(new Date(row.getValue("paymentDate")), "dd MMM yyyy"),
    },
    {
      accessorKey: "vendorName",
      header: t("ap.payments.columns.vendor"),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.vendorName}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.vendorCode}</div>
        </div>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: t("ap.payments.columns.method"),
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as PaymentMethod
        return (
          <div>
            <Badge variant="outline">{paymentMethodLabels[method]}</Badge>
            {row.original.checkNumber && (
              <div className="text-xs text-muted-foreground font-mono mt-1">
                #{row.original.checkNumber}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ap.payments.columns.amount")} className="justify-end" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono font-medium">
          {formatCurrency(row.getValue("totalAmount"), row.original.currencyCode)}
        </div>
      ),
    },
    {
      accessorKey: "bankAccountCode",
      header: t("ap.payments.columns.bankAccount"),
      cell: ({ row }) => (
        <span className="font-mono">{row.getValue("bankAccountCode")}</span>
      ),
    },
    {
      accessorKey: "allocationCount",
      header: t("ap.payments.columns.invoices"),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("allocationCount")}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("ap.payments.columns.status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as ApPaymentStatus
        return (
          <Badge variant={getStatusVariant(status)}>
            {apPaymentStatusLabels[status]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const payment = row.original
        const isDraft = payment.status === ApPaymentStatus.Draft
        const isPending = payment.status === ApPaymentStatus.Pending
        const isApproved = payment.status === ApPaymentStatus.Approved
        const isPosted = payment.status === ApPaymentStatus.Posted

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/ap/payments/${payment.id}`)}>
                <Eye className="mr-2 size-4" />
                {t("common.view")}
              </DropdownMenuItem>

              {isDraft && (
                <>
                  <DropdownMenuItem onClick={() => navigate(`/ap/payments/${payment.id}/edit`)}>
                    <Pencil className="mr-2 size-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => approvePayment.mutate({ id: payment.id, data: {} })}
                  >
                    <Check className="mr-2 size-4" />
                    {t("ap.payments.actions.approve")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setPaymentToDelete(payment)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    {t("common.delete")}
                  </DropdownMenuItem>
                </>
              )}

              {isPending && (
                <DropdownMenuItem
                  onClick={() => approvePayment.mutate({ id: payment.id, data: {} })}
                >
                  <Check className="mr-2 size-4" />
                  {t("ap.payments.actions.approve")}
                </DropdownMenuItem>
              )}

              {isApproved && (
                <DropdownMenuItem
                  onClick={() => postPayment.mutate({ id: payment.id, data: {} })}
                >
                  <FileCheck className="mr-2 size-4" />
                  {t("ap.payments.actions.post")}
                </DropdownMenuItem>
              )}

              {(isApproved || isPosted) && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setPaymentToVoid(payment)
                    setVoidDialogOpen(true)
                  }}
                >
                  <Ban className="mr-2 size-4" />
                  {t("ap.payments.actions.void")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("ap.payments.title")}</h1>
          <p className="text-muted-foreground">{t("ap.payments.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/ap/payments/new")}>
          <Plus className="mr-2 size-4" />
          {t("ap.payments.newPayment")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.status?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              status: value === "all" ? undefined : Number(value) as ApPaymentStatus,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder={t("ap.payments.filters.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("ap.payments.filters.allStatuses")}</SelectItem>
            <SelectItem value={String(ApPaymentStatus.Draft)}>{apPaymentStatusLabels[ApPaymentStatus.Draft]}</SelectItem>
            <SelectItem value={String(ApPaymentStatus.Pending)}>{apPaymentStatusLabels[ApPaymentStatus.Pending]}</SelectItem>
            <SelectItem value={String(ApPaymentStatus.Approved)}>{apPaymentStatusLabels[ApPaymentStatus.Approved]}</SelectItem>
            <SelectItem value={String(ApPaymentStatus.Posted)}>{apPaymentStatusLabels[ApPaymentStatus.Posted]}</SelectItem>
            <SelectItem value={String(ApPaymentStatus.Void)}>{apPaymentStatusLabels[ApPaymentStatus.Void]}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.paymentMethod?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              paymentMethod: value === "all" ? undefined : Number(value) as PaymentMethod,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("ap.payments.filters.allMethods")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("ap.payments.filters.allMethods")}</SelectItem>
            <SelectItem value={String(PaymentMethod.Cash)}>{paymentMethodLabels[PaymentMethod.Cash]}</SelectItem>
            <SelectItem value={String(PaymentMethod.Check)}>{paymentMethodLabels[PaymentMethod.Check]}</SelectItem>
            <SelectItem value={String(PaymentMethod.BankTransfer)}>{paymentMethodLabels[PaymentMethod.BankTransfer]}</SelectItem>
            <SelectItem value={String(PaymentMethod.CreditCard)}>{paymentMethodLabels[PaymentMethod.CreditCard]}</SelectItem>
            <SelectItem value={String(PaymentMethod.Other)}>{paymentMethodLabels[PaymentMethod.Other]}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">{t("ap.payments.filters.dateFrom")}</Label>
          <Input
            type="date"
            className="w-40"
            value={params.dateFrom ?? ""}
            onChange={(e) => setParams((prev) => ({ ...prev, dateFrom: e.target.value || undefined, page: 1 }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">{t("ap.payments.filters.dateTo")}</Label>
          <Input
            type="date"
            className="w-40"
            value={params.dateTo ?? ""}
            onChange={(e) => setParams((prev) => ({ ...prev, dateTo: e.target.value || undefined, page: 1 }))}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        searchKey="paymentNumber"
        searchPlaceholder={t("ap.payments.filters.searchPlaceholder")}
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/ap/payments/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ap.payments.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("ap.payments.delete.confirm", { paymentNumber: paymentToDelete?.paymentNumber })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePayment.isPending}
            >
              {deletePayment.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ap.payments.void.title")}</DialogTitle>
            <DialogDescription>
              {t("ap.payments.void.description", { paymentNumber: paymentToVoid?.paymentNumber })}
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
