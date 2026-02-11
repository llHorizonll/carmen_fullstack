import { useTranslation } from "react-i18next"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { MonthlyTrendDto } from "../types"

type RevenueChartProps = {
  revenueTrend: MonthlyTrendDto[]
  expenseTrend: MonthlyTrendDto[]
  isLoading?: boolean
}

export function RevenueChart({ revenueTrend, expenseTrend, isLoading }: RevenueChartProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("dashboard.charts.revenueVsExpense")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const data = revenueTrend.map((rev, i) => ({
    month: formatMonth(rev.month),
    revenue: rev.amount,
    expense: expenseTrend[i]?.amount ?? 0,
  }))

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("dashboard.charts.revenueVsExpense")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => tooltipFormatter(Number(value))} />
            <Legend />
            <Bar
              dataKey="revenue"
              name={t("dashboard.charts.revenue")}
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name={t("dashboard.charts.expense")}
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  const date = new Date(Number(year), Number(m) - 1)
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

function tooltipFormatter(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
