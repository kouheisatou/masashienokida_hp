# 本番デプロイ セットアップ手順書

`production` ブランチへの push をトリガーに、GitHub Actions (self-hosted runner) で VPS に自動デプロイする仕組みの構築手順。

---

## 目次

1. [全体構成](#1-全体構成)
2. [VPS 初期セットアップ（手作業）](#2-vps-初期セットアップ手作業)
3. [GitHub Actions self-hosted runner の導入（Claude に指示）](#3-github-actions-self-hosted-runner-の導入claude-に指示)
4. [本番用ファイルの作成（Claude に指示）](#4-本番用ファイルの作成claude-に指示)
5. [GitHub Secrets の登録（Claude に指示）](#5-github-secrets-の登録claude-に指示)
6. [外部サービスの本番設定（手作業）](#6-外部サービスの本番設定手作業)
7. [デプロイの実行と確認](#7-デプロイの実行と確認)
8. [HTTPS（Let's Encrypt）対応](#8-httpslets-encrypt対応)
9. [トラブルシューティング](#9-トラブルシューティング)

---

## 1. 全体構成

```
開発者 → main ブランチで開発
       → main を production にマージ & push
       → GitHub Actions がトリガー
       → VPS 上の self-hosted runner が実行
       → docker compose up --build -d
       → nginx (80) → frontend / admin-console / backend / minio
```

### 本番のコンテナ構成

| コンテナ | ポート（内部） | 役割 |
|---------|-------------|------|
| nginx | 80（外部公開） | リバースプロキシ |
| frontend | 3000 | Next.js サイト |
| admin-console | 3001 | 管理コンソール（Next.js） |
| backend | 4000 | Express API |
| db | 5432 | PostgreSQL 16 |
| minio | 9000 | オブジェクトストレージ |

### nginx ルーティング

| パス | 転送先 |
|------|--------|
| `/` | frontend:3000 |
| `/admin` | admin-console:3001 |
| `/api/` | backend:4000（`/api/` プレフィックス除去） |
| `/storage/` | minio:9000 |
| `/health` | backend:4000/health |

---

## 2. VPS 初期セットアップ（手作業）

VPS プロバイダでサーバーを契約した直後に行う作業。

### 2-1. XServer VPS のパケットフィルター設定

1. XServer VPS 管理パネルにログイン
2. 対象サーバーの「パケットフィルター設定」を開く
3. 以下のポートを **許可** に設定:

| ポート | 用途 |
|--------|------|
| 22 | SSH |
| 80 | HTTP（nginx → HTTPS リダイレクト） |
| 443 | HTTPS（Let's Encrypt） |

> **重要**: デフォルトではポート 80 がブロックされているため、これを開放しないと外部からアクセスできない。

### 2-2. Docker / Docker Compose のインストール

VPS に SSH でログインし、Docker をインストール:

```bash
ssh root@<VPS_IP>

# Docker インストール（Ubuntu/Debian の場合）
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Docker Compose は Docker Engine に同梱済み（docker compose コマンドで利用可能）
docker compose version
```

### 2-3. deploy ユーザーの作成

```bash
# deploy ユーザー作成
useradd -m -s /bin/bash deploy
usermod -aG docker deploy

# パスワード設定（runner インストール時に必要）
passwd deploy
```

### 2-4. リポジトリのクローン

```bash
su - deploy
git clone https://github.com/<owner>/<repo>.git ~/masashienokida_hp
```

---

## 3. GitHub Actions self-hosted runner の導入（Claude に指示）

### Claude への指示内容

> 「VPS（<IP アドレス>）に SSH でログインし、GitHub Actions の self-hosted runner をセットアップして。SSH ユーザーは root、パスワードは <パスワード>。deploy ユーザーで runner を動かして。」

### Claude が実行する作業

1. SSH で VPS にログイン
2. deploy ユーザーのホームに runner をダウンロード・展開
3. `./config.sh` でリポジトリに runner を登録（GitHub の Personal Access Token が必要）
4. systemd サービスとして登録・起動

```bash
# Claude が実行するコマンド（参考）
su - deploy
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.xxx.x.tar.gz -L https://github.com/actions/runner/releases/download/v2.xxx.x/actions-runner-linux-x64-2.xxx.x.tar.gz
tar xzf ./actions-runner-linux-x64-2.xxx.x.tar.gz
./config.sh --url https://github.com/<owner>/<repo> --token <RUNNER_TOKEN>
sudo ./svc.sh install deploy
sudo ./svc.sh start
```

### 確認方法

- GitHub リポジトリ → Settings → Actions → Runners に runner が「Idle」で表示されること

---

## 4. 本番用ファイルの作成（Claude に指示）

### Claude への指示内容

> 「production ブランチへの push で VPS に自動デプロイする仕組みを作って。self-hosted runner を使う。環境変数は GitHub Secrets から .env を生成する方式で。」

### Claude が作成するファイル

| ファイル | 内容 |
|---------|------|
| `backend/Dockerfile.prod` | マルチステージビルド（tsc → node dist/index.js） |
| `frontend/Dockerfile.prod` | マルチステージビルド（next build → next start） |
| `admin-console/Dockerfile.prod` | マルチステージビルド（next build → next start -p 3001） |
| `backend/tsconfig.build.json` | テストファイルを除外するビルド用 tsconfig |
| `docker-compose.prod.yml` | 本番用 Compose（nginx 含む全7サービス） |
| `nginx/nginx.conf` | リバースプロキシ設定 |
| `.github/workflows/deploy.yml` | GitHub Actions ワークフロー |

### 重要なポイント

- **`NEXT_PUBLIC_API_URL` はビルド時に注入が必要**: Dockerfile.prod で `ARG NEXT_PUBLIC_API_URL` / `ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL` を `RUN npm run build` の前に記述すること
- **admin-console の `next.config.ts`** に `basePath: '/admin'` を設定すること
- **backend の Dockerfile.prod** で `npx tsc -p tsconfig.build.json` を使い、テストファイルをビルドから除外すること

---

## 5. GitHub Secrets の登録（Claude に指示）

### Claude への指示内容

> 「gh コマンドで GitHub Secrets を全部登録して。ドメインは <ドメイン名>。」

### Claude が登録するシークレット一覧

| シークレット名 | 値の例 | 備考 |
|--------------|-------|------|
| `POSTGRES_DB` | `enokida_hp` | |
| `POSTGRES_USER` | `enokida` | |
| `POSTGRES_PASSWORD` | （ランダム生成） | |
| `DATABASE_URL` | `postgresql://enokida:<pass>@db:5432/enokida_hp?schema=public` | ホスト名は `db`（Docker内部） |
| `JWT_SECRET` | （32文字以上のランダム文字列） | |
| `GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com` | GCP から取得（手作業で値を提供） |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxx` | GCP から取得（手作業で値を提供） |
| `GOOGLE_CALLBACK_URL` | `http://<ドメイン>/api/auth/google/callback` | `/api/` プレフィックス必須 |
| `STRIPE_SECRET_KEY` | `sk_test_xxxx` | Stripe から取得（手作業で値を提供） |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxx` | Stripe から取得（手作業で値を提供） |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxx` | Stripe から取得（手作業で値を提供） |
| `STRIPE_GOLD_PRICE_ID` | `price_xxxx` | Stripe から取得（手作業で値を提供） |
| `SMTP_HOST` | `smtp.gmail.com` | |
| `SMTP_PORT` | `587` | |
| `SMTP_USER` | （メールアドレス） | 手作業で値を提供 |
| `SMTP_PASS` | （アプリパスワード） | 手作業で値を提供 |
| `MAIL_FROM` | （送信元アドレス） | |
| `ADMIN_EMAIL` | （管理者アドレス） | |
| `MINIO_ENDPOINT` | `http://minio:9000` | Docker 内部ホスト名 |
| `MINIO_ROOT_USER` | `minioadmin` | |
| `MINIO_ROOT_PASSWORD` | （ランダム生成） | |
| `MINIO_BUCKET` | `enokida-hp` | |
| `MINIO_PUBLIC_URL` | `http://<ドメイン>/storage` | |
| `ADMIN_EMAILS` | （管理者 Gmail） | カンマ区切り |
| `NEXT_PUBLIC_API_URL` | `http://<ドメイン>/api` | **末尾に `/api` 必須** |
| `FRONTEND_URL` | `http://<ドメイン>` | |
| `ADMIN_CONSOLE_URL` | `http://<ドメイン>/admin` | |

> Claude がランダム生成できる値（DB パスワード、JWT シークレット等）は自動設定。外部サービスの認証情報は事前に手元に用意しておくこと。

---

## 6. 外部サービスの本番設定（手作業）

### 6-1. GCP — Google OAuth リダイレクト URI の追加

1. [Google Cloud Console](https://console.cloud.google.com/) → API とサービス → 認証情報
2. OAuth 2.0 クライアント ID を開く
3. 「承認済みのリダイレクト URI」に以下を追加:

```
http://<ドメイン>/api/auth/google/callback
http://<ドメイン>/api/auth/admin/google/callback
```

> **注意**: URL には `/api/` プレフィックスが含まれる。ローカル開発時の `localhost:4000/auth/google/callback` とはパスが異なる。

### 6-2. Stripe — Webhook エンドポイントの追加（本番運用時）

1. [Stripe Dashboard](https://dashboard.stripe.com/) → 開発者 → Webhook
2. エンドポイント URL: `http://<ドメイン>/api/stripe/webhook`
3. リッスンするイベント:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 表示される署名シークレット (`whsec_...`) を GitHub Secrets の `STRIPE_WEBHOOK_SECRET` に設定

### 6-3. OAuth 同意画面の公開（本番運用時）

1. GCP → OAuth 同意画面 → ステータスを「テスト」→「本番」に変更
2. テストユーザー以外もログインできるようになる

---

## 7. デプロイの実行と確認

### 初回デプロイ

```bash
# production ブランチを作成して push
git checkout -b production
git push -u origin production
```

### 通常のデプロイ

```bash
# main で開発・コミット後
git checkout production
git merge main
git push origin production

# main に戻る
git checkout main
```

### デプロイの確認

```bash
# GitHub Actions のログを確認
gh run list --branch production --limit 5
gh run view <run-id> --log

# ヘルスチェック
curl -sf http://<ドメイン>/health

# サイトにアクセス
# トップページ:       http://<ドメイン>/
# 管理コンソール:     http://<ドメイン>/admin
# API（ヘルスチェック）: http://<ドメイン>/api/health
```

---

## 8. HTTPS（Let's Encrypt）対応

本番は Let's Encrypt で HTTPS 化済み。初回セットアップは以下の手順で実施。

### 8-1. Certbot のインストールと証明書取得

```bash
# VPS に root で SSH
ssh root@<VPS>

# nginx を一時停止（80 番を空ける）
su - deploy
cd ~/masashienokida_hp && docker compose -f docker-compose.prod.yml stop nginx
exit

# Certbot インストール（Ubuntu/Debian）
apt-get update && apt-get install -y certbot

# 証明書取得（ドメインを指定）
certbot certonly --standalone -d <ドメイン> --non-interactive --agree-tos --email admin@<ドメイン>

# webroot 用ディレクトリ作成（更新時に nginx 停止不要）
mkdir -p /var/www/certbot && chmod 755 /var/www/certbot

# 更新を webroot 方式に切り替え
certbot certonly --webroot -w /var/www/certbot -d <ドメイン> --expand --force-renewal --non-interactive
```

### 8-2. nginx と docker-compose の HTTPS 設定

`nginx/nginx.conf` と `docker-compose.prod.yml` は HTTPS 対応済み。production ブランチへ push 後、VPS で `docker compose up -d nginx` を実行。

### 8-3. GitHub Secrets の更新

HTTPS 化後、以下の Secrets を `https://` に更新すること:

- `GOOGLE_CALLBACK_URL` → `https://<ドメイン>/api/auth/google/callback`
- `FRONTEND_URL` → `https://<ドメイン>`
- `ADMIN_CONSOLE_URL` → `https://<ドメイン>/admin`
- `NEXT_PUBLIC_API_URL` → `https://<ドメイン>/api`
- `MINIO_PUBLIC_URL` → `https://<ドメイン>/storage`
- Stripe Webhook URL → `https://<ドメイン>/api/stripe/webhook`
- GCP 承認済みリダイレクト URI → `https://<ドメイン>/api/auth/google/callback` など

### 8-4. 証明書の自動更新

Certbot の systemd タイマーが有効。`certbot renew --dry-run` で動作確認可能。

---

## 9. トラブルシューティング

### デプロイは成功したがサイトにアクセスできない

- **XServer VPS のパケットフィルター**でポート 80 が許可されているか確認
- VPS 上で `docker ps` してコンテナが全て起動しているか確認

### `/biography` 等のページで JSON が表示される

- nginx が frontend ではなく backend にルーティングしている
- `nginx.conf` で `/api/` プレフィックスが正しく設定されているか確認

### `/admin` が 404 になる

- `admin-console/next.config.ts` に `basePath: '/admin'` が設定されているか確認
- デプロイ後に `docker compose restart nginx` が実行されているか確認

### Google OAuth ログインで `localhost:4000` にリダイレクトされる

- `NEXT_PUBLIC_API_URL` がビルド時に正しく注入されているか確認
- Dockerfile.prod に `ARG NEXT_PUBLIC_API_URL` / `ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL` が `RUN npm run build` の **前** にあるか確認
- GitHub Secrets の `NEXT_PUBLIC_API_URL` が `http://<ドメイン>/api` になっているか確認

### Google OAuth ログイン後にエラー

- GCP の「承認済みリダイレクト URI」に本番 URL（`/api/` プレフィックス付き）が登録されているか確認
- GitHub Secrets の `GOOGLE_CALLBACK_URL` が `http://<ドメイン>/api/auth/google/callback` になっているか確認

### VPS 上でのログ確認

```bash
ssh root@<VPS_IP>
su - deploy
cd ~/masashienokida_hp

# 全コンテナのログ
docker compose -f docker-compose.prod.yml logs

# 特定コンテナのログ
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs nginx

# リアルタイムログ
docker compose -f docker-compose.prod.yml logs -f backend
```

### ロールバック

```bash
ssh root@<VPS_IP>
su - deploy
cd ~/masashienokida_hp

# 直前のコミットに戻す
git log --oneline -5          # 戻したいコミットを確認
git reset --hard <commit-hash>
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml restart nginx
```
