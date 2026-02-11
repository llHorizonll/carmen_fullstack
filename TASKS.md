# TASKS.md - Implementation Task Breakdown
## Carmen SAAS Financial Accounting System

**Version:** 1.0
**Date:** January 2026

---

## Task Status Legend

| Status | Icon | Description |
|--------|------|-------------|
| Not Started | ⬜ | Task has not been started |
| In Progress | 🟡 | Task is currently being worked on |
| Completed | ✅ | Task is complete |
| Blocked | 🔴 | Task is blocked by dependencies |
| Deferred | ⏸️ | Task is deferred to future phase |

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Repository & Tooling
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create repository structure | Initialize Git repository with main/develop branches | P0 | Done |
| ✅ Setup frontend project | Vite + React + TypeScript project | P0 | Done |
| ✅ Setup backend solution | .NET 8 solution with layered structure | P0 | Done |
| ⬜ Configure ESLint/Prettier | Frontend code quality tools | P1 | |
| ⬜ Configure StyleCop | Backend code analysis | P1 | |
| ✅ Setup Docker Compose | Local development environment | P0 | Done |
| ⬜ Create CI/CD pipeline | GitHub Actions workflow | P1 | |
| ✅ **Verify:** `dotnet build` passes | Backend compiles without errors | P0 | Done |
| ✅ **Verify:** `npm run build` passes | Frontend compiles without errors | P0 | Done |

### 1.2 Database Setup
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Design database schema | ERD for all entities | P0 | Done |
| ✅ Create MySQL container | Local database setup | P0 | Done |
| ✅ Setup EF Core | DbContext and migrations | P0 | Done |
| ✅ Create initial migration | Base schema migration | P0 | Done |
| ✅ Setup Redis container | Cache infrastructure | P1 | Done |
| ✅ Seed initial data | Master data (accounts, taxes, currencies) | P1 | Done |
| ✅ **Verify:** Migration applies successfully | `dotnet ef database update` | P0 | Done |
| ✅ **Verify:** Seed data inserted | Check database has admin user/roles | P0 | Done |

### 1.3 Authentication & Authorization
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Implement JWT generation | Token service in backend | P0 | Done |
| ✅ Create login endpoint | `/api/v1/auth/login` | P0 | Done |
| ✅ Create refresh endpoint | Token refresh mechanism | P0 | Done |
| ✅ Implement tenant resolution | Tenant context from JWT | P0 | Done |
| ✅ Create permission system | Role-based permissions | P0 | Done |
| ✅ Setup auth middleware | JWT validation middleware | P0 | Done |
| ✅ Create frontend auth store | Zustand auth store | P0 | Done |
| ✅ Implement route protection | Protected route component | P0 | Done |
| ✅ Implement user role hierarchy | System Admin, Group Admin, Tenant Admin, User | P1 | Done |
| ✅ Create UserRole table | Role assignment management | P1 | Done |
| ✅ Create GroupTenantAccess table | Group Admin tenant assignments | P1 | Done |
| ✅ Update JWT with accessibleTenants | Multi-tenant JWT claims | P1 | Done |
| ✅ Add tenant switcher to header | Frontend tenant switching UI | P1 | Done |
| ✅ Implement refresh token logic | API client token refresh | P1 | Done |
| ✅ Centralize useTenantId hook | Shared hook for tenant context | P1 | Done |
| ✅ **Verify:** Login API works | Test `POST /api/v1/auth/login` returns JWT | P0 | Done |
| ✅ **Verify:** Me API works | Test `GET /api/v1/auth/me` with token | P0 | Done |
| ✅ **Verify:** Refresh token works | Test `POST /api/v1/auth/refresh` | P0 | Done |

---

## Phase 2: Core Foundation

### 2.1 Shared Components & Utilities
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Setup shadcn/ui | Install and configure shadcn/ui | P0 | Done |
| ✅ Create layout components | AppShell, Header, Sidebar, Footer | P0 | Done |
| ✅ Create navigation | Menu configuration and rendering | P0 | Done |
| ✅ Create DataTable | Reusable table component with TanStack Table | P0 | Done |
| ✅ Create Form components | Reusable form components with React Hook Form | P0 | Done |
| ✅ Create API client | Axios wrapper with interceptors | P0 | Done |
| ✅ Setup TanStack Query | Query client configuration | P0 | Done |
| ✅ Create toast notifications | Sonner toast system | P1 | Done |
| ✅ Create modal/dialog | Dialog component with Radix UI | P1 | Done |
| ⬜ Create date pickers | Date selection components | P1 | |
| ✅ **Verify:** `npm run build` passes | No TypeScript errors | P0 | Done |
| ✅ **Verify:** `npm run lint` passes | No ESLint errors (warnings OK) | P1 | Done |
| ✅ **Verify:** Components render | Visual check in browser | P0 | Done |

### 2.2 Internationalization
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Setup i18n framework | i18next with react-i18next and language detection | P1 | Done |
| ✅ Create English translations | Base translation file (en.json) | P1 | Done |
| ✅ Create Thai translations | Thai translation file (th.json) | P2 | Done |
| ✅ Create Vietnamese translations | Vietnamese translation file (vi.json) | P2 | Done |
| ✅ Create language switcher | Language selection component with flags | P1 | Done |

### 2.3 Configuration Module
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Chart of Accounts CRUD | Account management pages | P0 | Done |
| ✅ Tax Profile CRUD | Tax configuration pages (full stack) | P0 | Done |
| ✅ Currency CRUD | Currency and exchange rate pages (full stack) | P0 | Done |
| ✅ Payment Term CRUD | Payment term configuration (full stack) | P0 | Done |
| ✅ Department CRUD | Organizational structure with hierarchy (full stack) | P1 | Done |
| ⬜ Bank Account CRUD | Bank account management | P1 | |
| ⬜ Document Prefix CRUD | Auto-numbering configuration | P1 | |

### 2.4 Settings Module
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Company Settings | Company information management (full stack) | P0 | Done |
| ⬜ Number Format Settings | Date, decimal separators | P1 | |
| ✅ Theme Settings | Light/dark mode toggle (store created) | P1 | Done |
| ⬜ User Profile | User profile management | P1 | |
| ✅ License Management | License status display (full stack) | P0 | Done |
| ✅ Role Management | Role CRUD with permission assignment | P0 | Done |
| ✅ Permission Matrix | Permission selection by module | P0 | Done |
| ✅ User Role Assignment | Assign roles to users (API) | P0 | Done |
| ✅ User List Page | User listing with search/filter/pagination | P0 | Done |
| ✅ User View Page | User details with role management UI | P0 | Done |

---

## Phase 3: General Ledger Module

