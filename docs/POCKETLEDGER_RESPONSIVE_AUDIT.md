# PocketLedger — Responsive Codebase Audit

**Date:** 2026-07-09
**Auditor:** Lead Frontend Engineer

---

## 1. Existing Architecture

### Frontend Stack
- **React** 19.2.7 + **TypeScript** 6.0.2 + **Vite** 8.1.1
- **Tailwind CSS** 4.3.2 (CSS-first config via `@import "tailwindcss"`)
- **React Router** v7.18.1 (lazy routes, `BrowserRouter`)
- **Redux Toolkit** 2.12.0 (2 slices: `auth`, `ui`)
- **TanStack React Query** v5.101.2 (server state, 5min stale time, 10min gc)
- **Axios** 1.18.1 (API client with token refresh interceptor)
- **Recharts** 3.9.2 (charts)
- **Framer Motion** 12.42.2 (animations)
- **Headless UI** 2.2.10 (`Dialog`, `Menu`, `Transition`)
- **React Hook Form** 7.81.0 + **Zod** 4.4.3 (forms + validation)
- **react-hot-toast** (notifications)
- **oxlint** 1.71.0 (linter)

### Current Breakpoints
| Source | Breakpoints | Usage |
|--------|------------|-------|
| Tailwind defaults | sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px | Grid columns, padding, visibility |
| Custom media query | `(max-width: 768px)` in `useMediaQuery` hook | Mobile detection for sidebar, MobileNav, MainLayout |
| No other custom breakpoints defined | — | — |

### Existing Layout System
- **MainLayout** → Sidebar (fixed left) + Header (sticky top) + Outlet + MobileNav (fixed bottom, hidden on md+)
- **AdminLayout** → Sidebar + AdminHeader + Outlet (no MobileNav)
- **Auth pages** → No layout wrapper

### Responsive Patterns Detected
1. **Single breakpoint switching**: `useMediaQuery('(max-width: 768px)')` toggles mobile/desktop
2. **Progressive padding**: `p-4 md:p-6 lg:p-8`
3. **Mobile padding-bottom**: `pb-20 md:pb-8` to clear MobileNav
4. **Static sidebar width via `style={{ marginLeft }}`**: 256px open / 80px collapsed on desktop, 0 on mobile
5. **Mobile sidebar**: Overlay drawer with backdrop, closed by default on mobile
6. **Table/card view toggle**: TransactionsPage uses `viewMode` state
7. **Horizontal scroll**: `overflow-x-auto` on table containers
8. **Safe area**: `.safe-area-pb` utility class for iOS notch
9. **Reduced motion**: `@media (prefers-reduced-motion: reduce)` disables animations
10. **User menu**: User name hidden with `hidden md:block`

---

## 2. Page-by-Page Findings

### 2.1 Application Shell (MainLayout + Sidebar + Header + MobileNav)

