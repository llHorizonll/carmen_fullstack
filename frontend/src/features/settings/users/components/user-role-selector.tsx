import { ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { RoleLookupDto } from "../../roles/types"

interface UserRoleSelectorProps {
  roles: RoleLookupDto[]
  selectedRoleIds: string[]
  onChange: (roleIds: string[]) => void
  disabled?: boolean
}

export function UserRoleSelector({
  roles,
  selectedRoleIds,
  onChange,
  disabled = false,
}: UserRoleSelectorProps) {
  const selectedRoles = roles.filter((r) => selectedRoleIds.includes(r.id))

  const toggleRole = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      onChange(selectedRoleIds.filter((id) => id !== roleId))
    } else {
      onChange([...selectedRoleIds, roleId])
    }
  }

  const removeRole = (roleId: string) => {
    onChange(selectedRoleIds.filter((id) => id !== roleId))
  }

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedRoles.length > 0
              ? `${selectedRoles.length} role(s) selected`
              : "Select roles..."}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <ScrollArea className="h-[200px]">
            <div className="p-2 space-y-1">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
                    selectedRoleIds.includes(role.id) && "bg-accent"
                  )}
                >
                  <Checkbox
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  {role.name}
                </label>
              ))}
              {roles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No roles available.
                </p>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRoles.map((role) => (
            <Badge key={role.id} variant="secondary" className="gap-1">
              {role.name}
              {!disabled && (
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => removeRole(role.id)}
                >
                  <X className="size-3" />
                  <span className="sr-only">Remove {role.name}</span>
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
