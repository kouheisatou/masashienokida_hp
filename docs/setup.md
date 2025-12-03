# Setup Guide

This project uses **Next.js** for the frontend and application logic, **MicroCMS** for content management, and **PostgreSQL** (via Prisma) for user and subscription management.

## 1. MicroCMS Setup

You need to create a service in [MicroCMS](https://microcms.io/) and setup the following APIs.

### Service Settings
- **Service ID**: (Your choice, e.g., `masashi-enokida`)
- **API Key**: Get the `X-MICROCMS-API-KEY` (Read/Write or separate keys).

### API Schemas

Create the following APIs with the specified "Endpoint" and fields.

#### 1. Posts (Blog)
- **Endpoint**: `posts`
- **API Type**: List API
- **Fields**:
  - `title` (Text, Required) - Title of the post
  - `slug` (Text, Unique, Required) - URL slug
  - `content` (Rich Editor, Required) - Main content
  - `excerpt` (Text Area) - Short summary
  - `category` (Select/Text) - Category
  - `tags` (Text / Custom Field List) - Tags
  - `thumbnail` (Image) - Cover image
  - `published` (Boolean) - Is published?
  - `membersOnly` (Boolean) - Is for members only?
  - `requiredRole` (Select: `MEMBER_FREE`, `MEMBER_GOLD`) - Required tier

#### 2. Concerts
- **Endpoint**: `concerts`
- **API Type**: List API
- **Fields**:
  - `title` (Text, Required)
  - `date` (Date, Required)
  - `venue` (Text, Required)
  - `location` (Text) - Address/Map link
  - `program` (Rich Editor)
  - `description` (Rich Editor)
  - `image` (Image)
  - `ticketUrl` (Text)
  - `price` (Text)
  - `isArchived` (Boolean)

#### 3. Discography
- **Endpoint**: `discography`
- **API Type**: List API
- **Fields**:
  - `title` (Text, Required)
  - `titleEn` (Text)
  - `releaseDate` (Date, Required)
  - `label` (Text)
  - `trackList` (Rich Editor or TextArea)
  - `description` (Rich Editor)
  - `coverImage` (Image)
  - `purchaseUrl` (Text)
  - `spotifyUrl` (Text)
  - `appleMusicUrl` (Text)
  - `youtubeUrl` (Text)

#### 4. Biography
- **Endpoint**: `biography`
- **API Type**: List API (or Object API if single language)
  - *Recommendation: List API with a field for `language` ("ja", "en")*
- **Fields**:
  - `language` (Select: `ja`, `en`)
  - `content` (Rich Editor)
  - `summary` (TextArea)
  - `photo` (Image)
  - `awards` (Rich Editor)
  - `education` (Rich Editor)

#### 5. History
- **Endpoint**: `history`
- **API Type**: List API
- **Fields**:
  - `year` (Number, Required)
  - `date` (Date)
  - `title` (Text, Required)
  - `description` (TextArea)
  - `venue` (Text)
  - `category` (Select)
  - `image` (Image)
  - `reviews` (TextArea)

#### 6. Member Content (Videos/Audio)
- **Endpoint**: `member-content`
- **API Type**: List API
- **Fields**:
  - `title` (Text, Required)
  - `content` (Rich Editor)
  - `contentType` (Select: `article`, `video`, `audio`)
  - `thumbnail` (Image)
  - `fileUrl` (Text) - Link to secured video/audio (e.g. Vimeo/S3)
  - `requiredRole` (Select: `MEMBER_FREE`, `MEMBER_GOLD`)

#### 7. Contact (Optional)
- **Endpoint**: `contacts`
- **API Type**: List API (Enable "POST" in API Settings to allow form submissions)
- **Fields**:
  - `name` (Text)
  - `email` (Text)
  - `subject` (Text)
  - `message` (TextArea)
  - `category` (Select)
  - `status` (Select: `PENDING`, `RESOLVED`)

---

## 2. Environment Variables (`.env`)

Create a `.env` file in the root directory.

```bash
# MicroCMS
MICROCMS_SERVICE_DOMAIN=your-service-id
MICROCMS_API_KEY=your-api-key

# Database (Postgres - for Users/Auth)
DATABASE_URL="postgresql://user:password@host:5432/mydb?schema=public"

# Google OAuth (for NextAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 3. Google Auth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Setup **OAuth Consent Screen** (External).
4. Create **Credentials** > **OAuth Client ID**.
   - **Application Type**: Web application
   - **Authorized JavaScript origins**: `http://localhost:3000` (and your production domain)
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google` (and production equivalent)
5. Copy Client ID and Secret to `.env`.

---

## 4. Stripe Setup

1. Create a [Stripe](https://stripe.com/) account.
2. Get API Keys from **Developers** > **API keys**.
   - Publishable Key -> `.env`
   - Secret Key -> `.env`
3. Create **Products** in Stripe Dashboard for memberships (e.g., "Gold Member").
   - Copy the `Price ID` (e.g., `price_123...`) to use in your code or `.env`.
4. Setup **Webhooks** locally:
   - Install Stripe CLI.
   - Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
   - Copy the "signing secret" (`whsec_...`) to `.env`.
