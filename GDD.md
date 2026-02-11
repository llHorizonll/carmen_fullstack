# GDD - Global Design Document
## Carmen SAAS Financial Accounting System Architecture

**Version:** 1.0
**Date:** January 2026

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Browser   │  │ Desktop App│  │   Mobile    │  │  External   │   │
│  │  (React)    │  │  (Embedded) │  │  (Future)   │  │  Systems    │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
└─────────┼────────────────┼────────────────┼────────────────┼──────────┘
          │                │                │                │
          └────────────────┼────────────────┼────────────────┘
                           │                │
┌─────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Reverse Proxy (Nginx/Traefik) + Rate Limiting + SSL Termination│   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   Frontend      │  │   Backend API   │  │  Background     │         │
│  │   (React+Vite)  │  │   (.NET 8)      │  │  Jobs           │         │
│  │                 │  │                 │  │  (Hangfire)     │         │
│  │ - shadcn/ui     │  │ - Controllers   │  │ - Depreciation  │         │
│  │ - TanStack Qry  │  │ - Services      │  │ - Recurring JV  │         │
│  │ - Zustand       │  │ - Domain Logic  │  │ - Reports       │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ MySQL           │  │ Redis Cache     │  │ File Storage    │         │
│  │ (Primary DB)    │  │ (Distributed)   │  │ (Documents/OCR) │         │
│  │                 │  │                 │  │                 │         │
│  │ - Tenant Data   │  │ - Session       │  │ - Invoices      │         │
│  │ - Audit Logs    │  │ - Query Cache   │  │ - Reports       │         │
│  │ - Mgmt Data     │  │ - Distributed   │  │ - Attachments   │         │
│  │                 │  │   Locks         │  │                 │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                            │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  BlueLedger     │  │  OCR Service    │  │  Email Service  │         │
│  │  (Hotel PMS)    │  │  (Invoice)      │  │  (MailKit/SMTP) │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  Real-time Notifications (SignalR Hub: /hubs/notifications)  │       │
│  └─────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend Framework | React 18+ | Component-based, large ecosystem, familiar from legacy |
| Build Tool | Vite 5+ | Fast dev server, optimized production builds |
| UI Library | shadcn/ui | Modern, customizable, built on Radix UI |
| State Management | Zustand + TanStack Query | Simple global state + powerful server state |
| Backend Framework | .NET 8 Web API | Modern C#, high performance, cross-platform |
| ORM | EF Core 9+ | Mature, feature-rich, good LINQ support |
| Database | MySQL 8.0+ | Open source, cross-platform, ACID compliant |
| Cache | Redis | Distributed caching, session storage |
| Background Jobs | Hangfire | Persistent background jobs, dashboard |
| Real-time | SignalR | WebSocket-based notifications |
| Email | MailKit + Fluid | SMTP email with Liquid templates |
| Authentication | JWT + Identity | Stateless, scalable, industry standard |
| API Documentation | Swagger/OpenAPI | Auto-generated, interactive |
| Logging | Serilog + SEQ | Structured logging, powerful queries |

---

## 2. Frontend Architecture

### 2.1 Directory Structure

```
frontend/
├── public/
│   ├── config.js          # Environment configuration
│   └── assets/            # Static assets
├── src/
│   ├── app/               # App initialization
│   │   ├── routes.tsx     # Route definitions
│   │   ├── providers.tsx  # Context providers
│   │   └── App.tsx        # Root component
│   ├── components/        # Shared components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Layout components
│   │   └── common/        # Common business components
│   ├── features/          # Feature modules
│   │   ├── general-ledger/
│   │   │   ├── api/       # API client
│   │   │   ├── components/# Feature components
│   │   │   ├── hooks/     # Custom hooks
│   │   │   ├── types/     # TypeScript types
│   │   │   └── views/     # Page components
│   │   ├── accounts-payable/
│   │   ├── accounts-receivable/
│   │   ├── asset-management/
│   │   ├── configuration/
│   │   └── settings/
│   ├── lib/               # Utilities
│   │   ├── api-client.ts  # API wrapper
│   │   ├── query-client.ts# React Query setup
│   │   └── utils.ts       # Utilities
│   ├── stores/            # Zustand stores
│   │   ├── auth.ts
│   │   ├── theme.ts
│   │   └── tenant.ts
│   ├── i18n/              # Translations
│   │   ├── en.json
│   │   ├── th.json
│   │   └── vi.json
│   ├── types/             # Global types
│   └── styles/            # Global styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### 2.2 Component Patterns

```typescript
// Atomic Design Pattern
components/
├── ui/              // Atoms - basic UI elements (Button, Input, etc.)
├── common/          // Molecules - business components (CustomerCard, etc.)
└── features/        // Organisms - feature components (InvoiceForm, etc.)

// Feature Component Example
features/general-ledger/views/journal-voucher/
├── JournalVoucherListView.tsx    // List page
├── JournalVoucherCreateView.tsx  // Create page
├── JournalVoucherEditView.tsx    // Edit page
├── JournalVoucherShowView.tsx    // Show/details page
└── components/
    ├── JournalVoucherForm.tsx
    ├── JournalVoucherTable.tsx
    └── JournalLineItems.tsx
