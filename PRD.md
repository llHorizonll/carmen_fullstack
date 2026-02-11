# PRD - Product Requirements Document
## Carmen SAAS Financial Accounting System for Hotels

**Version:** 1.0
**Date:** January 2026
**Status:** Draft

---

## 1. Executive Summary

Carmen is a cloud-based SAAS financial accounting ERP system specifically designed for hotels. It provides comprehensive financial management capabilities including General Ledger, Accounts Payable, Accounts Receivable, and Asset Management with multi-tenant architecture supporting multiple hotel properties.

### 1.1 Business Objectives
- Provide hotels with a modern, cloud-based financial management system
- Streamline accounting operations with automated workflows
- Support multi-property hotel chains with centralized control
- Ensure compliance with financial reporting standards
- Reduce manual errors through automated calculations and validations

### 1.2 Target Users
| User Role | Description | Primary Needs |
|-----------|-------------|---------------|
| Hotel Accountant | Day-to-day accounting operations | Easy data entry, quick approvals, clear reports |
| Financial Controller | Oversight and reporting | Comprehensive reports, audit trails, period controls |
| Hotel Manager | Operational financial overview | Dashboards, key metrics, budget tracking |
| System Administrator | Configuration and maintenance | User management, settings, tenant setup |
| Auditor | Compliance verification | Audit logs, transaction history, document trails |

---

## 2. Core Modules

### 2.1 General Ledger (GL)

**Purpose:** Central accounting module for all financial transactions

**Features:**
| Feature | Description |
|---------|-------------|
| Journal Voucher (JV) | Manual journal entries for adjustments and reclassifications |
| Template Voucher | Reusable journal templates for recurring entries |
| Recurring Voucher | Automated recurring entries (daily, weekly, monthly, yearly) |
| Amortization Voucher | Automated amortization schedules for prepayments |
| Allocation Voucher | Cost allocation across departments/cost centers |
| Chart of Accounts | Hierarchical account structure with segment-based coding |
| Account Summary | Real-time account balances and transaction history |
| Financial Reports | Balance Sheet, Income Statement, Cash Flow, Trial Balance |
| Budget Management | Budget creation, tracking, and variance analysis |
| Period Closing | Monthly and annual period closing controls |

**Business Rules:**
- Double-entry bookkeeping enforced on all transactions
- Debits must equal credits before posting
- Period closing prevents modifications to closed periods
- Chart of accounts supports multi-segment coding (e.g., 1000-001-001)
- Accounts can be flagged for specific module usage (AP, AR, Asset)

### 2.2 Accounts Payable (AP)

**Purpose:** Manage vendor relationships and purchase obligations

**Features:**
| Feature | Description |
|---------|-------------|
| Vendor Profile | Vendor master data with tax and payment information |
| Invoice Processing | Vendor invoice entry with tax and withholding calculations |
| Invoice Approval | Configurable approval workflow before payment |
| Payment Processing | Vendor payment creation and processing |
| Tax Management | Three-tier tax structure (Tax1, Tax2, Withholding Tax) |
| Currency Support | Multi-currency invoices with automatic exchange rate calculation |
| Aging Analysis | Vendor aging buckets (1-30, 31-60, 61-90, 90+ days) |
| OCR Integration | Optical character recognition for invoice data extraction |
| 1099/Withholding | Withholding tax certificates and reporting |
| AP Period Closing | Period end closing to prevent modifications |

**Business Rules:**
- Invoice requires valid vendor
- Payment requires approved invoice
- Three-tier tax calculation: Tax1 (VAT/GST), Tax2 (additional tax), Withholding Tax
- Vendor aging calculated from invoice due date
- Credit limit warning at invoice entry
- Payment allocation follows FIFO principle

### 2.3 Accounts Receivable (AR)

**Purpose:** Manage customer relationships and receivables

**Features:**
| Feature | Description |
|---------|-------------|
| Customer Profile | Customer master data with credit terms and limits |
| Invoice Generation | Customer invoice creation with project/owner tracking |
| Receipt Processing | Payment receipt entry and allocation |
| Credit Management | Credit limit enforcement and aging tracking |
| Statement Generation | Monthly customer statements |
| Folio Management | Guest folio integration for room charges |
| Exchange Gain/Loss | Automatic calculation on foreign currency transactions |
| AR Period Closing | Period end closing controls |

**Business Rules:**
- Invoice requires valid customer
- Credit limit enforced at invoice creation
- Receipt allocation supports manual and automatic modes
- Exchange gain/loss calculated at receipt time
- Aging calculated from invoice due date
- Statements include transaction history and balance

### 2.4 Asset Management

**Purpose:** Track fixed assets and depreciation

