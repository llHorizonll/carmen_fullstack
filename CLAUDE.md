# CLAUDE.md - Claude Code Instructions

This file provides guidance to Claude Code (claude.ai/code) when working with code in the Carmen SAAS Financial Accounting System repository.

## Project Overview

Carmen is a SAAS financial accounting ERP system designed for hotels. It provides comprehensive financial management including General Ledger, Accounts Payable, Accounts Receivable, and Asset Management with multi-tenant architecture.

## Tech Stack

### Frontend
- **React 18+** with TypeScript and Vite
- **shadcn/ui** - Modern UI component library built on Radix UI
- **TanStack Query** - Server state management and caching
- **Zustand** - Client state management
- **React Router v7** - Client-side routing
- **React Hook Form + Zod** - Form handling and validation
- **Tailwind CSS** - Utility-first styling

### Backend
- **.NET 8.0 Web API** with C# 12
- **Entity Framework Core 9+** - ORM and data access
- **MySQL 8.0+** - Primary database
- **Redis** - Distributed caching
- **Hangfire** - Background job processing
- **Serilog** - Structured logging
- **SignalR** - Real-time notifications
- **MailKit** - Email sending (SMTP)
- **Qdrant** - Vector database for semantic search

## Common Development Commands

### Frontend Commands
```bash
cd frontend

# Development
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run Vitest tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

### Backend Commands
```bash
cd backend

# Development
dotnet restore           # Restore NuGet packages
dotnet build             # Build solution
dotnet run --project src/Carmen.WebApi    # Run API (http://localhost:5238)

# Database
dotnet ef migrations add <Name> --project src/Carmen.Database
dotnet ef database update --project src/Carmen.Database
dotnet ef script --project src/Carmen.Database    # Generate SQL script

# Testing
dotnet test              # Run all tests
dotnet test --filter "FullyQualifiedName~Unit"    # Unit tests only
```

### Docker Commands
```bash
# Full stack
docker-compose up -d     # Start all services
docker-compose down      # Stop all services

