import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useVendors, useDeleteVendor } from "../hooks"
import type { VendorListDto, VendorQueryParams } from "../types"

export function VendorListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useState<VendorQueryParams>({
    page: 1,
    pageSize: 20,
    isActive: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState<VendorListDto | null>(null)

  const { data, isLoading } = useVendors(params)
  const deleteVendor = useDeleteVendor()

  const handleDelete = async () => {
    if (!vendorToDelete) return
    await deleteVendor.mutateAsync(vendorToDelete.id)
    setDeleteDialogOpen(false)
    setVendorToDelete(null)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const columns: ColumnDef<VendorListDto>[] = [
    {
      accessorKey: "vendorCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("ap.vendors.columns.code")} />,
      cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("vendorCode")}</span>,
    },
    {
      accessorKey: "vendorName",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("ap.vendors.columns.name")} />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("vendorName")}</div>
          {row.original.vendorNameLocal && (
            <div className="text-sm text-muted-foreground">{row.original.vendorNameLocal}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "taxId",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("ap.vendors.columns.taxId")} />,
      cell: ({ row }) => row.getValue("taxId") || "-",
    },
    {
      accessorKey: "phone",
      header: t("ap.vendors.columns.phone"),
      cell: ({ row }) => row.getValue("phone") || "-",
    },
    {
      accessorKey: "email",
      header: t("ap.vendors.columns.email"),
      cell: ({ row }) => row.getValue("email") || "-",
    },
    {
      accessorKey: "currentBalance",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("ap.vendors.columns.balance")} />,
      cell: ({ row }) => {
        const balance = row.getValue("currentBalance") as number
        const currency = row.original.currencyCode
        return (
          <span className={balance > 0 ? "text-destructive font-medium" : ""}>
            {formatCurrency(balance, currency)}
          </span>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: t("ap.vendors.columns.status"),
      cell: ({ row }) =>
        row.getValue("isActive") ? (
          <Badge variant="default">{t("common.active")}</Badge>
        ) : (
          <Badge variant="destructive">{t("common.inactive")}</Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vendor = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/ap/vendors/${vendor.id}`)}>
                <Eye className="mr-2 size-4" />
                {t("common.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/ap/vendors/${vendor.id}/edit`)}>
                <Pencil className="mr-2 size-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setVendorToDelete(vendor)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 size-4" />
                {t("common.delete")}
              </DropdownMenuItem>
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
          <h1 className="text-2xl font-bold tracking-tight">{t("ap.vendors.title")}</h1>
          <p className="text-muted-foreground">{t("ap.vendors.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/ap/vendors/new")}>
          <Plus className="mr-2 size-4" />
          {t("ap.vendors.newVendor")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.isActive === undefined ? "all" : params.isActive ? "active" : "inactive"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              isActive: value === "all" ? undefined : value === "active",
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder={t("ap.vendors.filters.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("ap.vendors.filters.allStatus")}</SelectItem>
            <SelectItem value="active">{t("common.active")}</SelectItem>
            <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        searchKey="vendorName"
        searchPlaceholder={t("ap.vendors.filters.searchPlaceholder")}
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/ap/vendors/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ap.vendors.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("ap.vendors.delete.confirm", { vendorCode: vendorToDelete?.vendorCode, vendorName: vendorToDelete?.vendorName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteVendor.isPending}>
              {deleteVendor.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
