import { useState } from "react"
import { Package, Receipt, FileBox, RefreshCw, ArrowUpFromLine, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  useBlueLedgerStatus,
  usePostInventoryToGl,
  useRunReconciliation,
} from "../hooks"

export function BlueLedgerStatusPage() {
  const { data: status, isLoading, refetch } = useBlueLedgerStatus()
  const postInventory = usePostInventoryToGl()
  const runReconciliation = useRunReconciliation()

  const [syncFromDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split("T")[0]
  })
  const [syncToDate] = useState(() => new Date().toISOString().split("T")[0])

  const handleSyncInventory = () => {
    postInventory.mutate({
      fromDate: syncFromDate,
      toDate: syncToDate,
    })
  }

  const handleReconcile = () => {
    runReconciliation.mutate({
      reconciliationDate: new Date().toISOString().split("T")[0],
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BlueLedger Integration</h1>
          <p className="text-muted-foreground">Loading integration status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BlueLedger Integration</h1>
          <p className="text-muted-foreground">
            PMS integration status and data synchronization
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">Connection Status</CardTitle>
            <CardDescription>
              {status?.baseUrl || "No endpoint configured"}
            </CardDescription>
          </div>
          {status?.isConnected ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="mr-1 size-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="mr-1 size-3" />
              Disconnected
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {status?.lastSyncTime && (
            <p className="text-sm text-muted-foreground">
              Last sync: {new Date(status.lastSyncTime).toLocaleString()}
            </p>
          )}
          {status?.errorMessage && (
            <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="size-4" />
              {status.errorMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Items Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Movements</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status?.pendingInventoryMovements ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              pending items (last 7 days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Extra Costs</CardTitle>
            <Receipt className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status?.pendingExtraCosts ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              unposted guest charges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receiving Documents</CardTitle>
            <FileBox className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status?.pendingReceivingDocuments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              pending import (last 7 days)
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sync Inventory to GL</CardTitle>
            <CardDescription>
              Post inventory movements from BlueLedger as GL journal entries.
              Currently syncing last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSyncInventory}
              disabled={postInventory.isPending || !status?.isConnected}
            >
              <ArrowUpFromLine className="mr-2 size-4" />
              {postInventory.isPending ? "Posting..." : "Post to GL"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Run Reconciliation</CardTitle>
            <CardDescription>
              Compare BlueLedger data with Carmen records and identify discrepancies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleReconcile}
              disabled={runReconciliation.isPending || !status?.isConnected}
              variant="outline"
            >
              <RefreshCw className="mr-2 size-4" />
              {runReconciliation.isPending ? "Reconciling..." : "Reconcile Now"}
            </Button>
            {runReconciliation.data && (
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">
                  Reconciliation Results ({new Date(runReconciliation.data.reconciliationDate).toLocaleDateString()})
                </p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>Movements: {runReconciliation.data.inventoryMovementsCount}</li>
                  <li>Extra Costs: {runReconciliation.data.extraCostsCount}</li>
                  <li>Receiving Docs: {runReconciliation.data.receivingDocumentsCount}</li>
                </ul>
                {runReconciliation.data.discrepancies.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-amber-600">Discrepancies:</p>
                    <ul className="list-disc pl-4">
                      {runReconciliation.data.discrepancies.map((d, i) => (
                        <li key={i} className="text-amber-600">{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
