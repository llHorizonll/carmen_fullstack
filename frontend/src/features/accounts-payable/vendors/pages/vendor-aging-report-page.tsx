import { useState, Fragment } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import { FileSpreadsheet, Building2, ChevronRight, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"

import { useAgingReport, useVendorAging } from "../hooks"
import type { VendorAgingInvoiceDto } from "../types"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function AgingBucketCell({ amount, variant }: { amount: number; variant: "current" | "warning" | "danger" }) {
  const colorClass =
    variant === "current" ? "text-green-600" :
    variant === "warning" ? "text-yellow-600" :
    "text-red-600"

  return amount > 0 ? (
    <span className={cn("font-mono", colorClass)}>{formatCurrency(amount)}</span>
  ) : (
    <span className="text-muted-foreground">-</span>
  )
}

interface VendorAgingDetailProps {
  vendorId: string
  asOfDate: string
}

function VendorAgingDetail({ vendorId, asOfDate }: VendorAgingDetailProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: aging, isLoading } = useVendorAging(vendorId, asOfDate)

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />
  }

  if (!aging || aging.invoices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {t("ap.aging.noInvoices")}
      </p>
    )
  }

  const invoiceColumns: ColumnDef<VendorAgingInvoiceDto>[] = [
    {
      accessorKey: "invoiceNumber",
      header: t("ap.invoices.columns.invoiceNumber"),
      cell: ({ row }) => (
        <Button
          variant="link"
          className="h-auto p-0 font-mono"
          onClick={() => navigate(`/ap/invoices/${row.original.invoiceId}`)}
        >
          {row.getValue("invoiceNumber")}
        </Button>
      ),
    },
    {
      accessorKey: "vendorInvoiceNumber",
      header: t("ap.invoices.columns.vendorInvoiceNumber"),
      cell: ({ row }) => row.getValue("vendorInvoiceNumber") || "-",
    },
    {
      accessorKey: "invoiceDate",
      header: t("ap.invoices.columns.invoiceDate"),
      cell: ({ row }) => format(new Date(row.getValue("invoiceDate")), "yyyy-MM-dd"),
    },
    {
      accessorKey: "dueDate",
      header: t("ap.invoices.columns.dueDate"),
      cell: ({ row }) => format(new Date(row.getValue("dueDate")), "yyyy-MM-dd"),
    },
    {
      accessorKey: "daysOverdue",
      header: t("ap.aging.daysOverdue"),
      cell: ({ row }) => {
        const days = row.getValue("daysOverdue") as number
        return days > 0 ? (
          <span className="text-red-600 font-medium">{days}</span>
        ) : (
          <span className="text-green-600">0</span>
        )
      },
    },
    {
      accessorKey: "bucket",
      header: t("ap.aging.bucket"),
    },
    {
      accessorKey: "totalAmount",
      header: t("ap.invoices.columns.totalAmount"),
      cell: ({ row }) => (
        <span className="font-mono">{formatCurrency(row.getValue("totalAmount"))}</span>
      ),
    },
    {
      accessorKey: "balanceAmount",
      header: t("ap.aging.balance"),
      cell: ({ row }) => (
        <span className="font-mono font-medium">{formatCurrency(row.getValue("balanceAmount"))}</span>
      ),
    },
  ]

  return (
    <div className="py-2">
      <DataTable
        columns={invoiceColumns}
        data={aging.invoices}
        isLoading={false}
        pageSize={10}
      />
    </div>
  )
}