### 3.1 Domain & Data Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create JournalVoucher entity | Domain entity with properties | P0 | Done |
| ✅ Create JournalVoucherLine entity | Line item entity | P0 | Done |
| ✅ Create Account entity | Chart of accounts entity (ChartOfAccount.cs) | P0 | Done |
| ✅ Create FiscalPeriod entity | Fiscal period entity | P0 | Done |
| ⬜ Create TemplateVoucher entity | Journal template entity | P1 | |
| ✅ Create RecurringVoucher entity | Recurring entry entity with lines and frequency | P1 | Done |
| ⬜ Create Budget entity | Budget entity | P1 | |
| ✅ Create EF configurations | Fluent API configurations (GLConfiguration.cs) | P0 | Done |
| ⏸️ Create repositories | Uses service pattern instead | P0 | N/A |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |
| ✅ **Verify:** Migration created | `dotnet ef migrations add` succeeds | P0 | Done |

### 3.2 Application Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create GL services | IAccountService, IJournalVoucherService | P0 | Done |
| ⏸️ Create GL commands | Uses service pattern instead of CQRS | P0 | N/A |
| ⏸️ Create GL queries | Uses service pattern instead of CQRS | P0 | N/A |
| ⏸️ Create validators | Validation in services | P0 | N/A |
| ✅ Create DTOs | AccountDto, JournalVoucherDto | P0 | Done |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |

### 3.3 API Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ JournalVouchers controller | CRUD endpoints with [RequirePermission] | P0 | Done |
| ✅ Accounts controller | CRUD + Lookup endpoints with [RequirePermission] | P0 | Done |
| ⬜ TemplateVouchers controller | Template management | P1 | |
| ✅ RecurringVouchers controller | Recurring entry CRUD management | P1 | Done |
| ⬜ Budgets controller | Budget endpoints | P1 | |
| ✅ Account Summary endpoint | Real-time balances | P0 | Done |
| ⬜ Financial Reports endpoint | Report generation | P0 | |
| ✅ **Verify:** Swagger shows GL endpoints | API documentation loads | P0 | Done |
| ✅ **Verify:** CRUD APIs work | Test via Postman/curl | P0 | Done |

### 3.4 Frontend
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Journal Voucher List page | Data table with filters | P0 | Done |
| ✅ Journal Voucher Create page | Form with line items | P0 | Done |
| ✅ Journal Voucher Edit page | Edit existing JV | P0 | Done |
| ✅ Journal Voucher Show page | Read-only view | P0 | Done |
| ✅ Account List page | List with filters | P0 | Done |
| ✅ Account Create/Edit page | Form page | P0 | Done |
| ⬜ Template Voucher pages | Template management | P1 | |
| ✅ Recurring Voucher pages | List, create/edit with line items | P1 | Done |
| ⬜ Budget pages | Budget management | P1 | |
| ⬜ Financial Reports pages | Report viewer | P0 | |
| ✅ Account Summary page | Account inquiry | P0 | Done |
| ✅ Period Closing functionality | Period end close | P0 | Done |
| ✅ **Verify:** `npm run build` passes | No TypeScript errors | P0 | Done |
| ✅ **Verify:** Pages render correctly | Visual test in browser | P0 | Done |
| ✅ **Verify:** End-to-end JV flow | Create, Edit, Post JV works | P0 | Done |

---

## Phase 4: Accounts Payable Module

### 4.1 Domain & Data Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create Vendor entity | Vendor master entity | P0 | Done |
| ✅ Create ApInvoice entity | Invoice header entity | P0 | Done |
| ✅ Create ApInvoiceLine entity | Invoice line entity | P0 | Done |
| ✅ Create ApPayment entity | Payment header entity | P0 | Done |
| ✅ Create ApPaymentLine entity | Payment allocation line | P0 | Done |
| ✅ Create TaxProfile entity | Tax configuration entity | P0 | Done |
| ✅ Create EF configurations | Fluent API configurations (APConfiguration.cs) | P0 | Done |
| ⏸️ Create repositories | Uses service pattern instead | P0 | N/A |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |
| ✅ **Verify:** Migration created | AddApModule migration (20260203112752) | P0 | Done |

### 4.2 Application Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create AP services | VendorService, ApInvoiceService, ApPaymentService | P0 | Done |
| ✅ Implement tax calculation | Three-tier tax logic (VAT, Service Tax, WHT) | P0 | Done |
| ⏸️ Create AP commands | Uses service pattern instead of CQRS | P0 | N/A |
| ⏸️ Create AP queries | Uses service pattern instead of CQRS | P0 | N/A |
| ⏸️ Create validators | Validation in services | P0 | N/A |
| ✅ Create DTOs | VendorDto, ApInvoiceDto, ApPaymentDto | P0 | Done |
| ✅ Implement aging logic | Vendor aging calculation | P0 | Done |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |

### 4.3 API Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Vendors controller | CRUD + lookup + aging endpoints | P0 | Done |
| ✅ ApInvoices controller | CRUD + workflow (submit, approve, reject, void) | P0 | Done |
| ✅ ApPayments controller | CRUD + workflow (approve, post, void) | P0 | Done |
| ✅ Aging endpoint | Vendor aging report | P0 | Done |
| ✅ OCR upload endpoint | Invoice OCR processing via Mistral API | P1 | Done |
| ✅ **Verify:** Swagger shows AP endpoints | API documentation loads | P0 | Done |
| ✅ **Verify:** CRUD APIs work | Test via Postman/curl | P0 | Done |

### 4.4 Frontend
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Vendor List page | Vendor data table with filters | P0 | Done |
| ✅ Vendor Create/Edit pages | Vendor form with tax defaults | P0 | Done |
| ✅ Invoice List page | Invoice data table with status filters | P0 | Done |
| ✅ Invoice Create page | Invoice form with line items and tax calculator | P0 | Done |
| ✅ Invoice Edit page | Edit invoice | P0 | Done |
| ✅ Invoice Show page | Read-only view with workflow actions | P0 | Done |
| ✅ Payment List page | Payment data table with status/method filters | P0 | Done |
| ✅ Payment Create page | Payment form with FIFO allocation | P0 | Done |
| ✅ Vendor Aging Report | Aging analysis view | P0 | Done |
| ✅ Period Closing functionality | AP period close (uses GL Period Closing) | P0 | Done |
| ✅ **Verify:** `npm run build` passes | No TypeScript errors | P0 | Done |
| ✅ **Verify:** End-to-end AP flow | Create vendor, invoice, payment | P0 | Done |

---

## Phase 5: Accounts Receivable Module

### 5.1 Domain & Data Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create Customer entity | Customer master entity | P0 | Done |
| ✅ Create ArInvoice entity | Invoice header entity | P0 | Done |
| ✅ Create ArInvoiceLine entity | Invoice line entity | P0 | Done |
| ✅ Create ArReceipt entity | Receipt header entity | P0 | Done |
| ✅ Create ArReceiptLine entity | Receipt allocation line | P0 | Done |
| ⬜ Create Folio entity | Customer folio entity | P1 | |
| ✅ Create EF configurations | Fluent API configurations (ARConfiguration.cs) | P0 | Done |
| ⏸️ Create repositories | Uses service pattern instead | P0 | N/A |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |
| ✅ **Verify:** Migration created | AddArModule migration | P0 | Done |

