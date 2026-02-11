import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal, ChevronRight } from "lucide-react"

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

import { useDepartments, useDeleteDepartment, useCheckDepartmentHasReferences } from "../hooks"
import type { DepartmentListDto, DepartmentQueryParams } from "../types"

export function DepartmentListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<DepartmentQueryParams>({
    page: 1,
    pageSize: 20,
    isActive: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentListDto | null>(null)

  const { data, isLoading } = useDepartments(params)
  const deleteDepartment = useDeleteDepartment()
  const { data: hasReferencesData } = useCheckDepartmentHasReferences(
    departmentToDelete?.id
  )

  const handleDelete = async () => {
    if (!departmentToDelete) return
    await deleteDepartment.mutateAsync(departmentToDelete.id)
    setDeleteDialogOpen(false)
    setDepartmentToDelete(null)
  }

  const getLevelIndent = (level: number) => {
    return "—".repeat(level - 1)
  }

  const columns: ColumnDef<DepartmentListDto>[] = [
    {
      accessorKey: "departmentCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("departmentCode")}</span>
      ),
    },
    {
      accessorKey: "departmentName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const level = row.original.level
        const indent = getLevelIndent(level)
        return (
          <span className="flex items-center gap-1">
            {level > 1 && <span className="text-muted-foreground">{indent}</span>}
            {row.getValue("departmentName")}
          </span>
        )
      },
    },
    {
      accessorKey: "parentDepartmentName",
      header: "Parent",
      cell: ({ row }) => {
        const parent = row.getValue("parentDepartmentName") as string | null
        return parent ? (
          <span className="flex items-center gap-1 text-muted-foreground">
            <ChevronRight className="size-3" />
            {parent}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => {
        const level = row.getValue("level") as number
        return (
          <Badge variant="outline" className="font-mono">
            L{level}
          </Badge>
        )
      },
    },
    {
      accessorKey: "costCenterCode",
      header: "Cost Center",
      cell: ({ row }) => {
        const code = row.getValue("costCenterCode") as string | null
        return code ? (
          <span className="font-mono text-sm">{code}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
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
        const department = row.original
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
                onClick={() => navigate(`/configuration/departments/${department.id}/edit`)}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setDepartmentToDelete(department)
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
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage organizational departments and cost centers
          </p>
        </div>
        <Button onClick={() => navigate("/configuration/departments/new")}>
          <Plus className="mr-2 size-4" />
          New Department
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

        <Select
          value={params.level?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              level: value === "all" ? undefined : parseInt(value),
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="1">Level 1</SelectItem>
            <SelectItem value="2">Level 2</SelectItem>
            <SelectItem value="3">Level 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        searchKey="departmentCode"
        searchPlaceholder="Search by code or name..."
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/configuration/departments/${row.id}/edit`)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete department{" "}
              <strong>{departmentToDelete?.departmentCode}</strong> - {departmentToDelete?.departmentName}?
              {hasReferencesData?.hasReferences && (
                <span className="block mt-2 text-amber-600">
                  This department has child departments or associated transactions and will be deactivated instead
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
              disabled={deleteDepartment.isPending}
            >
              {deleteDepartment.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
