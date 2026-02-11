# AGENT.md - AI Development Agent Instructions

This file provides instructions for AI agents (Claude, GitHub Copilot, etc.) when working on the Carmen SAAS Financial Accounting System.

## Project Context

**Carmen** is a SAAS financial accounting ERP system specifically designed for hotels. It handles General Ledger, Accounts Payable, Accounts Receivable, and Asset Management with multi-tenant architecture.

## Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 5+
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: Zustand or React Context + Query
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Tables**: TanStack Table (React Table)
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Backend
- **Framework**: .NET 8.0 Web API
- **ORM**: Entity Framework Core 9+
- **Database**: MySQL 8.0+
- **EF Core Provider**: Pomelo.EntityFrameworkCore.MySql
- **Authentication**: JWT with Microsoft.Identity (or OpenIddict)
- **API Documentation**: Swagger/OpenAPI
- **CORS**: Configured for frontend origin
- **Caching**: Redis (distributed cache)
- **Background Jobs**: Hangfire
- **Logging**: Serilog with SEQ
- **Real-time**: SignalR for notifications
- **Email**: MailKit (SMTP) with Fluid templates
- **Vector Search**: Qdrant for semantic search

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions
- **Version Control**: Git with main/develop/feature branches

## Code Style Guidelines

### Frontend (TypeScript/React)
```typescript
// Use functional components with hooks
// Use type aliases over interfaces (consistent choice)
// Use const assertions for literals
// Prefer explicit return types for public APIs

// ✅ Good
type User = {
  id: string;
  name: string;
};

export function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ❌ Avoid
// interface User { ... }
// class components
// any types
```

### Backend (C#)
```csharp
// Use async/await for I/O operations
// Use records for DTOs
// Use pattern matching
// Configure services with extensions

// ✅ Good
public record CreateUserRequest(string Name, string Email);

public async Task<User> CreateUserAsync(CreateUserRequest request, CancellationToken ct)
{
    var user = new User { ... };
    await _dbContext.Users.AddAsync(user, ct);
    await _dbContext.SaveChangesAsync(ct);
    return user;
}

// ❌ Avoid
// Synchronous I/O
// .Result or .Wait()
// Public fields
```

## Architecture Patterns

### Frontend Architecture
```
src/
├── app/                    # React Router routes
├── components/             # Shared UI components
│   ├── ui/                # shadcn/ui components
│   └── features/          # Feature-specific components
├── features/              # Feature modules (GL, AP, AR, Asset)
│   ├── general-ledger/
│   │   ├── api/          # API calls
│   │   ├── components/   # Feature components
│   │   ├── hooks/        # Custom hooks
│   │   ├── types/        # TypeScript types
│   │   └── views/        # Page components
├── lib/                   # Utilities and configurations
│   ├── api-client.ts     # Axios/fetch wrapper
│   ├── query-client.ts   # React Query setup
│   └── utils.ts          # Utility functions
├── stores/                # Zustand stores
├── i18n/                  # Translations (en, th, vi)
└── types/                 # Global types
```

### Backend Architecture
```
src/
├── Carmen.Application/    # Business logic, services, DTOs
├── Carmen.Domain/         # Entities, value objects, interfaces
├── Carmen.Infrastructure/ # EF Core, external services
├── Carmen.WebApi/         # Controllers, middleware, configuration
├── Carmen.Tests/          # Unit and integration tests
└── Carmen.Database/       # Migrations, DbContext
```

## Module-Specific Guidelines

### General Ledger Module
- Journal vouchers must support multi-currency
- Chart of accounts is hierarchical (segment-based)
- Period closing is irreversible - require confirmation
- Financial reports must be real-time (cached with cache invalidation)

### Accounts Payable Module
- Invoice approval workflow is configurable per tenant
- Three-tier tax structure (Tax1, Tax2, Withholding Tax)
- Vendor aging analysis: 1-30, 31-60, 61-90, 90+ days
- Payment allocation follows FIFO principle

### Accounts Receivable Module
- Customer credit limits are enforced at invoice creation
- Receipt allocation supports manual and automatic modes
- Exchange gain/loss calculated at transaction time
- Folio integration for hotel room charges

### Asset Management
- Depreciation calculated monthly (straight-line, declining balance)
- Pre-assets pending approval before becoming active assets
- Disposal creates journal entries automatically
- Asset categories have default depreciation rules

