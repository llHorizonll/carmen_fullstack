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
  Scan,
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
  useApInvoices,
  useDeleteApInvoice,
  useSubmitInvoiceForApproval,
  useApproveInvoice,
  useRejectInvoice,
  useVoidInvoice,
} from "../hooks"
import {
  ApInvoiceStatus,
  apInvoiceStatusLabels,
  type ApInvoiceListDto,
  type ApInvoiceQueryParams,
  type OcrExtractedInvoiceDto,
} from "../types"
import { formatCurrency } from "@/lib/utils"
import { OcrUploadDialog } from "../components/ocr-upload-dialog"
import { OcrReviewDialog } from "../components/ocr-review-dialog"

export function ApInvoiceListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useState<ApInvoiceQueryParams>({
    page: 1,
    pageSize: 20,
    sortBy: "InvoiceDate",
    sortDescending: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<ApInvoiceListDto | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [invoiceToReject, setInvoiceToReject] = useState<ApInvoiceListDto | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [invoiceToVoid, setInvoiceToVoid] = useState<ApInvoiceListDto | null>(null)
  const [voidReason, setVoidReason] = useState("")
  const [ocrUploadOpen, setOcrUploadOpen] = useState(false)
  const [ocrReviewOpen, setOcrReviewOpen] = useState(false)
  const [ocrData, setOcrData] = useState<OcrExtractedInvoiceDto | null>(null)

  const { data, isLoading } = useApInvoices(params)
  const deleteInvoice = useDeleteApInvoice()
  const submitForApproval = useSubmitInvoiceForApproval()
  const approveInvoice = useApproveInvoice()
  const rejectInvoice = useRejectInvoice()
  const voidInvoice = useVoidInvoice()

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

  const getStatusVariant = (status: ApInvoiceStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case ApInvoiceStatus.Draft:
        return "outline"
      case ApInvoiceStatus.Pending:
        return "secondary"
      case ApInvoiceStatus.Approved:
        return "default"
      case ApInvoiceStatus.Rejected:
        return "destructive"
      case ApInvoiceStatus.PartiallyPaid:
        return "secondary"
      case ApInvoiceStatus.Paid:
        return "default"
      case ApInvoiceStatus.Void:
        return "destructive"
      default:
        return "outline"
    }
  }

  const columns: ColumnDef<ApInvoiceListDto>[] = [
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ap.invoices.columns.invoiceNumber")} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("invoiceNumber")}</span>
      ),
    },
    {
      accessorKey: "vendorInvoiceNumber",
      header: t("ap.invoices.columns.vendorInvoiceNumber"),
      cell: ({ row }) => (
        <span className="font-mono">{row.getValue("vendorInvoiceNumber") || "-"}</span>
      ),
    },
    {
      accessorKey: "invoiceDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ap.invoices.columns.invoiceDate")} />
      ),
      cell: ({ row }) => format(new Date(row.getValue("invoiceDate")), "dd MMM yyyy"),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ap.invoices.columns.dueDate")} />
      ),
      cell: ({ row }) => {
        const dueDate = new Date(row.getValue("dueDate"))
        const today = new Date()
        const isOverdue = dueDate < today &&
          row.original.status !== ApInvoiceStatus.Paid &&
          row.original.status !== ApInvoiceStatus.Void
        return (
          <span className={isOverdue ? "text-destructive font-medium" : ""}>
            {format(dueDate, "dd MMM yyyy")}
          </span>
        )
      },
    },
    {
      accessorKey: "vendorName",
      header: t("ap.invoices.columns.vendor"),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.vendorName}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.vendorCode}</div>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ap.invoices.columns.totalAmount")} className="justify-end" />
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
        <DataTableColumnHeader column={column} title={t("ap.invoices.columns.balance")} className="justify-end" />
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
      header: t("ap.invoices.columns.lines"),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("lineCount")}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("ap.invoices.columns.status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as ApInvoiceStatus
        return (
          <Badge variant={getStatusVariant(status)}>
            {apInvoiceStatusLabels[status]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original
        const isDraft = invoice.status === ApInvoiceStatus.Draft
        const isPending = invoice.status === ApInvoiceStatus.Pending
        const canVoid = [ApInvoiceStatus.Approved, ApInvoiceStatus.PartiallyPaid].includes(invoice.status) &&
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
              <DropdownMenuItem onClick={() => navigate(`/ap/invoices/${invoice.id}`)}>
                <Eye className="mr-2 size-4" />
                {t("common.view")}
              </DropdownMenuItem>

              {isDraft && (
                <>
                  <DropdownMenuItem onClick={() => navigate(`/ap/invoices/${invoice.id}/edit`)}>
                    <Pencil className="mr-2 size-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => submitForApproval.mutate({ id: invoice.id, data: {} })}
                  >
                    <Send className="mr-2 size-4" />
                    {t("ap.invoices.actions.submitForApproval")}
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
                    {t("ap.invoices.actions.approve")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setInvoiceToReject(invoice)
                      setRejectDialogOpen(true)
                    }}
                  >
                    <X className="mr-2 size-4" />
                    {t("ap.invoices.actions.reject")}
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
                  {t("ap.invoices.actions.void")}
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
          <h1 className="text-2xl font-bold tracking-tight">{t("ap.invoices.title")}</h1>
          <p className="text-muted-foreground">{t("ap.invoices.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setOcrUploadOpen(true)}>
            <Scan className="mr-2 size-4" />
            OCR Upload
          </Button>
          <Button onClick={() => navigate("/ap/invoices/new")}>
            <Plus className="mr-2 size-4" />
            {t("ap.invoices.newInvoice")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.status?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              status: value === "all" ? undefined : Number(value) as ApInvoiceStatus,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder={t("ap.invoices.filters.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("ap.invoices.filters.allStatuses")}</SelectItem>
            <SelectItem value={String(ApInvoiceStatus.Draft)}>{apInvoiceStatusLabels[ApInvoiceStatus.Draft]}</SelectItem>
            <SelectItem value={String(ApInvoiceStatus.Pending)}>{apInvoiceStatusLabels[ApInvoiceStatus.Pending]}</SelectItem>
            <SelectItem value={String(ApInvoiceStatus.Approved)}>{apInvoiceStatusLabels[ApInvoiceStatus.Approved]}</SelectItem>
            <SelectItem value={String(ApInvoiceStatus.Rejected)}>{apInvoiceStatusLabels[ApInvoiceStatus.Rejected]}</SelectItem>
            <SelectItem value={String(ApInvoiceStatus.PartiallyPaid)}>{apInvoiceStatusLabels[ApInvoiceStatus.PartiallyPaid]}</SelectItem>
            <SelectItem value={String(ApInvoiceStatus.Paid)}>{apInvoiceStatusLabels[ApInvoiceStatus.Paid]}</SelectItem>
            <SelectItem value={String(ApInvoiceStatus.Void)}>{apInvoiceStatusLabels[ApInvoiceStatus.Void]}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">{t("ap.invoices.filters.dateFrom")}</Label>
          <Input
            type="date"
            className="w-40"
            value={params.dateFrom ?? ""}
            onChange={(e) => setParams((prev) => ({ ...prev, dateFrom: e.target.value || undefined, page: 1 }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">{t("ap.invoices.filters.dateTo")}</Label>
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
        searchPlaceholder={t("ap.invoices.filters.searchPlaceholder")}
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/ap/invoices/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ap.invoices.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("ap.invoices.delete.confirm", { invoiceNumber: invoiceToDelete?.invoiceNumber })}
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
            <DialogTitle>{t("ap.invoices.reject.title")}</DialogTitle>
            <DialogDescription>
              {t("ap.invoices.reject.description", { invoiceNumber: invoiceToReject?.invoiceNumber })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectReason">{t("ap.invoices.reject.reason")}</Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("ap.invoices.reject.reasonPlaceholder")}
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
              {rejectInvoice.isPending ? t("common.processing") : t("ap.invoices.actions.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ap.invoices.void.title")}</DialogTitle>
            <DialogDescription>
              {t("ap.invoices.void.description", { invoiceNumber: invoiceToVoid?.invoiceNumber })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="voidReason">{t("ap.invoices.void.reason")}</Label>
            <Textarea
              id="voidReason"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder={t("ap.invoices.void.reasonPlaceholder")}
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
              {voidInvoice.isPending ? t("common.processing") : t("ap.invoices.actions.void")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OCR Upload Dialog */}
      <OcrUploadDialog
        open={ocrUploadOpen}
        onOpenChange={setOcrUploadOpen}
        onExtracted={(data) => {
          setOcrData(data)
          setOcrReviewOpen(true)
        }}
      />

      {/* OCR Review Dialog */}
      <OcrReviewDialog
        open={ocrReviewOpen}
        onOpenChange={setOcrReviewOpen}
        data={ocrData}
      />
    </div>
  )
}
