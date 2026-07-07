# PocketLedger - Personal Finance Management Platform
## Implementation Plan

---

## Project Overview

**PocketLedger** is a production-ready Personal Finance Management Platform built with:
- **Frontend**: React 18, TypeScript, Vite, Redux Toolkit, TanStack Query, TailwindCSS
- **Backend**: ASP.NET Core 8, Entity Framework Core, SQL Server, Clean Architecture
- **Features**: JWT Authentication, CQRS Pattern, Dark Mode, Responsive Design

---

## Solution Structure

```
PocketLedger/
├── src/
│   ├── PocketLedger.Domain/           # Enterprise Business Rules
│   ├── PocketLedger.Application/      # Business Logic (CQRS, Validators)
│   ├── PocketLedger.Infrastructure/   # Frameworks & External Services
│   ├── PocketLedger.API/             # Entry Point & UI (ASP.NET Core 8)
│   └── PocketLedger.Client/          # React Frontend (Vite + TypeScript)
├── tests/
│   ├── PocketLedger.Domain.Tests/
│   ├── PocketLedger.Application.Tests/
│   └── PocketLedger.API.Tests/
└── PocketLedger.sln
```

---

## Phase 1: Backend Foundation (Days 1-3)

### 1.1 Domain Layer (`PocketLedger.Domain`)

**Entities:**
- `User` - Application user with identity
- `Account` - Financial accounts (checking, savings, credit card, cash, investment)
- `Transaction` - Income/Expense/Transfer records
- `Category` - Transaction categories with icons and colors
- `Budget` - Monthly/Yearly budget limits per category
- `Tag` - Optional transaction tags
- `RecurringTransaction` - Scheduled recurring transactions
- `Currency` - Multi-currency support

**Value Objects:**
- `Money` - Amount + Currency
- `DateRange` - Start + End date
- `AuditInfo` - CreatedAt, UpdatedAt, CreatedBy

**Domain Events:**
- `TransactionCreatedEvent`
- `BudgetExceededEvent`
- `AccountBalanceChangedEvent`

**Interfaces (Ports):**
- `ITransactionRepository`
- `IAccountRepository`
- `ICategoryRepository`
- `IBudgetRepository`
- `IUnitOfWork`
- `ICurrentUserService`
- `IFileStorageService`

### 1.2 Application Layer (`PocketLedger.Application`)

**CQRS Commands:**
```
Authentication:
- RegisterUserCommand
- LoginUserCommand
- RefreshTokenCommand

Accounts:
- CreateAccountCommand
- UpdateAccountCommand
- DeleteAccountCommand

Transactions:
- CreateTransactionCommand
- UpdateTransactionCommand
- DeleteTransactionCommand
- BulkImportTransactionsCommand

Budgets:
- CreateBudgetCommand
- UpdateBudgetCommand
- DeleteBudgetCommand

Categories:
- CreateCategoryCommand
- UpdateCategoryCommand
- DeleteCategoryCommand
```

**CQRS Queries:**
```
Authentication:
- GetCurrentUserQuery

Accounts:
- GetAllAccountsQuery
- GetAccountByIdQuery
- GetAccountSummaryQuery

Transactions:
- GetTransactionsQuery (with pagination, sorting, filtering)
- GetTransactionByIdQuery
- GetTransactionsByDateRangeQuery
- GetTransactionSummaryQuery

Budgets:
- GetAllBudgetsQuery
- GetBudgetByIdQuery
- GetBudgetProgressQuery

Reports:
- GetIncomeVsExpenseQuery
- GetSpendingByCategoryQuery
- GetMonthlyTrendQuery
- GetNetWorthQuery
- GetCashFlowQuery
```

**DTOs:**
- Request DTOs for all commands
- Response DTOs for all queries
- Pagination DTOs (`PagedResult<T>`)

**Validators (FluentValidation):**
- All command validators
- All query validators

**Mappings (AutoMapper):**
- Entity → DTO profiles
- DTO → Entity profiles

**Behaviors:**
- `ValidationBehavior` - Pipeline behavior for validation
- `LoggingBehavior` - Pipeline behavior for logging
- `PerformanceBehavior` - Pipeline behavior for performance monitoring

