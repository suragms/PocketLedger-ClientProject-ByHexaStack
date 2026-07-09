# 💰 PocketLedger — Personal Finance Management System

> **⚠️ PROPRIETARY & CONFIDENTIAL**
> This is a paid client project. All source code, design, and intellectual property are protected by copyright.
> **Unauthorized use, reproduction, distribution, or modification is strictly prohibited without explicit written permission from the author.**

---

## 📌 Project Overview

**PocketLedger** is a full-stack, enterprise-grade personal finance management web application built as a commissioned client project by **HexaStack Solutions**. It enables users to seamlessly track income and expenses, manage budgets, visualize spending trends, and stay on top of their financial goals — all within a clean, modern, responsive interface optimized for both mobile and desktop.

The platform features a secure **admin panel** for user management, a rich **user dashboard** with real-time financial analytics, adaptive **mobile-first** and **desktop-optimized** layouts, and a robust **REST API backend** following clean architecture principles with CQRS.

---

## ✨ Key Features

- 🔐 **Authentication & Authorization** — JWT-based auth with ASP.NET Core Identity, role-based access control, 2FA (TOTP), and passkeys (WebAuthn)
- 👥 **Admin Panel** — Admins can manage users, roles, transactions, categories, wallets, budgets, reports, and view audit logs
- 📊 **Financial Dashboard** — Period-over-period comparison, savings rate, spending by category, budget progress, income vs expense trends, recent transactions
- 💳 **Account Management** — Multiple account types (savings, current, cash, credit, investment), archive/restore with balance-safe deletion
- 🏷️ **Category Management** — Hierarchical categories with type enforcement (income/expense), circular-reference prevention, starter category seeding
- 📋 **Transaction Tracking** — Full CRUD with search, multi-faceted filters (date, type, account, category, amount range), infinite scroll, daily grouping, soft delete with undo
- 📅 **Recurring Transactions** — Set up recurring income/expense entries automatically
- 📦 **Budget Management** — Category budgets with actual-spending comparison, over-budget/near-limit/on-track status, progress bars
- 🔔 **Notification System** — In-app notifications with real-time polling, per-channel preferences (email, push), budget breach alerts
- 📈 **Reports & Exports** — Interactive reports with previous-period comparison, category breakdown, daily/weekly trends, wallet analysis, budget variance; CSV and PDF export
- 🌗 **Dark Mode** — Light, dark, and system-follow theme with HSL-based CSS variables
- 📱 **Responsive Design** — Adaptive mobile bottom navigation, desktop sidebar, bottom sheets, responsive charts, touch-optimized controls
- 🐳 **Docker Ready** — Fully containerized with Docker and docker-compose for easy deployment
- 🛡️ **Security** — 2FA, passkeys, session management, PIN login, role-based admin access, input validation (Zod + FluentValidation)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19 + TypeScript 6** | UI framework with type safety |
| **Vite 8** | Lightning-fast build tool and dev server |
| **TanStack Query v5** | Server state management & caching |
| **React Router v7** | Client-side routing with lazy loading |
| **Redux Toolkit** | Global state (auth, UI/theme) |
| **Tailwind CSS v4** | Utility-first styling with HSL design tokens |
| **Recharts** | Data visualization (pie, bar, area, radar charts) |
| **Framer Motion** | Page transitions and UI animations |
| **Headless UI** | Accessible dialogs, menus, transitions |
| **React Hook Form + Zod v4** | Form handling and validation |
| **Axios** | HTTP client with automatic token refresh |
| **react-hot-toast** | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| **.NET 10** | Web API framework |
| **C# 14** | Primary programming language |
| **Entity Framework Core 10** | ORM & database migrations |
| **SQLite** | Development database |
| **ASP.NET Core Identity** | Authentication, user management, password hashing |
| **JWT Bearer Tokens** | Stateless authentication |
| **MediatR** | CQRS pattern (Commands & Queries) |
| **AutoMapper** | Object mapping |
| **FluentValidation** | Input validation pipeline |
| **Swagger / OpenAPI** | API documentation |

### Architecture
- **Clean Architecture** — Domain → Application → Infrastructure → API layers
- **CQRS Pattern** — Commands and Queries separated via MediatR pipeline
- **Repository Pattern** — Abstracted data access layer
- **Unit of Work** — Consistent database transactions

---

## 📁 Project Structure

```
PocketLedger/
├── src/
│   ├── PocketLedger.API/            # ASP.NET Core Web API (Controllers, Middleware, Program.cs)
│   ├── PocketLedger.Application/    # CQRS Handlers, DTOs, Validators, Interfaces, Value Objects
│   ├── PocketLedger.Domain/         # Entities, Enums, Interfaces, Value Objects (DateRange)
│   └── PocketLedger.Infrastructure/ # EF Core, Repositories, Identity, Migrations, Services
├── PocketLedger.Client/             # React 19 + TypeScript 6 Frontend (Vite 8)
│   ├── src/
│   │   ├── api/                     # Axios API clients per resource (10+ modules)
│   │   ├── app/                     # Redux store (auth, ui)
│   │   ├── components/              # Reusable UI (Card, Button, Modal, Sheet, etc.)
│   │   │   ├── layout/              # MainLayout, Sidebar, Header, MobileNav
│   │   │   ├── transactions/        # TransactionItem, DayGroup, FilterPanel, QuickAddSheet
│   │   │   └── ui/                  # Primitives (AdaptiveSheet, PageHeader, ResponsiveGrid, etc.)
│   │   ├── features/                # Redux slices (auth)
│   │   ├── hooks/                   # useMediaQuery, useDebounce, useInfiniteScroll
│   │   ├── lib/                     # Utils, validators (Zod), constants, responsive helpers
│   │   └── pages/                   # 30+ page components (lazy loaded)
│   └── src/App.tsx                  # React Router v7 route definitions
├── tests/
│   ├── PocketLedger.API.Tests/      # 3 controller tests
│   ├── PocketLedger.Application.Tests/ # 47 handler/validator/value-object tests
│   └── PocketLedger.Infrastructure.Tests/ # 7 repository tests
├── docker-compose.yml               # Docker orchestration
└── Dockerfile                       # Container build config
```

