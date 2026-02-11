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

import { useCustomers, useDeleteCustomer } from "../hooks"
import type { CustomerListDto, CustomerQueryParams } from "../types"

export function CustomerListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useState<CustomerQueryParams>({
    page: 1,
    pageSize: 20,
    isActive: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<CustomerListDto | null>(null)

  const { data, isLoading } = useCustomers(params)
  const deleteCustomer = useDeleteCustomer()

  const handleDelete = async () => {
    if (!customerToDelete) return
    await deleteCustomer.mutateAsync(customerToDelete.id)
    setDeleteDialogOpen(false)
    setCustomerToDelete(null)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const columns: ColumnDef<CustomerListDto>[] = [
    {
      accessorKey: "customerCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("ar.customers.columns.code")} />,
      cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("customerCode")}</span>,
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("ar.customers.columns.name")} />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("customerName")}</div>
          {row.original.customerNameLocal && (
            <div className="text-sm text-muted-foreground">{row.original.customerNameLocal}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "taxId",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("ar.customers.columns.taxId")} />,
      cell: ({ row }) => row.getValue("taxId") || "-",
    },
    {
      accessorKey: "phone",
      header: t("ar.customers.columns.phone"),
      cell: ({ row }) => row.getValue("phone") || "-",
    },
    {
      accessorKey: "email",
      header: t("ar.customers.columns.email"),
      cell: ({ row }) => row.getValue("email") || "-",
    },
    {
      accessorKey: "currentBalance",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("ar.customers.columns.balance")} />,
      cell: ({ row }) => {
        const balance = row.getValue("currentBalance") as number
        const currency = row.original.currencyCode
        return (
          <span className={balance > 0 ? "text-green-600 font-medium" : ""}>
            {formatCurrency(balance, currency)}
          </span>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: t("ar.customers.columns.status"),
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
        const customer = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/ar/customers/${customer.id}`)}>
                <Eye className="mr-2 size-4" />
                {t("common.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/ar/customers/${customer.id}/edit`)}>
                <Pencil className="mr-2 size-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setCustomerToDelete(customer)
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
          <h1 className="text-2xl font-bold tracking-tight">{t("ar.customers.title")}</h1>
          <p className="text-muted-foreground">{t("ar.customers.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/ar/customers/new")}>
          <Plus className="mr-2 size-4" />
          {t("ar.customers.newCustomer")}
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
            <SelectValue placeholder={t("ar.customers.filters.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("ar.customers.filters.allStatus")}</SelectItem>
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
        searchKey="customerName"
        searchPlaceholder={t("ar.customers.filters.searchPlaceholder")}
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/ar/customers/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ar.customers.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("ar.customers.delete.confirm", { customerCode: customerToDelete?.customerCode, customerName: customerToDelete?.customerName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteCustomer.isPending}>
              {deleteCustomer.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