```

### 2.3 State Management Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   ZUSTAND       │    │ TANSTACK QUERY  │                │
│  │  (Client State) │    │ (Server State)  │                │
│  ├─────────────────┤    ├─────────────────┤                │
│  │ • auth          │    │ • queries       │                │
│  │ • theme         │    │ • mutations     │                │
│  │ • tenant        │    │ • cache         │                │
│  │ • ui            │    │ • invalidation  │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Zustand Stores:**
- `authStore` - User authentication state
- `themeStore` - Theme preference
- `uiStore` - UI state (modals, sidebars)
- `tenantStore` - Current tenant context

**TanStack Query:**
- All server data fetching
- Automatic caching and refetching
- Optimistic updates for mutations

### 2.4 Routing Strategy

```typescript
// React Router v7 with file-based routing
// Protected routes with permission checks
// Lazy loading for code splitting

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Dashboard /> },
      {
        path: "gl",
        children: [
          { path: "journal-vouchers", element: <JournalVoucherList /> },
          { path: "journal-vouchers/create", element: <JournalVoucherCreate /> },
          { path: "journal-vouchers/:id", element: <JournalVoucherShow /> },
          { path: "journal-vouchers/:id/edit", element: <JournalVoucherEdit /> },
        ]
      },
      // ... other routes
    ]
  }
];
```

---

## 3. Backend Architecture

### 3.1 Solution Structure

```
Carmen.sln
├── src/
│   ├── Carmen.Domain/              # Core domain (no dependencies)
│   │   ├── Entities/
│   │   ├── ValueObjects/
│   │   ├── Interfaces/
│   │   └── Exceptions/
│   │
│   ├── Carmen.Application/         # Business logic
│   │   ├── DTOs/
│   │   ├── Interfaces/
│   │   ├── Services/
│   │   ├── Commands/
│   │   ├── Queries/
│   │   └── Validators/
│   │
│   ├── Carmen.Infrastructure/      # External concerns
│   │   ├── Persistence/
│   │   │   ├── DbContext.cs
│   │   │   ├── Configurations/
│   │   │   └── Repositories/
│   │   ├── Cache/
│   │   ├── Services/
│   │   └── Integration/
│   │
│   └── Carmen.WebApi/              # Presentation
│       ├── Controllers/
│       ├── Middleware/
│       ├── Filters/
│       ├── Extensions/
│       └── Program.cs
│
├── tests/
│   ├── Carmen.Domain.Tests/
│   ├── Carmen.Application.Tests/
│   ├── Carmen.Infrastructure.Tests/
│   └── Carmen.WebApi.Tests/
│
└── shared/                         # Shared contracts
    └── Carmen.SharedKernel/
```

### 3.2 Domain Model

```
Domain/
├── GeneralLedger/
│   ├── JournalVoucher
│   ├── JournalVoucherLine
│   ├── Account
│   ├── TemplateVoucher
│   ├── RecurringVoucher
│   └── Budget
│
├── AccountsPayable/
│   ├── Vendor
│   ├── ApInvoice
│   ├── ApInvoiceLine
│   ├── ApPayment
│   └── ApPaymentLine
│
├── AccountsReceivable/
│   ├── Customer
│   ├── ArInvoice
│   ├── ArInvoiceLine
│   ├── ArReceipt
│   └── ArReceiptLine
│
├── AssetManagement/
│   ├── Asset
│   ├── PreAsset
│   ├── AssetDisposal
│   └── AssetCategory
│
├── Configuration/
│   ├── ChartOfAccounts
│   ├── TaxProfile
│   ├── Currency
│   └── PaymentTerm
│
├── Organization/
│   ├── Tenant
│   ├── User
│   └── Permission
│
└── Audit/
    ├── AuditEntry
    └── WorkflowHistory
```

### 3.3 CQRS Pattern

```csharp
// Command/Query Separation
Application/
├── Commands/
│   ├── CreateJournalVoucherCommand.cs
│   ├── UpdateJournalVoucherCommand.cs
│   └── DeleteJournalVoucherCommand.cs
├── Queries/
│   ├── GetJournalVoucherQuery.cs
│   ├── GetJournalVoucherListQuery.cs
│   └── GetAccountSummaryQuery.cs
└── Handlers/
    ├── CreateJournalVoucherHandler.cs
    ├── UpdateJournalVoucherHandler.cs
    └── GetJournalVoucherHandler.cs

// Controller usage
[HttpPost]
public async Task<ActionResult<JournalVoucherDto>> Create(
    [FromBody] CreateJournalVoucherCommand command,
    [FromRoute] Guid tenantId,
    CancellationToken ct)
{
    var result = await _mediator.Send(command, ct);
    return Ok(result);
}
```

### 3.4 Repository Pattern

```csharp
// Generic repository with specifications
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<T>> ListAsync(ISpecification<T> spec, CancellationToken ct);
    Task<int> CountAsync(ISpecification<T> spec, CancellationToken ct);
    Task AddAsync(T entity, CancellationToken ct);
    Task UpdateAsync(T entity, CancellationToken ct);
    Task DeleteAsync(T entity, CancellationToken ct);
}

