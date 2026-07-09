# PocketLedger Client

React 19 + TypeScript 6 + Vite 8 frontend for PocketLedger personal finance management.

## Quick Start

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5174` with API proxy to `http://localhost:5130`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | Run Oxlint linter |
| `npm run preview` | Preview production build locally |

## Tech Stack

- React 19, TypeScript 6, Vite 8
- Tailwind CSS v4 (CSS-first configuration)
- TanStack Query v5 (server state)
- Redux Toolkit (auth, UI state)
- React Router v7 (lazy routes)
- Recharts (charts)
- Framer Motion (animations)
- Headless UI (accessible overlays)
- React Hook Form + Zod v4 (forms + validation)
- Axios (HTTP client with token refresh)

## Project Structure

```
src/
├── api/          # Axios API clients (11 modules)
├── app/          # Redux store, hooks, UI slice
├── components/   # UI primitives, layout, shared, transaction components
├── features/     # Redux slices
├── hooks/        # useMediaQuery, useDebounce, useInfiniteScroll
├── lib/          # Utils, validators (Zod), constants, responsive helpers
├── pages/        # 30+ lazy-loaded route pages
└── types/        # TypeScript interfaces
```
