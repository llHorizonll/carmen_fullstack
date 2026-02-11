import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react"

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

import { useAssetCategories, useDeleteAssetCategory } from "../hooks"
import type { AssetCategoryListDto, AssetCategoryQueryParams } from "../types"
import { depreciationMethodLabels, DepreciationMethod } from "../../assets/types"

export function AssetCategoryListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useState<AssetCategoryQueryParams>({
    page: 1,
    pageSize: 20,
    isActive: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<AssetCategoryListDto | null>(null)

  const { data, isLoading } = useAssetCategories(params)
  const deleteCategory = useDeleteAssetCategory()

  const handleDelete = async () => {
    if (!categoryToDelete) return
    await deleteCategory.mutateAsync(categoryToDelete.id)
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const columns: ColumnDef<AssetCategoryListDto>[] = [
    {
      accessorKey: "categoryCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("categoryCode")}</span>,
    },
    {
      accessorKey: "categoryName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-medium">{row.getValue("categoryName")}</span>,
    },
    {
      accessorKey: "defaultUsefulLifeMonths",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Useful Life" />,
      cell: ({ row }) => {
        const months = row.getValue("defaultUsefulLifeMonths") as number
        const years = Math.floor(months / 12)
        const remainingMonths = months % 12
        return years > 0
          ? `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
          : `${months} month${months > 1 ? 's' : ''}`
      },
    },
    {
      accessorKey: "defaultDepreciationMethod",
      header: "Method",
      cell: ({ row }) => {
        const method = row.getValue("defaultDepreciationMethod") as DepreciationMethod
        return depreciationMethodLabels[method] || method
      },
    },
    {
      accessorKey: "defaultSalvagePercent",
      header: "Salvage %",
      cell: ({ row }) => `${row.getValue("defaultSalvagePercent")}%`,
    },
    {
      accessorKey: "assetCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assets" />,
      cell: ({ row }) => row.getValue("assetCount"),
    },
    {
      accessorKey: "isActive",
      header: "Status",
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
        const category = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/assets/categories/${category.id}/edit`)}>
                <Pencil className="mr-2 size-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                disabled={category.assetCount > 0}
                onClick={() => {
                  setCategoryToDelete(category)
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
          <h1 className="text-2xl font-bold tracking-tight">Asset Categories</h1>
          <p className="text-muted-foreground">Manage asset classifications and default depreciation settings</p>
        </div>
        <Button onClick={() => navigate("/assets/categories/new")}>
          <Plus className="mr-2 size-4" />
          New Category
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
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
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
        searchKey="categoryName"
        searchPlaceholder="Search categories..."
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/assets/categories/${row.id}/edit`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete category "{categoryToDelete?.categoryCode} - {categoryToDelete?.categoryName}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteCategory.isPending}>
              {deleteCategory.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