### 1.3 Infrastructure Layer (`PocketLedger.Infrastructure`)

**Persistence:**
- `ApplicationDbContext` - EF Core DbContext
- Entity configurations ( Fluent API )
- Migrations

**Repositories:**
- `TransactionRepository`
- `AccountRepository`
- `CategoryRepository`
- `BudgetRepository`
- Generic `Repository<T>`

**Services:**
- `JwtTokenGenerator` - JWT token generation
- `CurrentUserService` - Current user from JWT
- `FileStorageService` - Cloudinary/Azure Blob integration
- `EmailService` - Email notifications

**Identity:**
- `ApplicationUser` - Extends IdentityUser
- Role configuration
- Seed data

### 1.4 API Layer (`PocketLedger.API`)

**Controllers:**
- `AuthController` - Registration, Login, Refresh
- `AccountsController` - CRUD operations
- `TransactionsController` - CRUD + Search + Import
- `BudgetsController` - CRUD + Progress
- `CategoriesController` - CRUD
- `ReportsController` - Analytics endpoints
- `DashboardController` - Dashboard summary

**Middleware:**
- Global Exception Handler
- Request Logging
- Correlation ID

**Configuration:**
- `appsettings.json` - Configuration
- `Program.cs` - Service registration
- Swagger setup
- CORS configuration
- Serilog configuration

---

## Phase 2: Frontend Foundation (Days 4-6)

### 2.1 Project Setup

```bash
# Create Vite React TypeScript project
npm create vite@latest pocketledger-client -- --template react-ts

# Install dependencies
npm install @reduxjs/toolkit react-redux
npm install @tanstack/react-query
npm install react-router-dom
npm install react-hook-form @hookform/resolvers zod
npm install tailwindcss postcss autoprefixer
npm install recharts framer-motion
npm install axios
npm install @headlessui/react @heroicons/react
npm install react-hot-toast
npm install date-fns
```

### 2.2 Project Structure

