import { useState } from "react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { CheckCircle2, XCircle, FileSpreadsheet } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"

import { useTrialBalance } from "../hooks"
import { useFiscalPeriodLookup } from "../../fiscal-periods/hooks"
import { AccountType, accountTypeLabels, type AccountBalanceDto } from "../types"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function TrialBalancePage() {
  const { t } = useTranslation()
  const [asOfDate, setAsOfDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("all")

  const { data: periods, isLoading: periodsLoading } = useFiscalPeriodLookup()
  const { data: trialBalance, isLoading } = useTrialBalance(
    asOfDate || undefined,
    selectedPeriodId === "all" ? undefined : selectedPeriodId
  )

  const columns: ColumnDef<AccountBalanceDto>[] = [
    {
      accessorKey: "accountCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.accounts.columns.code")} />,
      cell: ({ row }) => {
        const level = row.original.level
        const isHeader = row.original.isHeader
        const paddingLeft = (level - 1) * 16
        return (
          <div style={{ paddingLeft: `${paddingLeft}px` }}>
            <span className={cn("font-mono", isHeader && "font-bold")}>
              {row.getValue("accountCode")}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "accountName",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.accounts.columns.accountName")} />,
      cell: ({ row }) => {
        const isHeader = row.original.isHeader
        return (
          <span className={cn(isHeader && "font-bold")}>
            {row.getValue("accountName")}
          </span>
        )
      },
    },
    {
      accessorKey: "accountType",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.accounts.columns.type")} />,
      cell: ({ row }) => {
        const type = row.getValue("accountType") as AccountType
        const variants: Record<AccountType, "default" | "secondary" | "destructive" | "outline"> = {
          [AccountType.Asset]: "default",
          [AccountType.Liability]: "secondary",
          [AccountType.Equity]: "outline",
          [AccountType.Revenue]: "default",
          [AccountType.Expense]: "destructive",
        }
        return <Badge variant={variants[type]}>{accountTypeLabels[type]}</Badge>
      },
    },
    {
      accessorKey: "debit",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.vouchers.debit")} />,
      cell: ({ row }) => {
        const amount = row.getValue("debit") as number
        const isHeader = row.original.isHeader
        return amount > 0 ? (
          <span className={cn("font-mono text-green-600", isHeader && "font-bold")}>
            {formatCurrency(amount)}
          </span>
        ) : (
          "-"
        )
      },
    },
    {
      accessorKey: "credit",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.vouchers.credit")} />,
      cell: ({ row }) => {
        const amount = row.getValue("credit") as number
        const isHeader = row.original.isHeader
        return amount > 0 ? (
          <span className={cn("font-mono text-red-600", isHeader && "font-bold")}>
            {formatCurrency(amount)}
          </span>
        ) : (
          "-"
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("generalLedger.trialBalance.title")}</h1>
          <p className="text-muted-foreground">{t("generalLedger.trialBalance.subtitle")}</p>
        </div>
        <Button variant="outline" disabled>
          <FileSpreadsheet className="mr-2 size-4" />
          {t("common.export")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("generalLedger.trialBalance.parameters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* As of Date */}
            <div>
              <Label>{t("generalLedger.trialBalance.asOfDate")}</Label>
              <Input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="mt-1.5 w-40"
              />
            </div>

            {/* Fiscal Period */}
            <div className="w-60">
              <label className="text-sm font-medium">{t("generalLedger.trialBalance.fiscalPeriod")}</label>
              <Select
                value={selectedPeriodId}
                onValueChange={setSelectedPeriodId}
                disabled={periodsLoading}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("generalLedger.trialBalance.allPeriods")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("generalLedger.trialBalance.allPeriods")}</SelectItem>
                  {periods?.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("generalLedger.trialBalance.totalDebit")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold font-mono text-green-600">
                {formatCurrency(trialBalance?.totalDebit ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("generalLedger.trialBalance.totalCredit")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold font-mono text-red-600">
                {formatCurrency(trialBalance?.totalCredit ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("generalLedger.trialBalance.status")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : trialBalance?.isBalanced ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="size-6" />
                <span className="text-lg font-semibold">{t("generalLedger.trialBalance.balanced")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="size-6" />
                <span className="text-lg font-semibold">{t("generalLedger.trialBalance.unbalanced")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("generalLedger.trialBalance.accountBalances")}</CardTitle>
          <CardDescription>
            {trialBalance && (
              <>
                {t("generalLedger.trialBalance.asOf")} {format(new Date(trialBalance.asOfDate), "yyyy-MM-dd")}
                {trialBalance.fiscalPeriodName && ` - ${trialBalance.fiscalPeriodName}`}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={trialBalance?.accounts ?? []}
            isLoading={isLoading}
            showPagination
            pageSize={50}
          />

          {/* Totals Row */}
          {trialBalance && trialBalance.accounts.length > 0 && (
            <div className="mt-4 flex justify-end border-t pt-4">
              <div className="grid grid-cols-2 gap-8 text-right">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t("generalLedger.trialBalance.totalDebit")}</span>
                  <p className="text-xl font-bold font-mono text-green-600">
                    {formatCurrency(trialBalance.totalDebit)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t("generalLedger.trialBalance.totalCredit")}</span>
                  <p className="text-xl font-bold font-mono text-red-600">
                    {formatCurrency(trialBalance.totalCredit)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
