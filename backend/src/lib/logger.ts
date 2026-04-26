/**
 * 構造化ロガー (M-05 対応)
 *
 * 目的:
 *   - email / userId / id 等の PII を平文で console.log に出力しないように
 *     mask() ヘルパーで短縮 / 部分匿名化する。
 *   - 本番では JSON 形式 1 行 per ログ、開発では人間可読のプレーン形式。
 *
 * 使い方:
 *   import { logger, mask } from '../lib/logger';
 *   logger.info('user.upgraded', { userId: mask.id(user.id), email: mask.email(user.email) });
 *
 *   ※ fields に直接 email / id を入れた場合は logger 側でも自動マスクが走るが、
 *     呼び出し側で明示的に mask.* を使うほうが意図が伝わりやすい。
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_RANK: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function envLevel(): Level {
  const raw = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
  return (['debug', 'info', 'warn', 'error'].includes(raw) ? raw : 'info') as Level;
}

function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

// ── PII マスキング ────────────────────────────────────────────────

/**
 * Email を `a***@example.com` の形式に短縮。
 * 不正な形式や undefined はそのまま返す（呼び出し側で気付けるように）。
 */
function maskEmail(value: unknown): string {
  if (typeof value !== 'string' || !value.includes('@')) return String(value);
  const [local, domain] = value.split('@');
  if (!local || !domain) return value;
  const head = local.slice(0, 1);
  return `${head}***@${domain}`;
}

/**
 * UUID / セッショントークン等を「先頭 4 文字 + ***」に短縮。
 */
function maskId(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  const s = String(value);
  if (s.length <= 4) return `${s}***`;
  return `${s.slice(0, 4)}***`;
}

export const mask = {
  email: maskEmail,
  id: maskId,
};

// ── マスキング自動適用 ─────────────────────────────────────────────

const PII_KEYS = new Set([
  'email',
  'userEmail',
  'mail',
  'to',
  'recipient',
]);
const ID_KEYS = new Set([
  'userId',
  'user_id',
  'id',
  'sessionId',
  'session_id',
  'subscriptionId',
  'subscription_id',
  'token',
  'jwt',
]);

function autoMaskFields(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === null || v === undefined) {
      out[k] = v;
    } else if (PII_KEYS.has(k) && typeof v === 'string') {
      out[k] = maskEmail(v);
    } else if (ID_KEYS.has(k) && (typeof v === 'string' || typeof v === 'number')) {
      out[k] = maskId(v);
    } else if (v instanceof Error) {
      out[k] = { message: v.message, name: v.name };
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ── 出力 ───────────────────────────────────────────────────────────

function emit(level: Level, msg: string, fields?: Record<string, unknown>) {
  if (LEVEL_RANK[level] < LEVEL_RANK[envLevel()]) return;

  const safe = fields ? autoMaskFields(fields) : undefined;
  const ts = new Date().toISOString();

  if (isProd()) {
    const line = JSON.stringify({ ts, level, msg, ...(safe ?? {}) });
    if (level === 'error' || level === 'warn') {
      // eslint-disable-next-line no-console
      console.error(line);
    } else {
      // eslint-disable-next-line no-console
      console.log(line);
    }
    return;
  }

  // dev: human-readable
  const tail = safe && Object.keys(safe).length > 0 ? ' ' + JSON.stringify(safe) : '';
  const line = `[${ts}] ${level.toUpperCase()} ${msg}${tail}`;
  if (level === 'error' || level === 'warn') {
    // eslint-disable-next-line no-console
    console.error(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  debug: (msg: string, fields?: Record<string, unknown>) => emit('debug', msg, fields),
  info: (msg: string, fields?: Record<string, unknown>) => emit('info', msg, fields),
  warn: (msg: string, fields?: Record<string, unknown>) => emit('warn', msg, fields),
  error: (msg: string, fields?: Record<string, unknown>) => emit('error', msg, fields),
};

export default logger;
