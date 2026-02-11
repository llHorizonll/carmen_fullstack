import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { TopAccountDto } from "../types"

type TopExpensesProps = {
  accounts: TopAccountDto[]
  isLoading?: boolean
}

export function TopExpenses({ accounts, isLoading }: TopExpensesProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.charts.topExpenses")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!accounts.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.charts.topExpenses")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("dashboard.charts.noData")}</p>
        </CardContent>
      </Card>
    )
  }

  const maxAmount = Math.max(...accounts.map((a) => a.amount))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.topExpenses")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account, index) => {
            const percent = maxAmount > 0 ? (account.amount / maxAmount) * 100 : 0
            return (
              <div key={account.accountCode} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {index + 1}. {account.accountCode} - {account.accountName}
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(account.amount)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