**Mobile (320–768px):**
- ✅ MobileNav fixed at bottom with 4 items + FAB Add
- ✅ Safe-area bottom padding
- ✅ Touch targets ≥ 48×48px
- ✅ Active route indication
- ⚠️ MobileNav items don't include History (Transactions) or Reports — instead has Accounts and Budgets
- ⚠️ Sidebar opens as overlay but is closed by default on mobile — users must tap hamburger to find sidebar links
- ⚠️ No way to navigate to Reports on mobile from the bottom nav (only in sidebar overlay)
- ❌ `marginLeft: 0` on mobile causes layout shift when sidebar opens (content doesn't push, overlay appears instead — this is correct behavior)

**Tablet (768–1024px):**
- ✅ Sidebar defaults to open on desktop (256px)
- ⚠️ Sidebar closes via toggle but no persistent sidebar choice
- ⚠️ No tablet-specific navigation strategy — uses collapsed sidebar (80px) which works

**Desktop (1024–1920px):**
- ✅ Collapsible sidebar (256px / 80px)
- ✅ All navigation items visible when open
- ⚠️ Sidebar item icons reuse `BanknotesIcon` for both Wallets and Accounts, `ChartBarIcon` for both Budgets and Reports — duplicate icons are confusing
- ⚠️ No keyboard navigation for sidebar items (arrow keys, home/end)
- ⚠️ Sidebar width is hard-coded (256px) — doesn't scale with viewport

### 2.2 Dashboard (DashboardPage)

**Mobile:**
- ✅ Period selector (Select dropdown — compact)
- ✅ Summary cards (2 columns `grid-cols-2`)
- ✅ Savings rate card with comparison
- ✅ Spending by Category pie chart
- ✅ Budget overview
- ✅ Income vs Expenses trend chart (bar chart)
- ✅ Recent Transactions
- ✅ Accounts overview
- ⚠️ Charts may be too small at 320px with labels overlapping
- ⚠️ Recent Transactions in card view but links to edit page (no detail view)
- ⚠️ Empty states exist but could be more helpful

**Desktop:**
- ✅ Summary cards in 4 columns
- ✅ Content grids use `lg:grid-cols-2`
- ⚠️ At 1920px, cards become very wide with excessive whitespace
- ⚠️ Chart height is fixed at 250px/300px — may not scale well
- ⚠️ Savings Rate card is last in the grid, could be de-emphasized in favor of more KPIs

### 2.3 Transaction Form (TransactionFormPage)

**Mobile:**
- ⚠️ Full page form (not a sheet) — ok for focused entry
- ⚠️ Category select is a dropdown, not a visual grid
- ⚠️ Amount input may zoom on focus (needs `font-size: 16px`)
- ⚠️ Receipt upload works but may be difficult on mobile
- ⚠️ No sticky action buttons — user must scroll to bottom

**Desktop:**
- ✅ Centered Card layout with reasonable width
- ✅ Tab order works
- ⚠️ Category dropdown could be richer (grid with colors)

### 2.4 History/Transactions (TransactionsPage)

**Mobile:**
- ✅ Card view mode by default
- ✅ Day grouping with sticky headers + subtotals
- ✅ Debounced search
- ✅ Infinite scroll
- ⚠️ Filters open as inline expandable panel (not a bottom sheet)
- ⚠️ Filter panel at 320px may overflow
- ⚠️ No swipe actions (edit/delete require tap to reveal)
- ⚠️ Delete confirmation dialog works

**Desktop:**
- ✅ Table view option
- ✅ Sortable by view toggle
- ✅ Export CSV
- ⚠️ Table columns may squeeze at 1024px with narrow widths
- ⚠️ No bulk selection/actions
- ⚠️ No sortable column headers (click to sort)
- ⚠️ Pagination uses infinite scroll, not page numbers

### 2.5 Reports (ReportsPage)

**Mobile:**
- ✅ Period selector buttons (may overflow at 320px — 4 buttons + custom)
- ✅ Summary cards in 2×2 grid
- ✅ Charts (bar, area, pie) all present
- ⚠️ Multiple charts stacked vertically — lots of scrolling
- ⚠️ Chart labels may be too small at narrow widths
- ⚠️ Period selector becomes `flex-wrap` with buttons wrapping

**Desktop:**
- ✅ Charts in `lg:grid-cols-2`
- ⚠️ Summary cards in 4 columns — could be wider
- ⚠️ Export buttons visible

### 2.6 Budgets (BudgetsPage, BudgetFormPage, BudgetDetailPage)

- ✅ Basic responsive layout
- ⚠️ Not audited in detail — follows standard Card pattern

### 2.7 Settings (SettingsPage)

**Mobile:**
- ✅ Tab bar with horizontal scroll (`overflow-x-auto`, `whitespace-nowrap`)
- ⚠️ 994-line page — very long
- ⚠️ Profile, appearance, security all in one long scroll
- ⚠️ Danger zone at the bottom — may be missed
- ⚠️ Settings rows could use more touch-friendly spacing

**Desktop:**
- ⚠️ No left navigation — uses same horizontal tab bar
- ⚠️ Forms stretch to full card width (max-width not applied consistently)
- ⚠️ 2FA setup modals work well

### 2.8 Modal/Dialog Components

- ✅ `Modal.tsx` uses Headless UI Dialog with 4 sizes (sm: 400px, md: 512px, lg: 672px, xl: 896px)
- ✅ Backdrop, close button, transitions
- ⚠️ No bottom sheet variant for mobile
- ⚠️ No drawer/side panel variant

### 2.9 Authentication Pages (LoginPage, RegisterPage)

- ✅ Centered card layout
- ✅ Responsive padding
- ⚠️ Hard-coded widths could be more flexible at 320px

### 2.10 Charts

- ✅ All charts use `ResponsiveContainer` from Recharts
- ⚠️ Fixed heights (250px, 300px)
- ⚠️ Tooltip formatter works
- ⚠️ Legends may overlap on mobile

---

## 3. Critical Issues

| # | Issue | Severity | Pages Affected |
|---|-------|----------|---------------|
| 1 | MobileNav lacks History (Transactions) and Reports — key navigation items missing | **High** | MobileNav |
| 2 | MobileNav items don't match the spec (should be: Dashboard, History, Add, Reports, Settings) | **High** | MobileNav |
| 3 | No bottom sheet component for mobile workflows | **Medium** | Transaction form, Filters |
| 4 | No drawer/side panel component | **Medium** | Transaction details, Settings |
| 5 | Category picker is dropdown-only, no visual grid for mobile | **Medium** | TransactionFormPage |
| 6 | Settings page lacks desktop sidebar navigation | **Medium** | SettingsPage |
| 7 | No swipe actions on TransactionsPage mobile | **Low** | TransactionsPage |
| 8 | Filter panel is inline expandable, not bottom sheet | **Medium** | TransactionsPage |
| 9 | Sidebar icons duplicated (Wallets/Accounts both use BanknotesIcon) | **Low** | Sidebar |
| 10 | Amount input may zoom on mobile Safari | **Medium** | TransactionFormPage |
| 11 | Chart fixed heights don't scale with container | **Low** | Dashboard, Reports |
| 12 | No responsive typography system | **Low** | All |
| 13 | Period selector buttons may overflow on 320px | **Medium** | ReportsPage |
| 14 | No tablet-specific navigation strategy | **Low** | MainLayout |
| 15 | Missing Add Transaction action in desktop sidebar | **Low** | Sidebar |

---

## 4. Mobile Problems Summary

1. Navigation items not aligned with spec (missing History, Reports)
2. No bottom sheet for filters or forms
3. No swipe actions
4. Category picker is not touch-optimized
5. Amount field may cause zoom
6. No sticky save actions on transaction form
7. Settings page is very long with no section navigation

## 5. Tablet Problems Summary

1. No tablet-specific layout (uses mobile or desktop)
2. Collapsed sidebar (80px) works but could be improved

## 6. Desktop Problems Summary

1. Settings lacks left nav
2. Sidebar icons duplicated
3. No bulk actions on TransactionsPage
4. No sortable columns
5. Charts don't efficiently use wide screens
6. Excessive whitespace at 1920px

## 7. Accessibility Problems

1. No skip-to-main-content link verified (exists in App.tsx but check if functional)
2. Swipe actions without accessible alternatives
3. Chart descriptions not verified
4. Focus management in modals verified (Headless UI handles this)
5. Touch targets verified at 48×48px for mobile nav

## 8. Recommended Component Strategy

### Create (New)
| Component | Purpose |
|-----------|---------|
| `AdaptiveBottomSheet` | Mobile overlay from bottom for filters, forms |
| `AdaptiveDialog` | Dialog that adapts between mobile sheet and desktop modal |
| `CategoryPicker` | Visual grid with type filtering (mobile + desktop) |
| `MobileOnly` / `DesktopOnly` | Render-gate components (or use hooks) |
| `ResponsivePageContainer` | Max-width page wrapper |
| `SettingsNav` | Desktop left nav for settings sections |

### Refactor (Existing)
| Component | Changes |
|-----------|---------|
| `MobileNav` | Change items to Dashboard, History, Reports, Settings + FAB Add |
| `MainLayout` | Tablet-aware sidebar strategy |
| `Sidebar` | Fix duplicate icons, add Add Transaction action |
| `TransactionFilterPanel` | Convert to bottom sheet on mobile |
| `TransactionItem` | Add swipe actions for mobile |
| `SettingsPage` | Add desktop left nav |
| `ReportsPage` | Period selector responsive wrapping |
| `Modal` | Add bottom sheet variant (or create AdaptiveBottomSheet) |

## 9. Recommended Breakpoint Strategy

Adopt the existing Tailwind defaults but add semantic meaning:

| Name | Tailwind | Usage |
|------|----------|-------|
| Mobile | — | Default (320–639px) |
| Tablet portrait | `sm:` 640px | Tablet narrow layouts |
| Tablet landscape | `md:` 768px | Breakpoint switch, sidebar mobile→desktop |
| Small desktop | `lg:` 1024px | Sidebar open by default |
| Desktop | `xl:` 1280px | Wider grids |
| Wide desktop | `2xl:` 1536px | Max content width |

**Strategy**: Mobile-first. The current `max-width: 768px` detection for "is mobile" is acceptable but should be enhanced:
- `< 768px`: Bottom navigation + full-width content
- `768–1024px`: Collapsed sidebar + bottom nav (or compact sidebar without bottom nav — evaluate)
- `> 1024px`: Persistent sidebar + no bottom nav

## 10. Implementation Order

1. Step 2: Responsive Design System (breakpoints, utilities, primitives)
2. Step 3: Adaptive Application Shell (MobileNav items, sidebar improvements)
3. Step 4: Mobile Dashboard
4. Step 5: Desktop Dashboard
5. Step 6: Adaptive Quick Add (bottom sheet, global Add)
6. Step 7: Responsive Transaction Form
7. Step 8: Mobile History
8. Step 9: Desktop History
9. Step 10: Adaptive Transaction Details
10. Step 11: Mobile Reports
11. Step 12: Desktop Reports
12. Step 13: Mobile Settings
13. Step 14: Desktop Settings
14. Step 15: Responsive Charts
15. Step 16: Modals, Sheets, Drawers
16. Step 17: States (loading, empty, error)
17. Step 18: Accessibility
18. Step 19: Performance
19. Step 20: Final Audit
