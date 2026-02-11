import * as React from "react"
import { useTranslation } from "react-i18next"
import { CheckSquare, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { usePendingApprovals, useApprove, useReject } from "../hooks"
import { WorkflowEntityTypeLabels } from "../types"
import type { PendingApprovalDto } from "../types"
import { ApprovalActionDialog } from "../components/approval-action-dialog"

export function PendingApprovalsPage() {
  const { t } = useTranslation()
  const [page, setPage] = React.useState(1)
  const { data, isLoading } = usePendingApprovals(page)
  const approveMutation = useApprove()
  const rejectMutation = useReject()

  const [actionDialog, setActionDialog] = React.useState<{
    open: boolean
    type: "approve" | "reject"
    item: PendingApprovalDto | null
  }>({ open: false, type: "approve", item: null })

  const handleAction = (type: "approve" | "reject", item: PendingApprovalDto) => {
    setActionDialog({ open: true, type, item })
  }

  const handleConfirm = (comment?: string) => {
    if (!actionDialog.item) return
    const mutation = actionDialog.type === "approve" ? approveMutation : rejectMutation
    mutation.mutate(
      { instanceId: actionDialog.item.instanceId, request: { comment } },
      {
        onSuccess: () => {
          setActionDialog({ open: false, type: "approve", item: null })
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckSquare className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("workflow.pendingApprovals.title")}</h1>
          <p className="text-muted-foreground">{t("workflow.pendingApprovals.subtitle")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("workflow.pendingApprovals.title")}</CardTitle>
          <CardDescription>
            {data ? `${data.totalCount} pending approval(s)` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckSquare className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No pending approvals</p>
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Current Step</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item) => (
                    <TableRow key={item.instanceId}>
                      <TableCell className="font-medium">{item.entityNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {WorkflowEntityTypeLabels[item.entityType]}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.definitionName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          Step {item.currentStepOrder}: {item.currentStepName}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.submittedByUserName ?? "—"}</TableCell>
                      <TableCell>
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAction("approve", item)}
                          >
                            <Check className="size-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction("reject", item)}
                          >
                            <X className="size-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {data.page} of {data.totalPages} ({data.totalCount} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {actionDialog.item && (
        <ApprovalActionDialog
          open={actionDialog.open}
          onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}
          actionType={actionDialog.type}
          entityNumber={actionDialog.item.entityNumber}
          isPending={approveMutation.isPending || rejectMutation.isPending}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
