import { useState } from "react"
import { ChevronDown, ChevronRight, Minus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PermissionGroupDto } from "../types"

interface PermissionMatrixProps {
  groups: PermissionGroupDto[]
  selectedPermissionIds: string[]
  onChange: (permissionIds: string[]) => void
  disabled?: boolean
}

export function PermissionMatrix({
  groups,
  selectedPermissionIds,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(groups.map((g) => g.module))
  )

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(module)) {
      newExpanded.delete(module)
    } else {
      newExpanded.add(module)
    }
    setExpandedModules(newExpanded)
  }

  const isPermissionSelected = (permissionId: string) => {
    return selectedPermissionIds.includes(permissionId)
  }

  const togglePermission = (permissionId: string) => {
    if (disabled) return
    if (selectedPermissionIds.includes(permissionId)) {
      onChange(selectedPermissionIds.filter((id) => id !== permissionId))
    } else {
      onChange([...selectedPermissionIds, permissionId])
    }
  }

  const getModuleSelectionState = (group: PermissionGroupDto) => {
    const modulePermissionIds = group.permissions.map((p) => p.id)
    const selectedCount = modulePermissionIds.filter((id) =>
      selectedPermissionIds.includes(id)
    ).length

    if (selectedCount === 0) return "none"
    if (selectedCount === modulePermissionIds.length) return "all"
    return "partial"
  }

  const toggleAllModulePermissions = (group: PermissionGroupDto) => {
    if (disabled) return
    const modulePermissionIds = group.permissions.map((p) => p.id)
    const state = getModuleSelectionState(group)

    if (state === "all") {
      // Deselect all permissions in this module
      onChange(
        selectedPermissionIds.filter((id) => !modulePermissionIds.includes(id))
      )
    } else {
      // Select all permissions in this module
      const newIds = new Set([...selectedPermissionIds, ...modulePermissionIds])
      onChange(Array.from(newIds))
    }
  }

  const selectAll = () => {
    if (disabled) return
    const allIds = groups.flatMap((g) => g.permissions.map((p) => p.id))
    onChange(allIds)
  }

  const deselectAll = () => {
    if (disabled) return
    onChange([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {selectedPermissionIds.length} permissions selected
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={disabled}
          >
            Select All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={deselectAll}
            disabled={disabled}
          >
            Deselect All
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        {groups.map((group) => {
          const isExpanded = expandedModules.has(group.module)
          const selectionState = getModuleSelectionState(group)

          return (
            <div key={group.module} className="border-b last:border-b-0">
              {/* Module Header */}
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50",
                  isExpanded && "bg-muted/30"
                )}
                onClick={() => toggleModule(group.module)}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </Button>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectionState === "all"}
                    onCheckedChange={() => toggleAllModulePermissions(group)}
                    disabled={disabled}
                    className={cn(
                      selectionState === "partial" && "data-[state=checked]:bg-muted"
                    )}
                  />
                  {selectionState === "partial" && (
                    <Minus className="size-3 text-muted-foreground absolute" />
                  )}
                </div>

                <span className="font-medium">{group.module}</span>
                <span className="text-sm text-muted-foreground">
                  ({group.permissions.length} permissions)
                </span>
              </div>

              {/* Permissions List */}
              {isExpanded && (
                <div className="border-t bg-muted/10 px-4 py-2">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className={cn(
                          "flex items-center gap-2 rounded-md p-2 cursor-pointer hover:bg-muted/50",
                          disabled && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <Checkbox
                          checked={isPermissionSelected(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                          disabled={disabled}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {permission.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {permission.code}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