// Specific repositories
public interface IJournalVoucherRepository : IRepository<JournalVoucher>
{
    Task<JournalVoucher?> GetWithLinesAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<JournalVoucher>> GetPostedAsync(DateRange range, CancellationToken ct);
}
```

---

## 4. Database Design

### 4.1 Multi-Tenancy Strategy

**Row-Level Tenancy:**
- Shared database, shared schema
- `TenantId` column on all tenant tables
- Global query filters for automatic filtering
- Tenant context from JWT claims

```csharp
// Global query filter in DbContext
modelBuilder.Entity<JournalVoucher>()
    .HasQueryFilter(jv => jv.TenantId == _currentTenantId);

// Tenant context service
public interface ITenantContext
{
    Guid TenantId { get; }
    string TenantCode { get; }
}
```

### 4.2 Core Tables

```sql
-- Tenant
Tenant (
    TenantId (PK),
    Code,
    Name,
    DatabaseSchema,
    LicenseExpiry,
    IsActive,
    CreatedAt,
    UpdatedAt
)

-- User
User (
    UserId (PK),
    TenantId (FK),
    Username,
    Email,
    PasswordHash,
    FirstName,
    LastName,
    IsActive,
    LastLoginAt,
    CreatedAt,
    UpdatedAt
)

-- Permission
Permission (
    PermissionId (PK),
    Code,
    Name,
    Module,
    Description
)

-- UserPermission (junction)
UserPermission (
    UserPermissionId (PK),
    UserId (FK),
    PermissionId (FK)
)

-- Chart of Accounts
Account (
    AccountId (PK),
    TenantId (FK),
    Code,
    Name,
    AccountTypeId,
    ParentAccountId (FK),
    Level,
    IsActive,
    IsContra,
    AllowAp,
    AllowAr,
    AllowGl,
    AllowAsset,
    CreatedAt,
    UpdatedAt
)

-- Journal Voucher Header
JournalVoucher (
    JournalVoucherId (PK),
    TenantId (FK),
    VoucherNo,
    VoucherDate,
    Description,
    PostedDate,
    PostedBy (FK),
    CreatedBy (FK),
    CreatedAt,
    UpdatedAt,
    RowVersion (timestamp) -- MySQL uses TIMESTAMP for concurrency
)

-- Journal Voucher Line
JournalVoucherLine (
    JournalVoucherLineId (PK),
    JournalVoucherId (FK),
    LineNo,
    AccountId (FK),
    Description,
    DebitAmount,
    CreditAmount,
    Reference,
    CostCenterId (FK),
    CreatedAt
)
```

### 4.3 Indexes Strategy

```sql
-- Performance indexes (MySQL compatible)
CREATE INDEX IX_JournalVoucher_TenantId_Date ON JournalVoucher(TenantId, VoucherDate);
CREATE INDEX IX_JournalVoucher_TenantId_No ON JournalVoucher(TenantId, VoucherNo);
CREATE INDEX IX_JournalVoucherLine_JournalVoucherId ON JournalVoucherLine(JournalVoucherId);
CREATE INDEX IX_Account_TenantId_Code ON Account(TenantId, Code);

-- Full-text search (MySQL syntax)
CREATE FULLTEXT INDEX idx_vendor_name_address ON Vendor(Name, Address);
```

### 4.4 Audit Tables

```sql
AuditEntry (
    AuditEntryId (PK),
    TenantId (FK),
    TableName,
    RecordId,
    Action, -- INSERT, UPDATE, DELETE
    OldValues (json),
    NewValues (json),
    ChangedBy (FK),
    ChangedAt
)
```

---

## 5. API Design

### 5.1 RESTful Conventions

```
Base URL: /api/v1/tenants/{tenantId}

Resources:
GET    /gl/journal-vouchers              # List
GET    /gl/journal-vouchers/{id}         # Get by ID
POST   /gl/journal-vouchers              # Create
PUT    /gl/journal-vouchers/{id}         # Update
DELETE /gl/journal-vouchers/{id}         # Delete
POST   /gl/journal-vouchers/{id}/post    # Custom action (post JV)

GET    /gl/journal-vouchers/search       # Search endpoint
GET    /gl/accounts                      # Lookups
```

### 5.2 Response Format

```json
// Success response
{
  "success": true,
  "data": {
    "journalVoucherId": "123e4567-e89b-12d3-a456-426614174000",
    "voucherNo": "JV-2024-0001",
    "voucherDate": "2024-01-15",
    "lines": [...]
  }
}

// List response with pagination
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 150,
    "totalPages": 8
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "lines[0].debitAmount",
        "message": "Debit amount is required"
      }
    ]
  }
}
```

### 5.3 API Versioning

```csharp
// URL-based versioning
[ApiController]
[Route("api/v{version:apiVersion}/tenants/{tenantId}/[controller]")]
[ApiVersion("1.0")]
public class JournalVouchersController : ControllerBase
```

### 5.4 Multi-Tenant Dashboard APIs

For System Admins and Group Admins who need to view data across multiple tenants:

```bash
# Get user's accessible tenants
GET /api/v1/me/accessible-tenants
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "tenantId": "xxx",
      "tenantCode": "HOTEL001",
      "tenantName": "Grand Hotel Bangkok",
      "currency": "THB"
    }
  ]
}

