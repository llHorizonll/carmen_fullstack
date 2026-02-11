import { uuid } from './common'
import type {
  NotificationDto,
  NotificationPreferenceDto,
  NotificationType,
  NotificationPriority,
} from '../../features/notifications/types'

export const mockNotifications: NotificationDto[] = [
  {
    id: uuid('notf', 1),
    userId: uuid('user', 2),
    type: 1 as NotificationType, // Approval
    priority: 3 as NotificationPriority, // High
    title: 'Approval Required: AP Invoice AP-2025-0088',
    message: 'Natthapong Suwan submitted AP Invoice AP-2025-0088 for USD 12,500 from Hobart Thailand Co., Ltd. awaiting your approval.',
    actionUrl: '/ap/invoices/AP-2025-0088',
    entityType: 'APInvoice',
    entityId: uuid('apiv', 88),
    isRead: false,
    readAt: undefined,
    data: undefined,
    createdAt: '2025-12-19T14:15:00Z',
  },
  {
    id: uuid('notf', 2),
    userId: uuid('user', 2),
    type: 2 as NotificationType, // Alert
    priority: 4 as NotificationPriority, // Urgent
    title: 'Payment Overdue: Carrier Refrigeration Thailand',
    message: 'Invoice AP-2025-0072 for USD 8,200 is 15 days past due. Payment term was Net 30. Please arrange payment.',
    actionUrl: '/ap/invoices/AP-2025-0072',
    entityType: 'APInvoice',
    entityId: uuid('apiv', 72),
    isRead: false,
    readAt: undefined,
    data: undefined,
    createdAt: '2025-12-18T08:00:00Z',
  },
  {
    id: uuid('notf', 3),
    userId: uuid('user', 2),
    type: 3 as NotificationType, // System
    priority: 2 as NotificationPriority, // Normal
    title: 'System Update: Carmen v2.4.0 Released',
    message: 'Carmen has been updated to version 2.4.0. New features include automated bank reconciliation and improved OCR accuracy. See release notes for details.',
    actionUrl: '/settings/about',
    entityType: undefined,
    entityId: undefined,
    isRead: true,
    readAt: '2025-12-17T10:30:00Z',
    data: undefined,
    createdAt: '2025-12-17T06:00:00Z',
  },
  {
    id: uuid('notf', 4),
    userId: uuid('user', 2),
    type: 1 as NotificationType, // Approval
    priority: 3 as NotificationPriority, // High
    title: 'Approval Required: Journal Voucher JV-2025-0043',
    message: 'Kanokwan Prasert submitted JV-2025-0043 (Accrued Expenses - December) for USD 45,000 awaiting your review.',
    actionUrl: '/gl/journal-vouchers/JV-2025-0043',
    entityType: 'JournalVoucher',
    entityId: uuid('jvch', 43),
    isRead: false,
    readAt: undefined,
    data: undefined,
    createdAt: '2025-12-20T10:00:00Z',
  },
  {
    id: uuid('notf', 5),
    userId: uuid('user', 2),
    type: 4 as NotificationType, // Report
    priority: 1 as NotificationPriority, // Low
    title: 'Report Ready: November Trial Balance',
    message: 'Your scheduled Trial Balance report for November 2025 has been generated and is ready for download.',
    actionUrl: '/reports/predefined/TrialBalance',
    entityType: 'Report',
    entityId: undefined,
    isRead: true,
    readAt: '2025-12-16T09:00:00Z',
    data: undefined,
    createdAt: '2025-12-15T02:00:00Z',
  },
  {
    id: uuid('notf', 6),
    userId: uuid('user', 2),
    type: 2 as NotificationType, // Alert
    priority: 3 as NotificationPriority, // High
    title: 'AR Collection Reminder: Silk Travel Agency',
    message: 'AR Invoice AR-2025-0034 for USD 28,000 is due in 3 days. Contact Silk Travel Agency for payment confirmation.',
    actionUrl: '/ar/invoices/AR-2025-0034',
    entityType: 'ARInvoice',
    entityId: uuid('ariv', 34),
    isRead: false,
    readAt: undefined,
    data: undefined,
    createdAt: '2025-12-19T08:00:00Z',
  },
  {
    id: uuid('notf', 7),
    userId: uuid('user', 2),
    type: 5 as NotificationType, // User
    priority: 2 as NotificationPriority, // Normal
    title: 'New User Added: Siriporn Kaewmanee',
    message: 'A new user Siriporn Kaewmanee (siriporn.k@grandparadise.com) has been added with AR Clerk role.',
    actionUrl: '/settings/users',
    entityType: 'User',
    entityId: uuid('user', 6),
    isRead: true,
    readAt: '2025-12-14T11:00:00Z',
    data: undefined,
    createdAt: '2025-12-14T09:00:00Z',
  },
  {
    id: uuid('notf', 8),
    userId: uuid('user', 2),
    type: 3 as NotificationType, // System
    priority: 2 as NotificationPriority, // Normal
    title: 'Fiscal Period Closing Reminder',
    message: 'November 2025 fiscal period is ready for closing. Please ensure all transactions are posted before initiating period close.',
    actionUrl: '/gl/fiscal-periods',
    entityType: 'FiscalPeriod',
    entityId: undefined,
    isRead: false,
    readAt: undefined,
    data: undefined,
    createdAt: '2025-12-20T07:00:00Z',
  },
]

export const mockNotificationPreferences: NotificationPreferenceDto[] = [
  {
    id: uuid('nprf', 1),
    type: 1 as NotificationType,
    typeName: 'Approval',
    inAppEnabled: true,
    emailEnabled: true,
  },
  {
    id: uuid('nprf', 2),
    type: 2 as NotificationType,
    typeName: 'Alert',
    inAppEnabled: true,
    emailEnabled: true,
  },
  {
    id: uuid('nprf', 3),
    type: 3 as NotificationType,
    typeName: 'System',
    inAppEnabled: true,
    emailEnabled: false,
  },
  {
    id: uuid('nprf', 4),
    type: 4 as NotificationType,
    typeName: 'Report',
    inAppEnabled: true,
    emailEnabled: true,
  },
  {
    id: uuid('nprf', 5),
    type: 5 as NotificationType,
    typeName: 'User',
    inAppEnabled: true,
    emailEnabled: false,
  },
]