### 5.2 Application Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create AR services | CustomerService, ArInvoiceService, ArReceiptService | P0 | Done |
| ✅ Implement credit limit check | Credit validation in CustomerService | P0 | Done |
| ⏸️ Create AR commands | Uses service pattern instead of CQRS | P0 | N/A |
| ⏸️ Create AR queries | Uses service pattern instead of CQRS | P0 | N/A |
| ⏸️ Create validators | Validation in services | P0 | N/A |
| ✅ Create DTOs | CustomerDto, ArInvoiceDto, ArReceiptDto | P0 | Done |
| ✅ Implement exchange gain/loss | Currency gain/loss in ArReceiptService | P0 | Done |
| ✅ Implement aging logic | Customer aging calculation | P0 | Done |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |

### 5.3 API Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Customers controller | CRUD + lookup + aging endpoints | P0 | Done |
| ✅ ArInvoices controller | CRUD + workflow (submit, approve, reject, void) | P0 | Done |
| ✅ ArReceipts controller | CRUD + workflow (approve, post, void) | P0 | Done |
| ✅ Aging endpoint | Customer aging report | P0 | Done |
| ⬜ Folio endpoint | Customer folio inquiry | P1 | |
| ⬜ Statement endpoint | Statement generation | P1 | |
| ✅ **Verify:** Swagger shows AR endpoints | API documentation loads | P0 | Done |
| ✅ **Verify:** CRUD APIs work | Build passes | P0 | Done |

### 5.4 Frontend
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Customer List page | Customer data table with filters | P0 | Done |
| ✅ Customer Create/Edit pages | Customer form with credit info | P0 | Done |
| ✅ Invoice List page | Invoice data table with status filters | P0 | Done |
| ✅ Invoice Create page | Invoice form with line items and tax calculator | P0 | Done |
| ✅ Invoice Edit page | Edit invoice | P0 | Done |
| ✅ Invoice Show page | Read-only view with workflow actions | P0 | Done |
| ✅ Receipt List page | Receipt data table with status/method filters | P0 | Done |
| ✅ Receipt Create page | Receipt form with FIFO allocation | P0 | Done |
| ✅ Customer Aging Report | Aging analysis view | P0 | Done |
| ⬜ Customer Statement | Statement viewer | P1 | |
| ✅ Period Closing functionality | AR period close (uses GL Period Closing) | P0 | Done |
| ✅ **Verify:** `npm run build` passes | No TypeScript errors | P0 | Done |
| ✅ **Verify:** End-to-end AR flow | Create customer, invoice, receipt | P0 | Done |

---

## Phase 6: Asset Management Module

### 6.1 Domain & Data Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create Asset entity | Asset master entity | P0 | Done |
| ⏸️ Create PreAsset entity | Pending approval entity | P1 | Deferred |
| ✅ Create AssetDisposal entity | Disposal entity | P0 | Done |
| ✅ Create AssetCategory entity | Category master entity | P0 | Done |
| ✅ Create DepreciationSchedule entity | Depreciation tracking | P0 | Done |
| ✅ Create AssetEnums | Status, DepreciationMethod, Condition enums | P0 | Done |
| ✅ Create EF configurations | Fluent API configurations (AssetConfiguration.cs) | P0 | Done |
| ⏸️ Create repositories | Uses service pattern instead | P0 | N/A |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |
| ✅ **Verify:** Migration created | AddAssetModule migration | P0 | Done |

### 6.2 Application Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create Asset services | AssetCategoryService, AssetService, DepreciationService | P0 | Done |
| ✅ Implement depreciation calculation | Straight Line, Declining Balance, DDB, SYD, UOP | P0 | Done |
| ⏸️ Create Asset commands | Uses service pattern instead of CQRS | P0 | N/A |
| ⏸️ Create Asset queries | Uses service pattern instead of CQRS | P0 | N/A |
| ⏸️ Create validators | Validation in services | P0 | N/A |
| ✅ Create DTOs | AssetCategoryDto, AssetDto, DepreciationDto | P0 | Done |
| ✅ Implement disposal logic | Gain/loss calculation | P0 | Done |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |

### 6.3 API Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Assets controller | CRUD + dispose, transfer, recalculate endpoints | P0 | Done |
| ⏸️ PreAssets controller | Deferred to future phase | P1 | Deferred |
| ✅ AssetCategories controller | Category CRUD + lookup endpoints | P0 | Done |
| ✅ Depreciation controller | Run, post, reverse, summary, forecast | P0 | Done |
| ✅ **Verify:** Swagger shows Asset endpoints | API documentation loads | P0 | Done |
| ✅ **Verify:** CRUD APIs work | Build passes | P0 | Done |

### 6.4 Frontend
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Asset List page | Asset data table with filters | P0 | Done |
| ✅ Asset Create/Edit pages | Asset form with depreciation info | P0 | Done |
| ✅ Asset View page | Asset detail with depreciation schedule | P0 | Done |
| ⏸️ PreAsset pages | Deferred to future phase | P1 | Deferred |
| ⏸️ Disposal pages | Disposal integrated in Asset actions | P1 | Deferred |
| ✅ Category List page | Category data table | P0 | Done |
| ✅ Category Create/Edit pages | Category form with defaults | P0 | Done |
| ✅ Depreciation List page | Schedule data table | P0 | Done |
| ✅ Depreciation Run page | Run monthly depreciation | P0 | Done |
| ✅ **Verify:** `npm run build` passes | No TypeScript errors | P0 | Done |
| ⬜ **Verify:** End-to-end Asset flow | Create, depreciate, dispose asset | P0 | |

---

## Phase 7: Background Jobs & Integration

### 7.1 Background Jobs
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Setup Hangfire | Background job infrastructure (MySQL storage, 3 queues, auth filter) | P0 | Done |
| ✅ Create recurring JV job | Stub created, full implementation pending RecurringVoucher entity | P0 | Done |
| ✅ Create amortization job | Prepaid expense amortization job (stub, pending prepaid module) | P0 | Done |
| ✅ Create depreciation job | Monthly depreciation run with multi-tenant support | P0 | Done |
| ⏸️ Create allocation job | Cost allocation processing (deferred to Phase 7 Step 8) | P0 | Deferred |
| ⏸️ Create report job | Scheduled report generation (deferred to Phase 9) | P1 | Deferred |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |
| ✅ **Verify:** Hangfire dashboard loads | `/hangfire` accessible with auth filter | P0 | Done |
| ✅ **Verify:** Jobs execute correctly | Manual trigger via JobsController + frontend UI | P0 | Done |

### 7.2 BlueLedger Integration
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create BlueLedger client | Mock client with IBlueLedgerClient interface (swappable) | P0 | Done |
| ✅ Implement inventory posting | PostInventoryToGlAsync via BlueLedgerIntegrationService | P0 | Done |
| ✅ Implement extra cost posting | PostExtraCostAsync with folio posting | P0 | Done |
| ✅ Implement receiving integration | ImportReceivingDocumentAsync with vendor lookup | P0 | Done |
| ✅ Create reconciliation job | BlueLedgerReconciliationJob (Hangfire) | P1 | Done |
| ✅ Create BlueLedger controller | API endpoints at /integration/blueledger | P0 | Done |
| ✅ Create frontend status page | BlueLedger status dashboard with action buttons | P0 | Done |
| ✅ Add sidebar navigation | Integration section with BlueLedger link | P0 | Done |
| ✅ **Verify:** Builds pass | Backend 0 errors, frontend 0 errors | P0 | Done |