# Get aggregated dashboard data (all accessible tenants)
GET /api/v1/dashboard/aggregated
  ?metrics=revenue,expenses,profit,journalCount,pendingApprovals
  &period=2024-01
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalRevenue": 5678901.00,
    "totalExpenses": 3456789.00,
    "totalProfit": 2222112.00,
    "journalCount": 537,
    "pendingApprovals": 35,
    "tenantCount": 3,
    "currency": "THB",
    "period": "2024-01",
    "breakdown": [
      {
        "tenantId": "xxx",
        "tenantCode": "HOTEL001",
        "tenantName": "Grand Hotel Bangkok",
        "revenue": 1234567.00,
        "expenses": 890123.00,
        "profit": 344444.00,
        "journalCount": 156,
        "pendingApprovals": 12
      }
    ]
  }
}

# Get comparison data for specific tenants
GET /api/v1/dashboard/compare
  ?tenantIds=xxx,yyy,zzz
  &metrics=revenue,expenses,profit,journalCount
  &period=2024-01
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "tenants": [
      {
        "tenantId": "xxx",
        "tenantCode": "HOTEL001",
        "tenantName": "Grand Hotel Bangkok",
        "metrics": {
          "revenue": 1234567.00,
          "expenses": 890123.00,
          "profit": 344444.00,
          "profitMargin": 0.333,
          "journalCount": 156
        }
      }
    ],
    "totals": {
      "revenue": 5678901.00,
      "expenses": 3456789.00,
      "profit": 2222112.00,
      "profitMargin": 0.387,
      "journalCount": 537
    }
  }
}

# Switch dashboard context (for tenant switcher)
POST /api/v1/dashboard/context
{
  "mode": "single",           // single | aggregated | compare
  "selectedTenantId": "xxx"   // required for single mode
}
```

#### Permissions Required

| Endpoint | Permission | Roles |
|----------|------------|-------|
| `GET /me/accessible-tenants` | None (authenticated) | All |
| `GET /dashboard/aggregated` | `Dashboard.ViewAll` | System Admin, Group Admin |
| `GET /dashboard/compare` | `Dashboard.Compare` | System Admin, Group Admin |
| `POST /dashboard/context` | `Dashboard.SwitchTenant` | System Admin, Group Admin |

---

## 6.5. Global Semantic Search Architecture

### 6.5.1 Overview

Carmen includes a global semantic search capability that provides:
- **Cross-module search** across Vendors, Customers, Journal Vouchers, Assets, Invoices
- **Fuzzy matching** with typo tolerance (e.g., "bangok" → "Bangkok")
- **Intelligent suggestions** ("Did you mean...?" when no results found)
- **Instant autocomplete** as user types

### 6.5.2 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  GlobalSearchInput (Ctrl+K to focus)                         │   │
│  │  - Debounced input (300ms)                                  │   │
│  │  - Autocomplete dropdown with grouped results               │   │
│  │  - "Did you mean?" suggestion display                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP/REST
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (.NET 8)                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  SearchController                                           │   │
│  │  GET /api/v1/tenants/{tenantId}/search?q={query}           │   │
│  │  GET /api/v1/tenants/{tenantId}/search/suggest?q={query}    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ISearchService - Meilisearch + FuzzySharp                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                          │                           │
                          ▼                           ▼
┌──────────────────────────────────────┐    ┌─────────────────────────┐
│         MEILISEARCH                  │    │     MYSQL DATABASE       │
│  - vendors_index                     │    │  - Source of truth      │
│  - customers_index                   │    │  - All entities         │
│  - journal_vouchers_index            │    │                        │
│  - assets_index                      │    │                        │
│  - ap_invoices_index                 │    │                        │
│  - ar_invoices_index                 │    │                        │
└──────────────────────────────────────┘    └─────────────────────────┘
                          │
                          │ Hangfire Background Sync
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 INDEX SYNCHRONIZATION SERVICE                         │
│  - Incremental sync on CRUD operations                              │
│  - Scheduled full reindex (nightly)                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.5.3 Search API Endpoints

```bash
# Global search across all modules
GET /api/v1/tenants/{tenantId}/search?q={query}&limit=20

# Response:
{
  "success": true,
  "data": {
    "vendors": [...],
    "customers": [...],
    "journalVouchers": [...],
    "assets": [...],
    "apInvoices": [...],
    "arInvoices": [...],
    "totalCount": 42,
    "suggestion": null
  }
}

# Get suggestions when no results found
GET /api/v1/tenants/{tenantId}/search/suggest?q={query}

# Response:
{
  "success": true,
  "data": {
    "suggestion": "Grand Hotel Bangkok",
    "alternatives": ["Grand Restaurant", "Bangkok Grand"]
  }
}
```

### 6.5.4 Meilisearch Configuration

```yaml
# docker-compose.yml
meilisearch:
  image: getmeilisearch/meilisearch:v1.5
  ports: ["7700:7700"]
  environment:
    - MEILI_ENV=production
    - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
  volumes:
    - meilisearch-data:/meili_data
