import { authHandlers } from './handlers/auth'
import { dashboardHandlers } from './handlers/dashboard'
import { glHandlers } from './handlers/general-ledger'
import { apHandlers } from './handlers/accounts-payable'
import { arHandlers } from './handlers/accounts-receivable'
import { assetHandlers } from './handlers/asset-management'
import { configHandlers } from './handlers/configuration'
import { settingsHandlers } from './handlers/settings'
import { workflowHandlers } from './handlers/workflow'
import { jobHandlers } from './handlers/jobs'
import { notificationHandlers } from './handlers/notifications'
import { reportHandlers } from './handlers/reports'
import { integrationHandlers } from './handlers/integration'

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...glHandlers,
  ...apHandlers,
  ...arHandlers,
  ...assetHandlers,
  ...configHandlers,
  ...settingsHandlers,
  ...workflowHandlers,
  ...jobHandlers,
  ...notificationHandlers,
  ...reportHandlers,
  ...integrationHandlers,
]
