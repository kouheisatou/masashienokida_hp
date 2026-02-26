# 外部サービス一覧とセットアップガイド

本プロジェクトが依存する**外部サービス**（自社インフラ外）と、それぞれのセットアップ手順をまとめます。

---

## 構成の整理

| 種別 | サービス | 備考 |
|------|---------|------|
| **インフラ（docker-compose内）** | PostgreSQL | 外部依存ではない。`docker-compose up` で起動 |
| **外部サービス** | Google OAuth 2.0 | 認証（必須） |
| **外部サービス** | Stripe | 会員課金（必須） |
| **外部サービス** | SMTP メール | お問い合わせ通知（外部依存、下記参照） |

---

## 依存している外部サービス一覧

| サービス | 用途 | 必須度 |
|---------|------|--------|
| **Google OAuth 2.0** | 認証（フロント・管理者） | 必須 |
| **Stripe** | 会員課金（MEMBER_GOLD 年額¥3,000） | 必須 |
| **SMTP メール** | お問い合わせ通知・自動返信 | 推奨* |

\* メールは未設定でもお問い合わせの保存は可能。通知送信のみ失敗する。

**メール送信の外部依存について:**  
`backend/src/utils/email.ts` は nodemailer の SMTP トランスポートを使用しており、**必ず外部の SMTP サーバー**（Gmail, SendGrid, Mailgun, Amazon SES など）に接続します。docker-compose にメールサーバー（MailHog 等）は含まれていないため、実際にメールを送信するには外部の SMTP サービスが必須です。未設定の場合は `sendMail` 呼び出し時にエラーになるが、contact ルートでは `.catch()` で握りつぶすためアプリは動作継続し、DB への保存は完了します。

---

## 1. PostgreSQL（docker-compose 内・外部依存ではない）

### 概要
- プライマリデータベース。docker-compose で提供。
- Prisma ORM 経由でアクセス
- `docker-compose up` で `db` コンテナが起動

### セットアップ

`.env` に以下を設定（Docker 内のサービス名 `db` をホストとして使用）：

```
POSTGRES_DB=enokida_hp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
DATABASE_URL=postgresql://postgres:changeme@db:5432/enokida_hp
```

```bash
# マイグレーション適用（backend コンテナ起動時に自動実行される場合もある）
cd backend && npm run prisma:migrate

# シード実行（初期管理者など）
npm run prisma:seed
```

---

## 2. Google OAuth 2.0

### 概要
- フロント（メンバーサイト）と管理者コンソールの両方でログインに使用
- コールバックURL が2種類必要

### セットアップ

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. **APIとサービス > 認証情報** を開く
4. **認証情報を作成 > OAuth クライアント ID** を選択
5. アプリケーションの種類: **ウェブアプリケーション**
6. **承認済みのリダイレクト URI** に以下を追加：

   | 用途 | URI |
   |------|-----|
   | メンバーサイト | `http://localhost:4000/auth/google/callback` |
   | 管理者コンソール | `http://localhost:4000/auth/admin/google/callback` |

7. 本番環境では `https://your-domain.com/auth/google/callback` などに差し替え
8. 発行された **クライアントID** と **クライアントシークレット** をコピー

### `.env` 設定例

```
GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
ADMIN_CONSOLE_GOOGLE_CALLBACK_URL=http://localhost:4000/auth/admin/google/callback
```

### 管理者権限の付与
初回ログインで `ADMIN` にするには、`backend/prisma/seed.ts` で対象メールアドレスを `ADMIN` として登録し、`npm run prisma:seed` を実行する。

---

## 3. Stripe

### 概要
- 会員課金（MEMBER_GOLD: 年額 ¥3,000）
- Stripe Checkout、顧客ポータル、Webhook を使用

### セットアップ