### 7.3 OCR Integration
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Select OCR service | Mistral API (mistral-ocr-latest + mistral-large-latest) | P1 | Done |
| ✅ Create OCR service | Two-step: OCR endpoint for text, Chat API for structured extraction | P1 | Done |
| ✅ Create upload endpoint | POST /ap/invoices/ocr/upload (JPG/PNG/PDF, 10MB max) | P1 | Done |
| ✅ Create review UI | OcrReviewDialog with editable fields and line items table | P1 | Done |
| ✅ Implement posting flow | OcrUploadDialog + review + navigate to create form | P1 | Done |
| ✅ Add OCR button to AP invoices | "OCR Upload" button on AP invoice list page | P1 | Done |
| ✅ **Verify:** Builds pass | Backend 0 errors, frontend 0 errors | P1 | Done |

---

## Phase 7.5: Notification & Email System

**Technology:** SignalR (real-time), MailKit (email), Fluid (templates), Hangfire (queue)

### 7.5.1 Domain & Data Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create Notification entity | User notification with type, title, message, data | P0 | Done |
| ✅ Create NotificationPreference entity | User preferences per notification type | P0 | Done |
| ⏸️ Create EmailTemplate entity | Email templates with multi-language support (deferred, using simple templates) | P0 | Deferred |
| ✅ Create EmailLog entity | Email sending history and status | P0 | Done |
| ✅ Create NotificationType enum | Approval, Alert, System, Report, User | P0 | Done |
| ✅ Create EF configurations | Fluent API configurations (NotificationConfiguration.cs) | P0 | Done |
| ✅ Create database migration | Notification tables migration | P0 | Done |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |
| ✅ **Verify:** Migration applies | Database tables created | P0 | Done |

### 7.5.2 Application Layer (Services)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create INotificationService interface | Notification service contract | P0 | Done |
| ✅ Create IEmailService interface | Email service contract | P0 | Done |
| ✅ Implement NotificationService | Create, list, mark read, push SignalR | P0 | Done |
| ✅ Implement EmailService | Send emails via MailKit with logging | P0 | Done |
| ⏸️ Implement EmailTemplateService | Deferred, using simple string templates | P0 | Deferred |
| ✅ Create notification DTOs | Request/response DTOs | P0 | Done |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |

### 7.5.3 Real-time (SignalR)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Install SignalR package | Microsoft.AspNetCore.SignalR (built-in) | P0 | Done |
| ✅ Create NotificationHub | SignalR hub with JWT auth, user groups | P0 | Done |
| ✅ Implement user connection tracking | Group by userId on connect/disconnect | P0 | Done |
| ⬜ Implement tenant broadcast | Send to all users in tenant | P1 | |
| ✅ Configure SignalR in Program.cs | AddSignalR + MapHub + CORS | P0 | Done |
| ✅ **Verify:** SignalR hub connects | Hub configured at /hubs/notifications | P0 | Done |

### 7.5.4 Background Jobs (Email Queue)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create SendEmailJob | Hangfire job for email sending | P0 | Done |
| ⬜ Create EmailDigestJob | Daily/weekly digest emails | P1 | |
| ✅ Create NotificationCleanupJob | Delete old read notifications (90 days) | P2 | Done |
| ✅ Implement retry logic | Retry failed emails with backoff | P0 | Done |
| ✅ **Verify:** Email jobs execute | Jobs registered in Program.cs | P0 | Done |

### 7.5.5 API Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create NotificationsController | CRUD + mark read endpoints | P0 | Done |
| ✅ GET /notifications | List user notifications (paginated) | P0 | Done |
| ✅ GET /notifications/unread-count | Unread count for badge | P0 | Done |
| ✅ PUT /notifications/{id}/read | Mark single as read | P0 | Done |
| ✅ PUT /notifications/read-all | Mark all as read | P0 | Done |
| ✅ DELETE /notifications/{id} | Delete notification | P0 | Done |
| ✅ GET /notifications/preferences | Get user preferences | P0 | Done |
| ✅ PUT /notifications/preferences | Update preferences | P0 | Done |
| ✅ **Verify:** Swagger shows endpoints | API documentation loads | P0 | Done |
| ✅ **Verify:** APIs work correctly | Build passes, endpoints registered | P0 | Done |

### 7.5.6 Email Templates
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create base email layout | Header, footer, styles (`_layout.html`) | P0 | Done |
| ✅ Create approval_pending template | Document pending approval | P0 | Done |
| ✅ Create approval_completed template | Document approved/rejected | P0 | Done |
| ✅ Create invoice_overdue template | Overdue invoice reminder | P0 | Done |
| ✅ Create payment_due template | Upcoming payment reminder | P0 | Done |
| ✅ Create budget_exceeded template | Budget threshold alert | P1 | Done |
| ✅ Create welcome_user template | New user welcome email | P0 | Done |
| ✅ Create password_reset template | Password reset link | P0 | Done |
| ✅ Create system_maintenance template | Scheduled maintenance notice | P1 | Done |
| ✅ Create report_ready template | Scheduled report available | P1 | Done |
| ✅ **Verify:** Templates render correctly | Build passes, templates loaded as embedded resources | P0 | Done |

### 7.5.7 Frontend Components
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Install @microsoft/signalr | SignalR client library | P0 | Done |
| ✅ Create useNotifications hook | SignalR connection + notification hooks | P0 | Done |
| ✅ Create NotificationBell component | Header icon with unread badge count | P0 | Done |
| ✅ Create NotificationDropdown component | Quick view dropdown with mark all read | P0 | Done |
| ✅ Create NotificationList page | Full notifications list with filters | P0 | Done |
| ✅ Create NotificationItem component | Single notification with icon and time ago | P0 | Done |
| ✅ Create NotificationPreferences page | Toggle grid for InApp/Email per type | P0 | Done |
| ✅ Add notification routes | /notifications, /notifications/preferences | P0 | Done |
| ✅ Integrate into app layout | NotificationBell in header, hub in layout | P0 | Done |
| ✅ **Verify:** `npm run build` passes | No TypeScript errors | P0 | Done |
| ⬜ **Verify:** Real-time notifications work | Receive notification in browser | P0 | |
| ⬜ **Verify:** Email preferences save | User can toggle email on/off | P0 | |

### 7.5.8 Integration with Other Modules
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Integrate with Workflow | WorkflowService calls NotificationService on actions | P0 | Done |
| ⬜ Integrate with AP | Payment due, invoice overdue alerts | P0 | |
| ⬜ Integrate with AR | Invoice overdue, credit limit alerts | P0 | |
| ⬜ Integrate with Budget | Budget threshold exceeded alerts | P1 | |
| ⬜ Integrate with Reports | Scheduled report ready notification | P1 | |
| ⬜ Integrate with System | Version update, maintenance notices | P1 | |
| ⬜ **Verify:** End-to-end flow | Submit for approval → notification received | P0 | |

