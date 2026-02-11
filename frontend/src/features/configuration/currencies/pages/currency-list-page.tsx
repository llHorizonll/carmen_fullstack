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

import { useCurrencies, useDeleteCurrency, useCheckCurrencyHasTransactions } from "../hooks"
import type { CurrencyListDto, CurrencyQueryParams } from "../types"

export function CurrencyListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<CurrencyQueryParams>({
    page: 1,
    pageSize: 20,
    isActive: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currencyToDelete, setCurrencyToDelete] = useState<CurrencyListDto | null>(null)

  const { data, isLoading } = useCurrencies(params)
  const deleteCurrency = useDeleteCurrency()
  const { data: hasTransactionsData } = useCheckCurrencyHasTransactions(
    currencyToDelete?.id
  )

  const handleDelete = async () => {
    if (!currencyToDelete) return
    await deleteCurrency.mutateAsync(currencyToDelete.id)
    setDeleteDialogOpen(false)
    setCurrencyToDelete(null)
  }

  const columns: ColumnDef<CurrencyListDto>[] = [
    {
      accessorKey: "currencyCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("currencyCode")}</span>
      ),
    },
    {
      accessorKey: "currencyName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => row.getValue("currencyName"),
    },
    {
      accessorKey: "symbol",
      header: "Symbol",
      cell: ({ row }) => (
        <span className="font-mono">{row.getValue("symbol")}</span>
      ),
    },
    {
      accessorKey: "decimalPlaces",
      header: "Decimals",
      cell: ({ row }) => row.getValue("decimalPlaces"),
    },
    {
      accessorKey: "exchangeRate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rate" />,
      cell: ({ row }) => {
        const rate = row.getValue("exchangeRate") as number
        return <span className="font-mono">{rate.toFixed(4)}</span>
      },
    },
    {
      accessorKey: "isBaseCurrency",
      header: "Base",
      cell: ({ row }) =>
        row.getValue("isBaseCurrency") ? (
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
        const currency = row.original
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
                onClick={() => navigate(`/configuration/currencies/${currency.id}/edit`)}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setCurrencyToDelete(currency)
                  setDeleteDialogOpen(true)
                }}
                disabled={currency.isBaseCurrency}
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
          <h1 className="text-2xl font-bold tracking-tight">Currencies</h1>
          <p className="text-muted-foreground">
            Manage currencies and exchange rates for multi-currency support
          </p>
        </div>
        <Button onClick={() => navigate("/configuration/currencies/new")}>
          <Plus className="mr-2 size-4" />
          New Currency
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
        searchKey="currencyCode"
        searchPlaceholder="Search by code or name..."
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/configuration/currencies/${row.id}/edit`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Currency</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete currency{" "}
              <strong>{currencyToDelete?.currencyCode}</strong> - {currencyToDelete?.currencyName}?
              {hasTransactionsData?.hasTransactions && (
                <span className="block mt-2 text-amber-600">
                  This currency has associated transactions and will be deactivated instead
                  of deleted.
                </span>
              )}
              {currencyToDelete?.isBaseCurrency && (
                <span className="block mt-2 text-destructive">
                  Cannot delete the base currency. Set another currency as base first.
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
              disabled={deleteCurrency.isPending || currencyToDelete?.isBaseCurrency}
            >
              {deleteCurrency.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
