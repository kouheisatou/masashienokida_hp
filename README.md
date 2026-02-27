# Masashi Enokida Pianist 公式サイト

ピアニスト榎田まさしのプロフェッショナル・ポートフォリオと会員制プラットフォーム。

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [ディレクトリ構造](#3-ディレクトリ構造)
4. [開発コマンド](#4-開発コマンド)
5. [ブランチ管理・CI/CD](#5-ブランチ管理cicd)
6. [アーキテクチャ](#6-アーキテクチャ)
7. [データベース・API](#7-データベースapi)
8. [シングルソースオブトゥルース](#8-シングルソースオブトゥルース)
9. [テスト](#9-テスト)
10. [外部依存サービス](#10-外部依存サービス)
11. [認証・権限](#11-認証権限)
12. [デザインシステム](#12-デザインシステム)
13. [環境変数](#13-環境変数)
14. [実装上の注意事項（AI向け）](#14-実装上の注意事項ai向け)
15. [参照ドキュメント](#15-参照ドキュメント)

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| 種類 | モノレポ（フロントエンド + バックエンド + 管理コンソール） |
| 決済 | Stripe サブスクリプション（MEMBER_GOLD 年額 ¥3,000） |
| 認証 | Google OAuth 2.0 → JWT（30日有効、localStorage） |
| メール | nodemailer（SMTP） |

---

## 2. 技術スタック

| レイヤー | 技術 | ポート |
|---------|------|--------|
| Frontend | Next.js 15 | 3000 |
| Admin Console | Next.js 15（別アプリ） | 3001 |
| Backend | Express.js + TypeScript | 4000 |
| Database | PostgreSQL 16 | 5432 |
| ORM | Prisma | - |
| ストレージ | MinIO（画像） | 9000, 9001 |
| インフラ | Docker Compose | - |

---

## 3. ディレクトリ構造

```
.
├── frontend/                 # 公開サイト（Next.js 15）
│   ├── src/app/
│   │   ├── (public)/        # 公開ページ: /, /blog, /concerts など
│   │   └── (admin)/         # 簡易管理: /admin, /admin/members, /admin/contacts
│   ├── src/lib/api.ts       # API クライアント（openapi-fetch）、getToken/setToken/clearToken
│   └── src/generated/       # openapi から生成した型
│
├── admin-console/            # 本番管理コンソール（Next.js 15、basePath: /admin）
│   ├── src/app/              # ブログ・演奏会・略歴・ディスコ等の CRUD（port 3001）
│   └── next.config.ts        # basePath: '/admin' 必須
│
├── backend/
│   ├── src/
│   │   ├── index.ts         # エントリーポイント
│   │   ├── app.ts           # Express アプリ（Stripe webhook は json 前の raw 必須）
│   │   ├── lib/prisma.ts    # Prisma シングルトン
│   │   ├── middleware/      # auth.ts, requireRole.ts
│   │   ├── routes/          # auth, concerts, discography, biography, blog, members, contact, stripe, admin
│   │   └── __tests__/       # Vitest テスト（routes/*.test.ts）
│   └── prisma/
│       ├── schema.prisma    # DB スキーマ（単一の真実の源）
│       └── migrations/
│
├── nginx/                    # 本番リバースプロキシ
├── openapi.yml               # API 契約（単一の真実の源、snake_case）
├── docker-compose.yml        # 開発用
├── docker-compose.prod.yml   # 本番用
├── .github/workflows/        # CI/CD
│   └── deploy.yml            # production push → VPS デプロイ
├── .env.example
├── CLAUDE.md                 # Claude 用ガイド
└── docs/
    ├── design_guide.md       # デザインガイドライン
    ├── deployment-setup.md   # 本番デプロイ手順
    └── external-services-setup.md # 外部サービス設定
```

---

## 4. 開発コマンド

### 全サービス起動

```bash
cp .env.example .env   # 事前に認証情報を入力
docker-compose up --build
```

### 個別起動

| 対象 | コマンド |
|------|----------|
| Frontend | `cd frontend && npm run dev` |
| Admin Console | `cd admin-console && npm run dev` |
| Backend | `cd backend && npm run dev` |
| Lint (Frontend) | `cd frontend && npm run lint` |
| Prisma マイグレーション | `cd backend && npm run prisma:migrate` |
| テスト (Backend) | `cd backend && npm run test` |

---

## 5. ブランチ管理・CI/CD

### ブランチ戦略

| ブランチ | 用途 |
|---------|------|
| `main` | 開発用。日常の実装・修正はここで行う |
| `production` | 本番デプロイ用。**main から PR をマージ**すると **自動デプロイがトリガー** される（直接 push はプロテクションで禁止） |

### フロー

```
main で開発・コミット
    → main を production へ PR でマージ
    → GitHub Actions 起動
    → VPS 上で docker compose up --build -d
```

### デプロイ手順

```bash
# main を push 後、main → production の PR を作成してマージ
git push origin main
gh pr create --base production --head main --title "Deploy: <要約>"
# GitHub Web UI または gh pr merge でマージ
```

**注意**: production にはブランチプロテクションが設定されているため、直接 `git push origin production` はできない。必ず PR 経由でマージすること。

初回のみ `git checkout -b production && git push -u origin production` で production ブランチを作成（その後プロテクションを設定）。

### CI/CD 構成（`.github/workflows/deploy.yml`）

| 項目 | 内容 |
|------|------|
| トリガー | `push` が `production` ブランチに発生したとき |
| Runner | **self-hosted**（VPS 上の `deploy` ユーザーで稼働） |
| タイムアウト | 15分 |

### ジョブのステップ

1. **Pull latest code** — `~/masashienokida_hp` で `git fetch` → `checkout production` → `reset --hard origin/production`
2. **Generate .env from secrets** — GitHub Secrets の値を `.env` に展開（本番環境変数は Secrets で管理）
3. **Deploy with Docker Compose** — `docker compose -f docker-compose.prod.yml up --build -d` → nginx 再起動
4. **Clean up old images** — `docker image prune -f`
5. **Health check** — `curl -sf http://localhost/health` で死活確認

### 注意事項

- **GitHub Secrets** に本番用の環境変数（`POSTGRES_*`, `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_*`, `STRIPE_*`, `SMTP_*`, `MINIO_*`, `NEXT_PUBLIC_API_URL`, `FRONTEND_URL`, `ADMIN_CONSOLE_URL`, `ADMIN_EMAILS`）が登録されていること
- self-hosted runner は VPS 上で `~/masashienokida_hp` をクローン済みであること
- 本ワークフローには **lint / テストステップは含まれていない**。必要なら main への push で別ワークフローを追加する

### ロールバック

```bash
ssh root@<VPS_IP>
su - deploy
cd ~/masashienokida_hp
git log --oneline -5
git reset --hard <commit-hash>
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml restart nginx
```

詳細は `docs/deployment-setup.md` を参照。

---

## 6. アーキテクチャ

### データフロー

| 機能 | フロー |
|------|--------|
| **認証** | Browser → `GET /auth/google` → Google → `GET /auth/google/callback` → JWT 発行 → `FRONTEND_URL/auth/callback?token=<jwt>` → localStorage |
| **ブログ** | Browser → `GET /blog` or `/blog/:id` → PostgreSQL → members_only は `isLocked` / `content: null` でゲート |
| **決済** | Browser → `POST /stripe/checkout` → Stripe Checkout → Webhook `POST /stripe/webhook` → users.role を MEMBER_GOLD に更新 |
| **お問い合わせ** | Browser → `POST /contact`（5回/時/IP 制限）→ PostgreSQL + nodemailer 通知 |

### 本番 nginx ルーティング

| パス | 転送先 |
|------|--------|
| `/` | frontend:3000 |
| `/admin` | admin-console:3001 |
| `/api/` | backend:4000（`/api/` プレフィックス除去） |
| `/storage/` | minio:9000 |
| `/health` | backend:4000/health |

### フロントエンド設計

- **動的データは全てクライアントサイド取得**
- ページは `'use client'` コンポーネント
- API 呼び出しは `frontend/src/lib/api.ts` 経由（Bearer トークン自動付与）

---

## 7. データベース・API

### スキーマ（Prisma）

- **ソース**: `backend/prisma/schema.prisma`
- **マイグレーション**: `backend/prisma/migrations/`
- コンテナ起動時に `prisma migrate deploy` が自動実行される

主要モデル: `User`, `Session`, `Subscription`, `Contact`, `Concert`, `Discography`, `Biography`, `BlogPost`, `BlogCategory`, `RateLimit`

### API

- **契約定義**: `openapi.yml`（スキーマ・リクエスト/レスポンス形状）
- Prisma は camelCase、API は **snake_case** で応答（ルートで明示的にマッピング）
- 型生成: `frontend/src/generated/api.d.ts`, `admin-console/src/generated/api.d.ts`

---

## 8. シングルソースオブトゥルース

変更時は以下のファイルを**必ず**参照・更新すること。他に定義を書かない。

| 対象 | ファイル | 役割 |
|------|---------|------|
| **DB スキーマ** | `backend/prisma/schema.prisma` | テーブル・カラム・リレーションの正。マイグレーションは `prisma/migrate` で生成 |
| **API 契約** | `openapi.yml` | エンドポイント・リクエスト/レスポンス形状の正。snake_case。ルート実装はここに従う |
| **UI デザイン** | `docs/design_guide.md` | カラー・フォント・余白・ボタン等の正。Tailwind 設定やコンポーネントはここに従う |

編集の流れ:
- DB 変更 → `schema.prisma` 編集 → マイグレーション作成
- API 変更 → `openapi.yml` 編集 → ルート実装 → 型再生成（`npm run generate` など）
- UI 変更 → `design_guide.md` に合わせてスタイル適用

---

## 9. テスト

### 対象

バックエンドに **Vitest** による API ルートのテストが存在する。

| 場所 | 内容 |
|------|------|
| `backend/src/__tests__/routes/` | auth, blog, concerts, contact, discography, biography, members, admin, stripe, health |
| `backend/src/__tests__/setup.ts` | テスト初期化 |
| `backend/src/__tests__/mocks/prisma.ts` | Prisma モック |
| `backend/src/__tests__/utils/` | openApiValidator, testAuth |

### コマンド

| コマンド | 説明 |
|----------|------|
| `cd backend && npm run test` | テスト実行（1回） |
| `cd backend && npm run test:watch` | ウォッチモード |
| `cd backend && npm run test:coverage` | カバレッジ付き実行 |

### 注意

- **CI にはテストステップは含まれていない**。`deploy.yml` は production push 時のデプロイのみ行う。main でテストを回したい場合は別ワークフローを追加する
- フロントエンド・admin-console には現状テストはない

---

## 10. 外部依存サービス

本番・開発で利用する外部サービスとその用途。認証情報・設定手順は `docs/external-services-setup.md` を参照。

| サービス | 用途 | 必須 |
|---------|------|:----:|
| **Google Cloud（OAuth 2.0）** | ユーザー認証（ログイン） | ○ |
| **Stripe** | 決済（MEMBER_GOLD 年額 ¥3,000）、サブスクリプション管理 | ○ |
| **SMTP（Gmail 等）** | お問い合わせ通知、メール送信 | ○ |
| **Let's Encrypt** | 本番 HTTPS 証明書 | 本番のみ |
| **GitHub** | リポジトリ、Actions（CI/CD）、Secrets | ○ |
| **VPS（XServer 等）** | 本番ホスト、self-hosted runner | 本番のみ |
| **MinIO** | 画像ストレージ（Docker 内で完結、S3 互換） | ○ |

### 外部サービス連携の前提

- Google OAuth: リダイレクト URI を環境（localhost / 本番ドメイン）ごとに GCP に登録する必要あり
- Stripe: Webhook エンドポイントと署名シークレットを環境ごとに設定。ローカル開発では Stripe CLI の `stripe listen` 使用
- SMTP: Gmail の場合はアプリパスワードが必要（2段階認証必須）

---

## 11. 認証・権限

### ロール（`backend/src/middleware/requireRole.ts`）

| ロール | ランク | 説明 |
|-------|--------|------|
| USER | 0 | 認証済み、未加入 |
| MEMBER_FREE | 1 | 無料会員 |
| MEMBER_GOLD | 2 | 有料会員（年額 ¥3,000） |
| ADMIN | 99 | 管理者 |

- `requireAuth`: 未認証 → 401
- `requireRole(...roles)`: ランク不足 → 403

### ADMIN 昇格

`ADMIN_EMAILS`（カンマ区切り）に含まれる Gmail で管理コンソールにログインすると自動的に ADMIN になる。

---

## 12. デザインシステム

**コンセプト**: ミニマルで洗練されたエレガンス（明朝体、ボルドー系）

| 要素 | 値 |
|------|-----|
| 背景 | `#1a0a0a`（Primary）, `#2d1616`（Burgundy）, `#3d2020`（Light Burgundy） |
| テキスト | `#ffffff`（見出し）, `#d4c4b0`（本文）, `#9b8b7e`（補足） |
| アクセント | `#8b4545`（Muted Burgundy） |
| ボーダー | `#4a2828` |
| フォント | `"Noto Serif JP", "游明朝", "Yu Mincho", serif` |
| セクション余白 | PC: 120px / SP: 80px |
| コンテナ幅 | max-width: 1200px |
| ボタン | メイン: `border-radius: 9999px` / サブ: `2px` |
| 画像 | `brightness: 0.8` でトーン調整、ホバー時 `1.0` |

詳細は `docs/design_guide.md` を参照。

---

## 13. 環境変数

`.env.example` をコピーして `.env` を作成。主要グループ:

| カテゴリ | 変数例 | 備考 |
|---------|--------|------|
| DB | `POSTGRES_*`, `DATABASE_URL` | ホスト名は Docker 内で `db` |
| JWT | `JWT_SECRET` | 32文字以上 |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | |
| Stripe | `STRIPE_*`, `STRIPE_GOLD_PRICE_ID` | Price ID を使用（Product ID ではない） |
| SMTP | `SMTP_*`, `MAIL_FROM`, `ADMIN_EMAIL` | |
| MinIO | `MINIO_*`, `MINIO_PUBLIC_URL` | ブラウザからアクセスする URL |
| Admin | `ADMIN_EMAILS` | カンマ区切り Gmail |
| App | `NEXT_PUBLIC_API_URL` | **ブラウザからアクセスする URL**（`http://localhost:4000`）。`http://backend:4000` は不可 |
| App | `FRONTEND_URL`, `ADMIN_CONSOLE_URL` | CORS・OAuth リダイレクト用 |

---

## 14. 実装上の注意事項（AI向け）

以下を守らないと頻発するバグや混乱の原因になる。

### 必須ルール

1. **`NEXT_PUBLIC_API_URL`**
   - ブラウザが直接アクセスするため `http://localhost:4000`（開発）または `https://<ドメイン>/api`（本番）
   - Docker 内部名 `http://backend:4000` はブラウザからは到達不可

2. **OAuth コールバック**
   - ページ内で `useSearchParams()` を使う場合、Next.js 15 では `<Suspense>` でラップする

3. **Stripe Webhook**
   - `express.raw({ type: 'application/json' })` を `express.json()` の**前**にマウントする（`app.ts` 参照）

4. **API のフィールド名**
   - Prisma: camelCase / API レスポンス: snake_case
   - ルート実装で変換する。`openapi.yml` のスキーマを参照

5. **ブログ members_only**
   - 未認証・非会員には `isLocked: true` と `content: null` を返す

6. **本番 admin-console**
   - `next.config.ts` に `basePath: '/admin'` 必須
   - Dockerfile.prod で `ARG NEXT_PUBLIC_API_URL` を `RUN npm run build` の**前**に設定

7. **本番 nginx**
   - `/api/` で backend にプロキシ。`/api` プレフィックスは除去されて転送される

### 編集時の参照順

[8. シングルソースオブトゥルース](#8-シングルソースオブトゥルース) に従う:

1. DB スキーマ変更 → `backend/prisma/schema.prisma` → マイグレーション作成
2. API 変更 → `openapi.yml` 更新 → ルート実装 → 型再生成
3. UI 変更 → `docs/design_guide.md` のカラー・タイポグラフィに従う

### デプロイ

- `production` ブランチへの push で GitHub Actions（self-hosted runner）が VPS へデプロイ
- 詳細は [5. ブランチ管理・CI/CD](#5-ブランチ管理cicd) および `docs/deployment-setup.md`

---

## 15. 参照ドキュメント

| ファイル | 内容 |
|---------|------|
| `CLAUDE.md` | Claude 用プロジェクトガイド |
| `docs/design_guide.md` | デザインガイドライン |
| `docs/deployment-setup.md` | 本番デプロイ構築手順 |
| `docs/external-services-setup.md` | Google OAuth / Stripe / SMTP 設定 |
| `.env.example` | 環境変数一覧 |