# Individual services
docker-compose up frontend -d    # Start frontend only
docker-compose up backend -d     # Start backend only
docker-compose up redis -d       # Start Redis only
```

## Architecture Overview

### Solution Structure
```
carmen-new/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── app/                # React Router routes
│   │   ├── components/         # Shared components
│   │   ├── features/           # Feature modules
│   │   ├── lib/                # Utilities
│   │   ├── stores/             # Zustand stores
│   │   └── types/              # Global types
│   └── public/                 # Static assets
├── backend/
│   └── src/
│       ├── Carmen.Application/    # Business logic, DTOs, services
│       ├── Carmen.Domain/         # Entities, domain logic
│       ├── Carmen.Infrastructure/ # EF Core, external services
│       ├── Carmen.WebApi/         # Controllers, configuration
│       └── Carmen.Database/       # DbContext, migrations
├── shared/                      # Shared types and contracts
└── docs/                       # Additional documentation
```

### Frontend Feature Structure
```
features/
├── general-ledger/
│   ├── api/               # API client functions
│   ├── components/        # GL-specific components
│   ├── hooks/             # Custom hooks (useJournalVouchers, etc.)
│   ├── types/             # TypeScript types
│   └── views/             # Page components (List, Create, Edit, Show)
├── accounts-payable/      # Same structure
├── accounts-receivable/   # Same structure
└── asset-management/      # Same structure
```

### Backend Layer Structure
```
Carmen.Domain/         # Core business entities (no dependencies)
Carmen.Application/    # Business logic, interfaces, DTOs (depends on Domain)
Carmen.Infrastructure/ # External concerns (EF, APIs) - implements interfaces
Carmen.WebApi/         # Presentation layer - controllers, middleware
```

## Module Configuration

### Resource and Menu Configuration
Frontend routes and menu items are configured in:
- `frontend/src/app/routes.tsx` - Route definitions
- `frontend/src/lib/navigation.ts` - Menu structure
- `frontend/src/features/*/index.ts` - Feature exports

Each resource has:
- `path` - URL path
- `name` - Unique identifier
- `label` - Display label (localized)
- `permission` - Required permission
- `component` - Page component

### Authentication & Authorization
- **JWT tokens** stored in secure HTTP-only cookies (or localStorage with XSS protection)
- **Permissions** fetched from `/api/v1/me/permissions` endpoint
- **Permission check**: `usePermission()` hook in components
- **Protected routes**: Wrap with `<ProtectedRoute permission="GL.JournalVoucher" />`

### Internationalization
- **Supported languages**: English (en), Thai (th), Vietnamese (vi)
- **Translation files**: `frontend/src/i18n/{lang}.json`
- **Language switcher**: In user menu, persists to localStorage
- **Date/number formatting**: Locale-aware via `Intl` API and date-fns

## Key Integration Points

### BlueLedger Integration
The system integrates with BlueLedger (external PMS/hotel system):
- **Inventory posting**: GL journal entries for inventory movements
- **Extra cost posting**: Additional charges to guest folios
- **Receiving integration**: AP invoice creation from receiving documents

Integration services are in `backend/src/Carmen.Application/Integration/`

### OCR Integration
Invoice OCR processing:
- Upload endpoint: `POST /api/v1/tenants/{tenantId}/ap/invoices/ocr`
- Returns structured invoice data for review
- Manual approval before posting

### Desktop App Integration
Embedded dashboard mode via URL parameters:
- `tk` - Admin token
- `urlApi` - Override API URL
- `showDashboardOnly` - Hide navigation, show only dashboard

### Notification & Email System
Real-time notifications via SignalR and email via MailKit:
- **SignalR Hub**: `/hubs/notifications` - Real-time in-app notifications
- **Email Service**: MailKit with Fluid templates for email rendering
- **Background Queue**: Hangfire jobs for email sending and digest
- **Notification Types**: Approval, Alert, System, Report, User
- **User Preferences**: Per-type toggles for in-app and email delivery

Integration points:
- Workflow module sends notifications on approval requests/completions
- AP/AR modules send payment due and invoice overdue alerts
- Reports module notifies when scheduled reports are ready
- System broadcasts version updates and maintenance notices

## State Management Patterns

### Server State (TanStack Query)
```typescript
// Queries
const { data, isLoading, error } = useQuery({
  queryKey: ['journal-vouchers', { page, pageSize }],
  queryFn: () => apiClient.journalVouchers.list({ page, pageSize })
});

// Mutations
const createMutation = useMutation({
  mutationFn: apiClient.journalVouchers.create,
  onSuccess: () => queryClient.invalidateQueries(['journal-vouchers'])
});
```

### Client State (Zustand)
```typescript
// Theme store
const { theme, setTheme } = useThemeStore();

// Auth store
const { user, permissions, login, logout } = useAuthStore();
```

## API Client Configuration

### Frontend API Client
Located in `frontend/src/lib/api-client.ts`:
- Base URL from environment variable
- Automatic token injection
- Response/error interceptors
- Tenant context from JWT

### Backend API Controllers
Located in `backend/src/Carmen.WebApi/Controllers/`:
- Route prefix: `/api/v1/tenants/{tenantId}`
- `[Authorize]` attribute for protected endpoints
- `[RequirePermission]` attribute for authorization
- Swagger documentation with XML comments

## Error Handling Patterns

### Frontend Error Handling
- API errors displayed via toast notifications
- Form errors: React Hook Form error rendering
- Global error boundary for unexpected errors
- 401/403: Auto redirect to login

### Backend Error Handling
- Global exception middleware
- `ProblemDetails` response for errors
- Validation errors return 400 with field errors
- Business logic errors return appropriate 4xx codes

## Development Guidelines

### When Adding a New Feature
1. Create feature folder structure under `frontend/src/features/`
2. Define TypeScript types for data models
3. Create API client functions in `api/`
4. Build UI components using shadcn/ui patterns
5. Add routes to `app/routes.tsx`
6. Add menu item to `lib/navigation.ts`
7. Create corresponding backend:
   - Domain entity
   - DTOs
   - Service interface and implementation
   - Controller with endpoints
   - Add migration if schema changes

### When Modifying Existing Code
1. Read the file first to understand patterns
2. Maintain consistency with existing code style
3. Update tests to cover changes
4. Update types if data contracts change
5. Consider backward compatibility for API changes

### Code Style Rules
- **No `any` types** - Use `unknown` or proper types
- **No console.log** - Use proper logging
- **No commented code** - Delete unused code
- **No large functions** - Break down into smaller units
- **No magic strings** - Use constants
- **Always handle errors** - Don't swallow exceptions

## Testing Guidelines

### Frontend Testing
- **Unit tests**: Component logic, utilities
- **Integration tests**: API client, hooks
- **E2E tests**: Critical user flows (login, create invoice)
- Test files: `*.component.test.tsx`, `*.hook.test.ts`

### Backend Testing
- **Unit tests**: Business logic, services
- **Integration tests**: API endpoints with in-memory database
- Test files: `*.Tests.cs` projects

## Common Patterns

### Permission Check
```typescript
// Frontend
const { hasPermission } = usePermission();
if (!hasPermission('GL.JournalVoucher.Create')) {
  return <AccessDenied />;
}
```

```csharp
// Backend
[RequirePermission("GL.JournalVoucher.Create")]
[HttpPost]
public async Task<ActionResult> Create(CreateJournalVoucherRequest request)
```

### Tenant Context
```typescript
// Frontend - tenant from JWT
const tenantId = useTenantId(); // From auth context
```

```csharp
// Backend - tenant from claims
var tenantId = User.GetTenantId(); // Extension method
// Global query filter applies automatically
```

### Pagination Response
```typescript
type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};
```

## Environment Configuration

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:5238
VITE_APP_NAME=Carmen
VITE_APP_VERSION=1.0.0
```

### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Carmen;Uid=carmen_user;Pwd=your_password;SslMode=Required;"
  },
  "Redis": {
    "ConnectionString": "localhost:6379"
  },
  "Jwt": {
    "SecretKey": "...",
    "ExpiryMinutes": 480
  },
  "BlueLedger": {
    "BaseUrl": "https://blueledger.example.com/api"
  }
}
```

## Important Notes

1. **Never commit secrets** - Use environment variables or user secrets
2. **All financial operations are tenant-scoped** - Always include tenant context
3. **Period closing is irreversible** - Require user confirmation
4. **Date handling** - Use UTC for storage, convert to local for display
5. **Currency** - Store in base currency, convert for display
6. **Audit trail** - Track user and timestamp for all mutations
