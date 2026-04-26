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

// Attaches req.user if a valid Bearer JWT is present and not revoked. Does NOT reject.
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const token = header.slice(7);
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;

      // jti が含まれている場合は失効リストを確認
      if (payload.jti) {
        const revoked = await prisma.revokedToken.findUnique({
          where: { jti: payload.jti },
        });
        if (revoked) {
          // 失効済みトークン → req.user を立てない (= requireAuth で 401)
          return next();
        }
      }

      req.user = payload;
    } catch {
      // ignore invalid token
    }
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
