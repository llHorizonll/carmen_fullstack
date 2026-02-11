// Job status DTO
export interface JobStatusDto {
  jobId: string
  jobName: string
  status: string
  lastExecution?: string
  nextExecution?: string
  lastError?: string
  successCount: number
  failureCount: number
}

// Job history entry DTO
export interface JobHistoryDto {
  jobId: string
  jobName: string
  executedAt: string
  duration: string // TimeSpan as string
  success: boolean
  errorMessage?: string
}

// Request DTOs
export interface TriggerDepreciationRequest {
  fiscalPeriodId: string
  autoPost?: boolean
}

export interface TriggerRecurringVouchersRequest {
  processDate?: string
}

export interface TriggerAmortizationRequest {
  fiscalPeriodId: string
  autoPost?: boolean
}

// Response DTOs
export interface JobTriggerResponse {
  jobId: string
  message: string
  enqueuedAt: string
}

// Query parameters
export interface JobHistoryQueryParams {
  page?: number
  pageSize?: number
}
