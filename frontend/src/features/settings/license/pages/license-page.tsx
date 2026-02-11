import { useTranslation } from "react-i18next"
import { KeyRound, Users, BookOpen, AlertTriangle, Clock, CheckCircle2, XCircle, Timer } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { useLicense } from "../hooks"
import type { SubscriptionStatus } from "../types"

// Status badge variants
const statusVariants: Record<SubscriptionStatus, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  Active: { variant: "default", icon: <CheckCircle2 className="size-3" /> },
  Trial: { variant: "secondary", icon: <Timer className="size-3" /> },
  Expired: { variant: "destructive", icon: <XCircle className="size-3" /> },
  Suspended: { variant: "destructive", icon: <XCircle className="size-3" /> },
}

// Plan badge colors
const planColors: Record<string, string> = {
  Free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  Professional: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Enterprise: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

export function LicensePage() {
  const { t } = useTranslation()
  const { data: license, isLoading, error } = useLicense()

  if (isLoading) {
    return <LicensePageSkeleton />
  }

  if (error || !license) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{t("messages.error")}</AlertTitle>
          <AlertDescription>
            {t("settings.license.loadError", "Failed to load license information")}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const usersPercentage = Math.round((license.currentUsers / license.maxUsers) * 100)
  const accountsPercentage = Math.round((license.currentAccounts / license.maxAccounts) * 100)
  const statusConfig = statusVariants[license.subscriptionStatus as SubscriptionStatus] || statusVariants.Active

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("common.noData", "N/A")
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <KeyRound className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("settings.license.title", "License & Subscription")}
          </h1>
          <p className="text-muted-foreground">
            {t("settings.license.subtitle", "View your subscription plan and usage")}
          </p>
        </div>
      </div>

      {/* Trial Warning Banner */}
      {license.isTrialMode && license.daysRemaining >= 0 && (
        <Alert variant={license.daysRemaining <= 7 ? "destructive" : "default"}>
          <Timer className="size-4" />
          <AlertTitle>{t("settings.license.trialMode", "Trial Mode")}</AlertTitle>
          <AlertDescription>
            {license.daysRemaining > 0 ? (
              t("settings.license.trialDaysRemaining", "Your trial ends in {{days}} days. Upgrade now to continue using all features.", { days: license.daysRemaining })
            ) : (
              t("settings.license.trialExpired", "Your trial has expired. Please upgrade to continue.")
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Expired Warning */}
      {license.subscriptionStatus === "Expired" && !license.isTrialMode && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{t("settings.license.subscriptionExpired", "Subscription Expired")}</AlertTitle>
          <AlertDescription>
            {t("settings.license.subscriptionExpiredDesc", "Your subscription has expired. Please renew to continue using all features.")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Plan Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-5" />
              {t("settings.license.subscriptionPlan", "Subscription Plan")}
            </CardTitle>
            <CardDescription>
              {t("settings.license.planDescription", "Your current plan and subscription status")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("settings.license.plan", "Plan")}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${planColors[license.subscriptionPlan] || planColors.Free}`}>
                {t(`settings.license.plans.${license.subscriptionPlan.toLowerCase()}`, license.subscriptionPlan)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("settings.license.status", "Status")}
              </span>
              <Badge variant={statusConfig.variant} className="gap-1">
                {statusConfig.icon}
                {t(`settings.license.statuses.${license.subscriptionStatus.toLowerCase()}`, license.subscriptionStatus)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("settings.license.expiresAt", "Expires At")}
              </span>
              <span className="text-sm font-medium">
                {license.isTrialMode
                  ? formatDate(license.trialEndsAt)
                  : formatDate(license.subscriptionExpiresAt)}
              </span>
            </div>

            {license.daysRemaining >= 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("settings.license.daysRemaining", "Days Remaining")}
                </span>
                <span className={`text-sm font-medium ${license.daysRemaining <= 7 ? "text-destructive" : license.daysRemaining <= 30 ? "text-yellow-600" : ""}`}>
                  {license.daysRemaining} {t("common.days", "days")}
                </span>
              </div>
            )}

            {license.daysRemaining === -1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("settings.license.daysRemaining", "Days Remaining")}
                </span>
                <span className="text-sm font-medium text-green-600">
                  {t("settings.license.unlimited", "Unlimited")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              {t("settings.license.usage", "Usage")}
            </CardTitle>
            <CardDescription>
              {t("settings.license.usageDescription", "Current usage of your license limits")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Users Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {t("settings.license.users", "Users")}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {license.currentUsers} / {license.maxUsers}
                </span>
              </div>
              <Progress
                value={usersPercentage}
                className={usersPercentage >= 90 ? "[&>div]:bg-destructive" : usersPercentage >= 75 ? "[&>div]:bg-yellow-500" : ""}
              />
              <p className="text-xs text-muted-foreground">
                {usersPercentage}% {t("settings.license.used", "used")}
              </p>
            </div>

            {/* Accounts Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {t("settings.license.accounts", "Chart of Accounts")}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {license.currentAccounts} / {license.maxAccounts}
                </span>
              </div>
              <Progress
                value={accountsPercentage}
                className={accountsPercentage >= 90 ? "[&>div]:bg-destructive" : accountsPercentage >= 75 ? "[&>div]:bg-yellow-500" : ""}
              />
              <p className="text-xs text-muted-foreground">
                {accountsPercentage}% {t("settings.license.used", "used")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Contact Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.license.needHelp", "Need Help?")}</CardTitle>
          <CardDescription>
            {t("settings.license.supportDescription", "Contact our support team for license inquiries")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("settings.license.supportContact", "For license upgrades, renewals, or any questions, please contact our support team at")}{" "}
            <a href="mailto:support@carmen.com" className="text-primary hover:underline">
              support@carmen.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function LicensePageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
