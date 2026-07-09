# PocketLedger — Implementation Plan

## Step 1: Codebase Audit ✓ (Complete)
Deliverable: `docs/POCKETLEDGER_CODEBASE_AUDIT.md`

## Step 2: Application Stability ✓ (Complete)
- Cache invalidation fixes
- Build warning fixes  
- Lint warning fixes (7→0)
- CS0114 warning fix

## Step 3: Financial Domain and Category Foundation
### Part A — Shared Financial Calculations
- DateRange value object ✓ (created)
- Dashboard period filtering + savings rate + period-over-period ✓ (created)
- Reusable financial calculation service (pending — align reports with DateRange)
- Single canonical period system across Dashboard + Reports (pending)

### Part B — Category Domain
- Starter category seeding
- Category CRUD with archive/restore
- Subcategories
- Category hierarchy validation
- Category type enforcement (income/expense/both)

### Part C — Accounts/Wallets Foundation
- Archive/restore accounts
- Historical transaction references for archived accounts
- Prevent archived account selection for new transactions

## Step 4: Quick Add and Transaction Experience
- Global Add Transaction button (Dashboard, History, Reports)
- Desktop: popover/centered modal
- Mobile: bottom sheet
- One reusable TransactionForm (create income, create expense, edit)
- Type toggle, amount, category picker, account, date, payment method, note, receipt
- Auto-focus amount, numeric keyboard, date defaults to today
- Save & Add Another
- Keyboard shortcut 'N'
- Visual Category Picker (recent, frequent, all, search, income/expense filter)
- Cache synchronization after create/edit/delete

## Step 5: Dashboard Financial Command Center
- Period selector (Today, This Week, This Month, This Year, Custom Range)
- Summary cards: Total Balance, Income, Expense, Savings Rate
- Directional indicators + previous-period %
- Expense donut chart with center label
- Top 5 categories with progress
- Income vs Expense trend chart
- Recent transactions (last 5)
- Empty states
- Responsive grid (mobile single column, desktop multi-column)
- Savings Rate: (Income - Expense) / Income × 100, safe zero handling

## Step 6: Complete History and Transaction Management
- Backend: pagination, date range, type, multi-category, account, payment method, search, sort
- Mobile: chronological ledger, daily grouping, sticky headers, daily subtotals, swipe edit/delete
- Desktop: dense sortable table, combined filters, multi-category, date range, pagination, bulk actions
- Transaction detail view
- Delete confirmation
- Full cache synchronization

## Step 7: Reports, Comparisons, and Insights
- Report API/service: weekly, monthly, yearly, custom range
- Income, expense, net savings, savings rate, previous-period comparison
- Category breakdown, trend data, budget actuals
- Report UI: header with metrics, category donut, ranked categories, income vs expense trend
- Range comparison (Range A vs Range B)
- Financial insights (deterministic, no AI)
- Safe zero/NaN/Infinity handling

## Step 8: Budgets and Export System
- Monthly category budgets (create, edit, delete, view)
- Budget progress, remaining, percent, over-budget status
- Duplicate budget prevention per period
- Actuals from persisted expenses
- Budget vs Actual in Reports
- CSV export (correct encoding, consistent columns, safe filenames)
- PDF export (branded reports with period, income, expense, savings rate, category breakdown, trend, budget status)

## Step 9: Settings, Profile, Preferences, and Data Management
- Profile (name, email, avatar, password)
- Preferences (currency, date format, first day of week)
- Appearance (light, dark, system)
- Notifications (daily reminder, weekly summary, monthly summary, budget alerts)
- Data management (export all, JSON backup, restore with validation)
- Account management (sessions, logout all, delete account)
- Danger zone with confirmation

## Step 10: Mobile, Desktop, Accessibility, and UX Quality
- Mobile bottom navigation (Dashboard, History, Add, Reports, Settings)
- Desktop persistent sidebar
- Safe-area support, 44×44 touch targets
- Responsive audit (320px–1920px)
- Standardized UX states (skeletons, empty, error, retry, toasts, confirmations)
- Accessibility audit (semantic HTML, labels, keyboard nav, focus, contrast, screen-reader, reduced motion)

## Step 11: Offline Support, Performance, and Security Hardening
- PWA/service worker inspection
- Offline transaction queue with idempotency keys
- Sync status indicator
- Performance profiling (dashboard load, mutation delay, history queries, bundle size)
- Caching, deduplication, indexes, code splitting
- Security audit (auth, ownership, IDOR, input validation, CORS, secrets)
- Performance report document

## Step 12: Complete Testing and Production Readiness Audit
- Build validation (frontend, backend, lint, typecheck)
- All existing tests pass
- Critical E2E workflows tested
- Financial edge cases tested
- Responsive validation
- Security validation
- Documentation update
- Production readiness status report

## Quality Gate — Every Step
- Frontend build ✅
- Backend build ✅
- Lint ✅
- Type checking ✅
- Unit tests ✅
- Integration tests ✅
- No regressions ✅
