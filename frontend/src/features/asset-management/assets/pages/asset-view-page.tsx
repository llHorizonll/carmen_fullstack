import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Pencil, Loader2, Calculator, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useAsset, useRecalculateAssetValue } from "../hooks"
import { assetStatusLabels, depreciationMethodLabels, assetConditionLabels, AssetStatus } from "../types"

export function AssetViewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: asset, isLoading } = useAsset(id)
  const recalculate = useRecalculateAssetValue()

  const formatCurrency = (amount: number | undefined, currency?: string) => {
    if (amount === undefined) return "-"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusVariant = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.Active: return "default"
      case AssetStatus.Disposed: return "secondary"
      case AssetStatus.Sold: return "outline"
      case AssetStatus.WrittenOff: return "destructive"
      default: return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="size-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Asset not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/assets/list")}>
          Back to Assets
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/assets/list")}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{asset.assetCode}</h1>
              <Badge variant={getStatusVariant(asset.status)}>
                {assetStatusLabels[asset.status]}
              </Badge>
              {asset.isFullyDepreciated && (
                <Badge variant="outline">Fully Depreciated</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{asset.assetName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => recalculate.mutate(asset.id)}
            disabled={recalculate.isPending || asset.status !== AssetStatus.Active}
          >
            <Calculator className="mr-2 size-4" />
            Recalculate
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/assets/${asset.id}/edit`)}
            disabled={asset.status !== AssetStatus.Active}
          >
            <Pencil className="mr-2 size-4" />
            {t("common.edit")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{asset.categoryCode} - {asset.categoryName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <p className="font-medium">{assetConditionLabels[asset.condition]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-medium font-mono">{asset.serialNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Barcode</p>
                  <p className="font-medium font-mono">{asset.barcode || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{asset.locationDescription || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{asset.description || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Acquisition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{formatDate(asset.acquisitionDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost</span>
                  <span className="font-medium">
                    {formatCurrency(asset.acquisitionCost, asset.currencyCode)}
                  </span>
                </div>
                {asset.vendorName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendor</span>
                    <span className="font-medium">{asset.vendorCode} - {asset.vendorName}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acquisition Cost</span>
                  <span className="font-medium">
                    {formatCurrency(asset.acquisitionCost, asset.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accumulated Depreciation</span>
                  <span className="font-medium text-red-600">
                    ({formatCurrency(asset.accumulatedDepreciation, asset.currencyCode)})
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Net Book Value</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(asset.currentValue, asset.currencyCode)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Depreciation Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Method</p>
                  <p className="font-medium">{depreciationMethodLabels[asset.depreciationMethod]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Useful Life</p>
                  <p className="font-medium">
                    {Math.floor(asset.usefulLifeMonths / 12)} years {asset.usefulLifeMonths % 12} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salvage Value</p>
                  <p className="font-medium">{formatCurrency(asset.salvageValue, asset.currencyCode)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Depreciation</p>
                  <p className="font-medium">{formatCurrency(asset.monthlyDepreciation, asset.currencyCode)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDate(asset.depreciationStartDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Months Depreciated</p>
                  <p className="font-medium">{asset.depreciatedMonths} / {asset.usefulLifeMonths}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Schedule</CardTitle>
              <CardDescription>
                {asset.depreciationSchedules?.length || 0} schedule entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Opening</TableHead>
                    <TableHead className="text-right">Depreciation</TableHead>
                    <TableHead className="text-right">Closing</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asset.depreciationSchedules?.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{schedule.scheduleNumber}</TableCell>
                      <TableCell>{schedule.fiscalPeriodName}</TableCell>
                      <TableCell>{formatDate(schedule.scheduleDate)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(schedule.openingValue, asset.currencyCode)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(schedule.depreciationAmount, asset.currencyCode)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(schedule.closingValue, asset.currencyCode)}
                      </TableCell>
                      <TableCell>
                        {schedule.isPosted ? (
                          <Badge variant="default">Posted</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!asset.depreciationSchedules || asset.depreciationSchedules.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No depreciation schedules yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
