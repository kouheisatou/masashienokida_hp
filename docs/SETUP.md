# Project Setup Guide

This guide outlines the manual steps required to set up the environment for the Masashi Enokida Website Renewal.

## 1. Environment Variables (.env)
Create a `.env` file in the root directory of the project (`/Users/kohei/git/masashienokida_hp/.env`).
This file is shared by `docker-compose` to configure all services.

```bash
# Database
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=masashienokida
DATABASE_URL="postgresql://user:password@db:5432/masashienokida?schema=public"

# MinIO (Storage)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# Backend
PORT=4000
NODE_ENV=development

# Google Authentication
# Obtain these from Google Cloud Console: https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
# Callback URL: http://localhost:4000/auth/google/callback

# Stripe (Payments)
# Obtain from Stripe Dashboard: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
# Price ID for Gold Membership
STRIPE_PRICE_ID_GOLD="price_..."
```

## 2. Google Authentication Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Go to **APIs & Services > OAuth consent screen**.
    - User Type: External.
    - Fill in app name and support email.
4. Go to **Credentials > Create Credentials > OAuth client ID**.
    - Application type: **Web application**.
    - Name: `Masashi Enokida HP`.
    - **Authorized JavaScript origins**: `http://localhost:3000`
    - **Authorized redirect URIs**: `http://localhost:4000/auth/google/callback`
5. Copy the **Client ID** and **Client Secret** to your `.env` file.

## 3. Stripe Setup (Membership)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/).
2. Register for an account (or login).
3. Toggle **Test Mode** on.
4. Go to **Developers > API keys**.
    - Copy **Secret key** to `STRIPE_SECRET_KEY` in `.env`.
5. Go to **Products**.
    - Create a product named "Gold Membership".
    - Set price (e.g., 1000 JPY / Month).
    - Copy the **API ID** of the price (starts with `price_`) to `STRIPE_PRICE_ID_GOLD`.
6. (Optional for local dev) Setup CLI for webhooks or use a test endpoint.

## 4. Running the Project
Once the `.env` file is created:

```bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f
```
