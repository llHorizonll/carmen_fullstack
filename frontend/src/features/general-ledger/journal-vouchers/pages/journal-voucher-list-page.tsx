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
  FileCheck,
  RotateCcw,
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

import {
  useJournalVouchers,
  useDeleteJournalVoucher,
  useSubmitForApproval,
  useApproveVoucher,
  usePostVoucher,
} from "../hooks"
import {
  DocumentStatus,
  VoucherType,
  type JournalVoucherListDto,
  type JournalVoucherQueryParams,
} from "../types"
import { formatCurrency } from "@/lib/utils"

export function JournalVoucherListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useState<JournalVoucherQueryParams>({
    page: 1,
    pageSize: 20,
    sortBy: "VoucherDate",
    sortDescending: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [voucherToDelete, setVoucherToDelete] = useState<JournalVoucherListDto | null>(null)

  const { data, isLoading } = useJournalVouchers(params)
  const deleteVoucher = useDeleteJournalVoucher()
  const submitForApproval = useSubmitForApproval()
  const approveVoucher = useApproveVoucher()
  const postVoucher = usePostVoucher()

  const handleDelete = async () => {
    if (!voucherToDelete) return
    await deleteVoucher.mutateAsync(voucherToDelete.id)
    setDeleteDialogOpen(false)
    setVoucherToDelete(null)
  }

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

  const columns: ColumnDef<JournalVoucherListDto>[] = [
    {
      accessorKey: "voucherNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("generalLedger.journalVouchers.columns.voucherNumber")} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("voucherNumber")}</span>
      ),
    },
    {
      accessorKey: "voucherDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("generalLedger.journalVouchers.columns.date")} />
      ),
      cell: ({ row }) => format(new Date(row.getValue("voucherDate")), "dd MMM yyyy"),
    },
    {
      accessorKey: "voucherType",
      header: t("generalLedger.journalVouchers.columns.type"),
      cell: ({ row }) => {
        const type = row.getValue("voucherType") as VoucherType
        return <Badge variant="outline">{t(`generalLedger.journalVouchers.types.${VoucherType[type].toLowerCase()}`)}</Badge>
      },
    },
    {
      accessorKey: "description",
      header: t("generalLedger.journalVouchers.columns.description"),
      cell: ({ row }) => (
        <span className="max-w-50 truncate block">
          {row.getValue("description") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "totalDebit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("generalLedger.journalVouchers.columns.debit")} className="justify-end" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono">
          {formatCurrency(row.getValue("totalDebit"), row.original.currencyCode)}
        </div>
      ),
    },
    {
      accessorKey: "totalCredit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("generalLedger.journalVouchers.columns.credit")} className="justify-end" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono">
          {formatCurrency(row.getValue("totalCredit"), row.original.currencyCode)}
        </div>
      ),
    },
    {
      accessorKey: "lineCount",
      header: t("generalLedger.journalVouchers.columns.lines"),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("lineCount")}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("generalLedger.journalVouchers.columns.status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as DocumentStatus
        return (
          <Badge variant={getStatusVariant(status)}>
            {t(`generalLedger.journalVouchers.statuses.${DocumentStatus[status].toLowerCase()}`)}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const voucher = row.original
        const isDraft = voucher.status === DocumentStatus.Draft
        const isPending = voucher.status === DocumentStatus.Pending
        const isApproved = voucher.status === DocumentStatus.Approved

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/gl/journal-vouchers/${voucher.id}`)}>
                <Eye className="mr-2 size-4" />
                {t("common.view")}
              </DropdownMenuItem>

              {isDraft && (
                <>
                  <DropdownMenuItem onClick={() => navigate(`/gl/journal-vouchers/${voucher.id}/edit`)}>
                    <Pencil className="mr-2 size-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => submitForApproval.mutate({ id: voucher.id, data: {} })}
                  >
                    <Send className="mr-2 size-4" />
                    {t("generalLedger.journalVouchers.actions.submitForApproval")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setVoucherToDelete(voucher)
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
                    onClick={() => approveVoucher.mutate({ id: voucher.id, data: {} })}
                  >
                    <Check className="mr-2 size-4" />
                    {t("generalLedger.journalVouchers.actions.approve")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <X className="mr-2 size-4" />
                    {t("generalLedger.journalVouchers.actions.reject")}
                  </DropdownMenuItem>
                </>
              )}

              {isApproved && (
                <DropdownMenuItem
                  onClick={() => postVoucher.mutate({ id: voucher.id, data: {} })}
                >
                  <FileCheck className="mr-2 size-4" />
                  {t("generalLedger.journalVouchers.actions.post")}
                </DropdownMenuItem>
              )}

              {voucher.status === DocumentStatus.Posted && (
                <DropdownMenuItem>
                  <RotateCcw className="mr-2 size-4" />
                  {t("generalLedger.journalVouchers.actions.reverse")}
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
          <h1 className="text-2xl font-bold tracking-tight">{t("generalLedger.journalVouchers.title")}</h1>
          <p className="text-muted-foreground">
            {t("generalLedger.journalVouchers.subtitle")}
          </p>
        </div>
        <Button onClick={() => navigate("/gl/journal-vouchers/new")}>
          <Plus className="mr-2 size-4" />
          {t("generalLedger.journalVouchers.newVoucher")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.status?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              status: value === "all" ? undefined : Number(value) as DocumentStatus,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder={t("generalLedger.journalVouchers.filters.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("generalLedger.journalVouchers.filters.allStatuses")}</SelectItem>
            <SelectItem value={String(DocumentStatus.Draft)}>{t("generalLedger.journalVouchers.statuses.draft")}</SelectItem>
            <SelectItem value={String(DocumentStatus.Pending)}>{t("generalLedger.journalVouchers.statuses.pending")}</SelectItem>
            <SelectItem value={String(DocumentStatus.Approved)}>{t("generalLedger.journalVouchers.statuses.approved")}</SelectItem>
            <SelectItem value={String(DocumentStatus.Posted)}>{t("generalLedger.journalVouchers.statuses.posted")}</SelectItem>
            <SelectItem value={String(DocumentStatus.Rejected)}>{t("generalLedger.journalVouchers.statuses.rejected")}</SelectItem>
            <SelectItem value={String(DocumentStatus.Void)}>{t("generalLedger.journalVouchers.statuses.void")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.voucherType?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              voucherType: value === "all" ? undefined : Number(value) as VoucherType,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder={t("generalLedger.journalVouchers.filters.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("generalLedger.journalVouchers.filters.allTypes")}</SelectItem>
            <SelectItem value={String(VoucherType.General)}>{t("generalLedger.journalVouchers.types.general")}</SelectItem>
            <SelectItem value={String(VoucherType.Recurring)}>{t("generalLedger.journalVouchers.types.recurring")}</SelectItem>
            <SelectItem value={String(VoucherType.Reversal)}>{t("generalLedger.journalVouchers.types.reversal")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        searchKey="voucherNumber"
        searchPlaceholder={t("generalLedger.journalVouchers.filters.searchPlaceholder")}
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/gl/journal-vouchers/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("generalLedger.journalVouchers.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("generalLedger.journalVouchers.delete.confirm", { voucherNumber: voucherToDelete?.voucherNumber })}{" "}
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
    </div>
  )
}
