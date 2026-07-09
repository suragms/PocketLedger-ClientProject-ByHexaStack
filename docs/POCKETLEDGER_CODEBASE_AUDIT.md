# PocketLedger Codebase Audit

> Generated: 2026-07-09
> Build Status: ✅ Backend builds, ✅ Frontend builds, ✅ Tests pass (42/42)

---

## 1. Architecture Summary

### Frontend

| Category | Technology | Version |
|---|---|---|
| Framework | React | 19.2.7 |
| Language | TypeScript | ~6.0.2 |
| Build Tool | Vite | 8.1.1 |
| Styling | Tailwind CSS | 4.3.2 |
| Routing | React Router | 7.18.1 |
| State (Server) | @tanstack/react-query | 5.101.2 |
| State (Client) | Redux Toolkit | 2.12.0 |
| Forms | react-hook-form + zod | 7.81.0 / 4.4.3 |
| HTTP Client | Axios | 1.18.1 |
| Charts | Recharts | 3.9.2 |
| Animations | Framer Motion | 12.42.2 |
| Toasts | react-hot-toast | 2.6.0 |
| UI Library | @headlessui/react | 2.2.10 |
| Icons | @heroicons/react | 2.2.0 |
| CSS Utility | clsx + tailwind-merge | 2.1.1 / 3.6.0 |
| Date | date-fns | 4.4.0 |
| Linter | oxlint | 1.71.0 |

### Backend

| Category | Technology | Version |
|---|---|---|
| Runtime | .NET | 10.0 |
| Framework | ASP.NET Core | 10.0 |
| Language | C# | 12 |
| ORM | Entity Framework Core | 10.0 |
| Database (Dev) | SQLite | via EF Core |
| Database (Prod) | SQL Server (scripts in `database/`) | — |
| Auth | ASP.NET Core Identity + JWT Bearer | — |
| CQRS | MediatR | latest |
| Validation | FluentValidation | latest |
| Mapping | AutoMapper | 13.0.1 |
| Background Jobs | Hangfire (InMemory storage) | latest |
| Logging | Serilog | latest |
| PDF Export | QuestPDF | latest |
| CSV Export | CsvHelper | latest |
| Image Processing | SkiaSharp | latest |
| API Docs | Swagger / OpenAPI | latest |

### Architecture Pattern

- **Clean Architecture**: Domain → Application → Infrastructure → API
- **CQRS**: Commands and Queries separated via MediatR pipeline
- **Repository Pattern**: Generic and specialized repositories
- **Unit of Work**: Via ApplicationDbContext
- **Pipeline Behaviors**: Validation → Logging → Performance monitoring

---

## 2. Repository Structure

