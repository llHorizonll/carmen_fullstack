import * as React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { GitBranch, Plus, Loader2, Trash2 } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useWorkflowDefinitions, useDeleteWorkflowDefinition } from "../hooks"
import { WorkflowEntityTypeLabels } from "../types"
import type { WorkflowDefinitionListDto } from "../types"

export function WorkflowDefinitionListPage() {
  const { t } = useTranslation()
  const { data: definitions, isLoading } = useWorkflowDefinitions()
  const deleteMutation = useDeleteWorkflowDefinition()

  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean
    item: WorkflowDefinitionListDto | null
  }>({ open: false, item: null })

  const handleDelete = () => {
    if (!deleteDialog.item) return
    deleteMutation.mutate(deleteDialog.item.id, {
      onSuccess: () => setDeleteDialog({ open: false, item: null }),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("workflow.definitions.title")}</h1>
            <p className="text-muted-foreground">{t("workflow.definitions.subtitle")}</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/settings/workflows/new">
            <Plus className="size-4 mr-2" />
            {t("workflow.definitions.newDefinition")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("workflow.definitions.title")}</CardTitle>
          <CardDescription>
            {definitions ? `${definitions.length} workflow(s)` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !definitions || definitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GitBranch className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No workflow definitions</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a workflow to enable multi-step approvals.
              </p>
              <Button asChild>
                <Link to="/settings/workflows/new">
                  <Plus className="size-4 mr-2" />
                  Create Workflow
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Amount Threshold</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {definitions.map((def) => (
                  <TableRow key={def.id}>
                    <TableCell>
                      <Link
                        to={`/settings/workflows/${def.id}/edit`}
                        className="font-medium text-primary hover:underline"
                      >
                        {def.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {WorkflowEntityTypeLabels[def.entityType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {def.amountThreshold != null
                        ? `$${def.amountThreshold.toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell>{def.stepCount}</TableCell>
                    <TableCell>
                      {def.isDefault && <Badge>Default</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={def.isActive ? "default" : "secondary"}>
                        {def.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/settings/workflows/${def.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, item: def })}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow Definition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.item?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, item: null })}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
