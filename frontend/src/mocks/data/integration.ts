import type { BlueLedgerStatusDto } from '../../features/integration/blueledger/types'

export const mockBlueLedgerStatus: BlueLedgerStatusDto = {
  isConnected: true,
  baseUrl: 'https://blueledger.grandparadise.com/api',
  lastSyncTime: '2025-12-20T06:00:00Z',
  pendingInventoryMovements: 12,
  pendingExtraCosts: 3,
  pendingReceivingDocuments: 5,
  errorMessage: null,
}