export function VendorAgingReportPage() {
  const { t } = useTranslation()
  const [asOfDate, setAsOfDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set())

  const { data: agingReport, isLoading } = useAgingReport(asOfDate)

  const toggleVendor = (vendorId: string) => {
    setExpandedVendors((prev) => {
      const next = new Set(prev)
      if (next.has(vendorId)) {
        next.delete(vendorId)
      } else {
        next.add(vendorId)
      }
      return next
    })
  }

  // Calculate totals
  const totals = agingReport?.reduce(
    (acc, vendor) => ({
      current: acc.current + vendor.current,
      days1To30: acc.days1To30 + vendor.days1To30,
      days31To60: acc.days31To60 + vendor.days31To60,
      days61To90: acc.days61To90 + vendor.days61To90,
      days90Plus: acc.days90Plus + vendor.days90Plus,
      totalBalance: acc.totalBalance + vendor.totalBalance,
    }),
    { current: 0, days1To30: 0, days31To60: 0, days61To90: 0, days90Plus: 0, totalBalance: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("ap.aging.title")}</h1>
          <p className="text-muted-foreground">{t("ap.aging.subtitle")}</p>
        </div>
        <Button variant="outline" disabled>
          <FileSpreadsheet className="mr-2 size-4" />
          {t("common.export")}
        </Button>
      </div>

      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ap.aging.parameters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label>{t("ap.aging.asOfDate")}</Label>
              <Input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="mt-1.5 w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("ap.aging.current")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold font-mono text-green-600">
                {formatCurrency(totals?.current ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("ap.aging.days1To30")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold font-mono text-yellow-600">
                {formatCurrency(totals?.days1To30 ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("ap.aging.days31To60")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold font-mono text-yellow-600">
                {formatCurrency(totals?.days31To60 ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("ap.aging.days61To90")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold font-mono text-red-600">
                {formatCurrency(totals?.days61To90 ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("ap.aging.days90Plus")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold font-mono text-red-600">
                {formatCurrency(totals?.days90Plus ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("ap.aging.totalBalance")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold font-mono">
                {formatCurrency(totals?.totalBalance ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Aging Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            {t("ap.aging.vendorAging")}
          </CardTitle>
          <CardDescription>
            {agingReport && `${agingReport.length} ${t("ap.aging.vendorsWithBalance")}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Custom table with expandable rows */}
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-10 px-2 py-3"></th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t("ap.vendors.columns.code")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">{t("ap.vendors.columns.name")}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t("ap.aging.current")}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t("ap.aging.days1To30")}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t("ap.aging.days31To60")}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t("ap.aging.days61To90")}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t("ap.aging.days90Plus")}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">{t("ap.aging.totalBalance")}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8">
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-64" />
                      </div>
                    </td>
                  </tr>
                ) : agingReport && agingReport.length > 0 ? (
                  agingReport.map((vendor) => (
                    <Fragment key={vendor.vendorId}>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="px-2 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleVendor(vendor.vendorId)}
                          >
                            {expandedVendors.has(vendor.vendorId) ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </Button>
                        </td>
                        <td className="px-4 py-3 font-mono">{vendor.vendorCode}</td>
                        <td className="px-4 py-3">{vendor.vendorName}</td>
                        <td className="px-4 py-3 text-right">
                          <AgingBucketCell amount={vendor.current} variant="current" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AgingBucketCell amount={vendor.days1To30} variant="warning" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AgingBucketCell amount={vendor.days31To60} variant="warning" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AgingBucketCell amount={vendor.days61To90} variant="danger" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AgingBucketCell amount={vendor.days90Plus} variant="danger" />
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold">
                          {formatCurrency(vendor.totalBalance)}
                        </td>
                      </tr>
                      {expandedVendors.has(vendor.vendorId) && (
                        <tr>
                          <td colSpan={9} className="bg-muted/30 px-4">
                            <VendorAgingDetail vendorId={vendor.vendorId} asOfDate={asOfDate} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      {t("ap.aging.noData")}
                    </td>
                  </tr>
                )}
              </tbody>
              {/* Totals row */}
              {totals && totals.totalBalance > 0 && (
                <tfoot>
                  <tr className="bg-muted font-bold">
                    <td className="px-2 py-3"></td>
                    <td className="px-4 py-3" colSpan={2}>{t("common.total")}</td>
                    <td className="px-4 py-3 text-right font-mono text-green-600">
                      {formatCurrency(totals.current)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-yellow-600">
                      {formatCurrency(totals.days1To30)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-yellow-600">
                      {formatCurrency(totals.days31To60)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-red-600">
                      {formatCurrency(totals.days61To90)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-red-600">
                      {formatCurrency(totals.days90Plus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(totals.totalBalance)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
