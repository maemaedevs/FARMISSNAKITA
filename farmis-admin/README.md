# Farmis Admin

A modern admin console for the Farmis platform — built with **React 19 + TypeScript**, **Vite**, and **Tailwind CSS v4**.

It complements [`farmis-mobile`](../farmis-mobile) by giving operators a desktop dashboard to manage farms, users, products, and analytics.

---

## Tech stack

| Concern        | Choice                                     |
| -------------- | ------------------------------------------ |
| Framework      | React 19 + TypeScript                      |
| Build tool     | Vite                                       |
| Styling        | Tailwind CSS v4 (`@tailwindcss/vite`)      |
| Routing        | React Router                               |
| Data fetching  | TanStack Query + Axios                     |
| Forms          | React Hook Form + Zod                      |
| Charts         | Recharts                                   |
| Icons          | lucide-react                               |
| Lint           | ESLint + typescript-eslint                 |

---

## Getting started

> Requires Node.js 20+ and npm.

```bash
cd farmis-admin
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL as needed
npm run dev
```

The app will start on [http://localhost:5173](http://localhost:5173).

### Demo login

Authentication is mocked in `src/services/auth.service.ts` while the backend is being built. Use any email and a password with **6+ characters** to sign in.

### Other scripts

```bash
npm run build     # type-check + production build
npm run preview   # preview the production build
npm run lint      # run ESLint
```

---

## Project structure

```
farmis-admin/
├── public/                      # Static assets served as-is (favicon, etc.)
├── src/
│   ├── assets/                  # Imported assets (images, svgs)
│   ├── components/
│   │   ├── common/              # Reusable UI primitives (Button, Card, Input, …)
│   │   ├── dashboard/           # Dashboard-specific widgets
│   │   └── layout/              # AdminLayout, AuthLayout, Sidebar, Topbar, Logo
│   ├── constants/               # Static config (colors, navigation)
│   ├── context/                 # React context providers (AuthContext)
│   ├── hooks/                   # Custom React hooks (useAuth, …)
│   ├── lib/                     # Framework-level helpers (cn, queryClient)
│   ├── pages/
│   │   ├── auth/                # LoginPage
│   │   ├── dashboard/           # DashboardPage
│   │   ├── farms/               # FarmsPage
│   │   ├── users/               # UsersPage
│   │   ├── products/            # ProductsPage
│   │   ├── analytics/           # AnalyticsPage
│   │   ├── settings/            # SettingsPage
│   │   └── NotFoundPage.tsx
│   ├── routes/                  # Router + route guards
│   │   ├── AppRoutes.tsx
│   │   └── ProtectedRoute.tsx
│   ├── services/                # API clients (axios instance + domain services)
│   │   ├── api.ts
│   │   └── auth.service.ts
│   ├── types/                   # Shared TypeScript types/interfaces
│   ├── utils/                   # Pure helpers (formatting, etc.)
│   ├── App.tsx                  # App shell — providers + router
│   ├── index.css                # Tailwind v4 entry + design tokens (@theme)
│   └── main.tsx                 # React entry point
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

### Path alias

`@/*` resolves to `src/*` (configured in `tsconfig.app.json` and `vite.config.ts`). Prefer:

```ts
import { Button } from '@/components/common';
```

over relative imports like `../../components/common`.

---

## Theming

Brand tokens are defined once in `src/index.css` under the Tailwind v4 `@theme` block, so they're available as utilities everywhere:

- `bg-brand-500`, `text-brand-700`, `border-brand-200`, …
- `bg-ink-50`, `text-ink-800`, `border-ink-100`, …

The palette intentionally mirrors `farmis-mobile/src/constants/colors.ts` so the two apps stay visually consistent.

---

## Adding a new page

1. Create `src/pages/<feature>/<Name>Page.tsx`.
2. Add a route in `src/routes/AppRoutes.tsx` (inside `<AdminLayout>` if it should sit behind auth).
3. If it needs a sidebar entry, add it to `NAV_ITEMS` in `src/constants/navigation.ts`.

---

## Wiring the real API

`src/services/api.ts` exports an `axios` instance pre-configured with:

- `VITE_API_BASE_URL` from `.env`
- Bearer token from `localStorage` (set/cleared via `setAuthToken`)
- Automatic 401 token-clearing interceptor

Add new domain services next to `auth.service.ts` (e.g. `farms.service.ts`) and consume them with TanStack Query hooks inside `src/hooks/`.
