import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface User extends AuthPayload {}
  }
}

// Attaches req.user if a valid Bearer JWT is present. Does NOT reject.
// role は JWT に焼き込まれた値ではなく、DB の最新値を使う。
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { role: true },
      });
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: user?.role ?? payload.role,
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
