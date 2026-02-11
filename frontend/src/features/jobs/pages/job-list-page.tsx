import { useState } from "react"
import {
  Play,
  CheckCircle,
  XCircle,
  RotateCw,
  Calendar,
  Timer,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useJobs, useTriggerDepreciation, useTriggerRecurringVouchers, useTriggerAmortization, useJobHistory } from "../hooks"
import { useFiscalPeriodLookup } from "@/features/general-ledger/fiscal-periods"
import type { JobStatusDto } from "../types"

export function JobListPage() {
  const [showDepreciationDialog, setShowDepreciationDialog] = useState(false)
  const [showRecurringVouchersDialog, setShowRecurringVouchersDialog] = useState(false)
  const [showAmortizationDialog, setShowAmortizationDialog] = useState(false)
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("")
  const [autoPost, setAutoPost] = useState(false)
  const [amortizationPeriodId, setAmortizationPeriodId] = useState<string>("")
  const [amortizationAutoPost, setAmortizationAutoPost] = useState(false)

  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useJobs()
  const { data: history, isLoading: historyLoading } = useJobHistory({ pageSize: 10 })
  const { data: fiscalPeriods } = useFiscalPeriodLookup()

  const triggerDepreciation = useTriggerDepreciation()
  const triggerRecurringVouchers = useTriggerRecurringVouchers()
  const triggerAmortization = useTriggerAmortization()

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return <Badge variant="default">Running</Badge>
      case "succeeded":
      case "completed":
        return <Badge variant="outline" className="border-green-500 text-green-700">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleTriggerDepreciation = () => {
    if (!selectedPeriodId) return
    triggerDepreciation.mutate(
      { fiscalPeriodId: selectedPeriodId, autoPost },
      {
        onSuccess: () => {
          setShowDepreciationDialog(false)
          setSelectedPeriodId("")
          setAutoPost(false)
        },
      }
    )
  }

  const handleTriggerRecurringVouchers = () => {
    triggerRecurringVouchers.mutate(
      { processDate: new Date().toISOString() },
      {
        onSuccess: () => {
          setShowRecurringVouchersDialog(false)
        },
      }
    )
  }

  const handleTriggerAmortization = () => {
    if (!amortizationPeriodId) return
    triggerAmortization.mutate(
      { fiscalPeriodId: amortizationPeriodId, autoPost: amortizationAutoPost },
      {
        onSuccess: () => {
          setShowAmortizationDialog(false)
          setAmortizationPeriodId("")
          setAmortizationAutoPost(false)
        },
      }
    )
  }

  const JobCard = ({ job }: { job: JobStatusDto }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{job.jobName}</CardTitle>
          {getStatusBadge(job.status)}
        </div>
        <CardDescription className="font-mono text-xs">{job.jobId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Last Run:</span>
              <p className="font-medium">{formatDate(job.lastExecution)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Next Run:</span>
              <p className="font-medium">{formatDate(job.nextExecution)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Success:</span>
              <p className="font-medium text-green-600">{job.successCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Failures:</span>
              <p className="font-medium text-red-600">{job.failureCount}</p>
            </div>
          </div>
          {job.lastError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2">
              <p className="text-xs text-red-700">{job.lastError}</p>
            </div>
          )}
          <Button
            className="w-full"
            onClick={() => {
              if (job.jobId === "depreciation") {
                setShowDepreciationDialog(true)
              } else if (job.jobId === "recurring-vouchers") {
                setShowRecurringVouchersDialog(true)
              } else if (job.jobId === "amortization") {
                setShowAmortizationDialog(true)
              }
            }}
          >
            <Play className="mr-2 size-4" />
            Run Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Background Jobs</h1>
          <p className="text-muted-foreground">
            Manage and monitor background job execution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetchJobs()}>
            <RotateCw className="mr-2 size-4" />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <a href="/hangfire" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 size-4" />
              Hangfire Dashboard
            </a>
          </Button>
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobsLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        ) : jobs?.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Jobs Available</CardTitle>
              <CardDescription>No background jobs are configured.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          jobs?.map((job) => <JobCard key={job.jobId} job={job} />)
        )}
      </div>

      {/* Job History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Timer className="size-5" />
            <CardTitle>Recent Executions</CardTitle>
          </div>
          <CardDescription>
            View the execution history of background jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <p className="text-muted-foreground">Loading history...</p>
          ) : !history || history.length === 0 ? (
            <p className="text-muted-foreground">No job history available.</p>
          ) : (
            <div className="space-y-3">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {entry.success ? (
                      <CheckCircle className="size-4 text-green-500" />
                    ) : (
                      <XCircle className="size-4 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{entry.jobName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(entry.executedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={entry.success ? "outline" : "destructive"}>
                      {entry.success ? "Success" : "Failed"}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Duration: {entry.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Depreciation Job Dialog */}
      <Dialog open={showDepreciationDialog} onOpenChange={setShowDepreciationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Depreciation Job</DialogTitle>
            <DialogDescription>
              Calculate and optionally post depreciation for the selected fiscal period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fiscal Period</Label>
              <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fiscal period" />
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
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Post to GL</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically post depreciation entries after calculation
                </p>
              </div>
              <Switch checked={autoPost} onCheckedChange={setAutoPost} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDepreciationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTriggerDepreciation}
              disabled={!selectedPeriodId || triggerDepreciation.isPending}
            >
              {triggerDepreciation.isPending ? (
                <>
                  <RotateCw className="mr-2 size-4 animate-spin" />
                  Triggering...
                </>
              ) : (
                <>
                  <Play className="mr-2 size-4" />
                  Run Job
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recurring Vouchers Dialog */}
      <Dialog open={showRecurringVouchersDialog} onOpenChange={setShowRecurringVouchersDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Recurring Vouchers Job</DialogTitle>
            <DialogDescription>
              Process all recurring voucher templates that are due for execution.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <Calendar className="size-5" />
              <div>
                <p className="font-medium">Process Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRecurringVouchersDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTriggerRecurringVouchers}
              disabled={triggerRecurringVouchers.isPending}
            >
              {triggerRecurringVouchers.isPending ? (
                <>
                  <RotateCw className="mr-2 size-4 animate-spin" />
                  Triggering...
                </>
              ) : (
                <>
                  <Play className="mr-2 size-4" />
                  Run Job
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Amortization Job Dialog */}
      <Dialog open={showAmortizationDialog} onOpenChange={setShowAmortizationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Amortization Job</DialogTitle>
            <DialogDescription>
              Calculate and optionally post prepaid expense amortization for the selected fiscal period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fiscal Period</Label>
              <Select value={amortizationPeriodId} onValueChange={setAmortizationPeriodId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fiscal period" />
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
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Post to GL</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically post amortization entries after calculation
                </p>
              </div>
              <Switch checked={amortizationAutoPost} onCheckedChange={setAmortizationAutoPost} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAmortizationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTriggerAmortization}
              disabled={!amortizationPeriodId || triggerAmortization.isPending}
            >
              {triggerAmortization.isPending ? (
                <>
                  <RotateCw className="mr-2 size-4 animate-spin" />
                  Triggering...
                </>
              ) : (
                <>
                  <Play className="mr-2 size-4" />
                  Run Job
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
