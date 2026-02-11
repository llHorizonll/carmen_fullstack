import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Receipt,
  Users,
  Building2,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Cog,
  Percent,
  DollarSign,
  Clock,
  Network,
  KeyRound,
  Calculator,
  CalendarDays,
  TrendingDown,
  Timer,
  RotateCw,
  CheckSquare,
  History,
  GitBranch,
  Link2,
  BarChart3,
} from "lucide-react"

import { useAuthStore } from "@/stores/auth-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type NavItem = {
  titleKey: string
  href: string
  icon: React.ElementType
  permission?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    titleKey: "navigation.dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    titleKey: "navigation.generalLedger",
    href: "/gl",
    icon: BookOpen,
    children: [
      { titleKey: "navigation.journalVouchers", href: "/gl/journal-vouchers", icon: FileText },
      { titleKey: "navigation.chartOfAccounts", href: "/gl/accounts", icon: BookOpen },
      { titleKey: "navigation.accountSummary", href: "/gl/accounts/summary", icon: Calculator },
      { titleKey: "navigation.trialBalance", href: "/gl/trial-balance", icon: FileText },
      { titleKey: "navigation.fiscalPeriods", href: "/gl/fiscal-periods", icon: CalendarDays },
      { titleKey: "navigation.recurringVouchers", href: "/gl/recurring-vouchers", icon: RotateCw },
    ],
  },
  {
    titleKey: "navigation.accountsPayable",
    href: "/ap",
    icon: Receipt,
    children: [
      { titleKey: "navigation.vendors", href: "/ap/vendors", icon: Building2 },
      { titleKey: "navigation.invoices", href: "/ap/invoices", icon: FileText },
      { titleKey: "navigation.payments", href: "/ap/payments", icon: Receipt },
      { titleKey: "navigation.aging", href: "/ap/aging", icon: TrendingDown },
    ],
  },
  {
    titleKey: "navigation.accountsReceivable",
    href: "/ar",
    icon: Users,
    children: [
      { titleKey: "navigation.customers", href: "/ar/customers", icon: Users },
      { titleKey: "navigation.invoices", href: "/ar/invoices", icon: FileText },
      { titleKey: "navigation.receipts", href: "/ar/receipts", icon: Receipt },
    ],
  },
  {
    titleKey: "navigation.assetManagement",
    href: "/assets",
    icon: Package,
    children: [
      { titleKey: "navigation.assetCategories", href: "/assets/categories", icon: Package },
      { titleKey: "navigation.assets", href: "/assets/list", icon: Package },
      { titleKey: "navigation.depreciation", href: "/assets/depreciation", icon: FileText },
    ],
  },
  {
    titleKey: "navigation.reports",
    href: "/reports",
    icon: BarChart3,
    permission: "Reports.View",
    children: [
      { titleKey: "navigation.predefinedReports", href: "/reports/predefined", icon: FileText, permission: "Reports.View" },
      { titleKey: "navigation.customReports", href: "/reports/custom", icon: FileText, permission: "Reports.View" },
      { titleKey: "navigation.reportBuilder", href: "/reports/builder", icon: BarChart3, permission: "Reports.Create" },
    ],
  },
  {
    titleKey: "navigation.approvals",
    href: "/approvals",
    icon: CheckSquare,
    children: [
      { titleKey: "navigation.pendingApprovals", href: "/approvals", icon: CheckSquare },
      { titleKey: "navigation.approvalHistory", href: "/approvals/history", icon: History },
    ],
  },
]

const bottomNavigation: NavItem[] = [
  {
    titleKey: "navigation.integration",
    href: "/integration",
    icon: Link2,
    children: [
      { titleKey: "navigation.blueLedger", href: "/integration/blueledger", icon: Link2 },
    ],
  },
  {
    titleKey: "navigation.configuration",
    href: "/configuration",
    icon: Cog,
    children: [
      { titleKey: "navigation.taxProfiles", href: "/configuration/tax-profiles", icon: Percent },
      { titleKey: "navigation.currencies", href: "/configuration/currencies", icon: DollarSign },
      { titleKey: "navigation.paymentTerms", href: "/configuration/payment-terms", icon: Clock },
      { titleKey: "navigation.departments", href: "/configuration/departments", icon: Network },
    ],
  },
  {
    titleKey: "navigation.settings",
    href: "/settings",
    icon: Settings,
    children: [
      { titleKey: "navigation.company", href: "/settings/company", icon: Building2 },
      { titleKey: "navigation.license", href: "/settings/license", icon: KeyRound },
      { titleKey: "navigation.users", href: "/settings/users", icon: Users },
      { titleKey: "navigation.roles", href: "/settings/roles", icon: Shield },
      { titleKey: "navigation.jobs", href: "/settings/jobs", icon: Timer },
      { titleKey: "navigation.workflows", href: "/settings/workflows", icon: GitBranch },
    ],
  },
]

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { hasPermission } = useAuthStore()
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([])

  const toggleGroup = (href: string) => {
    setExpandedGroups((prev) =>
      prev.includes(href)
        ? prev.filter((h) => h !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/")
  }

  const renderNavItem = (item: NavItem, isChild = false) => {
    // Skip items the user doesn't have permission for
    if (item.permission && !hasPermission(item.permission)) return null

    const Icon = item.icon
    const active = isActive(item.href)
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedGroups.includes(item.href)
    const title = t(item.titleKey)

    const content = (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isChild && "ml-6 text-xs",
          collapsed && !isChild && "justify-center px-2"
        )}
      >
        <Icon className={cn("size-4 shrink-0", collapsed && !isChild && "size-5")} />
        {!collapsed && <span className="truncate">{title}</span>}
        {!collapsed && hasChildren && (
          <ChevronRight
            className={cn(
              "ml-auto size-4 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        )}
      </div>
    )

    if (collapsed && !isChild) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link to={item.href}>{content}</Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {title}
          </TooltipContent>
        </Tooltip>
      )
    }

    // Filter children by permission
    const visibleChildren = item.children?.filter(
      (child) => !child.permission || hasPermission(child.permission)
    )
    const hasVisibleChildren = visibleChildren && visibleChildren.length > 0

    if (hasVisibleChildren && !collapsed) {
      return (
        <div key={item.href}>
          <button
            onClick={() => toggleGroup(item.href)}
            className="w-full"
          >
            {content}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {visibleChildren.map((child) => renderNavItem(child, true))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link key={item.href} to={item.href}>
        {content}
      </Link>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <BookOpen className="size-6 text-primary" />
              <span>Carmen</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="mx-auto">
              <BookOpen className="size-6 text-primary" />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => renderNavItem(item))}
          </nav>
        </ScrollArea>

        <Separator />

        {/* Bottom Navigation */}
        <div className="px-3 py-4">
          <nav className="space-y-1">
            {bottomNavigation.map((item) => renderNavItem(item))}
          </nav>
        </div>

        {/* Toggle Button */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
