import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { AgingBucketDto } from "../types"

type AgingChartProps = {
  title: string
  data: AgingBucketDto[]
  isLoading?: boolean
}

const AGING_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function AgingChart({ title, data, isLoading }: AgingChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((bucket) => ({
    label: bucket.label,
    amount: bucket.amount,
    count: bucket.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" tickFormatter={formatCurrency} />
            <YAxis type="category" dataKey="label" className="text-xs" width={80} />
            <Tooltip
              formatter={(value, _name, props) => [
                `${formatFullCurrency(Number(value))} (${(props.payload as { count: number }).count} invoices)`,
                "Amount",
              ]}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
              {chartData.map((_entry, index) => (
                <Cell key={index} fill={AGING_COLORS[index % AGING_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
