// Tenant Settings DTOs
export interface TenantSettingsDto {
  id: string
  code: string
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  taxId?: string
  website?: string
  baseCurrency: string
  defaultLanguage: string
  timeZone: string
  logoUrl?: string
  isActive: boolean
  subscriptionExpiresAt?: string
  createdAt: string
  updatedAt?: string
}

// Request DTOs
export interface UpdateTenantSettingsRequest {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  taxId?: string
  website?: string
  baseCurrency: string
  defaultLanguage: string
  timeZone: string
  logoUrl?: string
}
