import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil, Shield, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useRole, usePermissionsGrouped } from "../hooks"
import { PermissionMatrix } from "../components/permission-matrix"

export function RoleViewPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: role, isLoading: isLoadingRole } = useRole(id)
  const { data: permissionGroups, isLoading: isLoadingPermissions } =
    usePermissionsGrouped()

  const isLoading = isLoadingRole || isLoadingPermissions

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Role not found</p>
        <Button variant="link" onClick={() => navigate("/settings/roles")}>
          Back to Roles
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{role.name}</h1>
              {role.isSystem && <Badge variant="secondary">System</Badge>}
            </div>
            <p className="text-muted-foreground">
              {role.description || "No description"}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/settings/roles/${id}/edit`)}>
          <Pencil className="mr-2 size-4" />
          Edit Role
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Shield className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role.permissions.length}</div>
            <p className="text-xs text-muted-foreground">
              granted to this role
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role.userCount}</div>
            <p className="text-xs text-muted-foreground">
              assigned to this role
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Permissions granted to users with this role
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissionGroups ? (
            <PermissionMatrix
              groups={permissionGroups}
              selectedPermissionIds={role.permissions.map((p) => p.id)}
              onChange={() => {}}
              disabled
            />
          ) : (
            <Skeleton className="h-64 w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
