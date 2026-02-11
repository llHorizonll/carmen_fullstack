import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type ActionType = "approve" | "reject" | "delegate"

interface ApprovalActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: ActionType
  entityNumber: string
  isPending: boolean
  onConfirm: (comment?: string) => void
}

const actionConfig: Record<ActionType, { title: string; description: string; buttonLabel: string; variant: "default" | "destructive" }> = {
  approve: {
    title: "Approve",
    description: "Approve this document and advance to the next step.",
    buttonLabel: "Approve",
    variant: "default",
  },
  reject: {
    title: "Reject",
    description: "Reject this document. Please provide a reason.",
    buttonLabel: "Reject",
    variant: "destructive",
  },
  delegate: {
    title: "Delegate",
    description: "Delegate this approval to another user.",
    buttonLabel: "Delegate",
    variant: "default",
  },
}

export function ApprovalActionDialog({
  open,
  onOpenChange,
  actionType,
  entityNumber,
  isPending,
  onConfirm,
}: ApprovalActionDialogProps) {
  const [comment, setComment] = React.useState("")
  const config = actionConfig[actionType]

  const handleConfirm = () => {
    onConfirm(comment || undefined)
    setComment("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title} - {entityNumber}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Comment {actionType === "reject" ? "(required)" : "(optional)"}</Label>
            <Textarea
              id="comment"
              placeholder="Enter your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={config.variant}
            onClick={handleConfirm}
            disabled={isPending || (actionType === "reject" && !comment.trim())}
          >
            {isPending ? "Processing..." : config.buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