```

```json
// Index settings for vendors with Thai language support
{
  "uid": "vendors",
  "searchableAttributes": ["code", "name", "name_th", "name_translit", "taxId", "contactPerson"],
  "filterableAttributes": ["tenant_id", "is_active"],
  "rankingRules": ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  "typoTolerance": {
    "enabled": true,
    "minWordSizeForTypos": { "oneTypo": 4, "twoTypos": 8 }
  },
  "ngramTokenization": {
    "gramSize": 2,
    "prefixOnly": false
  }
}
```

**Entity with Thai Support:**
```csharp
public class Vendor
{
    public string Name { get; set; }           // English name (Latin)
    public string NameTh { get; set; }         // Thai name (Thai script)
    public string NameTransliteration { get; set; }  // Karaoke Romanization
}
```

**Search Index Fields:**
- `name`: "Grand Hotel Bangkok" (English - exact match)
- `name_th`: "แกรนด์ โฮเตล แบงคอก" (Thai - n-gram search)
- `name_translit`: "Ko-rot Ho-tel Bang-kok" (Karaoke - fuzzy match)

### 6.5.5 Search UX Examples

**Typo Tolerance (English):**
```
User types: "bangok grand"
Results found:
  - Grand Hotel Bangkok (Vendor)
  - Bangkok Grand Tours (Customer)
```

**Thai Language Support:**
```
User types: "โฮเตล" (hotel)
Results found:
  - โรงแรม แกรนด์ (Vendor)
  - Grand Hotel Bangkok (English)

User types: "แบงคอก" (Bangkok - Thai)
Results found:
  - Grand Hotel Bangkok (Vendor)
  - Bangkok Supplies (Customer)
```

**Mixed Thai-English:**
```
User types: "grand โฮเตล"
Results found:
  - โรงแรม Grand Hotel (Vendor)
```

**Did You Mean?:**
```
User types: "grand hotl"
No results found.

Did you mean "Grand Hotel"?
[Search instead]
```

---

## 7. Security Design

### 7.1 Authentication Flow

### 6.1 Authentication Flow

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│ Client  │                 │ Backend │                 │   DB    │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │ POST /api/v1/auth/login    │                           │
     │ {username, password,       │                           │
     │  tenantCode}               │                           │
     ├──────────────────────────>│                           │
     │                           │ Validate credentials      │
     │                           ├──────────────────────────>│
     │                           │<──────────────────────────┤
     │                           │                           │
     │                           │ Generate JWT              │
     │ 200 OK {accessToken,      │                           │
     │  refreshToken, expiresIn} │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │ Store token               │                           │
     │                           │                           │
     │ GET /api/v1/tenants/...   │                           │
     │ Authorization: Bearer ... │                           │
     ├──────────────────────────>│                           │
     │                           │ Validate JWT              │
     │ 200 OK                    │                           │
     │<──────────────────────────┤                           │
```

### 6.2 JWT Structure

```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "user-id",
  "tenantId": "tenant-id",
  "tenantCode": "HOTEL001",
  "username": "john.doe",
  "email": "john@example.com",
  "permissions": ["GL.JournalVoucher.Create", "AP.Invoice.Approve"],
  "exp": 1706745600
}
```

### 6.3 Authorization Model

```
Permission Structure: {Module}.{Entity}.{Action}

Examples:
- GL.JournalVoucher.Create
- GL.JournalVoucher.Post
- AP.Invoice.Approve
- AP.Invoice.View
- AR.Invoice.Create
- Asset.Asset.Dispose
- Configuration.Account.Edit
- Settings.Company.Update
```

---

## 8. Notification & Email Architecture

### 7.5.1 Real-time Notifications (SignalR)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  Business Event │───>│ Notification    │───>│  SignalR Hub    │     │
│  │  (Approval, AP, │    │ Service         │    │  /hubs/notify   │     │
│  │   AR, System)   │    │                 │    │                 │     │
│  └─────────────────┘    └────────┬────────┘    └────────┬────────┘     │
│                                  │                       │              │
│                                  ▼                       ▼              │
│                    ┌─────────────────┐      ┌─────────────────┐        │
│                    │ Email Queue     │      │ Real-time       │        │
│                    │ (Hangfire)      │      │ Push to Browser │        │
│                    └────────┬────────┘      └─────────────────┘        │
│                             │                                          │
│                             ▼                                          │
│                    ┌─────────────────┐                                 │
│                    │ MailKit (SMTP)  │                                 │
│                    │ + Fluid Templates│                                │
│                    └─────────────────┘                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.5.2 Notification Types

| Type | Description | Delivery |
|------|-------------|----------|
| **Approval** | Document pending/approved/rejected | In-app + Email |
| **Alert** | Payment due, invoice overdue, credit limit | In-app + Email |
| **System** | Version updates, maintenance notices | In-app (broadcast) |
| **Report** | Scheduled report ready | In-app + Email |
| **User** | Direct user-to-user messages | In-app + Email |

### 7.5.3 SignalR Hub Implementation

```csharp
// Hub endpoint: /hubs/notifications
public class NotificationHub : Hub
{
    public async Task JoinTenantGroup(string tenantId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
    }

    public async Task SendToUser(string userId, Notification notification)
    {
        await Clients.User(userId).SendAsync("ReceiveNotification", notification);
    }

    public async Task BroadcastToTenant(string tenantId, Notification notification)
    {
        await Clients.Group($"tenant_{tenantId}").SendAsync("ReceiveNotification", notification);
    }
}
```

### 7.5.4 Email Template Engine (Fluid/Liquid)

