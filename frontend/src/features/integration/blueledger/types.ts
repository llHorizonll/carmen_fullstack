export interface BlueLedgerStatusDto {
  isConnected: boolean
  baseUrl: string | null
  lastSyncTime: string | null
  pendingInventoryMovements: number
  pendingExtraCosts: number
  pendingReceivingDocuments: number
  errorMessage: string | null
}

export interface PostInventoryToGlRequest {
  fromDate: string
  toDate: string
}

export interface PostInventoryToGlResponse {
  movementsProcessed: number
  journalVoucherId: string | null
  totalAmount: number
  errors: string[]
}

export interface PostExtraCostRequest {
  chargeId: string
  accountId: string
  departmentId?: string | null
  notes?: string | null
}

export interface PostExtraCostResponse {
  success: boolean
  chargeId: string
  folioNumber: string
  amount: number
  errorMessage: string | null
}

export interface ImportReceivingDocumentRequest {
  receivingId: string
}

export interface ImportReceivingDocumentResponse {
  success: boolean
  apInvoiceId: string | null
  invoiceNumber: string | null
  errorMessage: string | null
}

export interface BlueLedgerReconciliationRequest {
  reconciliationDate: string
}

export interface BlueLedgerReconciliationResponse {
  reconciliationDate: string
  inventoryMovementsCount: number
  extraCostsCount: number
  receivingDocumentsCount: number
  discrepancies: string[]
}
