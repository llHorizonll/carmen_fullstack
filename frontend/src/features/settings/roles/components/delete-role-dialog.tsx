import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { RoleListDto } from "../types"

interface DeleteRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: RoleListDto | null
  onConfirm: () => void
  isPending: boolean
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
  onConfirm,
  isPending,
}: DeleteRoleDialogProps) {
  if (!role) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the role <strong>{role.name}</strong>?
            {role.userCount > 0 && (
              <span className="block mt-2 text-destructive">
                Warning: This role is assigned to {role.userCount} user(s). They will
                lose all permissions granted by this role.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending || role.isSystem}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
