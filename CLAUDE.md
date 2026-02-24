# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Masashi Enokida Pianist website — a professional portfolio and membership platform. The architecture is a monorepo with:
- **Frontend**: Next.js 15 static export hosted on OCI Object Storage
- **Backend**: Node.js serverless functions on OCI Functions, routed via OCI API Gateway
- **Database**: Oracle Autonomous Database (with oracledb DRCP connection pooling)
- **CMS**: MicroCMS for blog content
- **Payments**: Stripe subscriptions (MEMBER_GOLD tier at ¥3,000/year)
- **Auth**: Google OAuth 2.0 → custom JWT sessions
- **Email**: OCI Email Delivery (SMTP)
- **Region**: OCI ap-tokyo-1

## Commands

### Frontend (`frontend/`)
```bash
npm run dev      # Development server
npm run build    # Static export (outputs to out/)
npm run lint     # ESLint
```

### Functions (`functions/<name>/`)
Each function is an independent TypeScript package:
```bash
npm run build    # tsc compilation
```

### Shared library (`functions/shared/`)
```bash
npm run build    # Build shared utilities before functions that depend on them
```

### Infrastructure
```bash
./oci/setup.sh   # Provision OCI resources (interactive, run once)
./oci/deploy.sh  # Build and deploy functions + frontend to OCI
```

## Architecture

### Data Flow

**Auth**: Browser → OCI API Gateway → `functions/auth` (Google OAuth exchange → JWT) → Oracle DB (users/sessions tables)

**Blog**: Browser → `functions/blog` → MicroCMS API → member-only filtering based on JWT role

**Payments**: Browser → `functions/stripe` (create checkout) → Stripe → webhook → update user role to `MEMBER_GOLD` in Oracle DB

**Contact**: Browser → `functions/contact` (reCAPTCHA v3 + rate limit check) → Oracle DB (contacts table) → OCI Email Delivery

### Roles & Access Control
Four roles enforced in `functions/shared/utils/auth-middleware.ts`:
- `USER` — authenticated, no subscription
- `MEMBER_FREE` — free membership
- `MEMBER_GOLD` — paid subscriber (¥3,000/year via Stripe)
- `ADMIN` — full admin access

The `withAuth` middleware wrapper handles JWT verification and RBAC for all function handlers.

### Frontend Structure
- `src/app/(public)/` — public-facing pages (home, biography, blog, concerts, contact, history, supporters, members)
- `src/app/(admin)/` — admin dashboard (contacts management, member management)
- `src/lib/api-client.ts` — typed API client; all backend calls go through this

The frontend is **static export** (`output: 'export'` in `next.config.ts`) — no server-side rendering. All dynamic data fetches happen client-side via the OCI API Gateway.

### Functions Structure
Each function in `functions/<name>/` is independent with its own `package.json`. They share:
- `functions/shared/` — DB connection, auth middleware, rate limiter, reCAPTCHA, response helpers
- Oracle DB connection via `connection.ts` uses DRCP pooling optimized for serverless (min:1, max:5, idle:60s)

### Database
Schema defined in `functions/shared/db/migrations/001_initial.sql`. Key tables: `users`, `accounts`, `sessions`, `subscriptions`, `contacts`, `rate_limits`, `audit_logs`, `verification_tokens`.

All DB access goes through the query helpers in `functions/shared/db/connection.ts`: `executeQuery`, `executeInsert`, `executeUpdate`, `executeTransaction`.

### OCI Infrastructure
Resource IDs are stored in `oci/config/setup-config.json` after running `setup.sh`. The API Gateway routes all `/auth/*`, `/blog/*`, `/stripe/*`, `/contact/*`, `/members/*` paths to their respective OCI Functions.

## Environment Variables

All required variables are documented in `.env.example`. Key groups:
- `DB_*` / `TNS_ADMIN` — Oracle DB credentials and wallet path
- `OCI_SMTP_*` — OCI Email Delivery SMTP credentials
- `MICROCMS_*` — MicroCMS service domain and API key
- `STRIPE_*` — Stripe keys, webhook secret, and `STRIPE_GOLD_PRICE_ID`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth app credentials
- `RECAPTCHA_*` — reCAPTCHA v3 site and secret keys
- `JWT_SECRET` — Must be 32+ characters (generated with OpenSSL)
- `NEXT_PUBLIC_API_URL` — OCI API Gateway base URL (consumed by frontend build)

## Design System

The site uses a burgundy-black elegant theme defined in `docs/design_guide.md`:
- Primary BG: `#1a0a0a`, Burgundy: `#2d1616`, Body text: `#d4c4b0` (beige), Accent: `#8b4545`
- Font: Noto Serif JP / 游明朝 (Japanese serif)
- Container max-width: 1200px; section padding: 120px (desktop) / 80px (mobile)
- Button styles: pill (border-radius: 9999px) for primary CTA, sharp (2px) for secondary
