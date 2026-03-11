#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# deploy-setup.sh
# XServer VPS 初期セットアップ & デプロイ & Let's Encrypt 設定
# sshpass を使ってリモートコマンドを実行する対話型スクリプト
# ============================================================

SECRETS_FILE="$(cd "$(dirname "$0")" && pwd)/.deploy-secrets"
REPO="kouheisatou/masashienokida_hp"
DEPLOY_DIR="masashienokida_hp"

# ---------- 色付きログ ----------
info()  { printf '\033[1;34m[INFO]\033[0m  %s\n' "$*"; }
ok()    { printf '\033[1;32m[OK]\033[0m    %s\n' "$*"; }
warn()  { printf '\033[1;33m[WARN]\033[0m  %s\n' "$*"; }
err()   { printf '\033[1;31m[ERROR]\033[0m %s\n' "$*"; }

# ---------- 依存チェック ----------
check_deps() {
  local missing=()
  for cmd in sshpass ssh gh; do
    if ! command -v "$cmd" &>/dev/null; then
      missing+=("$cmd")
    fi
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    err "以下のコマンドがインストールされていません: ${missing[*]}"
    echo "  brew install ${missing[*]}  # macOS"
    exit 1
  fi
}

# ---------- シークレット読み込み / 入力 ----------
load_or_ask_secrets() {
  if [[ -f "$SECRETS_FILE" ]]; then
    info "シークレットファイルを読み込み中: $SECRETS_FILE"
    # shellcheck source=/dev/null
    source "$SECRETS_FILE"
    echo "  ドメイン : $VPS_HOST"
    echo "  ユーザー : $VPS_USER"
    echo "  パスワード: ********"
    read -rp "この設定で続行しますか? [Y/n] " confirm
    if [[ "$confirm" == "n" || "$confirm" == "N" ]]; then
      ask_secrets
    fi
  else
    ask_secrets
  fi
}

ask_secrets() {
  echo ""
  info "VPS 接続情報を入力してください"
  read -rp "ドメイン or IPアドレス (例: masashi-enokida-hp.xvps.jp): " VPS_HOST
  read -rp "SSHユーザー名 (例: root): " VPS_USER
  read -rsp "SSHパスワード: " VPS_PASS
  echo ""
  read -rp "SSHポート [22]: " VPS_PORT
  VPS_PORT="${VPS_PORT:-22}"

  cat > "$SECRETS_FILE" <<EOF
VPS_HOST="${VPS_HOST}"
VPS_USER="${VPS_USER}"
VPS_PASS="${VPS_PASS}"
VPS_PORT="${VPS_PORT}"
EOF
  chmod 600 "$SECRETS_FILE"
  ok "シークレットを $SECRETS_FILE に保存しました"
}

# ---------- リモートコマンド実行ヘルパー ----------
run_remote() {
  sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -p "${VPS_PORT:-22}" "${VPS_USER}@${VPS_HOST}" "$@"
}

run_remote_tty() {
  sshpass -p "$VPS_PASS" ssh -tt -o StrictHostKeyChecking=no -p "${VPS_PORT:-22}" "${VPS_USER}@${VPS_HOST}" "$@"
}

# ---------- 接続テスト ----------
test_connection() {
  info "VPS への接続をテスト中..."
  if run_remote "echo 'Connection OK'"; then
    ok "接続成功"
  else
    err "接続失敗。ドメイン/ユーザー名/パスワードを確認してください"
    rm -f "$SECRETS_FILE"
    exit 1
  fi
}

# ---------- Step 1: VPS 基盤セットアップ ----------
setup_vps_base() {
  info "=== Step 1: VPS 基盤セットアップ (Docker, Git, etc.) ==="
  run_remote bash <<'REMOTE_SCRIPT'
set -euo pipefail

echo ">>> パッケージ更新..."
apt-get update -y && apt-get upgrade -y

echo ">>> 必要パッケージのインストール..."
apt-get install -y \
  ca-certificates curl gnupg lsb-release \
  git jq unzip wget

# Docker がまだなければインストール
if ! command -v docker &>/dev/null; then
  echo ">>> Docker をインストール..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null || true
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  echo ">>> Docker インストール完了"
else
  echo ">>> Docker は既にインストール済み"
fi

docker --version
docker compose version

# certbot 用ディレクトリ
mkdir -p /var/www/certbot

echo ">>> 基盤セットアップ完了"
REMOTE_SCRIPT
  ok "VPS 基盤セットアップ完了"
}

