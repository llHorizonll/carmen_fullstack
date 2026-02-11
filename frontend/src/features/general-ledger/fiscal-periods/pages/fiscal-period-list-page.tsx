import { useState } from "react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, MoreHorizontal, Lock, Unlock, LockKeyhole, CalendarDays } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useFiscalPeriods, useFiscalYears, useReopenPeriod, useLockPeriod } from "../hooks"
import {
  PeriodStatus,
  periodStatusLabels,
  periodStatusColors,
  type FiscalPeriodListDto,
  type FiscalPeriodQueryParams,
} from "../types"
import { PeriodCloseDialog } from "../components/period-close-dialog"

export function FiscalPeriodListPage() {
  const { t } = useTranslation()
  const [params, setParams] = useState<FiscalPeriodQueryParams>({
    page: 1,
    pageSize: 20,
  })

  // Dialog states
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false)
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<FiscalPeriodListDto | null>(null)
  const [reopenReason, setReopenReason] = useState("")

  // Queries & Mutations
  const { data: fiscalYears } = useFiscalYears()
  const { data, isLoading } = useFiscalPeriods(params)
  const reopenPeriod = useReopenPeriod()
  const lockPeriod = useLockPeriod()

  const handleReopen = async () => {
    if (!selectedPeriod || !reopenReason.trim()) return
    await reopenPeriod.mutateAsync({
      id: selectedPeriod.id,
      data: { reason: reopenReason },
    })
    setReopenDialogOpen(false)
    setSelectedPeriod(null)
    setReopenReason("")
  }

  const handleLock = async () => {
    if (!selectedPeriod) return
    await lockPeriod.mutateAsync(selectedPeriod.id)
    setLockDialogOpen(false)
    setSelectedPeriod(null)
  }

  const columns: ColumnDef<FiscalPeriodListDto>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.fiscalPeriods.columns.name")} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "fiscalYearName",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.fiscalPeriods.columns.fiscalYear")} />,
    },
    {
      accessorKey: "periodNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.fiscalPeriods.columns.periodNumber")} />,
      cell: ({ row }) => (
        <Badge variant="outline">P{row.getValue("periodNumber")}</Badge>
      ),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.fiscalPeriods.columns.startDate")} />,
      cell: ({ row }) => format(new Date(row.getValue("startDate")), "yyyy-MM-dd"),
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.fiscalPeriods.columns.endDate")} />,
      cell: ({ row }) => format(new Date(row.getValue("endDate")), "yyyy-MM-dd"),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.fiscalPeriods.columns.status")} />,
      cell: ({ row }) => {
        const status = row.getValue("status") as PeriodStatus
        return (
          <Badge className={cn(periodStatusColors[status])}>
            {status === PeriodStatus.Locked && <Lock className="mr-1 size-3" />}
            {periodStatusLabels[status]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const period = row.original
        const status = period.status

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Close Period - only for Open periods */}
              {status === PeriodStatus.Open && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPeriod(period)
                    setCloseDialogOpen(true)
                  }}
                >
                  <Lock className="mr-2 size-4" />
                  {t("generalLedger.fiscalPeriods.closePeriod")}
                </DropdownMenuItem>
              )}

              {/* Reopen Period - only for Closed periods */}
              {status === PeriodStatus.Closed && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPeriod(period)
                    setReopenDialogOpen(true)
                  }}
                >
                  <Unlock className="mr-2 size-4" />
                  {t("generalLedger.fiscalPeriods.reopenPeriod")}
                </DropdownMenuItem>
              )}

              {/* Lock Period - only for Closed periods */}
              {status === PeriodStatus.Closed && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setSelectedPeriod(period)
                      setLockDialogOpen(true)
                    }}
                  >
                    <LockKeyhole className="mr-2 size-4" />
                    {t("generalLedger.fiscalPeriods.lockPeriod")}
                  </DropdownMenuItem>
                </>
              )}

              {/* Locked periods - no actions */}
              {status === PeriodStatus.Locked && (
                <DropdownMenuItem disabled>
                  <Lock className="mr-2 size-4" />
                  {t("generalLedger.fiscalPeriods.permanentlyLocked")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("generalLedger.fiscalPeriods.title")}</h1>
          <p className="text-muted-foreground">{t("generalLedger.fiscalPeriods.subtitle")}</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 size-4" />
          {t("generalLedger.fiscalPeriods.newFiscalYear")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={params.fiscalYearId ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              fiscalYearId: value === "all" ? undefined : value,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("generalLedger.fiscalPeriods.filters.allYears")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("generalLedger.fiscalPeriods.filters.allYears")}</SelectItem>
            {fiscalYears?.map((year) => (
              <SelectItem key={year.id} value={year.id}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={params.status?.toString() ?? "all"}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              status: value === "all" ? undefined : (Number(value) as PeriodStatus),
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("generalLedger.fiscalPeriods.filters.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("generalLedger.fiscalPeriods.filters.allStatus")}</SelectItem>
            <SelectItem value={String(PeriodStatus.Open)}>{periodStatusLabels[PeriodStatus.Open]}</SelectItem>
            <SelectItem value={String(PeriodStatus.Closed)}>{periodStatusLabels[PeriodStatus.Closed]}</SelectItem>
            <SelectItem value={String(PeriodStatus.Locked)}>{periodStatusLabels[PeriodStatus.Locked]}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        showPagination
        pageSize={params.pageSize}
      />

      {/* Period Close Dialog */}
      <PeriodCloseDialog
        period={selectedPeriod}
        open={closeDialogOpen}
        onOpenChange={(open) => {
          setCloseDialogOpen(open)
          if (!open) setSelectedPeriod(null)
        }}
      />

      {/* Reopen Period Dialog */}
      <Dialog open={reopenDialogOpen} onOpenChange={setReopenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("generalLedger.fiscalPeriods.reopenPeriod")}</DialogTitle>
            <DialogDescription>
              {selectedPeriod?.name} ({selectedPeriod?.startDate} - {selectedPeriod?.endDate})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("generalLedger.fiscalPeriods.reopenDescription")}
            </p>
            <div className="space-y-2">
              <Label htmlFor="reason">{t("generalLedger.fiscalPeriods.reopenReason")}</Label>
              <Input
                id="reason"
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder={t("generalLedger.fiscalPeriods.reopenReasonPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReopenDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleReopen}
              disabled={!reopenReason.trim() || reopenPeriod.isPending}
            >
              {t("generalLedger.fiscalPeriods.reopenPeriod")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock Period Dialog */}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("generalLedger.fiscalPeriods.lockPeriod")}</DialogTitle>
            <DialogDescription>
              {selectedPeriod?.name} ({selectedPeriod?.startDate} - {selectedPeriod?.endDate})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                {t("generalLedger.fiscalPeriods.lockWarning")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("generalLedger.fiscalPeriods.lockDescription")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLockDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLock}
              disabled={lockPeriod.isPending}
            >
              <LockKeyhole className="mr-2 size-4" />
              {t("generalLedger.fiscalPeriods.confirmLock")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
