import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Calculator, Loader2, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { useRunDepreciation, usePostAllDepreciation, useDepreciationSummary } from "../hooks"
import { useFiscalPeriodLookup } from "@/features/general-ledger/fiscal-periods"
import type { DepreciationScheduleDto } from "../types"

export function DepreciationRunPage() {
  const navigate = useNavigate()
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("")
  const [autoPost, setAutoPost] = useState(false)
  const [runResult, setRunResult] = useState<DepreciationScheduleDto[]>([])

  const { data: fiscalPeriods } = useFiscalPeriodLookup()
  const { data: summary } = useDepreciationSummary(selectedPeriodId || undefined)
  const runDepreciation = useRunDepreciation()
  const postAllDepreciation = usePostAllDepreciation()

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleRunDepreciation = async () => {
    if (!selectedPeriodId) return

    const result = await runDepreciation.mutateAsync({
      fiscalPeriodId: selectedPeriodId,
      autoPost,
    })
    setRunResult(result)
  }

  const handlePostAll = async () => {
    if (!selectedPeriodId) return
    await postAllDepreciation.mutateAsync(selectedPeriodId)
    // Refresh the summary
    setRunResult([])
  }

  const totalDepreciation = runResult.reduce((sum, s) => sum + s.depreciationAmount, 0)
  const postedCount = runResult.filter((s) => s.isPosted).length
  const pendingCount = runResult.filter((s) => !s.isPosted).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assets/depreciation")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Run Monthly Depreciation</h1>
          <p className="text-muted-foreground">
            Calculate depreciation for all active assets in a fiscal period
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Run Form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Depreciation Settings</CardTitle>
            <CardDescription>Select period and run options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fiscalPeriod">Fiscal Period *</Label>
              <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                <SelectTrigger id="fiscalPeriod">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalPeriods?.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoPost"
                checked={autoPost}
                onCheckedChange={(checked) => setAutoPost(checked as boolean)}
              />
              <Label htmlFor="autoPost" className="text-sm font-normal">
                Auto-post to General Ledger
              </Label>
            </div>

            <Button
              className="w-full"
              onClick={handleRunDepreciation}
              disabled={!selectedPeriodId || runDepreciation.isPending}
            >
              {runDepreciation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Calculator className="mr-2 size-4" />
              )}
              Run Depreciation
            </Button>

            {summary && summary.pendingCount > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePostAll}
                disabled={postAllDepreciation.isPending}
              >
                {postAllDepreciation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 size-4" />
                )}
                Post All Pending ({summary.pendingCount})
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Summary & Results */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Period Summary</CardTitle>
            <CardDescription>
              {selectedPeriodId
                ? `Depreciation status for selected period`
                : "Select a fiscal period to view summary"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Total Assets</p>
                    <p className="text-2xl font-bold">{summary.totalAssets}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Total Depreciation</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.totalDepreciation, summary.currencyCode)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="text-sm text-green-600">Posted</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(summary.postedAmount, summary.currencyCode)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm text-amber-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {formatCurrency(summary.pendingAmount, summary.currencyCode)}
                    </p>
                  </div>
                </div>

                {summary.pendingCount > 0 && (
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>Pending Entries</AlertTitle>
                    <AlertDescription>
                      {summary.pendingCount} depreciation entries are pending GL posting.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Select a fiscal period to view depreciation summary
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Run Results */}
      {runResult.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Depreciation Results</CardTitle>
                <CardDescription>
                  {runResult.length} entries generated • Total: {formatCurrency(totalDepreciation)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="default">{postedCount} Posted</Badge>
                <Badge variant="outline">{pendingCount} Pending</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Opening</TableHead>
                  <TableHead className="text-right">Depreciation</TableHead>
                  <TableHead className="text-right">Closing</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runResult.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.scheduleNumber}</TableCell>
                    <TableCell>
                      <span className="font-mono">{schedule.assetCode}</span>
                      <p className="text-sm text-muted-foreground">{schedule.assetName}</p>
                    </TableCell>
                    <TableCell>{formatDate(schedule.scheduleDate)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(schedule.openingValue, schedule.currencyCode)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      ({formatCurrency(schedule.depreciationAmount, schedule.currencyCode)})
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(schedule.closingValue, schedule.currencyCode)}
                    </TableCell>
                    <TableCell>
                      {schedule.isPosted ? (
                        <Badge variant="default">Posted</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
