# セキュリティレビュー報告書 — masashienokida_hp

| 項目 | 値 |
|---|---|
| 実施日 | 2026-04-26 |
| 対象ブランチ / コミット | `main` (HEAD: c5f5806) |
| スコープ | `backend/`, `frontend/`, `admin-console/`, `docker-compose*`, `.github/workflows/`, `prisma/schema.prisma`, `.env.example` |
| 対象外 | 本番 VPS の OS / nginx 実機設定、Cloud SQL/外部 SaaS の内部設定、PoC を本番で実行する攻撃検証 |
| 手法 | コード静的レビュー + `npm audit` + 公開 Advisory リサーチ (2025〜2026) |

---

## 1. エグゼクティブサマリ

| 重大度 | 件数 | 代表的な問題 |
|---|---|---|
| Critical | 1 | localStorage 保存 JWT による XSS → 完全乗っ取り |
| High | 13 | Next.js middleware bypass (CVE-2025-29927)、Stripe webhook idempotency 未実装、依存パッケージの既知 CVE 多数、`trust proxy` 未設定、prod コンテナが root 実行 等 |
| Medium | 12 | 入力検証 (zod) 未使用、JWT 30 日無失効、CSP 不在、MinIO 公開 bucket、PII ログ出力 等 |
| Low | 5 | 空 catch、未使用 Session モデル、JWT_SECRET 長検証なし、`/health` 認証なし 等 |
| Info | 3 | 既存 zod を活用、構造化ログ導入、PKCE 検討 |

**TL;DR**: 大半は侵入経路としてはミドル難度だが、**前段** (依存 CVE のパッチ未適用、`trust proxy` 設定漏れ、`.env.example` の管理者メール漏えい) と **侵入後の被害拡大** (localStorage トークン、JWT 30日無失効、Stripe webhook idempotency なし、root コンテナ) の両面で防御層が薄い。
**最優先で着手すべきは 7 件のクイックウィン (§7)。** 1〜2 営業日で High クラスの大半を畳める。

---

## 2. 脅威モデル

| アクター | 想定攻撃面 |
|---|---|
| 一般ユーザー (非認証) | お問い合わせフォーム濫用 (なりすまし送信、メール爆撃)、ログインなし会員限定記事閲覧、レート制限の偽装、ブログ記事の `javascript:` リンク踏ませ |
| 会員 (`MEMBER_FREE`/`MEMBER_GOLD`) | サブスクリプション昇格バイパス、`/auth/me` 経由の Stripe API 濫用、`DELETE /auth/account` で他人退会 (CSRF) |
| 管理者 (`ADMIN`) | 管理コンソールトークンを XSS で奪取されると全 DB 操作可。`ADMIN_EMAILS` の Gmail アカウントが最大の信頼ベース |
| 外部攻撃者 | OAuth ログイン CSRF、Stripe webhook リプレイ、コンテナ内権限昇格、依存パッケージの ReDoS DoS |
| 内部脅威 (CI / repo 閲覧者) | リポジトリ閲覧者が `.env.example` の実 ADMIN_EMAILS を入手 → 標的型フィッシング |

ADMIN ロールの取得は **「ADMIN_EMAILS に含まれる Gmail アカウントの保有 + Google 2FA 突破」** が必要なため、Google アカウント側のセキュリティに依存している点が現状の最大単一点障害。

---

## 3. 検出された問題

### 3.1 Critical

#### C-01: JWT を localStorage に保存 (XSS で完全乗っ取り)
- **CWE**: CWE-922 (Insecure Storage of Sensitive Information) / **CVSS v3.1 推定**: 8.1 (AV:N/AC:H/PR:N/UI:R/S:C/C:H/I:H/A:N)
- **該当**: `frontend/src/lib/api.ts:7-18`, `admin-console/src/lib/api.ts:6-17`
- **詳細**: フロントと管理コンソールの両方で JWT を `localStorage` 保存。任意の XSS 1 件で 30 日有効のトークンが盗まれ、サーバーは失効リストを持たないため取り消し不可。管理コンソール側のトークン窃取は全ユーザー DB への管理者アクセスを意味する。
- **悪用シナリオ**: ブログ本文の `javascript:` リンク (§3.2 H-04 と複合) や、将来導入する 3rd-party スクリプト経由で `localStorage.getItem('admin_token')` を抜き出し、外部に POST するだけ。
- **推奨修正**:
  1. アクセストークン: メモリ (React Context) のみ
  2. リフレッシュトークン: `httpOnly; Secure; SameSite=Strict` Cookie + サーバー側に Session テーブル (既存 `Session` モデルを活用) で失効可能化
  3. 当面の緩和: 厳格な CSP (`script-src 'self'`) で XSS 経路を縮小 (§3.2 H-13)