```
src/
├── api/                    # API client & endpoints
│   ├── client.ts          # Axios instance
│   ├── auth.api.ts
│   ├── accounts.api.ts
│   ├── transactions.api.ts
│   ├── budgets.api.ts
│   ├── categories.api.ts
│   └── reports.api.ts
├── app/                   # Redux store configuration
│   ├── store.ts
│   └── hooks.ts
├── features/              # Feature modules
│   ├── auth/
│   │   ├── authSlice.ts
│   │   ├── authApi.ts
│   │   ├── authTypes.ts
│   │   └── components/
│   ├── accounts/
│   │   ├── accountsSlice.ts
│   │   ├── accountsApi.ts
│   │   ├── accountsTypes.ts
│   │   └── components/
│   ├── transactions/
│   │   ├── transactionsSlice.ts
│   │   ├── transactionsApi.ts
│   │   ├── transactionsTypes.ts
│   │   └── components/
│   ├── budgets/
│   │   ├── budgetsSlice.ts
│   │   ├── budgetsApi.ts
│   │   ├── budgetsTypes.ts
│   │   └── components/
│   ├── reports/
│   │   ├── reportsApi.ts
│   │   ├── reportsTypes.ts
│   │   └── components/
│   └── dashboard/
│       ├── dashboardApi.ts
│       └── components/
├── components/            # Shared components
│   ├── ui/               # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── Pagination.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Spinner.tsx
│   │   └── Badge.tsx
│   ├── layout/           # Layout components
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   └── shared/           # Shared feature components
│       ├── ErrorBoundary.tsx
│       ├── LoadingOverlay.tsx
│       ├── EmptyState.tsx
│       └── ConfirmDialog.tsx
├── hooks/                 # Custom hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   └── usePagination.ts
├── lib/                   # Utilities
│   ├── constants.ts
│   ├── utils.ts
│   ├── validators.ts
│   └── formatters.ts
├── pages/                 # Page components
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── accounts/
│   │   ├── AccountsPage.tsx
│   │   ├── AccountDetailPage.tsx
│   │   └── AccountFormPage.tsx
│   ├── transactions/
│   │   ├── TransactionsPage.tsx
│   │   ├── TransactionDetailPage.tsx
│   │   └── TransactionFormPage.tsx
│   ├── budgets/
│   │   ├── BudgetsPage.tsx
│   │   ├── BudgetDetailPage.tsx
│   │   └── BudgetFormPage.tsx
│   ├── reports/
│   │   └── ReportsPage.tsx
│   └── settings/
│       └── SettingsPage.tsx
├── styles/
│   └── globals.css
├── types/                 # Global TypeScript types
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## Phase 3: Feature Implementation (Days 7-21)

### Sprint 1: Authentication (Days 7-9)

**Backend:**
- [ ] User entity & identity setup
- [ ] JWT token generation
- [ ] Register endpoint
- [ ] Login endpoint
- [ ] Refresh token endpoint
- [ ] Password hashing

**Frontend:**
- [ ] Auth API client
- [ ] Auth Redux slice
- [ ] Login page with form validation
- [ ] Register page with form validation
- [ ] Protected route component
- [ ] Auth middleware (token refresh)
- [ ] Logout functionality

### Sprint 2: Dashboard (Days 10-12)

**Backend:**
- [ ] Dashboard summary endpoint
- [ ] Account balances aggregation
- [ ] Recent transactions
- [ ] Monthly spending overview

**Frontend:**
- [ ] Dashboard API client
- [ ] Dashboard page layout
- [ ] Account summary cards
- [ ] Recent transactions list
- [ ] Spending chart (Recharts)
- [ ] Income vs Expense chart
- [ ] Loading skeletons
- [ ] Responsive design

### Sprint 3: Account Management (Days 13-15)

**Backend:**
- [ ] Account CRUD endpoints
- [ ] Account validation
- [ ] Account balance calculation
- [ ] Account summary endpoint

**Frontend:**
- [ ] Accounts API client
- [ ] Accounts list page with table
- [ ] Account form (create/edit)
- [ ] Account detail page
- [ ] Account type icons
- [ ] Balance display
- [ ] Search & filter
- [ ] Pagination

### Sprint 4: Transaction Management (Days 16-18)

**Backend:**
- [ ] Transaction CRUD endpoints
- [ ] Transaction with category & account
- [ ] Transaction search & filtering
- [ ] Date range filtering
- [ ] Pagination & sorting

**Frontend:**
- [ ] Transactions API client
- [ ] Transactions list page
- [ ] Transaction form (create/edit)
- [ ] Transaction detail page
- [ ] Date picker component
- [ ] Category selector
- [ ] Account selector
- [ ] Amount input with currency
- [ ] Search bar
- [ ] Filter panel
- [ ] Sort options
- [ ] Pagination

### Sprint 5: Categories & Budgets (Days 19-21)

**Backend:**
- [ ] Category CRUD endpoints
- [ ] Budget CRUD endpoints
- [ ] Budget progress calculation
- [ ] Budget alerts

**Frontend:**
- [ ] Categories management
- [ ] Category icons & colors
- [ ] Budgets list page
- [ ] Budget form (create/edit)
- [ ] Budget detail page
- [ ] Progress bars
- [ ] Budget alerts

---

## Phase 4: Advanced Features (Days 22-28)

### Sprint 6: Reports & Analytics (Days 22-24)

**Backend:**
- [ ] Income vs Expense endpoint
- [ ] Spending by category endpoint
- [ ] Monthly trend endpoint
- [ ] Net worth endpoint
- [ ] Cash flow endpoint

**Frontend:**
- [ ] Reports page layout
- [ ] Income vs Expense chart
- [ ] Spending by category (pie chart)
- [ ] Monthly trend (line chart)
- [ ] Net worth tracker
- [ ] Date range selector
- [ ] Export functionality

### Sprint 7: Settings & Profile (Days 25-26)

**Backend:**
- [ ] User profile endpoint
- [ ] Update profile endpoint
- [ ] Change password endpoint
- [ ] Currency settings

**Frontend:**
- [ ] Settings page
- [ ] Profile form
- [ ] Change password form
- [ ] Currency preferences
- [ ] Theme toggle (dark mode)

### Sprint 8: UI Polish & Animations (Days 27-28)

**Frontend:**
- [ ] Dark mode implementation
- [ ] Framer Motion animations
- [ ] Page transitions
- [ ] Micro-interactions
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Toast notifications

---

## Phase 5: Testing & Deployment (Days 29-35)

### Sprint 9: Testing (Days 29-31)

**Backend:**
- [ ] Unit tests for domain logic
- [ ] Unit tests for application logic
- [ ] Integration tests for API
- [ ] Repository tests

**Frontend:**
- [ ] Component tests
- [ ] Redux tests
- [ ] API client tests
- [ ] E2E tests (Cypress/Playwright)

### Sprint 10: Deployment (Days 32-35)

**Frontend (Vercel/Netlify):**
- [ ] Build configuration
- [ ] Environment variables
- [ ] Domain setup
- [ ] CI/CD pipeline

**Backend (Render/Azure):**
- [ ] Docker configuration
- [ ] Environment variables
- [ ] Database migration
- [ ] SSL certificate
- [ ] CORS configuration

**Database:**
- [ ] SQL Server setup
- [ ] Connection string management
- [ ] Backup strategy

---

## API Endpoints Reference

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

### Accounts
```
GET    /api/accounts
GET    /api/accounts/{id}
POST   /api/accounts
PUT    /api/accounts/{id}
DELETE /api/accounts/{id}
GET    /api/accounts/{id}/transactions
GET    /api/accounts/summary
```

### Transactions
```
GET    /api/transactions
GET    /api/transactions/{id}
POST   /api/transactions
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}
POST   /api/transactions/bulk-import
GET    /api/transactions/summary
```

### Categories
```
GET    /api/categories
GET    /api/categories/{id}
POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}
```

### Budgets
```
GET    /api/budgets
GET    /api/budgets/{id}
POST   /api/budgets
PUT    /api/budgets/{id}
DELETE /api/budgets/{id}
GET    /api/budgets/{id}/progress
```

### Reports
```
GET    /api/reports/income-vs-expense
GET    /api/reports/spending-by-category
GET    /api/reports/monthly-trend
GET    /api/reports/net-worth
GET    /api/reports/cash-flow
```

### Dashboard
```
GET    /api/dashboard/summary
GET    /api/dashboard/recent-transactions
GET    /api/dashboard/account-balances
```

---

## Query Parameters (Standard)

All list endpoints support:
```
?page=1
&pageSize=20
&sort_by=created_at
&sort_order=desc
&search=keyword
&category_id=1
&account_id=1
&start_date=2024-01-01
&end_date=2024-12-31
&type=expense
```

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
      "name": ["Name is required"],
      "amount": ["Amount must be greater than 0"]
    }
  },
  "traceId": "abc-123-def"
}
```