```liquid
<!-- Email template example: approval_pending.liquid -->
{% layout 'base_layout' %}

<h2>Document Pending Approval</h2>
<p>{{ user_name }}, you have a new document awaiting your approval:</p>

<table>
  <tr><td>Document:</td><td>{{ document_type }} #{{ document_number }}</td></tr>
  <tr><td>Amount:</td><td>{{ amount | currency }}</td></tr>
  <tr><td>Submitted by:</td><td>{{ submitter_name }}</td></tr>
</table>

<a href="{{ approval_url }}">Review & Approve</a>
```

---

## 8.5 Semantic Search Architecture (Qdrant)

### 8.5.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SEMANTIC SEARCH ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  Entity Change  │───>│  Embedding      │───>│  Qdrant Vector  │     │
│  │  (EF Core Hook) │    │  Service        │    │  Database       │     │
│  │                 │    │  (OpenAI/Azure) │    │                 │     │
│  └─────────────────┘    └─────────────────┘    └────────┬────────┘     │
│                                                          │              │
│  ┌─────────────────┐                           ┌────────▼────────┐     │
│  │  Search Query   │──────────────────────────>│  Vector Search  │     │
│  │  "cleaning      │                           │  + Tenant Filter│     │
│  │   suppliers"    │                           │                 │     │
│  └─────────────────┘                           └────────┬────────┘     │
│                                                          │              │
│                                                 ┌────────▼────────┐     │
│                                                 │  Ranked Results │     │
│                                                 │  with Scores    │     │
│                                                 └─────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.5.2 Qdrant Collections

```
Collections:
├── vendors              # Vendor entities
│   ├── vector: [1536]   # OpenAI ada-002 embedding dimensions
│   └── payload: { tenantId, vendorId, name, ... }
├── customers
├── accounts
├── ap_invoices
├── ar_invoices
└── assets
```

### 8.5.3 Indexing Service Implementation

```csharp
public interface ISemanticIndexingService
{
    Task IndexEntityAsync<T>(T entity, CancellationToken ct) where T : ISearchable;
    Task RemoveEntityAsync(string collection, Guid entityId, CancellationToken ct);
    Task BulkReindexAsync(string collection, CancellationToken ct);
}

public class QdrantIndexingService : ISemanticIndexingService
{
    private readonly IQdrantClient _qdrant;
    private readonly IEmbeddingService _embedding;

    public async Task IndexEntityAsync<T>(T entity, CancellationToken ct)
    {
        var text = entity.ToSearchableText(); // "ABC Cleaning Services - Bangkok - cleaning supplies"
        var vector = await _embedding.GenerateAsync(text, ct);

        await _qdrant.UpsertAsync(
            collection: entity.GetCollectionName(),
            points: new[] {
                new PointStruct {
                    Id = entity.Id,
                    Vector = vector,
                    Payload = new {
                        tenantId = entity.TenantId,
                        entityId = entity.Id,
                        name = entity.Name,
                        // ... other metadata
                    }
                }
            }, ct);
    }
}
```

### 8.5.4 Search Service Implementation

```csharp
public interface ISemanticSearchService
{
    Task<List<SearchResult>> SearchAsync(SemanticSearchRequest request, CancellationToken ct);
    Task<List<T>> FindSimilarAsync<T>(Guid entityId, int limit, CancellationToken ct);
}

public class SemanticSearchService : ISemanticSearchService
{
    public async Task<List<SearchResult>> SearchAsync(SemanticSearchRequest request, CancellationToken ct)
    {
        var queryVector = await _embedding.GenerateAsync(request.Query, ct);

        var results = await _qdrant.SearchAsync(
            collection: request.Collection,
            vector: queryVector,
            filter: new Filter {
                Must = new[] {
                    new Condition { Key = "tenantId", Match = request.TenantId }
                }
            },
            limit: request.Limit,
            ct);

        return results.Select(r => new SearchResult {
            EntityId = r.Payload["entityId"],
            Name = r.Payload["name"],
            Score = r.Score
        }).ToList();
    }
}
```

---

## 9. Integration Architecture

### 9.1 BlueLedger Integration

```csharp
// Integration service interface
public interface IBlueLedgerService
{
    Task PostInventoryAsync(InventoryPostingRequest request, CancellationToken ct);
    Task PostExtraCostAsync(ExtraCostPostingRequest request, CancellationToken ct);
    Task<List<ApInvoice>> GetReceivingInvoicesAsync(DateRange range, CancellationToken ct);
}

// Implementation with resilience
public class BlueLedgerService : IBlueLedgerService
{
    private readonly HttpClient _httpClient;
    private readonly IRetryPolicy _retryPolicy;

    public async Task PostInventoryAsync(InventoryPostingRequest request, CancellationToken ct)
    {
        await _retryPolicy.ExecuteAsync(async () =>
        {
            var response = await _httpClient.PostAsJsonAsync("/api/inventory/post", request, ct);
            response.EnsureSuccessStatusCode();
        });
    }
}
```

### 9.2 OCR Integration

```csharp
public interface IOcrService
{
    Task<OcrResult> ProcessInvoiceAsync(Stream fileStream, string fileName, CancellationToken ct);
}

public record OcrResult
{
    public bool Success { get; init; }
    public string? VendorName { get; init; }
    public DateTime? InvoiceDate { get; init; }
    public string? InvoiceNumber { get; init; }
    public decimal? TotalAmount { get; init; }
    public List<InvoiceLineItem> LineItems { get; init; }
    public List<OcrField> AllFields { get; init; }
}
```

---

