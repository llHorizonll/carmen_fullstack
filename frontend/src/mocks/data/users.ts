import { uuid } from './common'
import type {
  PermissionDto,
  PermissionGroupDto,
  RoleDto,
} from '../../features/settings/roles/types'
import type {
  UserDetailDto,
} from '../../features/settings/users/types'

// ── Permissions ─────────────────────────────────────────────

const glPermissions: PermissionDto[] = [
  { id: uuid('perm', 1),  code: 'GL.ChartOfAccounts.View',    name: 'View Chart of Accounts',    description: 'View GL chart of accounts',            module: 'General Ledger' },
  { id: uuid('perm', 2),  code: 'GL.ChartOfAccounts.Manage',  name: 'Manage Chart of Accounts',  description: 'Create/edit/delete GL accounts',        module: 'General Ledger' },
  { id: uuid('perm', 3),  code: 'GL.JournalVoucher.View',     name: 'View Journal Vouchers',     description: 'View journal vouchers',                 module: 'General Ledger' },
  { id: uuid('perm', 4),  code: 'GL.JournalVoucher.Create',   name: 'Create Journal Vouchers',   description: 'Create new journal vouchers',           module: 'General Ledger' },
  { id: uuid('perm', 5),  code: 'GL.JournalVoucher.Post',     name: 'Post Journal Vouchers',     description: 'Post journal vouchers to ledger',       module: 'General Ledger' },
  { id: uuid('perm', 6),  code: 'GL.FiscalPeriod.Manage',     name: 'Manage Fiscal Periods',     description: 'Open/close fiscal periods',             module: 'General Ledger' },
]

const apPermissions: PermissionDto[] = [
  { id: uuid('perm', 10), code: 'AP.Vendor.View',             name: 'View Vendors',              description: 'View vendor master data',               module: 'Accounts Payable' },
  { id: uuid('perm', 11), code: 'AP.Vendor.Manage',           name: 'Manage Vendors',            description: 'Create/edit vendors',                   module: 'Accounts Payable' },
  { id: uuid('perm', 12), code: 'AP.Invoice.View',            name: 'View AP Invoices',          description: 'View accounts payable invoices',        module: 'Accounts Payable' },
  { id: uuid('perm', 13), code: 'AP.Invoice.Create',          name: 'Create AP Invoices',        description: 'Create AP invoices',                    module: 'Accounts Payable' },
  { id: uuid('perm', 14), code: 'AP.Invoice.Approve',         name: 'Approve AP Invoices',       description: 'Approve AP invoices for payment',       module: 'Accounts Payable' },
  { id: uuid('perm', 15), code: 'AP.Payment.View',            name: 'View AP Payments',          description: 'View payment records',                  module: 'Accounts Payable' },
  { id: uuid('perm', 16), code: 'AP.Payment.Create',          name: 'Create AP Payments',        description: 'Create payment batches',                module: 'Accounts Payable' },
]

const arPermissions: PermissionDto[] = [
  { id: uuid('perm', 20), code: 'AR.Customer.View',           name: 'View Customers',            description: 'View customer master data',             module: 'Accounts Receivable' },
  { id: uuid('perm', 21), code: 'AR.Customer.Manage',         name: 'Manage Customers',          description: 'Create/edit customers',                 module: 'Accounts Receivable' },
  { id: uuid('perm', 22), code: 'AR.Invoice.View',            name: 'View AR Invoices',          description: 'View accounts receivable invoices',     module: 'Accounts Receivable' },
  { id: uuid('perm', 23), code: 'AR.Invoice.Create',          name: 'Create AR Invoices',        description: 'Create AR invoices',                    module: 'Accounts Receivable' },
  { id: uuid('perm', 24), code: 'AR.Receipt.View',            name: 'View AR Receipts',          description: 'View receipt records',                  module: 'Accounts Receivable' },
  { id: uuid('perm', 25), code: 'AR.Receipt.Create',          name: 'Create AR Receipts',        description: 'Record customer receipts',              module: 'Accounts Receivable' },
]

