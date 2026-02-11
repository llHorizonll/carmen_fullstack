import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardMetricDto } from "../types"

type StatCardProps = {
  title: string
  metric?: DashboardMetricDto
  icon: React.ElementType
  description: string
  isLoading?: boolean
  formatValue?: (value: number, currencyCode: string) => string
}

function defaultFormat(value: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function StatCard({
  title,
  metric,
  icon: Icon,
  description,
  isLoading,
  formatValue = defaultFormat,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    )
  }

  if (!metric) return null

  const trend = metric.changePercent > 0 ? "up" : metric.changePercent < 0 ? "down" : undefined
  const trendValue = metric.changePercent !== 0
    ? `${metric.changePercent > 0 ? "+" : ""}${metric.changePercent.toFixed(1)}%`
    : undefined

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(metric.currentValue, metric.currencyCode)}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {trend && trendValue && (
            <>
              {trend === "up" ? (
                <TrendingUp className="size-3 text-green-500" />
              ) : (
                <TrendingDown className="size-3 text-red-500" />
              )}
              <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                {trendValue}
              </span>
            </>
          )}
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}