## 9. Deployment Architecture

### 8.1 Container Strategy

```yaml
# docker-compose.yml (Development)
services:
  frontend:
    build: ./frontend
    ports: ["3000:80"]
    environment:
      - VITE_API_BASE_URL=http://localhost:5238

  backend:
    build: ./backend
    ports: ["5000:8080"]
    environment:
      - ConnectionStrings__DefaultConnection=...
      - Redis__ConnectionString=localhost:6379
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=...
      - MYSQL_DATABASE=Carmen
      - MYSQL_USER=carmen_user
      - MYSQL_PASSWORD=...
    volumes:
      - mysql-data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
```

### 8.2 Kubernetes (Production)

```yaml
# Namespace per tenant or shared
apiVersion: v1
kind: Namespace
metadata:
  name: carmen-prod

---
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: carmen-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: carmen-backend
  template:
    metadata:
      labels:
        app: carmen-backend
    spec:
      containers:
      - name: backend
        image: carmen/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: carmen-secrets
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 10. Performance Considerations

### 9.1 Caching Strategy

```
Cache Types:
1. Response Cache - API responses (GET)
2. Data Cache - frequently accessed data (Chart of Accounts)
3. Distributed Lock - prevent duplicate processing
4. Session Cache - user session data

TTL:
- Static data (Accounts, Tax Profiles): 1 hour
- Dynamic data (Vendor, Customer): 15 minutes
- Query results: 5 minutes
- Session: 8 hours
```

### 9.2 Query Optimization

```csharp
// Split queries for large object graphs
var voucher = await _context.JournalVouchers
    .AsSplitQuery()
    .Include(jv => jv.Lines)
    .Include(jv => jv.Attachments)
    .FirstOrDefaultAsync(jv => jv.Id == id, ct);

// Pagination
var paged = await _context.JournalVouchers
    .Where(jv => jv.TenantId == tenantId)
    .OrderBy(jv => jv.VoucherDate)
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync(ct);

// Projection for read-only
var summary = await _context.JournalVouchers
    .Where(jv => jv.TenantId == tenantId)
    .Select(jv => new JournalVoucherSummaryDto
    {
        Id = jv.Id,
        VoucherNo = jv.VoucherNo,
        VoucherDate = jv.VoucherDate,
        TotalAmount = jv.Lines.Sum(l => l.DebitAmount)
    })
    .ToListAsync(ct);
```

### 9.3 Advanced Performance Optimizations

#### Database Read Replicas
For reporting-heavy workloads, implement read replicas to reduce load on the primary database:

```csharp
// Configure read replica for reporting queries
builder.Services.AddDbContext<CarmenDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString),
        mysqlOptions =>
        {
            mysqlOptions.CommandTimeout(30);
        });
});

// Separate read-only context for reporting
public class CarmenReadDbContext : DbContext
{
    public CarmenReadDbContext(DbContextOptions<CarmenReadDbContext> options)
        : base(options) { }

    // Read-only replica connection
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseMySql(
            _configuration.GetConnectionString("ReadReplicaConnection"),
            ServerVersion.AutoDetect(_configuration.GetConnectionString("ReadReplicaConnection"))
        );
    }
}
```

#### Materialized Views for Complex Reports
Create summary tables for expensive reports like Trial Balance and Financial Statements:

```sql
-- Create summary table for trial balance
CREATE TABLE TrialBalanceSummary (
    SummaryId CHAR(36) PRIMARY KEY,
    TenantId CHAR(36) NOT NULL,
    AsOfDate DATE NOT NULL,
    AccountId CHAR(36) NOT NULL,
    AccountCode VARCHAR(50),
    AccountName VARCHAR(255),
    DebitBalance DECIMAL(19,4) DEFAULT 0,
    CreditBalance DECIMAL(19,4) DEFAULT 0,
    LastCalculatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_date (TenantId, AsOfDate),
    INDEX idx_account (AccountId)
);

-- Refresh via background job
CALL RefreshTrialBalanceSummary(@TenantId, @AsOfDate);
```

#### Connection Pooling Optimization
Optimize MySQL connection pooling for high concurrency:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Carmen;Uid=carmen_user;Pwd=password;SslMode=Required;Connection Lifetime=300;Connection Reset=true;Max Pool Size=100;Min Pool Size=5;"
  }
}
```

| Parameter | Recommended Value | Description |
|-----------|------------------|-------------|
| Max Pool Size | 100 | Maximum connections in pool |
| Min Pool Size | 5 | Minimum connections kept alive |
| Connection Lifetime | 300 | Seconds before connection recreation |
| Connection Idle Timeout | 600 | Seconds before idle connection closed |

#### API Rate Limiting per Tenant
Implement tenant-specific rate limiting to prevent resource abuse:

```csharp
// Configure rate limiting middleware
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("PerTenantPolicy", context =>
    {
        var tenantId = context.User.GetTenantId();
        return RateLimitPartition.GetSlidingWindowLimiter(
            tenantId.ToString(),
            _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 100, // 100 requests
                Window = TimeSpan.FromSeconds(10),
                SegmentsPerWindow = 2
            });
    });
});

// Apply to endpoints
[HttpGet]
[EnableRateLimiting("PerTenantPolicy")]
public async Task<ActionResult> GetJournalVouchers() { }
```

