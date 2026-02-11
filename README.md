# Carmen SAAS Financial Accounting System

**Modern cloud-based financial accounting ERP system specifically designed for hotels.**

[![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/download/dotnet/8.0)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [Support](#support)

---

## Overview

Carmen is a comprehensive financial management system designed specifically for the hospitality industry. It provides General Ledger, Accounts Payable, Accounts Receivable, and Asset Management capabilities with a modern multi-tenant SAAS architecture.

### Key Benefits

- **Multi-Tenant Architecture** - Support multiple hotel properties with data isolation
- **Modern UI** - Built with React and shadcn/ui for an intuitive user experience
- **Robust Backend** - .NET 8 Web API with Entity Framework Core for reliable data management
- **Flexible Integration** - RESTful API with BlueLedger PMS integration
- **Multi-Language** - English, Thai, and Vietnamese support
- **Cloud-Native** - Docker-ready with Kubernetes support

---

## Features

### General Ledger (GL)
- Journal Voucher management with double-entry bookkeeping
- Template and Recurring Vouchers for automated entries
- Amortization and Allocation Vouchers
- Hierarchical Chart of Accounts with segment-based coding
- Real-time Account Summary and Financial Reports
- Budget Management with variance analysis
- Period Closing controls

### Accounts Payable (AP)
- Vendor Profile management with credit tracking
- Invoice Processing with approval workflows
- Three-tier tax structure (Tax1, Tax2, Withholding Tax)
- Multi-currency support with automatic exchange rate calculation
- Payment Processing with FIFO allocation
- Vendor Aging Analysis
- OCR Integration for invoice data extraction

### Accounts Receivable (AR)
- Customer Profile management with credit limits
- Invoice Generation with project/owner tracking
- Receipt Processing and allocation
- Exchange Gain/Loss calculation
- Statement Generation
- Folio Management for hotel room charges
- Customer Aging Analysis

### Asset Management
- Fixed Asset Register with depreciation tracking
- Pre-Asset approval workflow
- Multiple depreciation methods (Straight-line, Declining Balance, Units of Production)
- Asset Disposal with gain/loss calculation
- Asset Transfer between departments
- Barcode Tracking support

### Supporting Features
- Multi-currency with exchange rate management
- Configurable approval workflows
- Role-based permissions and audit trail
- Dashboard with customizable widgets
- Financial and operational reports
- BlueLedger PMS integration

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI Framework |
| TypeScript | 5+ | Type Safety |
| Vite | 5+ | Build Tool |
| shadcn/ui | Latest | UI Components |
| TanStack Query | Latest | Server State |
| Zustand | Latest | Client State |
| React Router | v7 | Routing |
| React Hook Form | Latest | Forms |
| Tailwind CSS | Latest | Styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 8.0 | Web Framework |
| C# | 12 | Language |
| EF Core | 9+ | ORM |
| MySQL | 8.0+ | Database |
| Redis | 7+ | Caching |
| Hangfire | Latest | Background Jobs |
| Serilog | Latest | Logging |
| JWT | - | Authentication |

---

## Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| .NET SDK | 8.0+ | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| MySQL | 8.0+ | [dev.mysql.com](https://dev.mysql.com/downloads/) |
| Redis | 7+ | [redis.io](https://redis.io/download) |
| Docker | 20+ (optional) | [docker.com](https://www.docker.com/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Development Tools (Recommended)

- **VS Code** with extensions: ESLint, Prettier, TypeScript
- **Visual Studio 2022** or **JetBrains Rider** for .NET development
- **Postman** or **Insomnia** for API testing
- **MySQL Workbench** for database management

---

## Quick Start (Docker)

The fastest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/your-org/carmen.git
cd carmen

# Start all services
docker-compose up -d

# Wait for services to be ready (check health status)
docker-compose ps

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5238
# Swagger UI: http://localhost:5238/swagger
```

**Default Credentials:**
- Username: `admin@carmen.com`
- Password: `Admin@123`

---

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/carmen.git
cd carmen
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Restore NuGet packages
dotnet restore

# Update connection string in appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Carmen_Dev;Uid=carmen_user;Pwd=your_password;SslMode=Required;"
  },
  "Redis": {
    "ConnectionString": "localhost:6379"
  }
}

# Apply database migrations
dotnet ef database update --project src/Carmen.Database

# Run the backend
dotnet run --project src/Carmen.WebApi
```

The backend will be available at `http://localhost:5238`

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update VITE_API_BASE_URL if needed
# VITE_API_BASE_URL=http://localhost:5238

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Project Structure

```
carmen-new/
├── frontend/                    # React + Vite frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── app/               # App initialization & routes
│   │   ├── components/        # Shared components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── features/          # Feature modules
│   │   │   ├── general-ledger/
│   │   │   ├── accounts-payable/
│   │   │   ├── accounts-receivable/
│   │   │   └── asset-management/
│   │   ├── lib/               # Utilities
│   │   ├── stores/            # Zustand stores
│   │   ├── i18n/              # Translations
│   │   └── types/             # Global types
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                     # .NET 8 Web API
│   └── src/
│       ├── Carmen.Domain/      # Core entities
│       ├── Carmen.Application/ # Business logic & DTOs
│       ├── Carmen.Infrastructure/ # EF Core & external services
│       ├── Carmen.WebApi/      # Controllers & middleware
│       └── Carmen.Database/    # DbContext & migrations
│
├── docker-compose.yml          # Development Docker setup
├── CLAUDE.md                   # Claude Code instructions
├── GDD.md                      # Global Design Document
├── PRD.md                      # Product Requirements
├── TASKS.md                    # Implementation tasks
├── AGENT.md                    # AI agent instructions
└── README.md                   # This file
```

---

## Configuration

### Environment Variables

**Frontend (.env):**
```bash
VITE_API_BASE_URL=http://localhost:5238
VITE_APP_NAME=Carmen
VITE_APP_VERSION=1.0.0
```

**Backend (appsettings.json):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Carmen;Uid=carmen_user;Pwd=password;SslMode=Required;"
  },
  "Redis": {
    "ConnectionString": "localhost:6379"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-at-least-32-chars",
    "ExpiryMinutes": 480,
    "Issuer": "Carmen",
    "Audience": "CarmenUsers"
  },
  "BlueLedger": {
    "BaseUrl": "https://blueledger.example.com/api",
    "ApiKey": "your-api-key"
  },
  "Ocr": {
    "BaseUrl": "https://ocr.example.com/api",
    "ApiKey": "your-ocr-api-key"
  }
}
```

### MySQL Setup

```bash
# Create database and user
mysql -u root -p

CREATE DATABASE Carmen_Dev;
CREATE USER 'carmen_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON Carmen_Dev.* TO 'carmen_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Running Tests

### Frontend Tests

```bash
cd frontend

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Backend Tests

```bash
cd backend

# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific project
dotnet test --project src/Carmen.Domain.Tests

# Run unit tests only
dotnet test --filter "FullyQualifiedName~Unit"
```

---

## Docker Deployment

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

---

## Production Deployment

### Database Migrations

```bash
# Generate migration
dotnet ef migrations add AddNewTable --project src/Carmen.Database

# Generate SQL script
dotnet ef script --project src/Carmen.Database --output migration.sql

# Apply migration
dotnet ef database update --project src/Carmen.Database
```

### Health Checks

The application exposes health check endpoints:

- `/health` - Basic health check
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe

---

## Performance Optimization

The system includes several performance optimizations:

- **Redis Caching** - Distributed caching for frequently accessed data
- **Database Indexing** - Optimized indexes for common queries
- **Query Optimization** - Split queries for complex object graphs
- **API Response Caching** - Cached GET requests with TTL
- **Background Jobs** - Heavy operations run asynchronously via Hangfire

For detailed performance considerations, see [GDD.md - Performance Section](./GDD.md#9-performance-considerations).

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes following the code style guidelines
3. Add tests for new functionality
4. Ensure all tests pass: `npm run test` and `dotnet test`
5. Submit a pull request with description

### Code Style

- **Frontend:** ESLint + Prettier configuration provided
- **Backend:** StyleCop analyzers configured

---

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Claude Code development instructions |
| [GDD.md](./GDD.md) | Global Design Document - Architecture |
| [PRD.md](./PRD.md) | Product Requirements Document |
| [TASKS.md](./TASKS.md) | Implementation task breakdown |
| [AGENT.md](./AGENT.md) | AI agent development guidelines |

### API Documentation

When running locally, access Swagger/OpenAPI documentation:
- **Swagger UI:** http://localhost:5238/swagger
- **OpenAPI JSON:** http://localhost:5238/swagger/v1/swagger.json

---

## Support

For questions, issues, or contributions:

- **Issues:** [GitHub Issues](https://github.com/your-org/carmen/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/carmen/discussions)
- **Email:** support@carmen.com

---

## License

This project is proprietary software. All rights reserved.

---

**Built with** [React](https://reactjs.org/), [.NET](https://dotnet.microsoft.com/), and [MySQL](https://www.mysql.com/)

---

_Last updated: January 2026_
