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

import { usePaymentTerms, useDeletePaymentTerm, useCheckPaymentTermHasTransactions } from "../hooks"
import type { PaymentTermListDto, PaymentTermQueryParams } from "../types"

export function PaymentTermListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<PaymentTermQueryParams>({
    page: 1,
    pageSize: 20,
    isActive: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentTermToDelete, setPaymentTermToDelete] = useState<PaymentTermListDto | null>(null)

  const { data, isLoading } = usePaymentTerms(params)
  const deletePaymentTerm = useDeletePaymentTerm()
  const { data: hasTransactionsData } = useCheckPaymentTermHasTransactions(
    paymentTermToDelete?.id
  )

  const handleDelete = async () => {
    if (!paymentTermToDelete) return
    await deletePaymentTerm.mutateAsync(paymentTermToDelete.id)
    setDeleteDialogOpen(false)
    setPaymentTermToDelete(null)
  }

  const formatPercent = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "-"
    return `${value.toFixed(2)}%`
  }

  const columns: ColumnDef<PaymentTermListDto>[] = [
    {
      accessorKey: "termCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("termCode")}</span>
      ),
    },
    {
      accessorKey: "termName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => row.getValue("termName"),
    },
    {
      accessorKey: "dueDays",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Due Days" />,
      cell: ({ row }) => {
        const days = row.getValue("dueDays") as number
        return <span className="font-mono">{days} days</span>
      },
    },
    {
      accessorKey: "discountPercent",
      header: "Discount",
      cell: ({ row }) => {
        const percent = row.getValue("discountPercent") as number | null
        return <span className="font-mono">{formatPercent(percent)}</span>
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
        const paymentTerm = row.original
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
                onClick={() => navigate(`/configuration/payment-terms/${paymentTerm.id}/edit`)}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setPaymentTermToDelete(paymentTerm)
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
          <h1 className="text-2xl font-bold tracking-tight">Payment Terms</h1>
          <p className="text-muted-foreground">
            Manage payment terms for invoices and transactions
          </p>
        </div>
        <Button onClick={() => navigate("/configuration/payment-terms/new")}>
          <Plus className="mr-2 size-4" />
          New Payment Term
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
        searchKey="termCode"
        searchPlaceholder="Search by code or name..."
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/configuration/payment-terms/${row.id}/edit`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Term</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete payment term{" "}
              <strong>{paymentTermToDelete?.termCode}</strong> - {paymentTermToDelete?.termName}?
              {hasTransactionsData?.hasTransactions && (
                <span className="block mt-2 text-amber-600">
                  This payment term has associated transactions and will be deactivated instead
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
              disabled={deletePaymentTerm.isPending}
            >
              {deletePaymentTerm.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
