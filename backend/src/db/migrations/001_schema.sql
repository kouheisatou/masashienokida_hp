-- ── Extensions ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  image       TEXT,
  google_id   TEXT UNIQUE,
  role        TEXT NOT NULL DEFAULT 'USER'
              CHECK (role IN ('USER','MEMBER_FREE','MEMBER_GOLD','ADMIN')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Sessions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ── Subscriptions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id       TEXT,
  stripe_subscription_id   TEXT,
  tier                     TEXT NOT NULL DEFAULT 'MEMBER_FREE'
                           CHECK (tier IN ('MEMBER_FREE','MEMBER_GOLD')),
  status                   TEXT NOT NULL DEFAULT 'ACTIVE'
                           CHECK (status IN ('ACTIVE','CANCELED','PAST_DUE','TRIALING')),
  current_period_end       TIMESTAMPTZ,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Contacts ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  category    TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'unread'
              CHECK (status IN ('unread','read','replied','archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- ── News (ニュース) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  body         TEXT,
  image_url    TEXT,
  category     TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);

-- ── Concerts (コンサート) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS concerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  date         DATE NOT NULL,
  time         TEXT,
  venue        TEXT NOT NULL,
  address      TEXT,
  image_url    TEXT,
  program      TEXT[],
  price        TEXT,
  ticket_url   TEXT,
  note         TEXT,
  is_upcoming  BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_concerts_date ON concerts(date DESC);
CREATE INDEX IF NOT EXISTS idx_concerts_is_upcoming ON concerts(is_upcoming);

-- ── Discography ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discography (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  release_year INTEGER NOT NULL,
  description  TEXT,
  image_url    TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Biography entries (経歴) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS biography (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Blog Posts ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  content       TEXT,
  excerpt       TEXT,
  thumbnail_url TEXT,
  category      TEXT,
  members_only  BOOLEAN NOT NULL DEFAULT FALSE,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blog_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);

-- ── Rate Limits ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limits (
  key         TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 1,
  window_end  TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (key, window_end)
);