```
PocketLedger/
├── src/
│   ├── PocketLedger.Domain/
│   │   ├── Common/ (BaseEntity, BaseAuditableEntity, ValueObject, Money)
│   │   ├── DomainEvents/ (TransactionCreated, BudgetExceeded, AccountBalanceChanged)
│   │   ├── Entities/ (User, Role, UserRole, UserPasskey, UserSettings, Account,
│   │   │             Transaction, Category, Budget, Tag, TransactionTag,
│   │   │             RecurringTransaction, Notification, NotificationPreference, AuditLog)
│   │   ├── Enums/ (TransactionType, PaymentMethod, NotificationType, NotificationStatus,
│   │   │          CategoryType, BudgetPeriod, AccountType)
│   │   └── Interfaces/ (IRepository, IUnitOfWork, IUserRepository, IAccountRepository,
│   │                    ITransactionRepository, ICategoryRepository, IBudgetRepository,
│   │                    INotificationRepository, IAuditLogRepository, IUserSettingsRepository,
│   │                    IJwtTokenGenerator, ICurrentUserService, IEmailService,
│   │                    IFileStorageService, INotificationService, IPinService, IWebAuthnService)
│   ├── PocketLedger.Application/
│   │   ├── Common/ (ApiResponse, PaginationRequest, PagedResult, Exceptions,
│   │   │           Mappings, Behaviors, Interfaces/IReportExportService)
│   │   ├── Features/
│   │   │   ├── Auth/ (Register, Login, RefreshToken, ChangePassword, ForgotPassword,
│   │   │   │          ResetPassword, VerifyEmail, UpdateProfile, DeleteAccount,
│   │   │   │          SetPin, VerifyPin, ResendVerification + GetCurrentUser)
│   │   │   ├── Accounts/ (Create, Update, Delete + GetAccounts, GetAccountById,
│   │   │   │              GetWalletStatistics)
│   │   │   ├── Transactions/ (Create, Update, Delete, UndoDelete, UploadReceipt,
│   │   │   │                  RemoveReceipt + GetTransactions, GetTransactionById,
│   │   │   │                  GetDeletedTransactions)
│   │   │   ├── Categories/ (Create, Update, Delete, Archive, Restore, Reorder
│   │   │   │               + GetCategories, GetCategoryById)
│   │   │   ├── Budgets/ (Create, Update, Delete + GetBudgets, GetBudgetById,
│   │   │   │             GetBudgetAnalytics)
│   │   │   ├── Dashboard/ (GetDashboardSummary)
│   │   │   ├── Reports/ (GetReport, GetSpendingByCategory, GetIncomeVsExpense)
│   │   │   ├── Settings/ (UpdateProfile, UploadAvatar, UpdateAppearance, UpdateNotifications,
│   │   │   │              UpdatePrivacy, UpdateSecurity, ChangePassword, Enable2FA,
│   │   │   │              Disable2FA, Verify2FA, DeleteAccount, ExportData, ImportData
│   │   │   │              + GetProfile, GetSettings, Get2FAStatus, GetPasskeys, GetAbout)
│   │   │   └── Admin/ (GetDashboard, GetUsers, GetUserDetail, GetRoles, CreateUser,
│   │   │               UpdateUser, UpdateUserRole, UpdateUserStatus, DeleteUser,
│   │   │               CreateRole, DeleteRole, AssignRole, RemoveRole, ExportData,
│   │   │               GetAllTransactions, GetAllWallets, GetAllCategories, GetAllBudgets,
│   │   │               GetNotifications, GetAnalytics, GetAuditLogs, GetSystemLogs)
│   │   └── DependencyInjection.cs
│   ├── PocketLedger.Infrastructure/
│   │   ├── Persistence/ (ApplicationDbContext, SeedData, Configurations/*)
│   │   ├── Repositories/ (Repository<T>, UserRepository, TransactionRepository,
│   │   │                  AccountRepository, CategoryRepository, BudgetRepository,
│   │   │                  NotificationRepository, AuditLogRepository, UserSettingsRepository)
│   │   ├── Services/ (JwtTokenGenerator, CurrentUserService, PinService, EmailService,
│   │   │              FileStorageService, NotificationService, WebAuthnService,
│   │   │              ReportExportService)
│   │   ├── Jobs/ (NotificationJobs)
│   │   └── DependencyInjection.cs
│   └── PocketLedger.API/
│       ├── Controllers/ (AuthController, AccountsController, TransactionsController,
│       │                 CategoriesController, BudgetsController, DashboardController,
│       │                 ReportsController, SettingsController, NotificationsController,
│       │                 AdminController)
│       ├── Middleware/ (GlobalExceptionHandler)
│       ├── Program.cs
│       ├── appsettings.json
│       └── appsettings.Development.json
├── PocketLedger.Client/
│   ├── src/
│   │   ├── api/ (client.ts, auth.api.ts, accounts.api.ts, transactions.api.ts,
│   │   │         categories.api.ts, budgets.api.ts, dashboard.api.ts, reports.api.ts,
│   │   │         settings.api.ts, notifications.api.ts, admin.api.ts)
│   │   ├── app/ (store.ts, hooks.ts, uiSlice.ts)
│   │   ├── features/auth/ (authSlice.ts)
│   │   ├── components/
│   │   │   ├── ui/ (Button, Input, Select, Card, Badge, Modal, Spinner, Skeleton,
│   │   │   │         Pagination, PageTransition)
│   │   │   ├── layout/ (MainLayout, Header, Sidebar, MobileNav)
│   │   │   ├── shared/ (LoadingOverlay, ErrorBoundary, EmptyState, ConfirmDialog)
│   │   │   ├── admin/ (AdminLayout, SearchBar, FilterBar, Pagination)
│   │   │   ├── auth/ (RoleGuard, PinInput, PasswordStrengthMeter)
│   │   │   ├── transactions/ (TransactionItem, TransactionDayGroup,
│   │   │   │                   TransactionFilterPanel, ReceiptUpload)
│   │   │   └── notifications/ (NotificationBell)
│   │   ├── hooks/ (useDebounce, useInfiniteScroll, useLocalStorage, useMediaQuery)
│   │   ├── lib/ (utils.ts, constants.ts, validators.ts)
│   │   ├── types/index.ts
│   │   ├── pages/
│   │   │   ├── auth/ (Login, Register, ForgotPassword, ResetPassword, VerifyEmail)
│   │   │   ├── dashboard/DashboardPage.tsx
│   │   │   ├── accounts/ (Accounts, AccountDetail, AccountForm, Wallets, WalletDetail)
│   │   │   ├── transactions/ (Transactions, TransactionForm)
│   │   │   ├── categories/CategoriesPage.tsx
│   │   │   ├── budgets/ (Budgets, BudgetForm, BudgetDetail)
│   │   │   ├── reports/ReportsPage.tsx
│   │   │   ├── settings/ (Settings, Privacy, Terms)
│   │   │   ├── notifications/ (Notifications, NotificationPreferences)
│   │   │   └── admin/ (Dashboard, Users, Transactions, Categories, Wallets, Budgets,
│   │   │               Reports, Analytics, Notifications, AuditLogs, SystemLogs, Roles, Settings)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/ (favicon.svg, icons.svg)
│   ├── dist/
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── tests/
│   ├── PocketLedger.API.Tests/ (Controllers/ReportsControllerTests - 3 tests)
│   ├── PocketLedger.Application.Tests/ (Features/Transactions, Budgets, Categories
│   │                                     validators, Behaviors - 32 tests)
│   └── PocketLedger.Infrastructure.Tests/ (Persistence/ApplicationDbContextTests - 7 tests)
├── database/
│   ├── 01_Schema.sql
│   ├── 02_Indexes.sql
│   ├── 03_Views.sql
│   ├── 04_StoredProcedures.sql
│   ├── 05_SeedData.sql
│   └── 06_MigrationScripts.sql
├── docker-compose.yml
├── Dockerfile
├── PocketLedger.slnx
└── README.md
```

