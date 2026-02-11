import type { VendorListDto, VendorLookupDto, VendorAgingSummaryDto } from '@/features/accounts-payable/vendors/types'
import { uuid } from './common'

// ---------------------------------------------------------------------------
// 10 Realistic Thai Hotel Vendors
// ---------------------------------------------------------------------------

export const mockVendors: VendorListDto[] = [
  {
    id: uuid('vend', 1),
    vendorCode: 'V-001',
    vendorName: 'Siam Makro Public Co., Ltd.',
    vendorNameLocal: 'บริษัท สยามแม็คโคร จำกัด (มหาชน)',
    taxId: '0107536000382',
    phone: '02-067-8999',
    email: 'corporate@siammakro.co.th',
    currencyCode: 'THB',
    currentBalance: 185400,
    isActive: true,
    createdAt: '2024-06-01T08:00:00Z',
  },
  {
    id: uuid('vend', 2),
    vendorCode: 'V-002',
    vendorName: 'CP Foods Public Co., Ltd.',
    vendorNameLocal: 'บริษัท ซีพีเอฟ จำกัด (มหาชน)',
    taxId: '0107537002567',
    phone: '02-625-8000',
    email: 'sales@cpfood.co.th',
    currencyCode: 'THB',
    currentBalance: 92750,
    isActive: true,
    createdAt: '2024-06-01T08:00:00Z',
  },
  {
    id: uuid('vend', 3),
    vendorCode: 'V-003',
    vendorName: 'Thai Cleaning Products Co., Ltd.',
    vendorNameLocal: 'บริษัท ไทย คลีนนิ่ง โปรดักส์ จำกัด',
    taxId: '0105548012345',
    phone: '02-318-7654',
    email: 'orders@thaiclean.co.th',
    currencyCode: 'THB',
    currentBalance: 34200,
    isActive: true,
    createdAt: '2024-07-15T08:00:00Z',
  },
  {
    id: uuid('vend', 4),
    vendorCode: 'V-004',
    vendorName: 'Bangkok Linen Supply Co., Ltd.',
    vendorNameLocal: 'บริษัท บางกอก ลินิน ซัพพลาย จำกัด',
    taxId: '0105551098765',
    phone: '02-234-5678',
    email: 'contact@bkklinen.co.th',
    currencyCode: 'THB',
    currentBalance: 67500,
    isActive: true,
    createdAt: '2024-06-10T08:00:00Z',
  },
  {
    id: uuid('vend', 5),
    vendorCode: 'V-005',
    vendorName: 'Siam Cement Group (SCG)',
    vendorNameLocal: 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)',
    taxId: '0107501000087',
    phone: '02-586-3333',
    email: 'maintenance@scg.com',
    currencyCode: 'THB',
    currentBalance: 125000,
    isActive: true,
    createdAt: '2024-08-01T08:00:00Z',
  },
  {
    id: uuid('vend', 6),
    vendorCode: 'V-006',
    vendorName: 'Metropolitan Electricity Authority',
    vendorNameLocal: 'การไฟฟ้านครหลวง',
    taxId: '0994000165564',
    phone: '1130',
    email: 'service@mea.or.th',
    currencyCode: 'THB',
    currentBalance: 78300,
    isActive: true,
    createdAt: '2024-06-01T08:00:00Z',
  },
  {
    id: uuid('vend', 7),
    vendorCode: 'V-007',
    vendorName: 'Provincial Waterworks Authority',
    vendorNameLocal: 'การประปาส่วนภูมิภาค',
    taxId: '0994000200418',
    phone: '1662',
    email: 'service@pwa.co.th',
    currencyCode: 'THB',
    currentBalance: 12400,
    isActive: true,
    createdAt: '2024-06-01T08:00:00Z',
  },
  {
    id: uuid('vend', 8),
    vendorCode: 'V-008',
    vendorName: 'Thai Beverage Public Co., Ltd.',
    vendorNameLocal: 'บริษัท ไทยเบฟเวอเรจ จำกัด (มหาชน)',
    taxId: '0107547000401',
    phone: '02-785-5555',
    email: 'hospitality@thaibev.com',
    currencyCode: 'THB',
    currentBalance: 54800,
    isActive: true,
    createdAt: '2024-07-01T08:00:00Z',
  },
  {
    id: uuid('vend', 9),
    vendorCode: 'V-009',
    vendorName: 'AIS (Advanced Info Service)',
    vendorNameLocal: 'บริษัท แอดวานซ์ อินโฟร์ เซอร์วิส จำกัด',
    taxId: '0107535000265',
    phone: '1175',
    email: 'corporate@ais.co.th',
    currencyCode: 'THB',
    currentBalance: 8900,
    isActive: true,
    createdAt: '2024-06-01T08:00:00Z',
  },
  {
    id: uuid('vend', 10),
    vendorCode: 'V-010',
    vendorName: 'Diversey Thailand Co., Ltd.',
    vendorNameLocal: 'บริษัท ไดเวอร์ซีย์ ประเทศไทย จำกัด',
    taxId: '0105539087654',
    phone: '02-769-8800',
    email: 'orders.th@diversey.com',
    currencyCode: 'THB',
    currentBalance: 26300,
    isActive: true,
    createdAt: '2024-09-01T08:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Vendor Lookup (for dropdowns)
// ---------------------------------------------------------------------------

export const mockVendorLookup: VendorLookupDto[] = mockVendors.map((v) => ({
  id: v.id,
  vendorCode: v.vendorCode,
  vendorName: v.vendorName,
  currencyCode: v.currencyCode,
  taxId: v.taxId,
}))

// ---------------------------------------------------------------------------
// Vendor Aging Summary
// ---------------------------------------------------------------------------

export const mockVendorAgingSummary: VendorAgingSummaryDto[] = [
  { vendorId: uuid('vend', 1), vendorCode: 'V-001', vendorName: 'Siam Makro Public Co., Ltd.',          current: 85400,  days1To30: 62000,  days31To60: 28000,  days61To90: 10000, days90Plus: 0,     totalBalance: 185400 },
  { vendorId: uuid('vend', 2), vendorCode: 'V-002', vendorName: 'CP Foods Public Co., Ltd.',             current: 42750,  days1To30: 35000,  days31To60: 15000,  days61To90: 0,     days90Plus: 0,     totalBalance: 92750 },
  { vendorId: uuid('vend', 3), vendorCode: 'V-003', vendorName: 'Thai Cleaning Products Co., Ltd.',      current: 18200,  days1To30: 16000,  days31To60: 0,      days61To90: 0,     days90Plus: 0,     totalBalance: 34200 },
  { vendorId: uuid('vend', 4), vendorCode: 'V-004', vendorName: 'Bangkok Linen Supply Co., Ltd.',        current: 35000,  days1To30: 22500,  days31To60: 10000,  days61To90: 0,     days90Plus: 0,     totalBalance: 67500 },
  { vendorId: uuid('vend', 5), vendorCode: 'V-005', vendorName: 'Siam Cement Group (SCG)',               current: 75000,  days1To30: 50000,  days31To60: 0,      days61To90: 0,     days90Plus: 0,     totalBalance: 125000 },
  { vendorId: uuid('vend', 6), vendorCode: 'V-006', vendorName: 'Metropolitan Electricity Authority',    current: 78300,  days1To30: 0,      days31To60: 0,      days61To90: 0,     days90Plus: 0,     totalBalance: 78300 },
  { vendorId: uuid('vend', 7), vendorCode: 'V-007', vendorName: 'Provincial Waterworks Authority',       current: 12400,  days1To30: 0,      days31To60: 0,      days61To90: 0,     days90Plus: 0,     totalBalance: 12400 },
  { vendorId: uuid('vend', 8), vendorCode: 'V-008', vendorName: 'Thai Beverage Public Co., Ltd.',        current: 28800,  days1To30: 18000,  days31To60: 8000,   days61To90: 0,     days90Plus: 0,     totalBalance: 54800 },
  { vendorId: uuid('vend', 9), vendorCode: 'V-009', vendorName: 'AIS (Advanced Info Service)',            current: 8900,   days1To30: 0,      days31To60: 0,      days61To90: 0,     days90Plus: 0,     totalBalance: 8900 },
  { vendorId: uuid('vend', 10), vendorCode: 'V-010', vendorName: 'Diversey Thailand Co., Ltd.',          current: 12300,  days1To30: 14000,  days31To60: 0,      days61To90: 0,     days90Plus: 0,     totalBalance: 26300 },
]