**Features:**
| Feature | Description |
|---------|-------------|
| Asset Register | Fixed asset master data with depreciation settings |
| Pre-Asset Register | Pending assets awaiting approval |
| Asset Acquisition | New asset registration and capitalization |
| Depreciation Calculation | Automated monthly depreciation (multiple methods) |
| Asset Disposal | Asset retirement with gain/loss calculation |
| Asset Transfer | Transfer between departments/locations |
| Barcode Tracking | Asset labeling and physical tracking |
| Asset Reports | Depreciation schedule, asset register, disposal report |

**Business Rules:**
- Pre-asset must be approved before becoming active asset
- Depreciation methods: Straight-line, Declining Balance, Units of Production
- Depreciation calculated monthly
- Disposal creates automatic journal entry for gain/loss
- Asset categories have default depreciation rules
- Salvage value considered in depreciation calculation

---

## 3. Supporting Modules

### 3.1 Configuration

**Features:**
| Feature | Description |
|---------|-------------|
| Chart of Accounts Setup | Account structure definition |
| Tax Profile Configuration | Tax rates and codes |
| Currency Setup | Exchange rate management |
| Bank Account Management | Bank account definition |
| Department/Cost Center | Organizational structure |
| Payment Terms | Standard payment term definitions |
| Document Prefixes | Auto-numbering configuration |

### 3.2 Settings

**Features:**
| Feature | Description |
|---------|-------------|
| Company Settings | Company information and defaults |
| Number Format | Decimal separators, date formats |
| Theme Settings | UI appearance (light/dark) |
| Language Settings | User language preference |
| License Management | License status and expiry |
| Dashboard Configuration | Widget layout and selection |

### 3.3 Workflow & Approval

**Features:**
| Feature | Description |
|---------|-------------|
| Approval Workflow | Configurable multi-level approval |
| Workflow Steps | Define approval stages and approvers |
| Delegation | Approver delegation during absence |
| Notification | Email/in-app notifications for approvals |
| Approval History | Complete audit trail of approvals |

### 3.4 Notification & Email System

**Purpose:** Real-time notifications and email delivery for system events

**Features:**
| Feature | Description |
|---------|-------------|
| Real-time Notifications | Instant in-app notifications via SignalR |
| Email Delivery | SMTP email sending via MailKit |
| Email Templates | Fluid/Liquid template engine with multi-language support |
| Notification Types | Approval, Alert, System, Report, User notifications |
| User Preferences | Per-type toggles for in-app and email delivery |
| Notification History | View and manage past notifications |
| Unread Badge | Visual indicator of unread notification count |
| Email Digest | Daily/weekly summary email option |
| System Broadcasts | Tenant-wide and system-wide announcements |

**Notification Types:**
| Type | Trigger | Default Delivery |
|------|---------|------------------|
| **Approval Request** | Document submitted for approval | In-app + Email |
| **Approval Complete** | Document approved/rejected | In-app + Email |
| **Payment Due** | Upcoming payment deadline | In-app + Email |
| **Invoice Overdue** | Invoice past due date | In-app + Email |
| **Credit Limit Alert** | Customer approaching credit limit | In-app |
| **Budget Exceeded** | Budget threshold crossed | In-app + Email |
| **Report Ready** | Scheduled report generated | In-app + Email |
| **System Maintenance** | Scheduled downtime notice | In-app (broadcast) |
| **Version Update** | New system version available | In-app (broadcast) |

