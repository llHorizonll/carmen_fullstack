import type { CustomerListDto, CustomerLookupDto, CustomerAgingSummaryDto } from '@/features/accounts-receivable/customers/types'
import { uuid } from './common'

// ---------------------------------------------------------------------------
// 8 Realistic Thai Hotel Customers (Corporate / OTA / Event / Government)
// ---------------------------------------------------------------------------

export const mockCustomers: CustomerListDto[] = [
  {
    id: uuid('cust', 1),
    customerCode: 'C-001',
    customerName: 'Accenture Solutions (Thailand) Ltd.',
    customerNameLocal: 'บริษัท แอคเซนเชอร์ โซลูชั่นส์ (ไทยแลนด์) จำกัด',
    taxId: '0105545078910',
    phone: '02-263-2600',
    email: 'ap.thailand@accenture.com',
    currencyCode: 'THB',
    currentBalance: 345000,
    isActive: true,
    createdAt: '2024-03-15T08:00:00Z',
  },
  {
    id: uuid('cust', 2),
    customerCode: 'C-002',
    customerName: 'Toyota Motor Thailand Co., Ltd.',
    customerNameLocal: 'บริษัท โตโยต้า มอเตอร์ ประเทศไทย จำกัด',
    taxId: '0105526002381',
    phone: '02-386-1000',
    email: 'events@toyota.co.th',
    currencyCode: 'THB',
    currentBalance: 520000,
    isActive: true,
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: uuid('cust', 3),
    customerCode: 'C-003',
    customerName: 'Agoda Company Pte. Ltd.',
    customerNameLocal: undefined,
    taxId: '0993000123456',
    phone: '02-625-9000',
    email: 'partner.payments@agoda.com',
    currencyCode: 'THB',
    currentBalance: 178500,
    isActive: true,
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: uuid('cust', 4),
    customerCode: 'C-004',
    customerName: 'Booking.com B.V.',
    customerNameLocal: undefined,
    taxId: '0993000654321',
    phone: undefined,
    email: 'invoices@booking.com',
    currencyCode: 'THB',
    currentBalance: 92000,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: uuid('cust', 5),
    customerCode: 'C-005',
    customerName: 'Grand Events & MICE Co., Ltd.',
    customerNameLocal: 'บริษัท แกรนด์ อีเวนท์ แอนด์ ไมซ์ จำกัด',
    taxId: '0105558034567',
    phone: '02-168-7890',
    email: 'accounting@grandevents.co.th',
    currencyCode: 'THB',
    currentBalance: 285000,
    isActive: true,
    createdAt: '2024-04-20T08:00:00Z',
  },
  {
    id: uuid('cust', 6),
    customerCode: 'C-006',
    customerName: 'Ministry of Tourism and Sports',
    customerNameLocal: 'กระทรวงการท่องเที่ยวและกีฬา',
    taxId: '0994000100016',
    phone: '02-283-1500',
    email: 'procurement@mots.go.th',
    currencyCode: 'THB',
    currentBalance: 450000,
    isActive: true,
    createdAt: '2024-05-01T08:00:00Z',
  },
  {
    id: uuid('cust', 7),
    customerCode: 'C-007',
    customerName: 'Kasikorn Bank Public Co., Ltd.',
    customerNameLocal: 'ธนาคารกสิกรไทย จำกัด (มหาชน)',
    taxId: '0107536000218',
    phone: '02-888-8888',
    email: 'events.corp@kasikornbank.com',
    currencyCode: 'THB',
    currentBalance: 135000,
    isActive: true,
    createdAt: '2024-06-01T08:00:00Z',
  },
  {
    id: uuid('cust', 8),
    customerCode: 'C-008',
    customerName: 'PTT Exploration and Production',
    customerNameLocal: 'บริษัท ปตท. สำรวจและผลิตปิโตรเลียม จำกัด (มหาชน)',
    taxId: '0107537000491',
    phone: '02-537-4000',
    email: 'travel@pttep.com',
    currencyCode: 'THB',
    currentBalance: 68000,
    isActive: true,
    createdAt: '2024-07-10T08:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Customer Lookup (for dropdowns)
// ---------------------------------------------------------------------------

export const mockCustomerLookup: CustomerLookupDto[] = mockCustomers.map((c) => ({
  id: c.id,
  customerCode: c.customerCode,
  customerName: c.customerName,
  currencyCode: c.currencyCode,
  taxId: c.taxId,
}))

// ---------------------------------------------------------------------------
// Customer Aging Summary
// ---------------------------------------------------------------------------

export const mockCustomerAgingSummary: CustomerAgingSummaryDto[] = [
  { customerId: uuid('cust', 1), customerCode: 'C-001', customerName: 'Accenture Solutions (Thailand) Ltd.',  current: 145000, days1To30: 120000, days31To60: 55000,  days61To90: 25000,  days90Plus: 0,      totalBalance: 345000 },
  { customerId: uuid('cust', 2), customerCode: 'C-002', customerName: 'Toyota Motor Thailand Co., Ltd.',      current: 250000, days1To30: 180000, days31To60: 65000,  days61To90: 25000,  days90Plus: 0,      totalBalance: 520000 },
  { customerId: uuid('cust', 3), customerCode: 'C-003', customerName: 'Agoda Company Pte. Ltd.',              current: 98500,  days1To30: 52000,  days31To60: 28000,  days61To90: 0,      days90Plus: 0,      totalBalance: 178500 },
  { customerId: uuid('cust', 4), customerCode: 'C-004', customerName: 'Booking.com B.V.',                     current: 62000,  days1To30: 30000,  days31To60: 0,      days61To90: 0,      days90Plus: 0,      totalBalance: 92000 },
  { customerId: uuid('cust', 5), customerCode: 'C-005', customerName: 'Grand Events & MICE Co., Ltd.',        current: 85000,  days1To30: 120000, days31To60: 50000,  days61To90: 30000,  days90Plus: 0,      totalBalance: 285000 },
  { customerId: uuid('cust', 6), customerCode: 'C-006', customerName: 'Ministry of Tourism and Sports',       current: 150000, days1To30: 200000, days31To60: 80000,  days61To90: 20000,  days90Plus: 0,      totalBalance: 450000 },
  { customerId: uuid('cust', 7), customerCode: 'C-007', customerName: 'Kasikorn Bank Public Co., Ltd.',       current: 85000,  days1To30: 50000,  days31To60: 0,      days61To90: 0,      days90Plus: 0,      totalBalance: 135000 },
  { customerId: uuid('cust', 8), customerCode: 'C-008', customerName: 'PTT Exploration and Production',       current: 68000,  days1To30: 0,      days31To60: 0,      days61To90: 0,      days90Plus: 0,      totalBalance: 68000 },
]
