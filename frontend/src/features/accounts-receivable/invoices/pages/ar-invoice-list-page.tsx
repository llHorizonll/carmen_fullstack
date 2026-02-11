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
  Send,
  Check,
  X,
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
  useArInvoices,
  useDeleteArInvoice,
  useSubmitArInvoiceForApproval,
  useApproveArInvoice,
  useRejectArInvoice,
  useVoidArInvoice,
} from "../hooks"
import {
  ArInvoiceStatus,
  arInvoiceStatusLabels,
  type ArInvoiceListDto,
  type ArInvoiceQueryParams,
} from "../types"
import { formatCurrency } from "@/lib/utils"

export function ArInvoiceListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useState<ArInvoiceQueryParams>({
    page: 1,
    pageSize: 20,
    sortBy: "InvoiceDate",
    sortDescending: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<ArInvoiceListDto | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [invoiceToReject, setInvoiceToReject] = useState<ArInvoiceListDto | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [invoiceToVoid, setInvoiceToVoid] = useState<ArInvoiceListDto | null>(null)
  const [voidReason, setVoidReason] = useState("")

  const { data, isLoading } = useArInvoices(params)
  const deleteInvoice = useDeleteArInvoice()
  const submitForApproval = useSubmitArInvoiceForApproval()
  const approveInvoice = useApproveArInvoice()
  const rejectInvoice = useRejectArInvoice()
  const voidInvoice = useVoidArInvoice()

  const handleDelete = async () => {
    if (!invoiceToDelete) return
    await deleteInvoice.mutateAsync(invoiceToDelete.id)
    setDeleteDialogOpen(false)
    setInvoiceToDelete(null)
  }

  const handleReject = async () => {
    if (!invoiceToReject || !rejectReason.trim()) return
    await rejectInvoice.mutateAsync({ id: invoiceToReject.id, data: { reason: rejectReason } })
    setRejectDialogOpen(false)
    setInvoiceToReject(null)
    setRejectReason("")
  }

  const handleVoid = async () => {
    if (!invoiceToVoid || !voidReason.trim()) return
    await voidInvoice.mutateAsync({ id: invoiceToVoid.id, data: { reason: voidReason } })
    setVoidDialogOpen(false)
    setInvoiceToVoid(null)
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

  const columns: ColumnDef<ArInvoiceListDto>[] = [
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ar.invoices.columns.invoiceNumber")} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("invoiceNumber")}</span>
      ),
    },
    {
      accessorKey: "customerInvoiceNumber",
      header: t("ar.invoices.columns.customerInvoiceNumber"),
      cell: ({ row }) => (
        <span className="font-mono">{row.getValue("customerInvoiceNumber") || "-"}</span>
      ),
    },
    {
      accessorKey: "invoiceDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ar.invoices.columns.invoiceDate")} />
      ),
      cell: ({ row }) => format(new Date(row.getValue("invoiceDate")), "dd MMM yyyy"),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ar.invoices.columns.dueDate")} />
      ),
      cell: ({ row }) => {
        const dueDate = new Date(row.getValue("dueDate"))
        const today = new Date()
        const isOverdue = dueDate < today &&
          row.original.status !== ArInvoiceStatus.Paid &&
          row.original.status !== ArInvoiceStatus.Void
        return (
          <span className={isOverdue ? "text-destructive font-medium" : ""}>
            {format(dueDate, "dd MMM yyyy")}
          </span>
        )
      },
    },
    {
      accessorKey: "customerName",
      header: t("ar.invoices.columns.customer"),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.customerCode}</div>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ar.invoices.columns.totalAmount")} className="justify-end" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono">
          {formatCurrency(row.getValue("totalAmount"), row.original.currencyCode)}
        </div>
      ),
    },
    {
      accessorKey: "balanceAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ar.invoices.columns.balance")} className="justify-end" />
      ),
      cell: ({ row }) => {
        const balance = row.getValue("balanceAmount") as number
        return (
          <div className={`text-right font-mono ${balance > 0 ? "text-destructive" : ""}`}>
            {formatCurrency(balance, row.original.currencyCode)}
          </div>
        )
      },
    },
    {
      accessorKey: "lineCount",
      header: t("ar.invoices.columns.lines"),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("lineCount")}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("ar.invoices.columns.status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as ArInvoiceStatus
        return (
          <Badge variant={getStatusVariant(status)}>
            {arInvoiceStatusLabels[status]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original
        const isDraft = invoice.status === ArInvoiceStatus.Draft
        const isPending = invoice.status === ArInvoiceStatus.Pending
        const canVoid = [ArInvoiceStatus.Approved, ArInvoiceStatus.PartiallyPaid].includes(invoice.status) &&
          invoice.paidAmount === 0

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/ar/invoices/${invoice.id}`)}>
                <Eye className="mr-2 size-4" />
                {t("common.view")}
              </DropdownMenuItem>

              {isDraft && (
                <>
                  <DropdownMenuItem onClick={() => navigate(`/ar/invoices/${invoice.id}/edit`)}>
                    <Pencil className="mr-2 size-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => submitForApproval.mutate({ id: invoice.id, data: {} })}
                  >
                    <Send className="mr-2 size-4" />
                    {t("ar.invoices.actions.submitForApproval")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setInvoiceToDelete(invoice)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    {t("common.delete")}
                  </DropdownMenuItem>
                </>
              )}

              {isPending && (
                <>
                  <DropdownMenuItem
                    onClick={() => approveInvoice.mutate({ id: invoice.id, data: {} })}
                  >
                    <Check className="mr-2 size-4" />
                    {t("ar.invoices.actions.approve")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setInvoiceToReject(invoice)
                      setRejectDialogOpen(true)
                    }}
                  >
                    <X className="mr-2 size-4" />
                    {t("ar.invoices.actions.reject")}
                  </DropdownMenuItem>
                </>
              )}

              {canVoid && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setInvoiceToVoid(invoice)
                    setVoidDialogOpen(true)
                  }}
                >
                  <Ban className="mr-2 size-4" />
                  {t("ar.invoices.actions.void")}
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
          <h1 className="text-2xl font-bold tracking-tight">{t("ar.invoices.title")}</h1>
          <p className="text-muted-foreground">{t("ar.invoices.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/ar/invoices/new")}>
          <Plus className="mr-2 size-4" />
          {t("ar.invoices.newInvoice")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.status?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              status: value === "all" ? undefined : Number(value) as ArInvoiceStatus,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder={t("ar.invoices.filters.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("ar.invoices.filters.allStatuses")}</SelectItem>
            <SelectItem value={String(ArInvoiceStatus.Draft)}>{arInvoiceStatusLabels[ArInvoiceStatus.Draft]}</SelectItem>
            <SelectItem value={String(ArInvoiceStatus.Pending)}>{arInvoiceStatusLabels[ArInvoiceStatus.Pending]}</SelectItem>
            <SelectItem value={String(ArInvoiceStatus.Approved)}>{arInvoiceStatusLabels[ArInvoiceStatus.Approved]}</SelectItem>
            <SelectItem value={String(ArInvoiceStatus.Rejected)}>{arInvoiceStatusLabels[ArInvoiceStatus.Rejected]}</SelectItem>
            <SelectItem value={String(ArInvoiceStatus.PartiallyPaid)}>{arInvoiceStatusLabels[ArInvoiceStatus.PartiallyPaid]}</SelectItem>
            <SelectItem value={String(ArInvoiceStatus.Paid)}>{arInvoiceStatusLabels[ArInvoiceStatus.Paid]}</SelectItem>
            <SelectItem value={String(ArInvoiceStatus.Void)}>{arInvoiceStatusLabels[ArInvoiceStatus.Void]}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">{t("ar.invoices.filters.dateFrom")}</Label>
          <Input
            type="date"
            className="w-40"
            value={params.dateFrom ?? ""}
            onChange={(e) => setParams((prev) => ({ ...prev, dateFrom: e.target.value || undefined, page: 1 }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">{t("ar.invoices.filters.dateTo")}</Label>
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
        searchKey="invoiceNumber"
        searchPlaceholder={t("ar.invoices.filters.searchPlaceholder")}
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/ar/invoices/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ar.invoices.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("ar.invoices.delete.confirm", { invoiceNumber: invoiceToDelete?.invoiceNumber })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteInvoice.isPending}
            >
              {deleteInvoice.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ar.invoices.reject.title")}</DialogTitle>
            <DialogDescription>
              {t("ar.invoices.reject.description", { invoiceNumber: invoiceToReject?.invoiceNumber })}
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
              {t("ar.invoices.void.description", { invoiceNumber: invoiceToVoid?.invoiceNumber })}
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
