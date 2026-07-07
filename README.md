# 💰 PocketLedger — Personal Finance Management System

> **⚠️ PROPRIETARY & CONFIDENTIAL**
> This is a paid client project. All source code, design, and intellectual property are protected by copyright.
> **Unauthorized use, reproduction, distribution, or modification is strictly prohibited without explicit written permission from the author.**

---

## 📌 Project Overview

**PocketLedger** is a full-stack, enterprise-grade personal finance management web application built as a commissioned client project by **HexaStack Solutions**. It enables users to seamlessly track income and expenses, manage budgets, visualize spending trends, and stay on top of their financial goals — all within a clean, modern interface.

The platform features a secure **admin panel** for user management, a rich **user dashboard** with real-time financial analytics, and a robust **REST API backend** following clean architecture principles.

---

## ✨ Key Features

- 🔐 **Authentication & Authorization** — JWT-based auth with ASP.NET Core Identity and role-based access control
- 👥 **Admin Panel** — Admins can create and manage users, assign roles, set credentials, and copy IDs/passwords
- 📊 **Financial Dashboard** — Visualize income vs. expense trends, category breakdowns, and account balances
- 💳 **Account Management** — Create and manage multiple financial accounts (savings, current, cash, etc.)
- 🏷️ **Category & Tag Management** — Organize transactions with custom categories and tags
- 📋 **Transaction Tracking** — Full CRUD for income/expense transactions with filtering and pagination
- 📅 **Recurring Transactions** — Set up recurring income/expense entries automatically
- 📦 **Budget Management** — Create monthly/yearly budgets per category with overspend alerts
- 🔔 **Notification System** — In-app notifications and budget breach alerts
- 📈 **Reports & Exports** — Generate financial summaries and export data
- 🐳 **Docker Ready** — Fully containerized with Docker and docker-compose for easy deployment

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + TypeScript** | UI framework with type safety |
| **Vite** | Lightning-fast build tool and dev server |
| **React Query (TanStack)** | Server state management & caching |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client for API communication |
| **Recharts** | Data visualization charts |
| **Vanilla CSS** | Custom styling with glassmorphism & animations |

### Backend
| Technology | Purpose |
|---|---|
| **ASP.NET Core 8** | Web API framework |
| **C# 12** | Primary programming language |
| **Entity Framework Core 8** | ORM & database migrations |
| **SQLite** | Lightweight relational database |
| **ASP.NET Core Identity** | Authentication, user management, password hashing |
| **JWT Bearer Tokens** | Stateless authentication |
| **MediatR** | CQRS pattern (Commands & Queries) |
| **AutoMapper** | Entity-to-DTO mapping |
| **FluentValidation** | Input validation pipeline |
| **Hangfire** | Background job scheduling |
| **Serilog** | Structured logging |
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
│   ├── PocketLedger.API/            # ASP.NET Core Web API (Controllers, Middleware, Startup)
│   ├── PocketLedger.Application/    # CQRS Handlers, DTOs, Validators, Interfaces
│   ├── PocketLedger.Domain/         # Entities, Domain Events, Enums, Core Interfaces
│   └── PocketLedger.Infrastructure/ # EF Core, Repositories, Identity, External Services
├── PocketLedger.Client/             # React + TypeScript Frontend (Vite)
│   ├── src/
│   │   ├── pages/                   # Page components (Dashboard, Admin, Auth, etc.)
│   │   ├── components/              # Reusable UI components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API service functions
│   │   └── types/                   # TypeScript interfaces
├── tests/                           # Unit & Integration test projects
├── database/                        # Database seed scripts
├── docker-compose.yml               # Docker orchestration
└── Dockerfile                       # Container build config
```

---

## 🚀 Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) & npm
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

Runs all unit and integration tests across the three test projects:
- `PocketLedger.API.Tests`
- `PocketLedger.Application.Tests`
- `PocketLedger.Infrastructure.Tests`

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