#### WebSocket for Real-Time Notifications
Replace polling with WebSocket for real-time updates:

```csharp
// Add WebSocket support
builder.Services.AddSignalR();

// Hub for real-time notifications
public class NotificationHub : Hub
{
    public async Task JoinTenantGroup(string tenantId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
    }

    public async Task BroadcastApproval(string tenantId, object approvalData)
    {
        await Clients.Group($"tenant_{tenantId}").SendAsync("ApprovalPending", approvalData);
    }
}
```

#### Batch Processing for Heavy Operations
Use background jobs for batch operations:

```csharp
// Hangfire batch job for month-end processing
public class MonthEndProcessingService
{
    public async Task ProcessMonthEndAsync(DateOnly closingDate, string tenantId)
    {
        // Enqueue background jobs
        var jobId = BackgroundJob.Enqueue(() => CalculateDepreciationAsync(closingDate, tenantId));
        BackgroundJob.ContinueWith(jobId, () => CalculateAmortizationAsync(closingDate, tenantId));
        BackgroundJob.ContinueJobWith(jobId, () => GenerateFinancialReportsAsync(closingDate, tenantId));
    }
}
```

#### Lazy Loading for Large Datasets
Implement virtual scrolling for large data tables:

```typescript
// Frontend virtual scroll with TanStack Virtual
import { useVirtualizer } from '@tanstack/react-virtual';

function JournalVoucherList() {
  const rowVirtualizer = useVirtualizer({
    count: vouchers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // row height
    overscan: 10
  });

  // Render only visible rows
}
```

#### Optimistic Locking Strategy
Implement proper concurrency control for financial transactions:

```csharp
public class JournalVoucher
{
    // RowVersion for MySQL (using TIMESTAMP)
    [Timestamp]
    public byte[] RowVersion { get; set; }
}

// Handle concurrency conflicts
try
{
    await _context.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException ex)
{
    // Log and handle conflict
    await HandleConcurrencyConflictAsync(ex.Entry);
}
```

### 9.4 Performance Monitoring Metrics

Key metrics to monitor:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p95) | < 500ms | > 1s |
| Database Query Duration | < 100ms | > 500ms |
| Cache Hit Rate | > 80% | < 60% |
| Connection Pool Usage | < 80% | > 90% |
| Background Job Queue | < 100 | > 500 |
| Memory per Instance | < 512MB | > 1GB |

---

## 11. Monitoring & Observability

### 10.1 Logging Strategy

```csharp
// Structured logging with Serilog
Log.Information("Processing journal voucher {VoucherId} for tenant {TenantId}",
    voucherId, tenantId);

Log.Warning("Vendor credit limit exceeded. Vendor: {VendorId}, Limit: {Limit}, Current: {Current}",
    vendorId, limit, current);

Log.Error(exception, "Failed to post journal voucher {VoucherId}", voucherId);

// Log levels
- Verbose: Detailed diagnostics
- Debug: Development troubleshooting
- Information: Normal operation
- Warning: Something unusual but not error
- Error: Error occurred but operation can continue
- Fatal: Critical error, operation cannot continue
```

### 10.2 Health Checks

```csharp
// Health check endpoints
builder.Services.AddHealthChecks()
    .AddDbContextCheck<CarmenDbContext>("database")
    .AddRedis(redisConnectionString)
    .AddHangfire(options => options.MinimumAvailableServers = 1)
    .AddCheck<BlueLedgerHealthCheck>("blueledger");

// Endpoint: /health
// Returns: 200 OK or 503 Service Unavailable
```

---

## 12. Development Workflow

### 11.1 Branch Strategy

```
main          ────────────────────────────────────> Production
                ↑
                │
develop        ───────────────────────────────────> Staging
                ↑           ↑           ↑
                │           │           │
feature/jv-xxx ──┘           │           │
feature/ap-xxx ──────────────┘           │
feature/ar-xxx ──────────────────────────┘
```

### 11.2 Code Review Checklist

- [ ] Follows coding standards
- [ ] Unit tests added/updated
- [ ] API documentation updated
- [ ] No compiler warnings
- [ ] Performance considered
- [ ] Security reviewed
- [ ] Error handling implemented
- [ ] Logging added where appropriate
- [ ] Database migrations included if needed
- [ ] Backward compatibility maintained

---

## 13. Migration Strategy

### 12.1 Phased Migration Approach

```
Phase 1: Infrastructure Setup (2 weeks)
- CI/CD pipeline
- Development environment
- Database schema

Phase 2: Core Modules (8 weeks)
- General Ledger
- Accounts Payable
- Accounts Receivable
- Asset Management

Phase 3: Integration (2 weeks)
- BlueLedger
- OCR
- Background jobs

Phase 4: Testing & QA (3 weeks)
- Unit tests
- Integration tests
- UAT

Phase 5: Deployment (1 week)
- Pilot deployment
- Production cutover
- Monitoring
```

### 12.2 Data Migration Plan

```
1. Schema Migration
   - Create new schema
   - Map legacy tables to new entities

2. Data Mapping
   - Transform legacy data to new format
   - Validate data integrity

3. Data Validation
   - Compare totals (debits = credits)
   - Verify balances forward
   - Check for orphaned records

4. Cutover
   - Final data sync
   - Switch to new system
   - Verify operations
```
