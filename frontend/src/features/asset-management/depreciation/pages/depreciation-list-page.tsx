import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { Calculator, Eye, CheckCircle, MoreHorizontal, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { useDepreciationSchedules, useDepreciationSummary, usePostDepreciation, useReverseDepreciation } from "../hooks"
import type { DepreciationScheduleListDto, DepreciationQueryParams } from "../types"

export function DepreciationListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useState<DepreciationQueryParams>({
    page: 1,
    pageSize: 20,
  })

  const { data, isLoading } = useDepreciationSchedules(params)
  const { data: summary } = useDepreciationSummary(params.fiscalPeriodId)
  const postDepreciation = usePostDepreciation()
  const reverseDepreciation = useReverseDepreciation()

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

  const columns: ColumnDef<DepreciationScheduleListDto>[] = [
    {
      accessorKey: "scheduleNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
      cell: ({ row }) => <span className="font-medium">{row.getValue("scheduleNumber")}</span>,
    },
    {
      accessorKey: "assetCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Asset" />,
      cell: ({ row }) => (
        <div>
          <span className="font-mono font-medium">{row.getValue("assetCode")}</span>
          <p className="text-sm text-muted-foreground">{row.original.assetName}</p>
        </div>
      ),
    },
    {
      accessorKey: "fiscalPeriodName",
      header: "Period",
      cell: ({ row }) => <span>{row.getValue("fiscalPeriodName")}</span>,
    },
    {
      accessorKey: "scheduleDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => formatDate(row.getValue("scheduleDate")),
    },
    {
      accessorKey: "openingValue",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Opening" />,
      cell: ({ row }) => formatCurrency(row.getValue("openingValue"), row.original.currencyCode),
    },
    {
      accessorKey: "depreciationAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Depreciation" />,
      cell: ({ row }) => (
        <span className="text-red-600">
          ({formatCurrency(row.getValue("depreciationAmount"), row.original.currencyCode)})
        </span>
      ),
    },
    {
      accessorKey: "closingValue",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Closing" />,
      cell: ({ row }) => formatCurrency(row.getValue("closingValue"), row.original.currencyCode),
    },
    {
      accessorKey: "isPosted",
      header: "Status",
      cell: ({ row }) => {
        const isPosted = row.getValue("isPosted") as boolean
        return (
          <Badge variant={isPosted ? "default" : "outline"}>
            {isPosted ? "Posted" : "Pending"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const schedule = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">{t("common.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/assets/${schedule.assetId}`)}>
                <Eye className="mr-2 size-4" />
                View Asset
              </DropdownMenuItem>
              {!schedule.isPosted && (
                <DropdownMenuItem
                  onClick={() => postDepreciation.mutate(schedule.id)}
                  disabled={postDepreciation.isPending}
                >
                  <CheckCircle className="mr-2 size-4" />
                  Post to GL
                </DropdownMenuItem>
              )}
              {schedule.isPosted && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => reverseDepreciation.mutate(schedule.id)}
                  disabled={reverseDepreciation.isPending}
                >
                  <XCircle className="mr-2 size-4" />
                  Reverse
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
          <h1 className="text-2xl font-bold tracking-tight">Depreciation Schedules</h1>
          <p className="text-muted-foreground">View and manage asset depreciation entries</p>
        </div>
        <Button onClick={() => navigate("/assets/depreciation/run")}>
          <Calculator className="mr-2 size-4" />
          Run Depreciation
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Assets</CardDescription>
              <CardTitle className="text-2xl">{summary.totalAssets}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Depreciation</CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(summary.totalDepreciation, summary.currencyCode)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Posted</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {formatCurrency(summary.postedAmount, summary.currencyCode)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-2xl text-amber-600">
                {formatCurrency(summary.pendingAmount, summary.currencyCode)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by asset..."
          className="w-64"
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              search: e.target.value || undefined,
              page: 1,
            }))
          }
        />
        <Select
          value={params.isPosted === undefined ? "all" : String(params.isPosted)}
          onValueChange={(value) =>
            setParams((prev) => ({
              ...prev,
              isPosted: value === "all" ? undefined : value === "true",
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Posted</SelectItem>
            <SelectItem value="false">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        searchKey="assetCode"
        searchPlaceholder="Search schedules..."
        showPagination
        pageSize={params.pageSize}
      />
    </div>
  )
}
