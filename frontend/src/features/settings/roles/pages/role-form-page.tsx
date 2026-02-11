import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import {
  useRole,
  useCreateRole,
  useUpdateRole,
  useUpdateRolePermissions,
  usePermissionsGrouped,
} from "../hooks"
import { PermissionMatrix } from "../components/permission-matrix"

const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required").max(100),
  description: z.string().max(500).optional(),
  permissionIds: z.array(z.string()),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

export function RoleFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { data: role, isLoading: isLoadingRole } = useRole(id)
  const { data: permissionGroups, isLoading: isLoadingPermissions } =
    usePermissionsGrouped()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const updatePermissions = useUpdateRolePermissions()

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  })

  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        description: role.description || "",
        permissionIds: role.permissions.map((p) => p.id),
      })
    }
  }, [role, form])

  const onSubmit = async (data: RoleFormValues) => {
    try {
      if (isEditing) {
        // Update role name/description
        await updateRole.mutateAsync({
          id: id!,
          data: {
            name: data.name,
            description: data.description,
          },
        })
        // Update permissions separately
        await updatePermissions.mutateAsync({
          id: id!,
          data: {
            permissionIds: data.permissionIds,
          },
        })
      } else {
        await createRole.mutateAsync({
          name: data.name,
          description: data.description,
          permissionIds: data.permissionIds,
        })
      }
      navigate("/settings/roles")
    } catch {
      // Error is handled by the mutation hooks
    }
  }

  const isLoading = isLoadingRole || isLoadingPermissions
  const isSaving =
    createRole.isPending || updateRole.isPending || updatePermissions.isPending

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Role" : "New Role"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update role settings and permissions"
              : "Create a new role with permissions"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Details */}
          <Card>
            <CardHeader>
              <CardTitle>Role Details</CardTitle>
              <CardDescription>
                Enter the basic information for this role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Accountant, Manager"
                        disabled={role?.isSystem}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose of this role..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description to help identify this role's purpose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Select the permissions to grant to this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="permissionIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {permissionGroups ? (
                        <PermissionMatrix
                          groups={permissionGroups}
                          selectedPermissionIds={field.value}
                          onChange={field.onChange}
                        />
                      ) : (
                        <Skeleton className="h-64 w-full" />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Role"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
