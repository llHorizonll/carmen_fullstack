import * as React from "react"
import { useTranslation } from "react-i18next"
import { History, Loader2 } from "lucide-react"
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
import { useApprovalHistory } from "../hooks"
import { WorkflowEntityTypeLabels } from "../types"

export function ApprovalHistoryPage() {
  const { t } = useTranslation()
  const [page, setPage] = React.useState(1)
  const { data, isLoading } = useApprovalHistory(page)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("workflow.history.title")}</h1>
          <p className="text-muted-foreground">{t("workflow.history.subtitle")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("workflow.history.title")}</CardTitle>
          <CardDescription>
            {data ? `${data.totalCount} record(s)` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No approval history</p>
              <p className="text-sm text-muted-foreground">Your approval actions will appear here.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Step</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Submitted At</TableHead>
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
    </div>
  )
}