1. [Stripe ダッシュボード](https://dashboard.stripe.com/) に登録
2. **開発者 > APIキー** でキーを取得
   - テスト用: `sk_test_xxx` / `pk_test_xxx`
   - 本番用: `sk_live_xxx` / `pk_live_xxx`

3. **商品 > 商品を追加** で定期課金商品を作成
   - 例: 「ゴールド会員 年額」¥3,000/年
   - 価格ID（`price_xxx`）をコピー

4. **開発者 > Webhook** で Webhook を追加
   - エンドポイント: `https://your-backend.com/stripe/webhook`（ローカルは `stripe listen` で一時URL取得）
   - イベント:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - **署名シークレット**（`whsec_xxx`）をコピー

### ローカル開発時の Webhook テスト

```bash
stripe listen --forward-to localhost:4000/stripe/webhook
```

表示される `whsec_xxx` を `STRIPE_WEBHOOK_SECRET` に設定。

### `.env` 設定例

```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_GOLD_PRICE_ID=price_xxx
```

### 本番環境
- 本番キー・本番価格・本番 Webhook に切り替え
- Webhook のエンドポイントを本番バックエンドURLに変更

---

## 4. SMTP メール（nodemailer）※外部依存

### 概要
- お問い合わせフォーム:
  - 管理者への通知メール
  - 送信者への自動返信メール
- **外部依存:** nodemailer は SMTP で外部サーバー（Gmail, SendGrid 等）に接続する。docker-compose にメールサーバーは含まれていない
- 任意の SMTP 対応の外部サービスを利用可能

### 対応サービス例

| サービス | ホスト | ポート | 備考 |
|---------|--------|--------|------|
| Gmail | smtp.gmail.com | 587 (TLS) | アプリパスワード必須 |
| SendGrid | smtp.sendgrid.net | 587 | APIキーをSMTPパスワードに |
| Mailgun | smtp.mailgun.org | 587 | ドメイン設定済みのもの |
| Amazon SES | email-smtp.xxx.amazonaws.com | 587 | リージョンによりホストが異なる |

### Gmail のセットアップ例

1. Google アカウントで [2段階認証](https://myaccount.google.com/security) を有効化
2. [アプリパスワード](https://myaccount.google.com/apppasswords) を生成
3. 16文字のパスワードを `SMTP_PASS` に設定

### `.env` 設定例

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
MAIL_FROM=noreply@masashi-enokida.com
ADMIN_EMAIL=admin@masashi-enokida.com
```

- `MAIL_FROM`: 送信元として表示されるアドレス
- `ADMIN_EMAIL`: お問い合わせ通知の送信先。未設定なら通知は送られない

---

## 5. その他（外部サービスではないが必須）

### JWT
- 認証トークンの署名に使用
- 32文字以上のランダム文字列を推奨

```
JWT_SECRET=your-32-plus-character-secret-here-change-this
```

### アプリURL
- ブラウザからアクセスするため、`NEXT_PUBLIC_API_URL` は `http://localhost:4000` を使用（`http://backend:4000` は不可）

```
NEXT_PUBLIC_API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
ADMIN_CONSOLE_URL=http://localhost:3001
```

---

## セットアップチェックリスト

開発環境立ち上げ前に確認：

- [ ] `.env` を `.env.example` からコピーして作成
- [ ] `docker-compose up --build`（PostgreSQL はここで自動起動）
- [ ] Google OAuth の認証情報を作成し、2つのコールバックURLを登録
- [ ] Stripe で商品・価格を作成し、テスト用キーを取得
- [ ] Stripe Webhook を設定（ローカルは `stripe listen` でテスト）
- [ ] SMTP 設定（外部サービスの Gmail 等。Gmail の場合はアプリパスワード）
- [ ] `JWT_SECRET` を32文字以上の値に変更
- [ ] `npm run prisma:migrate` と `npm run prisma:seed` を実行

---

## トラブルシューティング

| 現象 | 確認項目 |
|------|----------|
| OAuth リダイレクトエラー | コールバックURLが Google コンソールと一致しているか |
| Stripe Webhook 署名エラー | `STRIPE_WEBHOOK_SECRET` が正しいか（`stripe listen` 使用時はそのシークレットか） |
| メール送信失敗 | SMTP 認証（特にGmailのアプリパスワード）、ポート587/465 |
| DB接続失敗 | `DATABASE_URL` のホスト（Docker内は `db`、ホストからは `localhost`） |
| CORS エラー | `FRONTEND_URL` / `ADMIN_CONSOLE_URL` が実際のオリジンと一致しているか |
