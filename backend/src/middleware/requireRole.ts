import { Request, Response, NextFunction } from 'express';

const ROLE_RANK: Record<string, number> = {
  USER: 0,
  MEMBER_FREE: 1,
  MEMBER_GOLD: 2,
  ADMIN: 99,
};

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userRank = ROLE_RANK[user.role] ?? 0;
    const hasRole = roles.some((r) => userRank >= (ROLE_RANK[r] ?? 0));
    if (!hasRole) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