---

## 🚀 Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/) & npm
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/suragms/PocketLedger-ClientProject-ByHexaStack.git
cd PocketLedger-ClientProject-ByHexaStack
```

### 2. Configure the Backend

```bash
cd src/PocketLedger.API
```

Copy and update the app settings:
```bash
cp appsettings.json appsettings.Development.json
```

Update `appsettings.Development.json` with your JWT secret, database path, and email settings.

### 3. Run the Backend

```bash
cd src/PocketLedger.API
dotnet run
```

The API will start at `https://localhost:7001` (or `http://localhost:5001`).  
Swagger UI: `https://localhost:7001/swagger`

### 4. Run the Frontend

```bash
cd PocketLedger.Client
npm install
npm run dev
```

The frontend will start at `http://localhost:5174`.  
API requests are proxied to `http://localhost:5130` automatically.

### 5. Admin Panel Access

Navigate to: `http://localhost:5174/urlAdmin26`

Default Admin Credentials:
- **Email**: `surag@admin.com`
- **Password**: *(Contact the author for credentials)*

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

This will spin up both the API and frontend containers.

---

## 🧪 Running Tests

```bash
dotnet test
```

Runs all 57 unit and integration tests across the three test projects:
- `PocketLedger.API.Tests` — 3 tests
- `PocketLedger.Application.Tests` — 47 tests
- `PocketLedger.Infrastructure.Tests` — 7 tests

### Frontend Checks

```bash
cd PocketLedger.Client
npm run lint      # Oxlint (0 warnings expected)
npm run build     # TypeScript + Vite build (0 errors expected)
```

---

## 📱 Responsive Design

PocketLedger provides **two intentionally designed experiences** from one shared codebase:

| | Mobile | Desktop |
|---|---|---|
| **Navigation** | Fixed bottom bar (Home, History, Add, Reports, Settings) | Persistent left sidebar (256px / collapsible to 80px) |
| **Dashboard** | 2-column cards, simplified charts | 4-column cards, detailed charts, full-width trends |
| **Transaction Entry** | Bottom sheet quick add → full-page form | QuickAddSheet popover → centered modal form |
| **History** | Card view, bottom-sheet filters, infinite scroll | Table view, inline filters, sort dropdown |
| **Reports** | Single-column charts, scrollable | 2-column grid, detailed tooltips |
| **Settings** | Horizontal scrollable tabs | Left sidebar navigation panel |
| **Charts** | 220–280px height, touch tooltips | 350px+ height, hover tooltips |

---

## 📚 Documentation

- `docs/POCKETLEDGER_CODEBASE_AUDIT.md` — Original codebase analysis
- `docs/POCKLEDGER_IMPLEMENTATION_PLAN.md` — 12-step implementation roadmap
- `docs/POCKETLEDGER_PRODUCTION_AUDIT.md` — Production readiness assessment
- `docs/POCKETLEDGER_RESPONSIVE_AUDIT.md` — Responsive UX audit
- `docs/POCKETLEDGER_MOBILE_DESKTOP_FINAL_AUDIT.md` — Final mobile/desktop audit

---

## ⚠️ License & Copyright

```
Copyright © 2026 Surag | HexaStack Solutions
All Rights Reserved.

This project is a PAID CLIENT PROJECT and is PROPRIETARY software.
No part of this codebase may be copied, modified, distributed, sublicensed,
or used in any form without explicit written permission from the author.

Unauthorized use will be subject to legal action.
```

**🌐 Website**: [www.hexastacksolutions.com](https://www.hexastacksolutions.com)

---

## 👨‍💻 About the Developer

**Surag** — Full-Stack Developer & Software Architect  
Founder of **HexaStack Solutions**

I am available for **freelance projects**, **architectural consultations**, and **full-stack development collaborations**.

---

## 📬 DM for Enquiries

| Platform | Link |
|---|---|
| 🌳 **Linktree** | [linktr.ee/suragdevstudio](https://linktr.ee/suragdevstudio) |
| 🌐 **Portfolio** | [surag-portfolio.web.app](https://surag-portfolio.web.app) |
| 📧 **Email** | [officialsurag@gmail.com](mailto:officialsurag@gmail.com) |
| 💼 **LinkedIn** | [linkedin.com/in/suragsunil](https://linkedin.com/in/suragsunil) |
| 📸 **Instagram** | [instagram.com/surag_sunil](https://instagram.com/surag_sunil) |
| 💻 **GitHub** | [github.com/suragms](https://github.com/suragms) |
| 📺 **YouTube** | [youtube.com/@suragdevstudio](https://youtube.com/@suragdevstudio) |

> 📱 **Phone**: Request via Instagram or LinkedIn DM

---

<div align="center">

**Built with ❤️ by Surag | HexaStack Solutions**

[🌐 Visit Website](https://www.hexastacksolutions.com) · [📧 Email](mailto:officialsurag@gmail.com) · [🌳 Linktree](https://linktr.ee/suragdevstudio)

*© 2026 Surag | HexaStack Solutions. All rights reserved. Do not use without permission.*

</div>
