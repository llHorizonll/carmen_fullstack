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

import { useAssets, useDeleteAsset } from "../hooks"
import type { AssetListDto, AssetQueryParams, AssetStatus } from "../types"
import { assetStatusLabels } from "../types"

export function AssetListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useState<AssetQueryParams>({
    page: 1,
    pageSize: 20,
    status: 0, // Active
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<AssetListDto | null>(null)

  const { data, isLoading } = useAssets(params)
  const deleteAsset = useDeleteAsset()

  const handleDelete = async () => {
    if (!assetToDelete) return
    await deleteAsset.mutateAsync(assetToDelete.id)
    setDeleteDialogOpen(false)
    setAssetToDelete(null)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusVariant = (status: AssetStatus) => {
    switch (status) {
      case 0: return "default" // Active
      case 1: return "secondary" // Disposed
      case 3: return "outline" // Sold
      case 4: return "destructive" // Written Off
      default: return "secondary"
    }
  }

  const columns: ColumnDef<AssetListDto>[] = [
    {
      accessorKey: "assetCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("assetCode")}</span>,
    },
    {
      accessorKey: "assetName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-medium">{row.getValue("assetName")}</span>,
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.categoryCode} - {row.getValue("categoryName")}
        </span>
      ),
    },
    {
      accessorKey: "acquisitionDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Acquired" />,
      cell: ({ row }) => formatDate(row.getValue("acquisitionDate")),
    },
    {
      accessorKey: "acquisitionCost",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cost" />,
      cell: ({ row }) => formatCurrency(row.getValue("acquisitionCost"), row.original.currencyCode),
    },
    {
      accessorKey: "currentValue",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Current Value" />,
      cell: ({ row }) => formatCurrency(row.getValue("currentValue"), row.original.currencyCode),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as AssetStatus
        return (
          <Badge variant={getStatusVariant(status)}>
            {assetStatusLabels[status]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const asset = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/assets/${asset.id}`)}>
                <Eye className="mr-2 size-4" />
                {t("common.view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/assets/${asset.id}/edit`)}
                disabled={asset.status !== 0}
              >
                <Pencil className="mr-2 size-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                disabled={asset.status !== 0}
                onClick={() => {
                  setAssetToDelete(asset)
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
          <h1 className="text-2xl font-bold tracking-tight">Fixed Assets</h1>
          <p className="text-muted-foreground">Manage company assets and track depreciation</p>
        </div>
        <Button onClick={() => navigate("/assets/new")}>
          <Plus className="mr-2 size-4" />
          New Asset
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.status === undefined ? "all" : String(params.status)}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              status: value === "all" ? undefined : (Number(value) as AssetStatus),
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(assetStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        searchKey="assetName"
        searchPlaceholder="Search assets..."
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/assets/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete asset "{assetToDelete?.assetCode} - {assetToDelete?.assetName}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteAsset.isPending}>
              {deleteAsset.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
