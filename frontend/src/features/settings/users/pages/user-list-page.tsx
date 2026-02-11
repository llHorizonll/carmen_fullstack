import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Users } from "lucide-react"
import { format } from "date-fns"

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

import { useUsers } from "../hooks"
import type { UserListDto, UserQueryParams } from "../types"

export function UserListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<UserQueryParams>({
    page: 1,
    pageSize: 20,
  })

  const { data, isLoading } = useUsers(params)

  const handleStatusFilterChange = (value: string) => {
    if (value === "all") {
      setParams((prev) => ({ ...prev, isActive: undefined, page: 1 }))
    } else {
      setParams((prev) => ({ ...prev, isActive: value === "active", page: 1 }))
    }
  }

  const columns: ColumnDef<UserListDto>[] = [
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("email")}</span>
        </div>
      ),
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => row.getValue("fullName") || "-",
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "roleCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Roles" />,
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("roleCount")}</Badge>
      ),
    },
    {
      accessorKey: "lastLoginAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Login" />,
      cell: ({ row }) => {
        const lastLoginAt = row.getValue("lastLoginAt") as string | null
        return lastLoginAt
          ? format(new Date(lastLoginAt), "MMM d, yyyy HH:mm")
          : "Never"
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string
        return format(new Date(createdAt), "MMM d, yyyy")
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/settings/users/${user.id}`)}>
                View Details
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
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage users and their role assignments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.isActive === undefined ? "all" : params.isActive ? "active" : "inactive"}
          onValueChange={handleStatusFilterChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
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
        searchKey="email"
        searchPlaceholder="Search users..."
        showPagination
        pageSize={params.pageSize}
        onRowClick={(row) => navigate(`/settings/users/${row.id}`)}
      />
    </div>
  )
}
