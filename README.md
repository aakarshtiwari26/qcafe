# QCafe

A production-grade restaurant ordering platform — Next.js 16, React 19, MongoDB, and TypeScript throughout. Built to serve 1000+ orders/day with enterprise-style architecture: service layer, centralized config, RBAC, rate limiting, audit logging, and a real admin panel.

**Nothing about the restaurant is hardcoded.** Change `APP_NAME` in `.env.local` and the navbar, footer, SEO metadata, emails, manifest, and admin panel all update automatically.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Database | MongoDB + Mongoose |
| Auth | JWT (`jose`) + bcrypt + HTTPOnly cookies, email OTP |
| Email | Nodemailer (SMTP) |
| Images | ImageKit (CDN, never stored in MongoDB) |
| State | Zustand (cart), TanStack Query (server state) |
| Charts | Recharts |
| Forms | react-hook-form + Zod |

## Getting started

### 1. Prerequisites

- Node.js 20+
- A MongoDB instance — either [MongoDB Atlas](https://www.mongodb.com/atlas) or local (`brew install mongodb-community` on macOS)
- An [ImageKit](https://imagekit.io) account (free tier works) for image uploads
- SMTP credentials for sending OTP/order emails (Gmail app password, or any SMTP provider)

### 2. Install

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

- `MONGODB_URI` — your connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate with `openssl rand -base64 48`
- `SMTP_*` — your email provider's credentials
- `IMAGEKIT_*` — from your ImageKit dashboard
- `APP_NAME` and friends — your restaurant's branding

The app validates all required env vars at boot (`src/config/env.ts`) and fails fast with a clear message if anything's missing.

### 4. Seed sample data (optional, recommended for local dev)

Populates hostels, categories, ~29 menu items (using the placeholder photos in `public/images/menu`), a demo coupon, and an admin account — without needing real ImageKit credentials yet.

```bash
npm run seed
```

This creates an admin login: `admin@qcafe.local` / `Admin@12345`. **Change or remove this before deploying to production.**

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

In development, OTP codes are also printed to the server console (`[dev-otp] ...`) so you can test the auth flows without a working SMTP connection. This never happens in production.

## Project structure

```
src/
  app/                 # Routes (App Router) — public site, auth, dashboard, admin, API
  components/          # UI, grouped by feature (menu, cart, admin, dashboard, auth, layout)
  config/              # env.ts (validated env vars) + site.ts (derived branding config)
  constants/           # Enums, roles, statuses — no magic strings elsewhere
  lib/                 # auth, db, email, imagekit, security, validators, serializers
  models/              # Mongoose schemas
  services/            # Business logic — API routes call these, not models directly
  store/               # Zustand (cart)
  proxy.ts             # Route protection + security headers (Next 16's middleware successor)
scripts/
  seed.ts              # Local dev seed data
```

Architecture notes:
- **Service layer**: API routes are thin — validation with Zod, then delegate to `src/services/*`. Business logic (pricing, order status transitions, OTP flows) lives in one place.
- **Never trust the client for pricing**: cart totals shown in the UI are a preview; `order.service.ts` recomputes everything server-side from live DB prices before creating an order.
- **Server/Client boundary**: `src/config/env.ts` (and anything that imports it) must never be reachable from a `"use client"` component — it holds every secret and validates them eagerly at import time. DTUs/serializers in `src/lib/serializers/` exist specifically to hand plain, client-safe objects across that boundary.

## Deployment (Vercel)

1. Push to a Git provider and import the repo in Vercel.
2. Add every variable from `.env.example` as a Vercel Environment Variable (use real production values — a new `JWT_*` secret pair, your Atlas URI, production SMTP, production ImageKit keys).
3. Set `APP_URL` to your production domain.
4. Deploy. No code changes needed to go from localhost to production — everything is environment-driven.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build locally |
| `npm run lint` | ESLint |
| `npm run seed` | Populate local MongoDB with sample data |

## What's implemented vs. architecture-only

Implemented: browsing/menu/search, cart, checkout (COD), order tracking with a status timeline, customer dashboard (orders, favorites, profile, addresses, security — password/email/phone change with OTP verification), and a full admin panel (analytics dashboard, order management, menu/category/hostel CRUD, coupon display, user suspension, restaurant settings, activity log).

Architecture-ready but intentionally not wired up yet (per spec): coupon redemption at checkout, UPI/Razorpay/Stripe payments, WhatsApp notifications, push notifications, full PWA (service worker/offline), a kitchen display system, and a delivery-partner panel. The `Coupon` model and Mongoose schemas are already shaped to support these without a rewrite.
