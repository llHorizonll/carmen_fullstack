import { http, HttpResponse } from 'msw'
import { paginate } from '../data/common'
import {
  mockWorkflowDefinitions,
  mockPendingApprovals,
  mockApprovalHistory,
  mockWorkflowInstances,
} from '../data/workflows'

export const workflowHandlers = [
  // ── Definitions ─────────────────────────────────────────────

  // GET definitions list
  http.get('*/v1/tenants/:tenantId/workflows/definitions', () => {
    const list = mockWorkflowDefinitions.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      entityType: d.entityType,
      isDefault: d.isDefault,
      isActive: d.isActive,
      stepCount: d.steps.length,
    }))
    return HttpResponse.json(list)
  }),

  // GET definition by id
  http.get('*/v1/tenants/:tenantId/workflows/definitions/:id', ({ params }) => {
    const def = mockWorkflowDefinitions.find((d) => d.id === params.id)
    if (!def) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(def)
  }),

  // POST create definition
  http.post('*/v1/tenants/:tenantId/workflows/definitions', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 'new-workflow-def-id',
      ...body,
      isActive: true,
      createdAt: new Date().toISOString(),
    }, { status: 201 })
  }),

  // PUT update definition
  http.put('*/v1/tenants/:tenantId/workflows/definitions/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const existing = mockWorkflowDefinitions.find((d) => d.id === params.id)
    return HttpResponse.json({ ...existing, ...body })
  }),

  // DELETE definition
  http.delete('*/v1/tenants/:tenantId/workflows/definitions/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ── Pending Approvals ───────────────────────────────────────

  // GET pending approvals (paginated)
  http.get('*/v1/tenants/:tenantId/workflows/pending', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    return HttpResponse.json(paginate(mockPendingApprovals, page, pageSize))
  }),

  // ── Approval History ────────────────────────────────────────

  // GET approval history (paginated)
  http.get('*/v1/tenants/:tenantId/workflows/history', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    return HttpResponse.json(paginate(mockApprovalHistory, page, pageSize))
  }),

  // ── Instance Actions ────────────────────────────────────────

  // GET instance by id
  http.get('*/v1/tenants/:tenantId/workflows/instances/:instanceId', ({ params }) => {
    const inst = mockWorkflowInstances.find((i) => i.id === params.instanceId)
    if (!inst) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(inst)
  }),

  // POST approve
  http.post('*/v1/tenants/:tenantId/workflows/instances/:instanceId/approve', ({ params }) => {
    const inst = mockWorkflowInstances.find((i) => i.id === params.instanceId)
    return HttpResponse.json({ ...inst, status: 3 /* Approved */, completedAt: new Date().toISOString() })
  }),

  // POST reject
  http.post('*/v1/tenants/:tenantId/workflows/instances/:instanceId/reject', ({ params }) => {
    const inst = mockWorkflowInstances.find((i) => i.id === params.instanceId)
    return HttpResponse.json({ ...inst, status: 4 /* Rejected */, completedAt: new Date().toISOString() })
  }),

  // POST delegate
  http.post('*/v1/tenants/:tenantId/workflows/instances/:instanceId/delegate', ({ params }) => {
    const inst = mockWorkflowInstances.find((i) => i.id === params.instanceId)
    return HttpResponse.json({ ...inst })
  }),
]