**Business Rules:**
- Notifications are tenant-scoped (users only see their tenant's notifications)
- System broadcasts reach all users across all tenants
- User preferences control email delivery (can disable per notification type)
- Unread notifications older than 90 days are automatically archived
- Failed email deliveries are retried with exponential backoff

### 3.5 Semantic Search

**Purpose:** Natural language search across all business entities

**Features:**
| Feature | Description |
|---------|-------------|
| Natural Language Search | Search using descriptive phrases, not just keywords |
| Vendor Search | "cleaning supplies" → finds "ABC Sanitation Services" |
| Customer Search | "corporate clients Bangkok" → finds relevant customers |
| Account Search | "expenses for repairs" → finds maintenance accounts |
| Invoice Search | Search invoice descriptions semantically |
| Asset Search | "kitchen equipment" → finds related fixed assets |
| Similar Entity Lookup | "Find vendors similar to this one" |
| Thai Language Support | Full Thai language semantic search |

**Searchable Entities:**
| Entity | Indexed Fields |
|--------|----------------|
| **Vendors** | Name, Description, Services, Categories |
| **Customers** | Name, Description, Contact Info, Notes |
| **Chart of Accounts** | Account Name, Description, Purpose |
| **AP Invoices** | Vendor, Description, Line Items |
| **AR Invoices** | Customer, Description, Line Items |
| **Fixed Assets** | Name, Description, Location, Category |

**Technology:**
- **Qdrant** - Vector database for embedding storage
- **OpenAI/Azure Embeddings** - Text-to-vector conversion
- **Real-time Indexing** - Auto-index on entity create/update

**Business Rules:**
- All searches are tenant-scoped (only returns entities in user's tenant)
- Minimum relevance score threshold for results (configurable)
- Indexing happens asynchronously via background jobs
- Bulk reindex available for data migrations

---

## 4. Technical Requirements

### 4.1 Multi-Tenancy
- **Data Isolation:** Complete separation of tenant data
- **Tenant Context:** All operations scoped to tenant
- **Admin Token:** Tenant identification for API access
- **Tenant Configuration:** Per-tenant settings and preferences

### 4.2 Security
| Requirement | Description |
|-------------|-------------|
| Authentication | JWT-based authentication |
| Authorization | Role-based access control with fine-grained permissions |
| Audit Trail | All financial transactions logged with user and timestamp |
| Data Encryption | Encryption at rest and in transit |
| Session Management | Secure session handling with timeout |

### 4.3 Performance
| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| API Response | < 500ms (p95) |
| Report Generation | < 10 seconds for standard reports |
| Concurrent Users | 100+ users per tenant |

### 4.4 Availability
| Metric | Target |
|--------|--------|
| Uptime | 99.5% monthly |
| Backup | Daily automated backups |
| Recovery | RTO: 4 hours, RPO: 1 hour |

---

## 5. Integration Requirements

### 5.1 BlueLedger Integration
**Purpose:** Integration with hotel PMS (Property Management System)

**Integration Points:**
| Endpoint | Purpose |
|----------|---------|
| Inventory Posting | Post inventory movements to GL |
| Extra Cost Posting | Post additional guest charges |
| Receiving Integration | Create AP invoices from receiving documents |

### 5.2 OCR Integration
**Purpose:** Automated invoice data extraction

**Capabilities:**
- PDF and image invoice upload
- Data extraction (vendor, date, amount, line items)
- Human review before posting
- Support for multiple invoice formats

### 5.3 Desktop App Integration
**Purpose:** Embedded dashboard mode

**URL Parameters:**
- `tk` - Admin token for authentication
- `urlApi` - Override API URL
- `showDashboardOnly` - Hide navigation, show only dashboard

---

## 6. User Experience Requirements

### 6.1 Responsiveness
- Mobile-friendly responsive design
- Tablet optimization for data entry
- Desktop optimization for reporting

### 6.2 Internationalization
| Language | Support |
|----------|---------|
| English | Full support |
| Thai | Full support |
| Vietnamese | Full support |

### 6.3 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

---

## 7. Reporting Requirements

### 7.1 Financial Reports
| Report | Description |
|--------|-------------|
| Balance Sheet | Assets, liabilities, equity as of date |
| Income Statement | Revenue, expenses, net income for period |
| Cash Flow Statement | Operating, investing, financing activities |
| Trial Balance | Account balances with debit/credit columns |
| General Ledger | Transaction detail by account |
| Journal Voucher List | Summary of journal entries |

### 7.2 Operational Reports
| Report | Description |
|--------|-------------|
| AP Aging | Vendor aging by bucket |
| AR Aging | Customer aging by bucket |
| Budget Variance | Budget vs actual comparison |
| Asset Register | List of assets with depreciation |
| Depreciation Schedule | Monthly depreciation detail |

### 7.3 Tax Reports
| Report | Description |
|--------|-------------|
| VAT/GST Report | Tax collected and paid |
| Withholding Tax Report | Tax withheld from payments |
| 1099 Forms | Annual withholding statements |

---

## 8. Non-Functional Requirements

### 8.1 Scalability
- Support 1000+ tenants
- Support 100+ concurrent users per tenant
- Horizontal scaling capability

### 8.2 Maintainability
- Modular architecture
- Well-documented API
- Comprehensive test coverage
- Automated deployment

### 8.3 Compliance
| Standard | Description |
|----------|-------------|
| Accounting Standards | Local GAAP compliance |
| Tax Regulations | Multi-country tax support |
| Data Privacy | GDPR compliant data handling |
| Audit Requirements | Complete audit trail |

---

## 9. Migration Requirements

### 9.1 Data Migration
| Data | Migration Approach |
|------|-------------------|
| Chart of Accounts | Full migration |
| Open Balances | Migrate as opening balances |
| Vendor/Customer Masters | Full migration |
| Open Documents | Migrate as historical records |
| Transaction History | Read-only archive access |

### 9.2 Legacy Integration
- BlueLedger integration maintained
- Desktop app integration maintained
- OCR integration maintained

---

## 10. Future Enhancements (Out of Scope)

- Mobile app for approval workflows
- AI-powered invoice categorization
- Predictive cash flow forecasting
- Advanced analytics dashboard
- Bank reconciliation automation
- Inter-company transactions
- Consolidated financial reporting

---

## 11. Success Criteria

The project will be considered successful when:

1. All core modules (GL, AP, AR, Asset) are fully functional
2. Multi-tenant architecture supports 10+ concurrent tenants
3. Performance benchmarks are met
4. Security audit is passed
5. User acceptance testing is completed with positive feedback
6. Training materials are complete
7. Production deployment is stable for 30 days