---

## 3. Existing Feature Matrix

### ✅ Fully Implemented

| Feature | Backend | Frontend | Notes |
|---|---|---|---|
| Authentication (Login/Register) | ✅ | ✅ | JWT + refresh tokens |
| User Profile | ✅ | ✅ | Name, email, avatar, currency |
| Password Change | ✅ | ✅ | |
| PIN Login | ✅ | ✅ | 4-digit PBKDF2 |
| 2FA | ✅ | ✅ | Setup, verify, codes |
| Passkeys | ✅ (stub) | ✅ (UI) | Backend is stub |
| Account CRUD | ✅ | ✅ | Personal/Savings/Business etc. |
| Transaction CRUD | ✅ | ✅ | With categories, accounts |
| Transaction Receipt Upload | ✅ | ✅ | Image upload + thumbnails |
| Transaction Undo Delete | ✅ | ✅ | Soft delete + restore |
| Categories CRUD | ✅ | ✅ | With archive, restore, reorder |
| Budgets CRUD | ✅ | ✅ | With progress calculation |
| Dashboard Summary | ✅ | ✅ | Totals, recent, categories, budgets |
| Reports Page | ✅ | ✅ | Charts, breakdowns, tables |
| CSV Export (Reports) | ✅ | ✅ | |
| PDF Export (Reports) | ✅ | ✅ | |
| CSV Export (Transactions) | ✅ | ✅ | |
| Notifications | ✅ | ✅ | List, mark read, preferences |
| Admin Panel | ✅ | ✅ | Users, roles, audit logs, analytics |
| Dark/Light/System Theme | ✅ | ✅ | With persistence |
| Language Preferences | ✅ | ✅ | Stored but not localized |
| Currency Preferences | ✅ | ✅ | Applied in formatCurrency |
| Data Export/Import | ✅ | ✅ | JSON backup/restore |
| Account Deletion | ✅ | ✅ | With confirmation |
| Search Transactions | ✅ | ✅ | Debounced |
| Filter Transactions | ✅ | ✅ | Date range, type, account, category |
| Sort Transactions | ✅ | ✅ | Date, amount, payee |
| Pagination | ✅ | ✅ | Server-side |
| Infinite Scroll (History) | ✅ | ✅ | In card view |
| Table View (History) | ✅ | ✅ | Dense data table |
| Card View (History) | ✅ | ✅ | Day-grouped cards |
| Loading Skeletons | ✅ | ✅ | Throughout |
| Empty States | ✅ | ✅ | Dashboard, History, Reports |
| Error Boundaries | — | ✅ | |
| Security Headers | ✅ | — | XSS, HSTS, CORS |
| Health Checks | ✅ | — | `/health` endpoint |
| Serilog Logging | ✅ | — | File + console |
| Hangfire Jobs | ✅ | — | Daily/weekly/monthly summaries, budget alerts, cleanup |
| RecurringTransaction Entity | ✅ | — | No scheduler/processing logic |
| Swagger | ✅ | — | |

