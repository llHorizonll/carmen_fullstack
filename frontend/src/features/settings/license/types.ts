// License DTOs
export interface LicenseDto {
  subscriptionPlan: string
  subscriptionStatus: string // Active, Expired, Trial, Suspended
  subscriptionExpiresAt?: string
  maxUsers: number
  currentUsers: number
  maxAccounts: number
  currentAccounts: number
  isTrialMode: boolean
  trialEndsAt?: string
  daysRemaining: number
}

// Subscription plan types
export type SubscriptionPlan = "Free" | "Professional" | "Enterprise"

// Subscription status types
export type SubscriptionStatus = "Active" | "Expired" | "Trial" | "Suspended"
