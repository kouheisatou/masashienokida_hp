# Resend メール送信セットアップ

Resend の SMTP インターフェースを使って `info@masashi-enokida.com` からメールを送信するための設定手順。

---

## 1. Resend アカウント作成

1. https://resend.com にアクセス
2. 「Get Started」からアカウントを作成（GitHub or メールアドレス）
3. 無料プラン（月3,000通 / 日100通）で十分

## 2. ドメイン認証

Resend ダッシュボードでドメインを登録し、DNS レコードを追加する。

1. ダッシュボード → 「Domains」→「Add Domain」
2. `masashi-enokida.com` を入力
3. 表示される DNS レコード（3つ）をドメインの DNS 設定に追加する：

| 種類 | ホスト名 | 値 | 用途 |
|------|---------|-----|------|
| TXT | `_resend.masashi-enokida.com` | Resend が表示する値 | ドメイン所有確認 |
| CNAME | `resend._domainkey.masashi-enokida.com` | Resend が表示する値 | DKIM 署名 |
| TXT | `masashi-enokida.com` | `v=spf1 include:amazonses.com ~all` | SPF 認証 |

> DNS レコードの追加方法がわからない場合は、ドメインを購入したサービス（お名前.com、Xserver、Google Domains 等）の管理画面で設定する。

4. レコード追加後、Resend ダッシュボードで「Verify」をクリック
5. DNS 反映には最大48時間かかることがあるが、通常は数分〜数時間

## 3. API キー取得

1. ダッシュボード → 「API Keys」→「Create API Key」
2. Name: `masashi-enokida-hp`（任意）
3. Permission: 「Sending access」
4. Domain: `masashi-enokida.com`
5. 生成された `re_` で始まるキーをコピー（一度しか表示されない）

## 4. 環境変数の設定

プロジェクトルートの `.env` を以下のように設定：

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_ここにAPIキーを貼り付け
MAIL_FROM=info@masashi-enokida.com
```

- `SMTP_USER` は固定値 `resend`（変更しない）
- `SMTP_PASS` に Resend の API キーを設定
- `MAIL_FROM` は認証済みドメインのアドレスであれば自由に変更可能
  - 例: `info@masashi-enokida.com`, `noreply@masashi-enokida.com`

## 5. 動作確認

1. `docker-compose up --build` で起動
2. お問い合わせフォームからテスト送信
3. Resend ダッシュボード → 「Emails」で送信ログを確認
4. 受信側のメールボックスで到着を確認（迷惑メールフォルダも確認）

## DNS 設定の確認場所

ドメインの DNS を管理しているサービスを特定するには：

```bash
# ネームサーバーを確認
dig masashi-enokida.com NS +short
```

表示されたネームサーバーのドメインから管理サービスがわかる：
- `ns*.xserver.jp` → Xserver
- `ns*.onamae.ne.jp` → お名前.com
- `ns-cloud-*.googledomains.com` → Google Domains / Cloud DNS
- `*.awsdns-*` → AWS Route 53

## Resend の制限事項

| プラン | 月間送信数 | 日間送信数 | 料金 |
|--------|-----------|-----------|------|
| Free | 3,000通 | 100通 | $0 |
| Pro | 50,000通 | 制限なし | $20/月 |

無料プランの注意点：
- 日100通を超えるとその日は送信不可（翌日リセット）
- コンサート通知などの一斉送信で会員数が100人を超える場合は Pro プランが必要