### ⚠️ Partially Implemented

| Feature | Status | Issue |
|---|---|---|
| Dashboard Period Selector | ❌ Missing | Dashboard always shows "current month", no period switching UI |
| Dashboard Savings Rate | ❌ Missing | Not shown on Dashboard |
| Dashboard Income vs Expense Trend | ❌ Missing | Not shown on Dashboard (only pie chart + budget progress) |
| Dashboard Previous Period Comparison | ❌ Missing | Not shown |
| Report Comparison Mode | ❌ Missing | No side-by-side period comparison |
| Budget vs Actual in Reports | ✅ Backend | Budget analysis section works but limited |
| Financial Insights | ❌ Missing | No automated insights |
| Category Quick Add | ❌ Missing | No "Add Transaction" shortcut globally |
| Keyboard Shortcut (N) | ❌ Missing | Not implemented |
| Mobile Bottom Navigation Add Button | ❌ Missing | No quick-add FAB on mobile |
| Desktop Sidebar Collapse | ✅ UI | Functional |
| Desktop Sidebar Admin Section | ✅ | Shows based on role |
| Email Delivery | ✅ (stub) | Logger-only, no actual sending |
| WebAuthn | ✅ (stub) | Returns true always |
| Offline Support | ❌ Missing | No PWA/service worker |
| Recurring Transactions Processing | ❌ Not implemented | Entity + UI exist, no Hangfire job |
| Email Verification | ✅ Backend | Frontend has page, backend sends (stub) |
| Forgot/Reset Password | ✅ Backend | Full flow backend, frontend has pages |
| Report Weekly Period | ✅ | Shows correct period selector |
| Budget Alert Thresholds | ✅ Backend | Partially configurable in UI |
| Transaction Detail Page | ❌ Missing | No dedicated detail page/view |
| Bulk Delete Transactions | ❌ Missing | Only single delete |
| Bulk Re-categorize | ❌ Missing | Not implemented |
| Accessibility | ⚠️ Basic | Skip link, focus-visible, aria labels partial |

### ❌ Missing Features

