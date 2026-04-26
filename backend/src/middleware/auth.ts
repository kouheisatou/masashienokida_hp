import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  jti?: string;
}

declare global {
  namespace Express {
    interface User extends AuthPayload {}
  }
}

// Attaches req.user if a valid JWT is present and not revoked.
// 受け口の優先順: httpOnly Cookie > Authorization Bearer (移行期互換のみ)
// role は JWT に焼き込まれた値ではなく、DB の最新値を使う。
export const AUTH_COOKIE_NAME = 'auth_token';

function extractToken(req: Request): string | null {
  // 1) httpOnly cookie (推奨)
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) return cookieToken;

  // 2) Authorization Bearer (フォールバック: Stripe Webhook 等の例外用に残す)
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);

  return null;
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;

    // jti が含まれている場合は失効リストを確認
    if (payload.jti) {
      try {
        const revoked = await prisma.revokedToken.findUnique({
          where: { jti: payload.jti },
        });
        if (revoked) {
          // 失効済みトークン → req.user を立てない (= requireAuth で 401)
          next();
          return;
        }
      } catch {
        // DB lookup 失敗時は失効扱いせずトークン情報のみで進める (可用性優先)
      }
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { role: true },
      });
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: user?.role ?? payload.role,
        jti: payload.jti,
      };
    } catch {
      // DB 取得に失敗した場合は JWT の role をフォールバックとして使用
      req.user = payload;
    }
  } catch {
    // invalid token — req.user remains undefined
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
