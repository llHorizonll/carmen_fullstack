import { TENANT_ID } from './common'
import type { TenantSettingsDto } from '../../features/settings/company/types'
import type { LicenseDto } from '../../features/settings/license/types'

export const mockTenantSettings: TenantSettingsDto = {
  id: TENANT_ID,
  code: 'GRANDPARADISE',
  name: 'Grand Paradise Hotel',
  description: 'Five-star luxury hotel and convention center in the heart of Bangkok, offering 350 rooms, 3 restaurants, spa, and world-class event facilities.',
  address: '88 Sukhumvit Road, Soi 24, Klongton, Klongtoey, Bangkok 10110, Thailand',
  phone: '+66-2-555-0100',
  email: 'finance@grandparadise.com',
  taxId: '0105562000123',
  website: 'https://www.grandparadisehotel.com',
  baseCurrency: 'THB',
  defaultLanguage: 'th',
  timeZone: 'Asia/Bangkok',
  logoUrl: '/images/grand-paradise-logo.png',
  isActive: true,
  subscriptionExpiresAt: '2026-12-31T23:59:59Z',
  createdAt: '2024-01-15T08:00:00Z',
  updatedAt: '2025-11-20T14:00:00Z',
}

export const mockLicense: LicenseDto = {
  subscriptionPlan: 'Professional',
  subscriptionStatus: 'Active',
  subscriptionExpiresAt: '2026-12-31T23:59:59Z',
  maxUsers: 25,
  currentUsers: 6,
  maxAccounts: 500,
  currentAccounts: 187,
  isTrialMode: false,
  trialEndsAt: undefined,
  daysRemaining: 385,
}