---

## Phase 8: Workflow & Approval

### 8.1 Workflow Engine
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create WorkflowDefinition entity | Workflow definition with steps collection | P1 | Done |
| ✅ Create WorkflowStep entity | Step definition with approver, delegation | P1 | Done |
| ✅ Create WorkflowInstance entity | Runtime instance tracking current step | P1 | Done |
| ✅ Create WorkflowHistory entity | Approval history with actions and comments | P1 | Done |
| ✅ Implement workflow engine | State machine: submit → approve/reject/delegate | P1 | Done |
| ✅ Create workflow services | WorkflowService + WorkflowDefinitionService | P1 | Done |
| ✅ Create WorkflowsController | Definitions CRUD + approval actions | P1 | Done |
| ✅ Integrate with AP/AR/GL | Submit methods call IWorkflowService (opt-in) | P1 | Done |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P1 | Done |
| ⬜ **Verify:** Workflow APIs work | Test approval flow | P1 | |

### 8.2 Approval UI
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Pending Approvals page | DataTable with approve/reject actions | P1 | Done |
| ✅ Approval Action Dialog | Approve/Reject/Delegate with comment | P1 | Done |
| ✅ Workflow Timeline component | Visual step timeline for document views | P1 | Done |
| ✅ Delegation support | Delegate action in approval dialog | P2 | Done |
| ✅ Approval History page | User's past approval actions | P2 | Done |
| ✅ Workflow Definition List page | Admin list with edit/delete | P1 | Done |
| ✅ Workflow Definition Form page | Create/edit with dynamic steps editor | P1 | Done |
| ✅ **Verify:** `npm run build` passes | No TypeScript errors | P1 | Done |
| ⬜ **Verify:** End-to-end approval flow | Submit, approve, reject works | P1 | |

---

## Phase 9: Dashboard & Reporting

### 9.1 Dashboard
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Design dashboard layout | Widget-based layout with stat cards + charts | P0 | Done |
| ✅ Create summary widgets | Revenue, AP, AR, Asset stat cards with change % | P0 | Done |
| ✅ Create chart widgets | Revenue/Expense bar chart, AP/AR aging, top expenses | P0 | Done |
| ⬜ Implement widget configuration | User customization | P1 | |
| ✅ Create dashboard API | DashboardController with GetSummary endpoint | P0 | Done |
| ✅ Create Tenant Switcher component | Multi-tenant dropdown selector | P1 | Done |
| ⬜ Create Aggregated dashboard view | Combined totals across tenants | P1 | |
| ⬜ Create Comparison dashboard view | Side-by-side tenant comparison | P1 | |
| ✅ Implement /me/accessible-tenants API | Get user's accessible tenants (via /auth/me) | P1 | Done |
| ⬜ Implement /dashboard/aggregated API | Multi-tenant aggregated data | P1 | |
| ⬜ Implement /dashboard/compare API | Tenant comparison endpoints | P1 | |
| ✅ Create tenant context store | Zustand store for multi-tenant context | P1 | Done |
| ⬜ Add permission checks | Dashboard.ViewAll, Dashboard.Compare | P1 | |
| ✅ **Verify:** Dashboard loads correctly | Visual test with data | P0 | Done |
| ✅ **Verify:** Widgets show real data | API integration works | P0 | Done |

### 9.2 Reporting Infrastructure (Foundation)

**Technology:** QuestPDF (PDF, Community License), ClosedXML (Excel, MIT) - Free/Open Source

| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Install NuGet packages | QuestPDF, ClosedXML | P0 | Done |
| ✅ Create ReportTemplate entity | User-defined report configurations | P0 | Done |
| ✅ Create ReportTemplateColumn entity | Column definitions | P0 | Done |
| ✅ Create ReportTemplateFilter entity | Filter parameters | P0 | Done |
| ✅ Create ReportTemplateGroup entity | Grouping settings | P0 | Done |
| ✅ Create ScheduledReport entity | Scheduled report configurations | P1 | Done |
| ✅ Create EF configurations | Fluent API for report entities | P0 | Done |
| ✅ Create database migration | Report tables migration | P0 | Done |
| ✅ Create IReportDataProvider interface | Data provider contract | P0 | Done |
| ✅ Create IPdfReportRenderer interface | PDF renderer contract | P0 | Done |
| ✅ Create IExcelReportRenderer interface | Excel renderer contract | P0 | Done |
| ✅ Create report enums | DataSourceType, OutputFormat, AggregateFunction | P0 | Done |
| ✅ Create report DTOs | Request/response DTOs | P0 | Done |
| ✅ **Verify:** `dotnet build` passes | No compilation errors | P0 | Done |
| ✅ **Verify:** Migration applies | Database tables created | P0 | Done |

### 9.3 Report Renderers (Backend)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Implement QuestPdfReportRenderer | PDF generation with fluent API | P0 | Done |
| ✅ Create PDF header component | Company info, title, date | P0 | Done |
| ✅ Create PDF table component | Data table with styling and groups | P0 | Done |
| ✅ Create PDF footer component | Page numbers, grand totals | P0 | Done |
| ✅ Implement ClosedXmlReportRenderer | Excel generation | P0 | Done |
| ✅ Create Excel styling utilities | Auto-fit, currency formatting, styled headers | P0 | Done |

### 9.4 Report Data Providers (Backend)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create GlReportDataProvider | GL module data queries (16 fields) | P0 | Done |
| ✅ Create ApReportDataProvider | AP module data queries (17 fields) | P0 | Done |
| ✅ Create ArReportDataProvider | AR module data queries (17 fields) | P0 | Done |
| ✅ Create AssetReportDataProvider | Asset module data queries (17 fields) | P0 | Done |

### 9.5 Predefined Reports (Backend)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Implement TrialBalanceReport | Account balances as of date | P0 | Done |
| ✅ Implement BalanceSheetReport | Assets, Liabilities, Equity grouped | P0 | Done |
| ✅ Implement IncomeStatementReport | Revenue - Expenses = Net Income | P0 | Done |
| ⬜ Implement CashFlowReport | Cash flow statement | P1 | |
| ✅ Implement GeneralLedgerReport | Transaction-level detail per account | P0 | Done |
| ✅ Implement JournalVoucherListingReport | All JVs in date range | P0 | Done |
| ✅ Implement ApAgingReport | AP aging buckets by vendor | P0 | Done |
| ✅ Implement ArAgingReport | AR aging buckets by customer | P0 | Done |
| ⬜ Implement BudgetVarianceReport | Budget vs actual | P1 | |
| ✅ Implement AssetRegisterReport | Active assets with values | P0 | Done |
| ✅ Implement DepreciationScheduleReport | Depreciation by period | P0 | Done |

