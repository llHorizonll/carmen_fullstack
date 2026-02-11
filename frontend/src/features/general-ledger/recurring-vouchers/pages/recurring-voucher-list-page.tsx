import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Plus,
  RotateCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Play,
  Pause,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  useRecurringVouchers,
  useDeleteRecurringVoucher,
  useActivateRecurringVoucher,
  useDeactivateRecurringVoucher,
} from "../hooks"
import { RecurringFrequencyLabels } from "../types"
import type { RecurringFrequency } from "../types"

export function RecurringVoucherListPage() {
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, refetch } = useRecurringVouchers({
    search: search || undefined,
    isActive: activeFilter === "all" ? undefined : activeFilter === "active",
    page,
    pageSize: 20,
  })

  const deleteMutation = useDeleteRecurringVoucher()
  const activateMutation = useActivateRecurringVoucher()
  const deactivateMutation = useDeactivateRecurringVoucher()

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recurring Vouchers</h1>
          <p className="text-muted-foreground">
            Manage recurring journal voucher templates for automatic JV creation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RotateCw className="size-4" />
          </Button>
          <Button asChild>
            <Link to="/gl/recurring-vouchers/new">
              <Plus className="mr-2 size-4" />
              New Template
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search recurring vouchers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />
        <Select
          value={activeFilter}
          onValueChange={(v) => {
            setActiveFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Execution</TableHead>
              <TableHead>Last Execution</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Runs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data || data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No recurring vouchers found.
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((rv) => (
                <TableRow key={rv.id}>
                  <TableCell>
                    <div>
                      <Link
                        to={`/gl/recurring-vouchers/${rv.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {rv.name}
                      </Link>
                      {rv.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                          {rv.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {RecurringFrequencyLabels[rv.frequency as RecurringFrequency]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {formatDate(rv.nextExecutionDate)}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(rv.lastExecutionDate)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(rv.totalDebit, rv.currencyCode)}
                  </TableCell>
                  <TableCell className="text-center">{rv.executionCount}</TableCell>
                  <TableCell>
                    {rv.isActive ? (
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/gl/recurring-vouchers/${rv.id}/edit`}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {rv.isActive ? (
                          <DropdownMenuItem
                            onClick={() => deactivateMutation.mutate(rv.id)}
                          >
                            <Pause className="mr-2 size-4" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => activateMutation.mutate(rv.id)}
                          >
                            <Play className="mr-2 size-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(rv.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, data.totalCount)} of{" "}
            {data.totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recurring Voucher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recurring voucher template? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