### Notification & Email System
- **SignalR Hub**: `/hubs/notifications` for real-time in-app notifications
- **Email Service**: MailKit with Fluid templates for email rendering
- **Background Queue**: Hangfire jobs for email sending and digest batching
- **Notification Types**: Approval, Alert, System, Report, User
- **User Preferences**: Per-type toggles for in-app and email delivery
- Integration with Workflow module for approval requests/completions
- Integration with AP/AR for payment due and overdue alerts
- Integration with Reports for scheduled report completion notifications
- System broadcasts for version updates and maintenance notices

### Semantic Search (Qdrant)
- **Vector Database**: Qdrant (cloud or self-hosted)
- **Embeddings**: OpenAI ada-002 or Azure OpenAI
- **Searchable Entities**: Vendors, Customers, Chart of Accounts, Invoices, Assets
- **Multi-tenant**: Filter by TenantId in Qdrant payload
- **Indexing**: Auto-index on entity create/update via EF Core hooks
- **Thai Language**: Embeddings support Thai text natively
- Natural language queries: "cleaning suppliers" → finds relevant vendors
- Similar entity lookup: Find vendors similar to selected vendor

## API Design Principles

### RESTful Conventions
```
GET    /api/v1/tenants/{tenantId}/gl/journal-vouchers
GET    /api/v1/tenants/{tenantId}/gl/journal-vouchers/{id}
POST   /api/v1/tenants/{tenantId}/gl/journal-vouchers
PUT    /api/v1/tenants/{tenantId}/gl/journal-vouchers/{id}
DELETE /api/v1/tenants/{tenantId}/gl/journal-vouchers/{id}
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 150
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly message",
    "details": ["Field validation errors"]
  }
}
```

## Multi-Tenancy Guidelines

- Tenant ID extracted from JWT claims on every request
- All database queries scoped by tenant ID (global query filters)
- Admin tokens for tenant identification in legacy integrations
- Database isolation: Separate schemas or row-level security

## Security Guidelines

- All API endpoints require authentication (except login)
- Authorization checks at controller level (permissions)
- SQL injection prevention: Always parameterized queries
- XSS prevention: Never render untrusted HTML
- CSRF tokens for state-changing operations
- Audit logging for financial transactions

## Testing Guidelines

- Unit tests for business logic (Domain layer)
- Integration tests for API endpoints
- E2E tests for critical user flows (Playwright)
- Minimum 70% code coverage target

## Integration with BlueLedger

The system maintains integration with BlueLedger for:
- Inventory posting
- Extra cost posting
- Receiving integration

Integration points are abstracted through interfaces for testability.

## Common Commands

### Frontend
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build
npm run test             # Run tests
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

### Backend
```bash
cd backend
dotnet restore           # Restore packages
dotnet build             # Build solution
dotnet run               # Run WebApi
dotnet test              # Run tests

# Database migrations (MySQL with Pomelo provider)
dotnet ef migrations add <name> --project src/Carmen.Database
dotnet ef database update --project src/Carmen.Database
dotnet ef script --project src/Carmen.Database    # Generate SQL script
```

## Agent-Specific Instructions

When Claude is asked to:
1. **Create a component**: Use shadcn/ui patterns, TypeScript strict mode
2. **Create an API endpoint**: Follow RESTful conventions, add XML comments
3. **Create a query**: Use parameterized queries, apply tenant filtering
4. **Debug an issue**: Check browser console, network tab, and backend logs
5. **Add a feature**: Create in feature folder, update types, add tests
6. **Refactor code**: Preserve functionality, improve readability
7. **Write tests**: Cover happy path and error cases

## Key Decisions Made

1. **React Admin replacement**: Building custom UI with shadcn/ui for flexibility
2. **State management**: Zustand for global state, TanStack Query for server state
3. **Form handling**: React Hook Form + Zod for type-safe validation
4. **Multi-tenancy**: Row-level security with tenant ID in JWT
5. **Database**: MySQL 8.0+ with Pomelo.EntityFrameworkCore.MySql provider
6. **Caching**: Redis for distributed caching in multi-server scenarios
7. **Real-time notifications**: SignalR for instant in-app delivery
8. **Email system**: MailKit (MIT license) with Fluid template engine
9. **Notification architecture**: Unified service with multiple delivery channels
10. **Semantic search**: Qdrant vector DB for natural language entity search
