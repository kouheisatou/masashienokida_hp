/**
 * Double-submit cookie 方式の CSRF トークン検証ミドルウェア。
 *
 * - 公開フォーム (例: `/contact`) に対する CSRF 攻撃を防ぐ。
 * - 認証済み API (Bearer / Cookie 認証) は対象外 (`req.user` があるものはスキップ)。
 *
 * 仕様:
 *   - `GET /csrf` で `csrf_token` cookie (httpOnly=false, SameSite=Lax) を発行し、
 *     同じ値を JSON `{ token }` として返す。
 *   - 保護対象 POST では Cookie 値とリクエストヘッダ `X-CSRF-Token`
 *     (または body.csrf_token) を一致比較する。
 *   - 比較は constant-time。
 */
import { Request, Response, NextFunction, Router } from 'express';
import crypto from 'crypto';

export const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_BYTES = 32;

function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

function setCsrfCookie(res: Response, token: string): void {
  // httpOnly=false: フロントエンドが Cookie を読み出してヘッダにコピーする必要があるため。
  // Cookie 自体は CSRF 攻撃で送信されるが、攻撃者は cross-site で Cookie を **読めない**
  // ため、ヘッダに同じ値をセットできない (double-submit cookie の核心)。
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24h
  });
}

/** GET /csrf — トークンを cookie + body で返す */
export const csrfTokenRouter = Router();
csrfTokenRouter.get('/csrf', (_req, res) => {
  const token = generateToken();
  setCsrfCookie(res, token);
  res.json({ token });
});

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * 保護対象 POST に適用するミドルウェア。
 * - 認証済みリクエスト (`req.user` あり) はスキップ。
 * - 匿名 POST のみ Cookie とヘッダの一致を要求する。
 * - テスト環境 (`NODE_ENV === 'test'`) ではバイパス。
 */
export function requireCsrfToken(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === 'test') {
    next();
    return;
  }

  if (req.user) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken =
    (req.headers[CSRF_HEADER_NAME] as string | undefined) ??
    (req.body && typeof req.body === 'object' ? (req.body as { csrf_token?: string }).csrf_token : undefined);

  if (!cookieToken || !headerToken || !safeEqual(cookieToken, headerToken)) {
    res.status(403).json({ error: 'CSRF token validation failed' });
    return;
  }

  next();
}
