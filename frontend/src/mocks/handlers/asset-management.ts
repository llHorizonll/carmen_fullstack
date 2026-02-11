import { http, HttpResponse } from 'msw'
import { mockAssetCategories, mockAssetCategoryLookup } from '../data/asset-categories'
import { mockAssets, mockDepreciationSchedules } from '../data/assets'
import { paginate } from '../data/common'

export const assetHandlers = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Asset Categories
  // ═══════════════════════════════════════════════════════════════════════════

  // Category lookup
  http.get('*/v1/tenants/:tenantId/asset-categories/lookup', () => {
    return HttpResponse.json(mockAssetCategoryLookup)
  }),

  // Check category code
  http.get('*/v1/tenants/:tenantId/asset-categories/check-code/:categoryCode', () => {
    return HttpResponse.json({ isUnique: true })
  }),

  // Get category by code
  http.get('*/v1/tenants/:tenantId/asset-categories/by-code/:categoryCode', ({ params }) => {
    const found = mockAssetCategories.find((c) => c.categoryCode === params.categoryCode)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Next asset code for category
  http.get('*/v1/tenants/:tenantId/asset-categories/:categoryId/next-asset-code', ({ params }) => {
    const cat = mockAssetCategories.find((c) => c.id === params.categoryId)
    const prefix = cat?.assetCodePrefix ?? 'AST'
    const nextNum = (cat?.assetCount ?? 0) + 1
    return HttpResponse.json({ assetCode: `${prefix}-${String(nextNum).padStart(3, '0')}` })
  }),

  // List asset categories
  http.get('*/v1/tenants/:tenantId/asset-categories', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockAssetCategories]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (c) =>
          c.categoryCode.toLowerCase().includes(q) ||
          c.categoryName.toLowerCase().includes(q),
      )
    }

    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  // Get asset category by ID
  http.get('*/v1/tenants/:tenantId/asset-categories/:id', ({ params }) => {
    const found = mockAssetCategories.find((c) => c.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create asset category
  http.post('*/v1/tenants/:tenantId/asset-categories', () => {
    return HttpResponse.json(mockAssetCategories[0], { status: 201 })
  }),

  // Update asset category
  http.put('*/v1/tenants/:tenantId/asset-categories/:id', ({ params }) => {
    const found = mockAssetCategories.find((c) => c.id === params.id)
    return HttpResponse.json(found ?? mockAssetCategories[0])
  }),

  // Delete asset category
  http.delete('*/v1/tenants/:tenantId/asset-categories/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // Assets
  // ═══════════════════════════════════════════════════════════════════════════

  // Asset lookup
  http.get('*/v1/tenants/:tenantId/assets/lookup', () => {
    const lookup = mockAssets.map((a) => ({
      id: a.id,
      assetCode: a.assetCode,
      assetName: a.assetName,
      categoryCode: a.categoryCode,
      categoryName: a.categoryName,
      status: a.status,
      currentValue: a.currentValue,
    }))
    return HttpResponse.json(lookup)
  }),

  // Check asset code
  http.get('*/v1/tenants/:tenantId/assets/check-code/:assetCode', () => {
    return HttpResponse.json({ isUnique: true })
  }),

  // Next asset code
  http.get('*/v1/tenants/:tenantId/assets/next-code/:categoryId', ({ params }) => {
    const cat = mockAssetCategories.find((c) => c.id === params.categoryId)
    const prefix = cat?.assetCodePrefix ?? 'AST'
    const nextNum = (cat?.assetCount ?? 0) + 1
    return HttpResponse.json({ assetCode: `${prefix}-${String(nextNum).padStart(3, '0')}` })
  }),

  // Get asset by code
  http.get('*/v1/tenants/:tenantId/assets/by-code/:assetCode', ({ params }) => {
    const found = mockAssets.find((a) => a.assetCode === params.assetCode)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Asset register
  http.get('*/v1/tenants/:tenantId/assets/register', () => {
    const register = mockAssets.map((a) => ({
      id: a.id,
      assetCode: a.assetCode,
      assetName: a.assetName,
      categoryCode: a.categoryCode,
      categoryName: a.categoryName,
      departmentName: a.departmentName,
      acquisitionDate: a.acquisitionDate,
      acquisitionCost: a.acquisitionCost,
      accumulatedDepreciation: a.accumulatedDepreciation,
      currentValue: a.currentValue,
      status: a.status,
      currencyCode: a.currencyCode,
    }))
    return HttpResponse.json(register)
  }),

  // List assets
  http.get('*/v1/tenants/:tenantId/assets', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search')

    let items = [...mockAssets]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (a) =>
          a.assetCode.toLowerCase().includes(q) ||
          a.assetName.toLowerCase().includes(q),
      )
    }

    // Map to list DTO shape
    const listItems = items.map((a) => ({
      id: a.id,
      assetCode: a.assetCode,
      assetName: a.assetName,
      categoryCode: a.categoryCode,
      categoryName: a.categoryName,
      departmentName: a.departmentName,
      status: a.status,
      acquisitionDate: a.acquisitionDate,
      acquisitionCost: a.acquisitionCost,
      currentValue: a.currentValue,
      currencyCode: a.currencyCode,
      condition: a.condition,
      isFullyDepreciated: a.isFullyDepreciated,
      createdAt: a.createdAt,
    }))

    return HttpResponse.json(paginate(listItems, page, pageSize))
  }),

  // Get asset by ID
  http.get('*/v1/tenants/:tenantId/assets/:id', ({ params }) => {
    const found = mockAssets.find((a) => a.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),

  // Create asset
  http.post('*/v1/tenants/:tenantId/assets', () => {
    return HttpResponse.json(mockAssets[0], { status: 201 })
  }),

  // Update asset
  http.put('*/v1/tenants/:tenantId/assets/:id', ({ params }) => {
    const found = mockAssets.find((a) => a.id === params.id)
    return HttpResponse.json(found ?? mockAssets[0])
  }),

  // Delete asset
  http.delete('*/v1/tenants/:tenantId/assets/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Dispose asset
  http.post('*/v1/tenants/:tenantId/assets/:id/dispose', ({ params }) => {
    const found = mockAssets.find((a) => a.id === params.id)
    return HttpResponse.json({
      ...(found ?? mockAssets[0]),
      status: 2, // Disposed
      disposedAt: new Date().toISOString(),
      disposalValue: 5000,
      gainLossAmount: -500,
    })
  }),

  // Transfer asset
  http.post('*/v1/tenants/:tenantId/assets/:id/transfer', ({ params }) => {
    const found = mockAssets.find((a) => a.id === params.id)
    return HttpResponse.json(found ?? mockAssets[0])
  }),

  // Post disposal
  http.post('*/v1/tenants/:tenantId/assets/:id/post-disposal', ({ params }) => {
    const found = mockAssets.find((a) => a.id === params.id)
    return HttpResponse.json(found ?? mockAssets[0])
  }),

  // Recalculate asset value
  http.post('*/v1/tenants/:tenantId/assets/:id/recalculate', ({ params }) => {
    const found = mockAssets.find((a) => a.id === params.id)
    return HttpResponse.json(found ?? mockAssets[0])
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // Depreciation
  // ═══════════════════════════════════════════════════════════════════════════

  // Depreciation summary
  http.get('*/v1/tenants/:tenantId/depreciation/summary/:fiscalPeriodId', () => {
    return HttpResponse.json({
      fiscalPeriodId: '',
      fiscalPeriodName: 'November 2025',
      totalAssets: mockAssets.length,
      totalDepreciationAmount: mockAssets.reduce((sum, a) => sum + a.monthlyDepreciation, 0),
      postedCount: mockAssets.length - 3,
      unpostedCount: 3,
      currencyCode: 'USD',
    })
  }),

  // Depreciation forecast
  http.get('*/v1/tenants/:tenantId/depreciation/forecast/:assetId', ({ params }) => {
    const asset = mockAssets.find((a) => a.id === params.assetId)
    if (!asset) return HttpResponse.json([])

    const forecasts = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2025, 10 + i, 1)
      return {
        month: date.toISOString().slice(0, 7),
        depreciationAmount: asset.monthlyDepreciation,
        accumulatedDepreciation: asset.accumulatedDepreciation + asset.monthlyDepreciation * (i + 1),
        bookValue: Math.max(
          (asset.salvageValue ?? 0),
          asset.currentValue - asset.monthlyDepreciation * (i + 1),
        ),
      }
    })
    return HttpResponse.json(forecasts)
  }),

  // Calculate depreciation
  http.get('*/v1/tenants/:tenantId/depreciation/calculate/:assetId', ({ params }) => {
    const asset = mockAssets.find((a) => a.id === params.assetId)
    return HttpResponse.json({
      depreciationAmount: asset?.monthlyDepreciation ?? 0,
      assetId: params.assetId,
      periodEndDate: '2025-11-30',
    })
  }),

  // Generate schedule
  http.post('*/v1/tenants/:tenantId/depreciation/generate/:assetId', ({ params }) => {
    const asset = mockAssets.find((a) => a.id === params.assetId)
    return HttpResponse.json(asset?.depreciationSchedules ?? [])
  }),

  // Run monthly depreciation
  http.post('*/v1/tenants/:tenantId/depreciation/run', () => {
    return HttpResponse.json(mockDepreciationSchedules.slice(0, 5))
  }),

  // Post all depreciation for fiscal period
  http.post('*/v1/tenants/:tenantId/depreciation/post-all/:fiscalPeriodId', () => {
    return HttpResponse.json({
      postedCount: 12,
      message: 'Successfully posted depreciation for 12 assets',
    })
  }),

  // Get schedules by asset
  http.get('*/v1/tenants/:tenantId/depreciation/by-asset/:assetId', ({ params }) => {
    const schedules = mockDepreciationSchedules.filter((s) => s.assetId === params.assetId)
    return HttpResponse.json(schedules)
  }),

  // List depreciation schedules
  http.get('*/v1/tenants/:tenantId/depreciation/schedules', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')

    const listItems = mockDepreciationSchedules.map((s) => ({
      id: s.id,
      assetId: s.assetId,
      assetCode: s.assetCode,
      assetName: s.assetName,
      fiscalPeriodId: s.fiscalPeriodId,
      fiscalPeriodName: s.fiscalPeriodName,
      scheduleDate: s.scheduleDate,
      depreciationAmount: s.depreciationAmount,
      accumulatedDepreciation: s.accumulatedDepreciation,
      isPosted: s.isPosted,
      currencyCode: s.currencyCode,
    }))

    return HttpResponse.json(paginate(listItems, page, pageSize))
  }),

  // Post single schedule
  http.post('*/v1/tenants/:tenantId/depreciation/schedules/:id/post', ({ params }) => {
    const found = mockDepreciationSchedules.find((s) => s.id === params.id)
    return HttpResponse.json({
      ...(found ?? mockDepreciationSchedules[0]),
      isPosted: true,
      postedAt: new Date().toISOString(),
      postedBy: 'admin@carmen.hotel',
    })
  }),

  // Reverse schedule
  http.post('*/v1/tenants/:tenantId/depreciation/schedules/:id/reverse', ({ params }) => {
    const found = mockDepreciationSchedules.find((s) => s.id === params.id)
    return HttpResponse.json({
      ...(found ?? mockDepreciationSchedules[0]),
      isPosted: false,
      postedAt: undefined,
      postedBy: undefined,
    })
  }),

  // Get schedule by ID
  http.get('*/v1/tenants/:tenantId/depreciation/schedules/:id', ({ params }) => {
    const found = mockDepreciationSchedules.find((s) => s.id === params.id)
    if (!found) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(found)
  }),
]