| Feature | Notes |
|---|---|
| Quick Add Transaction (global) | No persistent FAB or global shortcut |
| Visual Category Picker | Plain `<select>` dropdown in TransactionForm |
| Income/Expense Category Filtering | Categories show all types, not filtered by transaction type |
| Dashboard Period Selector | Always "this month" hardcoded |
| Savings Rate on Dashboard | Not displayed |
| Income vs Expense Trend on Dashboard | Missing chart |
| Top 5 Spending Categories on Dashboard | Missing ranked list |
| Report Comparison Mode | No period-over-period comparison |
| Financial Insights | No automated text insights |
| Budget vs Actual Detail in Reports | Basic budget section exists |
| PWA / Offline Support | No service worker |
| Notification Delivery Infrastructure | Email is stub, push not implemented |
| Transaction Detail View | No modal/sheet/page for detail |
| Bulk Operations | No bulk delete/re-categorize |
| Accessibility Audit | Partial implementation |
| E2E Tests | None |
| Frontend Unit Tests | None (no test framework configured) |

---

## 4. Missing Requirements (from the 35-step plan)

From the development prompts:

- **Step 3**: Shared financial data layer with period filtering — ❌ Dashboard lacks period support
- **Step 4**: Category type separation (Income/Expense) — ⚠️ Backend has CategoryType enum, frontend doesn't filter correctly in form
- **Step 5**: Visual Category Picker — ❌ Uses plain `<select>`
- **Step 6**: Quick Add Transaction System — ❌ No global add button/keyboard shortcut
- **Step 7**: Dashboard Total Overview with period — ❌ No period selector, no savings rate, no comparison
- **Step 8**: Dashboard Spending Analysis — ❌ Missing donut chart improvements, top 5 categories, trend chart
- **Step 9**: Responsive Dashboard — ⚠️ Basic responsive exists, needs tuning
- **Step 10**: History Data Architecture — ⚠️ Server-side works, needs index review
- **Step 11**: Mobile History — ⚠️ Card view exists, needs sticky headers, swipe actions
- **Step 12**: Desktop History — ⚠️ Table view exists, needs row selection, bulk actions
- **Step 13**: Transaction Detail/Edit/Delete — ❌ No dedicated detail view
- **Step 14**: Reporting Data Foundation — ✅ Backend aggregation exists
- **Step 15**: Reports UI — ⚠️ Basic exists, needs improvements
- **Step 16**: Custom Range Comparison — ❌ Not implemented
- **Step 17**: Budget System — ✅ CRUD exists
- **Step 18**: Budget vs Actual Reporting — ⚠️ Basic version exists
- **Step 19**: Financial Insights — ❌ Not implemented
- **Step 20**: CSV/PDF Export — ✅ Both exist
- **Step 21**: Settings IA — ⚠️ Tabs exist, could be better organized
- **Step 22**: Profile/Preferences/Appearance — ✅ All exist
- **Step 23**: Accounts/Wallets — ✅ CRUD exists
- **Step 24**: Notification Preferences — ⚠️ UI exists, backend is stub
- **Step 25**: Data Export/Backup/Restore — ✅ All exist
- **Step 26**: Security — ✅ Most features exist
- **Step 27**: Mobile Navigation — ⚠️ MobileNav exists, needs Add button
- **Step 28**: Desktop Navigation — ✅ Sidebar exists
- **Step 29**: Responsive Design Audit — ❌ Not done
- **Step 30**: Loading/Empty/Error States — ⚠️ Partial
- **Step 31**: Offline Transaction Queue — ❌ Not implemented
- **Step 32**: Performance Optimization — ❌ Not done
- **Step 33**: Accessibility Audit — ❌ Not done
- **Step 34**: Automated Tests — ⚠️ Backend only (42 tests), no frontend tests
- **Step 35**: Production Audit — ❌ Not done

---

## 5. Broken Functionality

### Build-Time Issues

| Issue | Severity | Description |
|---|---|---|
| CS0114 warning in User.cs | Low | `TwoFactorEnabled` hides inherited member, needs `override` |
| NU1903 vulnerabilities (AutoMapper, SQLitePCLRaw) | Medium | Known high-severity CVEs |

### Runtime Issues (Identified by Code Analysis)