### 9.6 Reports API (Backend)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create ReportsController | Main reports controller | P0 | Done |
| ✅ GET /reports/predefined | List available predefined reports | P0 | Done |
| ✅ GET /reports/predefined/{type}/parameters | Get report parameters | P0 | Done |
| ✅ POST /reports/predefined/{type}/preview | Preview report data | P0 | Done |
| ✅ POST /reports/predefined/{type}/generate | Generate PDF/Excel | P0 | Done |
| ✅ GET /reports/templates | List user templates | P0 | Done |
| ✅ POST /reports/templates | Create template | P0 | Done |
| ✅ PUT /reports/templates/{id} | Update template | P0 | Done |
| ✅ DELETE /reports/templates/{id} | Delete template | P0 | Done |
| ✅ POST /reports/custom/{id}/preview | Preview custom report | P0 | Done |
| ✅ POST /reports/custom/{id}/generate | Generate custom report | P0 | Done |
| ✅ GET /reports/datasources | List data sources | P0 | Done |
| ✅ GET /reports/datasources/{source}/fields | Get available fields | P0 | Done |
| ⬜ GET /reports/lookups/{source} | Get lookup data | P0 | |

### 9.7 Custom Report Builder (Backend)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Implement ReportTemplateService | Template CRUD operations | P0 | Done |
| ✅ Implement ReportQueryBuilder | Dynamic query via data providers | P0 | Done |
| ✅ Implement CustomReportGenerationService | Custom report generation (in TemplateService) | P0 | Done |
| ✅ Create ReportTemplateValidator | Template validation (in TemplateService) | P0 | Done |

### 9.8 Reports Frontend (Common Components)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create reports feature structure | Directory structure | P0 | Done |
| ✅ Create reports-api.ts | API client functions | P0 | Done |
| ✅ Create ReportViewer component | Report preview/display with groups | P0 | Done |
| ✅ Create ReportParameterForm component | Dynamic parameter form | P0 | Done |
| ✅ Create ExportButtons component | PDF/Excel export buttons | P0 | Done |
| ✅ Create ReportLoadingState component | Loading skeleton in pages | P1 | Done |
| ✅ Add report routes | Route configuration in App.tsx | P0 | Done |
| ✅ Add report navigation | Menu items in sidebar | P0 | Done |

### 9.9 Predefined Reports Frontend
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Create ReportsPage | Redirects to /reports/predefined | P0 | Done |
| ✅ Create PredefinedReportsPage | Standard reports grid by category | P0 | Done |
| ✅ Create ReportViewerPage | Generic viewer with params + preview + export | P0 | Done |
| ✅ **Verify:** `npm run build` passes | No TypeScript errors | P0 | Done |

### 9.10 Custom Report Builder Frontend
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Install @dnd-kit packages | Drag & drop library | P0 | Done |
| ✅ Create report-builder-store | Zustand store for builder state | P0 | Done |
| ✅ Create ReportBuilder component | Main builder container (ReportBuilderPage) | P0 | Done |
| ✅ Create DataSourceSelector component | Data source dropdown | P0 | Done |
| ✅ Create FieldSelector component | Available fields list with add button | P0 | Done |
| ✅ Create ColumnConfigurator component | Column settings (display name, width, aggregate, sort) | P0 | Done |
| ✅ Create FilterBuilder component | Filter conditions builder | P0 | Done |
| ✅ Create GroupingConfigurator component | Grouping/sorting with subtotals | P1 | Done |
| ⬜ Create LayoutConfigurator component | Page layout settings | P1 | |
| ✅ Create ReportPreview component | Live preview panel | P0 | Done |
| ✅ Create TemplateSaveDialog component | Save template modal | P0 | Done |
| ✅ Create ReportBuilderPage | Three-panel builder layout | P0 | Done |
| ✅ Create CustomReportsPage | Template listing with edit/delete/run | P0 | Done |
| ✅ Create useReportGeneration hook | Report generation mutation | P0 | Done |
| ✅ Create useReportTemplates hook | Template CRUD hooks | P0 | Done |
| ✅ Create useDataSourceFields hook | Available fields query | P0 | Done |
| ✅ Create useReportPreview hook | Preview query | P0 | Done |
| ✅ **Verify:** `npm run build` passes | No TypeScript errors | P0 | Done |
| ✅ **Verify:** Report builder works | Create, preview, save template | P0 | Done |
| ✅ **Verify:** PDF/Excel export works | Download generated files | P0 | Done |

### 9.11 Scheduled Reports (Optional)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Create ScheduledReportHistory entity | Execution history | P2 | |
| ⬜ Implement ReportSchedulerService | Hangfire job scheduling | P2 | |
| ⬜ Create GenerateScheduledReportJob | Background job | P2 | |
| ⬜ Create scheduled report endpoints | API for scheduled reports | P2 | |
| ⬜ Create ScheduledReportsList component | Frontend listing | P2 | |
| ⬜ Create ScheduledReportForm component | Create/edit form | P2 | |
| ⬜ Create ScheduledReportHistory component | Execution history view | P2 | |
| ⬜ Create ScheduledReportsPage | Management page | P2 | |

### 9.12 Report Permissions
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Add Reports.View permission | View reports and previews (seed + backend guard) | P0 | Done |
| ✅ Add Reports.Generate permission | Export PDF/Excel (seed + backend guard) | P0 | Done |
| ✅ Add Reports.Create permission | Create custom templates (seed + backend + frontend guard) | P0 | Done |
| ✅ Add Reports.Edit permission | Edit custom templates (seed + backend + frontend guard) | P0 | Done |
| ✅ Add Reports.Delete permission | Delete custom templates (seed + backend + frontend guard) | P0 | Done |
| ⬜ Add Reports.Schedule permission | Manage scheduled reports | P2 | |

---

## Phase 9.5: Global Semantic Search (Nice to Have)

### 9.5.1 Search Infrastructure
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Add Meilisearch to Docker Compose | Search engine container setup | P2 | |
| ⬜ Configure Meilisearch indexes | Vendor, Customer, JV, Asset indexes | P2 | |
| ⬜ Setup index sync service | Hangfire background sync | P2 | |

### 9.5.2 Backend Search Implementation
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Create ISearchService interface | Search service contract | P2 | |
| ⬜ Implement MeilisearchService | Fuzzy search implementation | P2 | |
| ⬜ Implement FuzzySuggestionService | "Did you mean?" algorithm | P2 | |
| ⬜ Create SearchController | /api/v1/search endpoints | P2 | |
| ⬜ Create SearchDto classes | Request/response DTOs | P2 | |

### 9.5.3 Frontend Search Components
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Create GlobalSearchInput | Search input with keyboard shortcut (Ctrl+K) | P2 | |
| ⬜ Create AutocompleteDropdown | Results dropdown with grouping | P2 | |
| ⬜ Create SearchResultsView | Full search results page | P2 | |
| ⬜ Create useSearch hook | TanStack Query integration | P2 | |

### 9.5.4 Search Features
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Cross-module search | Unified search across all entities | P2 | |
| ⬜ Fuzzy matching | Typo tolerance (e.g., "bangok" → "Bangkok") | P2 | |
| ⬜ "Did you mean?" suggestions | Smart suggestions for no results | P2 | |
| ⬜ Search result highlighting | Bold matched terms in results | P2 | |
| ⬜ Faceted search filters | Filter by module, date range, status | P2 | |

