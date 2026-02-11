import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  BookOpen,
  Receipt,
  Users,
  Package,
  DollarSign,
  Calendar,
} from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "../components/stat-card"
import { RevenueChart } from "../components/revenue-chart"
import { AgingChart } from "../components/aging-chart"
import { TopExpenses } from "../components/top-expenses"
import { useDashboardSummary } from "../hooks"

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useDashboardSummary()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">
          {t("dashboard.welcome")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.stats.totalRevenue")}
          metric={data?.totalRevenue}
          icon={DollarSign}
          description={t("dashboard.stats.fromLastMonth")}
          isLoading={isLoading}
        />
        <StatCard
          title={t("dashboard.stats.accountsPayable")}
          metric={data?.apOutstanding}
          icon={Receipt}
          description={t("dashboard.stats.outstanding")}
          isLoading={isLoading}
        />
        <StatCard
          title={t("dashboard.stats.accountsReceivable")}
          metric={data?.arOutstanding}
          icon={Users}
          description={t("dashboard.stats.outstanding")}
          isLoading={isLoading}
        />
        <StatCard
          title={t("dashboard.stats.totalAssets")}
          metric={data?.totalAssets}
          icon={Package}
          description={t("dashboard.stats.netBookValue")}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RevenueChart
          revenueTrend={data?.revenueTrend ?? []}
          expenseTrend={data?.expenseTrend ?? []}
          isLoading={isLoading}
        />
        <TopExpenses
          accounts={data?.topExpenseAccounts ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* Aging Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <AgingChart
          title={t("dashboard.charts.apAging")}
          data={data?.apAgingSummary ?? []}
          isLoading={isLoading}
        />
        <AgingChart
          title={t("dashboard.charts.arAging")}
          data={data?.arAgingSummary ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/general-ledger/journal-vouchers/new")}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{t("dashboard.actions.journalEntry")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("dashboard.actions.createNewEntry")}</p>
            </div>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/accounts-payable/invoices/new")}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Receipt className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{t("dashboard.actions.apInvoice")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("dashboard.actions.enterVendorInvoice")}</p>
            </div>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/accounts-receivable/invoices/new")}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{t("dashboard.actions.arInvoice")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("dashboard.actions.createCustomerInvoice")}</p>
            </div>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/reports")}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{t("dashboard.actions.reports")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("dashboard.actions.viewFinancialReports")}</p>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