# ---------- Step 2: GitHub Actions Self-hosted Runner ----------
setup_runner() {
  info "=== Step 2: GitHub Actions Self-hosted Runner セットアップ ==="

  # GitHub から最新のrunnerを取得するためのトークンが必要
  info "GitHub Actions Runner の登録トークンを取得中..."
  RUNNER_TOKEN=$(gh api -X POST "repos/${REPO}/actions/runners/registration-token" -q '.token')

  if [[ -z "$RUNNER_TOKEN" ]]; then
    err "Runner トークンの取得に失敗しました。'gh auth login' を実行してください"
    exit 1
  fi
  ok "Runner トークン取得成功"

  # Runner のアーキテクチャを確認
  ARCH=$(run_remote "uname -m")
  case "$ARCH" in
    x86_64)  RUNNER_ARCH="x64" ;;
    aarch64) RUNNER_ARCH="arm64" ;;
    *)       err "未対応アーキテクチャ: $ARCH"; exit 1 ;;
  esac

  # 最新の runner バージョンを取得
  RUNNER_VERSION=$(gh api repos/actions/runner/releases/latest -q '.tag_name' | sed 's/^v//')
  RUNNER_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-${RUNNER_ARCH}-${RUNNER_VERSION}.tar.gz"

  info "Runner v${RUNNER_VERSION} (${RUNNER_ARCH}) をインストール中..."

  run_remote bash <<REMOTE_SCRIPT
set -euo pipefail

# runner 用ユーザーがなければ作成
if ! id -u github-runner &>/dev/null; then
  useradd -m -s /bin/bash github-runner
  usermod -aG docker github-runner
  echo ">>> github-runner ユーザー作成完了"
fi

# ダウンロード & 展開 (バイナリがなければ)
mkdir -p /home/github-runner/actions-runner
cd /home/github-runner/actions-runner
if [[ ! -f ./config.sh ]]; then
  curl -sL "${RUNNER_URL}" | tar xz
fi
chown -R github-runner:github-runner /home/github-runner/actions-runner

# リポジトリ clone
if [[ ! -d /home/github-runner/${DEPLOY_DIR} ]]; then
  cd /home/github-runner
  git clone https://github.com/${REPO}.git ${DEPLOY_DIR}
  chown -R github-runner:github-runner /home/github-runner/${DEPLOY_DIR}
fi

# 既存の systemd サービスを停止・削除してからクリーン再設定
cd /home/github-runner/actions-runner
SVC_NAME="actions.runner.kouheisatou-masashienokida_hp.xserver-vps"
if [[ -f "/etc/systemd/system/\${SVC_NAME}.service" ]]; then
  echo ">>> 既存の Runner サービスを停止・削除中..."
  systemctl stop "\${SVC_NAME}" || true
  systemctl disable "\${SVC_NAME}" || true
  rm -f "/etc/systemd/system/\${SVC_NAME}.service"
  systemctl daemon-reload
fi

# 既存の .runner 設定があれば削除して再設定
if [[ -f .runner ]]; then
  echo ">>> 既存の Runner 設定を削除中..."
  sudo -u github-runner ./config.sh remove --token "${RUNNER_TOKEN}" || true
fi

# Runner の設定 (非対話)
sudo -u github-runner ./config.sh \
  --url "https://github.com/${REPO}" \
  --token "${RUNNER_TOKEN}" \
  --name "xserver-vps" \
  --labels "self-hosted,linux,${RUNNER_ARCH}" \
  --work "_work" \
  --unattended \
  --replace

# systemd サービスとして登録 & 起動
./svc.sh install github-runner
./svc.sh start

echo ">>> GitHub Actions Runner セットアップ完了"
REMOTE_SCRIPT
  ok "Self-hosted Runner セットアップ完了"
}

# ---------- Step 3: デプロイ実行 (手動トリガー) ----------
run_deploy() {
  info "=== Step 3: デプロイ実行 (workflow_dispatch) ==="

  read -rp "deploy.yml を手動実行します。よろしいですか? [Y/n] " confirm
  if [[ "$confirm" == "n" || "$confirm" == "N" ]]; then
    warn "デプロイをスキップしました"
    return
  fi

  info "ワークフローを手動トリガー中..."
  gh workflow run deploy.yml --ref production

  # トリガー後に run が生成されるまで少し待つ
  sleep 5

  # 最新の workflow run を監視
  RUN_ID=$(gh run list --workflow=deploy.yml --limit=1 --json databaseId -q '.[0].databaseId')
  if [[ -n "$RUN_ID" ]]; then
    info "Workflow Run #${RUN_ID} を監視中..."
    gh run watch "$RUN_ID" --exit-status && ok "デプロイ成功!" || err "デプロイ失敗。'gh run view $RUN_ID --log' で確認してください"
  else
    warn "ワークフロー実行が見つかりません"
  fi
}