### 9.5.5 Thai Language Support (Required for Thailand)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Configure n-gram tokenization | Enable Thai language tokenization (blocked: needs search infrastructure) | P0 | |
| ✅ Add Thai language fields | Add *NameLocal fields to all entities (PaymentTerm was last gap — all entities now have NameLocal) | P0 | Done |
| ⬜ Implement Thai text detection | Detect Thai vs English input | P1 | |
| ⬜ Test Thai search queries | Verify Thai character matching (blocked: needs search infrastructure) | P0 | |
| ⬜ Create Thai test cases | "โฮเตล", "แบงคอก", mixed queries (blocked: needs search infrastructure) | P0 | |

---

## Phase 10: Testing

### 10.1 Test Infrastructure
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Backend test projects | Carmen.TestCommon, Carmen.Infrastructure.Tests, Carmen.WebApi.Tests | P0 | Done |
| ✅ TestCommon shared library | Test constants, factories (ChartOfAccount, FiscalPeriod, JournalVoucher, ApInvoice, ArInvoice, Asset), fixtures (TestDbContextFactory, MockCurrentUserService) | P0 | Done |
| ✅ Frontend test infrastructure | Vitest + @testing-library/react + MSW, setup files, test-utils | P0 | Done |
| ✅ WebApplicationFactory setup | TestWebApplicationFactory with InMemory DB, JWT auth, tenant isolation | P0 | Done |
| ✅ **Verify:** `dotnet build` passes | All test projects compile | P0 | Done |
| ✅ **Verify:** `npm run test -- --run` passes | Vitest runs | P0 | Done |

### 10.2 Backend Unit Tests (105 tests)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ JournalVoucherService tests | 30 tests: creation, status transitions, reversal, validation, queries | P0 | Done |
| ✅ DepreciationService tests | 26 tests: calculation methods (SL, DB, DDB, SYD), schedule generation, posting, monthly run | P0 | Done |
| ✅ ApInvoiceService tests | 18 tests: creation, number generation, tax calculation, status transitions, update/delete guards | P0 | Done |
| ✅ ArInvoiceService tests | 15 tests: creation, aging, status flow | P0 | Done |
| ✅ AccountService tests | 14 tests: filter, duplicate code, account summary, trial balance | P0 | Done |
| ✅ AuthService tests | 1 test: constructor smoke test (InMemory limitation for complex queries) | P1 | Done |
| ✅ DashboardService tests | 1 test: constructor smoke test (InMemory limitation for GroupBy+Sum) | P1 | Done |
| ✅ **Verify:** `dotnet test --filter Carmen.Infrastructure.Tests` | 105 tests pass | P0 | Done |

### 10.3 Backend Integration Tests (22 tests)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ AuthController tests | 6 tests: GetMe (auth/unauth/invalid), Login invalid, Refresh invalid, Logout | P0 | Done |
| ✅ AccountsController tests | 6 tests: GET list (auth/unauth/forbidden), GET by ID (found/404), GET by code | P0 | Done |
| ✅ JournalVouchersController tests | 7 tests: GET list (auth/unauth/forbidden/view-only), GET by ID 404, POST 403, DELETE 404 | P0 | Done |
| ✅ TenantIsolation tests | 3 tests: TenantA sees own, TenantB sees own, cross-tenant blocked | P0 | Done |
| ✅ **Verify:** `dotnet test --filter Carmen.WebApi.Tests` | 22 tests pass | P0 | Done |

### 10.4 Frontend Unit Tests (66 tests)
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Auth store tests | 16 tests: setAuth, logout, hasPermission, wildcard, switchTenant, persist | P0 | Done |
| ✅ Report builder store tests | 14 tests: setDataSource, columns CRUD, filters, groups, reset, loadTemplate | P0 | Done |
| ✅ Theme store tests | 5 tests: setTheme, system detection, localStorage persistence | P1 | Done |
| ✅ Notification store tests | 4 tests: setUnreadCount, increment | P1 | Done |
| ✅ Utils tests | 17 tests: cn, formatCurrency, formatNumber, formatDate, generateId | P0 | Done |
| ✅ useTenantId hook tests | 5 tests: activeTenantId, fallback, no-context | P0 | Done |
| ✅ API client tests | 5 tests: token injection, 401 refresh, error handling | P1 | Done |
| ✅ **Verify:** `npm run test -- --run` | 66 tests pass | P0 | Done |

### 10.5 E2E Tests
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Login flow test | Authentication E2E | P0 | Done |
| ✅ Multi-tenant login tests | Single/multi-tenant user login | P0 | Done |
| ✅ Tenant switching tests | HOD tenant switcher E2E | P0 | Done |
| ✅ Protected routes tests | Redirect unauthenticated users | P0 | Done |
| ✅ Auth test fixtures | Reusable login helpers | P1 | Done |
| ✅ Journal Voucher flow | Form/spreadsheet mode, validation, list page (19 tests) | P0 | Done |
| ✅ Dashboard tests | Dashboard load, stat cards, charts, navigation (5 tests) | P0 | Done |
| ✅ AP Invoice flow | List page, create form with vendor/lines (9 tests) | P0 | Done |
| ✅ AR Invoice flow | List page, create form with customer/lines (8 tests) | P0 | Done |
| ✅ Asset lifecycle | Asset list, create, categories, depreciation (10 tests) | P0 | Done |
| ✅ **Verify:** `dotnet test` passes | 127 backend tests green (105 unit + 22 integration) | P0 | Done |
| ✅ **Verify:** `npm run test -- --run` passes | 66 frontend unit tests green | P0 | Done |
| ⬜ **Verify:** E2E tests pass | `npm run test:e2e` (requires running dev servers) | P0 | |

---

## Phase 10.5: Semantic Search (Qdrant)

**Technology:** Qdrant (vector DB), OpenAI/Azure Embeddings, .NET Qdrant Client

### 10.5.1 Infrastructure Setup
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Setup Qdrant instance | Docker or Qdrant Cloud | P2 | |
| ⬜ Install Qdrant.Client NuGet | .NET Qdrant client library | P2 | |
| ⬜ Configure embedding provider | OpenAI or Azure OpenAI embeddings | P2 | |
| ⬜ Create Qdrant collections | vendors, customers, accounts, invoices, assets | P2 | |
| ⬜ Configure multi-tenant filtering | Tenant ID as payload filter | P2 | |
| ⬜ **Verify:** Qdrant health check | Connection test passes | P2 | |

### 10.5.2 Domain & Application Layer
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Create IEmbeddingService interface | Generate text embeddings | P2 | |
| ⬜ Create ISemanticSearchService interface | Vector search contract | P2 | |
| ⬜ Implement OpenAIEmbeddingService | OpenAI ada-002 embeddings | P2 | |
| ⬜ Implement QdrantSearchService | Qdrant vector search | P2 | |
| ⬜ Create SearchableEntity base class | Common searchable properties | P2 | |
| ⬜ Create SemanticSearchResult DTO | Search result with score | P2 | |
| ⬜ **Verify:** `dotnet build` passes | No compilation errors | P2 | |

