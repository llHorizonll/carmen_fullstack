import { http, HttpResponse } from 'msw'
import { mockBlueLedgerStatus } from '../data/integration'

export const integrationHandlers = [
  // GET BlueLedger status
  http.get('*/v1/tenants/:tenantId/integration/blueledger/status', () => {
    return HttpResponse.json(mockBlueLedgerStatus)
  }),

  // POST inventory post-to-gl
  http.post('*/v1/tenants/:tenantId/integration/blueledger/inventory/post-to-gl', () => {
    return HttpResponse.json({
      movementsProcessed: 12,
      journalVoucherId: 'jv-blueledger-' + Date.now(),
      totalAmount: 245800.50,
      errors: [],
    })
  }),

  // POST reconcile
  http.post('*/v1/tenants/:tenantId/integration/blueledger/reconcile', () => {
    return HttpResponse.json({
      reconciliationDate: new Date().toISOString().split('T')[0],
      inventoryMovementsCount: 12,
      extraCostsCount: 3,
      receivingDocumentsCount: 5,
      discrepancies: [],
    })
  }),

  // POST reconcile/schedule
  http.post('*/v1/tenants/:tenantId/integration/blueledger/reconcile/schedule', () => {
    return HttpResponse.json({
      jobId: 'job-reconcile-' + Date.now(),
      message: 'Reconciliation has been scheduled successfully.',
    })
  }),
]
