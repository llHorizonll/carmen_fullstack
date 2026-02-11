import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { FileText, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"

import { useAccountLookup, useAccountSummary, useAccountLedger } from "../hooks"
import { AccountType, accountTypeLabels, type AccountLedgerLineDto } from "../types"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function AccountSummaryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")

  // Default to first day of current month and today
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [fromDate, setFromDate] = useState<string>(format(firstOfMonth, "yyyy-MM-dd"))
  const [toDate, setToDate] = useState<string>(format(today, "yyyy-MM-dd"))

  const { data: accounts, isLoading: accountsLoading } = useAccountLookup()
  const { data: summary, isLoading: summaryLoading } = useAccountSummary(
    selectedAccountId || undefined,
    toDate || undefined
  )
  const { data: ledger, isLoading: ledgerLoading } = useAccountLedger(
    selectedAccountId || undefined,
    fromDate || undefined,
    toDate || undefined
  )

  const columns: ColumnDef<AccountLedgerLineDto>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.date")} />,
      cell: ({ row }) => format(new Date(row.getValue("date")), "yyyy-MM-dd"),
    },
    {
      accessorKey: "voucherNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.vouchers.voucherNumber")} />,
      cell: ({ row }) => (
        <Button
          variant="link"
          className="h-auto p-0 font-mono"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/gl/journal-vouchers/${row.original.voucherId}`)
          }}
        >
          {row.getValue("voucherNumber")}
        </Button>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.description")} />,
      cell: ({ row }) => row.getValue("description") || "-",
    },
    {
      accessorKey: "debit",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.vouchers.debit")} />,
      cell: ({ row }) => {
        const amount = row.getValue("debit") as number
        return amount > 0 ? (
          <span className="font-mono text-green-600">{formatCurrency(amount)}</span>
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
        return amount > 0 ? (
          <span className="font-mono text-red-600">{formatCurrency(amount)}</span>
        ) : (
          "-"
        )
      },
    },
    {
      accessorKey: "runningBalance",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("generalLedger.accounts.balance")} />,
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {formatCurrency(row.getValue("runningBalance"))}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("generalLedger.accountSummary.title")}</h1>
        <p className="text-muted-foreground">{t("generalLedger.accountSummary.subtitle")}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("generalLedger.accountSummary.selectAccount")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* Account Selector */}
            <div className="w-80">
              <Label>{t("generalLedger.accounts.account")}</Label>
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
                disabled={accountsLoading}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("generalLedger.accountSummary.selectAccountPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <span className="font-mono">{account.accountCode}</span> - {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Date */}
            <div>
              <Label>{t("common.fromDate")}</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1.5 w-40"
              />
            </div>

            {/* To Date */}
            <div>
              <Label>{t("common.toDate")}</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1.5 w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedAccountId && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("generalLedger.accountSummary.openingBalance")}</CardTitle>
              <FileText className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold font-mono">
                  {formatCurrency(ledger?.openingBalance ?? 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("generalLedger.accountSummary.totalDebit")}</CardTitle>
              <ArrowUpRight className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold font-mono text-green-600">
                  {formatCurrency(summary?.totalDebit ?? 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("generalLedger.accountSummary.totalCredit")}</CardTitle>
              <ArrowDownRight className="size-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold font-mono text-red-600">
                  {formatCurrency(summary?.totalCredit ?? 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("generalLedger.accountSummary.closingBalance")}</CardTitle>
              <FileText className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold font-mono">
                  {formatCurrency(ledger?.closingBalance ?? summary?.closingBalance ?? 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Info */}
      {selectedAccountId && summary && (
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="font-mono">{summary.accountCode}</span> - {summary.accountName}
            </CardTitle>
            <CardDescription>
              {t("generalLedger.accounts.type")}: {accountTypeLabels[summary.accountType as AccountType]}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Transaction Ledger */}
      {selectedAccountId && (
        <Card>
          <CardHeader>
            <CardTitle>{t("generalLedger.accountSummary.transactionLedger")}</CardTitle>
            <CardDescription>
              {ledger && `${ledger.transactions.length} ${t("generalLedger.accountSummary.transactionsFound")}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={ledger?.transactions ?? []}
              isLoading={ledgerLoading}
              showPagination
              pageSize={20}
            />
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedAccountId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t("generalLedger.accountSummary.emptyTitle")}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t("generalLedger.accountSummary.emptyDescription")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
