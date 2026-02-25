# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Masashi Enokida Pianist website — a professional portfolio and membership platform. The architecture is a monorepo with:
- **Frontend**: Next.js 15 (`next dev`, port 3000)
- **Backend**: Express.js + TypeScript (port 4000)
- **Database**: PostgreSQL 16
- **Payments**: Stripe subscriptions (MEMBER_GOLD tier at ¥3,000/year)
- **Auth**: Google OAuth 2.0 → custom JWT sessions (30-day expiry, stored in localStorage)
- **Email**: nodemailer (SMTP)
- **Infrastructure**: Docker Compose (3 containers: db, backend, frontend)

## Commands

### Start everything
```bash
cp .env.example .env   # Fill in credentials first
docker-compose up --build
```

### Frontend (`frontend/`)
```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
```

### Backend (`backend/`)
```bash
npm run dev      # ts-node-dev watch (port 4000)
npm run build    # tsc compilation to dist/
```

## Architecture

### Data Flow

**Auth**: Browser → `GET /auth/google` (passport redirect) → Google → `GET /auth/google/callback` → JWT signed → redirect to `FRONTEND_URL/auth/callback?token=<jwt>` → localStorage

**Blog**: Browser → `GET /blog` or `/blog/:id` → PostgreSQL → member-only gating via `isLocked` field

**Payments**: Browser → `POST /stripe/checkout` → Stripe Checkout → webhook `POST /stripe/webhook` → update `users.role` to `MEMBER_GOLD`

**Contact**: Browser → `POST /contact` (rate limit: 5/hour/IP) → PostgreSQL + nodemailer notification

### Roles & Access Control
Four roles in `backend/src/middleware/requireRole.ts`:
- `USER` — authenticated, no subscription (rank 0)
- `MEMBER_FREE` — free membership (rank 1)
- `MEMBER_GOLD` — paid subscriber (rank 2)
- `ADMIN` — full admin access (rank 99)

`requireAuth` middleware rejects unauthenticated requests (401).
`requireRole(...roles)` checks role rank, rejects with 403.

### Frontend Structure
- `src/app/(public)/` — public pages (home, biography, blog, concerts, contact, supporters, members, auth/callback)
- `src/app/(admin)/` — admin dashboard (contacts, member management)
- `src/lib/api-client.ts` — all backend API calls; token helpers (`getToken`, `setToken`, `clearToken`)

All dynamic data is fetched client-side. Pages are `'use client'` components.

### Backend Structure (`backend/src/`)
- `index.ts` — Express entry point; Stripe webhook raw body mounted before `express.json()`
- `db.ts` — `pg.Pool` wrapper (`query<T>`, `queryOne<T>`)
- `middleware/auth.ts` — `optionalAuth` (global), `requireAuth`
- `middleware/requireRole.ts` — RBAC factory
- `routes/` — auth, news, concerts, discography, biography, blog, members, contact, stripe, admin
- `utils/email.ts` — nodemailer helpers
- `db/migrations/001_schema.sql` — full PostgreSQL schema (auto-runs on first `db` container start)

### Database
Schema in `backend/src/db/migrations/001_schema.sql`. Key tables:
`users`, `sessions`, `subscriptions`, `contacts`, `rate_limits`, `news`, `concerts`, `discography`, `biography`, `blog_posts`

### Key Implementation Notes
- `NEXT_PUBLIC_API_URL` must be `http://localhost:4000` (browser-facing), NOT `http://backend:4000` (Docker internal)
- OAuth callback page at `/auth/callback` wraps `useSearchParams()` in `<Suspense>` (Next.js 15 requirement)
- Stripe webhook requires raw body — mounted before `express.json()` in `index.ts`
- Blog `members_only` posts return `isLocked: true` and `content: null` for unauthenticated/non-member users

## Environment Variables

All required variables documented in `.env.example`. Key groups:
- `POSTGRES_*` / `DATABASE_URL` — PostgreSQL credentials
- `JWT_SECRET` — Must be 32+ characters
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL`
- `STRIPE_*` — Stripe keys, webhook secret, `STRIPE_GOLD_PRICE_ID`
- `SMTP_*` / `MAIL_FROM` / `ADMIN_EMAIL` — nodemailer SMTP settings
- `NEXT_PUBLIC_API_URL=http://localhost:4000` — browser-facing backend URL
- `FRONTEND_URL=http://localhost:3000` — for CORS and OAuth redirect

## Design System

The site uses a burgundy-black elegant theme defined in `docs/design_guide.md`:
- Primary BG: `#1a0a0a`, Burgundy: `#2d1616`, Body text: `#d4c4b0` (beige), Accent: `#8b4545`
- Font: Noto Serif JP / 游明朝 (Japanese serif)
- Container max-width: 1200px; section padding: 120px (desktop) / 80px (mobile)
- Button styles: pill (border-radius: 9999px) for primary CTA, sharp (2px) for secondary