| Issue | Location | Severity | Description |
|---|---|---|---|
| Dashboard doesn't invalidate on transaction mutation | `TransactionsPage.tsx:83` | High | `queryClient.invalidateQueries({ queryKey: ['transactions'] })` — does NOT invalidate `['dashboard']` |
| Dashboard doesn't invalidate on transaction form | `TransactionFormPage.tsx:56` | High | Same issue — only invalidates `['transactions']` |
| Budget changes don't invalidate dashboard | `BudgetFormPage.tsx` (likely) | High | Dashboard budget progress stale |
| Category changes don't invalidate transaction forms | `CategoriesPage.tsx` | Medium | Dropdown stale |
| Report doesn't invalidate when transactions change | `ReportsPage.tsx` | Medium | Only refreshes on mount/period change |
| History totals calculated client-side only | `TransactionsPage.tsx:152-153` | Medium | Income/expense totals calculated from visible page only, not server |
| `useMemo` depends on local variable that changes every render | Multiple files | Low | React hooks lint warnings (7 total) |
| `catch (e)` unused in LoginPage | `LoginPage.tsx:37` | Low | No error handling |
| Ref access in effect cleanup | `ReceiptUpload.tsx:24` | Low | Should copy ref to variable |

### Potential API/Backend Issues

| Issue | Location | Severity | Description |
|---|---|---|---|
| Refresh token rotation not enforced | AuthController | Medium | Old refresh tokens remain valid |
| No rate limiting on auth endpoints | Program.cs | Medium | No rate limiting configured |
| Hangfire InMemory in production | Program.cs | Medium | Jobs lost on restart |
| Email service is stub | EmailService.cs | Low | No actual email delivery |
| WebAuthn is stub | WebAuthnService.cs | Low | Always returns true |
| JWT secret in appsettings.Development.json | Low | Should use user secrets or env vars |

---

## 6. Performance Problems

| Problem | Location | Severity | Impact |
|---|---|---|---|
| Dashboard loads all accounts/transactions/budgets in one query | Backend | Medium | Could be slow for large datasets |
| No pagination on category/account dropdown fetches | TransactionFormPage.tsx | Low | Uses pageSize: 100 |
| All recharts bundles loaded eagerly | ReportsPage.tsx | Low | Large bundle (275KB CategoricalChart) |
| History totals from visible page | TransactionsPage.tsx:152-153 | Medium | Misleading for paginated views |
| No React.memo on list items | TransactionItem.tsx | Low | Unnecessary re-renders |
| 7 useMemo lint warnings | Multiple files | Low | Ineffective memoization |

---

## 7. Security Concerns

| Issue | Severity | Description |
|---|---|---|
| JWT secret in appsettings.Development.json | High | Should use dotnet user-secrets or env vars |
| No rate limiting on auth endpoints | Medium | Brute force possible |
| Admin route is hidden via obscure path `/urlAdmin26` | Low | Security by obscurity, not real protection |
| Refresh token rotation not enforced | Medium | Replay risk |
| AutoMapper high-severity CVE (NU1903) | High | Package vulnerability |
| SQLitePCLRaw high-severity CVE (NU1903) | High | Package vulnerability |
| File upload size limit is 10MB | Medium | Large uploads could exhaust storage |
| Allowed image extensions limited (jpg/jpeg/png/webp/heic) | Low | Reasonable restriction |
| Security headers set in middleware | Low | Good practice already in place |
| HSTS only in non-Development | Low | Acceptable for dev |

---

## 8. Accessibility Problems

| Issue | Location | Severity |
|---|---|---|
| Charts use only color to convey data | ReportsPage, DashboardPage | High |
| Category selector is plain `<select>` with no visual preview | TransactionFormPage | Medium |
| No aria-live regions for dynamic updates | All pages | Medium |
| Color contrast not verified for dark mode | All pages | Medium |
| No screen-reader announcements for toast messages | App | Medium |
| Keyboard navigation gaps in modals | Modal.tsx | Medium |
| Focus trap missing in some modals | Various | Medium |
| Touch targets may be < 44px on mobile | Various | Low |

---

## 9. Mobile UX Problems