# ---------- Step 4: Let's Encrypt SSL 証明書 ----------
setup_ssl() {
  info "=== Step 4: Let's Encrypt SSL 証明書セットアップ ==="

  DOMAIN="${VPS_HOST}"
  read -rp "SSL証明書を取得するドメイン [${DOMAIN}]: " input_domain
  DOMAIN="${input_domain:-$DOMAIN}"

  read -rp "Let's Encrypt 通知用メールアドレス: " LE_EMAIL

  info "certbot で SSL 証明書を取得中 (ドメイン: ${DOMAIN})..."

  # まず nginx を HTTP のみで起動して ACME チャレンジに対応させる
  run_remote bash <<REMOTE_SCRIPT || true
set -uo pipefail

cd /home/github-runner/${DEPLOY_DIR}

# certbot インストール
if ! command -v certbot &>/dev/null; then
  apt-get install -y certbot
  echo ">>> certbot インストール完了"
fi

# 一旦 nginx を HTTP-only 設定で起動するため、仮設定を作成
# (SSL証明書がまだない場合のフォールバック)
if [[ ! -d /etc/letsencrypt/live/${DOMAIN} ]]; then
  echo ">>> SSL 証明書が存在しないため、HTTP モードで nginx を起動..."

  # nginx が動いていれば一旦止める
  docker compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true

  # certbot standalone で取得 (80番ポートを直接使用)
  certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "${LE_EMAIL}" \
    -d "${DOMAIN}" \
    --preferred-challenges http

  echo ">>> SSL 証明書の取得完了"
else
  echo ">>> SSL 証明書は既に存在します"

  # 更新を試みる
  certbot renew --dry-run && echo ">>> 証明書の更新チェック OK" || true
fi

# 自動更新の cron を設定
if ! crontab -l 2>/dev/null | grep -q certbot; then
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'cd /home/github-runner/${DEPLOY_DIR} && docker compose -f docker-compose.prod.yml restart nginx'") | crontab -
  echo ">>> certbot 自動更新 cron を設定しました"
fi

# nginx を再起動して SSL を有効化
docker compose -f docker-compose.prod.yml restart nginx 2>/dev/null || true

echo ">>> SSL セットアップ完了"
REMOTE_SCRIPT

  ok "Let's Encrypt SSL 証明書セットアップ完了"
  echo ""
  info "https://${DOMAIN} でアクセスできるか確認してください"
}

# ---------- Step 5: ヘルスチェック ----------
health_check() {
  info "=== ヘルスチェック ==="

  DOMAIN="${VPS_HOST}"
  echo ""
  info "HTTP チェック..."
  if curl -sf -o /dev/null -w "HTTP %{http_code} (redirect: %{redirect_url})" "http://${DOMAIN}"; then
    echo ""
    ok "HTTP レスポンスあり"
  else
    echo ""
    warn "HTTP 応答なし"
  fi

  echo ""
  info "HTTPS チェック..."
  if curl -sf -o /dev/null -w "HTTPS %{http_code}" "https://${DOMAIN}"; then
    echo ""
    ok "HTTPS レスポンスあり"
  else
    echo ""
    warn "HTTPS 応答なし (SSL 証明書がまだ設定されていない可能性があります)"
  fi

  echo ""
  info "ヘルスエンドポイント..."
  if curl -sf "https://${DOMAIN}/health" 2>/dev/null || curl -sf "http://${DOMAIN}/health" 2>/dev/null; then
    echo ""
    ok "アプリケーション正常稼働中"
  else
    echo ""
    warn "ヘルスチェック応答なし"
  fi
}

# ---------- メインメニュー ----------
main_menu() {
  echo ""
  echo "========================================"
  echo "  XServer VPS デプロイセットアップ"
  echo "  リポジトリ: ${REPO}"
  echo "========================================"
  echo ""
  echo "  1) フルセットアップ (Step 1〜4 すべて実行)"
  echo "  2) VPS 基盤セットアップのみ (Docker, Git)"
  echo "  3) GitHub Actions Runner セットアップのみ"
  echo "  4) デプロイ実行のみ (workflow_dispatch)"
  echo "  5) Let's Encrypt SSL セットアップのみ"
  echo "  6) ヘルスチェック"
  echo "  7) VPS にSSHログイン"
  echo "  0) 終了"
  echo ""
  read -rp "選択 [1]: " choice
  choice="${choice:-1}"

  case "$choice" in
    1)
      setup_vps_base
      setup_runner
      run_deploy
      setup_ssl
      health_check
      ;;
    2) setup_vps_base ;;
    3) setup_runner ;;
    4) run_deploy ;;
    5) setup_ssl ;;
    6) health_check ;;
    7)
      info "VPS にログインします (exit で戻る)"
      run_remote_tty
      ;;
    0)
      info "終了します"
      exit 0
      ;;
    *)
      err "無効な選択: $choice"
      ;;
  esac

  # メニューに戻る
  main_menu
}

# ---------- エントリポイント ----------
check_deps
load_or_ask_secrets
test_connection
main_menu