---

## Success Response Format

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Checking",
    "balance": 5000.00
  },
  "message": "Account created successfully"
}
```

---

## Paged Response Format

```json
{
  "success": true,
  "data": {
    "items": [...],
    "totalCount": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "hasPrevious": false,
    "hasNext": true
  }
}
```

---

## Environment Variables

### Backend
```
ConnectionStrings__DefaultConnection
Jwt__Secret
Jwt__Issuer
Jwt__Audience
Jwt__ExpirationInMinutes
Cloudinary__CloudName
Cloudinary__ApiKey
Cloudinary__ApiSecret
```

### Frontend
```
VITE_API_URL
VITE_APP_NAME
```

---

## Success Criteria

- [ ] All features implemented without placeholders
- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] Dark mode fully functional
- [ ] All API endpoints secured with JWT
- [ ] All forms validated
- [ ] Loading states on all async operations
- [ ] Error handling on all API calls
- [ ] Pagination on all list views
- [ ] Search and filter functionality
- [ ] Smooth animations with Framer Motion
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Cross-browser compatibility
- [ ] Performance optimized
- [ ] Production deployment ready

---

## Estimated Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Backend Foundation | 3 days | Complete backend architecture |
| Phase 2: Frontend Foundation | 3 days | Complete frontend architecture |
| Phase 3: Core Features | 15 days | Auth, Dashboard, Accounts, Transactions, Budgets |
| Phase 4: Advanced Features | 7 days | Reports, Settings, UI Polish |
| Phase 5: Testing & Deployment | 7 days | Tests, CI/CD, Production deployment |
| **Total** | **35 days** | **Production-ready application** |
