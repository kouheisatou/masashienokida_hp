# 榎田雅士 オフィシャルウェブサイト

ピアニスト 榎田雅士のオフィシャルウェブサイトです。「劇場のような没入感と、現代的な機能美の融合」をコンセプトにしたゴージャスで洗練されたデザインを採用しています。

## プロジェクト構成

```
masashienokida_hp/
├── backend/          # NestJS + Prisma + OpenAPI
├── frontend/         # Next.js + Tailwind CSS v4
├── docs/            # 設計ドキュメント
└── docker-compose.yml
```

## 技術スタック

### Backend
- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **API**: OpenAPI (Swagger)
- **Authentication**: Google OAuth 2.0, JWT
- **Payment**: Stripe
- **Development**: TDD (Test-Driven Development)

### Frontend
- **Framework**: Next.js 16
- **Styling**: Tailwind CSS v4
- **Fonts**: Zen Kaku Gothic New, Noto Sans JP
- **API Client**: OpenAPI Generator

## 主な機能

### 実装済み機能

#### Backend
- ✅ Prismaスキーマ（全モデル）
  - User（Google OAuth対応、Stripe連携）
  - Post（会員限定フラグ付き）
  - Concert、Discography
  - Biography（日英対応）
  - History（活動履歴）
  - Contact（お問い合わせ）
  - Subscription（サブスクリプション管理）
  - MemberContent（会員限定コンテンツ）

- ✅ 認証・認可
  - Google OAuth 2.0認証
  - JWT認証
  - ロールベースアクセス制御（USER, MEMBER_FREE, MEMBER_GOLD, ADMIN）

- ✅ 決済機能
  - Stripe決済統合
  - サブスクリプション管理
  - Webhookハンドリング

- ✅ RESTful API
  - Biography API
  - History API
  - Contact API
  - Member Content API
  - Posts API（会員限定アクセス制御）

#### Frontend
- ✅ デザインシステム
  - Tailwind CSS v4カスタムテーマ
  - デザインガイドに基づく配色・タイポグラフィ
  - レスポンシブ対応

- ✅ 共通UIコンポーネント
  - Header（グローバルナビゲーション）
  - Footer
  - Button（3種類のバリエーション）
  - Card（ガラスモーフィズム）

- ✅ ページ
  - HOMEページ（ヒーローセクション、最新ニュース、公演情報）

### 予定機能
- ⏳ 残りのページ実装
  - BIOGRAPHY
  - CONCERTS
  - HISTORY
  - DISCOGRAPHY
  - SUPPORTERS
  - BLOG
  - CONTACT

- ⏳ 会員機能
  - ログイン/マイページ
  - 会員限定コンテンツ閲覧

- ⏳ 管理画面
  - ダッシュボード
  - コンテンツ管理（CMS）
  - 会員管理

## セットアップ

### 前提条件
- Node.js 20以上
- Docker & Docker Compose
- Google OAuth認証情報
- Stripe APIキー

### 環境変数設定

ルートディレクトリの`.env`ファイル：
```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=masashienokida_db

# Backend
BACKEND_PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

`backend/.env`ファイル：
```env
DATABASE_URL="postgresql://admin:password@localhost:5432/masashienokida_db?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_PRICE_ID_FREE=price_xxx_free
STRIPE_PRICE_ID_GOLD=price_xxx_gold
```

### インストールと起動

```bash
# データベース起動
docker-compose up -d db

# Backendセットアップ
cd backend
npm install
npx prisma generate
npx prisma db push  # 開発環境の場合

# Backend起動
npm run start:dev

# Frontendセットアップ（別ターミナル）
cd frontend
npm install

# Frontend起動
npm run dev
```

アクセス：
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger UI: http://localhost:3001/api

## デザインガイド

デザインコンセプトや使用する色・フォント・スペーシングについては、`docs/design_guide.md`を参照してください。

### カラーパレット
- **Rich Black**: `#0a0a0a` - メイン背景
- **Deep Red Black**: `#1a0505` - セクション背景
- **Off White**: `#f0f0f0` - テキスト
- **Metallic Gold**: `#d4af37` - アクセント
- **Maroon**: `#800000` - ボタン
- **Dark Gray**: `#2d2d2d` - フッター

### タイポグラフィ
- **フォント**: Zen Kaku Gothic New、Noto Sans JP（ゴシック系統一）
- **H1**: 64px（PC）/ 40px（SP）
- **H2**: 36px（PC）/ 28px（SP）
- **Body**: 16px / 行間 1.8

## ディレクトリ構造

### Backend
```
backend/src/
├── auth/              # 認証モジュール
├── stripe/            # Stripe決済モジュール
├── biography/         # プロフィールモジュール
├── history/           # 活動履歴モジュール
├── contact/           # お問い合わせモジュール
├── member-content/    # 会員限定コンテンツモジュール
├── posts/             # 投稿モジュール
├── concerts/          # コンサートモジュール
└── discography/       # ディスコグラフィモジュール
```

### Frontend
```
frontend/src/
├── app/               # Next.js App Router
│   ├── layout.tsx     # グローバルレイアウト
│   ├── page.tsx       # HOMEページ
│   └── globals.css    # グローバルスタイル
└── components/        # 共通コンポーネント
    ├── Header.tsx
    ├── Footer.tsx
    ├── Button.tsx
    └── Card.tsx
```

## 開発ガイドライン

### Backend開発
- TDD（テスト駆動開発）を採用
- OpenAPIスキーマを先に定義
- Prismaスキーマの変更時は必ずマイグレーション作成

### Frontend開発
- デザインガイドに準拠
- Tailwind CSSのカスタムテーマを使用
- 画像は明度0.8で表示、ホバー時1.0

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル変更
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更
```

## ライセンス

All rights reserved. &copy; 2025 Masashi Enokida
