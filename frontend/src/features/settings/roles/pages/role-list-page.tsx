import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRoles, useDeleteRole } from "../hooks"
import { DeleteRoleDialog } from "../components/delete-role-dialog"
import type { RoleListDto, RoleQueryParams } from "../types"

export function RoleListPage() {
  const navigate = useNavigate()
  const [params] = useState<RoleQueryParams>({
    page: 1,
    pageSize: 20,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<RoleListDto | null>(null)

  const { data, isLoading } = useRoles(params)
  const deleteRole = useDeleteRole()

  const handleDelete = async () => {
    if (!roleToDelete) return
    await deleteRole.mutateAsync(roleToDelete.id)
    setDeleteDialogOpen(false)
    setRoleToDelete(null)
  }

  const columns: ColumnDef<RoleListDto>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role Name" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
          {row.original.isSystem && (
            <Badge variant="secondary">System</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("description") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "permissionCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Permissions" />,
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("permissionCount")}</Badge>
      ),
    },
    {
      accessorKey: "userCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Users" />,
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("userCount")}</Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const role = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/settings/roles/${role.id}/edit`)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                disabled={role.isSystem}
                onClick={() => {
                  setRoleToDelete(role)
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
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">
            Manage roles and their permissions
          </p>
        </div>
        <Button onClick={() => navigate("/settings/roles/new")}>
          <Plus className="mr-2 size-4" />
          New Role
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search roles..."
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/settings/roles/${row.id}`)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteRoleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={roleToDelete}
        onConfirm={handleDelete}
        isPending={deleteRole.isPending}
      />
    </div>
  )
}
