# 外部サービス セットアップ手順書

本プロジェクトが依存する外部サービス（Google OAuth、Stripe、Email）のセットアップ手順を記載する。

---

## 目次

1. [Google OAuth 2.0](#1-google-oauth-20)
2. [Stripe（決済）](#2-stripe決済)
3. [Email（SMTP / Gmail）](#3-emailsmtp--gmail)
4. [環境変数一覧](#4-環境変数一覧)

---

## 1. Google OAuth 2.0

ユーザー認証に Google OAuth 2.0 を使用する。ログイン後、サーバー側で JWT を発行しフロントエンドに返す。

### 1-1. Google Cloud プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名を入力（例: `masashi-enokida-hp`）して作成

### 1-2. OAuth 同意画面の設定

1. 左メニュー「API とサービス」→「OAuth 同意画面」
2. User Type: **外部** を選択
3. 以下を入力:
   - アプリ名: `榎田まさし 公式サイト`
   - ユーザーサポートメール: 管理者メールアドレス
   - デベロッパー連絡先: 管理者メールアドレス
4. スコープの追加:
   - `email`
   - `profile`
   - `openid`
5. テストユーザー: 開発中はテストユーザーのメールアドレスを追加（本番公開前に「公開」ステータスに変更する）

### 1-3. OAuth クライアント ID の作成

1. 左メニュー「API とサービス」→「認証情報」
2. 「認証情報を作成」→「OAuth クライアント ID」
3. アプリケーションの種類: **ウェブアプリケーション**
4. 名前: 任意（例: `enokida-hp-web`）
5. **承認済みのリダイレクト URI** に以下を追加:

| 環境 | リダイレクト URI |
|------|-----------------|
| ローカル開発（フロント） | `http://localhost:4000/auth/google/callback` |
| ローカル開発（管理コンソール） | `http://localhost:4000/auth/admin/google/callback` |
| 本番（フロント） | `https://api.your-domain.com/auth/google/callback` |
| 本番（管理コンソール） | `https://api.your-domain.com/auth/admin/google/callback` |

6. 「作成」をクリック
7. 表示される **クライアント ID** と **クライアント シークレット** を控える

### 1-4. 環境変数の設定

```
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
ADMIN_CONSOLE_GOOGLE_CALLBACK_URL=http://localhost:4000/auth/admin/google/callback
```

### 1-5. 動作確認

1. `docker-compose up --build` でサーバーを起動
2. ブラウザで `http://localhost:4000/auth/google` にアクセス
3. Google のログイン画面にリダイレクトされることを確認
4. ログイン後、`http://localhost:3000/auth/callback?token=...` にリダイレクトされれば成功

### 1-6. 本番公開時の注意

- OAuth 同意画面のステータスを「テスト」→「本番」に変更する
- 機密性の高いスコープを使っていない場合、Google の審査は不要
- リダイレクト URI を本番ドメインに合わせて追加する

---

## 2. Stripe（決済）

MEMBER_GOLD サブスクリプション（年額 ¥3,000）の決済に Stripe を使用する。

### 2-1. Stripe アカウントの作成

1. [Stripe Dashboard](https://dashboard.stripe.com/) にアクセスしてアカウントを作成
2. ビジネス情報を入力して本人確認を完了する（テストモードは即時利用可能）

### 2-2. API キーの取得

1. Dashboard 左下の「テストモード」トグルが有効になっていることを確認
2. 「開発者」→「API キー」に移動
3. 以下のキーを控える:
   - **公開可能キー** (`pk_test_...`)
   - **シークレットキー** (`sk_test_...`)

### 2-3. サブスクリプション商品の作成

1. Dashboard →「商品カタログ」→「商品を追加」
2. 以下を入力:
   - 商品名: `ゴールド会員`
   - 説明: `年額サブスクリプション`
3. 「料金を追加」:
   - 料金モデル: **定額**
   - 金額: **¥3,000**
   - 請求期間: **年次**
4. 「商品を保存」をクリック

### 2-3a. Price ID の確認

商品を作成すると **Product ID** (`prod_...`) と **Price ID** (`price_...`) の2つが自動生成される。本プロジェクトで必要なのは **Price ID** のほう。

> Product ID は商品の識別子、Price ID はその商品に紐づく「料金プラン」の識別子。
> Stripe の Checkout Session は Price ID を指定して決済を開始する。

**Price ID の見つけ方:**

1. Dashboard →「商品カタログ」→ 作成した商品（ゴールド会員）をクリック
2. 商品詳細ページの「料金」セクションに料金の一覧が表示される
3. 該当の料金行（¥3,000 / 年）を **クリック** して料金の詳細ページを開く
4. ページ右上、または右側の「Details」セクションに **Price ID** (`price_...`) が表示される

※ 商品詳細ページの右側に表示されるのは **Product ID** (`prod_...`) であり、Price ID ではないので注意

### 2-4. Webhook の設定

#### ローカル開発（Stripe CLI を使用）

1. [Stripe CLI](https://stripe.com/docs/stripe-cli) をインストール:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# その他: https://stripe.com/docs/stripe-cli#install
```

2. Stripe にログイン:

```bash
stripe login
```

3. Webhook のフォワードを開始:

```bash
stripe listen --forward-to localhost:4000/stripe/webhook
```

4. 出力される **webhook signing secret** (`whsec_...`) を控える

#### 本番環境

1. Dashboard →「開発者」→「Webhook」→「エンドポイントを追加」
2. エンドポイント URL: `https://api.your-domain.com/stripe/webhook`
3. リッスンするイベント:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 作成後に表示される **署名シークレット** (`whsec_...`) を控える

### 2-5. 環境変数の設定

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
STRIPE_GOLD_PRICE_ID=price_xxxxxxxx
```

### 2-6. 動作確認

1. Stripe CLI の listen を起動した状態でサーバーを起動
2. ログイン後、サポーターページからチェックアウトを実行
3. Stripe テストカード番号 `4242 4242 4242 4242`（有効期限: 任意の未来日、CVC: 任意3桁）で決済
4. Webhook が受信され、ユーザーのロールが `MEMBER_GOLD` に更新されることを確認
5. ポータル URL（`/stripe/portal`）でサブスクリプション管理画面にアクセスできることを確認

### 2-7. 本番切り替え時の注意

- Dashboard で「テストモード」を無効にし、本番 API キーを取得
- 環境変数を `sk_live_...` / `pk_live_...` に差し替え
- Webhook エンドポイントを本番 URL で新規作成
- `STRIPE_GOLD_PRICE_ID` は本番環境用に商品を再作成して新しい Price ID を使用

---

## 3. Email（SMTP / Gmail）

お問い合わせ通知、ウェルカムメール、ニュース通知などに nodemailer + SMTP を使用する。
以下は Gmail を SMTP サーバーとして使う場合の手順。

### 3-1. Gmail アプリパスワードの生成

> Gmail のアプリパスワードを使用するには、Google アカウントで **2段階認証** が有効になっている必要がある。

1. [Google アカウント管理](https://myaccount.google.com/) にアクセス
2. 「セキュリティ」→「2段階認証プロセス」が有効であることを確認
3. 「セキュリティ」→ 検索バーで「アプリパスワード」を検索、またはアクセス:
   https://myaccount.google.com/apppasswords
4. アプリ名を入力（例: `enokida-hp`）
5. 「作成」をクリック
6. 表示される **16文字のアプリパスワード** を控える（スペースは除去して使用）

### 3-2. 環境変数の設定

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
MAIL_FROM=noreply@masashi-enokida.com
ADMIN_EMAIL=admin@masashi-enokida.com
```

| 変数 | 説明 |
|------|------|
| `SMTP_HOST` | SMTP サーバーのホスト名。Gmail の場合は `smtp.gmail.com` |
| `SMTP_PORT` | SMTP ポート番号。`587`（STARTTLS）または `465`（SSL） |
| `SMTP_USER` | SMTP 認証に使う Gmail アドレス |
| `SMTP_PASS` | 上記で生成したアプリパスワード |
| `MAIL_FROM` | 送信元アドレス（表示名用。Gmail では実際の送信元は `SMTP_USER` になる） |
| `ADMIN_EMAIL` | お問い合わせ通知・ゴールド会員登録通知の送信先 |

### 3-3. Gmail 以外の SMTP を使う場合

| サービス | SMTP_HOST | SMTP_PORT | 備考 |
|---------|-----------|-----------|------|
| Gmail | `smtp.gmail.com` | 587 | アプリパスワード必要 |
| Amazon SES | `email-smtp.ap-northeast-1.amazonaws.com` | 587 | IAM ユーザーの SMTP 認証情報 |
| SendGrid | `smtp.sendgrid.net` | 587 | API キーを `SMTP_PASS` に設定 |
| Mailgun | `smtp.mailgun.org` | 587 | ドメイン認証が必要 |

### 3-4. 動作確認

1. サーバーを起動
2. お問い合わせフォーム（`/contact`）からテスト送信
3. `ADMIN_EMAIL` に通知メールが届くことを確認
4. 送信者（`SMTP_USER`）のメール送信済みフォルダに送信メールが残ることを確認

### 3-5. 本番運用時の注意

- Gmail の送信上限は **1日500通**（Google Workspace は2,000通）。大量送信が必要な場合は Amazon SES や SendGrid の利用を推奨
- `MAIL_FROM` に独自ドメインを設定しても、Gmail SMTP では実際の送信元は `SMTP_USER` のアドレスになる。独自ドメインからの送信が必要な場合は Gmail のエイリアス設定または他の SMTP サービスを使用
- SPF / DKIM / DMARC の DNS レコードを設定して、メールの到達率を上げる

---

## 4. 環境変数一覧

すべてのサービス関連の環境変数をまとめる。`.env.example` をコピーして `.env` を作成し、各値を設定する。

```bash
cp .env.example .env
```

| カテゴリ | 変数名 | 必須 | 説明 |
|---------|--------|:----:|------|
| **Google OAuth** | `GOOGLE_CLIENT_ID` | ○ | OAuth クライアント ID |
| | `GOOGLE_CLIENT_SECRET` | ○ | OAuth クライアント シークレット |
| | `GOOGLE_CALLBACK_URL` | ○ | フロント用コールバック URL |
| | `ADMIN_CONSOLE_GOOGLE_CALLBACK_URL` | ○ | 管理コンソール用コールバック URL |
| **Stripe** | `STRIPE_SECRET_KEY` | ○ | Stripe シークレットキー |
| | `STRIPE_PUBLISHABLE_KEY` | ○ | Stripe 公開可能キー |
| | `STRIPE_WEBHOOK_SECRET` | ○ | Webhook 署名検証シークレット |
| | `STRIPE_GOLD_PRICE_ID` | ○ | ゴールド会員の Price ID |
| **Email** | `SMTP_HOST` | ○ | SMTP サーバーホスト |
| | `SMTP_PORT` | ○ | SMTP ポート番号 |
| | `SMTP_USER` | ○ | SMTP 認証ユーザー |
| | `SMTP_PASS` | ○ | SMTP 認証パスワード |
| | `MAIL_FROM` | ○ | 送信元メールアドレス |
| | `ADMIN_EMAIL` | ○ | 管理者通知先メールアドレス |
