import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  Scale,
  Landmark,
  TrendingUp,
  BookOpen,
  FileText,
  Clock,
  Package,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePredefinedReports } from "../hooks"
import type { PredefinedReportInfo } from "../types"

const iconMap: Record<string, React.ElementType> = {
  scale: Scale,
  landmark: Landmark,
  "trending-up": TrendingUp,
  "book-open": BookOpen,
  "file-text": FileText,
  clock: Clock,
  package: Package,
  calendar: Calendar,
}

export function PredefinedReportsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: reports, isLoading } = usePredefinedReports()

  // Group by category
  const grouped = (reports ?? []).reduce<Record<string, PredefinedReportInfo[]>>((acc, r) => {
    ;(acc[r.category] ??= []).push(r)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("reports.title")}</h1>
        <p className="text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        Object.entries(grouped).map(([category, categoryReports]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-xl font-semibold">{category}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryReports.map((report) => {
                const Icon = iconMap[report.icon] ?? FileText
                return (
                  <Card
                    key={report.type}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => navigate(`/reports/predefined/${report.type}`)}
                  >
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{report.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
