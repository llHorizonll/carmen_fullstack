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
  useArReceipts,
  useDeleteArReceipt,
  useApproveArReceipt,
  usePostArReceipt,
  useVoidArReceipt,
} from "../hooks"
import {
  ArReceiptStatus,
  arReceiptStatusLabels,
  ReceiptMethod,
  receiptMethodLabels,
  type ArReceiptListDto,
  type ArReceiptQueryParams,
} from "../types"
import { formatCurrency } from "@/lib/utils"

export function ArReceiptListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useState<ArReceiptQueryParams>({
    page: 1,
    pageSize: 20,
    sortBy: "ReceiptDate",
    sortDescending: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [receiptToDelete, setReceiptToDelete] = useState<ArReceiptListDto | null>(null)
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [receiptToVoid, setReceiptToVoid] = useState<ArReceiptListDto | null>(null)
  const [voidReason, setVoidReason] = useState("")

  const { data, isLoading } = useArReceipts(params)
  const deleteReceipt = useDeleteArReceipt()
  const approveReceipt = useApproveArReceipt()
  const postReceipt = usePostArReceipt()
  const voidReceipt = useVoidArReceipt()

  const handleDelete = async () => {
    if (!receiptToDelete) return
    await deleteReceipt.mutateAsync(receiptToDelete.id)
    setDeleteDialogOpen(false)
    setReceiptToDelete(null)
  }

  const handleVoid = async () => {
    if (!receiptToVoid || !voidReason.trim()) return
    await voidReceipt.mutateAsync({ id: receiptToVoid.id, data: { reason: voidReason } })
    setVoidDialogOpen(false)
    setReceiptToVoid(null)
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

  const columns: ColumnDef<ArReceiptListDto>[] = [
    {
      accessorKey: "receiptNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ar.receipts.columns.receiptNumber")} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("receiptNumber")}</span>
      ),
    },
    {
      accessorKey: "receiptDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("ar.receipts.columns.receiptDate")} />
      ),
      cell: ({ row }) => format(new Date(row.getValue("receiptDate")), "dd MMM yyyy"),
    },
    {
      accessorKey: "customerName",
      header: t("ar.receipts.columns.customer"),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.customerCode}</div>
        </div>
      ),
    },
    {
      accessorKey: "receiptMethod",
      header: t("ar.receipts.columns.method"),
      cell: ({ row }) => {
        const method = row.getValue("receiptMethod") as ReceiptMethod
        return (
          <div>
            <Badge variant="outline">{receiptMethodLabels[method]}</Badge>
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
        <DataTableColumnHeader column={column} title={t("ar.receipts.columns.amount")} className="justify-end" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono font-medium">
          {formatCurrency(row.getValue("totalAmount"), row.original.currencyCode)}
        </div>
      ),
    },
    {
      accessorKey: "bankAccountCode",
      header: t("ar.receipts.columns.bankAccount"),
      cell: ({ row }) => (
        <span className="font-mono">{row.getValue("bankAccountCode")}</span>
      ),
    },
    {
      accessorKey: "allocationCount",
      header: t("ar.receipts.columns.invoices"),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("allocationCount")}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("ar.receipts.columns.status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as ArReceiptStatus
        return (
          <Badge variant={getStatusVariant(status)}>
            {arReceiptStatusLabels[status]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const receipt = row.original
        const isDraft = receipt.status === ArReceiptStatus.Draft
        const isPending = receipt.status === ArReceiptStatus.Pending
        const isApproved = receipt.status === ArReceiptStatus.Approved
        const isPosted = receipt.status === ArReceiptStatus.Posted

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/ar/receipts/${receipt.id}`)}>
                <Eye className="mr-2 size-4" />
                {t("common.view")}
              </DropdownMenuItem>

              {isDraft && (
                <>
                  <DropdownMenuItem onClick={() => navigate(`/ar/receipts/${receipt.id}/edit`)}>
                    <Pencil className="mr-2 size-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => approveReceipt.mutate({ id: receipt.id, data: {} })}
                  >
                    <Check className="mr-2 size-4" />
                    {t("ar.receipts.actions.approve")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setReceiptToDelete(receipt)
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
                  onClick={() => approveReceipt.mutate({ id: receipt.id, data: {} })}
                >
                  <Check className="mr-2 size-4" />
                  {t("ar.receipts.actions.approve")}
                </DropdownMenuItem>
              )}

              {isApproved && (
                <DropdownMenuItem
                  onClick={() => postReceipt.mutate({ id: receipt.id, data: {} })}
                >
                  <FileCheck className="mr-2 size-4" />
                  {t("ar.receipts.actions.post")}
                </DropdownMenuItem>
              )}

              {(isApproved || isPosted) && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setReceiptToVoid(receipt)
                    setVoidDialogOpen(true)
                  }}
                >
                  <Ban className="mr-2 size-4" />
                  {t("ar.receipts.actions.void")}
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
          <h1 className="text-2xl font-bold tracking-tight">{t("ar.receipts.title")}</h1>
          <p className="text-muted-foreground">{t("ar.receipts.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/ar/receipts/new")}>
          <Plus className="mr-2 size-4" />
          {t("ar.receipts.newReceipt")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.status?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              status: value === "all" ? undefined : Number(value) as ArReceiptStatus,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder={t("ar.receipts.filters.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("ar.receipts.filters.allStatuses")}</SelectItem>
            <SelectItem value={String(ArReceiptStatus.Draft)}>{arReceiptStatusLabels[ArReceiptStatus.Draft]}</SelectItem>
            <SelectItem value={String(ArReceiptStatus.Pending)}>{arReceiptStatusLabels[ArReceiptStatus.Pending]}</SelectItem>
            <SelectItem value={String(ArReceiptStatus.Approved)}>{arReceiptStatusLabels[ArReceiptStatus.Approved]}</SelectItem>
            <SelectItem value={String(ArReceiptStatus.Posted)}>{arReceiptStatusLabels[ArReceiptStatus.Posted]}</SelectItem>
            <SelectItem value={String(ArReceiptStatus.Void)}>{arReceiptStatusLabels[ArReceiptStatus.Void]}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.receiptMethod?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              receiptMethod: value === "all" ? undefined : Number(value) as ReceiptMethod,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("ar.receipts.filters.allMethods")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("ar.receipts.filters.allMethods")}</SelectItem>
            <SelectItem value={String(ReceiptMethod.Cash)}>{receiptMethodLabels[ReceiptMethod.Cash]}</SelectItem>
            <SelectItem value={String(ReceiptMethod.Check)}>{receiptMethodLabels[ReceiptMethod.Check]}</SelectItem>
            <SelectItem value={String(ReceiptMethod.BankTransfer)}>{receiptMethodLabels[ReceiptMethod.BankTransfer]}</SelectItem>
            <SelectItem value={String(ReceiptMethod.CreditCard)}>{receiptMethodLabels[ReceiptMethod.CreditCard]}</SelectItem>
            <SelectItem value={String(ReceiptMethod.Other)}>{receiptMethodLabels[ReceiptMethod.Other]}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">{t("ar.receipts.filters.dateFrom")}</Label>
          <Input
            type="date"
            className="w-40"
            value={params.dateFrom ?? ""}
            onChange={(e) => setParams((prev) => ({ ...prev, dateFrom: e.target.value || undefined, page: 1 }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">{t("ar.receipts.filters.dateTo")}</Label>
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
        searchKey="receiptNumber"
        searchPlaceholder={t("ar.receipts.filters.searchPlaceholder")}
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/ar/receipts/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ar.receipts.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("ar.receipts.delete.confirm", { receiptNumber: receiptToDelete?.receiptNumber })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteReceipt.isPending}
            >
              {deleteReceipt.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ar.receipts.void.title")}</DialogTitle>
            <DialogDescription>
              {t("ar.receipts.void.description", { receiptNumber: receiptToVoid?.receiptNumber })}
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