| Issue | Location | Severity |
|---|---|---|
| Sidebar is full-width overlay on mobile | Sidebar.tsx | Low — acceptable |
| No quick-add FAB | All pages | Medium |
| No swipe actions on transaction list | TransactionsPage | Medium |
| Transaction form not optimized for mobile | TransactionFormPage | Low |
| Bottom tab bar lacks Add button | MobileNav.tsx | Medium |
| Dashboard cards stacked on mobile | DashboardPage | Low — acceptable |
| No pull-to-refresh | All pages | Low |

---

## 10. Desktop UX Problems

| Issue | Location | Severity |
|---|---|---|
| No bulk transaction selection/deletion | TransactionsPage | Medium |
| No inline edit | TransactionsPage | Medium |
| No keyboard shortcut (N) for new transaction | All pages | Low |
| Collapsed sidebar shows no labels | Sidebar.tsx | Low |
| Settings page could use sidebar/tabs layout | SettingsPage | Low — current tab bar works |

---

## 11. Database Changes Required

| Change | Priority | Reason |
|---|---|---|
| No migrations needed for existing schema | — | Schema is final |
| Add index on Transaction.Date for period queries | Medium | Performance for reports |
| Add composite index on Transaction (UserId, Date, Type) | Medium | Dashboard/reports queries |
| Add index on Budget (UserId, CategoryId, Period) | Low | Budget queries |
| Review Notification cleanup indexes | Low | Cleanup job performance |

---

## 12. API Changes Required

| Change | Priority | Reason |
|---|---|---|
| Dashboard endpoint should accept period/date range | High | Step 7 requirement |
| Dashboard endpoint should return savings rate | High | Step 7 requirement |
| Dashboard endpoint should return previous-period comparison | Medium | Step 7 requirement |
| Categories endpoint should filter by type for forms | Medium | Step 4 requirement |
| Reports should support comparison mode | Medium | Step 16 requirement |
| Financial insights endpoint | Medium | Step 19 requirement |
| Bulk transaction operation endpoints | Low | Step 12 requirement |

---

## 13. Recommended Implementation Order

Based on the 35-step development prompts and current codebase state:

| Phase | Steps | Effort | Dependency |
|---|---|---|---|
| **1. Stabilize** (Step 2) | Fix cache invalidation, dashboard stale data, client-side total bug | 1 day | None |
| **2. Foundation** (Steps 3-5) | Financial data layer, category separation, visual picker | 2 days | Phase 1 |
| **3. Quick Add** (Step 6) | Global add button + form + keyboard shortcut | 1 day | Phase 2 |
| **4. Dashboard** (Steps 7-9) | Period selector, savings rate, charts, trend, responsive | 2 days | Phase 3 |
| **5. History** (Steps 10-13) | Server-side improvements, mobile/desktop UX, detail view | 2 days | Phase 1 |
| **6. Reports & Budgets** (Steps 14-20) | Comparison, budget vs actual, insights, export | 2 days | Phase 4 |
| **7. Settings & Accounts** (Steps 21-25) | IA, accounts, notifications, data ops | 1 day | Phase 1 |
| **8. Security** (Step 26) | Audit and improve auth/authorization | 1 day | Phase 1 |
| **9. Navigation** (Steps 27-28) | Mobile nav with Add, desktop polish | 1 day | Phase 3 |
| **10. Polish** (Steps 29-33) | Responsive, states, offline, performance, a11y | 3 days | All above |
| **11. Testing** (Step 34) | Frontend tests, E2E tests | 2 days | All above |
| **12. Final Audit** (Step 35) | Production readiness check | 1 day | All above |

**Total estimated effort**: ~19 days

---

## Audit Summary

| Metric | Value |
|---|---|
| Backend C# files | ~80+ |
| Frontend TypeScript/TSX files | ~85+ |
| Total API endpoints | ~60+ |
| Backend tests | 42 (all pass) |
| Frontend tests | 0 |
| Frontend lint warnings | 7 (all react-hooks/exhaustive-deps) |
| Backend build warnings | 11 (1 CS0114, 10 NU1903) |
| Frontend build errors | 0 |
| Backend build errors | 0 |
| Security vulnerabilities (NuGet) | 2 high-severity (AutoMapper, SQLitePCLRaw) |
| npm vulnerabilities | 0 |