const amPermissions: PermissionDto[] = [
  { id: uuid('perm', 30), code: 'AM.Asset.View',              name: 'View Assets',               description: 'View fixed assets',                     module: 'Asset Management' },
  { id: uuid('perm', 31), code: 'AM.Asset.Manage',            name: 'Manage Assets',             description: 'Create/edit/dispose assets',            module: 'Asset Management' },
  { id: uuid('perm', 32), code: 'AM.Depreciation.Run',        name: 'Run Depreciation',          description: 'Run depreciation calculations',         module: 'Asset Management' },
]

const adminPermissions: PermissionDto[] = [
  { id: uuid('perm', 40), code: 'Settings.Company.Manage',    name: 'Manage Company Settings',   description: 'Update company/tenant settings',        module: 'Settings' },
  { id: uuid('perm', 41), code: 'Settings.Users.Manage',      name: 'Manage Users',              description: 'Create/edit/deactivate users',          module: 'Settings' },
  { id: uuid('perm', 42), code: 'Settings.Roles.Manage',      name: 'Manage Roles',              description: 'Create/edit roles and permissions',     module: 'Settings' },
  { id: uuid('perm', 43), code: 'Config.Manage',              name: 'Manage Configuration',      description: 'Manage currencies, tax, departments',   module: 'Configuration' },
  { id: uuid('perm', 44), code: 'Reports.View',               name: 'View Reports',              description: 'Generate and view reports',             module: 'Reports' },
  { id: uuid('perm', 45), code: 'Reports.Templates.Manage',   name: 'Manage Report Templates',   description: 'Create/edit custom report templates',   module: 'Reports' },
  { id: uuid('perm', 46), code: 'Workflow.Manage',            name: 'Manage Workflows',          description: 'Create/edit workflow definitions',      module: 'Workflow' },
  { id: uuid('perm', 47), code: 'Integration.BlueLedger',     name: 'BlueLedger Integration',    description: 'Manage BlueLedger sync and posting',    module: 'Integration' },
]

const allPermissions = [
  ...glPermissions,
  ...apPermissions,
  ...arPermissions,
  ...amPermissions,
  ...adminPermissions,
]

// ── Permission Groups ───────────────────────────────────────

export const mockPermissionGroups: PermissionGroupDto[] = [
  { module: 'General Ledger',      permissions: glPermissions },
  { module: 'Accounts Payable',    permissions: apPermissions },
  { module: 'Accounts Receivable', permissions: arPermissions },
  { module: 'Asset Management',    permissions: amPermissions },
  { module: 'Settings',            permissions: adminPermissions.filter((p) => p.module === 'Settings') },
  { module: 'Configuration',       permissions: adminPermissions.filter((p) => p.module === 'Configuration') },
  { module: 'Reports',             permissions: adminPermissions.filter((p) => p.module === 'Reports') },
  { module: 'Workflow',            permissions: adminPermissions.filter((p) => p.module === 'Workflow') },
  { module: 'Integration',         permissions: adminPermissions.filter((p) => p.module === 'Integration') },
]

// ── Roles ───────────────────────────────────────────────────

