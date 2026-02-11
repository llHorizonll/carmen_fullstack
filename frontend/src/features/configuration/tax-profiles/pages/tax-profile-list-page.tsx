import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import { useTaxProfiles, useDeleteTaxProfile, useCheckTaxProfileHasTransactions } from "../hooks"
import {
  TaxType,
  taxTypeLabels,
  type TaxProfileListDto,
  type TaxProfileQueryParams,
} from "../types"

export function TaxProfileListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<TaxProfileQueryParams>({
    page: 1,
    pageSize: 20,
    isActive: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taxProfileToDelete, setTaxProfileToDelete] = useState<TaxProfileListDto | null>(null)

  const { data, isLoading } = useTaxProfiles(params)
  const deleteTaxProfile = useDeleteTaxProfile()
  const { data: hasTransactionsData } = useCheckTaxProfileHasTransactions(
    taxProfileToDelete?.id
  )

  const handleDelete = async () => {
    if (!taxProfileToDelete) return
    await deleteTaxProfile.mutateAsync(taxProfileToDelete.id)
    setDeleteDialogOpen(false)
    setTaxProfileToDelete(null)
  }

  const columns: ColumnDef<TaxProfileListDto>[] = [
    {
      accessorKey: "taxCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("taxCode")}</span>
      ),
    },
    {
      accessorKey: "taxName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => row.getValue("taxName"),
    },
    {
      accessorKey: "taxType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const type = row.getValue("taxType") as TaxType
        return <Badge variant="outline">{taxTypeLabels[type]}</Badge>
      },
    },
    {
      accessorKey: "taxRate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rate" />,
      cell: ({ row }) => {
        const rate = row.getValue("taxRate") as number
        return <span className="font-mono">{rate.toFixed(2)}%</span>
      },
    },
    {
      accessorKey: "isDefault",
      header: "Default",
      cell: ({ row }) =>
        row.getValue("isDefault") ? (
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
        ) : null,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("isActive") ? (
          <Badge variant="default">Active</Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const taxProfile = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/configuration/tax-profiles/${taxProfile.id}/edit`)}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setTaxProfileToDelete(taxProfile)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
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
          <h1 className="text-2xl font-bold tracking-tight">Tax Profiles</h1>
          <p className="text-muted-foreground">
            Manage tax configurations for invoices and transactions
          </p>
        </div>
        <Button onClick={() => navigate("/configuration/tax-profiles/new")}>
          <Plus className="mr-2 size-4" />
          New Tax Profile
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.taxType?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              taxType: value === "all" ? undefined : (Number(value) as TaxType),
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(taxTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        searchKey="taxCode"
        searchPlaceholder="Search by code or name..."
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/configuration/tax-profiles/${row.id}/edit`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tax Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete tax profile{" "}
              <strong>{taxProfileToDelete?.taxCode}</strong> - {taxProfileToDelete?.taxName}?
              {hasTransactionsData?.hasTransactions && (
                <span className="block mt-2 text-amber-600">
                  This tax profile has associated transactions and will be deactivated instead
                  of deleted.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTaxProfile.isPending}
            >
              {deleteTaxProfile.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
