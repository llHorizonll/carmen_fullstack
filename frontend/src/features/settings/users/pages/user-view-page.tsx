import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Clock, Mail, Phone, Globe, Shield } from "lucide-react"
import { format } from "date-fns"

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

import { useUser, useUpdateUserRoles } from "../hooks"
import { useRoleLookup } from "../../roles/hooks"
import { UserRoleSelector } from "../components/user-role-selector"

export function UserViewPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: user, isLoading: isLoadingUser } = useUser(id)
  const { data: allRoles, isLoading: isLoadingRoles } = useRoleLookup()
  const updateUserRoles = useUpdateUserRoles()

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize selected roles when user data loads
  useEffect(() => {
    if (user) {
      setSelectedRoleIds(user.roles.map((r) => r.id))
      setHasChanges(false)
    }
  }, [user])

  const handleRoleChange = (roleIds: string[]) => {
    setSelectedRoleIds(roleIds)
    // Check if there are changes compared to original
    const originalIds = user?.roles.map((r) => r.id) || []
    const hasChange =
      roleIds.length !== originalIds.length ||
      roleIds.some((id) => !originalIds.includes(id))
    setHasChanges(hasChange)
  }

  const handleSaveRoles = async () => {
    if (!id) return
    await updateUserRoles.mutateAsync({
      userId: id,
      data: { roleIds: selectedRoleIds },
    })
    setHasChanges(false)
  }

  const isLoading = isLoadingUser || isLoadingRoles

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">User not found</p>
        <Button variant="link" onClick={() => navigate("/settings/users")}>
          Back to Users
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
              <h1 className="text-2xl font-bold tracking-tight">{user.fullName || user.email}</h1>
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Shield className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.roles.length}</div>
            <p className="text-xs text-muted-foreground">
              assigned to this user
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.lastLoginAt
                ? format(new Date(user.lastLoginAt), "MMM d, yyyy")
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.lastLoginAt
                ? format(new Date(user.lastLoginAt), "HH:mm")
                : "User has not logged in yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Details */}
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Basic information about this user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {user.phone || "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Preferred Language</p>
                <p className="text-sm text-muted-foreground">
                  {user.preferredLanguage === "en"
                    ? "English"
                    : user.preferredLanguage === "th"
                    ? "Thai"
                    : user.preferredLanguage === "vi"
                    ? "Vietnamese"
                    : user.preferredLanguage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Management */}
      <Card>
        <CardHeader>
          <CardTitle>Role Assignment</CardTitle>
          <CardDescription>
            Manage the roles assigned to this user. Roles determine what
            permissions the user has in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UserRoleSelector
            roles={allRoles || []}
            selectedRoleIds={selectedRoleIds}
            onChange={handleRoleChange}
          />
          {hasChanges && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRoleIds(user.roles.map((r) => r.id))
                  setHasChanges(false)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveRoles}
                disabled={updateUserRoles.isPending}
              >
                {updateUserRoles.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