export const mockRoles: RoleDto[] = [
  {
    id: uuid('role', 1),
    name: 'Admin',
    description: 'Full system administrator with unrestricted access to all modules and settings.',
    isSystem: true,
    permissions: allPermissions,
    userCount: 1,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: undefined,
  },
  {
    id: uuid('role', 2),
    name: 'Finance Manager',
    description: 'Full access to GL, AP, AR, and Asset modules. Can approve transactions and run reports.',
    isSystem: false,
    permissions: [
      ...glPermissions,
      ...apPermissions,
      ...arPermissions,
      ...amPermissions,
      ...adminPermissions.filter((p) => p.code === 'Reports.View' || p.code === 'Reports.Templates.Manage'),
    ],
    userCount: 2,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
  },
  {
    id: uuid('role', 3),
    name: 'AP Clerk',
    description: 'Create and manage AP invoices and payments. View vendors. Cannot approve.',
    isSystem: false,
    permissions: [
      glPermissions[0], glPermissions[2], // View CoA, View JV
      ...apPermissions.filter((p) => !p.code.includes('Approve')),
      adminPermissions.find((p) => p.code === 'Reports.View')!,
    ],
    userCount: 1,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: undefined,
  },
  {
    id: uuid('role', 4),
    name: 'AR Clerk',
    description: 'Create and manage AR invoices and receipts. View customers.',
    isSystem: false,
    permissions: [
      glPermissions[0], glPermissions[2], // View CoA, View JV
      ...arPermissions,
      adminPermissions.find((p) => p.code === 'Reports.View')!,
    ],
    userCount: 2,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: undefined,
  },
]

// ── Users ───────────────────────────────────────────────────

export const mockUsers: UserDetailDto[] = [
  {
    id: uuid('user', 1),
    email: 'priya.c@grandparadise.com',
    firstName: 'Priya',
    lastName: 'Charoensuk',
    fullName: 'Priya Charoensuk',
    phone: '+66-2-555-0101',
    preferredLanguage: 'en',
    isActive: true,
    lastLoginAt: '2025-12-20T08:15:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    roles: [{ id: uuid('role', 1), name: 'Admin' }],
  },
  {
    id: uuid('user', 2),
    email: 'waraporn.t@grandparadise.com',
    firstName: 'Waraporn',
    lastName: 'Thongchai',
    fullName: 'Waraporn Thongchai',
    phone: '+66-2-555-0102',
    preferredLanguage: 'th',
    isActive: true,
    lastLoginAt: '2025-12-20T09:00:00Z',
    createdAt: '2024-01-20T08:00:00Z',
    roles: [{ id: uuid('role', 2), name: 'Finance Manager' }],
  },
  {
    id: uuid('user', 3),
    email: 'natthapong.s@grandparadise.com',
    firstName: 'Natthapong',
    lastName: 'Suwan',
    fullName: 'Natthapong Suwan',
    phone: '+66-2-555-0103',
    preferredLanguage: 'th',
    isActive: true,
    lastLoginAt: '2025-12-20T08:30:00Z',
    createdAt: '2024-02-01T08:00:00Z',
    roles: [{ id: uuid('role', 3), name: 'AP Clerk' }],
  },
  {
    id: uuid('user', 4),
    email: 'kanokwan.p@grandparadise.com',
    firstName: 'Kanokwan',
    lastName: 'Prasert',
    fullName: 'Kanokwan Prasert',
    phone: '+66-2-555-0104',
    preferredLanguage: 'th',
    isActive: true,
    lastLoginAt: '2025-12-19T17:00:00Z',
    createdAt: '2024-02-01T08:00:00Z',
    roles: [{ id: uuid('role', 2), name: 'Finance Manager' }],
  },
  {
    id: uuid('user', 5),
    email: 'david.chen@grandparadise.com',
    firstName: 'David',
    lastName: 'Chen',
    fullName: 'David Chen',
    phone: '+66-2-555-0105',
    preferredLanguage: 'en',
    isActive: true,
    lastLoginAt: '2025-12-18T16:45:00Z',
    createdAt: '2024-03-10T08:00:00Z',
    roles: [{ id: uuid('role', 4), name: 'AR Clerk' }],
  },
  {
    id: uuid('user', 6),
    email: 'siriporn.k@grandparadise.com',
    firstName: 'Siriporn',
    lastName: 'Kaewmanee',
    fullName: 'Siriporn Kaewmanee',
    phone: '+66-2-555-0106',
    preferredLanguage: 'th',
    isActive: true,
    lastLoginAt: '2025-12-20T07:50:00Z',
    createdAt: '2025-12-14T09:00:00Z',
    roles: [{ id: uuid('role', 4), name: 'AR Clerk' }],
  },
]