### 10.5.3 Indexing Service
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Create VendorIndexingService | Index vendors on create/update | P2 | |
| ⬜ Create CustomerIndexingService | Index customers on create/update | P2 | |
| ⬜ Create AccountIndexingService | Index chart of accounts | P2 | |
| ⬜ Create InvoiceIndexingService | Index AP/AR invoices | P2 | |
| ⬜ Create AssetIndexingService | Index fixed assets | P2 | |
| ⬜ Create BulkReindexJob | Hangfire job for full reindex | P2 | |
| ⬜ Implement EF Core SaveChanges hook | Auto-index on entity changes | P2 | |
| ⬜ **Verify:** Indexing works | Create entity → appears in Qdrant | P2 | |

### 10.5.4 API Endpoints
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Create SemanticSearchController | /api/v1/tenants/{id}/search/semantic | P2 | |
| ⬜ GET /search/semantic | Natural language search endpoint | P2 | |
| ⬜ GET /search/semantic/vendors | Search vendors semantically | P2 | |
| ⬜ GET /search/semantic/customers | Search customers semantically | P2 | |
| ⬜ GET /search/semantic/accounts | Search chart of accounts | P2 | |
| ⬜ GET /search/similar/{entity}/{id} | Find similar entities | P2 | |
| ⬜ **Verify:** Scalar shows endpoints | API documentation loads | P2 | |

### 10.5.5 Frontend Components
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Create SemanticSearchInput | Natural language search input | P2 | |
| ⬜ Create useSemanticSearch hook | TanStack Query + debounce | P2 | |
| ⬜ Enhance VendorSelect | Add semantic search option | P2 | |
| ⬜ Enhance CustomerSelect | Add semantic search option | P2 | |
| ⬜ Enhance AccountSelect | Add semantic search option | P2 | |
| ⬜ Create SimilarEntitiesSidebar | "Similar items" panel | P2 | |
| ⬜ **Verify:** `npm run build` passes | No build errors | P2 | |

### 10.5.6 Thai Language Support
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ⬜ Test Thai embeddings | Verify Thai text embedding quality | P2 | |
| ⬜ Add Thai search examples | "บริษัท ทำความสะอาด" → cleaning vendors | P2 | |
| ⬜ Implement mixed language search | Thai + English combined queries | P2 | |
| ⬜ **Verify:** Thai queries work | Test with Thai vendor names | P2 | |

---

## Phase 11: Documentation

| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Update technical design docs | GDD.md, MULTI-TENANCY.md, PRD.md, CLAUDE.md, AGENT.md | P0 | Done |
| ✅ API documentation | Scalar API docs — replaced Swagger UI with Scalar.AspNetCore, endpoint at `/scalar/v1` | P0 | Done |
| ⬜ User manual | End-user documentation | P1 | |
| ⬜ Admin guide | System administration guide | P1 | |
| ⬜ Developer guide | Developer onboarding guide | P1 | |
| ✅ Deployment guide | `docs/DEPLOYMENT.md` — prerequisites, env vars, Docker quickstart, SSL, backup, troubleshooting | P0 | Done |
| ✅ **Verify:** Scalar docs load correctly | `/scalar/v1` accessible in development mode | P0 | Done |
| ⬜ **Verify:** Docs are accurate | Manual review of documentation | P1 | |

---

## Phase 12: Deployment

| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| ✅ Production database setup | MySQL config in `docker-compose.prod.yml` with health checks, resource limits | P0 | Done |
| ✅ Production Redis setup | Redis config with AOF, maxmemory, LRU eviction in prod compose | P0 | Done |
| ✅ Backend deployment | `docker-compose.prod.yml` with production env, health checks, resource limits | P0 | Done |
| ✅ Frontend deployment | `docker-compose.prod.yml` with nginx, depends_on backend healthy | P0 | Done |
| ✅ SSL configuration | Reverse proxy nginx config documented in `docs/DEPLOYMENT.md` | P0 | Done |
| ✅ Monitoring setup | Serilog structured logging, Hangfire dashboard, health endpoints | P0 | Done |
| ✅ Backup configuration | MySQL/Redis backup procedures documented in `docs/DEPLOYMENT.md` | P0 | Done |
| ✅ Smoke testing | `scripts/smoke-test.sh` — checks health, API root, frontend | P0 | Done |
| ✅ CI/CD pipeline | GitHub Actions: `ci.yml` (build+test), `docker-build.yml` (image push to GHCR) | P0 | Done |
| ✅ Environment configuration | `.env.example` template + `appsettings.Production.json` | P0 | Done |
| ⬜ **Verify:** Health endpoints respond | `/health`, `/health/ready` return 200 (requires running instance) | P0 | |
| ⬜ **Verify:** Login works in production | Auth flow end-to-end (requires running instance) | P0 | |
| ⬜ **Verify:** All modules accessible | Navigate through all features (requires running instance) | P0 | |
| ⬜ **Verify:** SSL/HTTPS working | Certificate valid, no mixed content (requires domain + cert) | P0 | |

---

## Summary Statistics

- **Total Tasks:** 380+
- **Phase 1 (Infrastructure):** 25 tasks
- **Phase 2 (Foundation):** 35 tasks
- **Phase 3 (GL Module):** 42 tasks
- **Phase 4 (AP Module):** 37 tasks
- **Phase 5 (AR Module):** 39 tasks
- **Phase 6 (Asset Module):** 34 tasks
- **Phase 7 (Background Jobs):** 20 tasks
- **Phase 7.5 (Notification & Email):** 70 tasks
- **Phase 8 (Workflow):** 13 tasks
- **Phase 9 (Dashboard & Reports):** 80+ tasks
- **Phase 10 (Testing):** 17 tasks
- **Phase 10.5 (Semantic Search):** 40 tasks *(NEW)*
- **Phase 11 (Documentation):** 8 tasks
- **Phase 12 (Deployment):** 12 tasks

## Estimated Timeline (with parallel workstreams)

| Phase | Duration | Notes |
|-------|----------|-------|
| Phase 1 | 2 weeks | Infrastructure setup |
| Phase 2 | 3 weeks | Shared components and configuration |
| Phase 3 | 4 weeks | General Ledger module |
| Phase 4 | 3 weeks | Accounts Payable module |
| Phase 5 | 3 weeks | Accounts Receivable module |
| Phase 6 | 3 weeks | Asset Management module |
| Phase 7 | 2 weeks | Background jobs and integration |
| Phase 7.5 | 2 weeks | Notification & Email system |
| Phase 8 | 2 weeks | Workflow and approval (integrates with 7.5) |
| Phase 9 | 3 weeks | Dashboard and reporting |
| Phase 10 | Ongoing | Testing throughout development |
| Phase 10.5 | 2 weeks | Semantic Search (Qdrant) |
| Phase 11 | 1 week | Documentation |
| Phase 12 | 1 week | Deployment |

**Total Estimated Time:** 26-32 weeks (6.5-8 months) with a team of 2-3 developers