- **参考**: [Descope: Developer's Guide to JWT Storage](https://www.descope.com/blog/post/developer-guide-jwt-storage)

---

### 3.2 High

#### H-01: Next.js middleware authorization bypass (CVE-2025-29927)
- **CWE**: CWE-285 / **CVSS**: 9.1
- **該当**: `frontend/package.json` (`"next": "^15.0.0"`), `admin-console/package.json` (`"next": "^15.1.6"`)
- **詳細**: `x-middleware-subrequest` ヘッダで `MAX_RECURSION_DEPTH` を超過させ、middleware 全体を skip 可能。**現状 frontend / admin-console のいずれも `middleware.ts` を持たない** ため実害は限定的だが、将来 middleware で認証や CSP 付与をすると即座に致命傷になる。
- **追加で同一系列**:
  - `GHSA-q4gf-8mx6-v5v3` Server Components による DoS (CVSS 7.5, < 15.5.15)
  - `GHSA-3x4c-7xq6-9pq8` `next/image` ディスクキャッシュ不制限
  - `GHSA-ggv3-7p47-pfv8` rewrites での HTTP request smuggling
- **推奨修正**: `next` を **15.5.15 以降** に更新 (`npm i next@latest` で `15.5.x`)。frontend と admin-console の両方。
- **参考**: [Next.js Security Update 2025-12-11](https://nextjs.org/blog/security-update-2025-12-11), [CVE-2025-29927 解説](https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/)

#### H-02: Stripe webhook に event.id idempotency が無い
- **CWE**: CWE-345 (Insufficient Verification of Data Authenticity) / **CVSS**: 7.5
- **該当**: `backend/src/routes/stripe.ts:204-358` (webhook ハンドラ全体)
- **詳細**: 署名検証 (constructEvent) は実装済だが `event.id` を DB に記録せず、Stripe 公式の **同じイベントが複数回到達する** (リトライ・ネットワーク再送・攻撃者の再送) ケースに対し冪等でない。例: `checkout.session.completed` を 2 回処理すると welcome メールが 2 通飛ぶ・トランザクションが二重に走る・通知が重複する。
- **5 分間タイムスタンプチェック**: Stripe SDK の `constructEvent` は内部で行うため最低限のリプレイ防止はあるが、5 分以内なら同イベントを複数回受領しうる。
- **推奨修正**:
  1. `StripeEvent` テーブル (id PK = `evt_*`) を追加
  2. webhook 受信直後に `INSERT ... ON CONFLICT DO NOTHING` で event.id を記録、重複なら 200 を返してスキップ
- **参考**: [Stripe Webhooks docs](https://docs.stripe.com/webhooks), [Hooklistener 2026 Implementation Guide](https://www.hooklistener.com/learn/stripe-webhooks-implementation)

#### H-03: OAuth `state` が固定文字列 `'admin'` (CSRF 不十分)
- **CWE**: CWE-352 (CSRF) / **CVSS**: 7.4
- **該当**: `backend/src/routes/auth.ts:79-86`, `99-100`, `115`
- **詳細**: `state` を「管理者かどうかの識別ビット」として再利用しており、ランダム値 + サーバー側の検証ストアが無い。攻撃者が被害者をだまして任意の Google 認可 URL へ誘導した上で `?state=admin&code=…` を仕掛けるなど **login CSRF** が成立しうる。OIDC の本来の意図と異なる用法。
- **推奨修正**:
  1. ランダム 128bit nonce を `state` に焼き、Cookie (HttpOnly) に保存。callback で照合
  2. 「admin かどうか」は別 query param (`mode=admin`) または別エンドポイント (`/auth/admin/google/callback`) に分離
- **参考**: [OWASP CSRF Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

#### H-04: OAuth callback で JWT を URL クエリで返す (履歴・referer 漏えい)
- **CWE**: CWE-598 (Information Exposure Through Query Strings) / **CVSS**: 7.1
- **該当**: `backend/src/routes/auth.ts:151,171`, `frontend/src/app/auth/callback/page.tsx:11-21`
- **詳細**: `res.redirect(.../auth/callback?token=<jwt>)` で 302 redirect。token はブラウザ履歴・access ログ・拡張機能・Window.opener referer に残存しうる。`router.replace` で履歴上は上書きされるが、上書き前に第三者スクリプトが referrer を読む隙がある (Analytics などを今後入れた瞬間にリスク化)。
- **推奨修正**:
  1. callback でフロントへ POST (隠し form auto-submit) または HttpOnly Cookie で渡す
  2. callback ページの `<head>` に `<meta name="referrer" content="no-referrer">` を **読み込み前に** 設置
  3. 完了後に `history.replaceState(null, '', '/')` を即時実行 (現状は `router.replace` のみ)

#### H-05: `express-rate-limit` の `trust proxy` 未設定 (rate limit 全部バイパス)
- **CWE**: CWE-770 / **CVSS**: 7.5
- **該当**: `backend/src/app.ts:21-54` (`app.set('trust proxy', ...)` が無い)
- **詳細**: 本番は nginx → backend なので、`req.ip` は **nginx の内部 IP** に固定される。`/contact` の 5/h 制限、`/stripe/sync` の 3/min 制限がすべて「全ユーザー合算で 5/h」になり実質ザル。逆に攻撃者 1 人が制限を使い切って正規ユーザーを締め出す DoS も可能。
- **推奨修正**:
  ```ts
  app.set('trust proxy', 1); // nginx 1 段
  ```
  + `keyGenerator: (req) => req.ip` (デフォルト) を維持。`X-Forwarded-For` 信頼は nginx で `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` が前提。
- **参考**: [express-rate-limit Troubleshooting Proxy Issues](https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues)

#### H-06: 依存パッケージ既知 CVE — `multer < 2.1.1` (DoS, High×3)
- **CWE**: CWE-459 / CWE-674 / CWE-772 / **CVSS**: High
- **該当**: `backend/package.json` (`"multer": "^2.0.2"`)
- **GHSA**: `GHSA-xf7r-hgr6-v32p`, `GHSA-v52c-386h-88mc`, `GHSA-5528-5vmv-3xc2`
- **悪用**: `/admin/upload/image` への悪意のあるマルチパートで OOM / 無限ループ。endpoint は ADMIN 限定だが管理者トークン窃取と組み合わせ可能。
- **推奨修正**: `npm i multer@^2.1.1`

#### H-07: 依存パッケージ既知 CVE — `nodemailer < 8.0.4` (SMTP CRLF Injection ほか 4 件)
- **CWE**: CWE-93 / **CVSS**: 7.5 (DoS), 4.9 (CRLF)
- **該当**: `backend/package.json` (`"nodemailer": "^6.9.13"`)
- **GHSA**: `GHSA-rcmh-qjqh-p98v` (DoS 7.5), `GHSA-vvjj-xcjg-gr5g` (CRLF/EHLO), `GHSA-mm7p-fcc7-pg87` (誤送信), `GHSA-c7w3-x93f-qmm8`
- **推奨修正**: `npm i nodemailer@^8.0.6` (※ メジャー更新。Resend SMTP 接続は API 互換のはずだが要動作確認)

#### H-08: 依存パッケージ既知 CVE — `fast-xml-parser < 5.7.0` (XXE / 数値エンティティ展開)
- **CWE**: CWE-776, CWE-1284, CWE-91 / **CVSS**: 7.5
- **該当**: `@aws-sdk/client-s3` 経由の transitive。直接 XML パースには使われていないため悪用パスは限定的だが Lint/Audit 上は High。
- **推奨修正**: `npm audit fix` または `@aws-sdk/client-s3` を最新へ

#### H-09: 依存パッケージ既知 CVE — `path-to-regexp < 0.1.13` (ReDoS)
- **CWE**: CWE-1333 / **CVSS**: 7.5 / **GHSA**: `GHSA-37ch-88jc-xwx2`
- **悪用**: 任意のリクエスト URI で正規表現バックトラック誘発 → backend プロセスを CPU 100% に追い込む DoS
- **推奨修正**: `npm audit fix`

#### H-10: 依存パッケージ既知 CVE — Next.js DoS (RSC) `< 15.5.15`
- 同 H-01 のついで。`npm audit` の direct 表示。

#### H-11: `.env.example` に本番運用の `ADMIN_EMAILS` が漏えいしている
- **CWE**: CWE-200 (Information Exposure) / **CVSS**: 6.5
- **該当**: `.env.example:29` — `ADMIN_EMAILS=etoilepiano.concert@gmail.com,masashienokidahp@gmail.com,koheisato0420@gmail.com`
- **詳細**: 同ファイル 42 行目には `your-admin@gmail.com` のサンプルもあり **2 重定義**。29 行目はテンプレートでなく実値で、リポジトリ閲覧者全員に 3 つの管理者 Gmail が露出している。GitHub のリポジトリが public/internal の場合、標的型フィッシングや Google アカウント乗っ取り (パスワードスプレー、SIM スワップ) の足がかりとなる。
- **推奨修正**:
  1. `.env.example` 29 行目を削除し、42 行目のサンプル形式 (`your-admin@gmail.com`) のみ残す
  2. **既に commit 済み**なので git history からの除去 (`git filter-repo` or BFG) を検討。実値が漏れた事実に基づき、当該 3 アカウントの Google パスワードを変更し、2FA を物理キー化することを強く推奨

#### H-12: 本番コンテナが root で実行される
- **CWE**: CWE-250 (Execution with Unnecessary Privileges)
- **該当**: `backend/Dockerfile.prod` (USER 指示なし — デフォルト root)、`frontend/Dockerfile.prod` 同様要確認
- **詳細**: 任意の RCE が起きた場合、コンテナ内 root として `/app` 配下を書き換え可。Docker のユーザー名前空間を使っていなければホスト UID 0 と同等。
- **推奨修正**: マルチステージ末尾に `RUN addgroup -S app && adduser -S -G app app` + `USER app` + `chown -R app:app /app`

#### H-13: CSP / Security Headers が事実上未設定
- **CWE**: CWE-693 (Protection Mechanism Failure) / **CVSS**: 6.1
- **該当**: `backend/src/app.ts:21` (`helmet()` デフォルトのみ。Next.js のレスポンスは Express 経由ではないので CSP は当たらない)、`frontend/next.config.ts`, `admin-console/next.config.ts` (どちらも `headers()` 未定義)
- **詳細**: Next 側に CSP / HSTS / Permissions-Policy / Referrer-Policy / X-Content-Type-Options が乗らず、JS インジェクション後の被害を縮小する **第二防御線が無い**。`localStorage` トークン (C-01) と組み合わさり致命的。
- **推奨修正**: `next.config.ts` に以下のような `headers()` を追加:
  ```ts
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' http://localhost:4000 https://api.example.com; frame-ancestors 'none';" },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'X-Frame-Options', value: 'DENY' },
      ],
    }];
  }
  ```
  CSP は Stripe 等の連携先に応じて段階的に厳格化する。

---

### 3.3 Medium

#### M-01: 入力検証スキーマが無い (zod が deps にあるが未使用)
- **該当**: `backend/src/routes/contact.ts:14-27`, `auth.ts`, `admin.ts`, `blog.ts` 全般
- **詳細**: Contact ルートは `name/email/subject/message` の `truthy` チェックと簡易メール正規表現のみ。型は `req.body.name` が string であることすら保証されない (e.g., `"name": ["a","b"]` が来うる)。Prisma 経由なら SQLi はないが、配列・オブジェクト混入で予期せぬ DB エラー or バリデーション迂回が起こる。
- **推奨修正**: `zod` を全ルートで使用し `BodyParser → safeParse` を統一。例:
  ```ts
  const ContactInput = z.object({ name: z.string().min(1).max(100), email: z.string().email().max(254), ... });
  ```

#### M-02: JWT 30 日固定、失効/ブラックリスト無し
- **該当**: `backend/src/routes/auth.ts:149,169` (`expiresIn: '30d'`)
- **詳細**: 既存 `Session` モデルが宣言済 (`prisma/schema.prisma:55-67`) だが auth フローで使われていない。トークン窃取時に強制ログアウト不可。
- **推奨修正**: アクセストークン 15 分 + リフレッシュトークン 30 日 (Session テーブルに保存、ログアウト時に DELETE) のスタンダード分離

#### M-03: ADMIN_EMAILS 変更時のロール降格は callback 経由のみ
- **該当**: `backend/src/routes/auth.ts:121-128, 156-164`
- **詳細**: ADMIN_EMAILS から外したユーザーが既に発行済 JWT を保持していると、`optionalAuth` が DB role を再取得するため事実上は無効化される (well-designed)。**ただし** ロール降格は当該ユーザーが再ログインしないと走らない。実際の降格は管理画面または手動 SQL で行う運用前提が必要。
- **推奨修正**: ADMIN_EMAILS 変更を契機に DB の Role を一括同期するスクリプト (CLI / cron) を整備

#### M-04: 管理者入力 URL の scheme 検証なし (`ticket_url`, `image_url`)
- **該当**: `frontend/src/app/concerts/[id]/page.tsx:84,164,182`
- **詳細**: 管理者が `javascript:` や `data:text/html,...` を入れた場合、`<a href>` 経由のクリック時に JS 実行 (`<img src>` は実行されない)。XSS 経路として確実だが管理者の意図的行為が前提なので Medium。
- **推奨修正**: クライアント側で `URL` constructor + `https:`/`http:`/`mailto:` のみ許可するヘルパーを共通化

#### M-05: 既存 cron / sync が PII を `console.log`
- **該当**: `backend/src/routes/stripe.ts:408,427` (`console.log(... ${sub.user.email} ...)`)
- **詳細**: VPS 上の Docker logs に PII が永続。GDPR / 個人情報保護法上、ログアウェアな設計が望ましい。
- **推奨修正**: `pino` 等の構造化ロガーで `email` をハッシュ化 or マスク (`****@example.com`)

#### M-06: `/auth/me` が呼び出しごとに Stripe API を叩く
- **該当**: `backend/src/routes/auth.ts:178-187`
- **詳細**: フロントは Header マウント時、ページ遷移時、ログイン直後など複数回 `/auth/me` を呼ぶ可能性。Stripe へのレート制限 (read 100/s) に引っかかる前に **Stripe API キーの無駄消費** + ユーザー体感遅延が増える。攻撃者がループで叩くと Stripe レート枯渇 → DoS。
- **推奨修正**: `currentPeriodEnd > now() + 1h` ならスキップ、または明示的な手動 sync (`/stripe/sync`) のみで OK

#### M-07: `DELETE /auth/account` に確認ステップ無し
- **該当**: `backend/src/routes/auth.ts:222-247`
- **詳細**: JWT があれば 1 リクエストで全データ削除 (Stripe サブスクキャンセル + ユーザー削除)。CSRF (Cookie 認証ではない) は防げているが、トークン窃取時の被害が「アカウント丸ごと喪失」に拡大。
- **推奨修正**: `?confirm=<email>` パラメータ必須 + メール確認 OTP

#### M-08: `nodemailer` 件名/本文に CRLF が入りうる
- **該当**: `backend/src/utils/email.ts:60-74` (`subject: '[お問い合わせ] ${contact.subject}'`)
- **詳細**: `contact.subject` がユーザー入力。`\r\nBcc: attacker@evil` を含む subject を送るとヘッダ注入。nodemailer は最近のバージョンで対策済だが、`< 8.0.4` (= 現行 6.9.13) は未対策の可能性が残る (cf. H-07)。
- **推奨修正**: H-07 のアップデート + zod で `\r\n` を弾く (`z.string().regex(/^[^\r\n]+$/)`)

#### M-09: `brace-expansion` ReDoS / `postcss < 8.5.10` XSS など (frontend)
- **詳細**: 開発時のみ影響だが CI 上の長時間ハングや、ビルド時 CSS への XSS 混入の理論的可能性。
- **推奨修正**: `npm audit fix`

#### M-10: MinIO bucket が anonymous read 公開
- **該当**: `docker-compose.yml:49` (`mc anonymous set download local/${MINIO_BUCKET}`)
- **詳細**: ブログ画像は公開で問題ないが、誤って機微画像 (会員証等) をアップロードした場合に URL 推測リスク。現状画像は `Date.now()-Math.random().toString(36)` で生成され URL を推測しにくいので Medium。
- **推奨修正**: 用途別バケット分離 (public-blog, private-members)、private は presigned URL に切替

#### M-11: 公開フォーム (Contact) に CSRF トークン無し
- **該当**: `backend/src/routes/contact.ts`, CORS は `credentials: true` だが Cookie 不使用
- **詳細**: 認証不要なので CSRF の本来定義からは外れるが、第三者サイトの form 経由で (CORS は form submit を防がない) 被害者ブラウザから連続送信 → 5/h 制限に達したら正規ユーザー締め出し DoS。
- **推奨修正**: 簡易 hCaptcha / reCAPTCHA、または `Origin` ヘッダの allowlist チェック

#### M-12: 不要な `Session` モデル (dead code)
- **該当**: `backend/prisma/schema.prisma:55-67`
- **推奨修正**: M-02 の対応で活用、または削除 (migration を作って drop)

---

### 3.4 Low

| ID | 概要 | 該当 | 推奨 |
|---|---|---|---|
| L-01 | 空 catch で例外揉み消し → 監視に届かない | `backend/src/routes/*.ts` 全般 (`} catch { res.status(500)... }`) | `catch (err)` で `console.error(err)` をログ化、Sentry 等への送出 |
| L-02 | `Session` モデルが Prisma に残ったまま未使用 | `prisma/schema.prisma:55-67` | M-12 と同 |
| L-03 | `JWT_SECRET` の長さ・エントロピー検証なし (`!` で強制 unwrap) | `backend/src/middleware/auth.ts:28` | 起動時に `Buffer.byteLength(secret) < 32` なら fail-fast |
| L-04 | `/health` がエンドポイント存在を漏らす (Backend 種別の指紋) | `backend/src/app.ts:69-71` | OK だが prod は `X-Powered-By` を `helmet` で消すのも標準 |
| L-05 | nginx の `Server` ヘッダや HTTP/2 設定不明 | `nginx/nginx.conf` (本レビュー対象外) | 別途確認 |

---

### 3.5 Info

- I-01: zod は既にインストール済 (`backend/package.json:37`)。M-01 の修正で消費。
- I-02: 構造化ロガー (`pino` / `winston`) を導入し PII 自動マスク
- I-03: `passport-google-oauth20` は PKCE をネイティブには持たない。OIDC 移行 (`openid-client`) で PKCE + nonce を強制可能

---

## 4. 最新攻撃手法レビュー (2025〜2026 主要トピックの該当性)

| トピック | 公開時期 | 本プロジェクト該当 | 状況 |
|---|---|---|---|
| **CVE-2025-29927 Next.js middleware bypass** | 2025-03 | 部分該当 (middleware 未使用だが next < 15.2.3 動作) | H-01 で更新推奨 |
| **CVE-2025-66478 Next.js (12月 advisory)** | 2025-12 | 該当 | H-01 と同。最新 15.5.15+ へ |
| **CVE-2026-41248 Next.js** | 2026-01 | 確認要 | 同上 |
| **React Server Components RCE (2025-12)** | 2025-12 | 部分該当 (RSC 利用箇所 `app/` 主体) | next を更新で吸収 |
| **JWT alg confusion (HS256 ↔ RS256)** | — | 不該当 (HS256 のみ、サーバー固定検証) | OK だが将来 RS256 移行時は注意 |
| **JWT in localStorage** | 古典 | 該当 (C-01) | 最重要 |
| **Stripe webhook replay** | — | 該当 (H-02) | event.id idempotency 必須 |
| **express-rate-limit ERR_ERL_UNEXPECTED_X_FORWARDED_FOR** | 2025 | 該当 (H-05) | trust proxy 設定必須 |
| **react-markdown XSS via `javascript:` href** | 古典 (CVE-2025-24981 Nuxt MDC) | 不該当 (react-markdown v10 デフォルトで `javascript:` を `javascript:void(0)` に変換) | OK |
| **prototype pollution (lodash 系)** | — | 部分該当 (`flatted`, `js-yaml` の transitive) | npm audit fix |
| **Prisma raw query SQLi** | — | 不該当 (raw query 不使用) | OK |
| **OWASP API Security Top 10 (2023)** | — | API1 BOLA は requireRole で対応、API3 認可破り、API8 セキュリティ設定不備 (H-13) などが残課題 | レビュー継続 |

---

## 5. 依存パッケージ脆弱性サマリ (`npm audit`)

### backend (`npm audit`)
| パッケージ | 現行 | 修正バージョン | 重大度 | 種別 |
|---|---|---|---|---|
| multer | ^2.0.2 | 2.1.1+ | High×3 | DoS |
| nodemailer | ^6.9.13 | 8.0.6+ | High + Mod×3 | CRLF / DoS / 誤送信 |
| fast-xml-parser (transitive) | <5.7.0 | 5.7.0+ | High | XXE/DoS |
| path-to-regexp (transitive) | <0.1.13 | 0.1.13+ | High | ReDoS |
| brace-expansion (transitive) | <1.1.13 | 1.1.13+ | Mod | DoS |
| picomatch (transitive) | — | — | High | (詳細割愛) |

### frontend / admin-console (`npm audit`)
| パッケージ | 現行 | 修正 | 重大度 |
|---|---|---|---|
| next (frontend) | ^15.0.0 | 15.5.15+ | High (RSC DoS) + Mod×2 |
| next (admin-console) | ^15.1.6 | 同上 | 同上 |
| postcss (transitive) | <8.5.10 | 8.5.10+ | Mod (XSS) |
| minimatch | <5.1.8 / <10.2.3 | 最新 | High (ReDoS×2) |
| flatted | <=3.4.1 | 3.4.0+ | High (DoS) + プロトタイプ汚染 |
| js-yaml | <4.1.1 | 4.1.1+ | Mod (プロトタイプ汚染) |

合計: backend 7 件 / frontend 6 件 / admin-console 6 件。**`npm audit fix` で大半が自動修正可能**。`nodemailer` のみメジャー更新が伴うため動作確認必須。

---

## 6. クイックウィン (1〜2 営業日で実施可能)

優先度順:

1. **`.env.example` の実 ADMIN_EMAILS を削除** (H-11)。git history からも除去。3 つの Google アカウントのパスワード変更 + 物理 2FA キー登録
2. **`npm audit fix`** を 3 サブプロジェクトで実行 → frontend/admin-console の next を 15.5.x へ、backend の multer/path-to-regexp/fast-xml-parser を更新 (H-01, H-06, H-08, H-09, H-10)
3. **`nodemailer` を 8.0.6+ にメジャー更新** + Resend SMTP の動作確認 (H-07, M-08)
4. **`backend/src/app.ts` に `app.set('trust proxy', 1)`** (H-05)
5. **Stripe webhook idempotency 追加** — `StripeEvent` テーブル + `INSERT ON CONFLICT DO NOTHING` (H-02)
6. **`Dockerfile.prod` に non-root USER を導入** (H-12)
7. **Next.js の `headers()` で最低限の Security Headers** (HSTS, Referrer-Policy, X-Frame-Options) 追加 (H-13、CSP は段階導入)

---

## 7. 中長期改善項目

| 項目 | 期待効果 | 概算工数 |
|---|---|---|
| JWT を Cookie + メモリ方式に移行 (Session テーブル活用) | C-01 / M-02 同時解消 | 2-3 日 |
| Zod スキーマで全ルートを保護 | M-01 / M-08 解消 | 1-2 日 |
| 構造化ログ (pino) + PII マスク | M-05, L-01 | 1 日 |
| OAuth state を nonce 化、PKCE 検討 (openid-client へ移行) | H-03 解消 | 2-3 日 |
| 厳格 CSP の段階導入 | XSS 経路縮小、C-01 緩和 | 2-3 日 (試行錯誤含む) |
| ADMIN_EMAILS 変更時の DB 一括同期スクリプト | M-03 解消 | 0.5 日 |
| MinIO の用途別バケット分離 + presigned URL | 将来 private コンテンツ用 | 1-2 日 |
| nginx 側で WAF (mod_security 等) 検討 | 全方位の防御強化 | 2-5 日 |

---

## 8. 参考リンク

### 公式 Advisory / CVE
- [Next.js Security Update: December 11, 2025](https://nextjs.org/blog/security-update-2025-12-11)
- [Security Advisory: CVE-2025-66478 (Next.js)](https://nextjs.org/blog/CVE-2025-66478)
- [Vercel GHSA-f82v-jwr5-mffw — Authorization Bypass in Next.js Middleware](https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw)
- [CVE-2025-29927 Datadog Security Labs 解説](https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/)
- [Critical Security Vulnerability in React Server Components (React Blog)](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [express-rate-limit Troubleshooting Proxy Issues](https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues)
- [Stripe Webhooks 公式ドキュメント](https://docs.stripe.com/webhooks)
- [Hooklistener: Stripe Webhooks Implementation Guide 2026](https://www.hooklistener.com/learn/stripe-webhooks-implementation)

### OWASP / ベストプラクティス
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Descope: Developer's Guide to JWT Storage](https://www.descope.com/blog/post/developer-guide-jwt-storage)
- [Strapi: React Markdown Complete Guide 2025 (Security)](https://strapi.io/blog/react-markdown-complete-guide-security-styling)
- [Stigg: Best practices for Stripe webhooks](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks)

### 検出された transitive CVE (一部)
- [GHSA-fj3w-jwp8-x2g3 — fast-xml-parser stack overflow](https://github.com/advisories/GHSA-fj3w-jwp8-x2g3)
- [GHSA-8gc5-j5rx-235r — fast-xml-parser numeric entity expansion](https://github.com/advisories/GHSA-8gc5-j5rx-235r)
- [GHSA-37ch-88jc-xwx2 — path-to-regexp ReDoS](https://github.com/advisories/GHSA-37ch-88jc-xwx2)
- [GHSA-rcmh-qjqh-p98v — nodemailer addressparser DoS](https://github.com/advisories/GHSA-rcmh-qjqh-p98v)
- [GHSA-vvjj-xcjg-gr5g — nodemailer SMTP CRLF (EHLO)](https://github.com/advisories/GHSA-vvjj-xcjg-gr5g)
- [GHSA-q4gf-8mx6-v5v3 — Next.js DoS via Server Components](https://github.com/advisories/GHSA-q4gf-8mx6-v5v3)

---

## 付録 A. テスト現状 (本レビュー時点)

- `backend && npm test` 実行結果: 既存テストファイル 20 中 9 通過 / 11 失敗。
  - 11 のうち 10 件は `dist/__tests__/...` (古い `tsc` ビルド成果物) を vitest が拾っているだけ。`tsconfig.json` の `exclude` に `**/__tests__/**` を加えれば解消する別件。
  - 残り 1 ファイル内の 2 件は `src/__tests__/routes/stripe.test.ts` の webhook テスト (`prisma.$transaction` mock 未設定 + `stripe.subscriptions.list` mock 漏れ) による単純な mock 整備不足。
- 本レビューはコード変更を伴わないため、テスト結果は調査前後で同一 (退行なし)。

## 付録 B. 確認した npm audit raw 出力 (要旨のみ)
- backend: `info: 0, low: 0, moderate: 7, high: 9, critical: 0`
- frontend: `moderate: 3, high: 4` 程度
- admin-console: `moderate: 3, high: 3`
